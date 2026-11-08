const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const inlineScript = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(match => match[1]).join("\\n");

test("inline application JavaScript parses", () => {
  assert.doesNotThrow(() => new Function(inlineScript));
});

test("catalogue is loaded from Blogger rather than a hardcoded song array", () => {
  assert.ok(inlineScript.includes("mixtapebymelvin.blogspot.com/feeds/posts/default?alt=json"));
  assert.ok(inlineScript.includes("function parseFeed(data)"));
  assert.ok(inlineScript.includes('querySelector(".mixtape-data")'));
  assert.ok(inlineScript.includes('get("data-audio")'));
  assert.ok(inlineScript.includes('get("data-music-director")'));
  assert.ok(inlineScript.includes('get("data-lyricist")'));
  assert.ok(!inlineScript.includes("const songs=["));
  assert.ok(inlineScript.includes("loadSongs();"));
});

test("Blogger JSONP fallback is available when cross-origin fetch is blocked", () => {
  assert.ok(inlineScript.includes("function loadFeedJsonp()"));
  assert.ok(inlineScript.includes("alt=json-in-script"));
  assert.ok(inlineScript.includes("&callback="));
});

test("artist browsing is available on desktop and mobile navigation", () => {
  assert.ok(html.includes('data-view="artists"'));
  assert.ok(inlineScript.includes("function artists()"));
  assert.ok(inlineScript.includes("data-artist-name="));
});

test("song detail view exposes an optional external lyrics link", () => {
  assert.ok(html.includes('id="song-detail"'));
  assert.ok(inlineScript.includes("function renderSongDetails(song)"));
  assert.ok(inlineScript.includes("safeExternalUrl(song.lyricsUrl)"));
  assert.ok(inlineScript.includes('target="_blank" rel="noopener noreferrer"'));
});

test("track rows retain details actions and safe text escaping", () => {
  assert.ok(inlineScript.includes("data-details="));
  assert.ok(inlineScript.includes("function escapeHtml(value)"));
});

test("player shows singer and music director together", () => {
  assert.ok(inlineScript.includes('song.artist+(song.composer?" · Music: "'));
});
