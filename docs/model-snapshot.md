---
id: model-snapshot
title: "Model & pricing snapshot"
sidebar_label: "Model snapshot (dated)"
description: The one clearly-dated page that owns current model names, tiers, context windows, and per-token prices. Everything else in the guide teaches the concepts; this page carries the numbers.
---

# Model & pricing snapshot

:::info[Last updated: June 2026]
This is the guide's **one deliberately volatile page**. Model names, version numbers, context
windows, and per-token prices change quarterly; the *concepts* in the rest of the guide do not.
When a lesson says "frontier tier" or "workhorse pricing," the current names and numbers live
here. If this page's date looks old, check the provider dashboards — the tier *shape* below
will still be right even when the names aren't.
:::

## The three tiers — current names

| Tier | Anthropic | OpenAI | Google | Open weights |
|------|-----------|--------|--------|--------------|
| **Frontier** | Claude Opus 4.7 | GPT-5 / 5.1, o4 | Gemini 2.5 Ultra / Deep Think | DeepSeek R1, Llama 4 (largest) |
| **Workhorse** | Claude Sonnet 4.6 | GPT-5.1 mini | Gemini 2.5 Pro | Llama-3.3-70B, Qwen-2.5-72B |
| **Small / cheap** | Claude Haiku 4.5 | GPT-5.1 nano | Gemini 2.5 Flash / Flash-Lite | Llama-3.3-8B, Phi-4, Qwen-2.5-7B |

## Per-token prices (ballpark, $/1M tokens)

| Tier | Input | Output | Typical latency |
|------|-------|--------|-----------------|
| Frontier | $3–$15 | $15–$75 | 1–5s TTFT (slower with reasoning) |
| Workhorse | $0.30–$3 | $1.50–$15 | 300ms–1s TTFT, 80–200 tok/s |
| Small | $0.05–$0.50 | $0.20–$2 | sub-200ms TTFT, 200–500+ tok/s |

Durable ratios (these survive every price cut): frontier ≈ **4–10×** workhorse ≈ **50–100×**
cheap, per token. Prompt-cached prefixes bill at ~10% of fresh tokens; batch APIs run ~50% off.

## The major closed providers

| Provider | Flagship | Workhorse | Cheap | Context | Notable strength |
|----------|----------|-----------|-------|---------|------------------|
| **Anthropic** | Claude Opus 4.7 | Claude Sonnet 4.6 | Claude Haiku 4.5 | 200k–1M | Coding, reasoning, agentic tool use |
| **OpenAI** | GPT-5.1 / o4 | GPT-5.1 mini | GPT-5.1 nano | 400k | Ecosystem breadth, Realtime voice, image-gen |
| **Google** | Gemini 2.5 Pro | Gemini 2.5 Flash | Flash-Lite | 1M–2M | Long context, multimodal, price |
| **xAI** | Grok 4 | Grok 4 mini | — | 256k | X-data integration, cost |

## Reasoning models

OpenAI o-series (o3 / o4 / o4-mini), Claude extended thinking, Gemini 2.5 Deep Think,
DeepSeek R1, Qwen3-Reasoner. Billed thinking tokens typically add 1K–30K tokens and 5–60s of
latency per answer.

## Open-weight landscape

Meta (Llama 3.3 / 4), Mistral (Large 2, Codestral), Alibaba (Qwen 2.5 / 3.0), DeepSeek (V3,
R1), Microsoft (Phi-4), Cohere (Command). Quality gap to the closed frontier: roughly ~3
months on most benchmarks as of this snapshot. Fast managed inference: Groq, Cerebras,
Fireworks, Together (Groq/Cerebras reach 1000+ tok/s on small models).

## Embedding models

OpenAI `text-embedding-3-large/small`, Cohere `embed-v4`, Voyage `voyage-3`, open-weight
`bge-m3` / `gte` families. Typical price: $0.02–$0.13 / 1M tokens.

---

**How to use this page:** lessons link here whenever they need a concrete model name or price.
If you're reading a lesson that names a model without a date, treat the name as an example of
its *tier*, and check this page for what currently occupies that tier.

→ Concepts behind this table: [Model families](/docs/foundations/model-families) ·
[Closed providers](/docs/stack/closed-providers) · [Open models](/docs/stack/open-models)
