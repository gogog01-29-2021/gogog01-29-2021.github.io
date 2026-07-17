# Blog Knowledge Base — start here

The connected, remembered record of how this blog is built and run. Excluded from the
Jekyll build (`_config.yml` → `exclude`), so it lives in GitHub for maintainers and
agents, not on the published site. Follow the links to spider through it.

## Map

- **[Architecture](architecture.md)** — the writing + classification system: generated
  ontology, `/write/` studio, workflow guard, CI enforcement, reference-map pattern.
- **[Decisions](decisions.md)** — the decision log (what was chosen, why, and the
  alternatives left open).
- **[ICML 2026 & automation](icml-and-automation.md)** — the ICML archive, the index
  map, the mass-index blocker, and the scheduled PMLR auto-pull routine.
- **[VLA series & reference maps](vla-and-refmap.md)** — the VLA article, Qwen-VLA note,
  verified reference set, and the clustered/spiderable reference-map pattern.

## Also in the repo root

- **[LOCKED_WORKFLOW.md](../LOCKED_WORKFLOW.md)** — the enforced writing/deploy rules
  (the single source of truth; the guard enforces it).
- **[BLOG_FEATURE_OPTIONS.md](../BLOG_FEATURE_OPTIONS.md)** — chosen feature paths + the
  alternatives to pick from later.
- **[CLAUDE.md](../CLAUDE.md)** / **[AGENTS.md](../AGENTS.md)** — agent working agreement.

## The one-paragraph mental model

Posts are written (optionally via the client-side **`/write/`** studio) under a locked
per-article order (outline → detail → references → tone). Their topics are classified
by an **agent-driven, LLM-derived ontology** serialized to `_data/topics.yml` (generated,
not hand-maintained; leaf slugs are URL-stable). A deterministic guard
(`scripts/check-workflow.sh`, wired into CI) blocks any deploy that breaks the rules.
Nothing deploys without the owner's explicit OK.
