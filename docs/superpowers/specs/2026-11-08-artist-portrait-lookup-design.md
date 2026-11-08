# Artist portrait lookup — design

## Intent
Show real portraits on Mixtape's Artists page for singers, music directors, and lyricists, replacing initials when a trustworthy match is available.

## Goals
- Resolve an artist to a Wikidata entity using the public Wikidata API.
- Use the entity's image claim or a Wikimedia Commons portrait where available.
- Cache successful and unsuccessful lookups in the browser to avoid repeated requests.
- Keep initials as a graceful fallback.
- Provide a small manual override mechanism for correcting ambiguous or missing matches.

## Non-goals
- No login, API key, paid service, server, or database.
- No guarantee that every artist has a public portrait.
- No automatic use of arbitrary image-search results.

## Approaches considered
1. Wikidata + Wikimedia Commons lookup (selected): better identity grounding and reusable public image sources; coverage varies.
2. Direct image search: broader coverage but higher risk of wrong-person matches and unstable image URLs.
3. Manually curated repository images only: reliable presentation but requires ongoing manual work for every artist.

## Constraints and behavior
- Preserve the existing Mixtape visual design and artist-role sections.
- Look up unique names across singer, music director, and lyricist roles.
- Only show a portrait when the identity/image match is sufficiently clear; otherwise retain initials.
- Cache lookups in local browser storage with a versioned key and handle unavailable APIs gracefully.
- Use image URLs from Wikidata/Wikimedia Commons without proxying or downloading them.
- Manual overrides should be a simple editable mapping in the repository, keyed by artist name, so corrections are predictable and transparent.

## Open implementation choices
- The builder will choose conservative matching thresholds, cache expiry/versioning, and a lightweight client-side lookup flow.
- Verify behavior for duplicate/ambiguous names, missing portraits, API failure, and artists appearing in multiple roles.
