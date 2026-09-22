---
layout: page
title: Eastside — an agentic browser you own end-to-end
description: A desktop AI browser where the app is the browser itself (bundled Chromium) and an agent drives it with per-action consent — no browser-use, no Playwright in the path.
category: agents
importance: 1
---

An agentic browser built to own the full stack above Chromium, not sit on top of someone else's automation layer.

- **The whole stack is owned, not borrowed.** The app drives bundled Chromium directly via CDP — the observation/indexing layer, the action registry, the consent/trust layer, memory, and the job runner are all custom, not assembled from browser-use or Playwright.
- **Agent-loop quality comes first, deliberately.** Per an explicit project directive, everything else (wiki, workspace, UI) is meaningless if the underlying agent loop is weak — so the measure is one large benchmark suite (Mind2Web + OSWorld tasks merged into a single runnable set, ~300 tasks, each graded by its own verifier) run through the same `TaskRuntime` a real user goal takes, improved by reading failing checkpoints and fixing the single structural cause each time.
- **No hardcoded task templates.** Capability comes from a general LLM-driven planner that derives a completion contract and sub-goal stack for any goal — the same structure handles a place lookup, a purchase, or a research task, on any site, in any language, with zero per-task-shape branches (vertical templates were explicitly ripped out during development).

Grew out of the East Manus study (a Claude-Code-style reference agent), which still supplies model/session/tool infrastructure underneath.

**Collaboration.** Co-working with [Baryon AI Laboratory](https://github.com/baryonlabs)
on the desktop/browser-in-one-window direction — their
[OpenWorkCompiler](https://github.com/baryonlabs/workcompiler) explores the adjacent
problem of compiling verified agent work into deterministic, repeatable execution, and
their desktop product covers similar browser+AI+terminal-in-one-window territory with
an embedded "webclaw" controlled browser — the same component name already used inside
this codebase.

Code is private.
