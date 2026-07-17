# Decision log

Back to the [hub](README.md). The choices that shaped the blog, why, and what stayed
open. Newest first.

| # | Decision | Why | Alternatives left open |
|---|---|---|---|
| D1 | **`/write/` = client-side studio (Editor A)** | Works on static Pages today, no backend/login | B: Decap CMS + GitHub OAuth (browser-commit); C: local editor — see [BLOG_FEATURE_OPTIONS.md](../BLOG_FEATURE_OPTIONS.md) |
| D2 | **Classification = agent-driven, LLM-derived (mode A)** | Matches "no rule-based" rule; new sectors auto-created | B: pure build-time keyword classifier (rejected — silent misclassification) |
| D3 | **`topics.yml` is generated, not hand-authored** | A hand-maintained taxonomy *is* hardcoding; the ontology should be derived from the corpus | — |
| D4 | **Leaf slugs are URL-stable; regroup only above them** | Renaming a leaf breaks a live `/blog/category/…` URL | — |
| D5 | **Guard wired into CI before build** | Rules enforced, not just documented | — |
| D6 | **ICML = index map + deep posts, not a mirror** | 3,000 prose posts = noise; the proceedings already live on PMLR | Full auto-index deferred to the [scheduled pull](icml-and-automation.md) |
| D7 | **No fabrication of the ICML paper list** | PMLR not live yet + OpenReview bulk query Cloudflare-walled; strict-accuracy blog | Wait for PMLR (scheduled) or user-supplied export |
| D8 | **Reference sections become clustered spider-maps** | Reader can crawl related work; a story beats a flat list | External informal/project links deferred until verified (never fabricated) |
| D9 | **This knowledge base (`docs/`) in the repo** | Session memory shouldn't be the only record; remembered in GitHub, connected | — |

See also: [architecture](architecture.md), [ICML & automation](icml-and-automation.md),
[VLA & reference maps](vla-and-refmap.md).
