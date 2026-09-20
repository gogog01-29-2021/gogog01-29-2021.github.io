# Locked Writing Workflow

This file is the **single source of truth** for how posts get written and shipped on
this blog. It exists so the rules are checkable by a human _and_ enforceable by a
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

| #   | Tone               | Character                                              |
| --- | ------------------ | ------------------------------------------------------ |
| 1   | Clean academic     | Readable, precise, low notation density (good default) |
| 2   | Math-compact       | Indicator notation, terse, formal                      |
| 3   | Simulation         | Per-trial procedural narration                         |
| 4   | Professor-cautious | Hedged, careful about hidden assumptions               |
| 5   | Mechanism-heavy    | Foregrounds causal mechanism                           |
| 6   | Risk-analysis      | Frames through loss / tail / exposure                  |
| 7   | Econometric        | Latent-propensity / observable-feedback register       |
| 8   | Best-paper-ready   | Submission register, indicator-driven, exact           |

## 3. References (integrity — hard rule)

- `_bibliography/papers.bib` = **only the author's own work.**
- `_bibliography/references.bib` = **only cited external works.**
- **Never mix them.** Mixing would falsely list others' papers as the author's.
- Only **real, established** papers. Never fabricate a venue, DOI, or result.
- In-post citations use `{% raw %}{% cite key --file references %}{% endraw %}` and
  every key must exist in the target `.bib` before the post ships.

## 4. Classification (topic tree)

- `_data/topics.yml` is a **generated snapshot** of the LLM-derived ontology, not a
  hand-maintained source of truth. It nests to **arbitrary depth** (upper concepts /
  lower concepts).
- Every post declares `categories: [<slug>, ...]` = its **full ancestor path** so the
  roll-up makes every level browsable (e.g. `categories: [math, analysis, complex-analysis]`).
- **Every declared slug must exist in `topics.yml`.** Missing → dangling → blocked by
  the guard.

### Agent-driven classification engine (mode A)

Runs as part of the writing workflow — no external service. On each new/edited post:

1. **Extract concepts** — read the post's prose and name the concepts it covers.
2. **Place it** — match concepts to existing leaf nodes; if none fits, **create a new
   node under the correct upper branch**.
3. **Rebalance** — if a branch has grown "too many" siblings (LLM judgment, no fixed
   number), introduce an **upper-concept** grouping node, or split into lower-concept
   children (LLM picks per case).
4. **Regenerate** `topics.yml` and set the post's `categories:` to its full ancestor path.
5. **URL stability (hard):** never rename an existing **leaf** slug — only regroup it
   under new upper-concept nodes. Renaming a leaf breaks its live `/blog/category/…` URL.
6. **Validate** with `scripts/check-workflow.sh`, then deploy on the author's OK.

_Future:_ the concept-extraction step (1) generalizes into "auto concept finding from
what I write (chain-of-thought concepts)" — the same pipeline, richer front end.

## 5. Deploy (hard rule)

- **Nothing deploys without an explicit, per-deploy OK from the author.**
- The `gh-pages` branch MUST keep a root `.nojekyll` file, or GitHub Pages re-runs
  Jekyll over the pre-built site and it 404s. The deploy action's
  `rsync --exclude .nojekyll` preserves it — do not delete it.
- After a deploy: verify `gh api repos/<repo>/pages --jq .status` is `built` and the
  new URL returns `200`.

## 6. Content shape — Original + Essence (hard rule, added 2026-09-20)

Every post carries two identifiable pieces near the top, right after the tone
blockquote and before the numbered sections begin:

- **Original** — the raw source material the post is built from, **quoted verbatim**,
  not paraphrased: a short excerpt from the paper's own abstract, or the author's own
  original words if the post is about the author's project. Keep it short (a sentence
  or two) — this is a pointer to the real source, not a reproduction of it.
- **Essence** — a short (2–4 sentence) compressed synthesis immediately after, giving
  the "zipped" takeaway independent of the rest of the post's prose.

> Rationale (verbatim from the author): so a reader — human or an AI agent picking up
> this repo cold — can get the real source and the compressed meaning without reading
> the full argument, the same way a wiki entry's summary line works.

Template:

```markdown
> **Original.** "<verbatim excerpt, quoted exactly, with attribution>"
>
> **Essence.** <2–4 sentence compressed synthesis in the author's own words.>
```

**Status: not yet retrofitted onto older posts.** Applies going forward from
2026-09-20; existing posts get it opportunistically when they're next touched, not in
a single mass edit.

---

## Enforcement

Run `scripts/check-workflow.sh` (added by the classification/lint task) before any
deploy. It fails the commit if:

- a post declares a `categories:` slug missing from `_data/topics.yml`;
- a `{% raw %}{% cite %}{% endraw %}` key does not resolve in its target `.bib`;
- `papers.bib` and `references.bib` share a citation key (mixing);
- `.nojekyll` is missing from the `gh-pages` branch.

The order-of-work rules (§1, §2), the per-deploy OK (§5), and the Original/Essence
content shape (§6) are **human-gated** — they cannot be fully automated (prose
structure isn't string-matchable the way a citation key is), but this file makes them
auditable.
