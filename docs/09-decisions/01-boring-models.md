---
id: boring-models
title: Pick boring models
sidebar_position: 2
description: Pick the most-deployed model that passes your evals, not the newest leaderboard winner. The AI version of the boring-technology rule.
---

# Pick boring models

> **In one line:** Pick the most-deployed model that passes your evals — not the newest leaderboard winner.

:::tip[In plain English]
A new "best model" lands every two weeks in 2026. Most of them won't be production-ready for six months. The model with millions of hours of usage behind it has known failure modes, known costs, working tools around it, and a stable SDK. Boring beats hype 95% of the time. Spend your novelty budget on your prompts, your data, your evals — not on chasing the leaderboard.
:::

## The default

For any new AI feature, your first pick is the **incumbent model in your provider**: GPT-4.1 (or its successor in the same family) for OpenAI, Claude Sonnet for Anthropic, Gemini 2.5 Pro for Google. These are the models with the deepest production deployment.

Use them unless your evals say otherwise.

## Why boring AI wins

- **Documented failure modes.** Years of public failure reports — jailbreaks, refusals, hallucination patterns — let you design around the holes.
- **Stable pricing.** Frontier-launch models often get repriced within months. Mainline models are repriced down, not up.
- **Working tools.** Tracing, evals, structured output, prompt caching, batch API — these land on mainline models first. New leaderboard models often ship without them.
- **Predictable latency.** A model with millions of QPS has stable p99s. A new model's p99 can be 10x its p50 for weeks.
- **No SDK churn.** The "new top model" is sometimes only accessible through an unstable endpoint that's deprecated three months later.
- **Hireable.** Engineers know how to prompt the boring model. Onboarding is fast.

## When boring isn't enough — and how to know

You earn the right to upgrade by **showing eval evidence**, not by reading a blog post.

The trigger is: *the new model meaningfully wins on YOUR evals — not the public ones — on the specific tasks your product cares about, by enough margin to justify the swap cost.*

Things that look like good reasons but aren't:

- "It's #1 on LMArena." LMArena measures preference on generic chat. Your product is not generic chat.
- "The blog post says it's 2x better at coding." You're not writing the same code as the blog post.
- "Other startups are switching." They have different evals and different costs than you.
- "It's cheaper per token." Often the new "cheap" model uses 3x more tokens for the same task. Measure end-to-end cost, not per-token cost.

## Concrete examples in 2026

**Boring choices (the defaults):**

- **GPT-4.1** for general agents, RAG answering, structured extraction.
- **Claude Sonnet** for long-context, careful writing, agent loops.
- **Gemini 2.5 Pro** when you need cheap long-context or native multimodal.
- **OpenAI `text-embedding-3-large`** or **Cohere v3** for embeddings.
- **Whisper v3** for transcription.

**Spending the novelty budget (justified, occasionally):**

- A reasoning model (o-series, R1-style) for a feature whose quality is currently your ceiling.
- A specialized vision model when generic multimodal doesn't cut it.
- A new open-weight model when your evals show it's within 5% of frontier on your tasks at 1/10 the cost.

**Usually a mistake:**

- Swapping your production model the week a new release drops.
- Routing 100% of traffic to a new model without a shadow comparison.
- Picking a model because "everyone's talking about it."
- Adding a third model to support so the team can "compare in production."

## When this rule doesn't apply

- **You're an AI lab or research team.** You're the people running the leaderboard. Different game.
- **You have a single, narrow, measurable task.** Then the right answer is whichever model wins your eval — boring is irrelevant when you can measure precisely.
- **Cost is your only constraint.** A 10x cheaper open model that passes your eval bar at 95% accuracy may beat the boring closed model.
- **You need data residency.** Closed boring models can't deploy to your VPC; you may need self-hosted open models.

## How to apply it

Before you swap models, write this down:

1. **What is the eval that proves the new model is better for THIS feature?**
2. **What's the cost delta on real production traffic** (not the price card)?
3. **What's the rollback plan** if quality regresses after a week?
4. **Who owns prompts** that need to be re-tuned for the new model?

If you can't answer all four, you're chasing hype.

:::note[Worked example: not switching to the new top model]
A customer support startup is running on Claude Sonnet. A new model launches that's 12% better on MMLU. The team's instinct is to switch.

Instead they run their own eval (500 real tickets, graded by humans). New model: 91% helpful. Sonnet: 92% helpful. New model is 1% *worse* on their task. Cost is 1.3x higher. Latency p99 is 2.5x.

They don't switch. They saved a month of prompt re-tuning and avoided a quality regression. Six months later the new model gets cheaper and faster — they re-evaluate then.
:::

---

→ Next: [The reversibility ladder](./02-reversibility.md).
