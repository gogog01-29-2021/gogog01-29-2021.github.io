// Tiered content for the "Sector-Specialized Financial LLMs" post.
// Lives only in the Worker — never checked into the public Jekyll site.
// `free`  = unlocked by the $0 "Blog Free Login" license key (or a paid key, or the admin key).
// `paid`  = unlocked only by the $30/month "Blog Membership" license key (or the admin key).

const free = `
<h2>0. The setup</h2>
<p>
  General-purpose LLMs asked to reason over a financial filing — "calculate operating
  margin from this 10-K and show your work" — tend to fail in one of two ways: they get
  the number wrong, or they get it right but produce a reasoning trace that can't
  actually be checked against the source. Neither is acceptable if the answer is going
  to inform a real decision. This post is about what it would take to fix that properly:
  sector specialization, tool-grounded computation, and a reasoning chain a human can
  verify step by step.
</p>

<h2>1. The gap</h2>
<p>Three ideas already exist separately in the agent literature:</p>
<ul>
  <li><strong>Orchestrator–Workers</strong> — a controller decomposes a task and
  dispatches it to specialized sub-agents (sector-specific "workers," here).</li>
  <li><strong>Augmented function-calling</strong> — the model interleaves reasoning with
  real tool invocations (retrieval, calculators) instead of doing arithmetic in free text
  (<a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener">Yao et al., 2022 — ReAct</a>,
  <a href="https://arxiv.org/abs/2302.04761" target="_blank" rel="noopener">Schick et al., 2023 — Toolformer</a>).</li>
  <li><strong>The agent loop</strong> — iterate, check the result, retry or escalate to a
  human/larger model on failure.</li>
</ul>
<p>
  What's missing from the literature is the <strong>combination</strong>: fine-tuning a
  model specifically to work inside a loop that can escalate, rather than treating
  tool-calling, looping, and specialization as independent add-ons to a frozen
  general-purpose model. That combination is the actual research gap this post is about.
</p>

<h2>2. The problem, concretely</h2>
<p>
  Take operating margin: <code>(Revenue − Operating Expenses) / Revenue</code>. A model
  given a filing needs to (a) locate the right revenue and operating-expense line items —
  which may be labeled inconsistently across companies and years, (b) compute the ratio
  correctly, and (c) produce a chain that cites <em>which</em> filing line each number
  came from, so the computation is auditable rather than asserted. Generic
  chain-of-thought
  (<a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noopener">Wei et al., 2022</a>)
  gets you a plausible-looking narrative, not a verifiable one — there's no mechanism
  forcing the "reasoning" to actually correspond to the tool calls that produced the
  number.
</p>

<h2>3. RQ1 — a CoT method for tool-verifiable reasoning</h2>
<p>
  <strong>What chain-of-thought structure lets a model interleave "cite evidence →
  invoke a calculation tool → produce a checkable reasoning chain," rather than
  free-text arithmetic that only looks rigorous?</strong>
</p>
<p>
  The shape of an answer probably isn't "better prompting" — it's a CoT format where
  each reasoning step is <em>typed</em>: an evidence-citation step (pointer into the
  filing, not paraphrased), a tool-call step (a real calculator invocation, not mental
  math), and a composition step (how the tool outputs combine into the final answer).
  The chain becomes mechanically re-checkable: replay the tool calls against the cited
  evidence and see if you get the same number.
</p>

<h2>4. RQ2 — where does the training data come from?</h2>
<p>
  <strong>How do you generate a dataset that teaches this behavior</strong>, rather than
  relying on a general-purpose model to improvise it at inference time?
</p>
<p>
  The pipeline question breaks into stages: a corpus of real filings → extraction of
  labeled line items → a bank of calculation templates (margin, growth rate, leverage
  ratios, …) → synthetic tool-augmented reasoning chains generated against real evidence
  → a verification/filtering pass that throws out any chain whose final tool output
  doesn't match the ground-truth calculation. The hard part isn't generating chains —
  it's generating chains that are <em>provably</em> grounded, so the training signal
  doesn't just teach a model to sound rigorous.
</p>
`;

const paid = `
<h2>5. Proposed architecture</h2>
<p>
  Three pieces, combined rather than deployed independently:
</p>
<ul>
  <li><strong>Orchestrator–Workers.</strong> A controller reads the query, decides which
  sector-specific worker(s) apply, and dispatches. Each worker carries a lightweight
  adapter tuned on that sector's filing conventions (line-item naming varies enough
  across industries — e.g. financials vs. industrials — that a shared generic head
  underperforms a specialized one on extraction accuracy).</li>
  <li><strong>Augmented function-calling.</strong> Workers don't compute inline. Every
  numeric claim routes through a calculator tool call whose inputs are themselves
  evidence-cited spans from the filing, not paraphrased numbers. This is what makes the
  reasoning chain replayable: you can re-run the exact tool calls against the exact
  cited spans and check the output matches.</li>
  <li><strong>An agent loop with an explicit escalation policy.</strong> If the
  verification step (replaying the tool calls) doesn't match, the loop doesn't just
  retry blindly — it escalates: first to a re-extraction pass (maybe the wrong line item
  was cited), then to a larger general-purpose model as fallback, then to abstaining
  with an explicit "insufficient evidence" answer rather than guessing. The escalation
  policy is itself a design surface most agent-loop work treats as an afterthought.</li>
</ul>

<h2>6. What the evaluation is designed to measure</h2>
<p>
  Four axes, deliberately kept separate rather than collapsed into one aggregate score:
</p>
<ul>
  <li><strong>Numerical accuracy</strong> — does the final computed number match ground
  truth, independent of whether the reasoning was legible.</li>
  <li><strong>Evidence faithfulness</strong> — does every cited span actually appear in
  the filing at the location claimed, and does the tool call's input match the citation
  (not a paraphrase of it)?</li>
  <li><strong>Sector-analysis quality</strong> — for tasks beyond single-number
  extraction (e.g. margin trend across quarters, peer comparison), does the worker's
  domain adapter actually help versus a generic model given the same tools?</li>
  <li><strong>Task performance vs. general-purpose baselines</strong> — same tools, same
  prompt scaffold, swap in a non-specialized model, and see how much of the gain is
  attributable to specialization versus the tool/loop scaffold itself. This ablation
  matters: it's easy to credit "fine-tuning" for gains that actually come from forcing
  tool use.
</ul>
<p>
  <em>This section describes the evaluation design, not a results table — real numbers
  belong here once a run is finished and verifiable end-to-end, not before.</em>
</p>

<h2>7. Limitations (honest)</h2>
<ul>
  <li><strong>Dataset scale and coverage.</strong> The synthetic-generation pipeline
  (RQ2) is only as good as the calculation-template bank and the diversity of filing
  formats it's exercised against. Long-tail sectors with unusual reporting conventions
  are the likely failure mode, not the common case.</li>
  <li><strong>Verifier reliability.</strong> "Replay the tool calls and check the
  output" catches numeric and citation errors, but not a chain that cites the *right*
  span for the *wrong reason* — faithfulness verification at that level is still an open
  problem, not a solved one.</li>
  <li><strong>Sector-adapter transfer.</strong> It's untested how well an adapter tuned
  on one sector's filing conventions degrades — gracefully or sharply — when a query
  turns out to span sectors (e.g. a conglomerate with segments in different industries).</li>
  <li><strong>Escalation-policy tuning.</strong> The three-tier escalation
  (re-extract → larger model → abstain) has thresholds that were reasoned about, not
  empirically tuned against a cost/accuracy tradeoff. That tuning is future work, not
  something to claim is solved.</li>
</ul>

<h2>8. Open questions</h2>
<p>
  The faithfulness-verification gap in §7 is probably the most interesting follow-up:
  can a lighter-weight verifier be trained specifically to catch "right span, wrong
  reasoning," rather than relying on tool-call replay alone? That's a natural sequel to
  this post once there's something concrete to report.
</p>
`;

export default { free, paid };
