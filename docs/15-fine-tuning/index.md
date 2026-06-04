---
id: fine-tuning-overview
title: 7. Fine-tuning & Customization — Overview
sidebar_position: 1
sidebar_label: Fine-tuning intro
description: How to change a model's actual weights — when it's worth it, how to build the dataset, run SFT with LoRA/QLoRA, align to preferences, distill, evaluate, and serve the result.
---

# Part 7: Fine-tuning & Customization

*The point where you stop steering a model with words and start changing what it has learned.*

> **In one line:** Fine-tuning takes an existing model and keeps training it on *your* examples so the new behaviour is baked into the weights — and most of the skill is in the dataset, the decision to do it at all, and proving it actually worked.

:::tip[In plain English]
Prompting is giving a smart new hire a sticky note of instructions for each task. RAG is handing them a binder to look things up in. **Fine-tuning is sending them on a training course** so the skill becomes second nature — they no longer need the sticky note. That course is expensive and slow compared to a sticky note, so you only send people on it when the note keeps getting ignored, is too long, or the same lesson is needed thousands of times a day. This chapter teaches you when to send the model to training, how to write its coursework (the dataset), how the training actually works under the hood, and how to check it learned the right thing without forgetting everything else.
:::

## What this chapter covers

This is the self-contained, first-principles treatment of fine-tuning. By the end you can decide whether to fine-tune, build a clean dataset, run supervised fine-tuning with LoRA/QLoRA on a budget, understand preference tuning and distillation, evaluate the result against the base model, and serve it in production.

- [When to fine-tune (and when not to)](./02-when-to-finetune.md) — the honest decision tree: why prompting and RAG usually win first, the three things fine-tuning is genuinely good at, and the cost/maintenance reality nobody warns you about.
- [Data preparation: the dataset IS the product](./03-data-prep.md) — chat/JSONL formats, why quality beats quantity, how many examples you actually need, sourcing, cleaning, the train/validation split, and synthetic data.
- [Supervised fine-tuning (SFT) from scratch](./04-sft.md) — loss, epochs, learning rate, full fine-tuning vs parameter-efficient, and how to spot overfitting before it ships.
- [LoRA & QLoRA](./05-lora-qlora.md) — why tiny low-rank adapters work, rank and alpha, 4-bit quantization, the memory math that lets you train a big model on one GPU, and when to reach for each.
- [Preference tuning: RLHF & DPO](./06-preference-tuning.md) — aligning a model to *preferred* behaviour: the reward-model-plus-PPO pipeline, the simpler DPO family that mostly replaced it, and when you'd actually need either.
- [Distillation](./07-distillation.md) — using a big frontier "teacher" to generate training data for a small cheap "student," so a model you can afford to run punches far above its size.
- [Evaluating fine-tunes](./08-evaluating-finetunes.md) — held-out evals, regression against the base model, catastrophic forgetting, and A/B testing in production. The "did it actually work?" page.
- [Serving fine-tuned models](./09-serving-finetunes.md) — hosted FT endpoints vs self-hosting, multi-adapter LoRA hot-swapping, versioning, and rollback.

## How to read this chapter

Read it in order the first time — each page builds on the last. Page 2 is the most important page in the chapter: most people who "need fine-tuning" actually need a better prompt or RAG, and you should be able to tell the difference. Pages 3–5 are the hands-on core (data, then the training itself, then the cheap way to do it). Pages 6–7 are powerful but more specialized — skim them now, return when you need them. Pages 8–9 are non-negotiable for anything you ship: an unevaluated, un-versioned fine-tune is a liability.

This chapter deepens decisions you may have met earlier — the [prompt-vs-RAG-vs-fine-tune decision](/docs/decisions/prompt-vs-rag-vs-finetune), the [fine-tuning walkthrough](/docs/decisions/fine-tuning-walkthrough), and the [fine-tuning platforms](/docs/stack/fine-tuning-platforms) page. We re-teach every concept from scratch here, but those are good companions. For *proving* a fine-tune worked, lean on the whole [Evaluation chapter](/docs/evaluation).

---

→ Start with [When to fine-tune (and when not to)](./02-when-to-finetune.md).
