# SFilm7 — Cinema AI → Nuvio

SFilm7 is a separate Nuvio/Stremio-compatible addon derived from analysis of the user-supplied `cinema.apk` (VXM Cinema AI v0.2).

The APK catalogs 41 public YouTube channels (24 film, 17 animation) and 15 genres. It reads YouTube channel `/videos` pages (`ytInitialData`) and uses the official YouTube IFrame player; there is **no native HLS/m3u8 film server** to copy. The Nuvio addon therefore maps videos to `catalog`, `meta` and `stream` resources using the YouTube `ytId` field, not invented direct playback URLs.

**Development status:** v0.1.0 source has been prepared and locally tested (10/10 tests). The Cloudflare Worker is not yet deployed or verified against live YouTube/Nuvio playback. SFilm6 is untouched. The full source archive is available in the ChatGPT conversation; don't install this repository's static manifest until a working API host has been deployed.
