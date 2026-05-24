---
id: startup-ai-observability
title: Observability
sidebar_position: 12
sidebar_label: 11. Observability
description: Langfuse or Braintrust for traces + evals, Datadog or Better Stack for app metrics. Quality vs cost vs latency dashboards, per-feature and per-tenant.
---

# Observability

> **In one line:** Every LLM call is traced in Langfuse or Braintrust. Every app metric in Datadog or Better Stack. Three dashboards always open: quality, cost, latency. Per-feature and per-tenant.

:::tip[In plain English]
Regular observability answers "did the request succeed?" AI observability also answers "was the answer any good, how much did it cost, and which customer is using it?" You need all four signals because an AI bug can be a fluent, fast, successful HTTP 200 that's completely wrong.
:::

## The four signal surfaces

| Surface       | Tool                              | Owner            |
|---------------|-----------------------------------|------------------|
| LLM traces    | Langfuse OR Braintrust            | AI engineer      |
| App metrics   | Datadog OR Better Stack           | Platform / eng   |
| Errors        | Sentry                            | All engineers    |
| Product       | PostHog                           | PM + AI eng      |

Pick **one** trace tool and **one** app-metrics tool. Don't run both Langfuse and Braintrust — pick the one your team prefers and commit. Running both burns context-switching cost for marginal benefit.

## What gets traced

Every LLM call records:

- The exact prompt and full input.
- The model + version + provider.
- The full output (including tool calls, if any).
- Token counts (input, output, cached).
- Cost in dollars, computed at trace time.
- Latency (TTFT and total).
- The user, tenant, feature, and session it belonged to.
- The eval score (if scored).
- The feature flag state at the moment of the call.

```ts
import { observeOpenAI } from "langfuse";
const llm = observeOpenAI(client, {
  metadata: { feature: "extract-clause", tenant: ctx.tenantId, userId: ctx.userId },
});
```

That metadata is what makes filtering and dashboards possible. Skimp on it and you'll regret it.

## The three core dashboards

### 1. Quality

- LLM-as-judge score on a 1% sample of all production traces, per feature.
- Trend line, 7-day moving average.
- Bottom 20 traces this week, clickable to inspect.
- Alert: judge score drops > 5 points week-over-week.

### 2. Cost

- $/day total, per feature, per tenant.
- Top 10 tenants by spend.
- $/answer per feature; trend.
- Alert: any feature crosses 2x its budget; any tenant crosses 3σ above their normal.

### 3. Latency

- p50, p95, p99 TTFT per feature.
- p50, p95, p99 total response per feature.
- Provider attribution (Anthropic vs OpenAI shares).
- Alert: p95 TTFT > 800ms for 10 minutes; p95 total > 5s for 10 minutes.

All three open in tabs on every AI engineer's second monitor.

## Per-tenant dashboards

By the time you have 50+ paying customers, individual customer behavior matters:

- Cost per tenant per day.
- Top 10 spenders.
- Outliers (3σ above their normal).
- Quality score per tenant (some tenants hit edge cases more).
- Feature-flag state per tenant.

This data drives pricing decisions ("we need a usage cap on the $20 tier"), success conversations ("Acme is hitting our extraction feature 50x more than average — let's check in"), and outage triage ("the regression only affects tenants in cohort X").

## LLM-as-judge on prod traces

Sample ~1% of production traces and run a judge over them.

- The judge runs *async* (queue via Inngest), doesn't block the user response.
- Stronger model than the subject model.
- Pinned version.
- Score lands in Langfuse/Braintrust attached to the trace.
- Powers the Quality dashboard.

Cost: ~$0.001–0.01 per judged trace. At 100K traces/day with 1% sampling, that's $1–10/day. Trivial.

## On-call

- Single engineer at a time. Weekly rotation.
- Tools: PagerDuty, Better Stack On-call, or Incident.io.
- Runbooks in Notion or a dedicated `runbooks/` folder in the repo.
- Common AI runbooks:
  - "Cost spike on feature X" → check kill switch, identify tenant, page CSM.
  - "Quality score drop on feature X" → revert most recent prompt change, open investigation.
  - "Provider outage" → verify failover, communicate status, monitor recovery.
  - "Vector index slow" → check IVFFlat list count, rebuild if drift detected.

## Blameless post-mortems

After any customer-visible incident:

- What happened. When. How was it detected.
- Customer impact (which tenants, what they saw, for how long).
- Root cause — without naming individuals.
- What fixed it. What would have caught it earlier.
- New eval cases / alerts / runbooks to add.

Write within 48 hours. Share in #engineering. Add the action items to the next sprint.

:::note[Worked example: an incident pieced together from three tools]
**Symptom:** Top customer reports their summarization feature got worse this week.

1. **Langfuse:** filter to tenant + feature, last 7 days. The LLM-as-judge score dropped 12 points on Wednesday afternoon.
2. **Git history:** A prompt PR merged Wednesday at 2pm. Eval suite passed.
3. **Langfuse, comparing pre and post-merge traces:** the new prompt produces shorter, less specific output for inputs longer than ~3,000 tokens. The eval set didn't have inputs that long.
4. **PostHog:** confirms this customer's average input length is 4,500 tokens — way above the eval distribution.
5. **Fix:** revert the prompt, add 15 new eval cases with long inputs, redo the change.

Total time from "customer complains" to "root cause identified": about 40 minutes. The eval set learned something it didn't know before.
:::

:::info[Highlight: the quality / cost / latency triple]
Optimize one of these in isolation and you'll wreck the others. A cheaper model lowers cost but may drop quality. A bigger model boosts quality but spikes latency and cost. The discipline is to *report all three on every dashboard* so trade-offs are visible.

Engineers who internalize the triple naturally pick the right model per feature. Engineers who don't will spend a quarter optimizing one axis at the cost of another.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Logging traces without metadata.** Traces without `tenant`, `feature`, `userId`, `flag-state` are debug noise. You can't filter, group, or alert on them.
- **Running Langfuse and Braintrust both.** Pick one. The split context kills the value of either.
- **Alerting on every metric.** A Slack channel with 200 daily alerts gets muted within a week, and the one real alert is missed. Alerts must have an owner, a runbook, and an escalation path.
- **Quality dashboard with no LLM-as-judge on prod traces.** "We have evals" doesn't mean "we measure production quality." Sample real traces and judge them — that's how you see drift.
- **Treating Sentry like a TODO list.** Errors pile to 10,000+ unread. Spend 20 minutes weekly archiving and grouping, or signal collapses to noise.
:::

## What's next

→ Continue to [Security & Compliance](./12-security.md) where prompt injection defenses, PII scrubbing, SOC 2, DPAs, and provider opt-out get real.
