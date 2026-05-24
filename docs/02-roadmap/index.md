---
id: roadmap-overview
title: 2. Roadmap — Overview
sidebar_position: 1
sidebar_label: Roadmap at a glance
description: The complete AI engineering learning path. From your first API call, through the 2026 AI stack, into the intuitions the stack doesn't teach you, ending with the meta-skills that let you keep learning as the field churns.
---

# Part 2: The AI Engineer Roadmap

*From your first API call to shipping production AI — the ordered curriculum that pairs with this guide.*

The rest of the book is organized by **topic** — foundations, lifecycle, the stack, contexts (solo / startup / enterprise), patterns, decisions, career. This chapter is organized by **progression**. It tells you what to learn, in what order, with the *why* at each step and a concrete artifact to cement it.

The two views overlap deliberately. When a stage says "learn tool calling," it links into the [Tool-use foundations](/docs/foundations/tool-use) page for depth. When the Modern Stack section says "adopt Braintrust for evals," it links into the [Eval tools](/docs/stack/eval-tools) page for context. **The roadmap is the path; the rest of the guide is the terrain.**

:::tip[The honest truth]
Becoming a good AI engineer isn't one skill — it's roughly ten overlapping skills, and the order matters. Most beginners thrash because they try to build agents before they've made their RAG work, or copy LangChain code without understanding what `chat.completions.create` returns, or chase the model leaderboard before they've ever written a single eval. The order here is the order that actually compounds.
:::

## The four parts

| Part | What it covers | For whom |
|------|----------------|----------|
| **[I. From Zero](./01-part-1-from-zero/index.md)** | 10 stages, ~3–6 months part-time, takes you from "I've heard of LLMs" to "I shipped a production AI feature with evals" | Working engineers new to AI |
| **[II. The 2026 AI Stack](./02-part-2-modern-stack/index.md)** | The tier list: frontier vs workhorse vs cheap models, vector DBs, frameworks, eval tools, observability, gateways, plus the trends shaping next year | AI engineers picking tools |
| **[III. Beyond the Stack](./03-part-3-beyond/index.md)** | Prompting as craft, eval mindset, retrieval quality, agent discipline, cost/latency intuition, safety — the skills no SDK teaches you | Mid-level AI engineers |
| **[IV. Meta-skills](./04-part-4-meta/index.md)** | How to learn AI fast when the field changes monthly, which papers to read, which communities to join, when to pivot | Anyone losing momentum |

## Where to enter

- **Never made an LLM API call?** → [Part I, Stage 0](./01-part-1-from-zero/01-stage-0-setup.md). Don't skip.
- **Made a few calls, want to know what the modern stack looks like?** → [Part II](./02-part-2-modern-stack/index.md). Use Part I's later stages as a self-check.
- **Shipped AI in production, looking to level up?** → [Part III](./03-part-3-beyond/index.md). The intuitions that survive every model release.
- **Field is moving too fast, you're stuck?** → [Part IV](./04-part-4-meta/index.md). Being behind is the default state in AI; having strategies for it is the skill.

## How the roadmap pairs with the rest of the guide

The chapters that follow this one (Foundations, Lifecycle, Stack, Solo/Startup/Enterprise, Decisions, Patterns, Career) are **reference material**. You don't read them straight through — you reach for them when a roadmap stage points you at them.

For example, [Stage 5 — RAG](./01-part-1-from-zero/07-stage-5-rag.md) links into:

- [Foundations: Embeddings](/docs/foundations/embeddings) — for the underlying vector math
- [Stack: Vector databases](/docs/stack/vector-databases) — for the choice matrix
- [Patterns: RAG in production](/docs/patterns/rag-prod) — for the failure modes once it leaves your laptop
- [Decisions: Prompt vs RAG vs fine-tune](/docs/decisions/prompt-vs-rag-vs-finetune) — for when to even reach for RAG in the first place

## What this roadmap is *not*

- Not a course on ML or deep learning. You can ship extremely useful AI without knowing how gradient descent works — and you should, before you go deeper.
- Not a tour of every framework. We pick one stack per stage; alternatives are listed in [Chapter 4](/docs/stack).
- Not about chasing the model leaderboard. The base skill — *make an LLM do something useful, reliably, in production* — barely changes with each new model.

→ [How to use this roadmap](./how-to-use.md) · [Start with Stage 0](./01-part-1-from-zero/01-stage-0-setup.md)
