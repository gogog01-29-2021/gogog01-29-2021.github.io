---
layout: post
title: "Coconut: What It Actually Looks Like to Reason Without Words"
date: 2026-09-20 22:00:00+0900
description: "CoGHP showed latent chain-of-thought works in a control domain; the faithfulness post argued verbalized CoT is a real liability. Coconut is the LLM-native mechanism that closes the loop — reasoning as fed-back hidden states instead of decoded tokens — plus the honest cost: what you give up to get there."
tags: chain-of-thought latent-reasoning interpretability paper-review llm
categories: [llm, ai-agents]
related:
  - slug: cot-faithfulness
    note: "the faithfulness problem this mechanism sidesteps structurally, by removing the verbalization step entirely"
  - slug: coghp-latent-chain-of-thought
    note: "the same latent-CoT idea in a control/RL domain instead of language — same bet, different substrate"
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic body, professor-cautious on the limitations section. Third post
> in the reasoning series — read alongside the
> [CoT-faithfulness post]({{ '/blog/2026/cot-faithfulness/' | relative_url }}) and
> [CoGHP]({{ '/blog/2026/coghp-latent-chain-of-thought/' | relative_url }}).

## 0. Where this sits in the series

The [faithfulness post]({{ '/blog/2026/cot-faithfulness/' | relative_url }}) made a
structural argument: if verbalized chain-of-thought can silently diverge from the
actual computation {% cite turpin2023unfaithful --file references %}
{% cite lanham2023measuring --file references %}, the _verbalization step itself_ is
where things go wrong — not the reasoning underneath it. [CoGHP]({{
'/blog/2026/coghp-latent-chain-of-thought/' | relative_url }})
{% cite choi2026coghp --file references %} showed one instance of removing that step,
in a control domain: latent subgoals instead of language. **Coconut**
{% cite hao2024coconut --file references %} is the general-purpose version of the same
move, built directly into an LLM's own reasoning process.

## 1. The mechanism

Standard chain-of-thought {% cite wei2022cot --file references %}: at each reasoning
step, the model's hidden state gets **decoded into a token**, that token gets
re-embedded, and the next step conditions on the embedding of that decoded word.
Coconut's change is precisely to skip the decode-then-re-embed round trip: the model's
**last hidden state is fed back directly as the next input embedding**, no token in
between. The paper calls this a "continuous thought."

The model switches between two modes:

- **Language mode** — ordinary autoregressive generation, decoding hidden states to
  tokens as usual (used for the final answer, and for problem input).
- **Latent mode** — the hidden state is reused directly as the next input embedding;
  nothing is decoded to words during this phase.

> **The one-sentence version.** Chain-of-thought normally forces reasoning through a
> vocabulary-sized bottleneck at every step (the hidden state must collapse to _one_
> discrete token). Coconut removes the bottleneck — reasoning can stay in the model's
> full continuous representation space for as many steps as the latent phase runs.

## 2. Why this isn't just "faster CoT" — the BFS finding

The efficiency angle (skip token generation, save compute) is real but not the
interesting result. The actual finding: because a continuous hidden state isn't forced
to commit to one discrete token, it can **encode more than one plausible next reasoning
step at once** — a superposition over candidate continuations rather than a single
committed path. On a logical reasoning task (ProsQA) designed so that greedy,
single-path search fails but breadth-first exploration of multiple branches succeeds,
Coconut's continuous thoughts show behavior consistent with **implicit breadth-first
search** — higher accuracy than language-based CoT, with fewer generated tokens, on
exactly the task shape where committing early to one path is the failure mode.

This is the mechanistic version of the faithfulness argument: language CoT is forced to
pick one discrete next step and narrate it, even when the right move is to keep several
hypotheses alive. Continuous thought doesn't have that forcing function.

## 3. The honest cost

Three things this doesn't solve, stated plainly rather than glossed over:

- **You can't read out what a continuous thought means.** This is the direct trade the
  [faithfulness post]({{ '/blog/2026/cot-faithfulness/' | relative_url }}) named:
  language CoT can lie to you, but at least it's _checkable in principle_. A continuous
  thought is a vector in hidden-state space — there's no natural decoding back to "here
  is what the model was considering," short of interpretability tooling that doesn't
  exist yet for this specific mechanism.
- **Training isn't a drop-in change.** Getting a model to use latent mode well is not
  free — it requires a training curriculum that teaches the model when and how to use
  continuous thoughts, not just architectural plumbing.
- **Tested on structured reasoning tasks, not open-ended ones.** The strongest results
  (including the BFS behavior) are on tasks like ProsQA with clean, checkable logical
  structure. Whether the same mechanism helps on messier, open-ended reasoning is not
  the thing this paper demonstrates.

## 4. Open questions

- Does the implicit-BFS behavior generalize past clean logical-structure tasks like
  ProsQA, or is it specific to problems with an explicit branching structure to search
  over?
- Is there any way to get partial interpretability of a continuous thought without
  fully solving mechanistic interpretability — e.g., projecting it back toward the
  nearest discrete tokens as a lossy approximation, purely for auditing?
- CoGHP and Coconut arrived at structurally similar mechanisms (latent intermediate
  states instead of verbalized ones) from completely different starting points — offline
  RL and LLM reasoning. Is that convergence a coincidence, or is "skip the discrete
  bottleneck" the actually-general idea underneath both?

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
