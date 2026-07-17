# ICML 2026 archive & automation

Back to the [hub](README.md). Related: [decisions](decisions.md) (D6, D7),
[architecture](architecture.md).

## The pieces

| Piece | Path / URL | Role |
|---|---|---|
| Live-archive hub | `_posts/2026-07-11-icml-2026.md` → `/blog/2026/icml-2026/` | Day-by-day notes (Seoul · COEX · Jul 6–11) |
| Index map (data) | `_data/icml2026.yml` | Classified catalog: invited talks + papers |
| Index map (page) | `_pages/icml2026.md` → `/icml2026/` | Renders the catalog with arXiv/code/keywords/post columns |
| Ontology node | `_data/topics.yml` | `Conferences → ICML 2026` (`conferences`/`icml-2026`) |

**Model:** the index map is the lightweight catalog (link rows classified by topic);
deep posts are written only for selected papers and linked from the index's `post:`
column. See [decisions](decisions.md) D6.

## Program (verified)

ICML 2026 — Seoul, COEX, **Jul 6–11**. Expo/Tutorials Jul 6 · Main Conference Jul 7–9 ·
Workshops Jul 10–11. Six invited speakers: Fung (HKUST), Athey (Stanford), Kakade
(Harvard), Regev (Genentech), Rieser (DeepMind), Narayanan (Princeton).

## The mass-index blocker (why it isn't auto-filled yet)

Confirmed constraints (do **not** fabricate a paper list around them):

1. **PMLR** ICML 2026 volume not published until ~weeks post-conference (latest is
   v267 = ICML 2025).
2. **OpenReview** bulk query (`content.venueid=ICML.cc/2026/Conference`) is
   Cloudflare-walled; `/notes/search` only surfaces sparse matches (ICLR 2026 outranks).

Verified entries so far: Qwen-VLA + "Spatial Memory for Out-of-Vision Manipulation in
VLA" (ICML 2026 regular).

## Scheduled auto-pull

Cloud routine **`trig_01FSBoDvxsc9hQmTZFb71zRK`** — "ICML 2026 PMLR index auto-pull",
weekly (Mon 00:00 UTC = 09:00 KST). It checks PMLR; when the ICML 2026 volume is live it
pulls the paper list into `_data/icml2026_pending.yml` on a **new branch / draft PR** and
notifies — it **never pushes to main or deploys**. Manage:
<https://claude.ai/code/routines/trig_01FSBoDvxsc9hQmTZFb71zRK>
