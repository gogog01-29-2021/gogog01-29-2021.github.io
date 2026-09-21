---
layout: page
title: "Capstone Simulator — post-training MarS, and testing what a restricted agent loses"
description: Two studies built on top of the open-source MarS market simulation engine — does post-training the simulator make it more realistic, and does restricting a trading agent to model-proposed orders help or hurt execution?
category: finance
importance: 3
---

Research code for two studies, both built on top of [MarS](https://arxiv.org/abs/2409.07486) — Microsoft/FAIR's open-source financial market simulation engine — rather than a simulator built from scratch.

- **Study 1 — does post-training the simulator help?** Train the simulator's OSM/ensemble weights further using externally-placed-order feedback (via DPO and ReST), then check: do the simulator's _later_ generated market responses look more like real observed responses than an untrained baseline?
- **Study 2 — does restricting the agent's order set help or hurt?** Freeze the simulator, then compare a trading agent that can only pick from _model-proposed_ orders against one that can pick from _every legal order_ — repeated across two different value-network designs, to see if the restriction is a help (less to search) or a hurt (loses good orders the model didn't propose).
- **What's actually built vs. not**, stated plainly rather than glossed over: the local training/eval pipeline, the runtime rules, and a synthetic CI suite are in place and working. Full CUDA runs with real trained weights, and the held-out paper-table results that would actually answer the two research questions above, are **not yet complete**.

Code is private.
