---
layout: post
title: "Monte Carlo for risk estimation: from sampling to quantum"
date: 2026-05-15 16:00:00+0900
description: A risk-analysis survey of how Monte Carlo turned risk into something estimable rather than guessed at — from the Metropolis–Ulam estimator through CVaR and rare-event variance reduction, then where amortized variational methods (VAE) and quantum amplitude estimation actually fit. Field-first; thirteen 5-field reference cards at the end.
tags: math quantum-computing risk finance
categories: [math, finance, probability]
related_posts: false
toc:
  sidebar: left
---

$$
\newcommand{\E}{\mathbb{E}}
\newcommand{\Risk}{\mathrm{Risk}}
$$

## The thesis, in risk terms

A risk model is only ever as good as the loss it can quantify. Strip away the
dynamics and the story and the question that remains is the same one:
*what is the expected — and tail — loss this system produces?* Stated that
plainly, risk modeling has a single structural problem. The loss functional
you actually care about is almost never available in closed form, and the
part you care about *most* — the tail, the rare adverse alignment, the flash
event — is exactly the part where closed-form approximations are least
trustworthy.

Monte Carlo is the response to that problem, and the history of risk
modeling is largely the history of taking it seriously. This survey runs
that history through a risk-analysis lens — *loss exposure*, not algorithms —
and then asks where two more recent answers fit: amortized variational
methods (VAE) and quantum amplitude estimation. Field first; my own work
makes no appearance.

## What a risk model must deliver

Before simulating anything, the object being estimated has to be a *coherent*
notion of risk. The axioms of {% cite artzner1999coherent --file references %}
fix what a risk measure must satisfy (monotonicity, sub-additivity, positive
homogeneity, translation invariance) and, in doing so, expose why variance
and plain value-at-risk mislead precisely in the tail. The operational
consequence is that a risk specification has to connect adaptation and
decisions to *realized loss exposure* — not to a convenient surrogate.

Once the tail is the quantity of interest, the relevant functional is a
conditional-tail object. {% cite rockafellar2000optimization --file references %}
made Conditional Value-at-Risk tractable as an optimization target: instead
of treating CVaR as a post-hoc diagnostic, they rewrote it as a convex
problem you can actually solve. That move is the unsung reason finance,
insurance, and a growing slice of ML uses CVaR rather than VaR as the
default tail metric — VaR tells you a threshold, CVaR tells you the
conditional loss past it, and only one of those survives optimization.

## Why the loss has to be simulated

If the loss integral were closeable, none of the simulation machinery would
exist. It generally is not, so the field estimates it. The estimator itself
originates with {% cite metropolis1949monte --file references %}: replace an
intractable expectation with a sample average and accept estimator variance
as the price of admission. The Markov-chain construction that made this
work in high-dimensional, dependent state is
{% cite metropolis1953equation --file references %}, generalized into the
sampling framework still used today by
{% cite hastings1970monte --file references %}. Any time you hear "Markov
risk model," that lineage is what the word *Markov* is doing.

The modern, risk-facing consolidation is textbook by now —
{% cite rubinstein2016simulation --file references %} for the estimator and
its variance, {% cite glasserman2004monte --file references %} for the
financial-risk specialization where the tail is the deliverable. The
recurring lesson across both: a naive Monte Carlo estimate of a tail loss
is dominated by the region it almost never samples, so variance reduction
and importance sampling are not optimizations — they are the difference
between an estimate and noise.

## Monte Carlo vs Variational Autoencoders — estimating vs amortizing

For a long time the only honest answer to "the integral has no closed form"
was Monte Carlo. The variational autoencoder line of
{% cite kingma2013vae --file references %} and
{% cite rezende2014stochastic --file references %} added a second answer
that the risk community has been slow to take seriously: replace the
intractable posterior with a *learned* approximation, then sample from
that. The trade is precise and worth stating in risk terms.

- **Monte Carlo** estimates an expectation directly. It is **unbiased**;
  its variance is what you pay; the standard error is $$\sigma/\sqrt{N}$$
  in $$N$$ samples. For a rare-event tail, that variance is brutal — most
  of your samples carry no information about the quantity you care about,
  which is why {% cite glasserman2004monte --file references %} spends most
  of its pages on importance sampling and control variates.
- **VAE** estimates a *distribution* parameterized by a neural encoder–decoder.
  It is **biased** by the choice of variational family; in exchange, the
  variance of any downstream expectation drops sharply because the
  approximation already concentrates mass where it matters. Once the
  encoder is trained, sampling is $$O(1)$$ — the cost was amortized.

The honest decomposition is therefore not "MC vs VAE" but "where is your
budget?" If the integral is one-shot and you cannot tolerate bias, MC with
variance reduction is still correct. If you will evaluate similar
expectations many times — pricing across strikes, risk across portfolios,
posterior queries across scenarios — the amortization VAE buys eats the MC
sample cost alive. The trap is symmetric: an MC user who pretends naive
estimators handle the tail, and a VAE user who pretends the variational
gap is zero. Both are common; neither survives a serious tail diagnostic.

## Quantum amplitude estimation — the quadratic speedup that matters

The third answer is the one the field is still partly arguing about. The
core observation is older than the hype:
{% cite brassard2002amplitude --file references %} showed that *amplitude
estimation* — a quantum subroutine that estimates the probability of a
marked outcome — converges with error $$O(1/N)$$ in $$N$$ queries, where
classical Monte Carlo converges as $$O(1/\sqrt{N})$$. That is a *quadratic*
speedup, and it is not asymptotic hand-waving: it applies to the same
expectation a financial-risk MC actually computes.

{% cite montanaro2015quantum --file references %} carried this through to
generic Monte Carlo: any expectation accessible to classical MC admits the
quadratic speedup under a quantum oracle for the underlying distribution.
The applied line landed shortly after:
{% cite rebentrost2018quantum --file references %} laid out the
specifically-financial case (option pricing, credit risk), and
{% cite stamatopoulos2020option --file references %} demonstrated option
pricing on actual quantum hardware with the amplitude-estimation primitive.

Read as risk analysis, the implication is narrow but real. A
quadratic-in-precision speedup means estimating a tail quantile to one
extra digit costs the *square root* of the classical sample count — not a
constant factor saving but a different scaling regime. The honest caveat is
equally narrow: you need a quantum oracle for the loss distribution, and
loading classical data into amplitude form is its own hard problem. The
literature now spends as much effort on data loading as on the
amplitude-estimation primitive itself, because that loading cost is what
decides whether the quadratic speedup is realized in practice. The field
hasn't settled it. But "MC, but quadratically tighter in precision" is now
a real third option, not vaporware.

## Key references — 5-field cards

Each card: **Claim** · **Method** · **Matters** (the risk-analysis reason
it is here) · **Connects to** (where it sits in the survey) · **Code**.

**[1] {% cite metropolis1949monte --file references %} — The Monte Carlo Method**
- Claim: an intractable expectation can be replaced by a sample average.
- Method: stochastic sampling of the loss functional.
- Matters: the entire reason a non-closeable risk integral is estimable.
- Connects to: every section below — the root of the family.
- Code: — (1949 historical paper; modern MC libraries are reimplementations).

**[2] {% cite metropolis1953equation --file references %} — Equation of State by Fast Computing Machines**
- Claim: dependent high-dimensional state can be sampled via a Markov chain.
- Method: the Metropolis acceptance rule.
- Matters: makes simulation feasible when state is correlated over time.
- Connects to: any "Markov risk model" — this is the origin of the word.
- Code: — (historical; PyMC / Stan / emcee reimplement it).

**[3] {% cite hastings1970monte --file references %} — MC Sampling Using Markov Chains**
- Claim: generalizes Metropolis to arbitrary target distributions.
- Method: Metropolis–Hastings.
- Matters: the formal basis of Markov-chain risk simulation.
- Connects to: state-dependent risk processes; ergodic-average estimators.
- Code: — (historical; standard in every MCMC library).

**[4] {% cite artzner1999coherent --file references %} — Coherent Measures of Risk**
- Claim: axioms a sound risk measure must satisfy.
- Method: the coherence axiom set (mono / sub-add / hom / transl-inv).
- Matters: explains why variance and VaR mislead in the tail.
- Connects to: motivates a tail-aware reading of any $$\Risk(\cdot)$$.
- Code: — (theory paper; trivial to encode the axioms as predicates).

**[5] {% cite rockafellar2000optimization --file references %} — Optimization of CVaR**
- Claim: conditional tail loss is a tractable optimization target.
- Method: convex reformulation of CVaR.
- Matters: gives the flash-risk tail a workable definition.
- Connects to: every objective that targets a conditional tail.
- Code: — (standard convex-solver implementations exist; e.g. cvxpy).

**[6] {% cite glasserman2004monte --file references %} — Monte Carlo Methods in Financial Engineering**
- Claim: tail risk is estimable but only with variance control.
- Method: importance sampling, control variates, stratification.
- Matters: the practical core of estimating a flash-risk tail.
- Connects to: the rare-event section; the whole reason naive MC fails.
- Code: — (book; reference implementations widely available).

**[7] {% cite rubinstein2016simulation --file references %} — Simulation and the Monte Carlo Method**
- Claim: the MC estimator and its variance, end to end.
- Method: estimator construction + rare-event simulation.
- Matters: why naive tail simulation is noise, not an estimate.
- Connects to: the $$\sigma/\sqrt{N}$$ argument behind variance reduction.
- Code: — (textbook; companion code by edition).

**[8] {% cite kingma2013vae --file references %} — Auto-Encoding Variational Bayes**
- Claim: a learned posterior approximation can replace MCMC for many inference tasks.
- Method: reparameterization trick + amortized encoder.
- Matters: turns repeated MC integrals into $$O(1)$$ sampling after training.
- Connects to: the MC-vs-VAE trade; biased-but-amortized vs unbiased-but-expensive.
- Code: ✓ — original implementation and many open-source clones (PyTorch / JAX).

**[9] {% cite rezende2014stochastic --file references %} — Stochastic Backpropagation and Deep Generative Models**
- Claim: gradients of expectations under deep generative models are tractable.
- Method: stochastic backprop through the sampling layer.
- Matters: the reason VAE-style estimators are end-to-end optimizable.
- Connects to: the variance side of the MC-vs-VAE trade.
- Code: ✓ — reference implementations in every deep-generative-model library.

**[10] {% cite brassard2002amplitude --file references %} — Quantum Amplitude Amplification & Estimation**
- Claim: quantum amplitude estimation gives $$O(1/N)$$ error in $$N$$ queries.
- Method: Grover-style amplification + phase-estimation readout.
- Matters: the quadratic-in-precision speedup over classical MC.
- Connects to: every "quantum MC" paper that follows.
- Code: — (theory; primitives in Qiskit / Cirq).

**[11] {% cite montanaro2015quantum --file references %} — Quantum Speedup of Monte Carlo Methods**
- Claim: any classical MC expectation inherits the quadratic speedup.
- Method: reduces generic MC to amplitude estimation.
- Matters: makes the speedup a general MC theorem, not a special case.
- Connects to: the quantum section's load-bearing claim.
- Code: — (theory; reference circuits in Qiskit Finance).

**[12] {% cite rebentrost2018quantum --file references %} — Quantum Computational Finance: MC Pricing of Derivatives**
- Claim: option pricing inherits the amplitude-estimation speedup.
- Method: encodes payoff + path simulation into a quantum oracle.
- Matters: the financial-risk-specific instantiation of Montanaro.
- Connects to: any actual finance-side MC use case.
- Code: ✓ — reference implementations in Qiskit Finance.

**[13] {% cite stamatopoulos2020option --file references %} — Option Pricing on Quantum Computers**
- Claim: amplitude-estimation option pricing runs on actual hardware.
- Method: experiments on real superconducting devices.
- Matters: pulls the speedup story out of theory and into measurement.
- Connects to: the honest "data loading is the bottleneck" caveat.
- Code: ✓ — code released alongside the Qiskit Finance module.

---

*References are real, established works (verify exact fields before citing
formally). No DOIs are asserted. Code lines marked ✓ where I am confident a
reference implementation is publicly available; "—" where the work is
foundational/historical and the modern code is reimplementation, not the
authors' release.*

## References

{% bibliography --file references --cited %}
