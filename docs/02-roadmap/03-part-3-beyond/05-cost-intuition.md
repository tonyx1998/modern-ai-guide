---
id: cost-intuition
title: Cost Intuition
sidebar_position: 6
sidebar_label: Cost intuition
description: Order-of-magnitude estimation for LLM features. Why caching is the highest-leverage cost optimization. The math that decides which AI features are profitable.
---

# Cost Intuition

> **In one line:** Develop the muscle to estimate any AI feature's monthly cost in 30 seconds — and you'll catch the obvious disasters before you build them.

:::tip[In plain English]
Every AI feature has a bill, and the math behind it is short: how many calls you make, how many tokens go in and out per call, and which tier of model you use. Output tokens cost several times more than input tokens, and a frontier model can cost roughly 17 times more than a cheap one for the exact same call. The skill this page builds is doing that multiplication in your head in 30 seconds — so you spot the feature that would cost millions a month before anyone builds it.
:::

The skill: given a feature description (volume + tokens-per-call + model tier), produce a per-month cost estimate accurate within ~2x. Then verify with logs.

## 1. The base equation

```
Monthly cost ≈ calls/month × (input_tokens × $/M_input + output_tokens × $/M_output)
```

Three numbers; the third comes from the model tier. That's the whole math.

## 2. Tier pricing as of 2026

Round numbers, treat as 2x ranges:

| Tier | Input $/M | Output $/M | Output : Input ratio |
|------|-----------|------------|-----------------------|
| Cheap | $0.10–$0.30 | $0.50–$2.00 | ~4–8x |
| Workhorse | $2–$5 | $10–$25 | ~5x |
| Frontier | $10–$20 | $40–$100 | ~4–5x |
| Embeddings | $0.02–$0.13 | (no output) | n/a |

Output is always more expensive than input. **The most common cost optimization is "make the model write less."**

## 3. The per-call cost

For a typical call (2k input, 500 output):

| Tier | Cost per call |
|------|---------------|
| Cheap (Haiku) | 2k × $0.80/M + 500 × $4/M = $0.0016 + $0.002 = **~$0.004** |
| Workhorse (Sonnet) | 2k × $3/M + 500 × $15/M = $0.006 + $0.0075 = **~$0.014** |
| Frontier (Opus) | 2k × $15/M + 500 × $75/M = $0.030 + $0.0375 = **~$0.068** |

A 17x range across tiers for the same call. Picking the wrong tier silently dominates everything else you do.

## 4. The scale calculator

Memorize a few reference points:

| Calls/month | Cheap | Workhorse | Frontier |
|-------------|-------|-----------|----------|
| 1K | $4 | $14 | $68 |
| 10K | $40 | $140 | $680 |
| 100K | $400 | $1,400 | $6,800 |
| 1M | $4,000 | $14,000 | $68,000 |
| 10M | $40,000 | $140,000 | $680,000 |

Multiply by your actual token counts (these assume 2k in / 500 out). Realistic chatbot calls run higher (5k+ input with system prompt + history).

:::tip[The 30-second estimate]
For any new feature: (calls/month) × (tokens/call) × (price/M) for each of input + output, sum, round to one sig fig. That's your order-of-magnitude cost.
:::

## 5. Where the bill actually goes

In production AI apps, the breakdown is usually:

| Category | Typical share |
|----------|---------------|
| Workhorse-tier user-facing calls | 60–80% |
| Cheap-tier high-volume background calls | 10–25% |
| Frontier-tier hard edge cases | 5–15% |
| Embeddings (one-time indexing) | \&lt;5% |
| Embeddings (query-time) | \&lt;2% |
| Evals & development | ~1–5% |
| Observability / gateway / supporting services | \&lt;10% |

If your bill is dominated by something else (e.g., embeddings are 40% of your cost), that's a sign of an architectural issue (probably reindexing too often or embedding at query time when caching would do).

## 6. The optimizations, ranked

### 1. Prompt caching (typically 50–90% cost reduction on cached input)

If your prompts have stable prefixes (system prompt, tool definitions, RAG context that doesn't change per call), cache them.

- **Anthropic**: explicit `cache_control` markers; 90% discount on cached input tokens after the first call.
- **OpenAI**: automatic for prompts >1024 tokens with stable prefixes; 50% discount.
- **Gemini**: explicit `cachedContent` objects with TTL; massive savings.

A chat app re-sending a 5k-token system prompt on every turn benefits hugely. For most apps this is the single highest-leverage optimization.

### 2. Smaller model where it works (5–50x reduction)

Run evals at the cheap tier. If they pass, you just saved 5–50x. Most teams default to workhorse "to be safe" and never check whether cheap would do.

### 3. Shorter prompts and tighter system prompts (~10–30% reduction)

Token-by-token audit your system prompt. Cut redundancy. Move stable text to cached prefix.

### 4. Shorter outputs (~30–50% reduction on output-heavy calls)

`max_tokens` is a hard cap. "Reply in 2 sentences" is a soft cap. Both matter.

### 5. Batch APIs (50% discount, for async)

OpenAI and Anthropic offer 50% off for batch jobs (non-real-time). Use for analytics, backfills, eval runs.

### 6. Provider competition (variable, often 20–50%)

If you've been on one provider for a year, you've probably missed a cheaper-and-equally-good alternative. Run the evals on 2–3 providers periodically.

### 7. Model routing (10–60% reduction)

Route easy queries to cheap models, hard queries to workhorse. The classifier itself is a cheap call. Net savings depend on the distribution.

### 8. Semantic caching (variable, risky)

Cache responses based on embedding similarity, not exact match. Higher hit rates but harder to verify correctness.

## 7. The frontier-trap math

The most expensive mistake: defaulting to frontier "because quality matters."

Example: a SaaS feature, 50K users, 100 calls/day, 2k+500 tokens:

```
Monthly calls: 50K × 100 × 30 = 150M

At frontier ($15 in, $75 out):
  150M × (2k × $15/M + 500 × $75/M)
  = 150M × ($0.030 + $0.0375)
  = 150M × $0.0675
  = $10.125M/month

At workhorse ($3 in, $15 out):
  150M × $0.0135 = $2.025M/month

At cheap ($0.80 in, $4 out):
  150M × $0.0036 = $540K/month
```

If your eval doesn't show frontier delivers materially better answers than workhorse on YOUR cases, you're burning $8M/month for vibes. Run the eval.

## 8. The 80/20 audit

Once a month, run this on your `llm_calls` table:

```sql
-- Which features spend the most?
SELECT feature, SUM(cost_usd) AS spend
FROM llm_calls WHERE ts > now() - interval '30d'
GROUP BY feature ORDER BY spend DESC;

-- Which users / tenants spend the most?
SELECT user_id, SUM(cost_usd) AS spend, COUNT(*) AS calls
FROM llm_calls WHERE ts > now() - interval '30d'
GROUP BY user_id ORDER BY spend DESC LIMIT 20;

-- What's the cache-hit rate? (assumes you track this)
SELECT
  feature,
  AVG(CASE WHEN cached THEN 1.0 ELSE 0.0 END) AS hit_rate,
  COUNT(*) AS calls
FROM llm_calls WHERE ts > now() - interval '7d'
GROUP BY feature ORDER BY calls DESC;
```

Five minutes, every month. Catches the cost drift before it becomes a fire.

## 9. Cost-per-active-user (the metric that matters)

For a SaaS:

```
Cost-per-active-user = (Monthly LLM spend) / (Monthly active users)
```

This is the number that decides whether the AI feature is profitable. If your subscription is $20/user/month and your LLM-cost-per-user is $50, the feature is losing money on every customer.

The fix:

- Tier the feature (free tier with cheap-tier model, paid tier with workhorse).
- Cap usage per user (with friendly UX about limits).
- Cache aggressively.
- Push expensive operations to the user's request explicitly ("press the deep-analyze button" rather than running deep-analyze on every page view).

## 10. The "did we save money?" verification

After every optimization, *measure*. The bill should drop. If it doesn't:

- Volume might have grown to offset the per-call savings.
- The optimization might not apply to your call shape (e.g., cache misses on dynamic prompts).
- The optimization might have shifted cost to a different line (cheap-tier failure rate up → fallback to workhorse).

Optimizations without measurements are theater.

## Common mistakes

:::caution[Where people commonly trip up]
- **Default to frontier "for quality."** Always start cheap; climb only when evals force you. The cost difference is brutal at scale.
- **Skipping prompt caching.** It's a 5–10x savings on stable-prefix prompts and most teams don't enable it.
- **Optimizing the wrong call.** Spend audit first; optimize the line that's actually big. The 0.1% of cost from your dashboard isn't worth your time.
- **Endless prompt-shortening.** Past a point, cutting prompt length hurts quality more than it saves money. Cache instead.
- **Ignoring output-token cost.** Output is 5–10x input. "Tell me everything you know" is a 50x more expensive prompt than "Reply in one sentence."
- **Not measuring after changes.** Make a change "to save money," ship, never check the bill. Verify.
:::

<Quiz id="cost-intuition-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Which optimization does the page call the single highest-leverage one for most apps?"
  options={[
    { text: "Switching to a cheaper provider every quarter" },
    { text: "Prompt caching on stable prefixes like the system prompt" },
    { text: "Capping output length with max_tokens" },
    { text: "Using batch APIs for everything" }
  ]}
  correct={1}
  explanation="Caching stable prefixes typically cuts 50-90% of cached input cost - a chat app re-sending a 5k-token system prompt on every turn benefits hugely. The other options help, but they rank lower."
/>

<Question
  prompt="Why does the page call 'make the model write less' the most common cost optimization?"
  options={[
    { text: "Output tokens are priced several times higher than input tokens" },
    { text: "Output tokens are free but slow down the response" },
    { text: "Input tokens are actually the expensive ones" },
    { text: "Shorter outputs are always more accurate" }
  ]}
  correct={0}
  explanation="Across every tier, output runs about 4-8x the price of input. Tightening max_tokens and asking for concise replies attacks the expensive side of the equation directly."
/>

<Question
  prompt="Which metric does the page say decides whether an AI feature is profitable for a SaaS?"
  options={[
    { text: "Total monthly token count" },
    { text: "The p95 latency of user-facing calls" },
    { text: "The cache hit rate across features" },
    { text: "Monthly LLM spend divided by monthly active users" }
  ]}
  correct={3}
  explanation="Cost-per-active-user is the number that matters: if your subscription is $20/user/month and your LLM cost per user is $50, the feature loses money on every customer no matter how good it is."
/>

</Quiz>

→ Next: [Latency intuition](./06-latency-intuition.md) — TTFT, streaming UX, perceived vs measured speed.
