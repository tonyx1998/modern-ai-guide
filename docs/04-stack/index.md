---
id: tech-stack-decoded
title: 4. Tech Stack — Overview
sidebar_position: 1
sidebar_label: Stack intro
description: Every major 2026 AI tool decoded — what it does, when to use it, why it exists.
---

# Part 4: The 2026 AI Tech Stack, Decoded

*Reference, not tutorial. Skim once; come back per-layer when you're picking tools.*

> **In one line:** A modern LLM app sits on six layers — models, frameworks/SDKs, retrieval data plane, evals + observability, infra/ops, and the runtime/cost layer underneath. Every layer has a default 2026 pick, and a small set of reasons to deviate.

:::tip[In plain English]
This chapter is a map, not a manual. You're not going to read it front-to-back and remember 80 tool names. You're going to skim it once so you know the *shape* of the stack, and then come back to a single page when you're actually picking something. Every page ends with a "default for most teams" and a list of when to deviate — that's the part you re-read at decision time.
:::

## The six layers

1. **Models** — Foundation model providers (closed and open), the servers that run them, and the embedding models used for retrieval.
2. **Frameworks & SDKs** — The thin client SDKs you call from your app, prompt management tooling, RAG libraries, and agent frameworks.
3. **Data & retrieval** — Vector databases, document parsing pipelines, and synthetic data tools.
4. **Evals & observability** — How you measure quality and watch behavior in production.
5. **Infra & ops** — Gateways, workflow orchestration, agent sandboxes, batch inference, voice infra, fine-tuning platforms.
6. **The checkpoint** — One opinionated default per layer, plus the "deviate when…" matrix.

## A typical request, end to end

A user sends a chat message. Here's the tour:

1. Browser hits your edge function. Your **LLM SDK** (Vercel AI SDK or Pydantic AI) builds a request.
2. The request goes through an **AI gateway** (Portkey, Helicone, LiteLLM Proxy) for routing, caching, and audit.
3. The gateway forwards to a **model provider** (Anthropic, OpenAI, Google) or a self-hosted **inference server** (vLLM).
4. The agent loop may call **tools** that hit a **vector DB** (pgvector), a search index, or run code inside an **agent runtime** (E2B, Modal sandbox).
5. Every call gets traced by **observability** (Langfuse, Helicone) and scored by **evals** (Promptfoo, Braintrust).
6. Long-running flows are managed by an **orchestration** engine (Inngest, Temporal) so they survive deploys and 429s.

Every page in this chapter is one of those boxes.

## How to use this chapter

- **First read:** skim in order — index → models → frameworks → data → evals → infra → checkpoint. ~30 minutes.
- **At decision time:** jump to the relevant page. Each page is structured: what the category does, the 2026 options table, default pick, when to deviate, a minimum integration snippet, pricing/cost note, common pitfalls.
- **At quarterly review time:** re-read the checkpoint. Tools age fast.

## A note on churn

This chapter ages the fastest of any in the book. Model names, prices, and tool features change quarterly. Specific names and pricing reflect **May 2026**. The *categories* — "you need a vector DB," "you need a gateway when you go multi-provider" — are durable for years. Read the structure as truth; treat the names as a snapshot.

## What's NOT in this chapter

- **Design patterns.** "Should I use RAG or fine-tune?" lives in [Chapter 13: Decisions](/docs/decisions). This chapter is "if you decided to RAG, which library?"
- **The agent loop itself.** [Chapter 1: Foundations](/docs/foundations) covers the mental model.
- **Pricing math by token.** Too volatile to put in a doc; check provider pages.

## Pitfalls when reading a stack chapter

- **Tool-shopping before problem-shopping.** Don't pick a vector DB before you know whether you need retrieval. The flow is: problem → pattern → tool, never the reverse.
- **Resume-driven engineering.** "We use Temporal + LangGraph + Weaviate + Braintrust" sounds impressive and doubles your ops surface for no reason. The boring default usually wins.
- **Conflating "popular" with "right for you."** LangChain has the most stars; that does not mean it fits your single feature. Read the "when to deviate" sections, not just the headline pick.

---

→ Start with [Closed providers (Anthropic / OpenAI / Google)](./closed-providers.md)
