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

Portraits that were supplied by hand are saved in this repository, in `assets/artists/`, and are used before any lookup. They are listed in the `MANUAL_PORTRAITS` object near the top of `assets/artist-portraits.js`, and `assets/artists/SOURCES.md` records where each saved image came from. A new artist that is not listed there is looked up automatically, and shows initials if nothing is found.

To add or replace a portrait by hand:

1. Save the image (about 500 px wide is plenty) in `assets/artists/`, named after the artist, e.g. `artist-name.jpg`. Use only letters, numbers, `.`, `-` and `_` in the file name.
2. Add `'Artist Name': local('artist-name.jpg')` to `MANUAL_PORTRAITS`, using the artist's name exactly as it appears on the site.
3. Add a row to `assets/artists/SOURCES.md` with the source and licence.
4. Raise the `?v=` number on the `artist-portraits.js` script tag in `index.html` so visitors get the new list.

Only use images you have permission to use. Wikimedia Commons files usually require attribution; check the licence on the file page.

## Important limitations

- This is a static front end; likes are saved only in the listener's browser and are not shared with the owner.
- Audio is streamed from external URLs. Mixtape does not upload, store, transcode or guarantee availability of audio files.
- Do not upload or stream copyrighted commercial recordings unless you have the necessary permission or licence.
- GitHub Pages is public hosting. Do not commit private files, credentials or copyrighted audio to this repository.
- The site does not provide unlimited storage or guaranteed streaming bandwidth.

## Local preview

Open `index.html` in a modern browser. No build step or paid service is required. The song feed must be publicly accessible for the songs to load.
