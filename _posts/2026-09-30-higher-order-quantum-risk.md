---
layout: post
title: "Pair statistics can't see the triangle: preserving higher-order risk in a quantum pipeline"
date: 2026-09-30 21:00:00+0900
description: "A vertical on my paper 'Preserving Higher Order Risk Information in Quantum Financial Analysis'. Two three-asset markets share every single and pairwise downside statistic, yet one has a triple-crash face its twin lacks. What compression before computation destroys, how many samples a probability, a complex and a Betti number each need, and how to compare classical samples with coherent oracle calls fairly. No quantum advantage claimed."
tags: quantum-computing topological-data-analysis simplicial-complex hodge-theory amplitude-amplification tail-risk vertical
categories: [physics, quantum-computing, math, geometry-topology, topology, probability-finance, finance]
related:
  - slug: joint-tail-structure
    note: "the empirical companion — the same pairs-can't-see-triples fact, measured on a century of industry crashes"
related_posts: false
toc:
  sidebar: left
---

> Tone: best-paper-ready — exact statements, every number recomputable. This post
> condenses my paper draft (Sep 2026); the two figures are the paper's own.

> **Original.** "We study this distinction using a three-asset distribution family whose
> individual downside probabilities and pairwise joint downside probabilities remain fixed
> while the probability of all three assets falling ranges from zero to one percent." —
> the paper's abstract.
>
> **Essence.** A quantum pipeline that compresses market data into pairwise statistics
> before computing risk or topology has already decided what any later algorithm can
> recover — no amount of classical or quantum accuracy restores a triple-crash probability
> that was never stored. Once that information is kept, a probability, the full event
> complex, and a single Betti number each need very different sample budgets. And a
> fair comparison must count samples, oracle calls, loading and training in the same
> ledger.

{% include figure.liquid path="assets/img/higher-order-risk/event-complexes.png" class="img-fluid rounded z-depth-1" caption="(a) Both markets have identical singleton (0.10) and pairwise (0.01) downside probabilities. (b) Market A, triple probability 0: at threshold 0.005 its event complex is a hollow triangle, β₁ = 1. (c) Market B, triple probability 0.01: the face is filled, β₁ = 0. A clique completion of the pair graph fills both triangles and erases the difference. Figure from the paper." %}

---

# DIRECT — what the paper shows (locked)

## 1. The question

Three assets, each falling sharply in 10% of periods, each pair falling together in 1%.
The [joint-tail post]({{ '/blog/2026/joint-tail-structure/' | relative_url }}) showed
these six numbers leave the triple-fall probability $t$ free in $[0,\,0.01]$. This paper
asks what that gap does to a **quantum** pipeline that builds topology.

Define the **event complex** at threshold $\tau$: a set of assets $S$ is a simplex when
the probability that all of $S$ fall together is at least $\tau$,

$$
K_\tau = \big\{\, S \neq \varnothing : P(\text{all } i \in S \text{ fall}) \ge \tau \,\big\}.
$$

It is downward closed (if a trio falls together, each pair does), so it is a simplicial
complex. At $\tau = 0.005$:

- **Market A** ($t = 0$): three vertices, three edges, **no face** — a hollow triangle,
  first Betti number $\beta_1 = 1$.
- **Market B** ($t = 0.01$): the face is present — a filled triangle, $\beta_1 = 0$.

Now build the complex the usual way, as the clique complex of the pairwise graph. Both
markets have all three edges, so both triangles get filled and both give $\beta_1 = 0$.
**Any topology algorithm, classical or quantum, that receives only the pair graph cannot
tell A from B.** And note the direction: B is the riskier market, yet it has the
_smaller_ Betti number — more holes does not mean more risk.

## 2. One line

What you compress before computing decides what any algorithm can recover; once the
information is kept, a probability, the complex, and one Betti number need very
different sample budgets.

## 3. How it works, in four steps

### 3.1 Identification: the loss is total, not approximate

For the whole family, the retained summaries (every singleton and pair probability, the
portfolio means and variances, the Z and ZZ expectations) are **identical** for every
$t \in [0, 0.01]$, and that interval is sharp. Two consequences (the paper's
Proposition 1):

- Any procedure fed only those summaries — deterministic, randomized or quantum — has a
  worst-case absolute error of at least **0.005** on $t$ (the midpoint 0.005 achieves it).
- Asked to decide "A or B" with equal priors, its error is at least **one half**.

In qubit language, writing $z_i = 1 - 2b_i$, the event projector expands as

$$
\Pi_{111} = \tfrac18\big(1 - Z_1 - Z_2 - Z_3 + Z_1Z_2 + Z_1Z_3 + Z_2Z_3 - Z_1Z_2Z_3\big),
$$

so pair statistics omit exactly one term, $\langle Z_1 Z_2 Z_3 \rangle$. Measuring in the
Z basis does not cause the loss: the full bitstring contains it. The loss happens when
the stored statistics throw it away.

### 3.2 Sampling: three goals, three budgets

Estimate all seven subset probabilities from the same $N$ joint samples. A simplex's
membership can flip only if its estimate moves past $\tau$, so what matters is the
**margin** $m$ between each probability and the threshold. Hoeffding's inequality
{% cite hoeffding1963inequalities --file references %} on each of the $|F| = 7$ events
plus a union bound gives a sufficient condition for recovering the whole complex with
probability $1 - \delta$:

$$
N \;\ge\; \frac{\ln(2|F|/\delta)}{2m^2}
= \frac{\ln(2 \cdot 7 / 0.05)}{2 \cdot 0.005^2}
= 112{,}695.8 \;\Rightarrow\; 112{,}696 .
$$

That is conservative. Simulation (500 independent sampling streams per market, nested
budgets) shows how differently the three goals behave:

- **Market B, 128 samples:** the Betti number matches in **100%** of runs, yet the whole
  complex is right in only **71.8%** (95% Wilson interval 67.7–75.6%). The 100% is built
  in: in B every pair event coincides with the triple event, so every empirical complex is
  either edgeless or fully filled, and both have $\beta_1 = 0$. Exact recovery needs at
  least one triple in the sample: $1 - 0.99^{128} = 0.7237$ — matching the simulation.
- **Market A, 128 samples:** 35.2% (31.1–39.5%) for both.
- **2,048 samples:** complex recovery 97.0% (A) and 99.4% (B).
- **Triple probability within ±0.2 percentage points (B):** the first budget on the
  power-of-two grid to reach 95% is **16,384**.

A matching Betti number is not a recovered complex, and neither is an accurate
probability. Ask all three questions separately.

### 3.3 Detection: count the right resource

The decision "is this market A or B?" can be answered under very different kinds of
access. Classically, with $N$ independent joint samples:

- **At least one triple crash seen.** Zero false positives; power $1 - 0.99^N \ge 0.95$
  needs $N \ge \ln 0.05 / \ln 0.99 = 298.1$, so **299** samples.
- **Full-bitstring likelihood-ratio test.** Bitstrings with exactly two ones occur only
  in A, $111$ only in B, and among shared outcomes the singleton count is informative. Using
  all of it reaches the same power with **90** samples (89 if the boundary is randomized).

Coherently, with an oracle that prepares the market's state and its inverse (without
revealing which market it is), mark the event and amplify
{% cite brassard2002amplitude --file references %}. With $\theta = \arcsin\sqrt{0.01}$,
after $k$ iterations the event probability is $\sin^2\big((2k+1)\theta\big)$; at $k = 7$
that is $\sin^2(15\theta) = 0.99534$ under B and exactly 0 under A.

### 3.4 Hodge: a structural number without reading every edge

A separate control asks for a _directional_ quantity: the Hodge decomposition of a flow
on the triangle's edges {% cite jiang2011hodgerank --file references %}. Filling the face
moves the cyclic component of a flow from **harmonic** to **curl**, with its energy
unchanged. Implemented as a coherent dilation, all **18** probabilities (three flows × two
complexes × three projectors) match the classical projections to numerical precision —
a final scalar read without outputting every edge value, in the spirit of quantum
HodgeRank {% cite leditto2025hodgerank --file references %}. A second control shows that
turning a learned expectation into a signed amplitude (the negative edge survives as a
negative amplitude) works by coherent conditioning that succeeds with probability
**0.28**, so about 1/0.28 ≈ 3.6 attempts per accepted outcome.

## 4. The table — detection power by access model

| Method                            | Resource used                         | Power under B | False positives under A |
| --------------------------------- | ------------------------------------- | ------------: | ----------------------: |
| At least one triple crash seen    | 299 independent samples               |      0.950464 |                       0 |
| Deterministic full-bitstring test | 90 independent samples                |      0.953690 |                0.048159 |
| Randomized full-bitstring test    | 89 independent samples                |      0.954013 |                0.050000 |
| Coherent amplification, $k = 7$   | 15 state-preparation or inverse calls |      0.995344 |                       0 |
| Explicit probability-table access | 0 samples                             |             1 |                       0 |

The coherent row looks best, but a **sample** and a **coherent preparation call** are
different resources with different costs, which is why the paper plots them on separate
axes (figure below). The last row is the warning: in this toy the simulator is handed the
probability table, and anyone holding the table has already solved the problem.

{% include figure.liquid path="assets/img/higher-order-risk/detection-access.png" class="img-fluid rounded z-depth-1" caption="(a) Exact classical power under market B against the number of independent full rows: at-least-one exceedance vs the deterministic and randomized likelihood-ratio tests (size ≤ 0.05). (b) Exact event-flag probability under assumed coherent oracle access, against state-preparation or inverse calls per run; market A stays at 0. The axes differ on purpose — the resources are not interchangeable. Figure from the paper." %}

## 5. Strengths and weaknesses

**Strengths.**

- The failure is **exact**: the lost quantity, its identified interval and the minimum
  error are all closed-form, so no downstream method can be blamed or credited.
- The three endpoints (probability, complex, Betti number) are separated, with a
  sufficient bound and exact simulation probabilities that agree with each other.
- The classical baseline is **strong**: the full-bitstring likelihood-ratio test uses 90
  samples, not the naive 299, so the coherent method is not compared against a straw man.

**Weaknesses (stated in the paper).**

- **A three-asset toy.** The quantum circuits are dense explicit unitaries — they verify
  identities, they are not scalable loading, block encodings or QSVT implementations.
- **The oracle is assumed.** Coherent detection needs a state-preparation oracle that
  does not reveal which market it prepares. Quantum risk analysis by amplitude
  estimation {% cite woerner2019quantumrisk --file references %} assumes the distribution
  can be loaded; loading that scales with the number of scenarios can dominate a
  particular implementation, so any speedup needs the full ledger checked
  {% cite aaronson2015fineprint --file references %}.
- **Easy vs hard oracles.** Checking whether a given bitstring is $111$ is easy to do
  reversibly; deciding whether a subset belongs to the complex depends on an _unknown
  probability_, and implementing that coherently needs estimation, a margin promise and
  uncomputation. Substituting the first for the second would hide the main difficulty.
- **Training costs add up fast.** An illustrative quantum-neural-network run with
  parameter-shift gradients costs **20,889,600** shots; SPSA under the same batch
  convention costs **491,520**. Neither count implies equal accuracy.
- **Real data is descriptive only.** On NoDur, Manufacturing and Energy (Ken French 12
  industries {% cite french2026datalibrary --file references %}, 2010–2025), with
  thresholds fixed on 2010–2017 and 96 overlapping 252-day windows over 2018–2025, the
  empirical triple-fall frequency differs from the fitted pairwise maximum-entropy model's
  prediction by **0.33 percentage points** on average. Overlapping windows and repeated
  examination rule out calling this a predictive or significant finding.
- **No quantum advantage is claimed.**

## 6. What to compare next

The paper's §9 lists what a real quantum topology experiment must report: asset count,
homology degree, number of valid simplices and the probability of preparing one, access
to boundary operators, spectral gap, membership margin, precision, and the exact output
(an integer Betti number is not the same target as a normalized one). The competitors are
the quantum TDA algorithms {% cite lloyd2016qtda --file references %}, their resource
analyses {% cite berry2024qtdaprospects --file references %}, and — the comparison that
decides it — the simple classical Betti estimator of
{% cite apers2023betti --file references %}, asked for the same output at the same
precision. Classical shadows {% cite huang2020shadows --file references %} are the fair
baseline when many different observables are read from one state.

---

# INDIRECT — my extensions (revisable; dated edits go below)

- **The filled triangle at scale is the common shock.** In the joint-tail study, pairwise
  links under-produce many-industry crash days across 49 industries by 2–31× while a
  single common factor reproduces them. That is this paper's market B, grown up: the
  information pairs discard is exactly the higher-order face a common shock creates.
- **When could β₁ be a risk signal?** Here the riskier market has _fewer_ holes, so β₁ is
  not monotone in risk. A useful signal would have to be read relative to a baseline —
  e.g. a hole appearing where a pairwise model predicts a filled face — rather than as a
  raw count.
- **Where the sampling bound bites.** At $m = 0.005$ the bound asks for ~113k joint
  samples: about 450 years of daily data. For real markets the margin, not the algorithm,
  decides whether the complex is recoverable at all — and more quantum shots cannot create
  more market history.

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
