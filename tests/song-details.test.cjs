const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const inlineScript = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(match => match[1]).join("\\n");

test("inline application JavaScript parses", () => {
  assert.doesNotThrow(() => new Function(inlineScript));
});

test("catalogue is loaded from the public Blogger JSON feed, not hardcoded", () => {
  assert.match(inlineScript, /mixtapebymelvin\\.blogspot\\.com\\/feeds\\/posts\\/default\\?alt=json/);
  assert.match(inlineScript, /function parseFeed\\(data\\)/);
  assert.match(inlineScript, /querySelector\\("\\.mixtape-data"\\)/);
  assert.match(inlineScript, /data-audio/);
  assert.match(inlineScript, /data-music-director/);
  assert.match(inlineScript, /data-lyricist/);
  assert.doesNotMatch(inlineScript, /const songs=\\[/);
  assert.match(inlineScript, /loadSongs\\(\\);/);
});

test("Blogger JSONP fallback is available when cross-origin fetch is blocked", () => {
  assert.match(inlineScript, /function loadFeedJsonp\\(\\)/);
  assert.match(inlineScript, /alt=json-in-script/);
  assert.match(inlineScript, /callback=/);
});

test("artist browsing is available on desktop and mobile navigation", () => {
  assert.match(html, /data-view="artists"/);
  assert.match(inlineScript, /function artists\\(\\)/);
  assert.match(inlineScript, /data-artist-name=/);
});

test("song detail view exposes an optional external lyrics link", () => {
  assert.match(html, /id="song-detail"/);
  assert.match(inlineScript, /function renderSongDetails\\(song\\)/);
  assert.match(inlineScript, /safeExternalUrl\\(song\\.lyricsUrl\\)/);
  assert.match(inlineScript, /target="_blank" rel="noopener noreferrer"/);
});

test("track rows retain details actions and safe text escaping", () => {
  assert.match(inlineScript, /data-details=/);
  assert.match(inlineScript, /function escapeHtml\\(value\\)/);
});

test("player shows singer and music director together", () => {
  assert.match(inlineScript, /song\\.artist\\+\\(song\\.composer\\?" · Music: "/);
});
