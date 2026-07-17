# Architecture — the writing & classification system

Back to the [hub](README.md). Related: [decisions](decisions.md),
[VLA & reference maps](vla-and-refmap.md).

## Components

| Piece | Path | What it does |
|---|---|---|
| **`/write/` studio** | `_pages/write.md` | Client-side Markdown+LaTeX editor, live MathJax preview (math protected from `marked.js`), tone palette, `topics.yml`-driven category picker, export `.md`. No backend/login. |
| **Generated ontology** | `_data/topics.yml` | A generated snapshot of an LLM-derived taxonomy, nested to arbitrary depth. **Not hand-maintained.** |
| **Recursive renderer** | `_includes/topic-tree.liquid` | Renders the tree at any depth on `/topics/`. |
| **Workflow guard** | `scripts/check-workflow.sh` | Deterministic lint: category slugs exist, cite keys resolve, bibs disjoint, `.nojekyll` present. |
| **CI enforcement** | `.github/workflows/deploy.yml` | Runs the guard as a step **before** the build — a failing check aborts the deploy. |

## Classification engine (agent-driven, "mode A")

On each new/edited post: **extract concepts → place under the right branch (create the
node if missing) → rebalance into upper/lower concepts when a branch grows (LLM decides
the threshold and whether to group-up or push-down) → regenerate `topics.yml` → set the
post's `categories:` to its full ancestor path.**

- **Hard rule:** never rename an existing **leaf slug** — it drives a live
  `/blog/category/<slug>/` URL. Regrouping only *adds* upper-concept nodes above leaves.
- Roll-up: a post declares every ancestor slug, e.g. `categories: [math, analysis, complex-analysis]`, so each level is browsable.
- Full procedure: [LOCKED_WORKFLOW.md](../LOCKED_WORKFLOW.md) §4.

## Reference-map pattern

A post's reference section can be a **clustered, cross-linked web** instead of a flat
list: themes with a story thread, each node linking arXiv (formal) + an on-blog note
(informal) + `→` edges to related papers (the "spider"). Formal `{% bibliography %}` is
kept in a `<details>` block. First implemented in the VLA post — see
[VLA & reference maps](vla-and-refmap.md).

## Deploy mechanics (the `.nojekyll` rule)

Push `main` → "Deploy site" Action → `jekyll build` → JamesIves force-pushes `_site/` to
`gh-pages`. **`gh-pages` must keep a root `.nojekyll`** or Pages re-runs Jekyll and the
site 404s. The guard checks for it. Commit identity for this repo:
`Sunghyun Kim <gogog01-29-2021@users.noreply.github.com>`, no Anthropic co-author.
