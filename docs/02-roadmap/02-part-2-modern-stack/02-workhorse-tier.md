---
id: workhorse-tier
title: Workhorse Tier — The Default for Real Work
sidebar_position: 3
sidebar_label: Workhorse tier
description: Claude Sonnet 4.x, GPT-5 family, Gemini Pro — the tier where most production AI lives. Good enough for almost everything, cheap enough to scale.
---

# Workhorse Tier — The Default for Real Work

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** The model tier where most production AI features live — capable enough for serious work, cheap enough to run at scale.

:::tip[In plain English]
If frontier models are first class and cheap models are economy, this page is about business class — the comfortable middle where most real products actually run. These models are smart enough for serious work like chat, document answering, and tool use, but cost a fraction of the top tier. The decision this page teaches is when the middle tier is the right home for a feature, when to splurge upward, and when to save by dropping down. Most working AI engineers spend most of their time right here, so knowing this tier's trade-offs pays off daily.
:::

## What's in this tier (as of 2026)

| Model | Provider | Strength | Roughly per M tokens (in / out) |
|-------|----------|----------|----------------------------------|
| **Claude Sonnet 4.x** | Anthropic | The current consensus best workhorse — strong reasoning, excellent tool use | $3 / $15 |
| **GPT-5** (non-mini) | OpenAI | Broad capability, best ecosystem | $2.50 / $10 |
| **Gemini 2.x Pro** | Google | Long context (1M tokens), strong multimodal | $1.25 / $5 |

Plus tier-2 picks:

| Model | Provider | Notes |
|-------|----------|-------|
| Mistral Large / Codestral | Mistral | EU data residency; competitive on coding |
| DeepSeek V3 / R1 | DeepSeek | Aggressive pricing; reasoning variants compete with frontier |
| Llama 4 Maverick / Scout | Meta | Open weights; deployable on Bedrock / Together / Groq |

## Why this tier is the default

Workhorse models pass ~85–95% of typical AI engineering evals. They're:

- **3–5x cheaper than frontier** — at scale, this is the difference between a profitable AI feature and a financial drain.
- **Latency-friendly** — typically ~200ms time-to-first-token; comfortable for chat and tool loops.
- **Tool-calling competent** — they reliably emit valid tool calls, follow schemas, and handle multi-step loops.
- **Long-context capable** — 128k–1M tokens depending on model; enough for almost any RAG or document task.
- **Broadly supported** — every framework, gateway, and SDK supports them; mature library coverage.

The pattern that emerges in production: **most features ship on workhorse, with cheap-tier for high-volume low-stakes calls (classification, simple extractions) and frontier reserved for the few hard cases**.

:::tip[The 80/15/5 rule of thumb]
A typical production AI app's spend distribution: ~80% of dollars on workhorse-tier calls, ~15% on cheap-tier calls (high volume), ~5% on frontier (hard edge cases). If your distribution is way different from this, it's worth interrogating why.
:::

## When workhorse is the right call

Pretty much always. Specifically:

- **Production chat features** — Sonnet/GPT-5 are the right TTFT + quality balance for user-facing chat.
- **Production RAG answer generation** — the answer-gen model in a RAG pipeline doesn't need frontier quality; the retrieval is doing the heavy lifting.
- **Tool-calling agents** — the agent loop needs reliability, not max capability; workhorse models are tuned for clean tool calls.
- **Multi-step workflows** that don't go beyond 5–6 steps.
- **Structured output extraction** — workhorse easily handles complex schemas; no need to pay frontier rates.

## When to climb to frontier

Three signals:

1. **Eval-driven**: a specific test case in your eval set fails on workhorse but passes on frontier. (Verify it actually does — sometimes the perceived "better" is just temperature noise.)
2. **Reasoning depth**: chains-of-thought beyond ~10 dependent steps where intermediate errors compound.
3. **Critical-cost-of-wrong**: a feature where the 1–2% quality lift saves you from PR / legal / safety incidents.

## When to drop to cheap

If workhorse passes the evals comfortably (95%+ pass rate, large margin), try the cheap tier and see if it still passes. Often it does. The savings are 5–10x.

- **Classification tasks** — workhorse for "what category is this?" is overkill; cheap models nail this.
- **Simple extractions** — pulling structured fields out of well-formed input.
- **High-volume low-stakes** — analytics labels, content tagging, low-priority routing.
- **First-pass triage** — cheap model triages, workhorse handles the cases that need real work.

## How to pick within the tier

| Decision | Lean toward |
|----------|-------------|
| Best at coding | Claude Sonnet 4.x |
| Best ecosystem / tool integration | GPT-5 |
| Largest context window | Gemini 2.x Pro (1M tokens) |
| EU data residency required | Mistral (Paris-based) |
| Aggressive pricing, willing to test reliability | DeepSeek |
| Self-hosting / open weights | Llama 4 |
| Vendor diversification | Pick a non-OpenAI option |

Run a head-to-head on your top 30 eval cases. **Always.** Don't pick based on benchmarks or Twitter; benchmark on your problem.

## Model-routing as the production pattern

Many real production apps route between tiers per-call rather than picking one:

```python
def pick_model(task_type: str, complexity: int) -> str:
    if task_type == "classify":
        return "claude-haiku-4-5"  # cheap
    if task_type == "extract":
        return "gpt-5-mini"  # cheap
    if task_type == "answer_general" and complexity < 7:
        return "claude-sonnet-4-5"  # workhorse
    if complexity >= 7 or task_type == "complex_reasoning":
        return "gpt-5"  # frontier
    return "claude-sonnet-4-5"  # default
```

The router can be hand-coded (as above) or itself LLM-driven (an "intent classifier" that picks a model). Hand-coded is the right starting point — easy to reason about, easy to debug.

## Provider-abstraction trade-off

Should you call SDKs directly, or use a provider-agnostic layer like Vercel AI SDK or LiteLLM?

**Use a provider-agnostic layer when:**
- You want to swap models without code changes.
- You're routing between providers based on task.
- You want one observability/cost-tracking pattern across providers.

**Use raw SDKs when:**
- You need provider-specific features (Anthropic's prompt caching, OpenAI's structured outputs nuances).
- The abstraction layer's overhead is meaningful for your latency budget.
- You want explicit understanding of what's happening at the wire level.

For a production workhorse-tier deployment, the abstraction layer usually wins.

## Caching at this tier

Workhorse-tier prompt caching is the highest-leverage cost optimization in production.

- **Anthropic prompt caching**: explicit `cache_control` markers; 90% discount on cached input tokens after the first call. Massively underused.
- **OpenAI prompt caching**: automatic for prompts >1024 tokens with stable prefixes; 50% discount on cached input.
- **Gemini context caching**: explicit cache objects with TTL; massive savings on RAG-style apps that re-send the same context.

For a chat app that re-sends a 5k-token system prompt + tool definitions on every call, caching is the difference between $5k/month and $500/month.

→ [Patterns: Caching](/docs/patterns/pattern-caching) for the full implementation.

## Common mistakes

:::caution[Where people commonly trip up]
- **Picking by Twitter announcements.** Every model launch claims to dominate benchmarks. Run your own evals on your own problem before swapping.
- **Sticking with one provider out of habit.** Workhorse-tier rankings shuffle every quarter. If you've been on the same provider for 18 months and haven't re-evaluated, you're probably leaving 30%+ savings or quality on the table.
- **Not using prompt caching.** Cached input tokens are 50–90% cheaper. If your prompts have stable prefixes (system prompts, tool definitions, RAG-style context), set up caching — it's typically a 3–10x cost reduction.
- **Optimizing prompts before evals.** Tweaking prompts without measuring is fortune-telling. Build the eval first (Stage 6), then iterate prompts against it.
- **Treating "workhorse" as one model.** Sonnet behaves differently from GPT-5 in subtle ways — tone, refusal patterns, tool-call shapes. Switching providers may require prompt adjustments. Test, don't assume.
:::

<Quiz id="workhorse-tier-quick-check" variant="micro" title="Quick check">

<Question
  prompt="According to the rule of thumb on this page, how does spend typically distribute across tiers in a healthy production AI app?"
  options={[
    { text: "Mostly frontier, with workhorse for prototypes only" },
    { text: "Roughly equal thirds across cheap, workhorse, and frontier" },
    { text: "Mostly cheap tier, with frontier handling all user-facing traffic" },
    { text: "Around 80 percent workhorse, 15 percent cheap, and 5 percent frontier" }
  ]}
  correct={3}
  explanation="The 80/15/5 rule of thumb: most dollars go to workhorse calls, high-volume low-stakes work goes to cheap, and only a sliver of hard edge cases justifies frontier. If your distribution looks very different, it is worth interrogating why."
/>

<Question
  prompt="Your workhorse model passes the eval suite with a 97 percent pass rate and a wide margin. What does this page say to do next?"
  options={[
    { text: "Try the same feature on the cheap tier and see if the evals still pass" },
    { text: "Lock in the workhorse model so nothing changes" },
    { text: "Upgrade to frontier to push the pass rate to 100 percent" },
    { text: "Reduce the size of the eval set since it is clearly too easy" }
  ]}
  correct={0}
  explanation="A comfortable pass with a large margin is the signal to try dropping a tier. Often the cheap model still passes, and the savings are 5 to 10 times. Tier moves in both directions should be driven by eval results, not habit."
/>

<Question
  prompt="What is the recommended way to choose between models within the workhorse tier?"
  options={[
    { text: "Pick whichever model tops the public benchmarks this quarter" },
    { text: "Run a head-to-head comparison on your own top eval cases" },
    { text: "Pick the model with the largest context window" },
    { text: "Stay with whichever provider your team already has an account with" }
  ]}
  correct={1}
  explanation="The page is emphatic: benchmark on your problem, not on Twitter or leaderboards. Models differ in subtle ways — tone, refusal patterns, tool-call shapes — so the only trustworthy signal is a head-to-head run on your own eval cases."
/>

</Quiz>

→ Next: [Cheap tier](./03-cheap-tier.md) — where you should actually be starting.
