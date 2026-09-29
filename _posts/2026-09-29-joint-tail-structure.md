---
layout: post
title: "When many industries crash together: the joint tail that pairwise correlations miss"
date: 2026-09-29 21:00:00+0900
description: "A vertical on my own study of joint industry crashes. Pairwise statistics cannot pin down how often three or more industries crash on the same day, so the object is the full joint distribution of a day's crash pattern: learned from a century of Ken French industry data, scored against eleven alternative models on sealed holdout periods, and read out of a quantum state with a measured shot cost. Negative results kept."
tags: tail-risk contagion maximum-entropy joint-distribution quantum-computing brier-score vertical
categories: [math, probability-finance, finance, physics, quantum-computing]
related:
  - slug: tri-system-risk-model
    note: "the Monte Carlo survey this sits under — here the risk integral is a joint crash probability, and the reading cost is measured shot by shot"
related_posts: false
toc:
  sidebar: left
---

> Tone: econometric — joint distributions, out-of-sample Brier scores, pre-registered
> holdouts. This post condenses my own 28,000-word Korean research report (25 Sep 2026)
> into English; every number below is from that report, and the two figures are its
> original (Korean-labelled) figures.

> **Original.** "여러 업종이 한꺼번에 무너지는 일을 두 업종씩의 관계로는 보이지 않는
> 공동분포로 다루고, 그 분포를 과거 기록으로 배워 예측하며, 양자 상태로 담았을 때
> 필요한 확률을 얼마나 적은 측정으로 읽는지 잰다." — the report's own one-line summary
> ("한 줄로").
>
> **Essence.** When several industries crash on the same day, the event lives in the
> joint distribution of the day's crash pattern, and pairwise statistics provably cannot
> determine it. Learning that distribution does not beat a well-fitted pairwise model at
> forecasting tomorrow, but it exposes what pairs cannot see: a single common shock that
> reproduces many-industry crash days across 49 industries where pairwise links fall
> short by 2–31×. Loaded into a quantum state, the one probability that matters can be read
> by direct measurement, with no need to reconstruct the state.

{% include figure.liquid path="assets/img/joint-tail/overview.png" class="img-fluid rounded z-depth-1" caption="The study at a glance (original figure, Korean labels). ① The daily crash table (12 industries, dark cell = crash). ② With two industries, a 2×2 table says everything. ③ From three industries on, two markets can share every single and pairwise statistic yet differ in the triple crash (A: 0, B: 1%). ④ Learn the joint distribution and forecast tomorrow — no model beat the pairwise one. ⑤ In 49 industries a common shock appears that pairs miss. ⑥ Read one probability from the quantum state by direct Z measurement." %}

---

# DIRECT — what the study found (locked)

## 1. The question

Suppose you know, for every pair of industries, how often each crashes and how often the
two crash together. Do you know how often **three** crash together?

No. Take three industries, each crashing with probability 0.10, each pair crashing
together with probability 0.01. Write $t = P(111)$ for the triple crash. Every other cell
of the $2^3$ table is then forced:

$$
P(110) = P(101) = P(011) = 0.01 - t,\qquad
P(100) = P(010) = P(001) = 0.08 + t,\qquad
P(000) = 0.73 - t .
$$

All eight cells are valid probabilities for any $t \in [0,\, 0.01]$. So a market with
$t = 0$ and a market with $t = 0.01$ have **identical** single and pairwise statistics,
and one of them never sees a triple crash while the other sees one day in a hundred. In
spin language ($z_i = 1 - 2b_i$), the missing information is exactly one number, the
third-order correlation $\langle Z_1 Z_2 Z_3\rangle$.

This is why the object of study is the joint distribution over a day's crash pattern
$b = (b_1,\dots,b_N) \in \{0,1\}^N$, written in maximum-entropy form

$$
P(b) \;\propto\; \exp\!\Big(\sum_i h_i b_i \;+\; \sum_{i<j} J_{ij}\, b_i b_j \;+\; \sum_{i<j<k} \kappa_{ijk}\, b_i b_j b_k\Big),
$$

with lag terms added for forecasting (§3.3). The target is $P(K \ge 3)$, where
$K = \sum_i b_i$ is the number of industries crashing that day. Counting co-crashing
markets is the coexceedance idea of {% cite bae2003coexceedance --file references %};
the pairwise-only version of this model is the maximum-entropy (Ising) baseline that
{% cite schneidman2006weak --file references %} and
{% cite bury2013maxent --file references %} found captures most of a system's state
structure.

## 2. One line

Treat a crash day as one of $2^{12} = 4{,}096$ patterns, learn the probability of each,
forecast tomorrow's chance that three or more industries crash, and measure how few
quantum measurements it takes to read that one probability.

## 3. How it works, in four steps

### 3.1 Record: one bit per industry per day

Data: Ken French's daily industry portfolios (12 industries; 49 for the scale test),
1926–2026 {% cite french2026datalibrary --file references %}, plus nine sector ETFs.
Industry $i$ **crashes** on day $t$ ($b_{i,t} = 1$) when its return is as bad as the worst
5% of its previous 252 trading days. The threshold uses only data up to the day before, so
nothing leaks from the future.

Every forecast is trained on the previous 504 trading days (about two years) and refitted
every 21 days. Two periods were sealed before scoring — the specification was fixed and
hashed (SHA-256) first, and the periods were never used in any analysis: **1970–1989**
(French 12, 5,011 days, 408 days with $K \ge 3$) and **2026, January to July/August**
(French 12 and ETF 9, 145 and 151 days, 15 and 8 such days). **2018–2025** (2,011 days;
153 and 130 such days) was the development period and was looked at many times.

### 3.2 Fit: what a pair term means, with real numbers

Take Manufacturing and Chemicals in the 2016–2017 training window (504 days). Both were
calm on 478 days; only Chemicals crashed on 7; only Manufacturing on 5; **both on 14**.
Manufacturing crashed on 19 days (3.8%), Chemicals on 21 (4.2%). If they moved
independently, both would crash on $504 \times 0.038 \times 0.042 \approx 0.8$ days. They
did on **14** — a lift of 17.7, a raw log-odds ratio of
$\ln\frac{478 \cdot 14}{7 \cdot 5} = 5.25$.

The pair term $J_{ij}$ is the _conditional_ version: holding every other industry fixed,
a crash in $j$ multiplies the odds of a crash in $i$ by $e^{J_{ij}}$. Fitted jointly over
all 66 pairs, Manufacturing–Chemicals gets $J = 2.30$ (odds × 9.9) — much less than the raw
5.25, because other industries' crashes explain part of the co-movement. The median pair
(Energy–Retail) has $J = 0.64$ (odds × 1.9), and some pairs are negative (minimum −1.25).
The single terms average $h = -4.06$: with every other industry calm, a given industry
crashes on about 1.7% of days. (Full fitted-parameter table in the appendix.)

### 3.3 Forecast: twelve models, same days, same score

The target is tomorrow's $P(K \ge 3)$, scored by the Brier score (mean squared error of
the probability) on exactly the same days for every model. Twelve models compete:

- **The formula's family (6):** independent; pairwise ($h, J$) — the baseline; pairwise +
  triples ($\kappa$); plus three ways of adding yesterday — each industry's own lag, a
  market-wide lag (yesterday's crash share $K/N$), and industry-to-industry lags $A_{ij}$.
- **Outside the formula (3):** a pair-copula, and two quantum Born machines (a 12-qubit
  RY + CZ ladder, and a fully connected circuit) trained by KL divergence
  {% cite coyle2021quantum --file references %}.
- **A finance standard (1):** a single common factor — no direct links between
  industries, every industry reacting to one unseen market shock
  {% cite vasicek2002distribution --file references %}.
- **Pattern learners (2):** logistic regression and gradient boosting.

### 3.4 Read: the probability as a quantum measurement

Load a day's forecast distribution $p_t(b)$ into an $N$-qubit state
$|\psi_t\rangle = \sum_b \sqrt{p_t(b)}\,|b\rangle$. Measuring every qubit in the Z basis
returns bit string $b$ with probability $p_t(b)$ — so $P(K \ge 3)$ is read by simply
counting shots with three or more ones. The question is how many shots, and whether
anything more (full state tomography) is needed.

## 4. The table — twelve models, five evaluation periods

Brier score difference from the pairwise model, × 1000 (negative = better than pairwise).
`*` = the 95% interval excludes zero.

| Model                         | 1970–1989 French 12 (holdout) | 2018–2025 French 12 | 2018–2025 ETF 9 | 2026 French 12 (holdout) | 2026 ETF 9 (holdout) |
| ----------------------------- | ----------------------------: | ------------------: | --------------: | -----------------------: | -------------------: |
| **Pairwise (baseline Brier)** |                    **0.0743** |          **0.0713** |      **0.0613** |               **0.0936** |           **0.0503** |
| Independent                   |                        +2.2\* |              +2.0\* |          +2.1\* |                   +4.5\* |                 +1.4 |
| Pairwise + triples            |                          −0.0 |                +0.0 |            +0.0 |                     +0.2 |                 +0.0 |
| Own lag                       |                          +0.2 |                −0.4 |            −0.7 |                   +2.1\* |               +1.8\* |
| Market lag                    |                          −0.6 |                −0.5 |            −0.6 |                   +1.0\* |                 +0.6 |
| Industry-to-industry lags     |                        +7.8\* |             +11.1\* |          +4.0\* |                  +23.3\* |               +4.0\* |
| Pair-copula                   |                          −0.2 |                +0.3 |            +0.1 |                     −0.8 |                 +0.2 |
| Born machine, ladder          |                       +32.4\* |             +23.5\* |          +3.8\* |                     +0.3 |                 +0.1 |
| Born machine, fully connected |                          +0.1 |                +0.1 |            −0.1 |                     −0.4 |                 +0.4 |
| Single common factor          |                          −0.1 |                +0.2 |            +0.0 |                     −0.6 |                 +0.2 |
| Logistic regression           |                        +2.9\* |              +4.3\* |            +3.6 |                   +5.6\* |                 +2.3 |
| Gradient boosting             |                        +5.8\* |              +4.8\* |          +7.1\* |                   +8.5\* |                 +3.9 |

**No model beat the pairwise model significantly in any period.** Knowing that industries
move together clearly helps (independent is worse in all five periods, significantly in four), but nothing
added on top of pairs — triples, lags, copulas, quantum circuits, a common factor, or
generic pattern learners — improved tomorrow's forecast.

{% include figure.liquid path="assets/img/joint-tail/benchmark.png" class="img-fluid rounded z-depth-1" caption="The same benchmark as the report drew it (original figure, Korean labels): rows are the twelve models, columns the five evaluation periods, cell = Brier difference × 1000 from the pairwise model with its rank; red = worse, blue = better, * = 95% interval excludes zero." %}

## 5. Strengths and weaknesses

### What the joint distribution does show

- **A common shock that pairs cannot build (49 industries).** Within training windows,
  take the probability that 10 or more of 49 industries crash on the same day. Across six
  windows, pairwise links under-produce those days by 2–31×, while one common shock
  reproduces them within 0.79–0.95×. In the 1986–1988 window (the 1987 crash) the data
  gives 0.105, the pairwise model 0.003 (31× short) and the single factor 0.111; in
  2007–2009 the three are 0.143, 0.066 and 0.171 (full table in the appendix). That is
  §1's principle showing up in data: what pairs miss is a shock that hits everyone at once.
  In 12 industries the two models forecast identically, because 45–76% of the crash
  structure is one market-wide direction and the models' pairwise co-crash probabilities
  correlate at 0.73–0.96; they separate only at scale.
- **Same-day scenarios, where counting runs thin.** "Given industries $i$ and $j$ crashed
  today, what is the chance two or more others crash too?" — $P(K \ge 4 \mid b_i = b_j = 1)$.
  The pairwise model beat the conditional frequency in 2018–2025 (French 12: Brier 0.048 vs
  0.052, difference −0.0042, 95% [−0.0104, −0.0007]) and again on the sealed 1970–1989
  holdout (0.034 vs 0.037, [−0.0034, −0.0013]), because it smooths conditions that occurred
  on only 12–13 training days using every pair's information.
- **Reading the probability is cheap; reconstructing the state is not needed.** On a
  3-qubit test state with $P(111) = 0.01$, at the same total of 270 preparations, direct Z
  measurement estimated the target with MSE $3.4 \times 10^{-5}$; full Pauli tomography
  with PSD projection had MSE $4.3 \times 10^{-4}$ — over 10× worse — and pulled the small
  tail probability up to 0.026 on average. Full reconstruction is only needed to verify
  phases and coherence (fidelity can be certified more cheaply anyway
  {% cite flammia2011direct --file references %}). On the real 2026 daily forecasts, 256
  direct shots raised the Brier score by only 0.3–0.4%, and 1,024 shots by 0.05–0.1%.

### What did not work, kept on purpose

- **Nothing beat pairs at forecasting (§4).** The joint distribution explains structure;
  it did not predict the next day better. Even the 49-industry common factor, which fits
  the crash structure far better, forecast the next half-year no better (Brier: factor
  0.043, pairwise 0.037, training frequency 0.040): after a crisis, frequencies revert.
  Capturing structure and predicting the next period are different tasks.
- **Triples were found only at chance level.** The selection step recovers a planted
  triple of realistic size (+0.3) in 504 days only 2.5% of the time — about chance. Adding
  triples lowered the 1970–1989 log loss slightly (−0.0064) but never improved Brier.
- **Lags hurt.** Yesterday-to-today terms between industries overfit in every period
  (+4.0 to +23.3). During crises, rebounds make "yesterday predicts today" wrong.
- **The ladder quantum circuit failed to learn** the training window (+32.4 on the
  1970–1989 holdout), unlike the currency-pair setting of
  {% cite coyle2021quantum --file references %}. The fully connected circuit merely tied.
- **2026 broke the scenario forecasts.** Days on which two industries crashed spread into
  wide crashes far less often than the past two years implied (realised 0.64 for French 12
  and 0.27 for ETF 9, against forecasts of 0.8–0.9). For ETF 9 the independent model was
  best. A regime shift, not noise.
- **Alarm decisions are expensive even when forecasts are cheap.** With the
  pre-registered alarm threshold (the training window's base rate of $K \ge 3$), 2026's
  forecasts sat only 0.004–0.0065 from it, so even 16,384 direct shots flipped 5.7% of French 12
  alarms. Amplitude estimation cut flips to 0–2.7% with 3–5× fewer calls — the distance to
  the decision boundary, not the forecast error, sets the shot budget. (That threshold turned
  out degenerate — it fired every day in 2026; the report's fix is a cost-based threshold
  $p^* = c_{FP}/(c_{FP} + c_{FN})$ {% cite elkan2001cost --file references %} with both costs
  set from training-window profit and loss.) No quantum advantage is
  claimed: $p_t$ was already computed classically, and state-preparation cost and
  hardware noise are not included.
- **Data caveats.** 2018–2025 was examined many times during development; ETF prices are a
  third-party copy; French portfolios are not tradable; intraday data (TAQ, futures) was
  not available.

Crash-time correlation measures are also known to be fragile — correlations rise
asymmetrically in down markets {% cite ang2002asymmetric --file references %}
{% cite longin2001extreme --file references %}, and correcting for volatility can make
apparent contagion vanish {% cite forbes2002nocontagion --file references %}. Counting
crash patterns directly sidesteps correlation, but not those regime effects.

## 6. What to compare next

A **common factor as the base, with pairwise links added on top**, and a factor whose
strength changes over time — aimed directly at a 2026-style regime shift. The comparison
that decides it is the §4 table re-run on the sealed periods, with the 49-industry
many-crash probabilities of §5 as the structural check.

---

# INDIRECT — my extensions (revisable; dated edits go below)

- **The single factor is Vasicek's credit model in disguise.** In
  {% cite vasicek2002distribution --file references %}, loans default when one systematic
  factor plus an idiosyncratic shock falls below a threshold; here industries "crash" the
  same way. That suggests borrowing the credit-risk toolkit directly — for instance the
  large-portfolio limit, which gives $P(K/N \ge x)$ in closed form, for the 49-industry
  case where exact enumeration of $2^{49}$ patterns is impossible.
- **What a real quantum cost estimate needs.** The reading costs above assume the state
  is already loaded. A fair resource count for 12 qubits must add the cost of preparing
  4,096 amplitudes and hardware noise — without that, "1,024 shots" is a lower bound, not a
  budget.
- **Ask a scenario question, not a forecasting one.** The joint distribution's clearest
  win was the same-day conditional ("given these two crashed, how bad does today get?").
  That is a stress-testing question, and it may be where this model belongs.

---

## Appendix

### Fitted parameters (2016–2017 window, French 12, 504 days)

Individual crash frequencies were 3.0–5.2% and $P(K \ge 3)$ was 4.8% in this window.

| Term                  | Meaning                                                             | Fitted value in this window                                                       |
| --------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| $h_i$ single          | log-odds that $i$ crashes when every other industry is calm         | mean −4.06 → about 1.7% a day                                                     |
| $J_{ij}$ pair         | a crash in $j$ multiplies $i$'s crash odds by $e^{J}$, others fixed | Manufacturing–Chemicals 2.30 (× 9.9); median pair 0.64 (× 1.9); min −1.25         |
| $\kappa_{ijk}$ triple | extra tendency to crash as a trio beyond what pairs predict         | Energy–Utilities–Other: 2 triple days vs 0.8 predicted → 1.72; a 0-day trio −1.02 |
| $c_i$ own lag         | yesterday's crash in $i$ multiplies today's odds by $e^{c}$         | −5.41 to 2.08 (only ~19 crash days per industry, so estimates are extreme)        |
| market lag            | yesterday's crash share $K/N$ shifts today's odds                   | −27.6 to 2.7                                                                      |

### 49 industries: probability that 10 or more crash on the same day (within training windows)

| Window                 | Data  | Pairwise model | Single factor | Data ÷ pairwise | Data ÷ factor |
| ---------------------- | ----- | -------------- | ------------- | --------------- | ------------- |
| 1986–1988 (1987 crash) | 0.105 | 0.003          | 0.111         | 31              | 0.95          |
| 1993–1994 (calm)       | 0.066 | 0.022          | 0.079         | 3.0             | 0.83          |
| 2005–2006 (calm)       | 0.069 | 0.020          | 0.080         | 3.5             | 0.86          |
| 2007–2009 (crisis)     | 0.143 | 0.066          | 0.171         | 2.2             | 0.83          |
| 2017–2018 (calm)       | 0.085 | 0.042          | 0.109         | 2.0             | 0.79          |
| 2019–2021 (pandemic)   | 0.075 | 0.016          | 0.090         | 4.6             | 0.84          |

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
