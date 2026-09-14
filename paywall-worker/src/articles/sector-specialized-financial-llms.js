// Member-only continuation of the "Sector-Specialized Financial LLMs" post.
// Lives only in the Worker — never checked into the public Jekyll site.

export default `
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
