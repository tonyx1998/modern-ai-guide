---
id: case-studies-overview
title: 16. Case Studies — Overview
sidebar_position: 1
sidebar_label: Case studies intro
description: Architectures of eight shipped 2026 AI products — Cursor, Claude Code, Perplexity, Sierra, Harvey, Glean, Notion AI, Duolingo Max — reconstructed from public sources.
---

# Part 16: Case Studies

*Eight production AI architectures, reconstructed from public engineering blogs, conference talks, and podcast interviews.*

> **In one line:** The earlier chapters tell you what primitives exist; this chapter shows you how shipped products in 2026 *combine* those primitives into specific architectures — what's durable, what's a snapshot, and what you'd copy vs. avoid.

:::tip[In plain English]
Reading about primitives in isolation tells you what's possible; reading how real products combine them tells you what's *practical*. This chapter is eight worked architectures of shipped AI products — four developer-tooling, two enterprise-vertical, one productivity, one consumer. The shape of each (high-level architecture, key engineering decisions) is durable across model changes; the specific tools each uses (which model, which vector DB) are 2026 snapshots and will rot. Read the shapes, not the brand names.
:::

## How to read this chapter

Each case study follows the same structure:

1. **Product in one paragraph.** What it does, who it's for.
2. **Architecture diagram.** The durable shape.
3. **Two or three key engineering decisions.** What's non-obvious and why.
4. **Stack snapshot (2026).** The specific tools they're known to use *as of this writing*. Will age.
5. **What to copy / avoid.** Practical lessons.
6. **Sources.** Public talks, blogs, interviews.

Read them in any order. They're independent.

## The eight case studies

### Developer tools

- [Cursor](./cursor.md) — IDE-native coding assistant. Context retrieval, apply-diff, predictive autocomplete.
- [Claude Code](./claude-code.md) — Terminal-native coding agent. MCP-first, tool discipline, agent loop.

### Search & answer engines

- [Perplexity](./perplexity.md) — AI answer engine. Real-time web retrieval, citation enforcement, multi-step research.

### Voice & customer support

- [Sierra](./sierra.md) — Voice + chat agent for B2B customer support. Realtime + pipeline architecture, escalation discipline.

### Vertical AI (enterprise)

- [Harvey](./harvey.md) — Legal AI. RAG over case law and contracts, citation-grade retrieval.
- [Glean](./glean.md) — Enterprise unified search. Per-tenant + per-user ACLs, federated retrieval.

### Embedded AI in productivity

- [Notion AI](./notion-ai.md) — AI inside a productivity app. Per-block actions, document-aware context, no chat-first paradigm.

### Consumer AI

- [Duolingo Max](./duolingo-max.md) — AI-powered language tutoring. Cost-controlled per-turn, persona-driven, eval-heavy.

## What's durable vs. what's a snapshot

The pattern across all eight: there's a **durable architecture** that has been roughly the same shape for ≥18 months despite model upgrades, and a **tools snapshot** that changes per quarter.

| Durable (years) | Snapshot (months) |
|---|---|
| The retrieval shape (chunking strategy, hybrid, reranker) | Which embedding model |
| The context-management strategy | Which model version |
| The eval pipeline | Which observability platform |
| The auth & permissioning model | Which vector DB |
| The fallback ladder | Which gateway / proxy |
| The latency budget | Which inference provider |

When you read these case studies, the architecture diagrams are the load-bearing knowledge. The stack snapshots are the disposable layer.

## What these case studies are NOT

- **Endorsed by the companies.** All reconstructed from public sources — engineering blogs, conference talks (AI Engineer Summit, Latent Space), podcasts, founder interviews, GitHub commits where the code is public.
- **Complete.** Every shipped product has internal complexity these summaries skip. You're getting the architecture *shape*, not the implementation manual.
- **Static.** All of these companies ship continuously. Specifics will shift; the shapes should outlast the shifts.

## What you should get out of this chapter

- **Pattern fluency.** Recognize architectural choices in the wild and know what they cost / what they win.
- **Decision vocabulary.** "Like Cursor's apply-diff but with our codebase indexer" beats reinventing terminology.
- **Interview material.** AI system-design rounds (see [AI system-design interviews](../11-career/ai-system-design.md)) often anchor on a real product. Knowing one of these case studies cold lets you say "I'd model this on how Glean handles ACLs, with these adjustments…"
- **Inspiration with calibration.** Most of these took 50–500 engineers to build. Knowing what's possible is good; knowing what's *practical at your headcount* is better.

---

→ Start with [Cursor](./cursor.md).

## What's next

This is the last content chapter. When you've worked through the case studies that interest you, the [Glossary](/docs/glossary) is your standing reference for any term in the guide — and you're ready to go build. Re-read the [Introduction](/) and notice how much more of it lands now.
