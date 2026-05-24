---
id: career-skill-stack
title: The skill stack
sidebar_position: 5
sidebar_label: 4. The skill stack
description: What to actually be good at as a 2026 AI engineer. Foundations plus three new disciplines, with concrete tools and references.
---

# The skill stack

> **In one line:** Six software-engineering foundations plus three AI-specific disciplines (prompting, retrieval, evals) plus five compounding adjacents — that's the 2026 AI-engineering skill stack.

:::tip[In plain English]
The skill stack on this page is the union of what hiring managers screen for and what working AI engineers actually use day-to-day. It is *not* a degree program. The right way to read it is: pick the weakest item, do one shipped project that forces you to use it, then move on. Depth comes from shipping, not from study.
:::

## Software-engineering foundations (don't skip)

These are the same as for any senior software engineer — but skipping them is the single most common reason a hot AI engineer plateaus at year 3.

### A modern language

**TypeScript or Python — ideally both at a working level.** In 2026, most production AI code is one of these two:

- TypeScript dominates AI features in web products (Vercel AI SDK, Next.js, Cursor-style apps).
- Python dominates AI orchestration, evals, agents, model training, and most ML tooling.

If forced to pick one, pick the one your target company uses. If unforced, Python first for AI-systems work, then TypeScript for the user-facing layer.

### HTTP, REST, and streaming

- **REST and JSON** — the lingua franca.
- **SSE (Server-Sent Events)** — how tokens stream from server to client. Used by every chat UI in 2026.
- **WebSockets** — bidirectional, used for voice and for client-driven interrupts.
- **gRPC** — common at infrastructure companies and inside large orgs.
- **Auth basics** — Bearer tokens, OAuth, session management.

### Relational databases and basic data modeling

**PostgreSQL is the safe 2026 default.** It covers vector search via pgvector for almost every team with under 10M documents, supports JSONB for flexible schemas, and has Supabase / Neon / Render as managed-Postgres providers that "just work."

Know: schema design, indexes (B-tree, GIN, HNSW for vectors), transactions, basic query optimization (EXPLAIN ANALYZE), migrations (Prisma, Drizzle, Alembic).

### Containers and one cloud

Pick one and get deep: **AWS** (largest market, most legacy), **GCP** (best AI-native infra, used by Anthropic, Vertex AI, GKE), **Azure** (huge enterprise foothold, deeply integrated with OpenAI), or one of the modern serverless platforms (**Vercel** for frontend + edge functions, **Cloudflare Workers** for global edge, **Modal** for serverless GPU + Python, **Railway** or **Render** for full-stack defaults).

Containers: Docker is universal, Kubernetes only matters past a certain scale.

### Git, code review, testing, CI/CD

Universal. You should be able to: write a clean PR description, review someone else's PR substantively, set up GitHub Actions for tests + lint + deploy, run unit + integration tests with at least one framework per language (pytest, Vitest), debug a flaky test.

### Reading other people's code well

The skill that compounds hardest as you grow. Modern AI engineering means reading a lot of: model provider SDKs (Anthropic, OpenAI), eval framework source (Braintrust, Langfuse), agent framework source (LangGraph, Inngest, Mastra), open-source AI libraries (DSPy, Outlines, Instructor).

## The three AI-specific disciplines

If you're only solid on one of these, you're junior. Mid-level is solid on all three. Senior teaches them.

### Prompting

Designing prompts that work reliably across the input distribution.

- **System vs user split** — what goes where, why.
- **Output schemas** — JSON schema (OpenAI, Anthropic), `Instructor` (Python) or Zod (TypeScript) for typed outputs.
- **Few-shot examples** — when they help, when they hurt.
- **XML tags vs Markdown** — Anthropic-style structure for long prompts.
- **Refusal handling** — how to design prompts that don't trigger over-refusal but do refuse the right things.
- **Prompt injection awareness** — what attacks look like, basic defenses.
- **Prompt caching** — Anthropic and OpenAI both support it in 2026; massive cost wins when used correctly.
- **Anthropic's `<thinking>` / extended thinking patterns**, OpenAI's reasoning models — when reasoning modes are worth it.

### Retrieval

Owns RAG quality.

- **Chunking** — fixed-window with overlap (simple, default), semantic (markdown-aware, paragraph-respecting), structural (function-level for code, slide-level for decks).
- **Embedding models** — OpenAI text-embedding-3-large, Cohere embed-v4, Voyage AI voyage-3, open-source nomic-embed and bge.
- **Vector store** — pgvector for most teams; Pinecone, Weaviate, Qdrant, Chroma, LanceDB for specialized needs.
- **Hybrid search** — BM25 + vector with reciprocal rank fusion or weighted score combination.
- **Reranking** — Cohere rerank-3, Voyage rerank, or a fine-tuned cross-encoder.
- **Citation enforcement** — make the model cite chunks, then verify the cites point at chunks that actually contain the claim.
- **Eval-driven retrieval** — recall@k, precision@k, MRR, plus an end-to-end LLM-as-judge for retrieval-fed answers.

### Evals

The single biggest skill differentiator in 2026.

- **Test-case design** — what makes a good eval set: representative, sized to catch regressions, refreshed against production samples.
- **LLM-as-judge** — calibration against human labels, judge prompt design, mitigating known biases (verbosity, position).
- **Regression discipline** — every prompt change goes through evals before merging.
- **Production sampling** — log sample N% of traffic, label, fold into the eval set.
- **Statistical significance** — when a 92% → 94% score is real and when it's noise.
- **Platforms** — **Braintrust, Langfuse, LangSmith, Promptfoo, Inspect AI, OpenAI evals, Phoenix (Arize)** — pick one and get hands-on.

## Adjacent skills that compound

### Cost and latency intuition

Know roughly: Claude Sonnet 4 ~$3/M input, ~$15/M output; GPT-4o-mini ~100x cheaper than GPT-4o on input; Haiku and gpt-4o-mini are the right default for high-volume / latency-sensitive paths; embeddings ~$0.10/M tokens. Know how to estimate the monthly bill of a feature design *before* you build it.

### Observability mindset

Every LLM call should be loggable, traceable, replayable. You should reflexively wrap new calls in a span. Tools: **Langfuse, LangSmith, Helicone, Phoenix, Datadog APM**, plus OpenTelemetry under the hood.

### Product taste for AI

You can tell which features should exist as AI features and which shouldn't. You can kill an AI feature when the team wants to add it.

### Communication

Translating "the model is 91% accurate" into something a PM, designer, or executive understands and can act on. Writing one-page memos. Talking through tradeoffs without jargon.

### Healthy skepticism of hype

Reading benchmark tables critically, recognizing leaderboard-stuffing, discounting "agentic" demos that are 30-step cherry-picked tapes.

## Skills you don't need to start

You will hear that "real" AI engineers know all of these. You don't need them to start.

- Training neural networks from scratch.
- Linear algebra beyond "vectors have directions and dot products tell you about similarity."
- The math of attention. (Useful at year 3 if you're going into research engineering or fine-tuning.)
- CUDA programming. (Useful only if you're going into inference specialization or research engineering.)
- Distributed training (FSDP, DeepSpeed, Megatron).

Some of these matter for specialization tracks (next page). They don't matter for getting the first AI engineering job.

:::note[Try it yourself: the "single-project skill audit"]
Pick your most recent shipped project. For each item on this page, score 0 / 1 / 2:

- 0 = the project doesn't use this skill
- 1 = the project uses it superficially (e.g., one LLM call with a hardcoded prompt)
- 2 = the project uses it substantively (e.g., prompts under version control, eval suite, traced calls)

If your project scores below a 1 on prompting, retrieval, or evals, the next project should specifically target the lowest-scored discipline. **One project that exercises all three disciplines at "2" level beats three projects that each cover only one.**
:::

:::info[Highlight: depth on AI-specific over breadth on everything]
A common 2026 failure mode: candidates who have used every framework once (LangChain, LlamaIndex, DSPy, CrewAI, Vercel AI SDK, Mastra…) but have never built an eval suite. Hiring managers see a long tool list and assume the candidate is collecting frameworks instead of solving problems. **A resume that mentions one orchestration framework and one eval platform — both used substantively — beats a resume that mentions seven of each.**
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Skipping SWE foundations because "I'll use Cursor."** The interview will ask you to debug a streaming bug, explain a slow Postgres query, or design a schema without Cursor open. Cursor is a force multiplier, not a substitute.
- **Studying papers without shipping.** "I read AGI Foundations every weekend" is not a hiring signal. "I shipped a feature with an eval suite and a 0.3-cent-per-request budget" is.
- **Treating prompting as a once-and-done.** Prompts drift with model versions, with data drift, with user behavior. The senior version of prompting is **maintenance discipline**, not first-draft cleverness.
- **Picking a vector DB before you have a retrieval problem.** Most teams under 1M documents are best served by pgvector. Don't add Pinecone or Weaviate operational complexity until the data and the latency budget force it.
- **Letting framework choice substitute for understanding.** LangChain vs LlamaIndex vs DSPy is a much smaller decision than "do I understand what's actually happening in each LLM call." The frameworks come and go; the primitives don't.
:::

→ Next: [Specialization tracks](./05-specializations.md).
