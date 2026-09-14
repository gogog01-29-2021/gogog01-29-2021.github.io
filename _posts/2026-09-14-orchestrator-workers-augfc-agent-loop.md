---
layout: post
title: "Orchestrator-Workers + Augmented Function-Calling + Agent Loop: The Combination Nobody's Tried"
date: 2026-09-14 13:00:00+0900
description: "Three agent-design patterns exist separately in the literature — task-decomposing orchestrators, tool-augmented reasoning, and iterative loops with escalation. Nobody has combined all three with fine-tuning specifically for working inside that loop. This is the general framing; the financial-LLM post is one worked instance of it."
tags: agent-loop orchestrator-workers tool-use fine-tuning escalation multi-agent
categories: [llm, ai-agents]
related:
  - slug: sector-specialized-financial-llms
    note: "a worked instance of this gap in one domain (financial filing evidence + calculation)"
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic framing + professor-cautious limitations. General framing post —
> the financial-LLM post applies this to one domain; this one asks what's true about the
> pattern independent of domain.

## 0. Three patterns, one gap

Modern agent systems draw on three ideas that show up constantly, almost always
separately:

- **Orchestrator–Workers** — a controller LLM decomposes a task and dispatches
  subtasks to specialized worker LLMs, then synthesizes their results. Anthropic's own
  engineering writeup on agent design describes this as the pattern of choice "for
  complex tasks where you can't predict the subtasks needed"
  (<a href="https://www.anthropic.com/engineering/building-effective-agents" target="_blank" rel="noopener">Building Effective Agents</a>).
- **Augmented function-calling** — a model interleaves reasoning with real tool
  invocations instead of doing everything in free text
  ({% cite yao2022react --file references %}, {% cite schick2023toolformer --file references %}).
- **The agent loop, with escalation** — iterate, verify the result, retry on failure,
  and escalate — to a bigger model, a different strategy, or a human — rather than
  looping forever or silently giving a wrong answer.

Each pattern has its own literature. What's missing is treating them as one system:
**fine-tuning a model specifically to operate inside a loop that can escalate**, rather
than bolting tool-calling and looping onto a frozen general-purpose model as
inference-time scaffolding. That's the actual gap.

## 1. Why "just add scaffolding" isn't the same thing

The default way people build agents today: take a strong general-purpose model, give it
tools via function-calling, wrap it in a loop, done. This works, but it means the model
was never trained to _know_ it's operating inside a loop — it doesn't have a learned
sense of "this looks like a case where I should escalate rather than retry the same
approach," because escalation-awareness was never part of its training signal, only its
prompt.

Fine-tuning **inside** the loop — where the training data itself includes
retry/escalate decisions and their outcomes, not just single-shot tool-use traces —
is a different regime. It's the difference between a model that can call a calculator
when told to, and a model that has learned _when its own confidence doesn't warrant
answering directly_.

## 2. What the combination would need to show

For this to be more than a restatement of three known ideas, it needs a testable claim:
a model fine-tuned with loop-and-escalation-aware training data should out-perform the
same model with the identical tool/loop scaffolding bolted on at inference time only —
on tasks where escalation actually matters (ambiguous evidence, conflicting sources,
genuinely hard sub-problems), not on tasks any reasonable scaffold already solves.
That ablation — same tools, same loop, fine-tuned vs. not — is the whole point; without
it, "fine-tuning helps" is just an assertion.

## 3. A worked instance

Financial-filing question-answering is one domain where this is concrete rather than
abstract: sector-specialized workers, tool-grounded calculation, and an explicit
escalation policy when a computed answer can't be verified against cited evidence. See
the related post below for the full worked treatment — evidence-citation CoT format,
the dataset-generation pipeline, and the honest limitations.

## 4. Open questions

- What does escalation-aware training data actually look like — synthetic loop
  trajectories with injected failures, or mined from real multi-turn agent logs?
- Is the gain from fine-tuning-for-escalation separable from the gain of just having
  _more_ loop iterations at inference time (a cheaper alternative worth ruling out
  first)?
- Does this generalize across domains, or is "when to escalate" domain-specific enough
  that a single fine-tuned escalation policy doesn't transfer?
