---
id: closed-providers
title: Closed-source model providers
sidebar_position: 2
description: Anthropic, OpenAI, Google, xAI — the API-only foundation model providers and how they differ in 2026.
---

# Closed-source providers

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Hosted, API-only foundation models. You POST messages, you get tokens. Lowest operational burden, highest frontier quality, and what 90% of teams ship on in 2026.

:::tip[In plain English]
A "closed provider" is a company that trained a giant model, hides the weights, and rents you access through an HTTP endpoint. You don't manage GPUs, you don't manage scaling, you don't manage model files. You send a request and get an answer. Anthropic, OpenAI, Google, and xAI are the big four. The trade-off is that you can never run their best models on your own hardware — you're a tenant, not an owner.
:::

## The major four (June 2026)

| Provider | Flagship | Workhorse | Cheap tier | Context window | Notable strength |
|----------|----------|-----------|-----------|----------------|------------------|
| **Anthropic** | Claude Opus 4.8 | Claude Sonnet 4.6 | Claude Haiku 4.5 | 200k–1M | Coding, reasoning, agentic tool use |
| **OpenAI** | GPT-5.5 | GPT-5.4 | GPT-5.4 mini | ~1M | Ecosystem breadth, Realtime, image-gen |
| **Google** | Gemini 3.1 Pro | Gemini 3.5 Flash | Gemini 3.1 Flash-Lite | 1M | Long context, multimodal (audio + video), price |
| **xAI** | Grok 4.3 | Grok 4 mini | — | 1M | X-data integration, cost |

Versions drift quarterly. Treat names as snapshots; what stays true is the *tier shape* — every major provider ships flagship / workhorse / cheap.

:::note[Two 2026 shifts baked into this table]
- **Reasoning is now built in, not a separate model line.** OpenAI folded its old "o-series" reasoning models into GPT-5 under an automatic router (and is retiring the standalone o-series); Anthropic, Google, and xAI all ship a single model with a **reasoning-effort dial** (`none`/`low`/`medium`/`high`) instead of a distinct "thinking" model. When older text says "use o3 for hard reasoning," read it as "turn reasoning effort up."
- **1M-token context is the new baseline** for flagships, not a premium add-on. Anthropic also previewed a higher "Mythos-class" tier (Fable 5 / Mythos 5) in June 2026; availability has been in flux, so this guide stays on the broadly-available Opus tier — confirm the current top model on the vendor's page before betting on it.
:::

## Default pick for most teams

**Claude Sonnet** for the workhorse, **Claude Haiku** for cheap, **GPT-5.5** as the fallback. This combo gives you frontier-class reasoning, the cheapest competent classifier in the market, and a different provider to fail over to when Anthropic has a bad afternoon.

If you're already deeply inside Google Cloud or need the cheapest frontier-class multimodal model, swap the default to **Gemini 3.5 Flash** as your workhorse and Sonnet as the fallback.

## When to deviate

- **Frontier-only quality needed** (hard reasoning, legal/medical, complex agents): upgrade workhorse to **Claude Opus 4.8** or **GPT-5.5 with reasoning effort set high**.
- **Very long context** (whole books, full codebases, multi-hour transcripts): **Gemini 3.1 Pro** or any 1M-context flagship — and remember effective recall degrades well before the advertised limit, so still retrieve rather than dump.
- **Cheapest possible classification at high volume:** **Gemini 3.1 Flash-Lite** or **Haiku** — both are ~$0.25–$1 per million input tokens.
- **You ship inside the X / Grok ecosystem** or want native access to real-time X data: **Grok 4.3**.
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
  model: "gpt-5.5",
  messages: [{ role: "user", content: "Summarize the Bohr model in one sentence." }],
});
console.log(r.choices[0].message.content);
```

That's the entire SDK story for the simple case. Everything else — streaming, tools, structured output, caching — is additive flags on this shape.

## Pricing & cost notes (June 2026 ballpark)

| Tier | Input ($/Mtok) | Output ($/Mtok) | Use it for |
|------|---------------|----------------|-----------|
| Flagship (Opus 4.8, GPT-5.5, Gemini 3.1 Pro) | $3–$15 | $15–$50 | Hard reasoning, agents, code |
| Workhorse (Sonnet, GPT-5.4, Gemini 3.5 Flash) | $1–$5 | $5–$25 | Most product features |
| Cheap (Haiku, GPT-5.4 mini, Flash-Lite) | $0.10–$1 | $0.40–$5 | Classification, extraction, batch |

One cost trap specific to 2026: with reasoning on, the model emits **hidden reasoning tokens billed at the output rate** — budget roughly 3–5× the visible output you expect when you turn effort up.

Three discipline tricks that pay for themselves immediately:

- **Prompt caching.** Anthropic and OpenAI both bill cached prefixes at ~10% of fresh tokens. If your system prompt is 4k tokens, cache it.
- **Batch APIs.** 50% off if you can tolerate up to 24h latency — see the [batch inference page](./batch-inference.md).
- **Tier routing.** Don't call Opus to format a date. Cheap tier for cheap tasks.

## Why not pick one and forget it?

- **Outages.** Every provider has had a multi-hour bad day in the last 12 months. Have a fallback wired up.
- **Model drift.** Even within the same model name, behaviors shift between minor versions. Multi-provider gives you A/B leverage.
- **Cost arbitrage.** Sonnet for prod, Haiku for batch, Gemini Flash for classification can cut spend 60%+.
- **Capability gaps.** OpenAI ships Realtime voice; Anthropic ships the best agentic tool-use; Gemini ships the broadest native multimodality (audio + video in). You will eventually want all three.

Tools that abstract the "many providers" problem: **Portkey**, **OpenRouter**, **LiteLLM**, **Vercel AI SDK** — covered in [LLM SDKs](./llm-sdks.md) and [AI gateways](./ai-gateways.md).

## Pitfalls

- **Hard-coding a model name in 50 places.** Use a constant. When `claude-sonnet-4-6` is deprecated, you want one diff, not fifty.
- **Treating provider SDKs as interchangeable at the response shape.** They are not. Anthropic returns `content: [{type:'text', text:...}]`; OpenAI returns `choices[0].message.content`. Abstract this once or your code will rot.
- **No spend limit on the provider dashboard.** A loop that retries on failure can drain $50k in an hour. Set hard caps before you ship.
- **Putting the API key in a frontend env var.** `NEXT_PUBLIC_OPENAI_API_KEY` is a way to get your account drained. Always proxy through your backend.
- **Trusting marketing benchmarks.** Vendor leaderboards are gamed. Run your own eval suite — see [eval tools](./eval-tools.md) — before you bet your roadmap on a model.
- **Ignoring rate limits until production.** New accounts have low TPM caps. Request increases *before* launch day, not during the outage.

<Quiz id="closed-providers-quick-check" variant="micro" title="Quick check">

<Question
  prompt="A team needs to process multi-hour transcripts that blow past a 400k-token context in a single call. Which provider does the page point to?"
  options={[
    { text: "Anthropic Claude Opus" },
    { text: "OpenAI GPT-5.1" },
    { text: "Google Gemini 2.5 Pro" },
    { text: "xAI Grok 4" }
  ]}
  correct={2}
  explanation="Gemini is the only major option competing at the 1M-plus context end, which is why the page swaps it in as the workhorse for whole books, full codebases, and multi-hour transcripts. Opus and GPT-5.1 are stronger picks for hard reasoning, but their context windows top out well below Gemini's."
/>

<Question
  prompt="Why does the page advise against picking one provider and forgetting it?"
  options={[
    { text: "Provider SDKs are interchangeable, so switching costs nothing anyway" },
    { text: "Outages, model drift, cost arbitrage, and capability gaps all reward having a second provider wired up" },
    { text: "Closed providers contractually require customers to use multiple vendors" },
    { text: "Single-provider accounts cannot access prompt caching or batch APIs" }
  ]}
  correct={1}
  explanation="Every provider has had multi-hour outages, behaviors drift between versions, tier routing across providers can cut spend dramatically, and each vendor has unique capabilities. The first option is the tempting trap: SDKs are NOT interchangeable at the response shape, which is exactly why the page says to abstract that once."
/>

<Question
  prompt="What is the safe way to call a closed provider from a web application?"
  options={[
    { text: "Put the API key in a public frontend env var so the browser can call the provider directly" },
    { text: "Embed the key in the mobile app binary where users cannot see it" },
    { text: "Share one key across dev, staging, and prod for simplicity" },
    { text: "Proxy every request through your backend so the key never reaches the client" }
  ]}
  correct={3}
  explanation="A key shipped to the browser is readable by anyone with DevTools and is a way to get your account drained. Proxying through your backend keeps the credential server-side where you can also enforce auth, rate limits, and spend caps. App binaries are just as extractable as frontend env vars."
/>

</Quiz>

---

→ Next: [Open-weight models](./open-models.md)
