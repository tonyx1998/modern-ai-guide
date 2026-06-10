---
id: cutting-edge-overview
title: 17. Cutting Edge — Overview
sidebar_position: 1
sidebar_label: Cutting edge intro
description: Optional post-curriculum look ahead — agent harnesses, agentic RAG, trajectory evals, efficient inference, and a dated research radar for June 2026.
---

# Part 17: Cutting Edge & What's Next

*Optional depth after the core curriculum — concepts that are shaping 2026–2027, not prerequisites for shipping today.*

> **In one line:** The rest of the guide teaches durable engineering; this chapter names the frontier ideas worth watching so you can skim announcements without chasing hype.

:::tip[In plain English]
You do not need this chapter to build and ship AI products. Chapters 1–16 already cover what works in production today. Read this when you want a structured map of what is *emerging* — agent harness engineering, retrieval that plans its own searches, evals that grade the whole journey not just the final answer, cheaper inference tricks, and a dated snapshot of research themes. Treat it like a magazine appendix: interesting, useful for interviews and long-term bets, clearly perishable on the details.
:::

## How this chapter differs from Chapter 14

[The frontier — and how to future-proof](../10-patterns/frontier-and-future-proofing.md) (Chapter 14) is a **short pattern** inside production patterns: durable skills vs. 2026 hype in one sitting. **This chapter goes deeper** on a handful of engineering shifts that are moving from research labs into production stacks — with links back to the foundations you already learned.

| Chapter 14 (Patterns) | Chapter 17 (This chapter) |
|---|---|
| One-page orientation | Five focused lessons + research radar |
| What to ignore vs. adopt | How emerging systems are built |
| Evergreen meta-skill | Dated snapshot on the research page |

## What you'll learn

1. **[Agent harness engineering](./01-agent-harnesses.md)** — The orchestration layer around the model: memory, tool routing, budgets, and why the harness often matters more than the base model.
2. **[Agentic RAG & memory](./02-agentic-rag.md)** — Retrieval that loops: when to search again, what to remember across turns, and how it differs from one-shot RAG.
3. **[Trajectory & process evals](./03-trajectory-evals.md)** — Judging agent *steps*, not just final answers — the eval shift agents force on you.
4. **[Efficient models & test-time compute](./04-efficient-models.md)** — Hybrid architectures, reasoning budgets, and the cost/latency tradeoffs that decide which tier runs where.
5. **[Research radar (June 2026)](./05-research-radar.md)** — A dated snapshot of active themes and anchor papers — companion to the [model snapshot](../model-snapshot.md), but for research direction.

Finish with an **[optional checkpoint](./99-checkpoint.md)** — self-check only; it does not gate the capstone or glossary.

## When to read this

- **After** you've worked through the core arc (or at least foundations + eval + one workflow chapter).
- **Before** a system-design interview where you want to sound current without reciting paper titles.
- **When** a headline claims agents or RAG are solved — this chapter tells you what is actually hard.

## What stays durable here

Even when model names rot, these **shapes** tend to stick:

- Production agents need a **harness** (limits, memory, tool policy) — not just a smarter model.
- Grounded systems increasingly use **multi-step retrieval**, not a single vector search.
- Agent quality is measured on **trajectories**, not one final string.
- Cost wins come from **routing** (small vs. reasoning vs. frontier) and **test-time compute budgets**, not one model for everything.

---

→ Start with [Agent harness engineering](./01-agent-harnesses.md).
