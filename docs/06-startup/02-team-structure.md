---
id: startup-ai-team-structure
title: Team Structure for an AI Startup
sidebar_position: 3
sidebar_label: 2. Team Structure
description: The first AI hire's profile, the AI engineer + AI PM + designer triad, and when to add a dedicated platform/infra person.
---

# Team Structure for an AI Startup

> **In one line:** First AI hire is a senior generalist with shipped LLM features. The triad of AI engineer + AI-fluent PM + AI-fluent designer is what ships product. A platform person joins around 15–20 engineers.

:::tip[In plain English]
Most "AI hire" advice is written for FAANG labs and assumes ML PhDs, GPU clusters, and a research org. None of that applies at a startup. The actual job is *shipping LLM-powered product to paying customers* — which is a product-engineering job that happens to require comfort with non-determinism, evals, and prompt iteration.
:::

## The progression

| Stage             | Headcount | AI org shape                                                                |
|-------------------|-----------|-----------------------------------------------------------------------------|
| Solo / pre-PMF    | 1–4       | Founder owns AI. No dedicated hire.                                         |
| First AI hire     | 5–10      | One senior generalist. Owns every AI feature end-to-end.                    |
| Small AI team     | 10–25     | 2–4 AI engineers + AI-fluent PM + AI-fluent designer.                       |
| Platform emerges  | 25–50     | 4–8 AI engineers split by feature; 1–2 on a thin platform (gateway, evals).  |
| AI as a discipline| 50+       | Dedicated platform team. Feature teams ship on shared infra. See [Ch 7](/docs/enterprise). |

## The first AI hire profile

Hire for:

- **Has shipped an LLM feature to real (non-internal) users.** This is non-negotiable. There's a huge gap between "I built a demo" and "I shipped, evaled, and iterated against customer traces."
- **Talks about evals before they talk about models.** A candidate who opens with "we'd swap to Claude 4.7" is junior; one who opens with "what does your eval set look like?" is senior.
- **Comfortable with TypeScript *or* Python. Both is ideal.** Most startup AI work is TS-frontend + Python-worker.
- **Healthy skepticism of agent hype.** They've tried agent loops in production and have war stories.
- **Knows what "structured output," "prompt caching," and "tool calling" mean** without looking them up.
- **Strong product instincts.** They'll be making UX calls daily — confidence thresholds, when to regenerate, when to fall back.

Skip: ML PhDs without product shipping experience. They're the wrong fit for the first hire. They become the right fit at ~50+ headcount when training/fine-tuning becomes part of the job.

## The triad: AI engineer + AI PM + AI designer

The unit that actually ships AI features is three people:

- **AI engineer.** Owns prompts, retrieval, evals, models, latency, cost. Builds and ships.
- **AI-fluent PM.** Writes specs that include eval criteria, not just feature criteria. Knows what "p95 TTFT 800ms" means. Talks to customers weekly and feeds traces back to the team.
- **AI-fluent designer.** Owns the AI UX patterns: streaming, citations, confidence, regenerate, undo. Pairs with engineering during model iteration because the *output shape* changes how the UI works.

When the triad is real, features ship in 2 weeks. When one leg is missing — usually the designer — features ship that engineers love and customers don't.

## When to add a platform/infra person

Around 15–20 engineers, you start losing hours to shared pain that nobody owns:

- The gateway config is a mess; nobody knows who can edit it.
- Eval results are scattered across personal Braintrust projects.
- Three teams independently rebuild the same retrieval helper.
- The on-call runbook is "ask whoever shipped that feature."

That's the signal for a **first platform engineer** — someone who owns the shared LLM gateway, the eval platform tenancy, the prompt library, and the observability dashboards. Their job is *making feature teams faster*, not gatekeeping. Hire too early (at 5 engineers) and they invent work; hire too late (at 30) and you've eaten a lot of avoidable pain.

## What "ML engineer" means differently

You'll see "ML engineer" on resumes. At a startup the distinction usually is:

- **AI engineer:** ships LLM-powered features using third-party APIs. Owns prompts, evals, retrieval, tools.
- **ML engineer:** owns models that need training or fine-tuning. Owns data pipelines for ML. Operates self-hosted inference.

In 2026, most early-stage AI work is AI engineering, not ML engineering. The first 3 hires should all be AI engineers. ML engineering becomes relevant when you have a specific task that's cheaper or higher-quality to fine-tune than to prompt — usually 50+ headcount, real volume, and a domain where data is your moat.

:::note[Worked example: the failed senior hire]
A 12-person AI startup hires a "Staff ML Engineer" from a large lab. Strong PhD, papers, the works. Three months in: the engineer has written zero shipped code, is debating retrieval architecture in long Notion docs, and keeps suggesting they fine-tune a custom embedding model "to differentiate." Meanwhile a junior AI engineer ships three customer-visible features using the boring OpenAI embeddings.

The retro reveals the misfit: the company needed a product-engineer who's fluent with LLMs, not a researcher who's now without a research org. The hire moves on amicably.

The lesson: at startup scale, hire for *shipping*, not credentials. The right hire's resume might be "shipped 3 LLM features at a Series B that real customers paid for," not "5 NeurIPS papers."
:::

:::info[Highlight: roles are titles, not jobs]
At every size below 50, the actual work doesn't fit cleanly inside role boundaries. The "AI engineer" will write SQL. The "platform engineer" will ship a customer-visible feature when on-call is quiet. The PM will hand-label eval cases for a week before launch. Treat the org chart as a guide to ownership and rotation, not as a fence.
:::

## Compensation expectations (US, 2026)

These numbers shift fast but are the ballpark you should plan for:

| Role                              | Base salary       | Equity (early)            |
|-----------------------------------|-------------------|---------------------------|
| First AI engineer (senior+)       | $200K–$280K       | 0.3%–1.5%                 |
| Second/third AI engineer (mid-sr) | $170K–$240K       | 0.1%–0.5%                 |
| AI-fluent PM (senior)             | $180K–$240K       | 0.2%–0.8%                 |
| AI-fluent designer (senior)       | $160K–$220K       | 0.1%–0.5%                 |
| First platform engineer           | $190K–$260K       | 0.2%–0.7%                 |
| ML engineer (post-PMF, fine-tune) | $220K–$320K       | 0.2%–0.8%                 |

Top-of-band offers usually require prior shipped AI product at a known startup, or 5+ years of relevant senior engineering experience.

## Where to source candidates

- **Existing network first.** Senior AI engineers are mostly hired through engineer-to-engineer referrals in 2026. The "open roles page" gets you noise.
- **AI-focused communities:** Latent Space, AI Engineer Summit, MLOps Community, the Anthropic / OpenAI / Vercel Discords.
- **Product-engineering newsletters:** Refer to "Pragmatic Engineer," "Towards Data Science alumni who shipped products."
- **Avoid generic LinkedIn job posts as the primary channel.** You'll spend weeks filtering ML resumes that don't fit the AI-engineer profile.

## Interview signal at this scale

The take-home or live exercise should look like the actual job:

- "Here's a small dataset of 20 customer support tickets. Build a tagging prompt; we'll evaluate it on a held-out set of 10."
- "Here's a flaky tool-use loop. Debug it; show me what eval cases you'd add."
- "Here's a feature that costs $0.18 per answer; the budget is $0.05. What three things would you try first?"

Not: a LeetCode hard, an ML theory whiteboard, a system-design interview for a hypothetical 100M-user app.

## Common mistakes

:::caution[Where people commonly trip up]
- **Hiring a Head of AI before any AI ICs.** A "VP of AI" with no team to lead invents strategy decks for ten months. Hire the first 2 AI engineers, then a manager when span-of-control demands it.
- **Treating the AI engineer as a backend engineer with a prompt file.** They need to own the eval loop, the model swap calls, the cost dashboards — not just the code path. Give them the dashboards, the bill access, and the customer trace tooling on day one.
- **Hiring an "AI consultant" instead of a full-time engineer.** Consultants ship demos. Customers need iteration. A 6-month consulting engagement leaves you with code nobody on the team can maintain.
- **Forgetting the designer.** The startup that pairs a designer with the AI engineer ships streaming UIs with citations and confidence indicators. The startup without one ships ChatGPT clones. Customers can tell.
- **Treating ML and AI engineers as interchangeable.** They overlap, but the day-to-day work and skills differ. Hire for what you actually need this quarter.
- **Recycling FAANG ML interview loops.** A 4-round system design + ML theory + ML coding loop selects for the wrong skills. Replace with applied exercises that mirror the actual job.
:::

## What's next

→ Continue to [Quarterly Planning](./03-planning.md) where we cover roadmapping, feature sequencing, and risk-tiering AI features by failure cost.
