---
layout: post
title: "Who moves first? A quantum lead–lag chain measured end to end, and the crash signal that wasn't"
date: 2026-10-02 09:00:00+0900
description: "A vertical on my ONE CHAIN v15 report. A 7-qubit circuit judges which of two assets moves first; the judgments become one ranking plus cycles; four leaders are picked; then the same three questions are asked of real industry data, and whether rotation stopping signals a crash. Measurement error is tracked through every step. The circuit only matches the classical score it imitates, the relation carries no next-day information, and the crash signal is not confirmed — one earlier claim is retracted."
tags: lead-lag quantum-computing hodgerank bradley-terry measurement-error crash-prediction vertical
categories: [physics, quantum-computing, math, probability-finance, finance]
related:
  - slug: joint-tail-structure
    note: "the crash target this chain should have used — joint crash days rather than an index drawdown"
  - slug: higher-order-quantum-risk
    note: "the same readout principle: the budget is set by the decision, not by the estimate"
related_posts: false
toc:
  sidebar: left
---

> Tone: professor-cautious — this post is mostly negative results and one retraction,
> and each claim is stated with the condition under which it holds. Condensed from my
> 31,000-word Korean report (ONE CHAIN v15, 24 Sep 2026); every number is the report's.
> The parts of that report on joint crashes and event complexes are covered in the two
> related posts and are left out here.

> **Original.** "이 보고서의 본문은 한 가지 대상만 따라간다. 어떤 자산이 먼저 움직이고
> 어떤 자산이 따라가는가, 즉 선행–후행 관계다." — the report's opening summary.
>
> **Essence.** One relation — which asset moves first — is judged by a quantum circuit,
> read with a finite number of shots, folded into a single ranking plus cycles, and used to
> pick leaders. How measurement error travels through each of those steps can be computed,
> and the simulations match the computation. What the chain does not deliver is the
> finance: on real industries the relation predicts nothing about tomorrow, and "rotation
> stopping before a crash" does not beat plain volatility.

{% include figure.liquid path="assets/img/lead-lag/error-through-chain.png" class="img-fluid rounded z-depth-1" caption="Left: how measurement error travels along the chain as shots per circuit M grow from 16 to 1,024 — pair judgments that flip (③, synthetic), rank agreement τ with the reference (④), probability of picking the same four leaders (⑤ synthetic, ⑥ real industries), and measured-vs-true cycle energy (⑦, real). Right: the auxiliary real-data strategy return with the 95% range of random picks (grey). Original report figure, Korean labels." %}

---

# DIRECT — what the report found (locked)

## 1. The question

If a quantum circuit can tell which of two industries tends to move first, does that help
you see a crash coming?

For a pair $(A, B)$ the circuit is run in both orders and measured in the Z basis; the
**relation** is half the difference of the two expectations,

$$
r_{AB} = \tfrac12\big(\langle Z\rangle_{AB} - \langle Z\rangle_{BA}\big) \in [-1, 1],
$$

positive when $A$ leads. Across 12 assets there are 66 such numbers, one per edge of a
complete graph. A combinatorial Hodge decomposition
{% cite jiang2011hodgerank --file references %} splits that edge flow into a **gradient**
part — differences of a single score $s$, i.e. a ranking — and a **cyclic** part that no
ranking can express ($A$ leads $B$, $B$ leads $C$, $C$ leads $A$):

$$
r = \operatorname{grad} s + r_{\text{cyc}}, \qquad
\text{cycle energy} = \frac{\lVert r_{\text{cyc}}\rVert^2}{\lVert r\rVert^2}.
$$

The hypothesis under test: sector rotation shows up as cycles, and when rotation stops,
a crash follows.

## 2. One line

Measurement error moves through every step at a rate you can compute in advance; but on
real data the lead–lag relation carries no next-day information, and the
rotation-stopping crash signal is not confirmed.

## 3. How it works — five synthetic steps, then real data

**① A world where the answer is known.** Bennett et al.'s generator
{% cite bennett2022leadlag --file references %}: 12 assets × 64 days, three groups of four
that react to a common factor with different lags. Thirty worlds — 12 to train, 6 to
validate, 12 to test.

**② Pair judgment (RQ1).** Each pair is described by seven lagged-correlation features
(lead-minus-lag differences of raw returns at lags 1–5, plus squared and cosine-transformed
returns at lag 1) and fed to a **7-qubit circuit with 42 angles**, trained once on the
synthetic worlds against a classical lead score (distance-correlation based) and then
frozen. On 576 cross-group test pairs it gets the direction right **71.9%** of the time —
better than a classical tree on the same seven features (61.8%), but **not better than
the classical score it was trained to imitate (71.0%)**.

**③ Finite measurement (RQ2).** With $M$ shots per circuit, a judgment can flip relative
to the circuit's own exact value. At $M = 16$, **32.5%** of pair judgments flip; at
$M = 1{,}024$, **5.3%**. Direction accuracy matches the binomial calculation within
0.2 percentage points — the error is fully explained by shot noise.

**④ One ranking plus cycles (RQ3).** Folding the 66 judgments into a global score, the
Hodge ranking and a Bradley–Terry fit {% cite bradley1952rank --file references %}
{% cite hunter2004mm --file references %} agree almost perfectly (Kendall τ ≥ 0.994).
Agreement with the reference ranking rises from **τ = 0.55** at $M = 16$ to **0.91** at
$M = 1{,}024$.

**⑤ The decision.** Pick the four leading assets. The probability of picking the same four
as the reference rises from **29.8%** to **86.7%**. A sequential rule — "keep measuring
until the pick stops changing" — does **6.7 points worse** than a fixed budget of the same
size. Stability of the pick is not the same thing as correctness.

**⑥ Real industries.** The frozen circuit (never retrained on real data) is applied to Ken
French's 12 industries {% cite french2026datalibrary --file references %}, recomputed on
64-day windows every 21 trading days. Its relation sign agrees with the classical 1-day
lagged correlation **70.2%** of the time, but using the leaders to call the laggards'
next-day direction is right **50.0%** of the time. More shots still stabilise the pick
(10.9% → 75.2% agreement with the infinite-shot pick), and the structure is visible —
7.1% of triangles are cyclic and cycle energy is **28%** — but the strategy built on it
returns **−2.9% a year**, $p = 0.37$ against 2,000 random leader–lagger picks.

**⑦ Rotation stopping → crash.** The rotation measure finally used, **M7**, standardises
each day's industry returns across the cross-section and sums the antisymmetric products
at lags 1–5 (the root mean square of the upper-triangle entries). The signal is its decline
over four 5-day steps, $M7(t-20) - M7(t)$. The target: the 12-industry equal-weight index
falls 10% or more within the next 21 trading days. Evaluated at 1,304 dates in 2000–2025
(53 positive, overlapping windows), with 2,000 circular block-bootstrap resamples
{% cite kunsch1989bootstrap --file references %}:

- **M7 decline:** AUC **0.544** [0.436, 0.708] on 12 industries, **0.569**
  [0.444, 0.721] on 49. Both intervals include 0.5.
- **Plain volatility** of the same index: **0.710** [0.534, 0.843].
- Two "regime memory" methods (nearest past windows by classical features, or by a
  density-matrix distance) were _worse_ than volatility on 49 industries: AUC differences
  −0.159 [−0.298, −0.054] and −0.166 [−0.292, −0.024].

**A retraction.** An earlier version of the report read a different rotation measure (M3)
as "the weaker the rotation, the more likely a crash (AUC 0.63) — rotation stopping looks
like collapse". A synthetic check of ten rotation measures showed M3 does not measure
rotation at all (M7 was the best of the ten there, AUC 0.994 at amplitude 0.5). **That
interpretation is withdrawn.**

{% include figure.liquid path="assets/img/lead-lag/crash-auc-12-vs-49.png" class="img-fluid rounded z-depth-1" caption="Left: AUC and 95% block-bootstrap intervals for the same 21-day crash target, 12 vs 49 industries — M7 weakening, classical memory, density-matrix (HS) memory, and plain volatility. Right: share of 64-day windows with permutation p ≤ 0.05 (199 permutations), daily shuffle vs 5-day blocks; the dashed line is the 5% expected by chance. Figure from the report." %}

## 4. The table — the whole chain, step by step

| Step                                  | The question                                               | Result                                                                                                                                          | Verdict                              |
| ------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| ① Synthetic market                    | Build a world with a known answer                          | 30 worlds, 12 assets × 64 days, three lagged groups                                                                                             | design                               |
| ② Pair judgment (RQ1)                 | From past returns alone, which of two assets leads?        | 71.9% on 576 pairs; classical tree 61.8%; imitated classical score 71.0%                                                                        | no better than the score it imitates |
| ③ Finite measurement (RQ2)            | How much do $M$ shots shake the judgment?                  | flips 32.5% ($M$=16) → 5.3% ($M$=1,024); within 0.2 pp of the binomial                                                                          | confirmed                            |
| ④ Global ranking (RQ3)                | Fold 66 judgments into one ranking plus cycles             | Hodge vs Bradley–Terry τ ≥ 0.994; vs reference τ 0.55 → 0.91                                                                                    | confirmed                            |
| ⑤ Decision                            | How sensitive is picking 4 leaders to $M$?                 | same 4 as reference 29.8% → 86.7%; stop-when-stable rule 6.7 pp worse than fixed $M$                                                            | sequential rule: negative            |
| ⑥ Real industries                     | Do the same three answers hold on real data?               | sign agrees with lag correlation 70.2%, next-day direction 50.0%; pick stability 10.9% → 75.2%; cycle energy 28%; −2.9%/yr, p = 0.37            | no predictive information            |
| ⑦ Rotation stops → crash              | Does weakening rotation precede a 10% fall within 21 days? | M7 AUC 0.544 (12) / 0.569 (49), intervals include 0.5; volatility 0.710                                                                         | not confirmed                        |
| ⑧ Tracking portfolio                  | Track the 12-industry index with 4 industries              | tracking error 3.8%/yr (4.3% high-volatility, 3.3% otherwise); no-trade band turnover 1.63 → 0.29/yr; RMT cleaning +0.30 pp worse               | RMT hypothesis: negative             |
| ⑨ Regime risk by amplitude estimation | Where does the error in its 21-day tail risk come from?    | VaR95 7.3% overall, 8.4% low-cycle-energy, 9.0% high-volatility; estimation error 0, all error from binning (0.36 pp at 64 bins, 3.18 pp at 16) | ideal sampler only                   |

## 5. Strengths and weaknesses

**Strengths.**

- **A complete error budget.** The same circuit and readout rule run through every step,
  so the cost of finite shots is measured at each stage — pair (32.5% → 5.3% flips),
  ranking (τ 0.55 → 0.91), decision (29.8% → 86.7%) — and the first two match the binomial
  calculation.
- **Two ranking methods, one answer.** Hodge and Bradley–Terry agree (τ ≥ 0.994), so the
  ranking is not an artefact of the decomposition chosen.
- **Pre-fixed comparisons.** The crash test fixed M7, the decline window, the target and
  the bootstrap before running, and reported the baseline that beat it.
- **The tail-risk step locates its error.** With an ideal sampler, iterative amplitude
  estimation {% cite grinko2021iqae --file references %} contributes no VaR error; all of it
  comes from discretising the loss distribution.

**Weaknesses.**

- **The circuit adds nothing over its teacher.** 71.9% vs 71.0% for the classical score it
  was trained to imitate.
- **Never retrained on real data**, and no next-day information there (50.0%).
- **The crash signal is unconfirmed**, not disproved — intervals include 0.5, and the
  permutation tests (4.83% and 4.75% of windows at $p \le 0.05$, 199 permutations) sit at
  the 5% chance level.
- **The 2000–2025 evaluation period had been looked at in other experiments**, so it is not
  an untouched confirmation. An off-by-one in the original code counted a 22-day window;
  correcting it to 21 days moved the positives from 56 to 53.
- **Not tested:** transaction costs, other lags, weekly horizons, data loading into the
  circuit, hardware time and noise.
- **Random-matrix cleaning** of the covariance {% cite plerou2000rmt --file references %}
  made tracking worse at this small scale (12 industries).

## 6. What to compare next

**Plain volatility (AUC 0.710) is the bar.** Any crash signal from this chain has to beat it
on the same target before anything else. And the target itself should change: an index
drawdown mixes many paths to a loss, whereas the joint crash day studied in the
[joint-tail post]({{ '/blog/2026/joint-tail-structure/' | relative_url }}) is exactly the
event a connectedness measure {% cite billio2012connectedness --file references %} or a
topological crash indicator {% cite gidea2018crashes --file references %} claims to
anticipate. The comparison that decides it: M7 decline, volatility, and the joint-tail
model's $P(K \ge 3)$, scored on the same days.

---

# INDIRECT — my extensions (revisable; dated edits go below)

- **Daily industry lead–lag may simply be priced in.** Cross-autocorrelation and lead–lag
  effects are documented mostly between size portfolios
  {% cite lo1990contrarian --file references %} and within industries, with information
  diffusing slowly to smaller firms {% cite hou2007industry --file references %}. Between
  value-weighted _industry_ portfolios at a one-day horizon there may be little left to
  find — which would explain 70.2% agreement with lagged correlation but 50.0% next-day
  accuracy. Weekly horizons and within-industry size splits are where to look.
- **The readout budget is set by the decision.** Here the pick stabilises long before it
  becomes useful; in the joint-tail study, alarm flips were driven by the distance to the
  threshold. The same rule in both: count shots against the decision boundary, not against
  the estimate.
- **A teacher-matching circuit cannot beat its teacher.** Training against a classical score
  caps the circuit at that score's accuracy. A fair test of whether the quantum model adds
  anything needs a target the teacher does not already define — e.g. training directly on
  the known synthetic lags.

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
