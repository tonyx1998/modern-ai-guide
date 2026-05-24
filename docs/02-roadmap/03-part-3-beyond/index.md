---
id: part-3-overview
title: Part III — Beyond the Stack
sidebar_position: 1
sidebar_label: Part III overview
description: The intuitions and disciplines the AI stack doesn't teach you. Prompting as craft, eval mindset, retrieval quality, agent discipline, cost/latency intuition, safety.
---

# Part III — Beyond the Stack

*The stack changes every six months. These seven skills don't.*

If you've shipped a few production AI features and you're starting to ask "why am I always re-learning the same lessons with each new framework?" — that's the signal that the leverage has moved from *more tools* to *more intuition*.

:::tip[The career inflection point]
Junior AI engineers are graded on whether the LLM call returns the right shape. Mid-level AI engineers are graded on whether the system *as a whole* — prompt, retrieval, evals, observability, fallbacks, cost — is the right design for the problem. The seven skills in this part are how you make that shift.
:::

## What's in this part

- [Prompting as craft](./01-prompting-as-craft.md) — Context engineering: the entire input as designed artifact.
- [Eval mindset](./02-eval-mindset.md) — How to think about measurement; LLM-judge biases and mitigations.
- [Retrieval quality](./03-retrieval-quality.md) — Why chunking and hybrid search dominate embedding choice.
- [Agent discipline](./04-agent-discipline.md) — When agents are the right tool; when they aren't; how to keep loops safe.
- [Cost intuition](./05-cost-intuition.md) — Order-of-magnitude estimation; why caching is the highest-leverage optimization.
- [Latency intuition](./06-latency-intuition.md) — TTFT vs total time; streaming UX; perceived vs measured speed.
- [Safety mindset](./07-safety-mindset.md) — Prompt injection, data exfiltration, supply-chain risk; defense-in-depth.

## How to read this part

Slowly. None of these are crash courses — each one is a multi-year skill. The page for each is a curated entry point: the load-bearing ideas, the common failure modes, what to practice, where to read deeper. None of these survive being skimmed.
