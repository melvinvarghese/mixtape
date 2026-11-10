# Mixtape by Melvin

A personal mixtape of my favourite songs, with a responsive listening interface.

Website: https://melvinvarghese.github.io/mixtape/

## Features

- Search across titles, artists, albums and credits
- Browsing by songs, albums and artists
- Shareable links for every song, artist, composer, lyricist and album
- Automatic artist portraits from Wikidata/Wikimedia Commons when a unique exact-name match and image are available
- Initial-based artist cards when a portrait cannot be safely identified
- Browser-cached portrait lookups to reduce repeat API requests
- Song pages with singer, music director, lyricist, album, year and a lyrics link
- Persistent player with play/pause, previous/next, shuffle (on by default), repeat, seek and volume, plus an expandable now-playing view
- Browser-local liked songs
- Responsive desktop and mobile navigation

## Artist portraits

The Artists page looks up exact artist names in Wikidata and uses the entity's Wikimedia Commons image when one is available. Ambiguous names, missing images, and API/network failures keep the initials fallback instead of guessing. Results are cached in the browser (successful matches for up to 180 days; misses for up to 14 days).

For a verified portrait that is missing from Wikidata, add an HTTPS image URL to the `MANUAL_PORTRAITS` object near the top of `assets/artist-portraits.js`, using the artist's displayed name as the key. Example: `"Artist Name": "https://example.com/portrait.jpg"`. Keep the image URL stable and use an image you have permission to use.

## Important limitations

- This is a static front end; likes are saved only in the listener's browser and are not shared with the owner.
- Audio is streamed from external URLs. Mixtape does not upload, store, transcode or guarantee availability of audio files.
- Do not upload or stream copyrighted commercial recordings unless you have the necessary permission or licence.
- GitHub Pages is public hosting. Do not commit private files, credentials or copyrighted audio to this repository.
- The site does not provide unlimited storage or guaranteed streaming bandwidth.

## Local preview

Open `index.html` in a modern browser. No build step or paid service is required. The song feed must be publicly accessible for the songs to load.
