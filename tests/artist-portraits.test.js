const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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

const SAVED_LOCALLY = [
  'Ilaiyaraaja', 'M. S. Viswanathan', 'Bombay Ravi', 'Sujatha', 'Vaali',
  'Gireesh Puthenchery', 'Yusufali Kechery', 'Sachithanandan Puzhankara',
  'S. P. Balasubrahmanyam', 'R. V. Udayakumar',
  'K. J. Yesudas', 'P. Jayachandran', 'Sadhana Sargam', 'Srinivas',
  'A. R. Rahman', 'Johnson', 'Vidyasagar',
  'Kaithapram Damodaran Namboothiri', 'Vairamuthu',
  'K. S. Chithra', 'S. Janaki', 'M. G. Sreekumar', 'G. Venugopal', 'Hariharan', 'Unni Menon'
];

test('manual portraits resolve to saved files without any network access', async () => {
  const lookup = createPortraitLookup({ storage: null, fetchImpl: async () => { throw new Error('offline'); } });
  for (const name of SAVED_LOCALLY) {
    assert.match(await lookup.getPortrait(name), /^assets\/artists\/[a-z0-9-]+\.(jpg|png|webp)$/, name);
  }
  assert.equal(await lookup.getPortrait('Nobody Listed Here'), null);
});

test('saved portraits exist in assets/artists and are credited in SOURCES.md', () => {
  assert.deepEqual(Object.keys(MANUAL_PORTRAITS).sort(), [...SAVED_LOCALLY].sort());
  const sources = fs.readFileSync(path.join(__dirname, '..', 'assets', 'artists', 'SOURCES.md'), 'utf8');
  for (const name of SAVED_LOCALLY) {
    const url = MANUAL_PORTRAITS[name];
    assert.ok(fs.existsSync(path.join(__dirname, '..', url)), name + ' is missing ' + url);
    assert.ok(sources.includes(path.basename(url)), path.basename(url) + ' is not listed in SOURCES.md');
  }
  const onDisk = fs.readdirSync(path.join(__dirname, '..', 'assets', 'artists')).filter(f => f !== 'SOURCES.md');
  assert.deepEqual(onDisk.sort(), SAVED_LOCALLY.map(name => path.basename(MANUAL_PORTRAITS[name])).sort(), 'unused files in assets/artists');
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

test('accepts saved portrait paths but rejects path traversal and other schemes', async () => {
  const lookup = harness({overrides: {
    'Saved': 'assets/artists/saved.jpg',
    'Traversal': 'assets/artists/../secret.jpg',
    'Elsewhere': 'assets/other/photo.jpg',
    'Script': 'javascript:alert(1)',
    'Plain http': 'http://example.com/a.jpg'
  }});
  assert.equal(await lookup.getPortrait('Saved'), 'assets/artists/saved.jpg');
  assert.equal(await lookup.getPortrait('Traversal'), null);
  assert.equal(await lookup.getPortrait('Elsewhere'), null);
  assert.equal(await lookup.getPortrait('Script'), null);
  assert.equal(await lookup.getPortrait('Plain http'), null);
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

test('ignores cache data written with an older version', async () => {
  const makeStorage = payload => {
    const values = new Map([[CACHE_KEY, JSON.stringify(payload)]]);
    return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  };
  const entry = version => ({version,savedAt:1000,url:'https://cached.example/photo.jpg'});
  const run = async payload => {
    let calls = 0;
    const lookup = harness({fetchImpl:async()=>{calls++;return {ok:true,json:async()=>({search:[]})};},storage:makeStorage(payload)});
    const url = await lookup.getPortrait('Versioned Artist');
    return {url,calls};
  };

  // Positive control: a current-version entry is served from cache without any fetch.
  assert.deepEqual(await run({version:5,entries:{'versioned artist':entry(5)}}), {url:'https://cached.example/photo.jpg',calls:0});
  // Stale outer cache version: the whole cache is discarded and the lookup refetches.
  assert.deepEqual(await run({version:0,entries:{'versioned artist':entry(5)}}), {url:null,calls:1});
  // Stale entry version inside a current cache: that entry is ignored and refetched.
  assert.deepEqual(await run({version:5,entries:{'versioned artist':entry(0)}}), {url:null,calls:1});
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
