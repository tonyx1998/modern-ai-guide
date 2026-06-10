---
id: cutting-edge-research-radar
title: "Research radar (June 2026)"
sidebar_position: 6
description: Dated snapshot of active research themes and anchor papers — how to track the field without reading everything.
---

# Research radar (June 2026)

:::info[Last updated: June 2026]
This is the guide's **research-direction snapshot** — companion to the [model snapshot](../model-snapshot.md)
(which owns model names and prices). Themes here shift faster than core curriculum; concepts stay linked
to durable lessons. For foundational papers every engineer should know once, see
[Papers worth reading](../02-roadmap/04-part-4-meta/02-papers-worth-reading.md).
:::

> **In one line:** You do not need to read arXiv daily — you need a **map of active themes**, anchor papers that define vocabulary, and a **triage habit** so headlines become actionable or ignored in minutes.

:::tip[In plain English]
Research moves faster than this guide updates. This page is deliberately dated: it lists what labs were pushing in mid-2026, points at a few papers worth skimming for vocabulary, and reminds you how to filter the rest. When a theme graduates into production practice, it should appear in an evergreen chapter — until then, it lives here.
:::

## Active themes (mid-2026)

| Theme | Plain-English summary | Link to this guide |
|---|---|---|
| **Agent harnesses & protocols** | Standard ways to plug tools, memory, and multi-agent coordination (MCP, A2A) | [Agent harnesses](./01-agent-harnesses.md), [MCP](../01-foundations/mcp.md) |
| **Agentic RAG** | Multi-step retrieval, query planning, tool-shaped search | [Agentic RAG](./02-agentic-rag.md), [RAG basics](../01-foundations/rag-basics.md) |
| **Process / trajectory evals** | Grade tool sequences and safety, not only final answers | [Trajectory evals](./03-trajectory-evals.md), [LLM-as-judge](../13-evaluation/06-llm-as-judge.md) |
| **Test-time compute scaling** | Spend more inference compute on hard problems via reasoning tokens, search, verifiers | [Efficient models](./04-efficient-models.md), [Reasoning models](../01-foundations/reasoning-models.md) |
| **Long-context & memory systems** | Million-token windows plus external memory stores — context *curation* beats raw size | [Context window](../01-foundations/context-window.md), [Memory](../01-foundations/memory.md) |
| **Efficient architectures** | Hybrid SSM+transformer stacks, speculative decoding, diffusion LMs (early) | [Efficient models](./04-efficient-models.md), [Inference servers](../04-stack/inference-servers.md) |
| **Multimodal agents** | Vision + audio + tool use + computer use in one loop | [Multimodal overview](../16-multimodal/index.md), [Computer use](../01-foundations/computer-use.md) |
| **Alignment & safety at scale** | Constitutional training, red-teaming automation, governance tooling | [Safety overview](../14-safety/index.md) |

## Anchor papers (vocabulary, not homework)

Skim these for **ideas that keep appearing in product blogs** — not line-by-line reproduction. Full foundational list: [Papers worth reading](../02-roadmap/04-part-4-meta/02-papers-worth-reading.md).

| Paper / line of work | Why engineers mention it | Concept to carry |
|---|---|---|
| **Attention Is All You Need** (2017) | Still the architecture reference | *Transformer*, *attention* |
| **RAG** (Lewis et al., 2020) | Retrieval-augmented generation pattern | One-shot vs. agentic retrieval |
| **ReAct** (Yao et al., 2022) | Reason + act interleaved in a loop | Agent trace shape |
| **Toolformer** (2023) | Models learn when to call APIs | Tool routing |
| **Mamba / SSM hybrids** (2023–2025) | Long-sequence efficiency | Hybrid inference economics |
| **Process reward / step supervision** (2024–2025) | Reward intermediate steps, not only outcomes | Trajectory evals |
| **MCP specification** (Anthropic, 2024+) | De facto tool protocol | Harness interoperability |

Titles and authors rot less than model version strings; **ideas** map to chapters above.

## Triage checklist (five minutes per headline)

When a new paper or launch trends:

1. **Does it change inference economics or reliability for *your* task?** If no, bookmark and move on.
2. **Is it a protocol or eval discipline?** Protocols (MCP) and measurement (trajectory evals) compound — frameworks rarely do.
3. **Can you try it in a toy repo this week?** If not shippable in a month, it belongs on this radar page, not in production.
4. **Does an evergreen chapter already cover the durable part?** Read that first; use this page for what's still moving.

[Continuous learning](../11-career/09-continuous-learning.md) suggests a sustainable cadence: primary sources (lab engineering blogs, protocol docs) weekly; paper deep-dives only when blocked on a specific problem.

## What to ignore (June 2026 edition)

- **Leaderboard chasing** without your eval set — MMLU scores do not predict your RAG faithfulness.
- **Fully autonomous everything** demos without traces, budgets, or evals — see [frontier hype filter](../10-patterns/frontier-and-future-proofing.md).
- **Architecture-of-the-week** rewrite proposals before a hosted model proves it on *your* workload.

## When this page is stale

If the date above is more than ~6 months old:

- Refresh model names on [model snapshot](../model-snapshot.md) first.
- Scan lab engineering blogs for **repeated** themes (three mentions = worth a concept note).
- Promote any theme that landed in production patterns into an evergreen lesson; demote what faded.

---

→ Next: [Optional checkpoint](./99-checkpoint.md) · Or skip ahead to the [Final capstone](../99-capstone.md)

<Quiz id="cutting-edge-research-radar-quick-check" variant="micro" title="Quick check">

<Question
  prompt="How does this page relate to the model snapshot?"
  options={[
    { text: "They are the same page with different titles" },
    { text: "Model snapshot owns names and prices; research radar owns themes and anchor papers for where the field is heading" },
    { text: "Research radar replaces papers worth reading" },
    { text: "Model snapshot is evergreen; research radar lists only closed models" }
  ]}
  correct={1}
  explanation="Two dated companions: volatile product facts vs. volatile research direction. Foundational vocabulary still lives in papers worth reading; this page is the mid-2026 theme map."
/>

<Question
  prompt="According to the triage checklist, when should a trending paper earn a deep read?"
  options={[
    { text: "Whenever it hits the front page of social media" },
    { text: "When it changes inference economics or reliability for your task, or when you are blocked on a specific problem it addresses" },
    { text: "Only if it beats MMLU" },
    { text: "Never — engineers should not read papers" }
  ]}
  correct={1}
  explanation="The checklist is deliberately conservative: most headlines fail the your-task test. Deep reads are for unblockers and economic shifts, not FOMO."
/>

<Question
  prompt="What should happen when a research theme graduates into common production practice?"
  options={[
    { text: "Delete all mention of it" },
    { text: "Promote the durable concepts into an evergreen chapter; keep only still-moving details on this radar page" },
    { text: "Move it to the glossary only" },
    { text: "Require a new checkpoint gate" }
  ]}
  correct={1}
  explanation="This chapter is optional and dated by design. Ideas that stick (agent harnesses, trajectory evals) belong in core curriculum; the radar page tracks what has not settled yet."
/>

</Quiz>
