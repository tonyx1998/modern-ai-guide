---
id: stack-checkpoint
title: Stack checkpoint
sidebar_position: 99
description: The minimum-viable 2026 stack — one pick per layer — and the explicit list of when to deviate.
---

# Stack checkpoint

> **In one line:** If you're starting a new AI app today and want a no-think default stack, here it is — every layer, one pick each, with the explicit "switch when…" rules.

:::tip[In plain English]
This page is the answer to "what do I actually use?" — the minimum-viable 2026 stack. Pick from this table on day one, ship something, and only revisit a row when you have a *measured* reason. The "when to deviate" section below is the part that actually matters six months in.
:::

## The default 2026 stack

| Layer | Default pick | Why |
|------|-------------|-----|
| **Frontier model** | Claude Sonnet (or GPT-5.1) | Best quality / cost / latency balance |
| **Cheap model** | Claude Haiku (or Gemini Flash-Lite) | Classification, batch, internal tools |
| **Embeddings** | OpenAI `text-embedding-3-small` | Ubiquitous, cheap ($0.02/Mtok), good |
| **LLM SDK** | Vercel AI SDK (TS) / Pydantic AI (Py) | Thin, typed, no framework tax |
| **Prompt management** | Git + Markdown + Promptfoo | Zero new vendors; PR-reviewable |
| **RAG approach** | Raw code + pgvector | Build v0 yourself; reach for LlamaIndex later |
| **Agent loop** | DIY `while` loop, then LangGraph | Understand it first; framework later |
| **Vector DB** | pgvector | You probably already have Postgres |
| **Document parsing** | `unstructured` + vision-LLM fallback | Covers 90% of formats |
| **Synthetic data** | DIY Self-Instruct with Claude | $5 generation run beats $500 of vendor tooling early |
| **Eval tool** | Promptfoo in CI | Lightest, version-controlled |
| **Observability** | Langfuse (OSS) | Open-source default; combine with Helicone for proxy mode |
| **Gateway** | None (yet) | Add when you're using 2+ providers |
| **Orchestration** | None (yet) | Add when flows exceed 30 seconds |
| **Agent runtime** | None (yet) | Add when the agent needs to run arbitrary code |
| **Batch inference** | OpenAI/Anthropic native Batch API | 50% off for anything non-interactive |
| **Voice** | OpenAI Realtime (in-app) / Vapi (phone) | Simplest paths |
| **Fine-tuning** | None (yet) | Only after you've maxed out prompting + RAG |
| **Hosting** | Vercel (TS) / Modal (Py) | Zero-config AI deployments |

## When to deviate (the table that actually matters)

| Trigger | Action |
|--------|--------|
| Frontier quality required for hard tasks | Swap workhorse to **Claude Opus** or **GPT-5.1 flagship / o4** |
| Need 500k+ context routinely | Switch workhorse to **Gemini 2.5 Pro** |
| Embedding quality is the bottleneck | Move to **Voyage `voyage-3`** |
| Code-search specifically | **`voyage-code-3`** |
| >10M vectors with hot QPS | Move from pgvector to **Qdrant**, **Weaviate**, or **Pinecone** |
| Many small tenants, mostly cold | **Turbopuffer** |
| 2+ providers in production | Add **Portkey** or **LiteLLM Proxy** gateway |
| Need to swap models in one place | Add a gateway |
| Flows take longer than 30s | Add **Inngest** (TS) or **Temporal** / **Modal** (Py) |
| Agent needs to write + run code | Add **E2B** or **Modal sandboxes** |
| LLM bill > $5k/mo and falling on non-interactive jobs | Move to **batch APIs** for 50% off |
| Non-engineering prompt authors | Add **PromptLayer** or **Braintrust Prompts** |
| Eval discipline is becoming the bottleneck | Move from Promptfoo to **Braintrust** or **Langfuse evals** |
| Hallucination is an existential risk | Add **Patronus**, **Cleanlab**, or LLM-as-judge with stricter rubrics |
| Phone-based voice product | **Vapi** or **Retell** |
| Cost-per-call too high on cheap model | Consider **fine-tuning Haiku** or moving to **fine-tuned Llama on Together** |
| Compliance / data residency | Self-hosted **vLLM** on open weights inside your VPC |
| Throughput floor for open model serving | **Groq** (LPU) or self-hosted **vLLM** |
| Synthetic eval data needed at scale | Add **Distilabel + Argilla** |

## A worked example: starting a new RAG-powered support assistant

Day 0 stack:

- Claude Sonnet for the answer; Haiku for classification.
- `text-embedding-3-small` for embeddings.
- Vercel AI SDK in a Next.js app on Vercel.
- pgvector inside Supabase.
- `unstructured` to parse the docs.
- 30 hand-written eval cases in `promptfoo.yaml`, run in CI.
- Langfuse Cloud free tier for observability.
- No gateway, no orchestration, no agent runtime, no fine-tuning.

That's a complete, production-credible stack. It costs ~$50/mo at modest scale. You can ship it in a week.

Month 6 — you've added:

- A second provider (OpenAI as fallback) → **Portkey gateway**.
- A nightly job that re-summarizes new docs → **Inngest**.
- The eval set has grown to 200 cases → **Braintrust** for the dashboard.
- A "show me a chart of last quarter" feature → **E2B sandbox**.

That's the natural deviation path — one row at a time, each driven by a measured need.

## What to *not* over-invest in early

- **Multi-agent frameworks** before you have a working single agent.
- **Self-hosted open models** before your bill justifies the platform-team cost.
- **Fine-tuning** before you've maxed out prompting and RAG.
- **A vector DB other than pgvector** before you have a measured pgvector pain point.
- **A gateway** before you have a second provider.
- **An orchestration engine** for a flow that fits in a single HTTP request.
- **An agent runtime** when typed tools cover the job.
- **A prompt management tool** when prompts live happily in your repo.
- **Synthetic data vendors** when 50 lines of Self-Instruct does the job.

## Pitfalls (cross-cutting)

- **Resume-driven engineering.** "We use Temporal + LangGraph + Weaviate + Braintrust + Modal + Portkey" sounds impressive and triples your ops surface for no reason. The boring default beats it for the first year.
- **Picking tools by popularity.** Star count ≠ fit-for-your-problem. Read the "when to deviate" rows.
- **Building everything before measuring.** Ship something small with the default stack; let production tell you which layer needs investment.
- **Skipping observability and evals.** Every other choice on this page is debuggable only if you have logs and a quality signal. Wire these in on day one.
- **No spend cap on any provider.** A loop on Opus can drain $20k overnight. Set hard caps.
- **Locking into one cloud's AI stack.** Bedrock-only, Vertex-only, Azure-only — fine for compliance, but you've given up the cost / capability arbitrage of multi-provider.

---

→ Continue to [Chapter 5: Solo / Indie AI](/docs/solo).
