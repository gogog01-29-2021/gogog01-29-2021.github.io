@AGENTS.md

---

# Sunghyun Kim's research blog — agent working agreement

This repo is **not** a generic al-folio deployment. It is Sunghyun Kim's English,
equation-heavy research blog (live: https://gogog01-29-2021.github.io). The
al-folio theme docs above still apply for *mechanics*; the rules below govern
*how content gets written and shipped*.

## Goal (standing)

Produce wmh6525-style "완전 정복" deep-dive posts — long-form, rigorous, big-picture
surveys — in English, **higher quality and more expanded** than the reference,
with clean editable markdown and real (never fabricated) references.

### Knowledge base

**Start at [`docs/README.md`](docs/README.md)** — the connected record of how this blog
is built and run (architecture, decisions, ICML archive + automation, VLA series +
reference maps). Excluded from the Jekyll build; lives in GitHub to be remembered.

### Canonical workflow doc

**`LOCKED_WORKFLOW.md` (repo root) is the single source of truth** for how posts are
written and shipped, and it is machine-enforced. The summary below stays for quick
reference; if the two ever disagree, `LOCKED_WORKFLOW.md` wins.

### Shipped infrastructure (2026-07)

- **`/write/`** (`_pages/write.md`) — client-side Markdown+LaTeX draft studio with live
  MathJax preview, tone palette, `topics.yml`-driven category picker, export `.md`.
  No backend/login (Editor option A; B/C recorded in `BLOG_FEATURE_OPTIONS.md`).
- **`scripts/check-workflow.sh`** — deterministic guard. Run before any deploy; it
  fails on unknown category slugs, unresolved `{% cite %}` keys, papers/references bib
  mixing, or a missing `.nojekyll`.
- **Generated ontology** — `_data/topics.yml` is a **generated snapshot** of an
  LLM-derived taxonomy, nested to arbitrary depth via `_includes/topic-tree.liquid`.
  Classification is **agent-driven** (extract concepts → place → rebalance into
  upper/lower concepts → regenerate → set post `categories:` to the full ancestor
  path). **Never rename an existing leaf slug** — it drives a live `/blog/category/…`
  URL. Full procedure in `LOCKED_WORKFLOW.md` §4.
- Last article shipped: `_posts/2026-05-31-vanishing-integral-five-lenses.md` (live).
- **Next phase (goal):** auto concept-finding from prose (chain-of-thought concepts)
  feeding the same ontology engine.

## Per-article workflow contract (locked — follow in this exact order)

Control me in precise order; do **not** do everything at once. Before any prose,
agree in this sequence:

1. **Structure / outline** — the section skeleton (e.g. ladder-of-generalization).
2. **Detail level** — how much concrete computation per section. *Always write
   specific worked examples with real numbers, never only the "meaning."*
3. **Reference list** — real published works only, into `_bibliography/references.bib`
   (NEVER `papers.bib`, which is reserved for the author's own work).
4. **Tone** — chosen per topic from the tone palette.

Each post is **layered**: a *settled core* (Direct — locked) plus *open threads*
(Indirect — revisable in a later dated edit, never by rewriting the locked core).

## Hard rules

- **Nothing deploys without explicit per-deploy authorization.** Push to `main`
  only when the user says so.
- **No fabrication.** Real venues/DOIs/quotes/dates only. Math claims must be
  verified (recompute, don't assert). Cite established texts, not invented ones.
- **Ask in plain lettered text (a / b / c), never the AskUserQuestion popup** —
  the popup crashes this user's terminal.
- **Two image forms per article** (like the reading-archive posts): a hero
  visual + a lower schematic. For **math posts, compose both in Figma** (vector
  text, exact symbols) — the OpenRouter AI-image route mistransliterates symbols
  and names and must not be used for equations. Leave the `figure.liquid`
  includes commented until the PNGs land. Figma PNG export is gated by the
  View-seat rate limit; build frames anytime, export when the limit clears.
- **`.nojekyll` on `gh-pages` is sacred.** The deploy action force-pushes a
  pre-built `_site` to `gh-pages`; without a root `.nojekyll` the site 404s.
  Never delete it. When appending to `.gitignore` via shell, check for a trailing
  newline first (a past bug glued `vendor` + `.omc/` into `vendor.omc/`).
- **Every `{% cite key %}` must have its entry in `references.bib`** or the
  Jekyll build errors out.

## Deploy mechanics

Push `main` → "Deploy site" Action → Jekyll build → JamesIves force-pushes
`_site/` to `gh-pages`. Pages source = `gh-pages /`. Post URLs follow
`/blog/:year/:title/`. After a deploy, verify at the live URL; if it 404s,
check that `.nojekyll` survived on `gh-pages`.
