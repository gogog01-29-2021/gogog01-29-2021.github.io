---
layout: post
title: "One vanishing integral, five lenses: why ∫₀²π (1+2cos t)/(5+4cos t) dt = 0"
date: 2026-05-31 12:00:00+0900
description: A single definite integral that evaluates to exactly zero, proved five ways — Weierstrass substitution, residues, cyclotomic/Dirichlet-kernel number theory, winding numbers and de Rham cohomology, and the Green–Stokes generalization. Each lens is written as a settled core plus open threads to expand in a later edit.
tags: math complex-analysis number-theory topology calculus
categories: [math, complex-analysis]
related_posts: false
toc:
  sidebar: left
---

$$
\newcommand{\C}{\mathbb{C}}
\newcommand{\R}{\mathbb{R}}
\newcommand{\Z}{\mathbb{Z}}
\newcommand{\Res}{\operatorname{Res}}
\newcommand{\Phione}{\Phi_3}
$$

> **Goal.** Prove
> $$\int_0^{2\pi}\frac{1+2\cos t}{5+4\cos t}\,dt = 0,$$
> and exhibit *the same zero* from five vantage points:
> 1. **Elementary calculus** — the Weierstrass tangent half-angle substitution $u=\tan(t/2)$.
> 2. **Complex analysis** — the residue theorem on the unit circle $\lvert z\rvert=1$.
> 3. **Number theory** — the numerator is the cyclotomic polynomial $\Phi_3$ (equivalently the order-1 Dirichlet kernel); the denominator is a *palindromic* polynomial whose roots are a reciprocal pair.
> 4. **Algebraic topology** — winding numbers and the de Rham class of a meromorphic 1-form.
> 5. **The Green–Stokes generalization** — the residue theorem *is* Stokes' theorem with punctures.
>
> Each lens is split into a **settled core** (the worked computation — locked) and **open threads ▸** (questions and directions, to be expanded in a later edit, in the spirit of this blog's *Direct / Indirect* convention).

{% comment %} HERO (image 1 of 2) — uncomment when assets/img/posts/vanishing-integral/circle-residues.png lands (Figma file vxR7rI9Z7Ez4PCf2jtLq7I).
{% include figure.liquid path="assets/img/posts/vanishing-integral/circle-residues.png" class="img-fluid rounded z-depth-1" caption="The geometric heart: poles of the integrand in the z-plane. Inside |z|=1 sit z=0 (residue +1/2) and z=−1/2 (residue −1/2); they cancel. The third pole z=−2 lives outside and is the reciprocal mirror of z=−1/2 across the circle." %}
{% endcomment %}

## The claim, and a 30-second sanity check

The integrand is bounded and continuous ($5+4\cos t \ge 1 > 0$), so the integral is a finite number. Split it and use the textbook value $\int_0^{2\pi}\frac{dt}{5+4\cos t}=\frac{2\pi}{\sqrt{5^2-4^2}}=\frac{2\pi}{3}$:

$$
\frac{\cos t}{5+4\cos t}=\frac14\!\left(1-\frac{5}{5+4\cos t}\right)
\;\Rightarrow\;
\int_0^{2\pi}\frac{\cos t}{5+4\cos t}\,dt=\frac14\!\left(2\pi-5\cdot\frac{2\pi}{3}\right)=-\frac{\pi}{3}.
$$

Hence

$$
\int_0^{2\pi}\frac{1+2\cos t}{5+4\cos t}\,dt=\underbrace{\frac{2\pi}{3}}_{\text{constant part}}+2\cdot\underbrace{\left(-\frac{\pi}{3}\right)}_{\cos\text{ part}}=0.
$$

That settles *that* it is zero. The rest of this post is about *why* — and the why is different, and illuminating, in each of the five lenses.

---

# A — The ladder

## Rung 1 — Weierstrass: brute force that collapses

**Settled core.** Substitute $u=\tan(t/2)$, the rationalizing change of variable:

$$
\cos t=\frac{1-u^2}{1+u^2},\qquad dt=\frac{2\,du}{1+u^2}.
$$

The numerator and denominator each rationalize:

$$
1+2\cos t=\frac{3-u^2}{1+u^2},\qquad 5+4\cos t=\frac{9+u^2}{1+u^2},
$$

so the integrand *and its measure* together become a rational function on the line:

$$
\frac{1+2\cos t}{5+4\cos t}\,dt=\frac{3-u^2}{9+u^2}\cdot\frac{2\,du}{1+u^2}
=\frac{2(3-u^2)}{(1+u^2)(9+u^2)}\,du.
$$

Partial fractions ($3-u^2=A(u^2+9)+B(u^2+1)$ gives $A=\tfrac12,\,B=-\tfrac32$) reduce it to two arctangents:

$$
\int_{-\infty}^{\infty}\!\left(\frac{1}{u^2+1}-\frac{3}{u^2+9}\right)du
=\Big[\arctan u-\arctan\tfrac{u}{3}\Big]_{-\infty}^{\infty}
=\pi-\pi=0.
$$

The antiderivative $G(u)=\arctan u-\arctan(u/3)$ even returns to the *same value* at both ends — the zero is visible without any cancellation lemma.

**Rigor note (professor-cautious).** $u=\tan(t/2)$ is singular at $t=\pi$. Cleanly, split $\int_0^{2\pi}=\int_0^{\pi}+\int_{\pi}^{2\pi}$; the first maps to $\int_0^{\infty}$, the second to $\int_{-\infty}^{0}$, and because the integrand in $u$ is even and absolutely integrable the two pieces glue to $\int_{-\infty}^{\infty}$ with no boundary contribution at the removable point.

**Open threads ▸**
- *Which whole family vanishes?* For $\int_0^{2\pi}\frac{a+b\cos t}{c+d\cos t}\,dt$, the half-angle reduction gives a ratio of even rational functions; work out the exact condition on $(a,b,c,d)$ that forces $0$. (Spoiler from Rung 3: it is a statement about one Fourier coefficient.)
- *Why does the $u$-integrand happen to be even?* Trace the evenness back to $\cos(-t)=\cos t$ and ask what breaks if a $\sin t$ term is present.

## Rung 2 — Residues: the two contributions cancel

**Settled core.** Put $z=e^{it}$, so $dt=\frac{dz}{iz}$ and $\cos t=\frac{z+z^{-1}}{2}$. Then

$$
1+2\cos t=\frac{z^2+z+1}{z},\qquad 5+4\cos t=\frac{2z^2+5z+2}{z}=\frac{(2z+1)(z+2)}{z},
$$

and the $z$ in the measure and the $z$'s in numerator/denominator combine to

$$
\int_0^{2\pi}\frac{1+2\cos t}{5+4\cos t}\,dt
=\frac1i\oint_{\lvert z\rvert=1}\frac{z^2+z+1}{z\,(2z+1)(z+2)}\,dz.
$$

Three simple poles: $z=0$, $z=-\tfrac12$ (both inside) and $z=-2$ (outside). The residue theorem {% cite ahlfors1979complex --file references %} now reduces the integral to the interior residues:

$$
\Res_{z=0}=\left.\frac{z^2+z+1}{(2z+1)(z+2)}\right|_{z=0}=\frac{1}{1\cdot2}=+\frac12,
$$

$$
\Res_{z=-1/2}=\left.\frac{z^2+z+1}{2z(z+2)}\right|_{z=-1/2}
=\frac{\tfrac14-\tfrac12+1}{2(-\tfrac12)(\tfrac32)}=\frac{\tfrac34}{-\tfrac32}=-\frac12.
$$

> **Lemma (residue cancellation, best paper-ready).** *The interior residues of the integrand sum to zero:*
> $$\Res_{z=0}+\Res_{z=-1/2}=\tfrac12-\tfrac12=0,\qquad\text{hence}\qquad \int=\frac1i\cdot 2\pi i\cdot 0=0.$$

The two halves of the elementary split in the sanity check ($\tfrac{2\pi}{3}$ and $-\tfrac{\pi}{3}$) are exactly these two residues, re-weighted. The pole $z=0$ is *not* a feature of the physics — it is born from the measure $dt=dz/(iz)$. The pole $z=-\tfrac12$ *is* the physical pole of $1/(5+4\cos t)$. The zero is the statement that these two unrelated-looking poles carry equal and opposite residues.

**Open threads ▸**
- *For which numerators $N(z)$ does $\oint \frac{N(z)}{z(2z+1)(z+2)}\,dz$ vanish?* The condition is $\Res_{0}+\Res_{-1/2}=0$, a single linear equation in the coefficients of $N$. Map the kernel.
- *What does the outside pole $z=-2$ know?* Compute $\Res_{z=-2}=+\tfrac12$ and the residue at infinity, and revisit in Rung 4.
- *Real vs complex residue.* Both interior residues here are real; the Interlude below reads a real residue as a source/sink and a complex one as a vortex of the Pólya vector field.

## Rung 3 — Number theory: a cyclotomic numerator over a palindromic denominator

**Settled core.** Two exact identities on the circle.

*Numerator.* $z^2+z+1=\Phi_3(z)$, the **third cyclotomic polynomial** {% cite irelandrosen1990 --file references %}, whose roots are the primitive cube roots of unity $e^{\pm 2\pi i/3}$. On $\lvert z\rvert=1$,

$$
1+2\cos t=e^{-it}+1+e^{it}=\sum_{k=-1}^{1}e^{ikt}=D_1(t),
$$

the **order-1 Dirichlet kernel**. The numerator is not arbitrary; it is the simplest nonconstant Dirichlet kernel.

*Denominator.* $5+4\cos t=\lvert 2+e^{it}\rvert^2$ — check $(2+\cos t)^2+\sin^2 t=5+4\cos t$. As a polynomial, $2z^2+5z+2$ has coefficient vector $(2,5,2)$, which is **palindromic**; palindromic polynomials have reciprocal root sets, here $\{-\tfrac12,-2\}$ with $(-\tfrac12)(-2)=1$. One root sits inside the unit circle, its reciprocal sits outside — a mirror pair across $\lvert z\rvert=1$. *Exactly one* physical pole is therefore enclosed, which is what makes a single nonzero residue available to cancel the measure's residue at $0$.

> **Proposition (Fourier reading, best paper-ready).** *Expand the denominator's reciprocal as a Fourier/Laurent series* {% cite stein2003fourier --file references %}*,*
> $$\frac{1}{5+4\cos t}=\sum_{n\in\Z}c_n e^{int},\qquad c_n=\frac13\left(-\frac12\right)^{\lvert n\rvert}.$$
> *Because $1+2\cos t=D_1(t)$ selects the modes $n\in\{-1,0,1\}$,*
> $$\frac{1}{2\pi}\int_0^{2\pi}\frac{1+2\cos t}{5+4\cos t}\,dt=c_0+c_1+c_{-1}=c_0+2c_1=\frac13-\frac26=0.$$

This is the cleanest *why*: the integral is one weighted sum of Fourier coefficients of a Poisson-type kernel, and that sum is zero because $c_0=\tfrac13$ and $c_{\pm1}=-\tfrac16$.

**Open threads ▸**
- *Generalize the kernel.* Replace $\Phi_3$ by $\Phi_n$, or $\lvert 2+e^{it}\rvert^2$ by $\lvert m+e^{it}\rvert^2$ (Fourier coefficients $c_n=\frac{1}{m^2-1}(-1/m)^{\lvert n\rvert}$ up to scale). For which $(\text{numerator degree},m)$ does the weighted coefficient sum still vanish?
- *Poisson kernel link.* $1/(5+4\cos t)$ is, up to scale, the Poisson kernel at radius $r=-\tfrac12$ {% cite stein2003complex --file references %}. State the integral as "the Dirichlet kernel tests the Poisson kernel," and connect to summability of Fourier series.

## Rung 4 — Topology: winding numbers and a de Rham class

**Settled core.** The residue theorem is really a pairing between a *cycle* (the contour, an element of homology) and a *cocycle* (the meromorphic 1-form, an element of de Rham cohomology). Write the contour's winding number about each pole, $n(\gamma,p)=\frac{1}{2\pi i}\oint_\gamma \frac{dz}{z-p}$. For $\gamma=\{\lvert z\rvert=1\}$:

$$
n(\gamma,0)=1,\quad n(\gamma,-\tfrac12)=1,\quad n(\gamma,-2)=0,
$$

so the general residue formula $\int=\sum_p n(\gamma,p)\,\Res_p$ reads, numerically,

$$
\int=1\cdot\tfrac12+1\cdot(-\tfrac12)+0\cdot\tfrac12=0.
$$

The form $\omega=\dfrac{z^2+z+1}{z(2z+1)(z+2)}\,dz$ lives on the thrice-punctured plane $X=\C\setminus\{0,-\tfrac12,-2\}$, whose first de Rham cohomology is $H^1_{\mathrm{dR}}(X)\cong\R^3$ {% cite bottu1982 --file references %}, generated by the three small loops; the class of $\omega$ is its residue vector $(\tfrac12,-\tfrac12,\tfrac12)$ (up to $2\pi i$). In homology, the unit circle is the sum $[\,\lvert z\rvert=1\,]=[\text{loop}_0]+[\text{loop}_{-1/2}]$ in $H_1(X)$ {% cite hatcher2002 --file references %}, and the pairing reads off $\tfrac12+(-\tfrac12)=0$.

A consistency check from the sphere: on $\widehat{\C}$ the residues at *all* poles, including infinity, must sum to zero,

$$
\Res_0+\Res_{-1/2}+\Res_{-2}+\Res_{\infty}=\tfrac12-\tfrac12+\tfrac12-\tfrac12=0.\;\checkmark
$$

**Open threads ▸**
- *Change the cycle.* If $\gamma$ winds twice, or encloses only $z=-2$, or encloses nothing, the answer becomes $0$, $\tfrac{2\pi}{?}$, or $0$ respectively — derive each from the homology class, not by recomputing integrals.
- *Why three punctures give $\R^3$.* Sketch the Mayer–Vietoris / generators-and-relations argument and ask what the relation "$\sum$ residues $=0$ on $\widehat\C$" corresponds to in $H^1$ of the sphere.

## Rung 5 — Green ⟶ Stokes: the residue theorem as a boundary law

**Settled core.** Green's theorem in the plane,

$$
\oint_{\partial D}(P\,dx+Q\,dy)=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dA,
$$

applied to $f(z)\,dz=(u+iv)(dx+i\,dy)$ with $f$ holomorphic, has integrand curl $\equiv 0$ by the Cauchy–Riemann equations — that is **Cauchy's theorem** $\oint f\,dz=0$. When $f$ has poles, excise small disks $D_\varepsilon(p_k)$ around them; on the punctured region the curl still vanishes, so

$$
\oint_{\partial D} f\,dz=\sum_k \oint_{\partial D_\varepsilon(p_k)} f\,dz=2\pi i\sum_k \Res_{p_k}f.
$$

Our integral is precisely the left side with $\partial D=\{\lvert z\rvert=1\}$ deformed onto the two tiny circles around $z=0$ and $z=-\tfrac12$, recovering $2\pi i(\tfrac12-\tfrac12)=0$.

> **Statement (the generalization, best paper-ready).** *All three of Green's theorem, Cauchy's theorem, and the residue theorem are the single law*
> $$\int_{\partial\Omega}\omega=\int_{\Omega}d\omega$$
> *(Stokes' theorem {% cite spivak1965 --file references %}{% cite lee2012smooth --file references %}) for a 1-form $\omega$ on an oriented manifold-with-boundary $\Omega$. The residue theorem is the case $\Omega=$ disk-minus-punctures, $\omega=f\,dz$, $d\omega=0$ away from the poles.*

The two substitutions used earlier are this same machinery in coordinates: $u=\tan(t/2)$ and $z=e^{it}$ are diffeomorphisms, and the factors $dt=\frac{2\,du}{1+u^2}$ and $dt=\frac{dz}{iz}$ are their Jacobians — the multivariable change-of-variables rule, which is itself the pullback that makes Stokes coordinate-free.

**Open threads ▸**
- *Lift one dimension.* What 2-form $d\omega$ on what surface has our circle integral as its boundary value? Make "the zero is a boundary that bounds" literal.
- *Discrete Stokes.* State the summation-by-parts / lattice analogue and check the vanishing survives discretization (relevant to numerically evaluating such integrals without catastrophic cancellation).
- *The vector-field instance.* The Interlude below works this Green's-theorem reading out explicitly through the Pólya vector field — circulation plus flux of $(u,-v)$.

---

# Interlude — one line integral, two readings: parametric curve vs vector field

The five lenses split along a hidden seam. Rungs 1–2 read the integral as a *parametrized curve*; Rung 5 reads it as a *vector field*. Naming that seam is itself a finding — it explains *why* the two give the same zero.

**Parametric reading.** $z(t)=e^{it}$ is a curve $\gamma:[0,2\pi]\to\C$, and

$$
\oint_\gamma g(z)\,dz=\int_0^{2\pi} g(z(t))\,z'(t)\,dt,\qquad g(z)=\frac{z^2+z+1}{z(2z+1)(z+2)},
$$

is *exactly* the $dt$-integral of Rungs 1–2 (the original integral is $\tfrac1i\oint_\gamma g\,dz$) — a *function traced along a path*.

**Vector-field reading (the Pólya field).** Write $g=u+iv$ and form the **Pólya vector field** $V=(u,-v)$. Then

$$
\oint_C g\,dz=\underbrace{\oint_C(u\,dx-v\,dy)}_{\text{circulation of }V}\;+\;i\underbrace{\oint_C(u\,dy+v\,dx)}_{\text{flux of }V}.
$$

Where $g$ is holomorphic the Cauchy–Riemann equations make $V$ simultaneously **curl-free and divergence-free**; each pole is a point source, sink, or vortex. The residues do the bookkeeping:

$$
\text{circulation}=-2\pi\,\mathrm{Im}\!\sum\Res,\qquad \text{flux}=2\pi\,\mathrm{Re}\!\sum\Res.
$$

> **Statement (source–sink reading, best paper-ready).** *Both interior residues are **real** ($+\tfrac12$ at $z=0$, $-\tfrac12$ at $z=-\tfrac12$), so neither pole is a vortex: $z=0$ is a pure **source** of the Pólya field (flux $+\pi$) and $z=-\tfrac12$ a pure **sink** (flux $-\pi$). They are equal and opposite, so the unit circle encloses zero net flux and zero circulation — and the integral is $0$.*

(Checked numerically: $\mathrm{Re}\oint=\mathrm{Im}\oint=0$, and the flux through a tiny circle is $+\pi$ around $z=0$ and $-\pi$ around $z=-\tfrac12$.)

This is the bridge. The elementary/parametric lens and the Green–Stokes/field lens are not two proofs but one object seen two ways: a function dragged once around a loop, or an incompressible irrotational flow with a source and an equal sink inside that loop.

**Open threads ▸**
- *When does a vortex appear?* A residue with nonzero imaginary part contributes circulation, not just flux. Which numerators $N(z)$ over $z(2z+1)(z+2)$ produce a complex interior residue, and what does the resulting swirl look like?
- *Re-winding.* $z=e^{int}$ traverses the circle $n$ times and the answer stays $0$; track separately what $n$ does to circulation vs flux (it scales the winding-number weight of Rung 4).
- *Area form.* Green's theorem turns each part into a double integral over the disk; is there a manifestly-zero integrand on the punctured disk (away from the source and sink) that exhibits the cancellation without evaluating residues?

---

# B — The same zero, five windows

{% comment %} SCHEMATIC (image 2 of 2) — uncomment when assets/img/posts/vanishing-integral/five-lens-ladder.png lands (Figma-composed).
{% include figure.liquid path="assets/img/posts/vanishing-integral/five-lens-ladder.png" class="img-fluid rounded z-depth-1" caption="The ladder of generalization: Weierstrass → residues → cyclotomic/Dirichlet → winding numbers → Stokes, with the unifying Fourier-coefficient identity c₀+2c₁=0 at the base." %}
{% endcomment %}

Reading the ladder bottom-up collapses it; here are the five lenses side by side, each as *object → why-zero → the one computation*.

| Lens | What it sees | Why it is zero | The one line |
|---|---|---|---|
| **Calculus** | a rational function on $\R$ | two arctangents with equal limits | $\big[\arctan u-\arctan\tfrac u3\big]_{-\infty}^{\infty}=\pi-\pi$ |
| **Complex analysis** | poles inside $\lvert z\rvert=1$ | interior residues cancel | $\Res_0+\Res_{-1/2}=\tfrac12-\tfrac12$ |
| **Number theory** | $\Phi_3$ over a palindrome | a Fourier-coefficient sum cancels | $c_0+2c_1=\tfrac13-\tfrac26$ |
| **Topology** | a class in $H^1(X)$ | the cycle pairs to zero | $1\cdot\tfrac12+1\cdot(-\tfrac12)$ |
| **Green–Stokes** | $\int_{\partial\Omega}\omega$ | $\omega$ is closed off the poles | $2\pi i\sum\Res=0$ |

A sixth row would be the *bridge* itself — parametric curve ⇄ Pólya vector field (the Interlude above) — the seam along which the elementary and the Green–Stokes lenses turn out to be one object.

**Synthesis (kept deliberately short).** The five "whys" are not five coincidences. The Fourier-coefficient identity $c_0+2c_1=0$ (number theory) *is* the residue cancellation (complex analysis), *is* the homology pairing evaluating to zero (topology), *is* a boundary integral of a closed form (Stokes); the calculus computation is the same statement after a rationalizing diffeomorphism. One object, one zero, five faithful descriptions — and each rung's open threads point to the family of integrals where the zero either persists or breaks.

## References

{% bibliography --file references --cited %}
