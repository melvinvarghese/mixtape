const test = require('node:test');
const assert = require('node:assert/strict');
const { createPortraitLookup } = require('../assets/artist-portraits.js');

function harness({fetchImpl, storage, overrides = {}, now = () => 1000} = {}) {
  const values = new Map();
  const localStorage = storage || {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  return createPortraitLookup({fetchImpl: fetchImpl || (async () => { throw new Error('unexpected fetch'); }), storage: localStorage, overrides, now});
}

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
    return {ok:true,json:async()=>({entities:{Q1:{claims:{P18:[{mainsnak:{datavalue:{value:'Test.jpg'}}}]}}}})};
  };
  const lookup = harness({fetchImpl});
  assert.equal(await lookup.getPortrait('Test Artist'), 'https://commons.wikimedia.org/wiki/Special:FilePath/Test.jpg?width=480');
  assert.equal(await lookup.getPortrait(' test artist '), 'https://commons.wikimedia.org/wiki/Special:FilePath/Test.jpg?width=480');
  assert.equal(calls, 2);
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
