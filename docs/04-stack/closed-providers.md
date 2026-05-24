---
id: closed-providers
title: Closed-source model providers
sidebar_position: 2
description: Anthropic, OpenAI, Google, xAI — the API-only foundation model providers and how they differ in 2026.
---

# Closed-source providers

> **In one line:** Hosted, API-only foundation models. You POST messages, you get tokens. Lowest operational burden, highest frontier quality, and what 90% of teams ship on in 2026.

:::tip[In plain English]
A "closed provider" is a company that trained a giant model, hides the weights, and rents you access through an HTTP endpoint. You don't manage GPUs, you don't manage scaling, you don't manage model files. You send a request and get an answer. Anthropic, OpenAI, Google, and xAI are the big four. The trade-off is that you can never run their best models on your own hardware — you're a tenant, not an owner.
:::

## The major four (May 2026)

| Provider | Flagship | Workhorse | Cheap tier | Context window | Notable strength |
|----------|----------|-----------|-----------|----------------|------------------|
| **Anthropic** | Claude Opus 4.7 | Claude Sonnet 4.6 | Claude Haiku 4.5 | 200k–1M | Coding, reasoning, agentic tool use |
| **OpenAI** | GPT-5.1 / o4 | GPT-5.1 mini | GPT-5.1 nano | 400k | Ecosystem breadth, Realtime, image-gen |
| **Google** | Gemini 2.5 Pro | Gemini 2.5 Flash | Gemini Flash-Lite | 1M–2M | Long context, multimodal, price |
| **xAI** | Grok 4 | Grok 4 mini | — | 256k | X-data integration, cost |

Versions drift quarterly. Treat names as snapshots; what stays true is the *tier shape* — every major provider ships flagship / workhorse / cheap.

## Default pick for most teams

**Claude Sonnet** for the workhorse, **Claude Haiku** for cheap, **GPT-5.1** as the fallback. This combo gives you frontier-class reasoning, the cheapest competent classifier in the market, and a different provider to fail over to when Anthropic has a bad afternoon.

If you're already deeply inside Google Cloud or need 1M+ token contexts, swap the default to **Gemini 2.5 Pro** as your workhorse and Sonnet as the fallback.

## When to deviate

- **Frontier-only quality needed** (hard reasoning, legal/medical, complex agents): upgrade workhorse to **Claude Opus** or **OpenAI o4**.
- **Very long context** (whole books, full codebases, multi-hour transcripts): **Gemini 2.5 Pro** — nothing else competes at the 1M+ end.
- **Cheapest possible classification at high volume:** **Gemini Flash-Lite** or **Haiku** — both are ~$0.25–$1 per million input tokens.
- **You ship inside the X / Grok ecosystem** or want native access to real-time X data: **Grok 4**.
- **Compliance / data residency** rules out US hyperscalers: regional offerings from **Mistral**, **Aleph Alpha**, or one of the closed providers via **Azure / Bedrock / Vertex** in the right region.

## Minimum integration

```python
# Anthropic — three lines to a working call
from anthropic import Anthropic

client = Anthropic()  # reads ANTHROPIC_API_KEY from env

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Summarize the Bohr model in one sentence."}],
)
print(response.content[0].text)
```

```typescript
// OpenAI — same shape, TypeScript
import OpenAI from "openai";

const client = new OpenAI(); // reads OPENAI_API_KEY

const r = await client.chat.completions.create({
  model: "gpt-5.1",
  messages: [{ role: "user", content: "Summarize the Bohr model in one sentence." }],
});
console.log(r.choices[0].message.content);
```

That's the entire SDK story for the simple case. Everything else — streaming, tools, structured output, caching — is additive flags on this shape.

## Pricing & cost notes (May 2026 ballpark)

| Tier | Input ($/Mtok) | Output ($/Mtok) | Use it for |
|------|---------------|----------------|-----------|
| Flagship (Opus, GPT-5.1, Gemini 2.5 Pro) | $5–$15 | $15–$75 | Hard reasoning, agents, code |
| Workhorse (Sonnet, mini) | $1–$3 | $5–$15 | Most product features |
| Cheap (Haiku, nano, Flash-Lite) | $0.10–$0.50 | $0.40–$2 | Classification, extraction, batch |

Three discipline tricks that pay for themselves immediately:

- **Prompt caching.** Anthropic and OpenAI both bill cached prefixes at ~10% of fresh tokens. If your system prompt is 4k tokens, cache it.
- **Batch APIs.** 50% off if you can tolerate up to 24h latency — see the [batch inference page](./batch-inference.md).
- **Tier routing.** Don't call Opus to format a date. Cheap tier for cheap tasks.

## Why not pick one and forget it?

- **Outages.** Every provider has had a multi-hour bad day in the last 12 months. Have a fallback wired up.
- **Model drift.** Even within the same model name, behaviors shift between minor versions. Multi-provider gives you A/B leverage.
- **Cost arbitrage.** Sonnet for prod, Haiku for batch, Gemini Flash for classification can cut spend 60%+.
- **Capability gaps.** OpenAI ships Realtime voice; Anthropic ships the best tool-use; Gemini ships 2M context. You will eventually want all three.

Tools that abstract the "many providers" problem: **Portkey**, **OpenRouter**, **LiteLLM**, **Vercel AI SDK** — covered in [LLM SDKs](./llm-sdks.md) and [AI gateways](./ai-gateways.md).

## Pitfalls

- **Hard-coding a model name in 50 places.** Use a constant. When `claude-sonnet-4-6` is deprecated, you want one diff, not fifty.
- **Treating provider SDKs as interchangeable at the response shape.** They are not. Anthropic returns `content: [{type:'text', text:...}]`; OpenAI returns `choices[0].message.content`. Abstract this once or your code will rot.
- **No spend limit on the provider dashboard.** A loop that retries on failure can drain $50k in an hour. Set hard caps before you ship.
- **Putting the API key in a frontend env var.** `NEXT_PUBLIC_OPENAI_API_KEY` is a way to get your account drained. Always proxy through your backend.
- **Trusting marketing benchmarks.** Vendor leaderboards are gamed. Run your own eval suite — see [eval tools](./eval-tools.md) — before you bet your roadmap on a model.
- **Ignoring rate limits until production.** New accounts have low TPM caps. Request increases *before* launch day, not during the outage.

---

→ Next: [Open-weight models](./open-models.md)
