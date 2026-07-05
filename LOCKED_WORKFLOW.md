# Locked Writing Workflow

This file is the **single source of truth** for how posts get written and shipped on
this blog. It exists so the rules are checkable by a human *and* enforceable by a
script (see [Enforcement](#enforcement)). Nothing here is optional.

---

## 1. Per-article order (never skip, never reorder)

Before **any** prose is written for a new article, agree in this exact order:

1. **Outline** — section structure agreed first.
2. **Detail level** — how deep each section goes.
3. **Reference list** — the real papers to cite, locked before writing.
4. **Tone** — chosen per topic from the palette below. **Never picked silently.**

> Rationale: the author controls the piece in precise steps. Do NOT produce a
> finished draft in one shot.

## 2. Tone palette (ask which, per topic, in plain text)

Pick one register per article. The assistant must **ask** (plain lettered text —
`AskUserQuestion` popups crash this terminal) and never choose on its own.

| # | Tone | Character |
|---|------|-----------|
| 1 | Clean academic | Readable, precise, low notation density (good default) |
| 2 | Math-compact | Indicator notation, terse, formal |
| 3 | Simulation | Per-trial procedural narration |
| 4 | Professor-cautious | Hedged, careful about hidden assumptions |
| 5 | Mechanism-heavy | Foregrounds causal mechanism |
| 6 | Risk-analysis | Frames through loss / tail / exposure |
| 7 | Econometric | Latent-propensity / observable-feedback register |
| 8 | Best-paper-ready | Submission register, indicator-driven, exact |

## 3. References (integrity — hard rule)

- `_bibliography/papers.bib` = **only the author's own work.**
- `_bibliography/references.bib` = **only cited external works.**
- **Never mix them.** Mixing would falsely list others' papers as the author's.
- Only **real, established** papers. Never fabricate a venue, DOI, or result.
- In-post citations use `{% raw %}{% cite key --file references %}{% endraw %}` and
  every key must exist in the target `.bib` before the post ships.

## 4. Classification (topic tree)

- The taxonomy lives in `_data/topics.yml` (big categories → children).
- Every post declares `categories: [<slug>, ...]`; roll-up = declare parent + child
  (e.g. `categories: [math, probability]`).
- **Every declared slug must exist in `topics.yml`.** If a post needs a sector that
  does not exist yet, the sector is **added to `topics.yml`** (under the correct
  upper branch) in the **same commit** as the post — never left dangling.

## 5. Deploy (hard rule)

- **Nothing deploys without an explicit, per-deploy OK from the author.**
- The `gh-pages` branch MUST keep a root `.nojekyll` file, or GitHub Pages re-runs
  Jekyll over the pre-built site and it 404s. The deploy action's
  `rsync --exclude .nojekyll` preserves it — do not delete it.
- After a deploy: verify `gh api repos/<repo>/pages --jq .status` is `built` and the
  new URL returns `200`.

---

## Enforcement

Run `scripts/check-workflow.sh` (added by the classification/lint task) before any
deploy. It fails the commit if:

- a post declares a `categories:` slug missing from `_data/topics.yml`;
- a `{% raw %}{% cite %}{% endraw %}` key does not resolve in its target `.bib`;
- `papers.bib` and `references.bib` share a citation key (mixing);
- `.nojekyll` is missing from the `gh-pages` branch.

The order-of-work rules (§1, §2) and the per-deploy OK (§5) are **human-gated** —
they cannot be fully automated, but this file makes them auditable.
