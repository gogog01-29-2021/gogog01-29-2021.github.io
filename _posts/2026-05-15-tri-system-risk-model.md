---
layout: post
title: "The tri-system risk model: when interaction is the risk"
date: 2026-05-15 16:00:00+0900
description: A model note on bias migration and a loss-aware consultation update in human–AI interaction. Heavy on equations by design.
tags: risk-modeling reinforcement-learning stochastic-processes
categories: [math]
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
$$

This is a working note on the model I am building, not a results paper. The
numeric constants below are **illustrative**; the structure is the point.

## The thesis

The usual framing treats an AI as an estimator with some error, and risk as
that error. This model takes a different stance: **the interaction itself is
the locus of risk.** What an agent ends up acting on is not the AI's output and
not the human's prior in isolation, but a *mixture* of the two whose weights
drift over repeated interactions.

## Effective bias as a stochastic mixture

Let $$A_t \in [0,1]$$ be the AI's (perceived) accuracy at step $$t$$, let
$$\bN$$ be the human-anchored bias term, and let $$\bF$$ be the AI forecaster's
bias term. The effective bias the agent acts on is

\begin{equation}
\label{eq:ai-bias}
\bAI_{,t} \;=\; A_t\,\bN \;+\; (1 - A_t)\,\bF .
\end{equation}

Equation \eqref{eq:ai-bias} is deliberately simple, but two things make it
non-trivial. First, $$A_t$$ is itself updated by the dynamics, so the mixture
weight is endogenous. Second, the forecaster term is **not deterministic** — it
is drawn fresh each step,

\begin{equation}
\label{eq:bf-noise}
\bF \;\sim\; \mathcal{N}\!\left(\mu_{\mathrm{F}},\, 0.1^{2}\right),
\end{equation}

so even with a fixed $$A_t$$, the realized $$\bAI_{,t}$$ in
\eqref{eq:ai-bias} fluctuates. Flash-risk regimes are exactly the tail events
where the noise in \eqref{eq:bf-noise} lines up adversarially with a high
mixture weight.

## A loss-aware consultation update

Let $$\theta_t$$ be the agent's tendency to consult the AI. The key design
choice is that $$\theta$$ updates **differently depending on whether the AI was
actually used**, and the update is driven by realized loss rather than raw
outcome. Writing $$\Loss_t$$ for the loss observed at step $$t$$ and
$$\bar{\Loss}$$ for a running reference level:

\begin{equation}
\label{eq:theta-update}
\theta_{t+1} \;=\;
\begin{cases}
\theta_t + \eta\,\bigl(\bar{\Loss} - \Loss_t\bigr)\,(1-\theta_t)
  & \text{if the AI was consulted at } t,\\[6pt]
\theta_t - \kappa\,\bigl(\Loss_t - \bar{\Loss}\bigr)_{+}\,\theta_t
  & \text{if the AI was not consulted at } t,
\end{cases}
\end{equation}

with learning rate $$\eta$$, a separate decay rate $$\kappa$$, and
$$(x)_+ = \max(x,0)$$. The asymmetry in \eqref{eq:theta-update} is intentional:
consulting and doing well *reinforces* consultation proportional to the
remaining headroom $$(1-\theta_t)$$, while *not* consulting and being punished
only erodes $$\theta$$ — it never rewards abstention. Over many steps this is
what produces migration: $$\theta$$ ratchets toward the AI, which feeds back
into the mixture weight in \eqref{eq:ai-bias}.

## Why this needs a simulation

Composing \eqref{eq:ai-bias}, \eqref{eq:bf-noise}, and
\eqref{eq:theta-update} gives a coupled stochastic system. The quantity I
actually care about is the expected cumulative risk

$$
\E\!\left[\, \sum_{t=1}^{T} \Risk\bigl(\bAI_{,t}\bigr) \,\right],
\qquad
\Risk(b) = b^{2},
$$

where the expectation is over the noise in \eqref{eq:bf-noise} and the
consultation decisions implied by $$\theta_t$$. There is no clean closed form
once the weights are endogenous, which is exactly why the model is studied by
Monte Carlo over $$(A_t, \text{trust}, \text{load})$$ grids.

---

*If the equations above render with numbered tags, working `\eqref`
cross-references, and the custom `\Risk` / `\E` macros, the math pipeline on
this site is set up correctly.*
