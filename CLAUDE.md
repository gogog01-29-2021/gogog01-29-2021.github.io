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

### Active article goal — 2026-05-31

Write `_posts/2026-05-31-vanishing-integral-five-lenses.md`: prove
$\int_0^{2\pi}\frac{1+2\cos t}{5+4\cos t}\,dt = 0$ and show *the same zero* from
**five named lenses**, each as a settled core + expandable open-thread tail:

1. **Elementary calculus** — Weierstrass $u=\tan(t/2)$ → $\int(\tfrac{1}{u^2+1}-\tfrac{3}{u^2+9})du=\pi-\pi$.
2. **Complex analysis** — $z=e^{it}$; interior residues $\Res_0=+\tfrac12$, $\Res_{-1/2}=-\tfrac12$ cancel.
3. **Number theory** — numerator $=\Phi_3$ (order-1 Dirichlet kernel); denominator palindromic, reciprocal roots $-\tfrac12,-2$; the integral $=2\pi(c_0+2c_1)=0$ on the Poisson-kernel Fourier coefficients.
4. **Algebraic topology** — winding numbers + de Rham class of a meromorphic 1-form; the cycle pairs to $0$.
5. **Green–Stokes** — residue theorem = Stokes with punctures; $\int_{\partial\Omega}\omega=\int_\Omega d\omega$.

(Naming all five explicitly is mandatory — "five lenses" alone is not specific
enough for a reader to know what the five are.)

Tone: **Math-compact body + Best-paper-ready statements (boxed lemmas) +
Professor-cautious open-threads.** References: included via `{% cite %}`.

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
