---
id: part-1-overview
title: Part I — From Zero
sidebar_position: 1
sidebar_label: Part I overview
description: Ten stages, ~3–6 months of part-time effort, from "never made an LLM API call" to "shipped a production AI feature with evals and observability."
---

# Part I — From Zero

*Ten stages. Each one ends with an artifact — build it before moving on, or none of this sticks.*

The whole arc is **3–6 months of part-time effort**. If a stage feels easy, skim it and do the artifact to verify. If a stage feels hard, slow down — there is no shortcut around understanding what `chat.completions.create` returns.

:::tip[The compounding order]
Each stage assumes everything before it. Structured output before tool calling. Tool calling before RAG-with-tools. Evals before agents. Skipping is the most common way new AI engineers stall — they grind on agents they're not ready to debug and conclude "AI is unreliable." (It is. The point is to build the discipline that makes it reliable enough to ship.)
:::

## The ten stages

| Stage | Topic | Time | Artifact |
|-------|-------|------|----------|
| [0](./01-stage-0-setup.md) | Setup | ~1 day | API key, working SDK, three verification scripts |
| [1](./02-stage-1-first-call.md) | First API call | ~half a day | A CLI tool that asks the model anything and prints the response (with token counts) |
| [2](./03-stage-2-chatbot.md) | Streaming chatbot | ~1 week | A web chat UI that streams tokens with conversation history |
| [3](./04-stage-3-structured-output.md) | Structured output | ~3–5 days | A typed extractor — paste an email, get back `{category, priority, summary}` validated by schema |
| [4](./05-stage-4-tools.md) | Tool calling | ~1 week | A 2–3 tool assistant where the model picks the right function |
| [5](./06-stage-5-rag.md) | RAG over your docs | ~2 weeks | A RAG system over your own notes/PDFs, with citations |
| [6](./07-stage-6-evals.md) | Your first eval set | ~1 week | 50–100 case eval suite for the RAG, with deterministic + LLM-judge checks |
| [7](./08-stage-7-observability.md) | Observability | ~3–5 days | Every LLM call logged, traced, cost-attributed |
| [8](./09-stage-8-agent.md) | A simple agent | ~1–2 weeks | A single-agent loop with iteration caps, tool budgets, and human-in-the-loop on writes |
| [9](./10-stage-9-ship.md) | Ship it | ~1 week | One project deployed to a URL, with auth, rate limits, cost caps, and a status page |

→ [Start with Stage 0](./01-stage-0-setup.md)
