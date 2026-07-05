# Blog Feature Options — chosen paths + alternatives

Records the design decisions for two features and the **other options still open**,
so they can be revisited later. See [LOCKED_WORKFLOW.md](LOCKED_WORKFLOW.md) for the
writing/deploy rules these support.

---

## Feature 1 — In-browser writing with a LaTeX editor

**Chosen: Option A — client-side draft studio** (built).

- Page: `_pages/write.md` → live at `/write/`.
- Markdown + LaTeX with **live preview** (marked.js + the site's MathJax). Math is
  protected from Markdown before rendering so `$…$` / `$$…$$` survive intact.
- Picks tone (8-register palette) and categories (checkboxes generated from
  `_data/topics.yml`), then **Copy .md** / **Download .md** with correct front matter
  and `YYYY-MM-DD-slug.md` filename.
- Pure static; works on GitHub Pages today; no backend, no login.
- Trade-off: it **exports** a file (you drop it into `_posts/` or paste it to commit);
  it does not save to the repo by itself.

### Other options (choose later)

**Option B — Decap CMS (`/admin/`) with GitHub OAuth.** A real in-browser editor
that **commits directly to the repo**, with live preview. Requires a small OAuth
backend (Cloudflare Worker / serverless function) because Pages can't host the OAuth
handler. Pick this when you want browser-side commits without touching git. Setup:
add `admin/index.html` + `admin/config.yml`, deploy an OAuth provider, whitelist the
repo.

**Option C — Local editor.** Write locally with `bundle exec jekyll serve` live
preview and commit via git. Simplest, most powerful math tooling, but not "inside the
blog." Good fallback for long deep-dive posts.

---

## Feature 2 — Automatic classification into sectors

**Chosen: Option A — write-time classification + deterministic lint guard** (built).

- At write time, a post's content is matched to `_data/topics.yml`; `categories:` are
  assigned; **if no sector fits, the new node is added under its correct upper branch
  in the same commit** (never left dangling). Roll-up = declare parent + child, e.g.
  `categories: [math, complex-analysis]`.
- `scripts/check-workflow.sh` **fails the deploy** if any post declares a category
  missing from the tree (also checks cite-key resolution, bib non-mixing, `.nojekyll`).
- First run already caught `complex-analysis` missing and it was added under **Math**.

### Other options (choose later)

**Option B — pure build-time classifier.** A Jekyll generator / script that derives
categories mechanically from tags or keywords at build time. More automated, but risks
silent misclassification and conflicts with the "LLM-driven, not rule-based" preference.
Revisit only if the post volume makes manual/assisted classification a bottleneck.

**Possible additions:** an embedding-based "suggest sector" step in the `/write/`
studio; auto-generating the upper-branch when a child is added to a not-yet-existing
parent.

---

## How to run the guard

```bash
bash scripts/check-workflow.sh   # exit 0 = clean, 1 = violations
```

Wire it into CI or a pre-push hook to make the rules enforced, not just documented.
