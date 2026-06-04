---
id: evaluation-overview
title: 5. Evaluation & Measurement — Overview
sidebar_position: 1
sidebar_label: Evaluation intro
description: How to measure whether an AI system is good — the discipline that separates AI engineers from people who run prompts and squint at the output.
---

# Part 5: Evaluation & Measurement

*The single skill that turns "it looks good to me" into "I can prove it got better."*

> **In one line:** If you can't measure your AI system, you can't improve it, can't ship it safely, and can't tell whether yesterday's change helped or quietly broke something — evaluation is the whole job.

:::tip[In plain English]
Imagine you tweak a recipe and ask one friend "is it better?" They shrug. That's how most people "test" AI: they change a prompt, eyeball one answer, and convince themselves it improved. **Evaluation** is the opposite of that shrug. It's a repeatable, graded test — a stack of example inputs with a way to score each output — so that every change gets a number, not a vibe. Once you have that number, the whole job clicks into place: you can iterate fast, block bad deploys automatically, and watch quality in production. Everything in this chapter teaches you to build and trust that number.
:::

## What this chapter covers

This chapter is the deep, self-contained treatment of evaluation. By the end you can design an eval suite, pick the right metrics, build an LLM-as-judge, gate your CI on regressions, and run evals in production.

- [Why evals are the whole game](./02-why-evals.md) — why "vibes don't scale," the eval-driven loop, and why this is *the* core AI-engineering discipline.
- [Types of evaluation](./03-eval-types.md) — offline vs online, unit vs end-to-end, reference-based vs reference-free, and the eval pyramid that organizes them.
- [Building eval datasets](./04-datasets.md) — golden sets, coverage, slices, sizing, where cases come from, and how to version them.
- [Metrics](./05-metrics.md) — exact match, precision/recall/F1, similarity (embedding/ROUGE/BLEU), rubric scores, and retrieval metrics (recall@k, MRR, faithfulness). Includes a hands-on coding challenge.
- [LLM-as-judge](./06-llm-as-judge.md) — judge prompts, pairwise vs pointwise, the biases that wreck judges, and how to calibrate a judge against humans.
- [Human evaluation](./07-human-eval.md) — annotation guidelines, inter-annotator agreement, when humans are non-negotiable, and what it costs.
- [Evals in CI/CD](./08-evals-in-cicd.md) — regression gating, thresholds, blocking deploys, and tracking prompt/model versions.
- [Production evaluation](./09-production-evals.md) — online sampling, real-time quality signals, drift, and the data flywheel that feeds your eval set.

## How to read this chapter

Read it in order the first time — each page builds on the last. Pages 2–3 give you the mental model, 4–5 give you the raw materials (data and metrics), 6–7 cover the two ways to *grade* hard-to-grade outputs (an LLM or a human), and 8–9 put it all on autopilot (CI gates and production monitoring). If you've already shipped something, you can jump straight to [datasets](./04-datasets.md) and [metrics](./05-metrics.md) and use the rest as reference.

This chapter consolidates and deepens material you may have met earlier — the [lifecycle eval-design page](/docs/lifecycle/lifecycle-evals), the [evals-as-a-product pattern](/docs/patterns/pattern-evals), [eval-driven development](/docs/patterns/pattern-eval-driven-development), and the [eval tooling page](/docs/stack/eval-tools). We re-teach every concept from scratch here, but those pages are good "see also" companions.

---

→ Start with [Why evals are the whole game](./02-why-evals.md).
