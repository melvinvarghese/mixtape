# Artist Portrait Lookup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show trustworthy Wikidata/Wikimedia portraits on Mixtape artist cards, retaining initials whenever a reliable portrait cannot be found.

**Architecture:** Add a small standalone browser module that resolves unique artist names through Wikidata and Wikimedia Commons, applies explicit repository overrides first, and caches both matches and misses in versioned localStorage. Integrate it into the existing Artists page without changing its role sections or visual style; cards render initials immediately and upgrade to portraits asynchronously.

**Tech Stack:** Vanilla JavaScript, HTML, CSS, Wikidata Action API, Wikimedia Commons API, browser localStorage, Node.js built-in test runner (no dependencies).

**Spec:** `docs/superpowers/specs/2026-11-08-artist-portrait-lookup-design.md`

## Global Constraints

- No login, API key, paid service, server, database, or third-party dependency.
- Preserve the existing Mixtape visual design and artist-role sections.
- Look up unique names across singer, music director, and lyricist roles.
- Only show a portrait when the identity/image match is sufficiently clear; otherwise retain initials.
- Cache lookups in local browser storage with a versioned key and handle unavailable APIs gracefully.
- Use image URLs from Wikidata/Wikimedia Commons without proxying or downloading them.
- Manual overrides must be a simple editable mapping in the repository, keyed by artist name.
- Do not use arbitrary image-search results.

## Review Focus

- Ambiguous or common names must not receive a guessed person's portrait; test a no-match/ambiguous result and retain initials.
- An artist appearing in multiple roles must trigger only one lookup; test deduplication across role sections.
- Missing image claims or Commons thumbnails must resolve to a miss without breaking rendering; test missing-image results.
- API/network errors and unavailable localStorage must not break the Artists page; test rejected fetch and storage exceptions.
- Cached misses and stale cache versions must behave predictably; test cache hit, expiry/version mismatch, and retry behavior.

---

### Task 1: Build and test the portrait lookup module

**Files:**
- Create: `assets/artist-portraits.js`
- Create: `tests/artist-portraits.test.js`

**Interfaces:**
- Produces browser global `window.MixtapeArtistPortraits` with:
  - `getPortrait(name)` → Promise resolving to a portrait URL string or `null`.
  - `getInitials(name)` → two-letter initials fallback.
  - `clearCache()` → clears only this module's versioned cache.
- The module must also expose the same API through CommonJS for Node's built-in test runner.
- A single in-flight lookup per normalized name is shared across callers.

- [ ] **Step 1: Write failing Node tests** for initials, normalized-name cache keys, positive and negative cache entries, cache-version/expiry handling, manual override precedence, ambiguous/no-image results, API failure, and duplicate in-flight requests.
- [ ] **Step 2: Run the tests and confirm they fail** using `node --test tests/artist-portraits.test.js`.
- [ ] **Step 3: Implement the module** with an editable `MANUAL_PORTRAITS` mapping, conservative Wikidata entity resolution, image-claim extraction, Wikimedia Commons thumbnail resolution where required, versioned localStorage cache, bounded cache expiry, and graceful null results. Do not accept a result based only on a loose substring match; require a clear entity/name match and avoid selecting among multiple plausible entities.
- [ ] **Step 4: Run the tests** using `node --test tests/artist-portraits.test.js`; all tests must pass.
- [ ] **Step 5: Commit** as `feat: add conservative artist portrait lookup`.

### Task 2: Integrate portraits into the Artists page

**Files:**
- Modify: `index.html`
- Modify: `assets/artist-portraits.js` only if integration reveals a missing module interface.

**Interfaces:**
- Load `assets/artist-portraits.js` before the existing application script.
- The Artists renderer calls `window.MixtapeArtistPortraits.getPortrait(name)` for each unique visible artist name and updates the matching card when a URL resolves.
- Initials remain the immediate render and permanent fallback.

- [ ] **Step 1: Add an integration test or focused DOM test** proving artist cards initially render initials and can be updated with a resolved portrait URL without changing the artist name, role, or song count.
- [ ] **Step 2: Run the integration test** and confirm it fails before the page integration.
- [ ] **Step 3: Update the Artists card markup and CSS** to use a stable artist-name data attribute, an image element with safe alt text, and the existing initials element as fallback. Keep image sizing, card proportions, spacing, and dark palette consistent with current cards.
- [ ] **Step 4: Add asynchronous portrait hydration** after artist cards render. Deduplicate names across all three roles, avoid stale updates after a filter/render replaces the cards, set `src` only for a resolved URL, and keep initials visible if the image fails to load.
- [ ] **Step 5: Run module and integration tests**, then verify the page manually at desktop and mobile widths.
- [ ] **Step 6: Commit** as `feat: show verified portraits on artist cards`.

### Task 3: Verify resilience and document manual corrections

**Files:**
- Modify: `README.md`
- Modify: `assets/artist-portraits.js` only for fixes found during verification.

**Interfaces:**
- Document the exact `MANUAL_PORTRAITS` mapping format and how to add or remove an explicit portrait URL.
- Document that portraits depend on public Wikidata/Wikimedia availability and that initials are expected for unmatched artists.

- [ ] **Step 1: Exercise the review-focus cases**: ambiguous name, missing portrait, artist in multiple roles, offline/API failure, blocked storage, stale cache, and broken image URL.
- [ ] **Step 2: Fix any failures** and rerun `node --test tests/artist-portraits.test.js` plus the integration checks.
- [ ] **Step 3: Update README** with concise setup-free behavior and manual override instructions.
- [ ] **Step 4: Commit** as `docs: explain artist portrait overrides`.
- [ ] **Step 5: Verify the final GitHub Pages source** contains the module script in the correct order and no API keys, new dependencies, or unrelated UI changes.
