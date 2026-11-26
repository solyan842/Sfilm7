# SFilm7 — Cinema AI → Nuvio

Independent Cloudflare Worker addon implementing the Nuvio/Stremio HTTP protocol from analysis of the user-supplied **cinema.apk** (VXM Cinema AI v0.2). SFilm6 is untouched.

## APK findings
- 41 public YouTube channels (**24 film/drama**, **17 animation**) and **15 genres**, taken from `assets/web/catalog.json`.
- The Android bridge reads YouTube channel `/videos` pages and parses `ytInitialData.videoRenderer`.
- The original player uses the official YouTube IFrame API. **There is no reusable HLS/m3u8 film API.**

## v0.1.0 addon routes

| Resource | URL |
|---|---|
| Manifest | `/manifest.json` |
| Film catalog | `/catalog/movie/sfilm7-phim.json` |
| Animation catalog | `/catalog/movie/sfilm7-hoat-hinh.json` |
| Search / genre | `/catalog/movie/sfilm7-phim/search=...json`, `/genre=...json` |
| Metadata | `/meta/movie/sfilm7%3A<videoId>.json` |
| YouTube stream | `/stream/movie/sfilm7%3A<videoId>.json` |
| Diagnostic | `/health` |

The addon uses YouTube `ytId` for playback, **not** a fake MP4 stream. NuvioTV #3693 and NuvioMobile #2115 added this support, but installed-client playback still requires live verification.

Discovery: public YouTube `/videos` HTML first, Atom feed fallback. The source is cached for 2 hours at the Cloudflare edge, with at most 8 channel requests concurrently. An unavailable upstream returns a retriable 503 rather than falsely empty content.

## Build and test

```sh
npm install
npm run check
npm test
npx wrangler deploy
```

Deployment target is Worker `sfilm7` (see `wrangler.toml`). Install in Nuvio with **`https://sfilm7.<your-workers-subdomain>.workers.dev/manifest.json`** only *after* Cloudflare deploy and live verification. A GitHub raw manifest URL alone cannot serve dynamic catalog/meta/stream endpoints.

**Status:** source and CI available, **not yet deployed to Cloudflare or tested on Nuvio hardware**. The original APK binary is intentionally not redistributed.
