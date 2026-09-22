---
layout: post
title: "Multi-Agent Orchestration Patterns: A Map"
date: 2026-09-22 23:00:00+0900
description: "The field guide named orchestration as a sub-problem and gave you the reliability math; this post gives you the taxonomy the math was missing — Orchestrator-Workers, Multi-Agent Debate, Mixture-of-Agents, and Reflexion, compared on who talks to whom and which failure mode each actually targets."
tags: agent-loop orchestrator-workers multi-agent survey vertical
categories: [llm, ai-agents]
related:
  - slug: the-agent-loop-field-guide
    note: "the theory this survey fills in with a concrete taxonomy — see Sub-problem 4 (Orchestration) and 5 (Escalation) there for the reliability-composition math"
  - slug: orchestrator-workers-augfc-agent-loop
    note: "the gap this landscape sets up — nobody combines fine-tuning + loop + escalation for any of the four patterns below"
  - slug: sector-specialized-financial-llms
    note: "a worked instance of the Orchestrator-Workers pattern, in one domain"
  - slug: kmux-observer-ambient-agent-attention
    note: "the human-facing half of escalation — when a person's attention gets pulled in, not just when the model defers"
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic, survey register — a map to sit next to the deeper theoretical
> and applied posts, not a replacement for either.

> **Original.** "Composition does not preserve reliability... Multi-agent systems are
> often _less_ reliable than the single loop they replaced, and the failure is located
> in the seams — task specification and result fusion — not in the workers." — from
> [the agent-loop field guide]({{ '/blog/2026/the-agent-loop-field-guide/' | relative_url }}),
> Sub-problem 4.
>
> **Essence.** The field guide proved _why_ naive multi-agent composition can hurt more
> than it helps (reliability compounds as roughly $p^n$ across dependent steps, before
> you even add the orchestrator's own decomposition/fusion error). What it didn't do —
> deliberately, it's a theory post — is catalogue the actual patterns people use once
> they compose loops anyway. This post is that catalogue: four real patterns, compared
> on the one thing the reliability math says matters — where the seams are, and what
> each pattern does to keep them from being the weak point.

## 0. The seam is the point

Every multi-agent pattern below is, underneath its name, a different answer to one
question: **when you split a task across multiple LLM calls, what exactly gets passed
across the seam?** Full reasoning traces? Final answers only? A shared draft everyone
edits? The answer determines both the pattern's failure mode and its cost.

## 1. Four real patterns

- **Orchestrator–Workers** — a controller decomposes a task and dispatches
  sub-tasks to specialized workers, then fuses their results. The seam carries
  _task specifications going out_ and _results coming back_; workers don't see each
  other. This is the pattern named (and formally cited only informally, via Anthropic's
  own engineering writeup) in the [gap post]({{ '/blog/2026/orchestrator-workers-augfc-agent-loop/' | relative_url }}) and worked out concretely in the [financial-LLM post]({{ '/blog/2026/sector-specialized-financial-llms/' | relative_url }}).
- **Multi-Agent Debate** {% cite du2023debate --file references %} (2023, ICML 2024) —
  multiple instances of a model propose answers, see each other's full reasoning, and
  revise over several rounds toward a common answer. The seam carries _complete
  reasoning traces_, not just conclusions — the mechanism the paper credits for
  reducing hallucination and improving factuality.
- **Mixture-of-Agents** {% cite wang2024moa --file references %} (2024) — a layered
  architecture: each layer of agents takes _every_ prior layer's outputs as auxiliary
  context and produces a refined response, repeated for several layers. The seam
  carries full prior-layer outputs forward, never backward — no debate, no revision of
  earlier layers, only synthesis going up.
- **Reflexion** {% cite shinn2023reflexion --file references %} (2023) — technically a
  single agent, not multiple, but the same seam question applies across _time_ instead
  of across agents: the agent critiques its own attempt in natural language, stores
  that verbal feedback, and retries. Included because it's the degenerate case (n=1)
  that the multi-agent patterns generalize — worth knowing what composition adds over
  self-critique alone.

## 2. Comparison table

|                      | What crosses the seam      | Direction                        | Failure mode targeted                                                   |
| -------------------- | -------------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Orchestrator–Workers | task spec out, result back | controller ↔ each worker (star)  | task decomposition reliability — the field guide's $p^n$ problem        |
| Multi-Agent Debate   | full reasoning traces      | all-to-all, multi-round          | hallucination / factual error, via disagreement surfacing bad reasoning |
| Mixture-of-Agents    | full prior-layer outputs   | strictly forward, layer to layer | output quality/diversity — no single model's weaknesses dominate        |
| Reflexion            | verbal self-critique       | agent to itself, across time     | single-attempt failure, via retry informed by stated failure reason     |

## 3. What the field guide's math predicts for each

Going back to the $p^n$ reliability-composition result: **Orchestrator–Workers is the
pattern most exposed to it** — a genuine dependency chain (decompose → delegate →
fuse), so the compounding failure the field guide warns about is a real risk, not a
theoretical one. **Debate and Mixture-of-Agents are structurally different**: they're
not a dependency chain toward one answer but multiple independent-ish attempts
reconciled at the end, which is closer to an ensemble than a pipeline — a different
reliability story the $p^n$ formula doesn't directly describe. This is a genuine open
question this survey doesn't resolve: none of the four papers analyzes its own
reliability composition the way the field guide's theory post does for the general
case.

## 4. Open questions

- Does Multi-Agent Debate's "expose disagreement" mechanism still help once all
  debating agents are instances of the _same_ model (shared blind spots), or does it
  need genuine model heterogeneity to work?
- Mixture-of-Agents never lets a later layer correct an earlier one's mistake it
  didn't propagate forward cleanly — is that a real limitation, or does synthesis-only
  composition avoid a different failure mode (infinite revision loops) that debate is
  exposed to?
- The kmux-observer post's actual question — when should a _human's_ attention get
  pulled into any of these four patterns, not just when should the system escalate to
  a bigger model — isn't answered by any of the four papers here. That's still open.

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
