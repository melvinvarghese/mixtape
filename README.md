# Mixtape by Melvin

A responsive front-end prototype for a private, personally curated music archive.

## Preview locally
Open `index.html` in a modern browser. No build step, framework, or paid service is required.

## Design direction
The interface follows an **Analog Archive** art direction: warm paper tones, deep record-shop green, restrained rust accents, editorial serif typography, real photographic imagery, and a compact listening desk. Desktop uses a record-archive sidebar and spacious content area; mobile switches to a compact bottom navigation and a condensed persistent player.

## Current prototype features
- Responsive listening-room homepage, tested by layout design for desktop and narrow mobile screens
- Song list, album grouping, and text search
- Persistent audio-player controls (play/pause, previous/next, shuffle, repeat, seek, volume)
- Browser-local loved-song reactions using `localStorage`
- Local audio preview using the file picker

## Important limitations
- The displayed catalogue is illustrative demo content, not Melvin's actual music collection.
- No audio files are included or uploaded. Selecting a file plays it in the current browser only; it is not shared with visitors.
- Loved-song reactions are saved only in the current browser and are not aggregated or visible to the owner.
- There is no owner login, admin upload screen, database, cloud audio storage, protected access, or server-side reaction counting yet.
- GitHub Pages is a public static host. Do not commit copyrighted music or private audio files to this repository.
- This prototype does not provide unlimited storage or guaranteed streaming bandwidth. A backend and a suitable audio host must be selected before inviting listeners.

## Next implementation stage
Connect a low-cost/free-tier backend for owner-only song management, album metadata, shared audio delivery, and private access. Any provider must be checked against current free-tier limits and the project's ₹0 budget before adoption.
