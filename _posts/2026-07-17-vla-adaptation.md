---
layout: post
title: "VLA models through the lens of adaptation"
date: 2026-07-17 10:00:00+0900
description: "A survey-first deep dive into vision-language-action models, organized around the one axis that actually measures progress — adaptation across bodies, tasks, action spaces, and distributions — with Qwen-VLA as the worked case."
tags: vla robot-foundation-model embodied-ai diffusion-transformer flow-matching adaptation survey
categories: [robotics-embodied, vla]
related_posts: false
toc:
  sidebar: left
---

$$
\newcommand{\obs}{o}
\newcommand{\act}{a}
\newcommand{\policy}{\pi}
\newcommand{\R}{\mathbb{R}}
$$

> This is a survey-first note: **map the field and its sub-problems before any one
> system takes the stage.** [Qwen-VLA]({{ '/blog/2026/qwen-vla/' | relative_url }})
> {% cite qwen2026vla --file references %} appears only as *one point* in a design
> space that exists with or without it. Numbers attributed to a paper are stated as
> that paper reports them; my own judgment is quarantined to §D.

## A. The field first

### A.1 What a vision-language-action model is

A **vision-language-action (VLA)** model is a policy that maps visual observations
$\obs_t$ and a natural-language instruction $\ell$ to robot actions $\act_t$:

$$
\policy_\theta:\; (\obs_{1:t},\, \ell)\; \longmapsto\; \act_t \in \mathcal{A}.
$$

The lineage is short and fast. RT-1 {% cite brohan2022rt1 --file references %} showed a
single transformer absorbing large-scale real-robot data; RT-2
{% cite brohan2023rt2 --file references %} made the decisive move of *reusing a
vision-language model's web knowledge* by emitting actions as text tokens; PaLM-E
{% cite driess2023palme --file references %} folded continuous sensor states into the
language model itself. OpenVLA {% cite kim2024openvla --file references %} and Octo
{% cite ghosh2024octo --file references %} opened the recipe; RoboFlamingo
{% cite li2023roboflamingo --file references %} showed a VLM backbone is an effective
imitator; $\pi_0$ {% cite black2024pi0 --file references %} replaced discrete action
tokens with a **flow-matching** continuous decoder.

### A.2 Why *adaptation* is the right axis

It is tempting to rank VLAs by a headline success rate. That is the wrong axis. A
policy that scores 97% on one benchmark suite and collapses on a new robot, a new
task family, or a mildly shifted environment has not demonstrated a *foundation
model* — it has demonstrated overfitting at scale.

> **Claim (the axis).** The quantity that separates a benchmark policy from an
> embodied foundation model is **adaptation**: how cheaply one set of weights
> survives a change of *body*, *task*, *action space*, or *distribution*.

The rest of this note is organized around those four changes.

## B. The four adaptations

### B.1 Embodiment adaptation — one policy, many bodies

Different robots have different kinematics, sensors, and control conventions. The
naive fix is a per-robot output head; it does not scale and it forbids transfer.
Two lines attack this. Open X-Embodiment {% cite padalkar2024openx --file references %}
pooled 22 robots into one dataset and trained RT-X models that transfer across
bodies; CrossFormer {% cite doshi2024crossformer --file references %} pushed further —
a *single* transformer across manipulation, navigation, locomotion, and aviation with
no manual action/observation-space alignment. On the navigation side, ViNT
{% cite shah2023vint --file references %} is a cross-robot navigation foundation model
with positive transfer to unseen platforms.

The newest lever is to describe the body **in language**. Instead of a learned
embodiment embedding, a textual description of the current robot and its control
convention is placed in the prompt — so the *same* weights specialize at inference by
reading who they are driving. This is the "tool-schema" pattern from software agents,
imported into robotics.

### B.2 Task adaptation — manipulation, navigation, and trajectory in one model

Manipulation, navigation, and trajectory prediction are historically three fields
with three benchmark cultures. The generalist bet is that they are one problem —
conditional sequence generation over actions — and that joint training transfers.
GATO {% cite reed2022gato --file references %} made the maximalist version of this bet
(one network, 600+ tasks across modalities). In robotics specifically, the unification
is now concrete: navigation is cast as action-and-trajectory prediction over the same
interface as manipulation, evaluated on VLN benchmarks R2R
{% cite anderson2018r2r --file references %} and RxR {% cite ku2020rxr --file references %}
alongside manipulation suites.

### B.3 Action-space adaptation — discrete tokens vs continuous flow

How a VLA *emits* an action is a real design axis, not an implementation detail.

- **Discrete tokens.** RT-2 {% cite brohan2023rt2 --file references %} bins each
  action dimension into integer tokens in the VLM vocabulary. Simple, reuses the LM
  head — but quantization caps precision and control rate. FAST
  {% cite pertsch2025fast --file references %} improves this with frequency-space (DCT)
  tokenization for autoregressive VLAs.
- **Continuous generative decoding.** Diffusion Policy
  {% cite chi2023diffusion --file references %} models an action chunk as a conditional
  denoising process; ACT {% cite zhao2023act --file references %} predicts a chunk with a
  CVAE/transformer. The architectural enabler is the Diffusion Transformer
  {% cite peebles2023dit --file references %}, and the training objective that $\pi_0$
  {% cite black2024pi0 --file references %} and Qwen-VLA adopt is **flow matching**
  {% cite lipman2023flowmatching --file references %}.

> **Flow matching, in one line.** Learn a velocity field $v_\theta(x,\tau\mid c)$ so
> that integrating the ODE $\;\dot{x}=v_\theta(x,\tau\mid c)\;$ from noise $x_0\sim
> \mathcal{N}(0,I)$ at $\tau{=}0$ to $\tau{=}1$ lands on a valid action chunk $x_1$,
> conditioned on the VLM's language+vision tokens $c$. Continuous, high-precision,
> and it sidesteps action quantization — at the cost of an ODE solve per action.

### B.4 Distribution / OOD adaptation — the honest frontier

The final and hardest change is distribution. SimplerEnv
{% cite li2024simplerenv --file references %} exists precisely to measure the sim-to-real
and cross-setup gap for manipulation; LIBERO {% cite liu2023libero --file references %}
probes lifelong transfer across task suites; real-world ALOHA
{% cite zhao2023act --file references %} out-of-distribution trials and *dynamic*
manipulation (moving targets) are where reported numbers fall hardest. This is the axis
on which "foundation model" claims should be stress-tested, not the in-distribution
suites.

## C. Qwen-VLA as the worked case

Qwen-VLA {% cite qwen2026vla --file references %} threads all four axes:

- **Action space** — a **1.15B DiT flow-matching** action decoder on a **Qwen3.5-4B**
  VLM backbone (continuous, §B.3).
- **Embodiment** — **embodiment-aware prompt conditioning**: the body and control
  convention are described in text, no per-platform head (§B.1).
- **Task** — manipulation, navigation, and trajectory folded into one
  action-and-trajectory objective (§B.2).
- **Distribution** — evaluated out to real-world ALOHA OOD and dynamic manipulation
  (§B.4).

Reported scores (as stated by the paper): 97.9% LIBERO, 73.7% Simpler-WidowX,
86.1/87.2% RoboTwin Easy/Hard, 69.0% R2R OSR, 59.6% RxR SR, 76.9% avg ALOHA OOD, and
**26.6% zero-shot on DOMINO** dynamic manipulation. The full reading note is
[here]({{ '/blog/2026/qwen-vla/' | relative_url }}).

## D. Reading it critically

*(This section is deliberately cautious — hedged where the evidence is.)*

A benchmark table is a claim, not a proof. Five questions decide whether the numbers
mean progress:

1. **Baselines.** Is each score against a specialist SOTA or a weak generalist? A high
   number against the wrong baseline measures nothing.
2. **Train–test split.** How much of LIBERO/R2R/RxR distribution entered the joint
   pretraining mix? Generalist scores are only credible if the evaluation split was
   genuinely held out.
3. **Embodiment-OOD definition.** "New embodiment" is meaningful only if the control
   convention was truly unseen — otherwise it is in-distribution wearing a costume.
4. **Action normalization.** Cross-embodiment results hinge on how joint/action spaces
   are normalized; a favorable normalization can manufacture transfer.
5. **Inference latency.** A flow-matching ODE solve is not free. Real-robot control
   rate — not just success rate — determines whether the policy is deployable.

> **The number that reads both ways.** DOMINO zero-shot **26.6%** is simultaneously
> evidence that cross-task transfer to *dynamic* manipulation is non-trivially
> possible **and** evidence that dynamic manipulation remains largely unsolved.
> Promise and open problem in one figure — and a caution against reading the
> in-distribution 97.9% as the headline.

## E. Where it points

The trajectory is clear even if the destination is not. The field is converging on:
continuous flow/diffusion decoders over discrete tokens; language-described
embodiment over learned embodiment embeddings; and joint manipulation-navigation-
trajectory training over siloed policies. What remains genuinely open — and where I
would place research effort — is the fourth axis: **dynamic, out-of-distribution
adaptation**, where even the strongest current numbers are low. A VLA that is an
embodied *foundation* model, rather than a very good benchmark policy, will be decided
there.

## Reference map

*Not a flat list — a **clustered web**. Each paper links to its **[arXiv]** (formal) and,
where one exists, an **[on this blog]** deep-note (informal). The **→** edges are the
spider: follow them to jump from any paper to the work it builds on or leads to.*

### ① The VLA lineage — *scale → web-knowledge → open → continuous*

> RT-1 proved scale on real-robot data; **RT-2** turned actions into web-knowledge text
> tokens; **OpenVLA / Octo** opened the recipe; **π0** made the decoder continuous —
> the move that **Qwen-VLA** inherits.

- <a id="rm-rt1"></a>**RT-1** · [arXiv](https://arxiv.org/abs/2212.06817) · [project](https://robotics-transformer1.github.io/) — transformer at real-robot scale. → leads to [RT-2](#rm-rt2)
- <a id="rm-rt2"></a>**RT-2** · [arXiv](https://arxiv.org/abs/2307.15818) · [project](https://robotics-transformer2.github.io/) — actions as text tokens (web knowledge). → open version [OpenVLA](#rm-openvla); continuous successor [π0](#rm-pi0); token axis [§B.3](#b3-action-space-adaptation--discrete-tokens-vs-continuous-flow)
- <a id="rm-palme"></a>**PaLM-E** · [arXiv](https://arxiv.org/abs/2303.03378) — sensor states inside the LM. → sibling [RT-2](#rm-rt2)
- <a id="rm-openvla"></a>**OpenVLA** · [arXiv](https://arxiv.org/abs/2406.09246) · [project](https://openvla.github.io/) — open VLA recipe. → generalist cousin [Octo](#rm-octo)
- <a id="rm-octo"></a>**Octo** · [arXiv](https://arxiv.org/abs/2405.12213) · [project](https://octo-models.github.io/) — open generalist policy. → cross-body [CrossFormer](#rm-crossformer)
- <a id="rm-roboflamingo"></a>**RoboFlamingo** · [arXiv](https://arxiv.org/abs/2311.01378) — VLM backbone as imitator. → backbone idea in [Qwen-VLA](#rm-qwen)
- <a id="rm-pi0"></a>**π0** · [arXiv](https://arxiv.org/abs/2410.24164) · [project](https://www.physicalintelligence.company/blog/pi0) — flow-matching continuous decoder. → same decoder family as [Qwen-VLA](#rm-qwen); theory [Flow Matching](#rm-flow)

### ② How actions are emitted — *discrete tokens vs continuous flow*

> The fork of §B.3: quantize actions into tokens, or generate them continuously.

- <a id="rm-fast"></a>**FAST** · [arXiv](https://arxiv.org/abs/2501.09747) — frequency-space action tokens. → discrete counterpart to [Diffusion Policy](#rm-dp); pairs with [RT-2](#rm-rt2)
- <a id="rm-dp"></a>**Diffusion Policy** · [arXiv](https://arxiv.org/abs/2303.04137) · [project](https://diffusion-policy.cs.columbia.edu/) — action chunk as denoising. → architecture [DiT](#rm-dit); chunking [ACT](#rm-act)
- <a id="rm-act"></a>**ACT / ALOHA** · [arXiv](https://arxiv.org/abs/2304.13705) · [project](https://tonyzhaozh.github.io/aloha/) — action chunking + low-cost bimanual. → also a benchmark, see [④](#rm-aloha-bench)
- <a id="rm-dit"></a>**DiT** · [arXiv](https://arxiv.org/abs/2212.09748) — transformer diffusion backbone. → the decoder in [π0](#rm-pi0) and [Qwen-VLA](#rm-qwen)
- <a id="rm-flow"></a>**Flow Matching** · [arXiv](https://arxiv.org/abs/2210.02747) — the training objective. → used by [π0](#rm-pi0), [Qwen-VLA](#rm-qwen)

### ③ One policy, many bodies — *embodiment & task unification*

> The §B.1–B.2 bet: pool bodies and tasks into one policy.

- <a id="rm-openx"></a>**Open X-Embodiment** · [arXiv](https://arxiv.org/abs/2310.08864) · [project](https://robotics-transformer-x.github.io/) — 22-robot pooled dataset + RT-X. → scaled by [CrossFormer](#rm-crossformer)
- <a id="rm-crossformer"></a>**CrossFormer** · [arXiv](https://arxiv.org/abs/2408.11812) · [project](https://crossformer-model.github.io/) — one transformer across 20 embodiments. → language-described bodies in [Qwen-VLA](#rm-qwen)
- <a id="rm-vint"></a>**ViNT** · [arXiv](https://arxiv.org/abs/2306.14846) · [project](https://general-navigation-models.github.io/vint/) — cross-robot navigation foundation. → navigation benchmarks [R2R](#rm-r2r)/[RxR](#rm-rxr)
- <a id="rm-gato"></a>**GATO** · [arXiv](https://arxiv.org/abs/2205.06175) · [blog](https://deepmind.google/discover/blog/a-generalist-agent/) — one net, 600+ tasks. → maximalist ancestor of [Qwen-VLA](#rm-qwen)

### ④ Where we measure — *benchmarks*

> The §B.4 proving grounds. Qwen-VLA is scored on all of these.

- <a id="rm-libero"></a>**LIBERO** · [arXiv](https://arxiv.org/abs/2306.03310) · [project](https://libero-project.github.io/main.html) — lifelong-transfer manipulation.
- <a id="rm-simpler"></a>**SimplerEnv** · [arXiv](https://arxiv.org/abs/2405.05941) · [project](https://simpler-env.github.io/) — real-to-sim manipulation eval.
- <a id="rm-r2r"></a>**R2R** · [arXiv](https://arxiv.org/abs/1711.07280) — vision-and-language navigation. → multilingual scale-up [RxR](#rm-rxr)
- <a id="rm-rxr"></a>**RxR** · [arXiv](https://arxiv.org/abs/2010.07954) — multilingual, denser VLN.
- <a id="rm-aloha-bench"></a>**ALOHA (real-world OOD)** · [arXiv](https://arxiv.org/abs/2304.13705) · [project](https://tonyzhaozh.github.io/aloha/) — the OOD stress test. → method side [②](#rm-act)

### ⑤ The anchor

- <a id="rm-qwen"></a>**Qwen-VLA** · [arXiv](https://arxiv.org/abs/2605.30280) · [on this blog]({{ '/blog/2026/qwen-vla/' | relative_url }}) — pulls the flow-matching decoder from [②](#rm-flow), language-described embodiment from [③](#rm-crossformer), and is scored on [④](#rm-libero). The worked case of §C.

<details markdown="1">
<summary>Formal cited bibliography (auto-generated)</summary>

{% bibliography --file references --cited %}

</details>

*All entries are established works with verified arXiv identifiers. Very recent (2025–26)
systems named in prose — RoboTwin, DOMINO, NaVILA, Uni-NaVid, RoboCat — are mentioned but
not formally cited pending second-source venue confirmation. **Informal / project-page
links** can be layered onto each node next (verified before adding — none fabricated).*
