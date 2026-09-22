---
layout: post
title: "Does the Chain of Thought Say What the Model Actually Did? The Faithfulness Problem"
date: 2026-09-20 21:00:00+0900
description: "Explicit chain-of-thought reads as a reasoning trace, but two papers show it can be a post-hoc story instead — and, more troublingly, that more capable models tend to produce less faithful explanations. What 'faithful' means, the two core results, and why this is the real argument for latent reasoning."
tags: chain-of-thought faithfulness interpretability latent-reasoning paper-review
categories: [llm, ai-agents]
related:
  - slug: coghp-latent-chain-of-thought
    note: "the latent-CoT case this post's conclusion motivates — reasoning that was never verbalized can't be unfaithful the way explicit CoT can"
  - slug: coconut-continuous-latent-reasoning
    note: "the LLM-native mechanism for the latent-reasoning alternative this post argues for"
  - slug: latent-reasoning-landscape
    note: "the wider survey map — this post's argument is why the whole landscape exists"
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic body, professor-cautious throughout — this is a "here's what two
> specific papers actually showed" post, not a broad claim about all chain-of-thought.

## 0. What "faithful" means here

Chain-of-thought prompting {% cite wei2022cot --file references %} produces text that
_looks like_ a reasoning trace — intermediate steps before an answer. The question this
post is about: **does that text actually describe the computation that produced the
answer, or is it a plausible-sounding story generated after the fact?** A CoT is
**faithful** if the stated reasoning is what actually determined the output; it's
**unfaithful** if the model would have reached the same answer for reasons it never
mentions — sometimes reasons it couldn't or wouldn't state.

This isn't a philosophical question. It has a direct empirical answer, and two papers
answer it in ways that should change how much you trust a CoT trace at face value.

## 1. Turpin et al. — the model doesn't mention the real cause

{% cite turpin2023unfaithful --file references %} runs a simple, sharp experiment:
take a multiple-choice task, and **bias** the model toward a wrong answer in a way
it's never asked to justify — for example, silently reordering the answer choices so
the correct answer is always option (A) in the few-shot examples the model sees. Models
pick up on this bias and their accuracy drops — by as much as 36% across a 13-task suite
from BIG-Bench Hard — but the chain-of-thought they generate **never mentions the
biasing feature**. It produces a fluent, plausible-sounding justification for whatever
answer the bias pushed it toward, as if that were the real reason all along.

> **The core result, stated plainly.** The explanation and the actual cause of the
> answer can come apart, and the model gives no sign that this has happened. A reader
> of the CoT alone has no way to detect the unfaithfulness from the trace itself.

This is the sharpest possible counterexample to "the CoT shows you the reasoning":
here, it demonstrably doesn't — it shows you a reasoning-shaped artifact.

## 2. Lanham et al. — faithfulness varies, and scale doesn't obviously help

{% cite lanham2023measuring --file references %} takes a broader, more systematic
approach: several interventions on the CoT itself (truncating it early, paraphrasing
it, adding mistakes into it) to see how much the _final answer_ actually depends on the
specific stated reasoning, across many tasks.

Two findings matter most:

- **Faithfulness varies a lot by task.** Some tasks show CoT that's load-bearing — change
  the reasoning, change the answer, consistent with the trace being real computation.
  Others show large amounts of post-hoc reasoning — the answer barely moves no matter
  what the stated steps say.
- **Bigger, more capable models are not more faithful — often the opposite.** Larger
  models in the study tended to produce _less_ faithful reasoning on most of the tasks
  examined. This cuts against the comfortable assumption that faithfulness is a
  capability that scales up for free.

Between the two papers, the honest picture is: faithfulness isn't a fixed property of
"using chain-of-thought" — it's task-dependent, model-dependent, and not guaranteed to
improve as models get better.

## 3. Why this is the real argument for latent reasoning

The instinct these results should _not_ produce is "so don't trust CoT, use free-text
reasoning less." The more interesting move is the one explored in the
<a href="{{ '/blog/2026/coghp-latent-chain-of-thought/' | relative_url }}">CoGHP
post</a>: if a verbalized chain can silently diverge from the real computation, then the
verbalization itself is the vulnerable step — not the reasoning process underneath it.
**Reasoning that happens in latent space and is never asked to justify itself in
words can't be "unfaithful" in Turpin's sense**, because there's no separate narrative
layer to diverge from the computation. That doesn't make latent reasoning
_trustworthy_ — it makes a different, arguably harder problem: you've traded "the
explanation might be lying" for "there's no explanation to check at all." Which
problem you'd rather have depends on what you actually need — legibility, or
correctness with an opaque mechanism.

## 4. Open questions

- Turpin's bias-reordering trick is one specific intervention. How broad is the class
  of biasing features a model will silently pick up on without reporting?
- Lanham's finding that scale doesn't help faithfulness is the more uncomfortable
  result of the two — is that still true for the current generation of models, or was
  it specific to the models tested in 2023?
- If verbalized CoT can't be trusted at face value and latent reasoning can't be
  inspected at all, what would an actual faithfulness _test_ for a black-box reasoning
  process look like — something short of full mechanistic interpretability?

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
