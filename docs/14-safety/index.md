---
id: safety-overview
title: 6. Responsible & Safe AI — Overview
sidebar_position: 1
sidebar_label: Safety intro
description: How to build AI features that don't hurt people, leak data, or get your company sued — threat modeling, prompt injection, guardrails, hallucination, bias, privacy, red-teaming, and 2026 regulation.
---

# Part 6: Responsible & Safe AI

*Shipping a model that works is half the job. Shipping one that doesn't hurt anyone is the other half — and it's the half that gets you fired, fined, or front-paged when you skip it.*

> **In one line:** Treat your LLM like an untrusted, occasionally-confident-but-wrong intern with access to production — wrap it in deterministic guardrails, never let it be the security boundary, and assume every input is trying to attack you.

:::tip[In plain English]
A regular bug shows up as a stack trace. An AI safety failure shows up as a customer's social security number in a screenshot, a chatbot that talked someone into self-harm, a model that quietly denies loans to one neighborhood, or a "helpful" agent that emailed your whole customer list because a PDF told it to. None of these are exotic — they're the predictable result of plugging a probabilistic text generator into real systems without seatbelts. This chapter is the seatbelts: how to think about the harm, how to defend against it in code (not in pleading prompts), and how to satisfy the regulators who, as of 2026, are very much watching.
:::

## What this chapter covers

This chapter goes far deeper than the [safety & privacy pattern](/docs/patterns/pattern-safety-privacy) and [OWASP page](/docs/patterns/pattern-ai-security-owasp) you met in the patterns chapter — those were the field-card; this is the textbook.

- [A threat model for AI systems](./02-threat-model.md) — A taxonomy of AI harm (misuse, malfunction, systemic), who gets hurt, the safety-vs-security distinction, and the rule that anchors the whole chapter: *the LLM is never the security boundary.*
- [Prompt injection & jailbreaks](./03-prompt-injection.md) — Direct and indirect (RAG-borne) injection, why data and instructions can't be separated, why it's an *unsolved* problem, and the layered defenses that actually reduce blast radius.
- [Guardrails: input & output](./04-guardrails.md) — Moderation APIs, classifiers, allow/deny lists, schema and grammar constraints, guardrail frameworks, and why guardrails must *fail closed*.
- [Hallucination & confabulation](./05-hallucination.md) — Why models make things up with total confidence, grounding and citation, teaching abstention ("I don't know"), confidence estimation, and faithfulness checks.
- [Bias & fairness](./06-bias-fairness.md) — Where bias comes from, how to measure it across demographic slices, mitigations, and the honest limits of debiasing.
- [Privacy & data governance](./07-privacy-data.md) — PII detection and redaction, retention, training-data consent, memorization and leakage, and regional data rules (GDPR, CCPA, data residency).
- [Red-teaming & adversarial testing](./08-red-teaming.md) — How to attack your own system before someone else does, automated red-teaming, safety evals, and incident response for AI.
- [Governance & regulation in 2026](./09-governance-regulation.md) — The EU AI Act risk tiers, NIST AI RMF, model and system cards, internal AI policy, and audit trails.

Then a [checkpoint quiz](./99-checkpoint.md) to lock it in.

## How to read this chapter

Read it in order the first time — each page builds on the threat model from page 2. After that, treat it as a reference: when you design a new AI feature, walk the [threat model](./02-threat-model.md); when you build the request pipeline, pull in [guardrails](./04-guardrails.md) and [injection defenses](./03-prompt-injection.md); before launch, run the [red-teaming](./08-red-teaming.md) checklist; before the lawyers ask, read [governance](./09-governance-regulation.md).

The one idea to carry through every page: **safety is structural.** It lives in deterministic code, schemas, authorization layers, and process — not in politely-worded system prompts. A prompt is advice; an attacker ignores advice.

---

→ Start with [A threat model for AI systems](./02-threat-model.md).
