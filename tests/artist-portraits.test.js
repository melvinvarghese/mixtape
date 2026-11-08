const test = require('node:test');
const assert = require('node:assert/strict');
const { createPortraitLookup, MANUAL_PORTRAITS, CACHE_KEY } = require('../assets/artist-portraits.js');

function harness({fetchImpl, storage, overrides = {}, now = () => 1000} = {}) {
  const values = new Map();
  const localStorage = storage || {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  return createPortraitLookup({fetchImpl: fetchImpl || (async () => { throw new Error('unexpected fetch'); }), storage: localStorage, overrides, now});
}

test('verified manual portraits are available for the artists with Commons images', async () => {
  const lookup = createPortraitLookup({ storage: null });
  for (const name of [
    'K. J. Yesudas', 'P. Jayachandran', 'Sadhana Sargam', 'Srinivas',
    'A. R. Rahman', 'Johnson', 'Vidyasagar',
    'Kaithapram Damodaran Namboothiri', 'Vairamuthu'
  ]) {
    const url = await lookup.getPortrait(name);
    assert.match(url, /^https:\/\/commons\.wikimedia\.org\/w\/index\.php\?title=Special:Redirect\/file\//);
  }
  assert.equal(await lookup.getPortrait('Sachithanandan Puzhankara'), null);
});

test('manual portrait map contains only HTTPS Commons redirects', () => {
  assert.equal(Object.keys(MANUAL_PORTRAITS).length, 9);
  assert.ok(Object.values(MANUAL_PORTRAITS).every(url => url.startsWith('https://commons.wikimedia.org/')));
  assert.equal(CACHE_KEY, 'mixtape-artist-portraits-v5');
});

test('creates readable two-letter initials', () => {
  assert.equal(harness().getInitials('A. R. Rahman'), 'AR');
  assert.equal(harness().getInitials('Ilaiyaraaja'), 'IL');
});

test('manual portrait overrides take precedence without network access', async () => {
  const lookup = harness({overrides: {'A. R. Rahman': 'https://example.com/arr.jpg'}});
  assert.equal(await lookup.getPortrait('A. R. Rahman'), 'https://example.com/arr.jpg');
});

test('caches a successful portrait lookup', async () => {
  let calls = 0;
  const fetchImpl = async url => {
    calls++;
    if (String(url).includes('wbsearchentities')) return {ok:true,json:async()=>({search:[{id:'Q1',label:'Test Artist',description:'Indian singer'}]})};
    if (String(url).includes('wbgetentities')) return {ok:true,json:async()=>({entities:{Q1:{claims:{P18:[{mainsnak:{datavalue:{value:'Test.jpg'}}}]}}}})};
    return {ok:true,json:async()=>({query:{pages:{'1':{imageinfo:[{thumburl:'https://upload.wikimedia.org/thumb/Test.jpg'}]}}}})};
  };
  const lookup = harness({fetchImpl});
  assert.equal(await lookup.getPortrait('Test Artist'), 'https://upload.wikimedia.org/thumb/Test.jpg');
  assert.equal(await lookup.getPortrait(' test artist '), 'https://upload.wikimedia.org/thumb/Test.jpg');
  assert.equal(calls, 3);
});

test('does not guess when entity search returns ambiguous candidates', async () => {
  const lookup = harness({fetchImpl:async()=>({ok:true,json:async()=>({search:[{id:'Q1',label:'Alex Kumar'},{id:'Q2',label:'Alex Kumar'}]})})});
  assert.equal(await lookup.getPortrait('Alex Kumar'), null);
});

test('returns null for entities without an image claim', async () => {
  const lookup = harness({fetchImpl:async url => String(url).includes('wbsearchentities')
    ? {ok:true,json:async()=>({search:[{id:'Q1',label:'No Photo'}]})}
    : {ok:true,json:async()=>({entities:{Q1:{claims:{}}}})}});
  assert.equal(await lookup.getPortrait('No Photo'), null);
});

test('network and storage failures degrade to null without throwing', async () => {
  const lookup = harness({fetchImpl:async()=>{throw new Error('offline');},storage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){}}});
  assert.equal(await lookup.getPortrait('Offline Person'), null);
});

test('shares concurrent lookups for the same name', async () => {
  let calls = 0;
  const fetchImpl = async url => {
    calls++;
    await new Promise(resolve=>setTimeout(resolve,5));
    return String(url).includes('wbsearchentities')
      ? {ok:true,json:async()=>({search:[]})}
      : {ok:true,json:async()=>({entities:{}})};
  };
  const lookup = harness({fetchImpl});
  const [a,b] = await Promise.all([lookup.getPortrait('Unknown Person'),lookup.getPortrait(' unknown person ')]);
  assert.equal(a,null); assert.equal(b,null); assert.equal(calls,1);
});


test('caches misses briefly and retries after the negative cache expires', async () => {
  let clock = 1000, calls = 0;
  const fetchImpl = async () => { calls++; return {ok:true,json:async()=>({search:[]})}; };
  const values = new Map();
  const storage = {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const lookup = harness({fetchImpl,storage,now:()=>clock});
  assert.equal(await lookup.getPortrait('Missing Artist'), null);
  assert.equal(await lookup.getPortrait('Missing Artist'), null);
  assert.equal(calls, 1);
  clock += 15 * 24 * 60 * 60 * 1000;
  assert.equal(await lookup.getPortrait('Missing Artist'), null);
  assert.equal(calls, 2);
});

test('ignores a cache entry written with an older version', async () => {
  let calls = 0;
  const values = new Map([['mixtape-artist-portraits-v1', JSON.stringify({version:0,entries:{'versioned artist':{version:0,savedAt:1000,url:'https://old.example/photo.jpg'}}})]]);
  const storage = {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const lookup = harness({fetchImpl:async()=>{calls++;return {ok:true,json:async()=>({search:[]})};},storage});
  assert.equal(await lookup.getPortrait('Versioned Artist'), null);
  assert.equal(calls, 1);
});


test('handles a browser that throws when localStorage is accessed', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,get(){throw new Error('storage denied')}});
  try {
    const lookup = createPortraitLookup({fetchImpl:async()=>({ok:true,json:async()=>({search:[]})})});
    assert.equal(await lookup.getPortrait('Storage Denied'), null);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
