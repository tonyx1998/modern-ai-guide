---
id: part-2-overview
title: Part II — The 2026 AI Stack
sidebar_position: 1
sidebar_label: Part II overview
description: The 2026 AI stack — model tiers (frontier / workhorse / cheap), embeddings, vector DBs, frameworks, evals, observability, gateways, plus the directional trends shaping next year.
---

# Part II — The 2026 AI Stack

*Once you can ship, the next question is: which of the noise actually matters?*

This part has two layers. The **model tiers and tool picks** are opinionated — concrete recommendations, ranked by whether you should adopt them now, learn them later, or skip them entirely. The **trends** page is directional — broad shifts in how 2026 AI is built.

:::info[Read this part as a shipping engineer]
Part II assumes you've shipped at least one production-style AI feature (Stage 9 in [Part I](../01-part-1-from-zero/index.md), or its equivalent). If you haven't, the trade-offs here won't land — adoption questions only matter when you have something to adopt them *into*. Build first; then come back here for the next layer.
:::

## What's in this part

### Model tiers (start here)

- [Frontier tier](./01-frontier-tier.md) — GPT-5, Claude Opus 4.x, Gemini 2.x Ultra. The "use when nothing else passes the eval" tier.
- [Workhorse tier](./02-workhorse-tier.md) — Claude Sonnet 4.x, GPT-5 family, Gemini Pro. The default-for-real-work tier.
- [Cheap tier](./03-cheap-tier.md) — Claude Haiku 4.5, GPT-5-mini, Gemini Flash. The "start here, climb only when forced" tier.
- [Embedding tier](./04-embedding-tier.md) — text-embedding-3-small/large, Voyage, Cohere v3, open-source picks.

### Infrastructure picks

- [Vector DB pick](./05-vector-db-pick.md) — pgvector by default; when to reach for Qdrant / Pinecone / Weaviate.
- [Framework pick](./06-framework-pick.md) — LangChain, LlamaIndex, Vercel AI SDK, OpenAI Agents SDK, Pydantic AI, raw — which when.
- [Eval tool pick](./07-eval-tool-pick.md) — Braintrust, Langfuse, Promptfoo, DeepEval, Ragas, OpenAI Evals.
- [Observability pick](./08-observability-pick.md) — Langfuse, Helicone, LangSmith, Phoenix, Braintrust.
- [Gateway pick](./09-gateway-pick.md) — Cloudflare AI Gateway, LiteLLM, Helicone, OpenRouter — and whether you need one.

### The trends

- [Trends](./10-trends.md) — six 2026 directional shifts: context engineering, agents-as-product, multimodal-default, on-device inference, MCP everywhere, eval-as-CI.

## The tier rule (read first)

The tier list isn't "use Tier 1 things, ignore Tier 3." It's a **decision-cost ladder**:

- **Tier 1** = adopt without much thought; mature, well-supported, the boring-tech answer.
- **Tier 2** = worth knowing; reach for when Tier 1 fails a specific named constraint.
- **Tier 3** = skip or defer; either too new to be safe, too niche to be relevant, or a fashion item.

The cardinal sin is treating Tier 1 as a checklist to adopt all at once. Pick the one item that fixes a pain you have *right now* in the *next* project. Six rewrites in parallel is how the project stalls.

## How this pairs with Chapter 4 (Stack)

[Chapter 4](/docs/stack) decodes *what each tool does and why it exists* — the reference. This part *tells you which ones to actually use right now* — the opinion.

If you want the wide view of every option, go to Chapter 4. If you want the short list, stay here.

→ Start with [Cheap tier](./03-cheap-tier.md) — most production AI runs there, contrary to the hype.
