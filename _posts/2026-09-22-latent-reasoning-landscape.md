---
layout: post
title: "The Latent / Continuous Reasoning Landscape: A Map"
date: 2026-09-22 22:00:00+0900
description: "Five real papers, one question: what do you do instead of verbalizing a reasoning step? A survey-style map (comparison table, tradeoffs, one-line thesis) to sit alongside the deep-dive posts — Pause Tokens, CoCoMix, Soft Thinking, Coconut, and CoGHP, compared on what each actually generates, whether it needs training, and whether it's inspectable."
tags: chain-of-thought latent-reasoning survey interpretability llm
categories: [llm, ai-agents]
related:
  - slug: coconut-continuous-latent-reasoning
    note: "the deep-dive this survey's paradigm #4 (Coconut) summarizes — read here first for the mechanism, there for the full typed worked example"
  - slug: cot-faithfulness
    note: "the problem (Turpin/Lanham) this whole landscape is a response to"
  - slug: coghp-latent-chain-of-thought
    note: "paradigm #5 below, worked out in a non-language domain"
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic, survey register — this post is a map, not an essay. Depth on
> any one paradigm lives in the linked deep-dive posts; this one is for orientation and
> comparison.

> **Original.** "We propose training and performing inference on language models with a
> learnable pause token... delaying the model's answer generation by manually appending
> dummy tokens." — {% cite goyal2023pause --file references %}, the earliest of the five
> papers below, and the most modest version of the idea.
>
> **Essence.** Every paper on this page is answering the same question with a different
> amount of ambition: if forcing a model through a discrete vocabulary token at every
> reasoning step is a constraint, not a law of nature, how far can you loosen it — from
> "just give it more time" (2023) to "let it reason in full continuous hidden-state
> space" (2024)? This post maps the five real answers, compared on what they actually
> do, not just what they're called.

## 0. Why leave the discrete-token space?

Standard chain-of-thought {% cite wei2022cot --file references %} forces every
intermediate reasoning step through the same bottleneck the final answer goes through:
collapse a continuous hidden state down to one vocabulary token, then re-embed that
token to continue. Two things follow from that constraint, independent of any single
paper: it's expensive (each step is a full generation step), and it's a lossy
compression (everything the hidden state was representing except the argmax winner is
discarded). Five real papers, in roughly chronological order, each relax a different
piece of that constraint.

## 1. Five ways to not-quite-verbalize a step

- **Pause Tokens** {% cite goyal2023pause --file references %} (Oct 2023) — the
  smallest move: insert learnable "pause" tokens the model must process before it's
  allowed to answer, buying extra computation without asking for a specific reasoning
  trace. Still fully discrete — the pause token is a real vocabulary token, just an
  uninformative one.
- **CoCoMix** {% cite tack2025cocomix --file references %} (Feb 2025) — moves the
  intervention to _pretraining_: predict continuous concepts (extracted via a
  pretrained sparse autoencoder) and interleave them into the hidden-state sequence
  alongside ordinary token representations, rather than reasoning in continuous space
  only at inference time.
- **Soft Thinking** {% cite zhang2025softthinking --file references %} (May 2025) —
  training-free: at inference, generate a probability-weighted mixture over the token
  embedding table instead of committing to one argmax token, so a single "soft" step
  can encode several plausible continuations at once.
- **Coconut** {% cite hao2024coconut --file references %} (Dec 2024, deep-dive
  [here]({{ '/blog/2026/coconut-continuous-latent-reasoning/' | relative_url }})) — the
  most direct version: skip decoding entirely, feed the model's own last hidden state
  back as the next input embedding, in a dedicated "latent mode" the model switches
  into and out of.
- **CoGHP** {% cite choi2026coghp --file references %} (2026, deep-dive
  [here]({{ '/blog/2026/coghp-latent-chain-of-thought/' | relative_url }})) — the same
  underlying bet in a domain that was never made of tokens to begin with: an offline RL
  control policy that generates a chain of latent subgoals, not language, before an
  action. Proof the idea isn't LLM-specific.

## 2. Comparison table

|               | What it actually generates                          | Needs training?                   | Inspectable?                                                                 | Applied at                         |
| ------------- | --------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| Pause Tokens  | a real (but content-free) vocabulary token          | Yes — full pretrain + finetune    | Yes (it's a token) but tells you nothing                                     | Pretrain + inference               |
| CoCoMix       | continuous SAE-derived concept vectors, interleaved | Yes — pretraining-level           | Partially — concepts are individually inspectable/steerable via the SAE      | Pretraining                        |
| Soft Thinking | probability-weighted mixture over token embeddings  | **No** — training-free            | Partially — still lives in token-embedding space, nearest-neighbor decodable | Inference only                     |
| Coconut       | the raw last hidden state, fed back directly        | Yes — needs a training curriculum | No — opaque hidden-state vector                                              | Inference (after special training) |
| CoGHP         | a latent subgoal in a learned goal-embedding space  | Yes — offline RL training         | No — opaque latent point                                                     | Inference (after special training) |

The two axes that actually separate these five: **does it need training at all**
(only Soft Thinking says no), and **does "continuous" mean a mixture over a fixed
vocabulary or a genuinely free hidden-state vector** (CoCoMix/Soft Thinking stay
anchored to the token embedding table; Coconut/CoGHP don't).

## 3. Read the deep dives for mechanism

This page is the map, not the territory — for the actual mechanism, worked examples,
and honest limitations of any one paradigm:

- [Coconut: what it actually looks like to reason without words]({{ '/blog/2026/coconut-continuous-latent-reasoning/' | relative_url }}) — typed pseudocode for the hidden-state feedback loop, the implicit-BFS finding, the honest interpretability cost.
- [Does the chain of thought say what the model actually did?]({{ '/blog/2026/cot-faithfulness/' | relative_url }}) — Turpin and Lanham's results, the actual empirical case that verbalized CoT can silently diverge from the real computation — the problem this whole landscape exists to route around.
- [CoGHP: latent chain-of-thought for long-horizon offline RL]({{ '/blog/2026/coghp-latent-chain-of-thought/' | relative_url }}) — the same idea worked out fully outside language.

## 4. Tradeoffs and open problems

- **The interpretability gradient is real and it's steep.** Pause Tokens is fully
  legible (it's a token) but says nothing. CoCoMix and Soft Thinking stay tethered to
  the token vocabulary, so there's at least a nearest-neighbor decoding available.
  Coconut and CoGHP give up that anchor entirely for the largest capability gain
  (Coconut's implicit BFS). Nobody has found a way to get both.
- **"Training-free" is a bigger deal than it sounds.** Four of the five paradigms need
  dedicated training; only Soft Thinking doesn't. That makes it the only one of the
  five that could plausibly be applied to an existing deployed model without a
  retraining cycle — worth weighing against the fact that it also produces the
  mildest capability change.
- **No paper here compares against another paper here.** Each of the five was
  benchmarked against classic CoT or task-specific baselines, not against the other
  four paradigms on this page. The comparison table above is this post's own
  synthesis, not a result any of the five papers reports.

## 5. One-line thesis

The field isn't converging on one mechanism for "reasoning without words" — it's
exploring a real spectrum from _token-anchored-but-free_ (Soft Thinking, CoCoMix) to
_fully unmoored from the vocabulary_ (Coconut, CoGHP), and the honest interpretability
cost rises the further along that spectrum you go.

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>
