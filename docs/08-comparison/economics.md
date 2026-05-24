---
id: comparison-economics
title: Economics comparison
sidebar_position: 6
sidebar_label: 5. Economics
description: Order-of-magnitude cost shapes for AI workloads at each scale.
---

# Economics comparison

> **In one line:** Solo spends $0–$200/month and watches the provider dashboard. Startup spends $5K–$80K/month and reconciles by tenant. Enterprise spends $500K–$20M+/month with FinOps, negotiated discounts, and chargeback by team.

:::tip[In plain English]
At every scale, **the AI bill is small compared to payroll** — but it's the *most volatile* line item in your cloud spend. A single runaway agent loop can 10x the daily bill in hours; a model price change can move the monthly bill 30% with one announcement.

That's why cost discipline at each scale looks different but exists at *every* scale. Solo: a hard cap. Startup: per-tenant dashboards + alerts. Enterprise: forecasts, commits, chargeback, and a FinOps function.

The numbers below are illustrative — yours will vary — but the *shape* is what matters.
:::

## Cost shape by category

| Category | Solo | Startup (20-person co., ~5K paying users) | Enterprise (5,000 engineers, 100+ AI features) |
|----|----|----|----|
| **Model inference (LLM)** | $0–$150/mo | $3K–$50K/mo | $300K–$15M/mo |
| **Embeddings** | $0–$10/mo | $50–$500/mo | $20K–$500K/mo |
| **Vector DB** | $0 (pgvector) | $500–$3K/mo | $50K–$500K/mo |
| **Eval platform** | $0 (Promptfoo) | $200–$2K/mo | $50K–$500K/mo |
| **LLM observability** | $0 (Langfuse free) | $500–$5K/mo | $50K–$500K/mo |
| **Gateway** | $0 | $0–$2K/mo | $50K–$500K/mo (often internal) |
| **Orchestration** | $0 | $0–$1K/mo | $20K–$200K/mo |
| **Hosting / compute** | $0–$50/mo | $500–$10K/mo | $200K–$5M/mo |
| **Self-hosted GPU capex** | $0 | $0 | Variable, can be millions/year |
| **Total monthly infra+AI** | **$0–$200** | **$5K–$80K** | **$500K–$20M+** |

For the deep dive on enterprise cost shape, see [Chapter 7: A Realistic Cost Picture](/docs/enterprise-ai).

## People costs (dominant at every scale)

| Cost | Solo | Startup | Enterprise |
|----|----|----|----|
| **AI engineers** | N/A | 1–10 × $200K–$300K loaded | 50–500+ × $250K–$400K loaded |
| **Platform / MLOps** | N/A | 0–1 part-time | 10–30 dedicated, $30M+/year loaded |
| **AI safety / governance** | N/A | N/A | 5–20 people, $5M+/year loaded |
| **Total annual AI payroll** | $0 | $200K–$3M | $50M–$500M+ |

The pattern: **infrastructure is a small percentage of total AI spend at every scale, dominated by people costs.** Optimizing the inference bill before optimizing engineer time-to-ship is almost always the wrong order.

## Time-to-production by change type

How long an AI change takes to reach users (from [Workflow](./workflow.md), repeated as an economics signal):

| Change | Solo | Startup | Enterprise |
|----|----|----|----|
| **Typo in a prompt** | 90 seconds | 30 minutes | 1 day – 6 weeks (risk tier dependent) |
| **New tool for an agent** | 30 min | 1–3 days | 4–8 weeks |
| **New AI feature** | A weekend | 2 weeks | 1–3 months |
| **Replace primary model** | An evening | 1–2 weeks | 1–2 quarters |
| **Onboard a new provider** | Same day | A week | 3–9 months |

**Time-to-production is itself an economic variable.** Every week between "the engineer had the idea" and "users see it" is opportunity cost. Enterprise process is risk insurance you pay for in opportunity cost — appropriate when the alternative (an uncaught bad output) is worse, wasteful when it isn't.

```mermaid
flowchart LR
    A[Solo: $50/mo, ship in hours] --> B[Startup: $20K/mo, ship in weeks]
    B --> C[Enterprise: $5M/mo, ship in months]
```

:::info[Highlight: the cheapest token is almost never the cheapest total]
At every scale, optimizing the per-call inference bill before optimizing engineer time is the wrong order.

- **Solo:** Don't burn a Saturday self-hosting Llama to save $30/month on Claude Haiku calls.
- **Startup:** Don't write a custom caching layer to save $2K/month if it takes a sprint and now you own a caching layer forever.
- **Enterprise:** Don't migrate from a stable provider to a 10% cheaper one if it costs a 30-engineer quarter; the people cost dwarfs the savings.

The cheapest *total* cost is almost always the option that consumes the least engineering attention — even if its per-token price is higher.
:::

:::note[Worked example: where the money actually goes at startup scale]
A made-up Series A startup with one AI feature in production:

- 5,000 daily active users, each making ~10 LLM calls/day.
- Average call: 800 input tokens, 300 output tokens.
- Workhorse: Claude Sonnet 4.5 ($3/M input, $15/M output as of writing).

Daily volume: 50K calls × (800 + 300) tokens ≈ 55M input + 15M output tokens. **Daily cost: ~$390. Monthly: ~$11.7K.**

Now layer on the rest of the AI stack:
- Pinecone (starter): $700/mo
- Langfuse Pro: $500/mo
- Braintrust: $1K/mo
- Portkey: $500/mo
- Modal for ingestion: $1K/mo
- Misc (Sentry, PostHog, etc.): $500/mo

**Stack subtotal: ~$4.2K/mo. Total AI monthly: ~$16K. Annual: ~$190K.**

Meanwhile, the AI team is 3 engineers at ~$250K loaded each: **$750K/year in payroll.**

The infra bill is **20% of the AI team's payroll**. Optimizing it from $190K to $150K (a heroic 20% cut) saves $40K — about 5 weeks of one engineer's loaded cost. Better spent on shipping the next feature.
:::

## What this implies at each scale

- **Solo:** Every dollar matters because there's no revenue yet. Use tiered models (Haiku for cheap, Sonnet for hard), aggressive caching, and a *hard cap* on the provider dashboard so a runaway loop can't drain your bank account overnight.
- **Startup:** The AI bill becomes a real line item around Series A. Build **per-tenant cost dashboards early** — the moment you have multiple paying customers, you need to know which one is costing you 10x the others. Negotiate first volume discounts with providers around $50K/month spend.
- **Enterprise:** Scale unlocks **negotiated commits** (20–40% discounts on a 1–3 year commit), **self-hosting math** at the very top of the volume curve, and **central FinOps** that allocates spend back to product teams. Bloat happens easily; without chargeback, every team treats the LLM bill as someone else's problem.

## Common mistakes

- **Solo trying to model unit economics.** With 12 users you don't have unit economics. Set a hard cap, ship the product, model the economics once you have ≥ 100 paying users.
- **Startup running on a single provider for cost-savings reasons.** A 10% saving on inference is not worth being held hostage if that provider has a 3-hour outage or a price hike. Multi-provider via a gateway is cheap insurance.
- **Enterprise self-hosting too early.** A self-hosted Llama-class deployment looks cheap on a spreadsheet and burns a 10-engineer team forever on serving infrastructure. Pencil in the loaded-team cost and a 30% efficiency penalty vs. frontier providers before signing off.
- **Optimizing the bill before measuring what you're paying for.** Without per-feature, per-tenant cost attribution, a "we need to cut AI spend" project becomes a fishing trip. Wire up attribution first; optimize second.
- **Believing infra-as-percent-of-revenue is the right metric.** It anchors leadership on the wrong lever. The right metric is *AI-cost-per-successful-user-outcome* — if it's flat or falling, you're winning; if it's rising, you have a cost problem regardless of total bill size.

---

→ Next: [Tradeoffs](./06-tradeoffs.md).
