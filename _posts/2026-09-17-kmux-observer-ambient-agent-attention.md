---
layout: post
title: "Ambient Attention for Long-Running Agent Sessions: kmux-observer"
date: 2026-09-17 06:00:00+0900
description: "Dashboards fail for watching multiple long-running AI agent sessions — context-switch cost, staleness, visual noise, disconnection from the actual session. kmux-observer's answer: treat sessions like browser tabs, not dashboard rows. What it is, what's actually built (v0.1) vs. planned, and how it connects to the agent-loop escalation question."
tags: agent-observability multi-agent developer-tooling agent-loop vertical
categories: [llm, ai-agents]
related:
  - slug: orchestrator-workers-augfc-agent-loop
    note: "the complementary half — that post asks when a model should escalate itself; this one asks when a human's attention should get pulled to a session"
  - slug: orchestration-patterns-landscape
    note: "the survey's open question — none of the 4 compared patterns answer when a human, not just a bigger model, should get pulled in"
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic framing, project-note detail level. This documents a real, small,
> working v0.1 — status claims are checked against the actual source, not aspirational.

## 0. The problem

Running several long-lived AI agent sessions in parallel creates a genuine attention
problem: which session needs you right now? The obvious answer — build a dashboard — has
a specific, recurring failure mode. A dashboard is a _summary_, one step removed from the
thing it summarizes: by the time you notice a row, the underlying session has often moved
on, the summary is stale, and switching from "the dashboard" to "the actual session" is
itself a context switch with its own cost. Enough sessions and the dashboard becomes
noise you learn to ignore — which defeats the purpose.

## 1. The insight

A browser tab isn't a dashboard row. Each tab is a full, self-contained, _actionable_
context — you don't read a summary of a tab and then go find the real thing, the tab _is_
the real thing, and its favicon/title already carries a compressed signal (spinner = still
loading, a notification badge = needs you) without being a separate artifact you have to
cross-reference. The bet behind kmux-observer: apply that model to AI agent sessions
instead of building a traditional dashboard.

## 2. The system

What's actually there, in `src/cli.ts` (476 lines, Bun):

- **Five states**, not a free-text status field: `in_progress`, `blocked`, `finished`,
  `error`, `idle` — each with a fixed icon and color, so the signal is glanceable rather
  than something you have to read.
- **A hook, not a poller.** Claude Code's own hook events (`kmux hook <event>`) push state
  changes as they happen — the tool doesn't scrape or guess at session state.
- **Delegates the actual UI to cmux.** Rather than building a separate window, it calls
  `cmux set-status` to push each session's state into cmux.app's existing sidebar — so
  there's exactly one place you're already looking, not a second app competing for
  attention. This matters for the browser-tab framing: the tabs need to live somewhere
  you'd already be.
- **Per-session event log.** Every event is appended as JSON Lines under `~/.kmux/events/`
  — a durable trail, not just current state, so a session's history survives past the
  live view.

## 3. Honest status

- **v0.1 — done.** Smoke-tested: cards render in the cmux sidebar with the right
  icon/color per state. Not yet wired into the user's actual `~/.claude/settings.json` —
  that's a deliberate, separate approval step, not an oversight.
- **v0.2 — planned, not built.** Richer per-tool-call detail (file reads, web fetches, MCP
  calls) surfaced per session; an idle column driven by a timer rather than an explicit
  event; a "drift detector" subagent that flags a session that's wandered from its stated
  task.
- **v0.3 — planned, not built.** An automatic post-mortem report generated at session end
  — its own subagent, deliberately kept separate from the mux/observer core rather than
  folded in as a feature.
- **Explicitly deferred:** a headless mode (sessions surviving `cmux.app` quitting) would
  require forking cmux itself in Swift — shelved until actual dogfooding of the sidecar
  shows it's needed, not built speculatively ahead of that evidence.

## 4. Where this connects

The <a href="{{ '/blog/2026/orchestrator-workers-augfc-agent-loop/' | relative_url }}">agent-loop post</a>
asks whether a model can be trained to know _when it should escalate itself_ — a
model-facing question. kmux-observer is the human-facing mirror of the same underlying
problem: an agent loop, however well it escalates internally, still eventually needs a
human's attention at some point, and the interface for _that_ handoff has its own design
question, separate from what happens inside the loop. Neither half is solved by the
other.

## 5. Open questions

- Does the five-state model actually hold up as sessions get longer and more varied, or
  does it collapse into "in_progress" being overloaded (everything that isn't obviously
  blocked/finished/erroring gets lumped there, hiding real distinctions)?
- The planned "drift detector" is the more interesting piece architecturally — what
  would it actually take to notice a session has wandered, without just re-implementing a
  second, slower agent loop watching the first one?
