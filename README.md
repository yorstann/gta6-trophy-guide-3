# Leonida Legend 3

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/yorstann/gta6-trophy-guide-3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/yorstann/gta6-trophy-guide-3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft
Auto VI — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

Every trophy keeps its official name, description and grade exactly as
PlayStation publishes them, plus a step-by-step guide in my own words with
named sources, a kind tag, an effort tag (Quick / Moderate / Grind), a
missable flag where it applies, and the roadmap stage it belongs to.

## What it does

- **Checklist tracker** — tick trophies off, progress saved in localStorage;
  the header shows percent complete, earned/total and per-grade counts, plus a
  per-kind stats strip (Story, Collectibles, Activities, Freeroam, Progress).
- **Counter steppers** — trophies with a tracked total (250 stunts, 42 range
  challenges, 100 WAiNK spots…) get +/− steppers; hitting the count suggests
  the trophy is done.
- **Filters** — by kind (Story / Missable / Collectibles / Activities /
  Online), by effort, by grade, and by text search. The Online chip is honest:
  the PS5 list has no online trophies — the partner trophies are story co-op.
- **Spoiler shield** — hides the names and descriptions of hidden trophies
  until you earn them; deep-linkable with `#/trophies?shield=on`.
- **Detail pages** — `#/trophy/<id>`: numbered guide steps, sources cited,
  kind and effort chips, missable warning banner, count progress, roadmap stage.
- **Roadmap** — `#/roadmap`: seven stages to the platinum, each with an
  hour estimate, a focus note and its trophies in order, ending in a platinum
  checklist wired to your real earned state.
- **Missables** — `#/missables`: every missable trophy with its reason and a
  "before the final mission" checklist.
- **Export / import / reset** — download your progress as JSON and load it
  back, all client-side.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. No build step, no network at runtime —
the app is plain static files under `app/` (vanilla HTML/CSS/JS, inline SVG
medal icons, no external requests).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and
writes `dossier.json` with the vendored make.fun library. It empties the
output directory's contents without ever removing the directory itself, so it
also works when the output path is a mounted volume.
