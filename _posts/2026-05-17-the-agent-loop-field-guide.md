---
layout: post
title: "The agent loop: a field guide to agentic AI architectures"
date: 2026-05-17 11:00:00+0900
description: A survey-first deep dive into what an AI agent actually is — the loop, its seven sub-problems, the design space for each, and where the open research lives. The field first; my own work only at the end.
tags: agentic-ai reinforcement-learning llm survey
categories: [llm, ai-agents]
related_posts: false
toc:
  sidebar: left
---

$$
\newcommand{\E}{\mathbb{E}}
\newcommand{\Loss}{\mathcal{L}}
\newcommand{\act}{a}
\newcommand{\obs}{o}
\newcommand{\policy}{\pi}
$$

{% include figure.liquid path="assets/img/agent-loop/hero.png" class="img-fluid rounded z-depth-1" caption="The agent as a partially observed, self-perturbing control loop — observation oₜ → constructed state sₜ → policy π → action aₜ → environment, and back. Composed in Figma (vector text, exact symbols)." %}

> This is the first in a series of survey-first notes. The rule for the series:
> **map the sector and its sub-problems honestly before any of my own work
> appears.** My research shows up only in the last two sections, and only as
> one point inside a space that exists with or without it.

## Why "agent" is the wrong word until you define the loop

"AI agent" is now a marketing word, which means it has stopped being a
technical one. Almost every system called an agent in 2024–2026 is one of
three things: a single language-model call with a tool attached, a fixed
script that calls a model at a few points, or — rarely — something that
actually decides *what to do next based on what just happened*. Only the
third is interesting, and the thing that separates it from the other two is
not the model. It is the **loop**.

So this guide is organized around the loop, not around any framework. A model
is a component you can swap. A loop is an architecture you have to design. The
claim I want to defend over the next sections is narrow and, I think, correct:

> Every serious agent system is the same control loop. The research is not in
> the loop — it is in the seven sub-problems the loop forces you to solve, and
> in the couplings between them.

Name the loop precisely and the whole field becomes legible.

## The minimal loop

Strip away the vocabulary and an agent is a closed loop between a policy and
an environment:

$$
\obs_t \;\xrightarrow{\;\text{perceive}\;}\; s_t
\;\xrightarrow{\;\policy\;}\; \act_t
\;\xrightarrow{\;\text{act}\;}\; \text{env}
\;\xrightarrow{\;\text{observe}\;}\; \obs_{t+1}.
$$

This is just a partially observed controlled process. That framing is old —
it predates language models by decades — and that is exactly why it is
useful: it tells you what the hard parts *must* be, before you have written a
line of prompt.

- $$\obs_t$$ is raw observation (tool output, a file, a user message). It is
  almost never the state.
- $$s_t$$ is the agent's **constructed** state — what it believes is true
  and relevant right now. Building $$s_t$$ from the history of observations is
  a sub-problem, not a given.
- $$\policy$$ maps state to an action. In an LLM agent the policy is a model
  *plus the scaffold around it* — the scaffold is part of the policy whether
  you designed it on purpose or not.
- $$\act_t$$ is a real effect: a tool call, a write, a message, a decision to
  stop.

Two properties make this loop hard, and both are structural rather than
model-dependent. First, it is **partially observed**: the agent never sees
the environment, only $$\obs_t$$, so it must maintain belief, not just react.
Second, it is **non-stationary under its own actions**: the agent's outputs
change the environment and often change the user, so the distribution it is
acting on is one it is itself perturbing. Hold onto that second property — it
is the seam where reliability and risk both live, and it is where my own work
eventually enters.

Everything below is a sub-problem this loop forces. I will survey each as a
design space with named options and known failure modes, citing only
established work, and I will resist the temptation to crown a winner where
the field has not.

<!-- Schematic PNG pending: View-seat Figma export rate limit hit while
     composing the second frame. Uncomment once
     assets/img/agent-loop/seven-subproblems.png lands.
{% include figure.liquid path="assets/img/agent-loop/seven-subproblems.png" class="img-fluid rounded z-depth-1" caption="The seven sub-problems as a spec: each names what it decides and where in the loop oₜ → sₜ → π → aₜ it lives. Composed in Figma; use this as the source of truth for labels." %}
-->


## Sub-problem 1 — Decision: turning a model into a policy

A language model is a next-token distribution. A policy is a thing that
chooses an action given a state. Bridging that gap is the most studied
sub-problem and the one with the clearest design space.

**Direct prompting.** The model emits the action directly. Cheap, fast,
opaque; no separation between deliberation and commitment. Fine for
single-step tools, fragile the moment the task needs more than one decision.

**Interleaved reasoning and acting.** The model alternates private reasoning
with actions, each action conditioned on the result of the last — the pattern
ReAct {% cite yao2022react --file references %} named and that most production
agents now use in some form. The contribution was never the prompt; it was making the *action
conditional on observed feedback inside one episode*. That is the first place
the loop becomes a loop.

**Self-revision.** The agent critiques or verifies its own output and retries
— Reflexion {% cite shinn2023reflexion --file references %} as the canonical
reference. This works when
verification is genuinely cheaper than generation (compiling code, running a
test). It quietly fails when the verifier shares the generator's blind spot,
which is the recurring trap of this whole sub-problem: a self-check is only
as good as its independence from what it checks.

**Search over deliberations.** Expand multiple reasoning paths and select —
Tree of Thoughts {% cite yao2023tot --file references %} as the reference point.
This buys
reliability with compute and only pays off when you have a real evaluator for
partial solutions; without one you are paying for branching you cannot score.

The design axis under all four is the same: **how much deliberation per
action, and how is it scored?** More deliberation is not better; deliberation
without a scoring signal is just more confident error. That single sentence
predicts most agent-decision failures I have seen.

## Sub-problem 2 — Action: tools and the function-calling interface

An agent that cannot affect the world is a chatbot. The action interface is
where capability actually enters, and it is more architecturally decisive
than the decision layer.

The lineage is worth stating because it is short and often blurred.
Toolformer {% cite schick2023toolformer --file references %} showed a model can
be trained to decide
*when* to call a tool. Structured function calling then moved that decision
into a typed interface the model emits and a runtime executes. The current
frontier — what I will call **augmented function calling** — is the recognition
that the function interface is not plumbing but part of the policy: schema
design, argument validation, partial-failure semantics, and how a tool result
is folded back into $$s_t$$ all shape behavior as much as the prompt does.

The failure modes here are unglamorous and dominate real systems:

- **Schema underspecification.** The model fills a field the way the field is
  *named*, not the way it is *meant*. Most "the agent did something insane"
  incidents are this.
- **Silent partial failure.** A tool returns something, the something is
  wrong, and the loop continues on a corrupted $$s_t$$. Partial failure that
  is not surfaced into the state is worse than a clean exception.
- **Capability creep.** Each new tool enlarges the action space
  combinatorially, and the decision layer that worked at five tools degrades
  at fifty without anyone changing the decision layer.

The honest summary of this sector: most agent reliability is won or lost in
the action interface, and the literature underweights it relative to the
decision layer because the decision layer is more fun to write papers about.

## Sub-problem 3 — Memory and state construction

$$s_t$$ does not exist for free. The agent must build it from a growing
history under a fixed context budget, which makes memory a compression
problem with an objective the field has not agreed on.

The design space, from least to most committed:

1. **Full history in context.** Correct until it is impossible; degrades with
   length well before the hard limit.
2. **Recency window.** Simple, and silently drops the one fact from step 3
   that mattered at step 90.
3. **Retrieval over an external store.** The dominant pattern; turns
   "remember" into "retrieve," which means memory quality is now retrieval
   quality — a different sub-problem wearing a memory mask.
4. **Learned/structured state.** Summaries, scratchpads, explicit world
   models — e.g. the skill-library line of Voyager {% cite wang2023voyager --file references %},
   where what is retained is *reusable competence*, not transcript.

The unifying question — and the one the field genuinely has not answered — is
the objective: **what should $$s_t$$ be sufficient *for*?** A sufficient
statistic is only definable relative to a decision. Memory designed without
naming the decision it serves optimizes a proxy, and you discover the proxy
was wrong only when the agent confidently acts on a state that omitted the
thing that mattered.

## Sub-problem 4 — Orchestration: one loop or many

A single loop hits limits — context, specialization, parallelism — and the
response is to compose loops. The dominant pattern is **orchestrator–workers**:
a planner decomposes a task and delegates sub-tasks to specialized worker
loops. It works for the same reason divide-and-conquer always works, and it
fails for one specific reason worth stating precisely.

> Composition does not preserve reliability. Worker reliability $$p$$ across
> $$n$$ sequential dependent steps gives roughly $$p^{\,n}$$ task reliability
> *before* you add the orchestrator's own error in decomposition and result
> integration. Multi-agent systems are often *less* reliable than the single
> loop they replaced, and the failure is located in the seams — task
> specification and result fusion — not in the workers.

This is the single most over-sold sector in agentic AI right now. More agents
is a hypothesis, not an improvement. The defensible version of orchestration
treats the orchestrator's decomposition and fusion as the actual research
object and the workers as interchangeable — which is the inverse of how most
multi-agent demos are presented.

## Sub-problem 5 — Escalation: knowing when not to act

An agent that always acts is a liability; an agent that always defers is
useless. The competence to decide *whether to act, defer, or hand off* is its
own sub-problem, and it is the one closest to my research, so I will be
precise and still keep it general.

Frame escalation as a decision under a loss. Let $$\Loss_{\text{act}}$$ be
the expected loss of acting now on the current state, $$\Loss_{\text{defer}}$$
the expected loss of escalating (latency, human cost), and $$c$$ the cost of
the escalation channel itself. The agent should act iff

$$
\E[\Loss_{\text{act}} \mid s_t] \;<\; \E[\Loss_{\text{defer}} \mid s_t] \,+\, c .
$$

Trivial to write, and every term is the hard part. $$\E[\Loss_{\text{act}}
\mid s_t]$$ requires the agent to estimate its *own* error rate on a state it
constructed — calibration about itself, which models are notoriously bad at.
The literature has the ingredients (selective prediction and abstention; the
defer-to-human framing of learning-to-defer {% cite madras2018defer --file references %})
but agentic
systems mostly ship a confidence threshold and call it escalation. The gap
between "abstain when unsure" and "estimate the loss of acting versus the
loss of deferring, given a state you may have built wrong" is where the real
problem lives, and it is wide open.

## Sub-problem 6 — Learning the loop: fine-tuning vs. orchestration

Given the loop and its sub-problems, where do you put the learning? Two
positions, usually argued past each other:

- **Fine-tune the policy.** Push competence into weights — instruction tuning,
  RLHF {% cite christiano2017deeprl --file references %}{% cite ouyang2022instructgpt --file references %},
  preference optimization such as DPO {% cite rafailov2023dpo --file references %}.
  Robust and fast at inference; expensive
  to change and hard to audit per-decision.
- **Engineer the orchestration.** Leave weights fixed, invest in scaffold,
  tools, memory, and control flow. Cheap to change and inspect; brittle,
  because you are programming a system whose core component you are treating
  as a black box.

These are presented as rivals and are actually a decomposition. Fine-tuning
sets the *competence* of the policy at a single step; orchestration sets how
steps are *composed* into a task. A loop with three sub-problems unsolved is
not rescued by a better-tuned single-step policy, and a perfectly orchestrated
loop around an incompetent policy still fails. The defensible position is
that the question "fine-tune or orchestrate" is mis-posed: the open problem is
the **interface** between a learned single-step policy and a designed
multi-step loop, including when escalation should itself be learned rather
than thresholded. The field has not converged here, and the absence of
convergence is the opportunity, not a gap to paper over.

## Sub-problem 7 — Evaluation and the honest failure catalogue

You cannot improve a loop you cannot measure, and agent evaluation is harder
than model evaluation for a structural reason: the loop is non-stationary
under its own actions, so a benchmark that fixes the environment measures a
different system than the one you deploy. Single-turn accuracy does not
compose to multi-step task success; per-step metrics hide compounding error;
and any benchmark the agent can influence stops measuring what it claims to.

The failure modes recur across every sector above and are worth one
consolidated list, because naming them is most of the cure:

- **Compounding error.** Small per-step error, long horizon, no recovery.
- **Corrupted state.** A bad observation enters $$s_t$$ and every later
  decision is conditioned on a lie.
- **Confident deliberation without scoring.** More reasoning, no evaluator,
  more assured wrong answers.
- **Composition loss.** Multi-agent reliability below the single loop it
  replaced.
- **Mis-calibrated self-estimate.** The agent cannot price its own error, so
  escalation fires at the wrong time or never.
- **Feedback drift.** The agent changes the environment or the user, and the
  distribution it is acting on is one it created.

That last one is not a footnote. It is the property that turns an agent from
a tool into a participant, and it is where the rest of my work — and the next
post in this series — actually begins.

## Where my own work fits (and where it does not)

Everything above stands without my research; that was the point of the rule.
My own contribution is one point inside two of these sub-problems, stated
plainly and with its limits:

1. **The feedback-drift seam (Sub-problem 7) and escalation (Sub-problem 5).**
   When the agent's own actions reshape the human's reliance on it over
   repeated interactions, the loop is no longer just non-stationary — the
   *interaction itself becomes the locus of risk*, separate from any single
   decision's error. I model this as a coupled stochastic system in which the
   tendency to consult the AI updates from realized loss, asymmetrically,
   producing bias migration and tail "flash-risk" events that no per-step
   metric detects. That is the
   [tri-system risk model]({% post_url 2026-05-15-tri-system-risk-model %})
   — a model note, explicitly not a results paper, and not a claim about the
   whole field.

2. **The learned-policy / designed-loop interface (Sub-problem 6).** My
   working position is that fine-tuning, the agent loop, and *learned*
   escalation should be studied as one object rather than three, because the
   reliability lost in composition (Sub-problem 4) and the mis-pricing of
   self-error (Sub-problem 5) are the same failure viewed from two sides. This
   is a framing, currently in preparation, not a solved result; I will not
   overstate it.

Both are narrow. The honest claim is not "I have solved the loop" — it is
"two of the seven sub-problems are coupled in a way the field treats
separately, and that coupling is where reliability and risk are the same
question."

## Open problems, stated as a sector map

The legible version of this whole field, and the agenda for the rest of this
series:

1. **State sufficiency** — define $$s_t$$ relative to the decision it serves;
   memory has no objective without it.
2. **Action-interface reliability** — most reliability is won here and the
   literature underweights it.
3. **Composition without reliability loss** — when does a second loop help,
   provably, rather than by demo?
4. **Self-calibrated escalation** — pricing the loss of acting vs. deferring
   on a self-constructed state.
5. **The learned/designed interface** — fine-tuning and orchestration as one
   problem, not two camps.
6. **Drift-aware evaluation** — measuring a loop that perturbs its own
   environment and its own user.

The next posts take these one sector at a time, same rule: the field first,
honestly, and my own work only where it earns a sentence.

---

## References

{% bibliography --file references --cited %}

*All references above are established, published work. No venue, DOI, or result
is asserted for my own in-preparation work; the tri-system note is linked inline
and labelled a model note, not a results paper.*
