# Reasoning / Chain-of-Thought series

Back to the [hub](README.md). Related: [decisions](decisions.md),
[VLA & reference maps](vla-and-refmap.md) (same reference-map pattern).

## Framing (the "big problem")

Chain-of-thought splits into **explicit CoT** (human-readable token steps — legible but
maybe unfaithful) and **internal / latent CoT** (reasoning in latent space — real
computation, not legible). The series' recurring question: *is the chain a post-hoc
narrative, or the actual computation — and does it have to be words?*

## Posts

| Post | Path / URL | Role |
|---|---|---|
| CoGHP review | `_posts/2026-07-26-coghp-latent-chain-of-thought.md` → `/blog/2026/coghp-latent-chain-of-thought/` | Latent CoT in control — the worked case |

## CoGHP (verified)

**Chain-of-Goals Hierarchical Policy** — arXiv **2602.03389** (Feb 2026, v2 Jun 2026;
Jinwoo Choi, Sang-Hyun Lee, Seung-Woo Seo). Recasts long-horizon offline GCRL as one
autoregressive MLP-Mixer policy that generates **latent subgoals → action**; subgoals
function as (non-verbal) reasoning steps. Value = goal-conditioned IQL; policy = AWR;
autoregression via a causal mixer.

**Primary-verified Table 1 numbers** (not from a secondary review): pointmaze-giant
79±8 (HIQL 46), antmaze-giant 78±8, cube-single 97±3 (**GCIQL 99±1 edges it**),
cube-triple **42±3** (HIQL 2), scene 78±7 (HIQL 38). Signal = **complexity scaling**:
wins only on hard, multi-decision, long-horizon tasks.

## References added (`_bibliography/references.bib`)

`choi2026coghp`, `park2024ogbench`, `park2023hiql`, `kostrikov2022iql`, `peng2019awr`,
`tolstikhin2021mlpmixer`, `wei2022cot`. Informal link in the post's reference map: the
[DimensionSTP review](https://dimensionstp.github.io/study-concept/coghp/) (independent
write-up of the same paper; structure inspiration).

## Follow-ups (open)

- Explicit-vs-latent CoT faithfulness (Turpin/Lanham-style) as a dedicated post.
- Latent-reasoning LLM line (Coconut-style continuous-latent reasoning) — verify + cite.
- Ontology: reasoning currently split across `reinforcement-learning/offline-gcrl` (this
  post) and `llm/ai-agents`; may deserve its own `reasoning` node when the series grows.
