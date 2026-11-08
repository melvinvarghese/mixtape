const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join("\n");

test("inline application JavaScript parses", () => {
  assert.doesNotThrow(() => new Function(inlineScript));
});

test("first song contains verified credits and the M3DB lyrics URL", () => {
  assert.match(inlineScript, /artist:"K\. J\. Yesudas"/);
  assert.match(inlineScript, /composer:"Vidyasagar"/);
  assert.match(inlineScript, /lyricist:"Sachithanandan Puzhankara"/);
  assert.match(inlineScript, /film:"Pranayavarnangal"/);
  assert.match(inlineScript, /lyricsUrl:"https:\/\/m3db\.com\/lyric\/65316"/);
});

test("song detail view exposes an optional external lyrics link", () => {
  assert.match(html, /id="song-detail"/);
  assert.match(inlineScript, /function renderSongDetails\(song\)/);
  assert.match(inlineScript, /safeExternalUrl\(song\.lyricsUrl\)/);
  assert.match(inlineScript, /target="_blank" rel="noopener noreferrer"/);
});

test("track rows have a dedicated details action and safe text escaping", () => {
  assert.match(inlineScript, /data-details=/);
  assert.match(inlineScript, /function escapeHtml\(value\)/);
});

test("player shows singer and music director together", () => {
  assert.match(inlineScript, /song\.artist\+\(song\.composer\?" · Music: "/);
});
