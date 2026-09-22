// Tiered content for the FBAQuant deep-hedging project page.

const free = `
<h2>Project</h2>
<p>
  A reinforcement-learning approach to option hedging: train an agent to choose
  hedging actions directly, rather than compute a hedge ratio analytically. The real
  work is in the reward function, not the RL algorithm — getting to a reward signal
  where you can tell <em>what action happened</em> from the trained behavior, not just
  a number that goes up.
</p>
<p>
  Grounded against the Kelly Criterion literature (Kelly-optimal position sizing)
  rather than treated as a free-floating RL benchmark problem, and the classic vs. RL
  hedging framings are compared directly rather than one silently replacing the other.
</p>
`;

const paid = `
<h2>Iteration history</h2>
<p>
  The repo's own file history is the honest record of the reward-design iteration —
  kept rather than squashed into a single "final" script:
</p>
<ul>
  <li><strong>241031</strong> — first working deep-hedge RL loop
  (<code>241031RLwithDeephedge.py</code>), plus a trained-run variant to check the
  policy actually converges to something, not just that the loop runs.</li>
  <li><strong>241102</strong> — the reward-function redesign pass: several parallel
  variants (<code>RLwithDeephedge21</code>, <code>...21active</code>,
  <code>...211reward</code>) — "active" and "reward" in the filenames track two
  different axes being iterated independently: how the agent's action space is
  restricted, and how the reward itself is shaped.</li>
  <li><strong>241107</strong> — reward function design notes, explicitly framed
  around one question: can you tell <em>what action happened</em> from the reward
  signal alone, or does the reward collapse different actions into the same number?</li>
</ul>
<p>
  Supporting material: a <code>FinancialEngineering/</code> directory with the
  underlying pricing-theory notes, a <code>StochasticOptimization/</code> directory,
  and a slide deck ("Deep Hedge Portfolio with DL&amp;RL") summarizing the DL-vs-RL
  comparison for a non-code audience.
</p>
`;

export default { free, paid };
