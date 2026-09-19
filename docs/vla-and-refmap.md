# VLA series & reference maps

Back to the [hub](README.md). Related: [architecture](architecture.md) (reference-map
pattern), [decisions](decisions.md) (D8).

## Posts

| Post      | Path / URL                                                           | Notes                                                                              |
| --------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Survey    | `_posts/2026-07-17-vla-adaptation.md` → `/blog/2026/vla-adaptation/` | "VLA through the lens of adaptation" — 4 axes + Qwen-VLA worked case + critical §D |
| Deep note | `_posts/2026-07-11-qwen-vla.md` → `/blog/2026/qwen-vla/`             | Qwen-VLA reading note                                                              |

Ontology node: `Robotics & Embodied AI → Vision-Language-Action`
(`robotics-embodied` / `vla`). Tone: Clean-academic body + Best-paper-ready claims +
Professor-cautious for the critical / open-thread sections.

## The four adaptation axes (the article's spine)

1. **Embodiment** — one policy, many bodies (embodiment-aware prompt conditioning).
2. **Task** — manipulation + navigation + trajectory unified.
3. **Action space** — discrete tokens vs continuous flow/diffusion decoding.
4. **Distribution / OOD** — the honest frontier (dynamic manipulation, real-world OOD).

## Anchor paper — Qwen-VLA (verified)

arXiv **2605.30280** (May 2026); repo `QwenLM/Qwen-VLA` (no weights/code released yet).
Qwen3.5-4B backbone + **1.15B DiT flow-matching** action decoder; embodiment-aware
prompt conditioning. Reported numbers all confirmed against the source, incl. DOMINO
zero-shot **26.6%**.

## Verified reference set (in `_bibliography/references.bib`)

21 keys from the original pass, arXiv-verified: `qwen2026vla`, `brohan2022rt1`,
`brohan2023rt2`, `driess2023palme`, `kim2024openvla`, `ghosh2024octo`, `black2024pi0`,
`li2023roboflamingo`, `chi2023diffusion`, `peebles2023dit`, `zhao2023act`,
`pertsch2025fast`, `lipman2023flowmatching`, `padalkar2024openx`, `doshi2024crossformer`,
`shah2023vint`, `reed2022gato`, `liu2023libero`, `li2024simplerenv`, `anderson2018r2r`,
`ku2020rxr`.

**+5 added 2026-09-20** (previously named-but-not-cited, now formally cited via
`{% cite %}` in the post): `mu2025robotwin` (RoboTwin, arXiv 2504.13059),
`fang2026domino` (DOMINO, arXiv 2603.15620, ECCV 2026), `cheng2024navila` (NaVILA,
arXiv 2412.04453), `zhang2024uninavid` (Uni-NaVid, arXiv 2412.06224), `bousmalis2023robocat`
(RoboCat, arXiv 2306.11706). NaVILA/Uni-NaVid/RoboCat also got new reference-map nodes in
cluster ③ (they weren't discussed in prose before, only named in the closing note).

## Reference-map pattern

The article's reference section is a **clustered spider-map**: 5 themes (lineage,
action-space, embodiment/unification, benchmarks, the anchor), each with a story thread;
every node links arXiv (formal) + on-blog note (informal) + `→` edges to related papers.
Deferred next layer (integrity): verify + attach external project-page / blog URLs per
node — never fabricated. This pattern is a candidate to generalize into a reusable
include (see [decisions](decisions.md) D8).
