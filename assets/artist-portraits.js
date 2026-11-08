(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MixtapeArtistPortraits = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const CACHE_KEY = 'mixtape-artist-portraits-v1';
  const CACHE_VERSION = 1;
  const POSITIVE_TTL = 180 * 24 * 60 * 60 * 1000;
  const NEGATIVE_TTL = 14 * 24 * 60 * 60 * 1000;
  // Add a verified direct image URL here when Wikidata cannot safely identify someone.
  const MANUAL_PORTRAITS = {};

  const normalize = name => String(name || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const validImageUrl = value => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  };

  function createPortraitLookup({ fetchImpl, storage, overrides = MANUAL_PORTRAITS, now = Date.now } = {}) {
    const fetcher = fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    let store = storage;
    if (storage === undefined) { try { store = globalThis.localStorage || null; } catch { store = null; } }
    const pending = new Map();

    function readCache() {
      try {
        const data = JSON.parse(store?.getItem(CACHE_KEY) || 'null');
        return data?.version === CACHE_VERSION && data.entries && typeof data.entries === 'object' ? data.entries : {};
      } catch { return {}; }
    }
    function writeCache(entries) {
      try { store?.setItem(CACHE_KEY, JSON.stringify({ version: CACHE_VERSION, entries })); } catch { /* Storage is optional. */ }
    }
    function getInitials(name) {
      const words = String(name || '').trim().split(/\s+/).filter(Boolean);
      if (!words.length) return '?';
      const letters = words.length === 1 ? words[0].replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2) : words.slice(0, 2).map(word => word.replace(/[^\p{L}\p{N}]/gu, '').charAt(0)).join('');
      return (letters || '?').toLocaleUpperCase();
    }
    async function request(url) {
      if (!fetcher) throw new Error('Fetch unavailable');
      const response = await fetcher(url, { headers: { Accept: 'application/json' } });
      if (!response?.ok) throw new Error('Portrait lookup request failed');
      return response.json();
    }
    async function resolve(name) {
      const searchUrl = new URL('https://www.wikidata.org/w/api.php');
      Object.entries({ action: 'wbsearchentities', search: name, language: 'en', uselang: 'en', type: 'item', limit: '10', format: 'json', origin: '*' }).forEach(([k,v]) => searchUrl.searchParams.set(k,v));
      const search = await request(searchUrl.href);
      const exact = (search.search || []).filter(item => normalize(item.label) === normalize(name));
      if (exact.length !== 1 || !/^Q\d+$/.test(exact[0].id || '')) return null;
      const entityUrl = new URL('https://www.wikidata.org/w/api.php');
      Object.entries({ action: 'wbgetentities', ids: exact[0].id, props: 'claims', format: 'json', origin: '*' }).forEach(([k,v]) => entityUrl.searchParams.set(k,v));
      const data = await request(entityUrl.href);
      const claims = data.entities?.[exact[0].id]?.claims || {};
      const file = claims.P18?.[0]?.mainsnak?.datavalue?.value;
      if (typeof file !== 'string' || !file.trim()) return null;
      return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file.trim()).replace(/%2F/g, '/') + '?width=480';
    }
    async function getPortrait(name) {
      const key = normalize(name);
      if (!key) return null;
      const override = Object.entries(overrides || {}).find(([label]) => normalize(label) === key)?.[1];
      if (override) return validImageUrl(override);
      if (pending.has(key)) return pending.get(key);
      const cache = readCache();
      const cached = cache[key];
      if (cached && cached.version === CACHE_VERSION && Number.isFinite(cached.savedAt)) {
        const ttl = cached.url ? POSITIVE_TTL : NEGATIVE_TTL;
        if (now() - cached.savedAt < ttl) return cached.url || null;
      }
      const task = (async () => {
        let url = null;
        try { url = await resolve(String(name).trim()); } catch { url = null; }
        const latest = readCache();
        latest[key] = { version: CACHE_VERSION, savedAt: now(), url: validImageUrl(url) };
        writeCache(latest);
        return latest[key].url;
      })();
      pending.set(key, task);
      try { return await task; } finally { pending.delete(key); }
    }
    function clearCache() { try { store?.removeItem(CACHE_KEY); } catch { /* Storage is optional. */ } }
    return { getPortrait, getInitials, clearCache };
  }
  return { createPortraitLookup, CACHE_KEY, CACHE_VERSION, MANUAL_PORTRAITS };
});
