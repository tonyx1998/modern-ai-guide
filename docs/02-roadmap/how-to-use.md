---
id: roadmap-how-to-use
title: How to Use This Roadmap
sidebar_position: 2
sidebar_label: How to use this roadmap
description: The playbook — read top-to-bottom, build at every stage, write evals before scaling, slow down when an eval drops.
---

# How to Use This Roadmap

## If you're new to AI engineering

1. **Read Part I top-to-bottom, one stage at a time.** Don't skip. Each stage builds on the previous; if you skip from "first API call" to "agent," you'll spend a month debugging a loop that's broken in three places and you can't tell which.
2. **Build the artifact at the end of each stage** before moving on. The teal *Project* callouts. Reading without building is the AI-engineering equivalent of watching swim videos and calling yourself a swimmer.
3. **Use the linked canonical resources for depth.** Each stage links out to free, gold-standard learning material (OpenAI cookbook, Anthropic prompting guide, the actual papers when they're readable) and into the [Foundations](/docs/foundations) and [Stack](/docs/stack) chapters of this guide. The roadmap gives you the path; those give you the practice hours.
4. **Don't rush.** Stages 0–9 are *3–6 months* of part-time work depending on your background. There's no shortcut — and the people who claim to have done it in two weekends usually have a portfolio of toy demos with no evals.
5. **When stuck, read [Part IV](./04-part-4-meta/index.md).** "How to learn fast" and "When to pivot" exist because the field is moving faster than you can keep up — having strategies for that is the skill.

## If you can already make an API call and ship a prompt

Skip the first three stages, but **do Stage 6 (evals)** even if you think you know it. Most "I've been doing AI for six months" engineers have never written a real eval set — and it's the load-bearing skill that distinguishes hobby from production. Then jump to [Part II — The 2026 AI Stack](./02-part-2-modern-stack/index.md).

## If you're already shipping AI in production

[Part III — Beyond the Stack](./03-part-3-beyond/index.md) is where you live. Prompting as craft, eval discipline, retrieval quality at scale, agent reliability, cost/latency intuition, safety. None of which the SDKs teach you, and all of which become the *constraint* on production AI as soon as you scale past a single customer.

:::info[A note on AI-assisted learning of AI]
ChatGPT and Claude *can* teach you AI engineering. They're also exactly the wrong teacher for half the lessons — they'll generate a LangChain snippet that "works" and skip the inspection step that's the whole point of Stage 1. Use AI to **explain** what a piece of code is doing (`"walk me through what response.choices[0] contains"`) rather than to **do** the stage for you. The latter is how you get six months into AI engineering without understanding the message-format the API actually returns.
:::

## The legend

Pages in this chapter use a few recurring callouts:

- **Stage** — a milestone in the curriculum. Has a time budget and an artifact you should have built by the end.
- **Tier 1 / 2 / 3** — opinionated picks. Tier 1 = adopt now. Tier 2 = worth knowing. Tier 3 = skip or defer.
- **In plain English** — the explanation for someone who's never heard of the concept.
- **Project** — what you should build before clicking next.
- **Common mistakes** — where people predictably trip up.
- **Page checkpoint** — three quick questions to make sure the page stuck.

## The cardinal rule

> **No new stage until the previous stage's artifact runs end-to-end with at least one eval case passing.**

This is the single rule that separates engineers who become senior AI engineers in a year from engineers who are still demoing the same toy chatbot after two. Build it. Measure it. Then move on.

→ [Start with Stage 0 — Setup](./01-part-1-from-zero/01-stage-0-setup.md)
