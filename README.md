# Vice Panels — GTA-style Cover Art Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/0xdedipra/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/0xdedipra/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Panels turns your own photos into bold, multi-panel, poster-style cover art — entirely in the browser and 100% offline. Pick from four original panel layouts (Classic Five, Diagonal Slash, Vertical Strips, Quad Grid), apply one of four cinematic colour grades (Vice Sunset, Neon Nights, Golden Hour, Midnight Teal), click any panel to select it, drag to pan its photo, zoom per panel, and finish with stacked gradient title lettering, a subtitle, a round sticker badge, an optional five-star row, halftone dots and a vignette. Export a clean PNG at 1080×1080, 1080×1350 or 1920×1080 with one click. Two built-in sample photos are included so the studio works the moment it opens; add up to three of your own photos by upload or drag-and-drop. All artwork is original — no logos or third-party art.

## Run it

```sh
node serve.ts
```

then open the printed local address — or serve the `app/` folder with any static file server and open `index.html`.

## Build the entry

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into the output directory and writes a deterministic `dossier.json` there.

<sub>Entered on [make.fun](https://make.fun/?ref=7h35kkm4&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
