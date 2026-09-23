---
layout: page
title: Eastside — an agentic browser you own end-to-end
description: A desktop AI browser where the app is the browser itself (bundled Chromium) and an agent drives it with per-action consent — no browser-use, no Playwright in the path.
category: agents
importance: 1
---

An agentic browser built to own the full stack above Chromium, not sit on top of someone else's automation layer.

- **The whole stack is owned, not borrowed.** The app drives bundled Chromium directly via CDP — the observation/indexing layer, the action registry, the consent/trust layer, memory, and the job runner are all custom, not assembled from browser-use or Playwright.
- **An honest self-critique drove a real rebuild.** An architecture review named the actual problem plainly: the project had become "an LLM with a growing toolbox on an 8-turn chat loop, not a stateful agent runtime" — lots of tools, no shared model of goal/plan/state/permissions/progress. The fix is `TaskRuntime`: `goal → plan → {observe → propose → execute → verify → checkpoint} → recover → resume`, with a durable plan + fact ledger persisted to disk so a task can actually pause and resume, not just retry from zero.
- **Verification is real, not string-matching.** Every action is checked against its expected outcome; unverified side effects are never auto-repeated (only reads retry). Low-confidence perception triggers human handoff instead of a guessed click.
- **Five real execution backends**, routed by action — not one shell pretending to be five: `browser` (DOM via CDP), `api` (real HTTP/REST, no DOM), `mcp` (real Model Context Protocol tools — filesystem/git/db/SaaS), `os` (native macOS control, AX-tree-first so it reads real UI elements by name instead of guessing from pixels), and `human` (handoff).
- **Competitive gap, measured and root-caused rather than assumed.** Benchmarked against a competitor's self-reported ~99% on a Mind2Web slice while sitting at ~40/346 — read the competitor's own trajectories rather than guess why, and found one concrete architectural fact: their locators re-resolve at action time so multiple actions can batch without re-observing, while the DOM-snapshot approach here went stale the instant the page changed. That's now being fixed at the root (stable-id/CSS-path locators), not patched around.
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
