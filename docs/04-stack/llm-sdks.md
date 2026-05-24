---
id: llm-sdks
title: LLM SDKs
sidebar_position: 6
description: Vercel AI SDK, native provider SDKs, Pydantic AI, LiteLLM, Portkey — the thin layers between your code and the model.
---

# LLM SDKs

> **In one line:** The thinnest abstraction in the stack — a typed client that wraps "send messages, get tokens (and maybe tool calls)." Not RAG, not agents. Just the call.

:::tip[In plain English]
An LLM SDK is what sits between your code and the model provider's HTTP endpoint. At minimum it handles auth, retries, and parsing the response. The good ones also give you streaming, structured output, tool calling, and a unified shape across providers so you can swap Anthropic for OpenAI without rewriting the world. If you're building anything bigger than a script, you want one of these.
:::

## The major options (2026)

| SDK | Language | Multi-provider | Streaming | Tools | Structured output | Best for |
|-----|---------|---------------|----------|-------|-------------------|---------|
| **Vercel AI SDK** | TypeScript | yes | first-class | yes | yes (Zod) | Any TS / Next.js app |
| **Pydantic AI** | Python | yes | yes | yes | yes (Pydantic) | Type-safe Python |
| **OpenAI SDK** | TS / Py / many | no | yes | yes | yes | Single-provider, all features |
| **Anthropic SDK** | TS / Py | no | yes | yes | yes (via tool) | Single-provider, all features |
| **Google Gen AI SDK** | TS / Py | no | yes | yes | yes | Gemini-native |
| **LiteLLM** | Python | yes (100+ providers) | yes | yes | partial | Cheap multi-provider routing |
| **Portkey SDK** | TS / Py | yes (via gateway) | yes | yes | yes | Gateway-as-SDK |
| **Instructor** | Py / TS | yes | yes | yes | yes (best-in-class) | When structured output is the point |
| **LangChain / LlamaIndex** | Py / TS | yes | yes | yes | yes | RAG/agent apps (see those pages) |

## Default pick for most teams

- **TypeScript / Next.js:** **Vercel AI SDK**. It's the default. Streaming hooks for React, `generateObject` for structured output with Zod, provider swap is one import.
- **Python:** **Pydantic AI** if you want types and an agent loop baked in; **the native provider SDK** if you're sticking with one provider and want zero abstraction.
- **Cost routing across many providers in Python:** **LiteLLM**.

## When to deviate

- **You only ever call one provider** and want every brand-new feature day-one (Anthropic prompt caching, OpenAI Realtime): use that provider's native SDK directly.
- **Structured output is the whole game** (extracting JSON from documents): **Instructor**. It retries on schema violations and gives you a Pydantic model out the other side.
- **You already use a gateway** (Portkey, OpenRouter, LiteLLM Proxy): use its SDK and get observability + routing for free.
- **You're building serious RAG or agent infrastructure**: jump to a framework — [RAG frameworks](./rag-frameworks.md), [agent frameworks](./agent-frameworks.md). An SDK is too thin.

## Minimum integration

**Vercel AI SDK — streaming chat in a Next.js route:**

```typescript
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    messages,
  });
  return result.toDataStreamResponse();
}
```

Swap providers with one line: `import { openai } from "@ai-sdk/openai"` and change the `model` argument. The rest of the code is identical.

**Pydantic AI — structured output with types:**

```python
from pydantic import BaseModel
from pydantic_ai import Agent

class Recipe(BaseModel):
    name: str
    ingredients: list[str]
    minutes: int

agent = Agent("anthropic:claude-sonnet-4-6", result_type=Recipe)
result = agent.run_sync("Suggest a quick pasta recipe.")
print(result.data.name)  # typed, validated Recipe
```

**LiteLLM — same code, any provider:**

```python
from litellm import completion

response = completion(
    model="claude-sonnet-4-6",        # or "gpt-5.1", "gemini/gemini-2.5-pro", ...
    messages=[{"role": "user", "content": "Hello"}],
)
```

## Pricing & cost notes

SDKs themselves are free and open-source. The cost is in what they call. Two things to know:

- **Provider-hosted gateways** (Portkey, OpenRouter, Helicone) typically add 0–5% on top of provider pricing in exchange for routing/observability. Often worth it.
- **`LiteLLM` self-hosted** is free at the SDK layer but adds latency overhead (~5–20ms) and another service to operate if you run the proxy.

## What an SDK should give you

- **Auth and retries** — bearer tokens, exponential backoff on 429/503.
- **Streaming** — async iterator over deltas, with a clean way to extract tool calls.
- **Structured output** — pass a schema (Zod / Pydantic), get a validated object out.
- **Tool calling** — declare tools, the SDK shuttles calls and results.
- **Provider abstraction** — swap models with one line, not a rewrite.
- **Token / cost accounting** — usage data per call, ideally aggregated.

If your SDK doesn't give you these, you'll end up reinventing them.

## Pitfalls

- **Using a heavy framework when you need an SDK.** LangChain to send one message is a 50MB dependency and a stack trace. Reach for it only when you need its higher-level pieces.
- **Hand-rolling SSE parsing.** Don't. Streaming is exactly what SDKs exist for; getting the chunk-boundary edge cases right takes longer than you think.
- **Logging the whole prompt at INFO level.** PII and secrets leak into your log aggregator. Log a trace ID; let your observability tool capture the body.
- **No retries on `529 Overloaded`.** Anthropic and OpenAI both throw these under load. A 3-attempt exponential backoff is table stakes.
- **Trusting `provider-agnostic` to mean "identical behavior."** Tool-call JSON, content blocks, refusal phrasing — these vary. Always run your eval suite when you swap providers, even through a "unified" SDK.
- **Mixing SDK versions across services.** Two services on different `@ai-sdk/anthropic` versions can produce subtly different output shapes. Pin and update on purpose.

---

→ Next: [Prompt management](./prompt-management.md)
