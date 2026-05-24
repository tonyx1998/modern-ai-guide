---
id: pattern-cost-control
title: Cost control patterns
sidebar_position: 9
description: Tiered models, prompt trimming, rate limits, kill switches. The patterns that keep the bill bounded.
---

# Cost control patterns

> **In one line:** Cost control is design, not optimization — pick the smallest model that passes evals, cap every loop, summarize old history, and put a kill switch on every feature, *before* the first user sees it.

:::tip[In plain English]
LLM bills don't scale linearly with usage — they scale super-linearly when something goes wrong: a runaway agent loop, a viral abuse case, a customer with a buggy script in a `while True`. The patterns on this page exist so the bad day costs you $200 instead of $20,000. Treat them as table-stakes, not optimizations.
:::

## Tiered model routing

- **Default to the cheapest model that passes evals.** Escalate to a bigger model only when needed.
- **Confidence-based escalation:** small model answers; if `confidence < threshold` or the schema rejects, escalate to a bigger model.
- **Feature-based routing:** the gateway picks the model based on the feature, not the team that called.

```typescript
// Cascade pattern
export async function classifyWithCascade(input: string) {
  const fast = await classify({ model: 'claude-haiku-4-5', input });
  if (fast.confidence >= 0.85) return fast;

  // ~5% of traffic falls through to the expensive model
  return classify({ model: 'claude-sonnet-4-5', input });
}
```

The math: if 95% of requests resolve on Haiku (~$0.25/Mtok) and 5% on Sonnet (~$3/Mtok), the blended cost is roughly *0.95 × 0.25 + 0.05 × 3 = $0.39/Mtok* — about 8× cheaper than "always Sonnet."

## Prompt trimming

- **Audit your system prompt quarterly.** Long prompts accumulate cruft (instructions from features that no longer exist, examples that no longer apply).
- **Truncate chat history** to the most recent N turns or to a summarized form once it crosses a length threshold.
- **Truncate retrieval results** — top 5 chunks usually beats top 20 on both quality (lost-in-the-middle) and cost.

Rolling summarization is the standard pattern:

```typescript
async function trimHistory(messages: Message[], maxTokens = 6000) {
  const total = countTokens(messages);
  if (total <= maxTokens) return messages;

  const oldest = messages.slice(0, messages.length - 8);
  const recent = messages.slice(-8);
  const summary = await summarize(oldest, { model: 'claude-haiku-4-5' });
  return [{ role: 'system', content: `Conversation so far: ${summary}` }, ...recent];
}
```

## Rate limits

- **Per-user rate limit.** Stops abuse and runaway tabs. Anchor on the *authenticated user id* — never on a client-controlled header.
- **Per-tenant daily cost cap.** Stops one customer from accidentally spending your margin.
- **Per-feature cost cap.** Stops one feature from eating the whole org's budget.

```typescript
const limit = await rateLimiter.check(`chat:${userId}`, { limit: 60, window: '1h' });
if (!limit.allowed) return new Response('Slow down', { status: 429 });

const spent = await spendTracker.todayUsd(tenantId);
if (spent > tenant.dailyCapUsd) return new Response('Tenant cap reached', { status: 402 });
```

## Kill switches

- Every AI feature behind a flag, kill switch reachable in under a minute by on-call.
- **Fallback path defined per feature** — graceful degradation, cached response, non-AI behavior, "temporarily unavailable." (See [fallbacks](./12-fallbacks.md).)
- A documented runbook: "if AI cost spikes, do X."

```typescript
if (await flags.killed('support_assistant')) {
  return { text: "I'm temporarily unavailable. Please email support@acme.com.", escalated: true };
}
```

## Worked example — adding cost control to the support assistant

The fourth layer on the support assistant — per-user rate limit, per-tenant daily cap, cascade routing, and a kill switch. All before the model call.

```typescript
import { flags, rateLimiter, spendTracker } from './platform';

export async function POST(req: Request) {
  // 0. Kill switch — checked first, no work done if off
  if (await flags.killed('support_assistant')) {
    return Response.json({ text: 'Temporarily unavailable.', escalated: true });
  }

  const { messages, tenantId, userId } = await parse(req);

  // 1. Per-user rate limit
  const rl = await rateLimiter.check(`support:${userId}`, { limit: 60, window: '1h' });
  if (!rl.allowed) return new Response('Slow down', { status: 429 });

  // 2. Per-tenant daily cap
  const spent = await spendTracker.todayUsd(tenantId);
  if (spent > tenant(tenantId).dailyCapUsd) {
    return Response.json({ text: 'Daily limit reached. Contact billing.' }, { status: 402 });
  }

  // 3. Cascade: try the cheap retrieval+answer first
  const cheap = await answerWithModel('claude-haiku-4-5', messages, tenantId);
  if (cheap.confident) {
    await spendTracker.record(tenantId, cheap.costUsd);
    return Response.json(cheap);
  }

  // 4. Escalate to the bigger model only when needed
  const big = await answerWithModel('claude-sonnet-4-5', messages, tenantId);
  await spendTracker.record(tenantId, cheap.costUsd + big.costUsd);
  return Response.json(big);
}
```

Five guards — kill switch, rate limit, tenant cap, cascade, spend tracking — none of which require new infrastructure. Most of the actual cost work is here, not inside the model call.

## The 80/20 of cost savings

Two changes that typically cut a startup's AI bill in half:

1. **Move classifications and short structured-output features from a frontier model to a small model.** Haiku / GPT-mini / Gemini Flash handle 90% of these tasks at 10–30× lower cost.
2. **Turn on prompt caching for any feature with a long stable system prompt or large reference text.** (See [caching](./caching.md).)

Do these first. Then the rest of the optimizations.

## Daily cost dashboard — what to put on it

A working dashboard for an AI feature should show, at a glance:

- **Today's spend** vs. yesterday vs. 7-day average.
- **Per-feature breakdown** — which feature drives most cost; spike-watch.
- **Per-tenant top 10** — which customers are biggest, and which are anomalously high.
- **Cost per request** by feature — sudden jumps indicate prompt bloat or model swap.
- **Cache hit rate** (response + prompt + embedding) — drops correlate with cost spikes.
- **Fallback rate** — bigger-model fallbacks are expensive; track them.
- **Tokens-in vs. tokens-out** per feature — output tokens are 3–5× more expensive than input; output-heavy features need different optimization.

A toggle on each feature for the kill switch, and a "this month's budget burndown" plot, complete the picture. None of this is exotic; most teams just don't have it until they get a surprise bill.

## Watch out for

- **Rate-limiting on a client-controlled key.** `x-session-id` from the browser is attacker-controlled — rotation defeats the limit. Anchor on the authenticated user id.
- **No per-feature cost cap.** One launched feature with a regression can torch the org's whole month. Cap each independently.
- **Untracked agent spend.** If your agent loop doesn't accumulate per-step usage, your dashboards will report the average cost of "an agent run" and hide the long tail of $50 runs.
- **Cheap-model regressions caught only by users.** When you cascade, sample the *non-escalated* outputs into evals. The cheap path is where silent regressions hide.
- **No kill switch.** When an AI feature melts down at 3 AM, your on-call needs a single switch, not a deploy. Flag every AI feature from day one.
- **Caching everything.** Caching personalized responses globally leaks data; caching errors memoizes them. Cache deliberately, not by reflex.

## 2026 stack

| Layer            | Default pick                                                                  |
|------------------|-------------------------------------------------------------------------------|
| Rate limit       | Upstash, Vercel KV, Redis + token-bucket library. Cloudflare Rate Limiting at the edge. |
| Spend tracking   | Langfuse / Helicone / Braintrust capture usage per call; aggregate in your DB.|
| Feature flags    | LaunchDarkly, Statsig, Vercel Edge Config, ConfigCat.                         |
| Cascade routing  | Build inline. Gateways (Portkey, OpenRouter) can route by cost rule.          |
| Budget caps      | Per-tenant `spend_today_usd` column + a cron that resets at UTC midnight.     |

## Token economics, in one table

Knowing the rough numbers turns "this feature feels expensive" into a calculation.

| Lever                                       | Typical cost change          |
|---------------------------------------------|------------------------------|
| Frontier model → cheap model (where evals pass) | 10–30× cheaper           |
| Prompt cache hit on a 4 KB system prompt    | ~10× cheaper on the cached prefix |
| Top-20 chunks → top-5 (reranked)            | ~4× cheaper input + better quality |
| Chat history truncation/summarization (20 turns → 5 + summary) | 4–8× cheaper after the first few turns |
| Response cache on FAQ-style queries         | 1.0× → 0.1× on cache-hit traffic |
| Disabling streaming                         | ≈ no cost change (UX regression though) |

Most cost projects look like "stack three of these." Together they routinely cut bills by 10×+ with no perceived quality loss.

:::note[Two-afternoon cost projects]
Two afternoons in week one will save you more money than two months of tuning prompts later:

1. **Wire prompt caching on every feature with ≥1 KB of stable prefix.** Measure `cached_input_tokens`. Expect 30–60% input-cost drop.
2. **Build a tiny dashboard** with per-feature and per-tenant daily spend, plus a kill-switch toggle. The dashboard pays for itself the first time something goes wrong.

The third afternoon (cascade routing) saves another big chunk but is more work. Do it after evals are in place — you need them to confirm the cheap path isn't a quality regression.
:::

---

→ Next: [Embeddings & semantic search](./09-embeddings-search.md).
