---
layout: page
title: "FBAQuant — deep hedging with RL"
description: Reinforcement-learning approach to option hedging — reward-function design for a hedging agent, grounded against the Kelly Criterion literature rather than an ad-hoc objective.
category: finance
importance: 4
---

A reinforcement-learning take on option hedging: train an agent to choose hedging
actions directly, rather than compute a hedge ratio analytically. The real work is in
reward-function design, not the RL algorithm itself.

{% include paywall_gate.liquid
  slug="fbaquant-deep-hedging"
  free_desc="the project overview — the approach, and how it's grounded against the Kelly Criterion literature."
  paid_desc="the actual reward-design iteration history — what changed at each stage and why, straight from the repo's own file history."
  free_url="https://buy.polar.sh/polar_cl_5wY0a1FkMnaZW2PjhSWaMIjB0JD4uwgXeLhDm2pzmnj"
  paid_url="https://buy.polar.sh/polar_cl_EqK1dtzQf8Egi1AKRSWxoySCfM0PU5N7bF9iX4YXrk0"
%}
