---
id: startup-ai-cost-breakdown
title: A Realistic Cost Breakdown
sidebar_position: 15
sidebar_label: 14. Cost Breakdown
description: Monthly line items for a 20-person AI startup. Provider $, eval/obs $, vector $, hosting $, dev tools $. Realistic range $50K-$200K/month.
---

# A Realistic Cost Breakdown

> **In one line:** A 20-person AI-first startup typically spends **$50K–$200K/month** on infrastructure and tools, with provider API calls as the single largest variable line.

:::tip[In plain English]
At pure SaaS scale, infrastructure is noise next to payroll. At AI-first scale, infrastructure (especially LLM API spend) is a *large* line item — sometimes the largest after salaries. A 20-person AI startup spending $150K/month on provider APIs is normal, not alarming. The conversation shifts from "is the bill too high" to "is per-tenant $/answer healthy."
:::

## A 20-person AI startup at ~$3M ARR

| Category              | Item                              | Monthly cost      | Notes                                  |
|-----------------------|-----------------------------------|-------------------|----------------------------------------|
| **LLM providers**     | Anthropic primary                 | $25K–$120K        | Single largest variable line            |
|                       | OpenAI fallback + embeddings      | $5K–$30K          | Embeddings + fallback traffic          |
|                       | Bedrock for compliance customers  | $0–$15K           | Optional, regulated customers          |
| **Gateway**           | Portkey                           | $300–$2K          | Pays for itself first outage           |
| **Eval + observability** | Braintrust OR Langfuse        | $500–$3K          | Pick one                               |
|                       | Sentry                            | $100–$500         |                                         |
|                       | Datadog OR Better Stack           | $500–$3K          | Logs + metrics + uptime                 |
| **Vector / DB**       | Supabase Pro (incl. pgvector)     | $500–$3K          | Until you outgrow                       |
|                       | Pinecone / Turbopuffer (if used)  | $0–$8K            | At-scale only                           |
| **Hosting**           | Vercel Team / Pro                 | $500–$3K          | Scales with bandwidth + function time  |
|                       | Modal / Render for Python workers | $500–$5K          | If you have Python workers              |
| **Background**        | Inngest / Trigger.dev             | $200–$2K          |                                         |
| **Product / flags**   | PostHog or Statsig                | $0–$2K            | Generous free tiers                     |
| **Auth**              | Clerk                             | $200–$2K          | Per-MAU pricing                         |
| **Email**             | Resend                            | $100–$500         |                                         |
| **Dev tools**         | GitHub Team                       | $80 (20 users)    |                                         |
|                       | Linear                            | $160 (20 users)   |                                         |
|                       | Doppler / 1Password               | $200–$400         | Secrets                                  |
|                       | Cursor or Claude Code teams       | $400–$1K          | AI dev tools (yes, your devs pay this)  |
| **Compliance**        | Vanta / Drata / Secureframe       | $400–$1.5K        | Once SOC 2 starts                       |
|                       | Auditor fees                      | ~$2K/mo amortized | $25K Type II audit / year               |
| **Misc**              | Domain, monitoring extras         | $50–$300          |                                         |
| **Total**             |                                   | **$50K–$200K**    | Provider $ swings the range             |

For comparison: 20 engineers fully loaded is roughly $300K–$500K/month. Infrastructure is 10–40% of payroll at AI-first scale — much higher than the 1–5% typical at pure SaaS scale.

## Where the variance comes from

The $50K–$200K range is wide because the LLM provider line *dominates* and scales with usage:

- **Quiet feature, mid-tier model, light context:** ~$0.001/answer.
- **Heavy retrieval, flagship model, large context:** ~$0.10/answer.
- **Agent loop with tool calls and re-prompting:** ~$1+/answer.

A startup running 500K answers/day at $0.05/answer is at $25K/day on providers alone — and that's a single, busy feature. The discipline is *knowing your $/answer per feature* and treating it like a product KPI.

## Healthy cost ratios

At ~$3M ARR with $100K/month infra spend:

- Infrastructure = ~40% of MRR. Tight, but normal for AI-first startups in early scale.
- Provider spend should be ~50–70% of total infra spend (rest = obs, hosting, dev tools).
- Per-feature cost should be tracked weekly; no feature should silently 2x without explanation.

A startup at 60%+ infra-to-MRR is in trouble; one at \&lt;20% is either pricing wrong or under-shipping AI value.

## The big levers (in order of impact)

1. **Model selection per feature.** Routing routine work to mid-tier models often saves 60%+ on that feature.
2. **Prompt caching.** Anthropic's prompt caching can cut 50–80% off repeated-context features. Free win if structured right.
3. **`max_tokens` ceilings.** A surprising number of features have no ceiling and bleed money on overlong outputs.
4. **Semantic caching at the gateway.** Identical or near-identical queries served from cache. ~20–40% savings on chat features.
5. **Per-tenant caps.** Free tier and lowest paid tier need usage caps. A handful of abusive users can 10x your bill.
6. **Batch APIs.** For non-realtime workloads (overnight summarization, etc.), Anthropic/OpenAI batch APIs are ~50% cheaper.

## When to invest engineering time in cost reduction

A reasonable rule:

- If a cost-reduction project saves > $5K/month and takes < 2 engineer-weeks, do it now.
- If it saves $1–5K/month, queue it for the next sprint.
- If it saves < $1K/month, ignore — the engineer time costs more than the savings.

Track "hours spent saving dollars" and you'll catch yourself optimizing the cheap bills.

:::note[Worked example: a 40% bill reduction in one quarter]
A 22-person AI startup's provider bill grows from $48K to $72K over four months. Cofounders nervous. The AI engineer does a one-week audit:

1. **Summarization feature:** on flagship model. Eval shows mid-tier is within 1 point of flagship. Switch → saves $9K/month.
2. **Customer-support assistant:** repeated long system prompt + retrieval context. Enable Anthropic prompt caching → saves $7K/month.
3. **Two abusive free-tier tenants:** running scripts against the API. Per-tenant cap on free tier → saves $3K/month.
4. **Background tagging:** moved to batch API → saves $4K/month.

Total: $23K/month savings, ~$280K/year. One engineer-week of work.

The lesson: cost optimization, like eval discipline, is a quarterly muscle. Once a year is too rarely; every sprint is too often.
:::

:::info[Highlight: provider $ is the new database $]
The instinct from pure SaaS — "the database is the big bill" — is wrong in AI startups. Postgres is $1K; the provider bill is $80K. Engineering attention should follow the bill. Most AI engineers ignore provider spend until it's a fire. Build the dashboards on day one and check them weekly.
:::

## A real-world line-item walkthrough

A 22-person AI startup at $3.2M ARR, October 2026, monthly bill (representative numbers):

| Line                                  | Spend      |
|---------------------------------------|------------|
| Anthropic (primary, claude-sonnet-4.5) | $78,000   |
| OpenAI (fallback + text-embedding-3)  | $14,200    |
| Bedrock (one HIPAA customer)          | $6,800     |
| Portkey gateway                       | $890        |
| Braintrust (evals + traces)           | $1,400     |
| Sentry                                | $310        |
| Datadog                               | $1,600     |
| Supabase Pro + pgvector               | $1,100     |
| Vercel Team                           | $1,250     |
| Modal (Python workers, batch embed)   | $2,100     |
| Inngest                               | $480       |
| PostHog (flags + analytics)           | $0 (free tier still) |
| Clerk auth                            | $620       |
| Resend                                | $180       |
| GitHub + Linear + Doppler + Cursor    | $1,250     |
| Vanta + amortized auditor             | $2,100     |
| Misc                                  | $200       |
| **Total**                             | **$112,480** |

That's ~42% of MRR. Provider $ (Anthropic + OpenAI + Bedrock) = $99K = 88% of the infra bill. Everything else is small.

## When the provider bill becomes a hiring decision

There's an inflection where the provider bill is large enough that *one engineer dedicated to cost* pays for itself. Rough rule:

- Bill > $50K/month → quarterly cost reviews are enough.
- Bill > $100K/month → monthly cost reviews + named owner part-time.
- Bill > $250K/month → one dedicated engineer on cost optimization full-time pays for themselves within 2 quarters.
- Bill > $500K/month → small platform team focused on cost + reliability.

The engineer's job: model selection per feature, prompt caching coverage, batch API migration, per-tenant caps, contract renegotiation with providers.

## Common mistakes

:::caution[Where people commonly trip up]
- **No per-feature cost dashboard.** "The bill went up" is unhelpful. "Feature X went up 80% week-over-week" is actionable.
- **No per-tenant cost view.** A single abusive user can 5x your bill in a day. You need to see them.
- **Treating LLM cost as fixed.** It's the most variable cost in the stack and the most optimizable.
- **Not setting alerts.** First time you'll hear about runaway usage is the monthly invoice — two weeks late. Set alerts at 2x, 5x, 10x normal.
- **Spending an engineer-week to save $200/month.** A senior engineer's time is ~$1,500/day. Cost-optimization projects must clear a "saves > $5K/month" bar.
:::

<Quiz id="startup-ai-cost-breakdown-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the single largest variable line item in an AI-first startup's infrastructure bill?"
  options={[
    { text: "Database and vector storage" },
    { text: "Hosting and CDN bandwidth" },
    { text: "Observability and eval platforms" },
    { text: "LLM provider API spend — often the majority of the entire infra bill" }
  ]}
  correct={3}
  explanation="In the real-world walkthrough, provider spend (Anthropic + OpenAI + Bedrock) is $99K of a $112K bill — 88% of infra. The database option reflects the pure-SaaS instinct the page explicitly corrects: 'Postgres is $1K; the provider bill is $80K' — engineering attention should follow the bill."
/>

<Question
  prompt="What is the highest-impact cost lever, according to the page's ordered list?"
  options={[
    { text: "Model selection per feature — routing routine work to mid-tier models often saves 60%+ on that feature" },
    { text: "Negotiating a volume discount with the provider" },
    { text: "Switching hosting providers" },
    { text: "Reducing the number of eval runs in CI" }
  ]}
  correct={0}
  explanation="Model selection tops the list, followed by prompt caching (50-80% on repeated context), max_tokens ceilings, semantic caching, per-tenant caps, and batch APIs. Cutting eval runs is the falsely-economical option — eval costs run only $100-500/month while the discipline they enable is what makes safe model downgrades possible in the first place."
/>

<Question
  prompt="When should you invest engineering time in a cost-reduction project?"
  options={[
    { text: "Whenever any savings are identified, regardless of size" },
    { text: "Only when the provider bill exceeds $500K/month" },
    { text: "When it saves more than $5K/month and takes under 2 engineer-weeks — and ignore anything saving under $1K/month" },
    { text: "Only during the annual budget review" }
  ]}
  correct={2}
  explanation="The rule prevents both neglect and over-optimization: a senior engineer's time runs about $1,500/day, so an engineer-week chasing $200/month is a net loss. 'Any savings, always' feels frugal but is the trap the page names — track hours-spent-saving-dollars and you catch yourself optimizing the cheap bills."
/>

</Quiz>

## What's next

→ Continue to [Day in the Life](./15-day-in-life.md) for a worked day in the life of an AI engineer at a 20-person startup.
