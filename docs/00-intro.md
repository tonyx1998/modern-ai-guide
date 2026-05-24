---
id: intro
title: Modern AI Engineer Guide
sidebar_position: 1
sidebar_label: Introduction
slug: /
description: How AI systems are actually built in 2026 — for absolute beginners and beyond. 12 chapters plus an introduction, designed so you can master one topic per page.
toc_max_heading_level: 2
---

# Modern AI Engineering: A Comprehensive Guide (2026)

*How AI systems are actually built in 2026 — for absolute beginners and beyond.*

**What it is** — A 2026 reference on how LLM-powered applications are designed, built, evaluated, shipped, and operated, paired with a step-by-step roadmap for getting there from zero. **12 chapters plus this introduction**, split into focused single-topic pages.

**Who it's for** — Anyone from "I've used ChatGPT but never written code against an LLM" to "I build production AI systems and want a refresh on 2026 tooling."

**Where to start** — If you're new to AI engineering, jump straight to [the first lesson →](/docs/foundations/tokens). Everything else fans out from there.

*Last reviewed: May 2026. Model names, pricing, and "current state" claims are accurate as of that date — the AI space moves faster than anywhere else in software, so confirm specifics before relying on any single recommendation.*

---

## Two ground-truth facts before you start

1. **An LLM is just a function that takes text in and produces text out.** Every advanced AI feature — chat, search, agents, multimodal — is layered on top of that single primitive.

2. **Building LLM apps is mostly software engineering, plus three new disciplines: prompting, retrieval, and evals.** If you can already build a CRUD app, you're 70% of the way there.

---

## What this guide covers

Six themes, twelve chapters — written so a beginner can follow along while still being useful to working engineers.

### How LLM systems actually work
The bedrock: tokens, embeddings, the transformer (just enough to be useful), context windows, sampling, streaming, structured output, tool/function calling, retrieval-augmented generation (RAG), and agent loops.

→ Tokens and tokenizers · Embeddings and vector similarity · The attention mechanism · Sampling parameters · Tool use · The agent loop

[Read Foundations →](/docs/foundations)

### The 2026 AI toolbox
Every major provider, framework, and service explained: what it does, when to use it, why it exists, what it replaces.

→ OpenAI / Anthropic / Google / open models · vLLM / TGI / Ollama · LangChain / LlamaIndex / DSPy / Vercel AI SDK · Pinecone / Weaviate / pgvector / Turbopuffer · Braintrust / Langfuse / Promptfoo · Portkey / OpenRouter

[Read Tech Stack →](/docs/stack)

### Workflows at every scale
Solo indie builder, 20-person AI-first startup, and 2,000-engineer enterprise — three radically different ways to ship the same kind of AI feature.

→ Free-tier solo stack · Startup eval + obs stack · Enterprise governance + private cloud · How a feature ships at each scale

[Read Solo →](/docs/solo) · [Startup →](/docs/startup) · [Enterprise →](/docs/enterprise)

### The lifecycle and the patterns
What does an AI project actually look like, from "idea" to "shipped and measured"? And what patterns recur in every production LLM app?

→ Problem framing · Eval design · Streaming UX · Tool calling · Agent loops · Cost and latency control · Safety

[Read Lifecycle →](/docs/lifecycle) · [Read Production Patterns →](/docs/patterns)

### Decision frameworks
The recurring "should we…" debates in AI engineering, with concrete decision rules.

→ Prompt vs RAG vs fine-tune · Single agent vs chain vs multi-agent · Closed vs open model · Build vs buy · When *not* to use AI

[Read Decisions →](/docs/decisions)

### Career
What an AI engineer actually does in 2026, the specializations, and how to position yourself.

→ AI engineer vs ML engineer vs research engineer · Portfolio anatomy · Specialization tracks · Compensation context

[Read Career →](/docs/career)

---

## Conventions used throughout

- **Code samples** are illustrative, not always copy-pasteable. They show the shape of solutions in Python or TypeScript.
- **Model names** reflect the dominant choices as of *May 2026*. Tier names ("frontier," "mid-tier," "small") are used so the advice ages better than specific model IDs.
- **Cost estimates** are in US dollars and assume small/mid-scale usage unless specified.
- **"In 2026"** indicates current-state context — these things change.
- **Pitfalls and gotchas** are flagged explicitly. Most of the value of experience is knowing what *not* to do.

## A note on bias

This guide is opinionated. Where multiple defensible options exist, it recommends the one that:

1. Has the most active community and ecosystem in 2026
2. Is the easiest to hire for over the next 2–3 years
3. Has the lowest operational burden for the team size
4. Doesn't lock you in beyond reasonable reversibility

Disagree with some choices? That's fine — read the reasoning, then make your own call based on your context.

---

**Ready?** → [Start with the first lesson: What is a token?](/docs/foundations/tokens)
