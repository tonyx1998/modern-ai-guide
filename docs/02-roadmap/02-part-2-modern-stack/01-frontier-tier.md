---
id: frontier-tier
title: Frontier Tier — Use When Nothing Else Passes
sidebar_position: 2
sidebar_label: Frontier tier
description: GPT-5, Claude Opus 4.x, Gemini 2.x Ultra — the models you reach for when the eval forces you, not by default.
---

# Frontier Tier — Use When Nothing Else Passes

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** The most capable, most expensive models — for the small fraction of features where the eval forces you up the cost curve.

:::tip[In plain English]
AI models come in rough price-and-quality tiers, a bit like economy, business, and first class on a plane. This page is about first class: the smartest models that also cost the most — often 50 to 100 times the price of the budget options. The decision this page teaches is *when that price is actually worth paying*, and the answer is: far less often than you'd guess. Most teams waste money by reaching for the top shelf "just to be safe," when a cheaper model would have done the job equally well. Learning to climb the price ladder only when your tests prove you have to is one of the biggest money-saving habits in this field.
:::

## What's in this tier (as of 2026)

| Model | Provider | Strength | Roughly per M tokens (in / out) |
|-------|----------|----------|----------------------------------|
| **GPT-5** | OpenAI | General reasoning, code, instruction-following | $10–15 / $50–80 |
| **Claude Opus 4.x** | Anthropic | Long-context coding, judgment, careful reasoning | $15 / $75 |
| **Gemini 2.x Ultra / Pro Ultra** | Google | 2M-token context, multimodal | $7–10 / $30–40 |
| **o-series reasoning** (o-style, OpenAI) | OpenAI | Hard math, hard logic, multi-step planning | $15+ / $60+ (varies by reasoning effort) |

Prices change quarterly; check provider dashboards for current numbers. The shape of the tier (4–10x the cost of workhorse, 50–100x the cost of cheap) is stable.

## Why this tier exists

A small fraction of tasks genuinely need the extra capability:

- **Deep reasoning chains** — multi-step proofs, complex code refactoring, scientific analysis. The cheap-tier model's chain of thought breaks down around step 4–5; the frontier model holds it through step 15.
- **High-stakes outputs** — legal/medical/financial work where a 2% improvement in correctness justifies 30x the cost.
- **Long-context understanding** — 200k+ tokens of input where the model has to retain coherence across the whole window.
- **Last-resort eval-failure cases** — features where you've tried prompting, RAG, fine-tuning at the workhorse tier and the evals still don't pass.

## Why NOT this tier (the common mistake)

The most expensive failure mode in AI engineering is "we'll use GPT-5 for everything to be safe." Three problems:

1. **Cost scales linearly with volume.** A million calls/month at frontier pricing is $10K–$50K. The same volume at cheap-tier is $200–$1,000. If your eval doesn't show a real quality lift, you're burning the difference.
2. **Latency suffers.** Frontier models are slower (often 2–3x the time to first token of cheap models). For chat UIs and tool-calling loops, this is felt acutely.
3. **You skip the discipline.** "GPT-5 fixes it" stops you from improving your prompts, your retrieval, your chunking — the things that actually compound. Cheap-tier failures force engineering; frontier "wins" let you avoid it.

:::tip[The economic frame]
Start at the cheap tier. Build your eval set. If the eval passes at 80%+ on cheap, you're done. Climb to workhorse only when a specific eval case demands it. Climb to frontier only when workhorse fails on a case you can't engineer around. **Each tier above cheap should be justified by a specific failed eval, not vibes.**
:::

## When frontier is actually the right answer

- **Hard reasoning loops.** Multi-step planning where each step depends on the last; the chain-of-thought has to be tight. Cheap models fall over around 4–5 steps; workhorse goes ~10; frontier holds 15–20+.
- **Code generation at depth.** Writing 500+ lines of cohesive code across multiple files, refactoring legacy code, debugging across module boundaries.
- **Synthesis over large contexts.** Reading a 200-page document and producing a coherent summary that doesn't lose details from the middle.
- **Judgment-heavy tasks** where the cost of being wrong is high — content moderation policy edge cases, legal contract review, medical triage.
- **Evaluation/judging.** When using LLM-as-judge, sometimes the judge needs to be more capable than the model being judged. Frontier judges on workhorse outputs is a common pattern.

## The reasoning models (o-series) note

OpenAI's o-style reasoning models (and similar from competitors) sit in this tier but trade differently: they "think" for longer (more reasoning tokens internally before responding), produce better results on hard reasoning, but cost more and have higher latency. Use them when:

- The problem is genuinely a reasoning problem (math, multi-step logic, planning).
- Latency tolerance is high (the user expects a wait).
- You can't decompose the problem into shorter steps.

For most app-shaped AI features (chat, RAG, structured output), regular frontier models are the better trade.

## Cost projection example

A SaaS feature: 100 calls/user/day, 50K users, 2k input + 500 output tokens per call.

```
Total monthly: 100 × 50,000 × 30 = 150M calls
Input tokens:  150M × 2k = 300 billion
Output tokens: 150M × 500 = 75 billion

At cheap tier  ($0.25/M in, $2/M out):
  Input cost:  300,000 × $0.25 =  $75,000
  Output cost:  75,000 × $2.00 = $150,000
  Total:                          $225,000

At workhorse ($3/M in, $15/M out):
  Input cost:  300,000 × $3.00 =  $900,000
  Output cost:  75,000 × $15.00 = $1,125,000
  Total:                         $2,025,000

At frontier  ($10/M in, $50/M out):
  Input cost:  300,000 × $10 =   $3,000,000
  Output cost:  75,000 × $50 =   $3,750,000
  Total:                         $6,750,000
```

A 30x cost difference between tiers, on the same feature. The eval better show a *very large* quality lift to justify each climb.

## How to pick within the tier

When you've decided you need frontier, the choice among GPT-5 / Claude Opus / Gemini Ultra depends on the task:

- **Coding** — Claude Opus 4.x has been the consensus best at this for ~18 months and counting.
- **General reasoning, broad instruction-following** — GPT-5.
- **Long context (1M+ tokens)** — Gemini Ultra has the largest context window; Claude has tighter quality at 200k.
- **Multimodal** — Gemini and GPT-5 are roughly equal; Claude trails on image understanding.
- **Vendor diversification** — if your business risk is "single vendor outage," pick a non-OpenAI option.

For non-eval-driven choices ("which feels best for our use case"), run a side-by-side on your top 20 eval cases. Numbers > vibes.

## Common mistakes

:::caution[Where people commonly trip up]
- **Defaulting to frontier "to be safe."** Safe for quality, catastrophic for cost and latency. Always start cheap; climb when forced.
- **No eval comparison when switching tiers.** If you upgrade from cheap to workhorse "because it should be better," and your eval doesn't move, you wasted money. Re-run evals on every tier change.
- **Using reasoning models for non-reasoning tasks.** They're slow and expensive. For chat, structured output, RAG answer-gen — regular frontier or workhorse is better.
- **Locking in on one provider.** Frontier model rankings shuffle every 6–12 months. Architect your code with a provider-abstraction layer (Vercel AI SDK, LiteLLM) so you can swap when the leaderboard moves.
:::

<Quiz id="frontier-tier-quick-check" variant="micro" title="Quick check">

<Question
  prompt="When is climbing to the frontier tier actually justified?"
  options={[
    { text: "At the start of every project, so quality is never a question" },
    { text: "Whenever a new frontier model tops the public leaderboards" },
    { text: "When a specific eval case fails at the workhorse tier and you cannot engineer around it" },
    { text: "Whenever a feature is user-facing" }
  ]}
  correct={2}
  explanation="The durable rule is that each tier climb must be justified by a specific failed eval case, not by vibes or caution. Starting at frontier 'to be safe' burns money and latency, and it lets you skip the prompt and retrieval engineering that actually compounds."
/>

<Question
  prompt="Reasoning-focused models (the o-series style) are the right pick when..."
  options={[
    { text: "The problem is genuinely multi-step reasoning, latency tolerance is high, and you cannot decompose it into shorter steps" },
    { text: "You need the fastest possible chat responses" },
    { text: "You are generating answers in a RAG pipeline where retrieval does the heavy lifting" },
    { text: "You need structured output that follows a schema" }
  ]}
  correct={0}
  explanation="Reasoning models trade extra cost and latency for better performance on hard multi-step logic. For most app-shaped work — chat, RAG answers, structured output — a regular frontier or workhorse model is the better trade because those tasks do not need long internal reasoning chains."
/>

<Question
  prompt="What is the main argument against defaulting to the frontier tier for everything?"
  options={[
    { text: "Frontier models are less accurate than cheaper models on routine tasks" },
    { text: "It costs and delays far more, and it lets you skip the engineering discipline that actually improves your system" },
    { text: "Frontier models cannot call tools or produce structured output" },
    { text: "Providers rate-limit frontier models so heavily they are unusable in production" }
  ]}
  correct={1}
  explanation="The page calls this the most expensive failure mode in AI engineering: cost scales linearly with volume, latency suffers, and 'the big model fixes it' stops you from improving prompts, retrieval, and chunking — the things that compound over time."
/>

</Quiz>

→ Next: [Workhorse tier](./02-workhorse-tier.md) — the default for most real AI work.
