---
id: prompt-engineering-vs-fine-tuning
title: Prompt engineering vs fine-tuning
sidebar_position: 17
description: The explicit escalation rule. When prompt engineering is the right escalation; when fine-tuning is; the conditions that flip the answer.
---

# Prompt engineering vs fine-tuning

> **In one line:** Always exhaust prompt engineering first; escalate to fine-tuning only when you have a stable narrow task, ≥200 clean examples, and evals showing prompts have hit a real ceiling.

:::tip[In plain English]
Fine-tuning is the "big move" in AI engineering. It feels like the serious option. It almost never is. 90% of the time, what the team thinks is a fine-tuning problem is actually a prompt-engineering problem in disguise — vague instructions, missing few-shot examples, no structured output, no retrieval. Fix the prompts first. The fine-tune you don't need is the cheapest fine-tune you'll ever do.
:::

## The escalation rule

Climb in this order. Stop at the first that passes evals.

1. **Better system prompt.** Clear role, clear instructions, explicit rules, explicit format.
2. **Few-shot examples.** 3–10 input/output pairs in the prompt.
3. **Structured output.** Force the model to return JSON matching a schema.
4. **Chain-of-thought prompting.** "Think step by step before answering."
5. **Decomposition.** Split the task across multiple prompts.
6. **RAG.** Inject the knowledge the model lacks.
7. **Bigger / better model.** Sonnet → Opus, GPT-4.1 → o-series.
8. **Fine-tuning.** Only after all the above.

The rule of thumb: **each step is ~10x cheaper than the next.** A prompt edit is hours. A fine-tune is months — data collection, training, evaluation, retraining when the base model changes, ongoing eval drift monitoring.

## When prompt engineering is the right answer

Almost always. Specifically:

- **The task is general-purpose** and the model has the knowledge.
- **The desired output format is wrong** — fix with structured output, not weights.
- **Style or tone is off** — fix with few-shot, not training.
- **The model hallucinates** — RAG, not fine-tune.
- **You're still iterating on the spec.** Fine-tuning a moving target is wasted work.
- **You don't have 200 high-quality labeled examples.** You can't fine-tune well without them.

## When fine-tuning is the right answer

All of these need to be true:

- **The task is narrow and stable.** "Classify this customer email into one of 12 categories per our taxonomy" stays stable. "Help with anything" doesn't.
- **You've exhausted prompting + RAG** and evals show the ceiling.
- **You have 200+ clean labeled examples** (1,000+ is better; the curve flattens after a few thousand).
- **Volume is high enough to matter.** Fine-tuning to save 5 cents/day isn't worth it.
- **Latency or cost pressure justifies it.** A fine-tuned small model can be 10x cheaper than a frontier prompt.
- **You're willing to retrain when the base model changes.** Every base-model upgrade is a fine-tune re-do.

## Things that look like fine-tuning problems but aren't

- **"It doesn't know our product."** → RAG over your docs.
- **"It gets the format wrong."** → Structured output / JSON schema.
- **"It refuses harmless requests."** → Better system prompt about scope.
- **"It hallucinates."** → RAG + a grounding instruction + an eval.
- **"It's too slow."** → Smaller model + better prompt often beats fine-tune.
- **"It's expensive."** → Caching, batching, prompt compression first.
- **"It doesn't sound like us."** → Few-shot examples of "voice" almost always work.

## The fine-tune cost stack

Engineers under-estimate fine-tuning cost. Real components:

- **Data collection** (often the biggest cost): labeling, cleaning, edge case curation.
- **Training**: cheap on managed platforms ($100s for a small model, $1000s for a larger one).
- **Eval infrastructure**: you need a real eval set to know if it worked.
- **Retraining cadence**: every base model upgrade. Plan for 2–4x per year.
- **Cost of being locked in**: a fine-tuned model on `gpt-4o-mini-2024-07-18` may not transfer to its successor.
- **Operational overhead**: deploying, versioning, monitoring the custom model.

## The hybrid pattern

Mature teams sometimes layer:

- **Fine-tune for stable narrow tasks** that run at high volume (classification, format conversion, narrow extraction).
- **Prompt engineering for everything varied** (general agents, conversation, anything still evolving).
- **RAG everywhere knowledge is needed.**

Fine-tuning isn't "instead of" prompting — it's "for these specific places where prompting has provably hit a wall."

## When this rule doesn't apply

- **You already have a strong fine-tuning dataset** from prior work. Skip the climb if you can — but still measure against a prompt baseline.
- **The task is so narrow and so high-volume** that a small fine-tuned model is obviously right (e.g., 100M extractions/day of a fixed schema).
- **Regulatory pressure requires deterministic behavior** that only fine-tuning + tight evals can deliver.
- **You're on-device / edge** where the only model that fits is a small one you've fine-tuned.

## How to apply it

When someone proposes fine-tuning, ask:

1. **What's the eval that says prompts can't get us there?** Show me the numbers.
2. **Have we tried RAG, few-shot, structured output, decomposition?** All of them?
3. **Do we have 200+ clean examples?** Show me.
4. **What's the retraining plan when the base model changes?** Who owns this in 12 months?
5. **What's the cost delta vs a better prompt on the boring model?** Per-call, per-month.

## Common mistakes

- **Fine-tuning on too few examples.** Below ~200, you usually just memorize the examples without generalizing.
- **Fine-tuning on noisy data.** Bad labels → bad model. The eval will look fine on examples that match the noisy training set and fail on real traffic.
- **Treating fine-tuning as a one-time investment.** Every base-model upgrade is a re-fine-tune. Budget for it.
- **Skipping the prompt baseline.** Without a baseline, you can't tell if the fine-tune was worth it.
- **Fine-tuning instead of RAG.** Knowledge changes; weights don't. Inject knowledge through context, not training.

:::note[Worked example: the fine-tune that wasn't needed]
A team wants to fine-tune a model for "writing in our brand voice." They've collected 800 blog posts as training data.

Before training, they run a one-day experiment: take 8 representative blog posts as few-shot examples in the system prompt, add a tone-of-voice rule list, run on a 100-post eval. An LLM-as-judge scores them for "matches the brand voice" against the held-out posts.

Few-shot prompt: 88% match rate.
Fine-tuned baseline they'd projected: ~92%.

The 4-point gap doesn't justify the 3-month training project — especially because every Claude version upgrade would invalidate the fine-tune. They ship the few-shot version. Six months later, when Claude's voice control gets even better, the gap closes further.

The lesson: prompt engineering is more powerful than its reputation. Fine-tuning is for the cases where you've genuinely hit the wall and can prove it.
:::

---

→ Next: [What would hurt](./12-what-would-hurt.md).
