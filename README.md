# Mixtape by Melvin

A responsive Malayalam music catalogue and listening interface. Song entries are managed in Blogger; the website reads the public Blogger feed automatically.

## Live catalogue source

- Blogger: https://mixtapebymelvin.blogspot.com/
- Feed: https://mixtapebymelvin.blogspot.com/feeds/posts/default?alt=json
- Website: https://melvinvarghese.github.io/mixtape/

## Add a song

1. Create a new public Blogger post. Use the song title as the post title.
2. Add the album artwork as the first image in the post.
3. In the Blogger HTML editor, add the `.mixtape-data` metadata block and fill in its `data-artist`, `data-music-director`, `data-lyricist`, `data-album`, `data-year`, `data-duration`, `data-lyrics-url`, and `data-audio` attributes. Use `data-album` for either the album title or film soundtrack title.
4. Publish the post. The website fetches the feed when it loads; no GitHub code edit is needed for new songs.

The feed parser skips posts that do not have the metadata block, a title, an artist, and an HTTPS audio URL. The first image in the post becomes its artwork. Artist names separated by commas or `|` are shown as separate artist listings.

## Features

- Blogger-powered song catalogue with JSON feed and JSONP fallback
- Search across titles, artists, albums and credits
- Browsing by songs, albums and artists\n- Automatic artist portraits from Wikidata/Wikimedia Commons when a unique exact-name match and image are available\n- Initial-based artist cards when a portrait cannot be safely identified\n- Browser-cached portrait lookups to reduce repeat API requests
- Song detail pages with singer, music director, lyricist, film, year and lyrics link
- Persistent browser audio player with play/pause, previous/next, shuffle, repeat, seek and volume
- Browser-local liked songs
- Responsive desktop and mobile navigation

## Artist portraits\n\nThe Artists page looks up exact artist names in Wikidata and uses the entity’s Wikimedia Commons image when one is available. Ambiguous names, missing images, and API/network failures keep the initials fallback instead of guessing. Results are cached in the browser (successful matches for up to 180 days; misses for up to 14 days).\n\nFor a verified portrait that is missing from Wikidata, add an HTTPS image URL to the `MANUAL_PORTRAITS` object near the top of `assets/artist-portraits.js`, using the artist’s displayed name as the key. Example: `"Artist Name": "https://example.com/portrait.jpg"`. Keep the image URL stable and use an image you have permission to use.\n\n## Important limitations

- The Blogger blog and its feed are public. Metadata and audio URLs are not private.
- This is a static front end; likes are saved only in the listener's browser and are not shared with the owner.
- Audio is streamed from the URL entered in Blogger. Mixtape does not upload, store, transcode or guarantee availability of audio files.
- Do not upload or stream copyrighted commercial recordings unless you have the necessary permission or licence.
- GitHub Pages is public hosting. Do not commit private files, credentials or copyrighted audio to this repository.
- The site does not provide unlimited storage or guaranteed streaming bandwidth.

## Local preview

Open `index.html` in a modern browser. No build step or paid service is required. The Blogger feed must be publicly accessible for the catalogue to load.
