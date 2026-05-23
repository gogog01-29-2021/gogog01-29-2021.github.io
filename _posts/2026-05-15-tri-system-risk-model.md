---
layout: post
title: "Risk models and Monte Carlo: estimating the loss you cannot close"
date: 2026-05-15 16:00:00+0900
description: A risk-analysis survey of how Monte Carlo turned risk modeling from closed-form approximation into loss-exposure estimation — the field first, then where my tri-system model sits inside it. Top references analyzed as 5-field cards.
tags: risk-modeling monte-carlo stochastic-processes
categories: [math, probability]
related_posts: false
toc:
  sidebar: left
---

$$
\newcommand{\bAI}{b_{\mathrm{AI}}}
\newcommand{\bN}{b_{\mathrm{N}}}
\newcommand{\bF}{b_{\mathrm{F}}}
\newcommand{\E}{\mathbb{E}}
\newcommand{\Loss}{\mathcal{L}}
\newcommand{\Risk}{\mathrm{Risk}}
$$

> Survey-first note. The field and its references come first; my own model
> appears only in the last two sections, as one point inside a space that
> exists without it.

## The thesis, in risk terms

A risk model is only ever as good as the loss it can quantify. Everything
else — the dynamics, the parameters, the story — is instrumentation around a
single question: *what is the expected (and tail) loss this system produces?*
Stated that way, risk modeling has one structural problem. The loss
functional you actually care about is almost never available in closed form,
and the part you care about *most* — the tail, the rare adverse alignment, the
flash event — is exactly the part where closed-form approximations are least
trustworthy.

Monte Carlo is the response to that problem, and the history of risk modeling
is largely the history of taking it seriously. This post surveys that field
through a risk-analysis lens — loss exposure, not algorithms — and only then
places my own work inside it.

## What a risk model must deliver

Before simulating anything, the object being estimated has to be a *coherent*
notion of risk. The axioms of {% cite artzner1999coherent --file references %}
fixed what a risk measure must satisfy (monotonicity, sub-additivity,
positive homogeneity, translation invariance) and, in doing so, exposed why
variance or plain value-at-risk mislead precisely in the tail. The
operational consequence is that risk specification links adaptation and
decisions to **realized loss exposure**, not to a convenient surrogate.

Once the tail is the quantity of interest, the relevant functional is a
conditional-tail object. {% cite rockafellar2000optimization --file references %}
made Conditional Value-at-Risk tractable as an optimization target, which
matters here for one reason: the tail term activates only when an adverse
outcome coincides with under-recognition of the risk event. That conditional
activation is the connective tissue between *behavioral* learning and the
*loss-generation* mechanism — a point I return to in my own model.

## Why the loss has to be simulated

If the loss integral were closeable, none of the simulation machinery would
exist. It generally is not, so the field estimates it. The estimator itself
originates with {% cite metropolis1949monte --file references %}: replace an
intractable expectation with a sample average, and accept estimator variance
as the price of admission. The Markov-chain construction that made this work
for high-dimensional, dependent state is {% cite metropolis1953equation --file references %},
generalized into the sampling framework still used today by
{% cite hastings1970monte --file references %} — the "Markov" in any Markov
risk model traces directly to this line.

The modern, risk-facing consolidation of these tools is textbook by now —
{% cite rubinstein2016simulation --file references %} for the estimator and
its variance, {% cite glasserman2004monte --file references %} for the
financial-risk specialization where the tail, not the mean, is the deliverable.
The recurring lesson across both: a naive Monte Carlo estimate of a tail loss
is dominated by the region it almost never samples, so variance reduction and
importance sampling are not optimizations — they are the difference between an
estimate and noise.

## The behavioral coupling: when the loss is endogenous

Classical risk Monte Carlo assumes the loss-generating distribution is fixed.
The interesting — and dangerous — case is when an *agent's adaptation* feeds
back into that distribution. Two intellectual lines bound this case. The
decision-theoretic ceiling is {% cite vonneumann1944theory --file references %}:
once a human and an AI both influence the outcome, consultation is a
strategic, utility-bearing choice, not a passive read. The deeper root of the
"should I defer to the machine" question is {% cite turing1950computing --file references %},
which is why it belongs in the lineage even though it predates the machinery.

The mechanism that makes the coupling tractable is stochastic approximation.
{% cite robbins1951stochastic --file references %} is the foundation for any
parameter that is updated incrementally from noisy realized feedback — exactly
the form an adaptive consultation tendency takes. Where that update is
interpreted as moving along the geometry of the model rather than raw
parameter space, the relevant object is the Fisher-information curvature of
{% cite amari1998natural --file references %}; it is the natural-gradient lens
on the same recursion.

## Where my work fits (narrow, and last)

Everything above holds without my model. My contribution is one specific
instantiation of the *endogenous-loss* case.

**Effective bias as a loss-bearing mixture.** Let $$A_t \in [0,1]$$ be the
AI's perceived accuracy at step $$t$$, $$\bN$$ the human-anchored bias term,
$$\bF$$ the AI-forecaster bias term. The quantity the agent actually incurs
loss on is the mixture

\begin{equation}
\label{eq:ai-bias}
\bAI_{,t} \;=\; A_t\,\bN \;+\; (1 - A_t)\,\bF ,
\qquad
\bF \sim \mathcal{N}\!\left(\mu_{\mathrm{F}},\,0.1^{2}\right).
\end{equation}

In risk-analysis terms: \eqref{eq:ai-bias} is the loss-generation channel.
The forecaster term is drawn fresh each step, so even at fixed $$A_t$$ the
realized exposure fluctuates, and **flash-risk regimes are precisely the tail
events where that noise aligns adversarially with a high mixture weight** —
the conditional-tail activation from the CVaR discussion, made concrete.

**A loss-aware consultation update.** Let $$\theta_t$$ be the tendency to
consult the AI. It evolves by a bounded reward–penalty rule whose penalty
term is gated on *realized* loss, not on an assumed detection variable:

\begin{equation}
\label{eq:theta-update}
\theta_{t+1} \;=\;
\begin{cases}
\theta_t + \eta\,\bigl(\bar{\Loss} - \Loss_t\bigr)\,(1-\theta_t)
  & \text{AI consulted at } t,\\[6pt]
\theta_t - \kappa\,\bigl(\Loss_t - \bar{\Loss}\bigr)_{+}\,\theta_t
  & \text{AI not consulted at } t .
\end{cases}
\end{equation}

This specification links consultation adaptation directly to loss exposure:
the penalty activates only when faulty output coincides with individual
under-recognition of the risk event — a hidden fault that produces no
realized loss does not move behavior. \eqref{eq:theta-update} is a clipped
stochastic-approximation recursion in the sense of Robbins–Monro; that is not
an analogy, it is the same object.

**Why this is a Monte Carlo problem.** Composing \eqref{eq:ai-bias} and
\eqref{eq:theta-update} makes the mixture weight endogenous, so the quantity
of interest

$$
\E\!\left[\, \sum_{t=1}^{T} \Risk\bigl(\bAI_{,t}\bigr) \,\right],
\qquad \Risk(b) = b^{2},
$$

has no closed form once $$\theta$$ and $$A_t$$ co-evolve. The tail of this
sum — not its mean — is the deliverable, which is exactly the regime where the
surveyed variance-reduction literature says naive simulation fails. The model
is therefore studied by Monte Carlo over $$(A_t,\text{trust},\text{load})$$
grids, and it is a *working model note, not a results paper* — the constants
in \eqref{eq:ai-bias} are illustrative; the loss-coupling structure is the
claim.

## Key references — 5-field cards

Each card: **Claim** (what it establishes) · **Method** · **Matters** (the
risk-analysis reason it is here) · **Our tie** (how it touches the model
above) · **Code**.

**[1] {% cite metropolis1949monte --file references %} — The Monte Carlo Method**
- Claim: an intractable expectation can be replaced by a sample average.
- Method: stochastic sampling of the loss functional.
- Matters: the entire reason a non-closeable risk integral is estimable.
- Our tie: legitimizes estimating $$\E[\sum \Risk]$$ at all.
- Code: — (1949 historical paper; no code).

**[2] {% cite metropolis1953equation --file references %} — Equation of State by Fast Computing Machines**
- Claim: dependent high-dimensional state can be sampled via a Markov chain.
- Method: the Metropolis acceptance rule.
- Matters: makes simulation feasible when state is correlated over time.
- Our tie: the time-coupled $$(\theta_t,A_t)$$ chain is of this type.
- Code: — (historical; modern MCMC libraries reimplement it).

**[3] {% cite hastings1970monte --file references %} — MC Sampling Using Markov Chains**
- Claim: generalizes Metropolis to arbitrary target distributions.
- Method: Metropolis–Hastings.
- Matters: the formal "Markov" basis of a Markov risk model.
- Our tie: justifies the chain construction over consultation states.
- Code: — (historical; standard in PyMC / Stan / emcee).

**[4] {% cite vonneumann1944theory --file references %} — Theory of Games and Economic Behavior**
- Claim: rational choice under interacting decision-makers has a utility basis.
- Method: game-theoretic / expected-utility formalism.
- Matters: consultation is a strategic loss-bearing choice, not passive.
- Our tie: frames $$\theta$$ as a utility-driven, not reflexive, propensity.
- Code: — (foundational text).

**[5] {% cite turing1950computing --file references %} — Computing Machinery and Intelligence**
- Claim: machine competence is an empirically posable question.
- Method: the imitation-game argument.
- Matters: the intellectual root of "should I defer to the machine".
- Our tie: the deference question $$\theta$$ operationalizes.
- Code: — (foundational essay).

**[6] {% cite robbins1951stochastic --file references %} — A Stochastic Approximation Method**
- Claim: a parameter can converge from noisy incremental feedback.
- Method: the Robbins–Monro recursion.
- Matters: the rigorous basis for any loss-driven adaptive parameter.
- Our tie: \eqref{eq:theta-update} *is* a clipped Robbins–Monro update.
- Code: — (1951; reimplemented in every SGD optimizer).

**[7] {% cite artzner1999coherent --file references %} — Coherent Measures of Risk**
- Claim: axioms a sound risk measure must satisfy.
- Method: the coherence axiom set.
- Matters: explains why variance/VaR mislead in the tail.
- Our tie: motivates a tail-aware reading of $$\Risk(\bAI)$$.
- Code: — (theory paper).

**[8] {% cite rockafellar2000optimization --file references %} — Optimization of CVaR**
- Claim: conditional tail loss is a tractable optimization target.
- Method: the CVaR convex reformulation.
- Matters: gives the flash-risk tail a workable definition.
- Our tie: the conditional activation of the penalty term mirrors CVaR gating.
- Code: — (method; standard convex-solver implementations exist).

**[9] {% cite glasserman2004monte --file references %} — Monte Carlo Methods in Financial Engineering**
- Claim: tail risk is estimable but only with variance control.
- Method: importance sampling, control variates for rare events.
- Matters: the practical core of estimating a flash-risk tail.
- Our tie: the recipe for sampling the adversarial-alignment tail of \eqref{eq:ai-bias}.
- Code: — (book; reference implementations widely available).

**[10] {% cite rubinstein2016simulation --file references %} — Simulation and the Monte Carlo Method**
- Claim: the MC estimator and its variance, end to end.
- Method: estimator construction + rare-event simulation.
- Matters: why naive tail simulation is noise, not an estimate.
- Our tie: the variance argument behind needing reps/grids, not single runs.
- Code: — (textbook; companion code by edition).

**[11] {% cite amari1998natural --file references %} — Natural Gradient Works Efficiently in Learning**
- Claim: updates along information geometry are statistically efficient.
- Method: Fisher-information (curvature) preconditioning.
- Matters: the curvature lens on a noisy adaptive recursion.
- Our tie: the natural-gradient reading of the $$\theta$$ update geometry.
- Code: — (theory; natural-gradient code in modern ML frameworks).

---

*The model section is a working note; illustrative constants, structural
claim. References are real, established works (verify exact fields before
citing formally); none are asserted as the author's own.*

## References

{% bibliography --file references --cited %}
