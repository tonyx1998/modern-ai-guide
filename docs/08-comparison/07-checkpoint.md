---
id: comparison-checkpoint
title: Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test on the key differences across solo / startup / enterprise AI.
---

# Checkpoint — did the comparison stick?

> **In one line:** If you can answer these without flipping back, you've got the column-thinking that the rest of the book leans on.

:::tip[In plain English]
This page isn't graded. It's a mirror. The point is to surface the spots where you'd still copy the wrong column's playbook, so you can re-read those sections before moving on to [Decision Frameworks](/docs/decisions).

Try to answer each question in your head first, then reveal the answer.
:::

## How to use this page

For each question, hold an answer in your head before scrolling. The "answer" section gives the chapter's take *and* the page it came from — if your answer disagrees, that's the page to revisit.

---

## 1. The "where am I actually?" question

You're advising a 12-person AI team at a Series A startup. They just signed their first six-figure enterprise customer and are excitedly building an internal Center of Excellence, prompt registry, and risk-tier classification system. What's your advice?

<details>
<summary>Reveal answer</summary>

**They're solving the wrong problem.** Twelve people don't need a CoE — a CoE is a *coordination* function for dozens of independent AI efforts. They almost certainly do need a few specific enterprise imports the customer will ask about in due diligence: a kill-switch fire drill, per-tenant cost dashboards, a documented incident-response runbook, and *some* artifact (even a Notion page) that looks like a prompt registry for the SOC 2 auditor.

Importing the whole enterprise bundle at once is how startups go from "moves fast" to "ships nothing" in a quarter. Import enterprise practices **selectively, in order of risk-reduction-per-dollar**.

*Revisit: [Tradeoffs — the column-jumping trap](./06-tradeoffs.md#tradeoffs-and-when-to-pick-which).*

</details>

---

## 2. The kill-switch question

You're a single solo developer with one AI-powered product getting ~500 monthly users. Do you need a kill switch?

<details>
<summary>Reveal answer</summary>

**Yes.** Even at solo scale, the only acceptable answer to "what do you do if the model starts saying something it shouldn't?" is "flip this thing." For a solo dev it can be as simple as an `AI_ENABLED` env var that flips to `false` and redeploys in 60 seconds.

What you *don't* need solo is per-feature × per-tenant kill switches, audit logs, or a quarterly fire drill. Right-size the mechanism to your column; don't skip the mechanism itself.

*Revisit: [Ops — kill-switch process](./04-ops.md#kill-switch-process).*

</details>

---

## 3. The prompt-change time question

The same one-sentence prompt addition takes 90 seconds at solo scale, ~30 minutes at startup scale, and 1–2 weeks at enterprise scale (Low risk tier). What is that time differential actually paying for?

<details>
<summary>Reveal answer</summary>

**Risk absorption proportional to blast radius.** The *thinking* — "add this sentence" — takes the same 5 minutes in every column. The rest is reviewers, eval batteries, deploy windows, cohort soak times, and audit-log writes. Each step exists because a past incident proved it was needed at that blast radius.

The mistake at every scale is keeping a step *after* the risk it absorbs is no longer plausible (enterprise problem) or skipping a step *before* the risk arrives (startup problem).

*Revisit: [Workflow — prompt change](./workflow.md#prompt-change) and [Team and Process — worked example](./01-team-and-process.md#time-from-idea-to-live-by-change-type).*

</details>

---

## 4. The cost-attribution question

At a startup spending $20K/month on AI, what's the single most important cost-related thing to build first?

<details>
<summary>Reveal answer</summary>

**Per-tenant / per-feature cost attribution.** The moment you have multiple paying customers, you need to know which one is costing you 10x the others — otherwise a "we need to cut AI spend" project becomes a fishing trip.

Optimizing the bill *before* measuring what you're paying for is one of the most common waste patterns at startup scale. Attribution first; optimization second.

*Revisit: [Economics — what this implies at each scale](./economics.md#what-this-implies-at-each-scale).*

</details>

---

## 5. The "which observability tool" question

You're spinning up the first AI ops setup at a 25-engineer startup. Someone proposes buying Datadog LLM for $50K/year "to be ready for scale." What do you push back with?

<details>
<summary>Reveal answer</summary>

**Datadog LLM's value is in cross-team aggregation features you can't yet use.** At 25 engineers with one AI surface, Langfuse Pro + Sentry covers the same ground for ~$500/month. Buy the enterprise-grade tool when you have the enterprise-grade problem (multiple teams shipping AI to a shared surface, needing cross-team correlation).

The general principle from this chapter: **the cheapest *total* option is almost always the one that fits your column, not the most "scalable" one.**

*Revisit: [Ops — observability stack](./04-ops.md#observability-stack) and [Stack — what scales up](./stack.md#what-scales-up).*

</details>

---

## 6. The provider-onboarding question

How long does it take to onboard a new AI provider at each scale, and why does the time scale up so dramatically?

<details>
<summary>Reveal answer</summary>

- **Solo:** Sign up with a credit card. Same day.
- **Startup:** Add the API key to the gateway, run the eval suite on the new provider. Hours to a week.
- **Enterprise:** Vendor security review + DPIA + legal + procurement + contract negotiation. **3–9 months.**

The scaling is dramatic because what's being onboarded is fundamentally different at each column. Solo onboards a *tool*. Startup onboards a *backup model option*. Enterprise onboards a *vendor relationship* with contractual liability, data-flow obligations, and audit responsibilities — and those take months to negotiate regardless of how good the technology is.

*Revisit: [Team and Process — decision style](./01-team-and-process.md#decision-style) and [Workflow — provider change](./workflow.md#provider-change-eg-swap-primary-model).*

</details>

---

## 7. The "what stays the same" question

Across all three columns, what stays *exactly* the same?

<details>
<summary>Reveal answer</summary>

- The **core patterns**: streaming, tool use, RAG, agent loops, structured output. A solo dev and a bank write the same `tools=[...]` array.
- The **discipline of evals before shipping**. Only the tooling and cadence change.
- **Prompts in version control.** Even when there's also a registry on top.
- **Some** kill switch, **some** dashboard, **some** alert.
- The **list of failure modes**: quality drift, cost blowup, safety regression, provider degradation. These are universal — only response times differ.

What changes: who's allowed to make changes, how fast they ship, how much paperwork each change generates, and the blast radius the on-call is held accountable for.

*Revisit: [Comparison intro — what stays the same / what changes](./index.md#what-stays-the-same--what-changes).*

</details>

---

## 8. The career question

You're an AI engineer choosing between three offers: solo-style indie work, a 15-person AI startup, and a 5,000-engineer enterprise AI org. The chapter's stance is that none of these is "best" — what's the actual decision framework?

<details>
<summary>Reveal answer</summary>

**Pick by what column-skills you want to build next.** Each column teaches different muscles:

- **Solo:** end-to-end ownership, decision speed, learning the full AI stack at low stakes.
- **Startup:** generalist AI work, direct user contact, building the first eval / observability / kill-switch infrastructure from scratch.
- **Enterprise:** deep specialization, exposure to scale and regulatory problems most teams never face, mentorship from staff-level peers.

The most resilient AI careers tend to *cycle* through columns deliberately — picking up different skills at each stage — rather than climbing a ladder within one. Pick by skill gap, not by logo or comp band alone.

*Revisit: [Tradeoffs — when to pick which workflow](./06-tradeoffs.md#when-to-pick-which-workflow).*

</details>

---

## What's next

If most of your answers matched, you're ready for [Chapter 9: Decision Frameworks](/docs/decisions) — the recurring choices (build vs buy, prompt vs RAG vs fine-tune, agent vs chain, closed vs open) that apply *across* all three columns.

If a couple felt shaky, re-read the linked sections — they're each ~150 lines and 10 minutes of skimming.

---

→ Continue with [Chapter 9: Decision Frameworks](/docs/decisions).
