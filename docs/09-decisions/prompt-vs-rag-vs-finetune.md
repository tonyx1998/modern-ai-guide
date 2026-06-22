---
id: prompt-vs-rag-vs-finetune
title: Prompt vs RAG vs fine-tune
sidebar_position: 5
description: The first architecture decision in any AI project. Try them in this exact order; stop at the first one that passes your evals.
---

# Prompt vs RAG vs fine-tune

> **In one line:** Try prompting, then RAG, then fine-tuning — in that exact order — and stop at the first one that passes your evals.

:::tip[In plain English]
The single most common mistake in AI engineering is reaching for fine-tuning when prompting would have worked, or reaching for RAG when a better prompt would have been enough. The escalation is one-way: each step costs 10x more engineering time than the one before it. Walk the ladder. Don't skip steps.
:::

## The decision order

Try in this exact order; **stop at the first that passes your evals.**

1. **Prompting** (best model, well-crafted prompt, structured output). Cheapest, fastest to iterate, reversible.
2. **Add few-shot examples to the prompt.** Cheap. Often enough.
3. **RAG.** When the answer requires knowledge the model doesn't have, or domain-specific terminology.
4. **Better RAG** (hybrid search, reranker, smarter chunking, query rewriting). When RAG quality is the gap.
5. **Decompose into multiple LLM calls.** When the task is too big for one prompt.
6. **Tool use / agent.** When the task requires actions or live data.
7. **Fine-tuning.** When all of the above hit a ceiling on a stable, narrow task.

## When each one is the right answer

### Prompting
- General-purpose tasks where the model already has the knowledge.
- Format and tone control (with structured output).
- Anything you're still iterating on (which is most things).

### Few-shot
- When the desired output format is hard to specify in words but easy to show.
- When the task has subtle conventions (e.g., your domain's tone of voice).
- When zero-shot keeps drifting on style or completeness.

### RAG
- The model lacks specific knowledge (your docs, your data, current information).
- You need citations or attribution.
- The corpus changes often — fine-tuning would always be stale.

### Better RAG
- Recall is the problem (you're not finding the right chunk): hybrid search, reranker.
- Precision is the problem (you're finding too much junk): better chunking, metadata filters, query rewriting.

### Decomposition
- The single-prompt version exceeds the model's reliable-attention window.
- The task has natural sub-steps with clear contracts.
- You want the option to swap one sub-step for a cheaper model.

### Tool use / agent
- The model needs to take actions in the world.
- The answer depends on live data (calendar, inventory, the user's account).
- The path through the task varies per request.

### Fine-tuning
- You've exhausted prompting + RAG and have evals proving the ceiling.
- You have 200+ high-quality `{input, ideal_output}` examples.
- The task is narrow, stable, and high-volume.
- Latency or cost pressure justifies a smaller specialized model.
- You're willing to retrain every time the base model changes meaningfully.

## When fine-tuning is *not* the right answer

- **"The model doesn't know X."** → That's RAG.
- **"The output format is wrong."** → That's structured output.
- **"It hallucinates."** → Usually RAG, evals, or better prompting.
- **"It's too slow."** → Smaller base model + better prompts often beats fine-tune.
- **"We want it to sound like our brand."** → Few-shot + a tone-of-voice spec in the system prompt almost always works.
- **You don't have ≥200 clean examples.** Without good data, fine-tuning will just memorize your noise.

## Hybrid: RAG + fine-tune

Useful when fine-tuning teaches *style/format/safety* and RAG injects *current knowledge*. Rare at startup scale, common in mature enterprise deployments. Order matters: get prompt and RAG right *first*, then layer fine-tuning on top, not the other way around.

:::note[→ Going deeper]
Once you've decided fine-tuning is actually the right rung, the next questions are *which kind* (SFT / DPO / RFT) and *how much data*. See the [fine-tuning decision walkthrough](./fine-tuning-walkthrough.md) for the worked numbers, and [Chapter 7: Fine-tuning & Customization](/docs/fine-tuning) — especially [when to fine-tune](/docs/fine-tuning/ft-when) — for the full treatment.
:::

## When this rule doesn't apply

- **You already have a great fine-tuning dataset.** Then fine-tuning may be a reasonable first move — but you still benchmark against a strong prompt baseline.
- **The base model genuinely cannot do the task.** Some highly specialized domains (rare languages, regulated medical) need fine-tuning even at the v0.
- **You're constrained to a tiny model for latency/cost reasons** (e.g., on-device). Then fine-tuning a small model often beats prompting a big one — but you still measure.

## How to apply it

For every "the model is bad at X" report, before you choose an intervention:

1. **What rung am I on?** Be honest. Most teams skip to rung 5 or 7.
2. **What's the eval that will tell me this rung worked?** No eval = no rung change.
3. **What's the cheapest change that could plausibly close the gap?** Try that first.

The escalation only makes sense if you're measuring. Without evals, every choice feels equally good — and fine-tuning's high cost is invisible until you're three months in.

:::note[Worked example: a fine-tune that wasn't needed]
A SaaS team is building an AI ticket router. The model picks the wrong queue ~30% of the time. The team's plan: collect 5,000 examples, fine-tune.

What the ladder actually fixed:

1. **Rung 1:** Rewrite the prompt to list the queues with explicit rules. Wrong-routing drops from 30% to 18%.
2. **Rung 2:** Add 6 few-shot examples of edge cases. Drops to 11%.
3. **Rung 3:** Add RAG over the company's escalation rules doc. Drops to 6%.

Total: one week of one engineer, no training data needed, 80% of the gap closed. The fine-tune was a 3-month project. The prompt was an afternoon.

The fine-tune may *still* be the right next move — but the eval bar to justify it is now "is the win worth the 3 months and the retraining-forever commitment?" Often the answer is no.
:::

<Quiz id="prompt-vs-rag-vs-finetune-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the decision order for the first architecture choice in an AI project?"
  options={[
    { text: "Fine-tune first, then add RAG, then simplify to prompting" },
    { text: "Start with whichever technique is newest" },
    { text: "Prompting, then RAG, then fine-tuning — stopping at the first that passes your evals" },
    { text: "Run all three in parallel and compare" }
  ]}
  correct={2}
  explanation="The escalation is one-way and each step costs roughly 10x more engineering time than the one before, so you walk the ladder and stop at the first rung that passes evals. Skipping straight to fine-tuning when prompting would have worked is called the single most common mistake in AI engineering."
/>

<Question
  prompt="The model hallucinates facts about your domain. What is the first-line fix?"
  options={[
    { text: "RAG or better prompting — not fine-tuning" },
    { text: "Immediately collect data and fine-tune" },
    { text: "Add more agents to cross-check answers" },
    { text: "Only lower the temperature" }
  ]}
  correct={0}
  explanation="Hallucination usually means the model lacks knowledge — that is a RAG problem (or an eval and prompting problem), not a weights problem. Fine-tuning tempts because it feels decisive, but baked-in knowledge goes stale the moment your corpus changes, while RAG stays current."
/>

<Question
  prompt="In the ticket-router worked example, how much of the 30% error rate was fixed WITHOUT fine-tuning?"
  options={[
    { text: "None — the fine-tune was required" },
    { text: "About 5 points" },
    { text: "All of it, instantly" },
    { text: "About 80% of the gap, in one week of prompt, few-shot, and RAG work" }
  ]}
  correct={3}
  explanation="Wrong-routing fell from 30% to 6% across three cheap rungs: explicit queue rules in the prompt, six few-shot edge cases, and RAG over the escalation doc. The planned 3-month, 5,000-example fine-tune became optional — and now had to justify itself against a much smaller remaining gap."
/>

</Quiz>

---

→ Next: [Agent vs chain](./agent-vs-chain.md).
