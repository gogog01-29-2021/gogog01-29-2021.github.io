---
layout: post
title: "Sector-Specialized Financial LLMs: Filing Evidence, Calculation Tools, and Verifiable Reasoning"
date: 2026-09-14 12:00:00+0900
description: "A research-framing post: why nobody has combined fine-tuning, an agent loop, and escalation for evidence-grounded financial reasoning — and the two open questions that matter most (a chain-of-thought method for tool-verifiable calculation, and how to generate training data for it)."
tags: financial-llm chain-of-thought tool-use agent-loop orchestrator-workers retrieval-augmentation
categories: [llm, ai-agents, math, probability-finance, finance]
related_posts: false
toc:
  sidebar: left
---

> Tone: clean-academic framing + professor-cautious limitations. This is a research-idea
> post, not a product writeup — implementation names and proprietary specifics are
> deliberately left out; the architecture and open questions are what's real here.

## 0. The setup

General-purpose LLMs asked to reason over a financial filing — "calculate operating
margin from this 10-K and show your work" — tend to fail in one of two ways: they get
the number wrong, or they get it right but produce a reasoning trace that can't actually
be checked against the source. Neither is acceptable if the answer is going to inform a
real decision. This post is about what it would take to fix that properly: sector
specialization, tool-grounded computation, and a reasoning chain a human can verify step
by step.

## 1. The gap

Three ideas already exist separately in the agent literature:

- **Orchestrator–Workers** — a controller decomposes a task and dispatches it to
  specialized sub-agents (sector-specific "workers," here).
- **Augmented function-calling** — the model interleaves reasoning with real tool
  invocations (retrieval, calculators) instead of doing arithmetic in free text
  {% cite yao2022react --file references %} {% cite schick2023toolformer --file references %}.
- **The agent loop** — iterate, check the result, retry or escalate to a human/larger
  model on failure.

What's missing from the literature is the **combination**: fine-tuning a model
specifically to work inside a loop that can escalate, rather than treating tool-calling,
looping, and specialization as independent add-ons to a frozen general-purpose model.
That combination is the actual research gap this post is about.

## 2. The problem, concretely

Take operating margin: `(Revenue − Operating Expenses) / Revenue`. A model given a
filing needs to (a) locate the right revenue and operating-expense line items — which
may be labeled inconsistently across companies and years, (b) compute the ratio
correctly, and (c) produce a chain that cites *which* filing line each number came from,
so the computation is auditable rather than asserted. Generic chain-of-thought
{% cite wei2022cot --file references %} gets you a plausible-looking narrative, not a
verifiable one — there's no mechanism forcing the "reasoning" to actually correspond to
the tool calls that produced the number.

## 3. RQ1 — a CoT method for tool-verifiable reasoning

**What chain-of-thought structure lets a model interleave "cite evidence → invoke a
calculation tool → produce a checkable reasoning chain," rather than free-text
arithmetic that only looks rigorous?**

The shape of an answer probably isn't "better prompting" — it's a CoT format where each
reasoning step is *typed*: an evidence-citation step (pointer into the filing, not
paraphrased), a tool-call step (a real calculator invocation, not mental math), and a
composition step (how the tool outputs combine into the final answer). The chain becomes
mechanically re-checkable: replay the tool calls against the cited evidence and see if
you get the same number.

## 4. RQ2 — where does the training data come from?

**How do you generate a dataset that teaches this behavior**, rather than relying on a
general-purpose model to improvise it at inference time?

The pipeline question breaks into stages: a corpus of real filings → extraction of
labeled line items → a bank of calculation templates (margin, growth rate, leverage
ratios, …) → synthetic tool-augmented reasoning chains generated against real evidence →
a verification/filtering pass that throws out any chain whose final tool output doesn't
match the ground-truth calculation. The hard part isn't generating chains — it's
generating chains that are *provably* grounded, so the training signal doesn't just
teach a model to sound rigorous.

---

<div id="fx-llm-gate" style="border:1px solid var(--global-divider-color, #ccc);border-radius:8px;padding:1.25rem;margin:2rem 0;">
  <p id="fx-llm-teaser-note">The rest of this article — the proposed architecture
  (Orchestrator–Workers + augmented function-calling + an escalation policy), what was
  actually tested, and the honest limitations — is for members.</p>
  <p>
    <a href="https://buy.polar.sh/polar_cl_EqK1dtzQf8Egi1AKRSWxoySCfM0PU5N7bF9iX4YXrk0" target="_blank" rel="noopener">Become a member — $30/month</a>
    &nbsp;|&nbsp; Already a member?
  </p>
  <input type="text" id="fx-llm-key" placeholder="Enter your license key" style="padding:0.4rem;width:60%;max-width:320px;">
  <button id="fx-llm-unlock">Unlock</button>
  <div id="fx-llm-status" style="margin-top:0.5rem;font-size:0.9em;opacity:0.7;"></div>
  <div id="fx-llm-content" style="margin-top:1.5rem;"></div>
</div>

<script>
(function () {
  var btn = document.getElementById('fx-llm-unlock');
  var input = document.getElementById('fx-llm-key');
  var status = document.getElementById('fx-llm-status');
  var content = document.getElementById('fx-llm-content');
  var note = document.getElementById('fx-llm-teaser-note');
  btn.addEventListener('click', function () {
    var key = input.value.trim();
    if (!key) { status.textContent = 'Enter a license key first.'; return; }
    status.textContent = 'Checking…';
    fetch('https://blog-paywall.irongalactico0000.workers.dev/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'sector-specialized-financial-llms', license_key: key })
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data.ok) {
        status.textContent = '';
        content.innerHTML = data.content;
        if (note) note.style.display = 'none';
      } else {
        status.textContent = data.error || 'Could not verify that key.';
      }
    }).catch(function () {
      status.textContent = 'Network error — try again.';
    });
  });
})();
</script>
