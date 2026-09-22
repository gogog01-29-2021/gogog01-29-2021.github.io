// Tiered content for the PDE-solver (Ibrahim collaboration) project page.

const free = `
<h2>Project</h2>
<p>
  A fork of <a href="https://github.com/LANREADE/2D-Black-Scholes-Numerical-PDE-Solver" target="_blank" rel="noopener">Ibrahim Lanre Adedimeji's</a>
  (Seoul National University of Science and Technology) 2D Black-Scholes numerical PDE
  solver — comparing Crank-Nicolson and ADI (Alternating Direction Implicit) schemes for
  efficiency, stability, and accuracy on the 2D Black-Scholes option-pricing equation.
</p>
<p>
  This is Paper 1 of a planned multi-paper collaboration ("Solver-Aware Deep Hedging"):
  benchmark the solvers first, then use the validated solver as the environment for an
  RL hedging agent, then automate calibration. Paper 1 is the foundation the later work
  depends on.
</p>
`;

const paid = `
<h2>Implementation</h2>
<p>
  Three files, one per solver family currently implemented:
</p>
<ul>
  <li><strong><code>BlackscholesCN.py</code></strong> — Crank-Nicolson, the
  second-order-in-time implicit baseline.</li>
  <li><strong><code>BlackscholesADI.py</code></strong> — Peaceman-Rachford ADI:
  operator-splitting the 2D PDE into two 1D half-steps, each solved via a tridiagonal
  (Thomas algorithm) pass — the schemes this collaboration is extending.</li>
  <li><strong><code>Bs2d.py</code></strong> — the shared 2D problem setup (basket
  option payoffs, grid, boundary conditions) both solvers are benchmarked against.</li>
</ul>
<p>
  Per the fuller research plan: the next layer adds a hybrid ADI+neural-network
  solver and a physics-informed neural network (PINN), racing all four solver families
  (FDM, ADI, Monte Carlo, PINN) on the same benchmark suite (European/American vanilla,
  arithmetic-average, min/max, and exchange options) before any RL work begins on top.
</p>
`;

export default { free, paid };
