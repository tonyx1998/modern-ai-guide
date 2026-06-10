---
id: solo-observability
title: Observability
sidebar_position: 11
sidebar_label: 10. Observability
description: Langfuse free tier for traces, Sentry for errors, a cost dashboard that pages you. The minimum-useful observability stack for a solo AI tool.
---

# Observability

> **In one line:** Every LLM call gets traced to Langfuse; every server error gets logged to Sentry; daily cost gets checked at 8am. That's the whole stack.

:::tip[In plain English]
You don't need a Datadog dashboard. You need three things: a record of every LLM call (so you can debug "why did it say that?"), a notification when code throws (so you don't learn from users), and a number you check each morning (cost). Twenty minutes of setup, then mostly invisible.
:::

## The three-tool stack

| Tool             | What it tells you                        | Free tier                  |
|------------------|-------------------------------------------|----------------------------|
| Langfuse cloud   | Every prompt, response, cost, latency     | 50K observations/month     |
| Sentry           | Every server-side error with stack trace  | 5K errors/month            |
| Provider dashboard (Anthropic/OpenAI) | Total spend, per-model usage  | always free, you already pay them |

Optional fourth:

- **Vercel Analytics** (free) — page views, top routes, web vitals.
- **PostHog free tier** — product events, funnels, session replays. Add when you want to know *what users actually do*, not just whether things work.

## Langfuse setup (5 minutes)

```bash
pnpm add langfuse
```

```typescript
// lib/langfuse.ts
import { Langfuse } from "langfuse";

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_HOST,
});
```

Wrap your LLM calls:

```typescript
const trace = langfuse.trace({ userId, name: "generate" });
const generation = trace.generation({
  name: "summarize",
  model: "claude-sonnet-4-5",
  input: { system: SYSTEM, prompt: input },
});

const { text, usage } = await generateText({
  model: anthropic("claude-sonnet-4-5"),
  system: SYSTEM,
  prompt: input,
});

generation.end({
  output: text,
  usage: { input: usage.promptTokens, output: usage.completionTokens },
});
await langfuse.flushAsync();
```

The Langfuse cloud dashboard now shows every call with full input, output, token counts, cost, and latency — searchable, filterable by user, with one-click "view this trace."

For Python (Stack B), the `langfuse` SDK has the same shape with `@observe` decorators that wrap functions automatically.

## What to log, what not to log

**Always log:**

- Prompt input (system + user).
- Model output.
- Token usage in + out.
- User ID (or hashed identifier).
- Latency.
- Cost (calculated from token counts × price).

**Never log:**

- Raw API keys (Langfuse SDKs don't, but it's possible to fat-finger this).
- Full credit card numbers, government IDs, or anything you wouldn't want a contractor to see.
- PII that's not needed for debugging. Hash or redact emails if you can.

If your users' inputs are sensitive (legal, medical, finance), turn on Langfuse's sampling or redaction features rather than logging raw content.

## Sentry setup (5 minutes)

```bash
pnpm add @sentry/nextjs
pnpm dlx @sentry/wizard@latest -i nextjs
```

The wizard handles the boilerplate. After that, any uncaught exception in a route handler or React error boundary lands in Sentry with stack trace, breadcrumbs, and user context (if you wire it).

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.setUser({ id: userId });
// throw in your route, or...
Sentry.captureException(err);
```

For Python (Modal): `pip install sentry-sdk` and `sentry_sdk.init(dsn=...)` at module load. Modal logs all exceptions to its dashboard already, but Sentry adds the structured search and email alerts.

## The morning cost check

A 30-second daily ritual:

1. Open Anthropic / OpenAI console → check yesterday's spend.
2. Open Langfuse → check yesterday's cost-per-user distribution.
3. If either looks weird, dig in.

Automate it: create a daily 8am cron job (Vercel Cron or Modal Cron) that sends you an email with yesterday's:

- Total LLM cost (from Langfuse SDK aggregate).
- Total requests.
- Top 5 users by cost.
- Any error count from Sentry above a threshold.

Twenty lines of code, weeks of "wait, why is it so quiet?" anxiety removed.

```typescript
// app/api/cron/daily-report/route.ts
export async function GET() {
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  // pull from Langfuse API
  const stats = await fetchLangfuseStats(since);
  await sendEmail({
    to: "me@me.com",
    subject: `Daily AI report — $${stats.cost.toFixed(2)}`,
    body: `${stats.requests} requests, $${stats.cost} total. Top user: ${stats.topUser}.`
  });
  return new Response("ok");
}
```

## The "something feels off" investigation

When a user reports bad output:

1. **Get their user ID or email.**
2. **Open Langfuse** → filter traces by user → find the bad output.
3. **Click into the trace** → see exactly what prompt + input went in.
4. **Copy the input into `eval.csv`** as a new row with the expected behavior.
5. **Iterate the prompt** until the new eval row passes alongside the existing 20.
6. **Deploy.** Tell the user. Move on.

This loop is the entire value of having tracing. Without it, you're guessing.

## The PostHog moment

When you have ~50+ active users and need to know "what features get used":

- Drop in PostHog's snippet.
- Track 5–10 events: signup, first generation, upgrade clicked, payment completed, churn.
- Build one funnel: signup → first generation → upgrade.
- Look at session replays when conversion drops.

Before that volume, you're guessing from too small a sample. The product judgment doesn't improve.

:::note[Worked example: a Langfuse find that paid for itself]
A user emails "the summaries are weird this week." You filter their traces in Langfuse. You see that for their inputs (~30 of them in the last week), output length suddenly halved a few days ago.

Cross-reference: the day the regression started is the day you bumped `max_tokens` down from 2048 to 512 thinking it'd save money. The change was right but you didn't run evals on output length.

Without tracing, this is days of "is it the model? is it the prompt?" With tracing, it's a 10-minute fix. Add `max_tokens` to your eval coverage as well.
:::

:::info[Highlight: trace from day one, not when something breaks]
You cannot retroactively trace yesterday's request. The whole point of observability is having it *before* the user reports a bug. Twenty minutes of Langfuse + Sentry setup in week one repays itself the first time a user says "this used to be better."
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Logging without traces.** `console.log` everywhere and no structured tracing. You can't filter or search at the moment you need to. The fix is Langfuse from the first LLM call.
- **Tracing without user IDs.** When a user reports a bug, you can't find their traces. The fix is to always pass `userId` to every trace.
- **No alerting.** Sentry collects errors but you only check it weekly. The fix is to enable email alerts for any new issue type and any >10x error spike.
- **Logging PII without thinking.** Solo builders often log raw input, which means raw user data sits in three SaaS dashboards. The fix is to redact email addresses and any tokens-that-look-like-keys before they hit logs.
- **Spending two weekends on a custom analytics dashboard.** Two days of building something Langfuse already does. The fix is to use the free tier; spend the two weekends on the product.
:::

## Page checkpoint

Self-check:

- Does every LLM call land in Langfuse with input, output, tokens, user, cost?
- Are server-side exceptions hitting Sentry with user context?
- Do you get a daily email with yesterday's cost + top users?

<Quiz id="solo-observability-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What are the three tools in the minimum-useful observability stack for a solo AI tool?"
  options={[
    { text: "Datadog for metrics, Grafana for dashboards, PagerDuty for alerts" },
    { text: "Langfuse for LLM traces, Sentry for server errors, and the provider dashboard for spend" },
    { text: "PostHog for events, Vercel Analytics for vitals, and a custom dashboard for cost" },
    { text: "Console logs, a spreadsheet, and weekly manual testing" }
  ]}
  correct={1}
  explanation="The stack is deliberately small: Langfuse records every prompt, response, cost, and latency; Sentry catches exceptions with stack traces; the Anthropic or OpenAI console tracks total spend. PostHog and Vercel Analytics are listed only as optional additions — PostHog specifically waits until around 50+ active users, when behavioral data becomes statistically meaningful."
/>

<Question
  prompt="A user reports a bad output. After finding their trace in Langfuse, what does the page say to do with the offending input?"
  options={[
    { text: "Forward the trace to the model provider as a bug report" },
    { text: "Delete the trace so it does not skew your metrics" },
    { text: "Switch the user to a more expensive model" },
    { text: "Copy it into eval.csv as a new row with the expected behavior, then iterate the prompt until it passes alongside the existing rows" }
  ]}
  correct={3}
  explanation="The investigation loop converts every real-world failure into a permanent regression test: trace, reproduce, add an eval row, fix the prompt, deploy. Reporting to the provider is tempting because the model produced the bad output, but at solo scale the fix is almost always in your prompt — and only the eval row guarantees the bug stays fixed."
/>

<Question
  prompt="Why does the page insist on setting up tracing in week one rather than when something breaks?"
  options={[
    { text: "You cannot retroactively trace yesterday's request — observability only helps if it was running before the bug report arrives" },
    { text: "Langfuse charges more for accounts created after launch" },
    { text: "Tracing libraries require a clean codebase to install" },
    { text: "Sentry refuses to ingest errors from apps without traffic history" }
  ]}
  correct={0}
  explanation="The worked example shows the payoff: a 'summaries are weird this week' report became a 10-minute fix because weeks of traces existed to compare against. The pricing distractor is plausible because free tiers do have limits, but the real argument is temporal — data not captured at request time is gone forever."
/>

</Quiz>

## What's next

→ Continue to [Launching](./11-launching.md) where we'll go from "deployed URL" to "strangers using it" with the 2026 distribution playbook.
