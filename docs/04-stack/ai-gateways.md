---
id: ai-gateways
title: AI gateways
sidebar_position: 15
description: Portkey, OpenRouter, LiteLLM Proxy, Cloudflare AI Gateway, Kong AI Gateway, Helicone — one endpoint, many providers.
---

# AI gateways

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** A reverse proxy in front of LLM providers. You call the gateway; the gateway calls the provider. In return you get routing, fallback, caching, rate limiting, cost tracking, PII redaction, and one bill.

:::tip[In plain English]
A gateway sits between your application and every LLM provider. To your app, it looks like one URL with one API key. Behind it, the gateway can route to Anthropic, OpenAI, Google, your self-hosted vLLM, or all of them in some priority order. You stop hard-coding provider names; you start declaring policies ("send classification to Haiku; fail over to Mini if Haiku is down; cache identical prompts for 60s"). Most teams add one within 6–12 months of going to production.
:::

## The major options (2026)

| Gateway | Hosting | OSS? | Routing | Caching | PII | Best for |
|---------|---------|------|---------|---------|-----|---------|
| **Portkey** | Hosted + self-host | partial | rules + fallback | yes | yes | Full-featured production default |
| **OpenRouter** | Hosted only | no | model-marketplace | partial | basic | One key, hundreds of models, unified billing |
| **LiteLLM Proxy** | Self-host | yes | rules + fallback | yes | partial | OSS default, OpenAI-compatible facade |
| **Cloudflare AI Gateway** | Hosted | no | basic | yes | basic | Cheap, fast, already on Cloudflare |
| **Helicone** | Hosted + OSS | partial | rules | yes | yes | Started as obs; now also gateway |
| **Kong AI Gateway** | Self / hosted | yes (CE) | rules + plugins | yes | yes | Enterprise; existing Kong shops |
| **Apigee AI** | Google Cloud | no | enterprise rules | yes | yes | Enterprise on GCP |
| **AWS Bedrock** | AWS only | no | one-API for many models | partial | via Guardrails | All-AWS shops |
| **Vercel AI Gateway** | Hosted | no | basic | yes | basic | Vercel-deployed apps |

## Default pick for most teams

**Portkey** if you want managed, **LiteLLM Proxy** if you want self-hosted and free. Both speak the OpenAI-compatible API shape, support fallback and routing rules, and give you cost dashboards out of the box.

If you just want "one API key for every model" without much else: **OpenRouter** — fewer features but the lowest friction onboarding in the category.

## When to deviate

- **You're a developer trying every model under the sun:** **OpenRouter** — the model marketplace and unified billing are the killer feature.
- **You're entirely on AWS / Azure / GCP and want no extra vendor:** **Bedrock**, **Azure OpenAI**, or **Vertex AI** with **Apigee**.
- **You're already running Kong for your other APIs:** **Kong AI Gateway** — same control plane.
- **Cheap and basic is fine** (mostly observability + cache): **Cloudflare AI Gateway** at near-zero cost.
- **You want gateway + observability + prompt mgmt + evals in one tool:** **Portkey** or **Helicone**.

## What a gateway gives you

- **Provider failover.** Anthropic 503 → automatic retry on OpenAI. One incident response, one less middle-of-night page.
- **Routing rules.** Cheap model for short prompts; flagship for long; specific model for code; pick by tenant tier.
- **Caching.** Identical prompt → cached response, often at 1% of the original cost. Especially for system prompts and FAQ-style queries.
- **Rate limits per user / tenant / API key.** Stops one runaway customer from burning your whole budget.
- **Single billing surface** across providers. Procurement loves this.
- **PII / secrets scrubbing** at the proxy layer, before requests leave your perimeter.
- **Centralized observability** for every team's LLM calls — even teams that didn't wire up Langfuse.
- **Semantic caching.** Beyond exact-match: cache "What's our refund policy?" against a previously-cached "What is your refund policy?".

## Minimum integration

**LiteLLM Proxy — self-hosted gateway in 20 lines of config:**

```yaml
# config.yaml
model_list:
  - model_name: workhorse
    litellm_params:
      model: anthropic/claude-sonnet-4-6
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: workhorse
    litellm_params:
      model: openai/gpt-5.1
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  routing_strategy: simple-shuffle
  fallbacks: [{"workhorse": ["openai/gpt-5.1"]}]
```

```bash
litellm --config config.yaml --port 4000
```

```python
# Your app — point at the gateway, use any provider name
from openai import OpenAI
client = OpenAI(api_key="sk-anything", base_url="http://localhost:4000")
client.chat.completions.create(model="workhorse", messages=[...])
```

**Portkey — hosted, headers route the request:**

```python
from openai import OpenAI
client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url="https://api.portkey.ai/v1",
    default_headers={
        "x-portkey-api-key": os.environ["PORTKEY_API_KEY"],
        "x-portkey-config": "cfg-routing-and-cache",
    },
)
```

## When to add a gateway

- You use **2+ providers** in production.
- You need **centralized cost control** across teams.
- You want a **single audit log** of every LLM call your org makes.
- You have **regulated workloads** that need centralized PII redaction.
- You're managing **per-tenant rate limits** and don't want to reinvent.

You don't need a gateway on day one. Most teams add one in months 3–12 once they have a real reason.

## Pricing & cost notes

| Gateway | Cost model |
|---------|-----------|
| Portkey | Free tier; ~$49+/mo paid; usage on top |
| OpenRouter | Provider price + ~5.5% markup; pay-as-you-go |
| LiteLLM Proxy | Free OSS; your hosting cost |
| Cloudflare AI Gateway | Free at low volume; cheap thereafter |
| Helicone | Free 100k req; $25+/mo |
| Kong AI Gateway CE | Free OSS; Enterprise tiers $$$$ |
| Bedrock / Vertex AI | Provider price; no markup, in-cloud egress free |

Gateway cost is small relative to provider spend. The real value is the **cache hit rate** (often 20–40%) and the **incident-avoidance** when one provider hiccups.

## Pitfalls

- **Adding a gateway before you have one provider working.** Premature abstraction; you'll over-design for problems you don't have.
- **Caching responses that include user-specific content.** Cache `"What is the policy on returns?"` not `"Email Jane about her return."`. Per-user cache keys or no cache.
- **Trusting fallback to be free.** If both providers are slow today, you've now waited for both. Set tight timeouts on the primary.
- **Gateway in the same region as none of your providers.** Latency adds up. Pick a region close to whichever provider you call most.
- **No circuit breaker.** Repeated 503s from Anthropic shouldn't keep retrying for 30 seconds; trip the breaker, route around.
- **Provider creds in app code AND gateway.** Pick one place to hold credentials. Usually the gateway.
- **Gateway as a single point of failure.** Run two instances; health-check; have a way to bypass to direct provider calls during a gateway outage.

<Quiz id="ai-gateways-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Why is caching responses that contain user-specific content dangerous at the gateway?"
  options={[
    { text: "One user's cached answer can be served to a different user — cache only generic prompts or use per-user cache keys" },
    { text: "User-specific responses are too large to cache" },
    { text: "Caching personal content doubles the token bill" },
    { text: "Semantic caches cannot store proper nouns" }
  ]}
  correct={0}
  explanation="A cache keyed only on prompt text will happily replay 'Email Jane about her return' content to someone else — a privacy incident, not a performance bug. The fix is policy, not size limits: generic FAQ-style prompts cache safely, personalized ones need per-user keys or no caching at all."
/>

<Question
  prompt="How do you keep the gateway itself from becoming a single point of failure?"
  options={[
    { text: "Enable semantic caching so most requests never reach it" },
    { text: "Run redundant instances, health-check them, and keep a bypass path to call providers directly during a gateway outage" },
    { text: "Only deploy the gateway in the provider's own region" },
    { text: "Use a hosted gateway, which cannot go down" }
  ]}
  correct={1}
  explanation="Putting every LLM call through one chokepoint means its outage is YOUR outage; redundancy plus a documented direct-to-provider escape hatch restores the resilience the gateway was supposed to add. Hosted services absolutely can go down — the bypass path matters regardless of who operates the proxy."
/>

<Question
  prompt="According to the page, when should a team add a gateway?"
  options={[
    { text: "On day one, before the first provider integration" },
    { text: "Only after passing a compliance audit" },
    { text: "Once there is a real trigger — like running two or more providers in production or needing centralized cost control" },
    { text: "Never; SDK-level routing always suffices" }
  ]}
  correct={2}
  explanation="Most teams add a gateway within months 3 to 12, when failover, org-wide cost tracking, or per-tenant rate limits become real needs. Day-one adoption is the named pitfall — premature abstraction for problems you don't have yet. SDK routing works early but doesn't centralize policy across teams."
/>

</Quiz>

---

→ Next: [Orchestration](./orchestration.md)
