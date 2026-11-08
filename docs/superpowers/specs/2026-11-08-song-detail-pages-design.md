# Song Detail Pages and Clearer Music Credits — Design

## Intent
Make song credits readable and give each track a dedicated detail view, while keeping Mixtape by Melvin's existing Minimal Modern visual style and English interface.

## Goals
- Show singer and music director/composer clearly in the player and track listings.
- Let visitors open a dedicated detail page for each song.
- Show available credits and release information on that page: singer, music director/composer, lyricist, album, film and year.
- For the first sample track, provide a "View Lyrics" link to its original M3DB page: https://m3db.com/lyric/65316.
- Make lyrics links optional per song; do not show a lyrics action when no URL is provided.
- Keep playback working across navigation between the library and song details.

## Non-goals and constraints
- Do not copy or embed lyrics; the external lyrics provider remains the source.
- Do not require every song to have lyrics.
- No backend, account system, paid service, new framework or build step.
- Keep the current single-file HTML/CSS/JS implementation and responsive behavior.
- Keep the public-facing interface and metadata labels in English; song lyrics remain on the external site.

## Approaches considered
1. Dedicated in-site song detail view with an external lyrics link — selected. It keeps visitors within Mixtape for song information while linking to the original lyrics page.
2. Show only a lyrics link beside each track — rejected because it does not provide the requested song page or fuller credits.
3. Embed/reproduce lyrics in Mixtape — rejected because the requested source should remain the lyrics website and reproduction rights are not established.

## Design decisions
- Track rows will have a clear details affordance and remain playable.
- The detail view will show artwork, title, larger singer and music-director credits, then lyricist, album, film and year when available.
- "View Lyrics" opens the external page in a new tab and appears only when that track has a lyrics URL.
- Player metadata will display singer and music director in legible text, with responsive sizing.
- Existing sample songs without verified credits will not receive invented metadata.

## Acceptance checks
- The first track opens its own detail view from the library.
- Its detail view shows the verified credits and a working external M3DB link.
- Tracks without a lyrics URL do not display a lyrics action.
- Singer and music director are readable in both the player and track rows on desktop and mobile.
- Audio playback continues when navigating to and from a detail view.
- Existing search, album browsing and local likes continue to work.
