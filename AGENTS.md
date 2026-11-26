# SFilm7 development rules

- SFilm7 is independent of SFilm6. Do not modify or deploy SFilm6.
- The provided cinema.apk is a WebView YouTube channel browser, not a provider of HLS or MP4 URLs. Only catalog, metadata and ytId playback are in scope.
- Preserve 41 channels (24 film and 17 animation) and 15 genres extracted from assets/web/catalog.json. Do not redistribute APK/DEX binaries or proprietary styling assets.
- Public YouTube channel /videos ytInitialData is the main catalog input; Atom feeds are fallback only. These may fail per region, so return an explicit 503 rather than an invented empty success response when no channel works.
- Nuvio uses Stremio-compatible /manifest.json, /catalog/movie/, /meta/movie/ and /stream/movie/. Never fake a YouTube watch URL as media/HLS. Use ytId for playback.
- No Cron, proxying of protected media, or scheduled keepalive. Use bounded concurrency and 2h edge cache.
- Verify real channel discovery and a Nuvio TV/mobile playback session before stating the addon is live. GitHub unit tests alone are insufficient.
