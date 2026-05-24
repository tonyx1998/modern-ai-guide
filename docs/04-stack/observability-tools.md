---
id: observability-tools
title: Observability tools
sidebar_position: 14
description: Langfuse, LangSmith, Helicone, Arize Phoenix, Braintrust — logging, tracing, cost tracking for every LLM call.
---

# Observability tools

> **In one line:** What Datadog and Sentry are for traditional services, these are for LLM calls — per-request prompt + response + tokens + cost + latency, plus traces across multi-step agent flows.

:::tip[In plain English]
LLM observability is *just* logging — but with three twists. First, the payloads are huge (a 32k-token prompt is not a one-line log). Second, the cost matters per-request, so you want $$ on every span. Third, multi-step agent runs need a trace tree, not a flat log. Without observability, you can't answer "why did this user get a bad answer?" because you don't have the prompt that produced it. With it, you have a one-click replay button into the exact failure.
:::

## The major options (2026)

| Tool | Type | OSS? | Strengths | $ shape |
|------|------|------|-----------|--------|
| **Langfuse** | Self / hosted | yes (MIT) | OSS default; combines obs + evals + prompt mgmt | Free OSS / Cloud free + paid tiers |
| **Helicone** | Proxy + async | partial OSS | Easiest setup (one-line proxy); caching | Free up to 100k req / paid |
| **LangSmith** | Hosted | no | LangChain-native; rich trace UI | Free + $39/seat |
| **Arize Phoenix** | OSS + Arize cloud | yes | Broad ML + LLM; OpenTelemetry-native | Free OSS / cloud paid |
| **Braintrust** | Hosted | partial | Eval-first; observability included | Hobby free / usage |
| **Honeycomb / Datadog / Grafana** | Existing APM + OTel | varies | Pipes LLM spans into existing platform | Existing APM bill |
| **OpenLLMetry** (Traceloop) | OSS SDK | yes | OpenTelemetry semantics for LLMs | Free SDK + cloud option |
| **W&B Weave** | Hosted | partial | Strong on experiment tracking | Free + paid |

## Default pick for most teams

**Langfuse, self-hosted or cloud.** Open-source, generous free tier, captures everything (prompts, tools, responses, costs, latency), and the trace UI is good enough for production debugging.

If you want the absolute fastest setup ("change one line, get observability"), **Helicone** in proxy mode is hard to beat — point your OpenAI/Anthropic SDK at Helicone's base URL and you're done.

If you're already in a serious APM platform (Datadog, Honeycomb, Grafana), use **OpenLLMetry** or the platform's native LLM integration and skip the dedicated tool.

## When to deviate

- **You want obs + evals + prompt management in one tool**: **Langfuse** or **Braintrust** — they bundle.
- **You want OTel-native everything** so LLM spans land in the same trace as your HTTP spans: **OpenLLMetry** + your existing APM, or **Arize Phoenix**.
- **You already use LangChain**: **LangSmith** is the integrated pick.
- **You need caching at the proxy** (identical prompt → cached response): **Helicone** does this and observability in one.
- **You need PII redaction at the observability layer**: **Helicone** and **Langfuse** both have it; enterprise tools (Patronus, Lakera) extend it.
- **Highly regulated, on-prem**: self-hosted **Langfuse** or **Arize Phoenix**.

## Minimum integration

**Langfuse — wrap the SDK:**

```python
from langfuse.openai import openai   # drop-in: same API, traced

response = openai.chat.completions.create(
    model="gpt-5.1",
    messages=[{"role": "user", "content": "Hello"}],
)
# Trace appears in Langfuse with prompt, response, tokens, cost, latency.
```

**Helicone — change base URL only:**

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url="https://oai.helicone.ai/v1",
    default_headers={"Helicone-Auth": f"Bearer {os.environ['HELICONE_API_KEY']}"},
)
# Every call now logged to Helicone, nothing else changes.
```

**OpenLLMetry — OpenTelemetry semantics:**

```python
from traceloop.sdk import Traceloop
Traceloop.init(app_name="my-app")
# Now any anthropic / openai / langchain call emits OTel spans to your APM.
```

## What good observability captures

- Full prompt (system + messages + tool definitions) per call.
- Full response (content + tool calls + finish reason).
- Tokens in / out / cached, $ cost, model, temperature, top_p.
- Latency: TTFT (time to first token) and total.
- Trace ID grouping every call in a conversation / agent run / pipeline.
- User feedback (thumbs, regenerates, copies) joined back to the trace.
- Per-user / per-tenant / per-feature dimensions for cost slicing.
- Errors, retries, fallback hops.

## What to actually do with it

- **Cost dashboards.** By feature, by tenant, by model. Catch surprises early.
- **Quality regressions.** When LLM-as-judge scores drop, drill straight to the failing traces.
- **Replay.** Re-run a logged call with a new prompt — fastest debugging loop in AI.
- **Eval seeding.** Promote interesting prod traces to eval cases in one click.
- **User-feedback joins.** Filter for traces where the user clicked thumbs-down. That's your bug list.
- **Alerts.** P99 latency > 8s, daily spend > threshold, error rate spike.

## Pricing & cost notes

| Tool | Free tier | Paid starts at |
|------|----------|---------------|
| Langfuse Cloud | 50k events/mo | $29/mo Team |
| Langfuse Self-host | unlimited | your hosting cost |
| Helicone | 100k req/mo | $25/mo |
| LangSmith | 5k traces | $39/seat |
| Arize Phoenix OSS | unlimited | free |
| Braintrust | Hobby | usage |
| Datadog LLM Obs | existing APM | included in APM tier |

Observability is one of the cheapest investments in the AI stack — measured in tens or low hundreds per month for most teams — and it pays back the first time you debug a real production issue.

## Pitfalls

- **No observability at all.** "I'll add it when we ship" → six months in, you're debugging by re-running the user's question by hand.
- **Logging the prompt at app-level INFO.** PII and secrets land in your log aggregator. Use the dedicated tool with proper redaction.
- **Sampling on the floor.** "We sample 1% of requests" → the one bad trace the user is asking about is *exactly* the one you dropped.
- **Trace IDs that don't propagate across services.** An agent that spans three microservices needs one root trace ID. Pass it through.
- **No cost on the span.** Token counts without dollars are not actionable. Calculate cost at log time using current provider pricing.
- **No user-feedback signal.** Without thumbs / regenerates joined to traces, you're guessing at "is this a bug?"
- **Treating observability and evals as the same tool.** Some platforms bundle them; that's fine, but conceptually they answer different questions ("what happened in prod?" vs "did this change make things better?"). Don't confuse the two.

---

→ Next: [AI gateways](./ai-gateways.md)
