---
id: observability-pick
title: Observability Pick — Logs, Traces, Cost
sidebar_position: 9
sidebar_label: Observability pick
description: Langfuse, Helicone, LangSmith, Phoenix, Braintrust — when to use which, and when a Postgres table is still the right answer.
---

# Observability Pick — Logs, Traces, Cost

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Start with the Postgres table from Stage 7. Move to a platform when you want trace UIs, per-feature cost breakdowns out of the box, or alerts you don't want to build.

:::tip[In plain English]
Observability just means keeping a record of every call your app makes to an AI model — what was sent, what came back, how long it took, and what it cost. Without that record, you can't answer basic questions like 'why did the bill double?' or 'why did this user get a weird answer?' This page picks the tool that keeps those records, and the starting answer is a plain database table you already know how to use. The paid dashboards are worth it later, when you have complicated multi-step flows to untangle or want ready-made charts and alerts instead of building your own.
:::

:::note[Observability feeds evaluation]
Traces aren't just for debugging — sampling production traffic and scoring it is how you catch quality drift. See [production evals](/docs/evaluation/eval-production) in [Chapter 5: Evaluation & Measurement](/docs/evaluation).
:::

## Tier 1 — the boring answer

The `llm_calls` Postgres table from [Stage 7](../01-part-1-from-zero/08-stage-7-observability.md).

When this is enough:

- You're a solo dev or small team.
- You're shipping \&lt;10K calls/day.
- Your queries are answered by 5 SQL statements (cost by feature, top users, p95 latency, sample-to-eval, replay).
- You don't need a trace-tree UI yet (you don't have agents or deep call chains).

It's enough longer than people expect. Don't move off it until you can name what you're missing.

## Tier 2 — when to move

### Langfuse (OSS + hosted)

The pragmatic open-source pick. Self-host on Docker or use Langfuse Cloud.

**Strengths:**
- OSS — full data ownership.
- Traces with span-tree UI for multi-step flows.
- Cost dashboards built-in.
- Evals + observability in one tool.
- Generous free tier (cloud) or fully self-hosted.

**Trade-offs:**
- Self-hosting is more work than just SaaS.
- UI is functional but not flashy.

**Pick if:** you want OSS data ownership, you have agents (where trace UIs matter), you want one tool for evals + obs.

### Helicone (OSS + hosted)

Drop-in proxy. Change your OpenAI base URL to Helicone's; everything else stays the same.

**Strengths:**
- Lowest friction integration in the space — minutes.
- Excellent cost dashboards.
- Built-in cache, rate limiting, prompt versioning.
- Hybrid: works as proxy or async SDK.

**Trade-offs:**
- Less rich trace UI than Langfuse.
- Proxy adds a hop (small but real latency cost).

**Pick if:** you want the fastest possible setup, you care most about cost analytics.

### LangSmith (hosted)

LangChain's observability platform.

**Strengths:**
- Best-in-class if you use LangChain / LangGraph — traces integrate naturally.
- Strong dataset / eval integration.
- Production traces tie to eval suites.

**Trade-offs:**
- Hosted only.
- Best for LangChain users; less ideal otherwise.

**Pick if:** you're deep in LangChain.

### Arize Phoenix (OSS + hosted)

Open-source, strong on trace visualization and embedding analytics.

**Strengths:**
- Open-source.
- Excellent for understanding embedding-space drift in RAG.
- Strong span/trace UI.

**Trade-offs:**
- Heavier setup than Helicone.
- Smaller community than Langfuse.

**Pick if:** you have a complex RAG and want to visualize what's happening in embedding space; or you want OpenTelemetry-native AI observability.

### Braintrust (hosted, also does obs)

Primarily an eval platform, but also handles production logs and traces.

**Strengths:**
- One tool for evals + obs.
- Premium UI.
- Strong on sample-to-eval workflows (production traces become test cases).

**Trade-offs:**
- Hosted, paid.

**Pick if:** you're already on Braintrust for evals; consolidating is worth it.

### Datadog LLM Observability (paid hosted)

If your company is already on Datadog.

**Strengths:**
- Integrates with everything else you monitor.
- Enterprise-grade SLAs.

**Trade-offs:**
- Expensive.
- Designed for big-co context.

**Pick if:** you're a Datadog shop with an enterprise contract.

## Tier 3 — skip or defer

- **Build your own dashboard from scratch in React.** Tempting; ~3 weeks of work that the above tools do for free.
- **OpenTelemetry without a backend.** OTel is the right standard, but you need a backend that understands GenAI semantic conventions. Phoenix is the open-source bet; most others lag.

## The matrix

| Need | Pick |
|------|------|
| Just shipping; small team | **Postgres table (DIY)** |
| Fastest setup; great cost dashboards | **Helicone** (proxy mode) |
| OSS, obs + evals in one | **Langfuse** |
| LangChain shop | **LangSmith** |
| Embedding-space analytics for RAG | **Phoenix** |
| Already on Braintrust | **Braintrust** |
| Already on Datadog | **Datadog LLM Obs** |

## What to optimize for

When evaluating, weigh:

1. **Time-to-first-trace.** Helicone's proxy gets you traces in 5 minutes. Langfuse SDK setup takes ~30 minutes. Custom Postgres takes a day.
2. **Cost-attribution granularity.** Can you break down spend by user × feature × model? Helicone and Langfuse: yes. Phoenix: less so.
3. **Trace UI quality.** Does the UI clearly show a multi-step agent's call tree? Langfuse and LangSmith: best. Phoenix: also strong.
4. **Eval integration.** Can you turn production traces into eval cases? Langfuse and Braintrust: yes natively.
5. **Self-host option.** Langfuse, Helicone, Phoenix: yes. Braintrust, LangSmith, Datadog: no.

## The migration story

You'll likely run two systems in parallel briefly:

1. **Existing:** Postgres table from Stage 7.
2. **New:** Hosted platform.

Send to both for 1–2 weeks. Compare costs, query patterns, dashboards. Cutover when you're confident.

Migrating the eval set + run history *out* of a platform is often harder than getting data in. Bias toward tools with good export.

## Common mistakes

:::caution[Where people commonly trip up]
- **Adopting too early.** A side project doesn't need Helicone. A 500-call-a-day app doesn't need Datadog. Match tool weight to actual scale.
- **Skipping cost attribution.** Without breaking spend down by feature + user, you can't tell which feature is profitable and which is a money pit. Whatever tool you pick, set up the dimensions on day one.
- **Logging incomplete prompts.** Don't strip the system prompt, tool definitions, or retrieved chunks to "save storage." The whole point of logs is replayability; missing context means no replay.
- **No alerts.** Logs without alerts mean problems are discovered weeks later. Wire up: cost spike, error rate spike, latency p95 spike, refusal rate spike.
- **Vendor lock-in via SDK.** Wrap your logging in a `log_llm_call` interface; only that function knows the vendor. Swappable later.
:::

<Quiz id="observability-pick-quick-check" variant="micro" title="Quick check">

<Question
  prompt="When is the DIY Postgres logging table enough, according to this page?"
  options={[
    { text: "Small team, modest call volume, questions answerable with a few SQL queries, and no deep agent call chains to visualize" },
    { text: "Only during the first week of development" },
    { text: "Never — production apps always need a hosted observability platform" },
    { text: "Only if the team has a dedicated database administrator" }
  ]}
  correct={0}
  explanation="The boring answer holds longer than people expect. The signal to move is being able to name what you are missing — a trace-tree UI for agents, out-of-the-box cost breakdowns, or alerts you do not want to build yourself. Until then, the table is enough."
/>

<Question
  prompt="What does this page warn about stripping system prompts or retrieved chunks from logs to save storage?"
  options={[
    { text: "It is recommended, since storage costs dominate observability budgets" },
    { text: "It only matters for compliance-heavy industries" },
    { text: "It defeats the purpose of logging — without full context you cannot replay a call to debug it" },
    { text: "It is fine as long as you keep the model name and token counts" }
  ]}
  correct={2}
  explanation="Replayability is the whole point of LLM logs. A logged call missing its system prompt, tool definitions, or retrieved chunks cannot be re-run to reproduce a problem, so the log tells you something went wrong but not why."
/>

<Question
  prompt="What is the recommended way to migrate from the DIY table to a hosted platform?"
  options={[
    { text: "Cut over in one step to avoid duplicate data" },
    { text: "Send data to both systems in parallel for a week or two, compare, then cut over — and prefer tools with good data export" },
    { text: "Keep the table as primary forever and use the platform only for demos" },
    { text: "Migrate historical data first, then switch live traffic" }
  ]}
  correct={1}
  explanation="Running both briefly lets you verify costs, query patterns, and dashboards before committing. And since getting data OUT of a platform is often harder than getting it in, export quality should weigh on the choice — it is your escape hatch from lock-in."
/>

</Quiz>

→ Next: [Gateway pick](./09-gateway-pick.md) — Cloudflare AI Gateway, LiteLLM, OpenRouter, and friends.
