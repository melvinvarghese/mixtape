# Song Detail Pages and Clearer Credits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add navigable song detail views, readable singer/composer credits, and optional external lyrics links without interrupting audio playback.

**Architecture:** Preserve the current single-file static site. Extend the song metadata model, render track rows with an explicit details affordance, and add an in-page detail view driven by the selected song. Keep the audio element outside the view-swapping area so navigation does not recreate playback state.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in test runner for focused tests; no runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-08-song-detail-pages-design.md`

## Global Constraints
- Keep the current single-file HTML/CSS/JS implementation and responsive behavior.
- No backend, account system, paid service, new framework or build step.
- Keep the public-facing interface and metadata labels in English; song lyrics remain on the external site.
- Do not copy or embed lyrics.
- Lyrics links are optional per song.
- Do not invent credits for the five demo tracks whose credits have not been verified.

## Review Focus
- A song with no lyrics URL must not render a lyrics action.
- A title or artist containing apostrophes, ampersands, or angle brackets must render safely as text.
- Navigating to details while audio is playing must not reset or pause playback.
- Detail view and credit labels must remain usable on narrow mobile screens.
- Returning from details must preserve the user's previous library view/search context.

---

### Task 1: Add song metadata and safe song detail rendering

**Files:**
- Modify: `index.html`
- Create: `tests/song-details.test.cjs`

**Interfaces:**
- Song records may include `composer`, `lyricist`, `film`, and `lyricsUrl`; missing values are allowed.
- Add pure helper `escapeHtml(value)` for safe HTML text/attribute interpolation, or use DOM text nodes for all new user/source-provided metadata.
- Add `renderSongDetails(song)` to render a song's information and conditionally render its lyrics link.

- [ ] **Step 1: Write failing tests** using Node's built-in `node:test` and `assert`. Cover: first track's verified metadata; lyrics link present for the first track; lyrics link absent for a track with no `lyricsUrl`; HTML-sensitive metadata is rendered as text, not markup.
- [ ] **Step 2: Run tests and verify they fail** because the metadata fields and detail renderer do not yet exist.
- [ ] **Step 3: Add metadata fields** to the first song only: composer `Vidyasagar`, lyricist `Sachithanandan Puzhankara`, film `Pranayavarnangal`, lyrics URL `https://m3db.com/lyric/65316`. Retain existing singer, album and year.
- [ ] **Step 4: Implement the detail renderer** with artwork, title, prominent singer and music-director credits, plus available lyricist, album, film and year. Render a `View Lyrics` link only when a valid URL is present; open it in a new tab with `rel="noopener noreferrer"`.
- [ ] **Step 5: Run the focused tests** with `node --test tests/song-details.test.cjs`; expected: all pass.
- [ ] **Step 6: Commit** as `feat: add song detail metadata and renderer`.

### Task 2: Add navigation and improve credit readability

**Files:**
- Modify: `index.html`
- Test: `tests/song-details.test.cjs`

**Interfaces:**
- Add a dedicated `#song-detail` view and a `showSongDetails(song)` navigation function.
- Add a `data-details="<song-id>"` action on each track row.
- Keep the existing persistent audio element/player outside the view-swapping content.

- [ ] **Step 1: Add failing interaction tests** for track-row detail affordance, opening a selected song, returning to the previous view, and not showing lyrics actions on tracks without a URL.
- [ ] **Step 2: Run tests and verify the expected failures.**
- [ ] **Step 3: Add details actions** to recent tracks and library track rows. Ensure clicking the details action opens details rather than triggering row playback; clicking the row itself can continue to select/play the track.
- [ ] **Step 4: Implement in-page navigation** to the detail view with a clear Back to Library action. Preserve the prior library view and search text. Do not reload the document or recreate the audio element.
- [ ] **Step 5: Improve typography** for singer and music director in track rows and the persistent player. Use readable sizes and sufficient contrast; on mobile allow a compact two-line credit display rather than tiny single-line text.
- [ ] **Step 6: Run tests** with `node --test tests/song-details.test.cjs`; expected: all pass.
- [ ] **Step 7: Commit** as `feat: add song detail navigation and readable credits`.

### Task 3: Verify the complete experience

**Files:**
- Modify: `index.html` only if verification finds issues.

- [ ] **Step 1: Run all automated tests** with `node --test`; expected: all pass.
- [ ] **Step 2: Validate JavaScript syntax** by extracting the inline script and running `node --check` on the extracted file.
- [ ] **Step 3: Browser smoke test** at desktop and mobile widths: open first song details from Home and Songs; verify all credits; open M3DB lyrics in a new tab; return to library; play audio, open details, and confirm playback continues; verify songs without lyrics URLs show no lyrics link.
- [ ] **Step 4: Check responsive layout and focus states** for detail navigation, Back action and lyrics link.
- [ ] **Step 5: Commit any verification fixes** with a focused message and report any browser checks that could not be performed.
