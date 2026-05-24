---
id: timeline-and-path
title: Timeline & Suggested Order
sidebar_position: 99
sidebar_label: Timeline & order
description: How long does this take, in what order, and what to skip if you're in a hurry? Honest version.
---

# Timeline & Suggested Order

## The suggested order

Don't read the parts strictly 1 → 4. Use them as overlapping tracks:

1. **Always-on track — Part IV (Meta-skills).** Read [How to learn AI fast](./04-part-4-meta/01-how-to-learn-fast.md) and [When to pivot](./04-part-4-meta/04-when-to-pivot.md) *before* you start Stage 1. They change how everything after them sticks — and they're cheap to read.
2. **Primary track — Part I, in order.** Stages 0 → 9, no skipping. This is 3–6 months part-time.
3. **Lookup track — the rest of this guide.** When Stage *n* points at [Foundations](/docs/foundations) or [Stack](/docs/stack), follow the link, read the page, return.
4. **Once you're shipping — Part II.** As you complete Stages 6+, sample the trends and tier-1 picks against your own projects.
5. **Once you're mid-level — Part III.** Roughly when "did the API call return JSON" stops being the hard question and "is this RAG actually good" becomes the hard one.

## How long does all this take? — *honest version*

The marketing copy says "build AI agents in a weekend." Most of those weekend agents have no evals, no cost caps, no observability, and would catch fire the second a real user hit them. Honest engineering takes longer.

| Background | To Stage 5 (first RAG) | To Stage 9 (shipped + evaled) |
|------------|------------------------|--------------------------------|
| Total beginner, part-time (10 hrs/week) | 1.5–3 months | 4–6 months |
| Total beginner, full-time (35+ hrs/week) | 3–5 weeks | 2–3 months |
| Working web/backend dev, part-time | 3–5 weeks | 2–4 months |
| Working ML/data scientist, part-time | 1–2 weeks (you know the math; you don't know the productionization) | 1–2 months |
| Working AI engineer already shipping | Days (use Part I as a self-check) | Not the target — go to Part II / III |

These are *honest* numbers. Plan for the upper end. If you hit the lower end, great.

:::tip[The constant that matters most]
**How many hours per week, sustained, with builds at the end of each stage.** Ten hours every week for six months beats forty hours for one month followed by burnout, every time. The dropouts in AI engineering are almost always burnout-driven or motivation-driven, not talent-driven — the field rewards the people still showing up in month four.
:::

## What to skip if you're in a hurry

If you absolutely must compress to ~4 weeks, here's the minimum viable path. You'll have gaps; you'll know what they are.

| Stage | Keep / skip | Why |
|-------|-------------|-----|
| Stage 0 — Setup | **Keep** | Two hours; saves you two weeks of debug |
| Stage 1 — First call | **Keep** | One afternoon; the mental model is the whole point |
| Stage 2 — Chatbot | Skip if you don't ship chat | Pure UI work; reusable elsewhere |
| Stage 3 — Structured output | **Keep** | Highest-leverage pattern in the roadmap |
| Stage 4 — Tools | **Keep** | Half of all AI features are this |
| Stage 5 — RAG | **Keep** | Half of all AI features are this |
| Stage 6 — Evals | **Keep, non-negotiable** | Without it you're flying blind |
| Stage 7 — Observability | Compress to: "log every call to one table" | Full hosted observability can wait |
| Stage 8 — Agent | Skip until you need it | Most production AI is not agents |
| Stage 9 — Ship | **Keep** | The lessons are in the deployment friction |

That's seven stages instead of ten, ~4 weeks at full-time pace. Note: the skipped stages are also the ones least useful to "demo and look smart" — they're the ones you grind out for production reliability.

## What to skip if you're already a web developer

You already know hosting, auth, rate limiting, observability concepts. Compress Stages 0, 2, 9 — most of the operational work transfers directly. The new material is Stages 3, 4, 5, 6 — and especially Stage 6, because writing evals is a category of testing you haven't done before.

## What to skip if you're already an ML engineer

You know about embeddings, vector math, fine-tuning, training loops. Compress Stages 3, 5 — the mechanics are familiar. The new material is Stages 4 (tool calling as a production pattern), 6 (evals as a *product* discipline, not a research benchmark), 7, 9 — the productionization work that academic ML doesn't cover.

## A note on prerequisites

This roadmap assumes you can write a small program in some language and read English documentation. It does *not* assume:

- Math beyond high-school algebra (vectors and cosine similarity come up; both are learnable on demand)
- Any prior ML experience
- A CS degree (helpful but absolutely not required)
- Familiarity with cloud infra (you'll meet just enough at Stage 9)

If you're worried about whether you can do this: you can. The variable that matters is sustained hours, not innate aptitude.

→ [Start with Stage 0](./01-part-1-from-zero/01-stage-0-setup.md) · [Read Part IV first](./04-part-4-meta/index.md)
