---
id: solo-ai-checkpoint
title: Chapter 5 Checkpoint
sidebar_position: 99
sidebar_label: Chapter checkpoint
description: Self-test for Chapter 5 — Solo / Indie AI. Twelve questions on mindset, stack, auth, payments, observability, launching, and graduation signals.
---

# Chapter 5 Checkpoint

> **In one line:** Twelve questions covering the whole solo AI workflow. If most land easily, you're ready for Chapter 6 (startup-scale AI). If not, the section to revisit is named in each answer.

:::tip[In plain English]
This isn't a graded quiz. It's a way to check that the major decisions — what to build, what stack, what guardrails, what to ship, when to graduate — are actually internalized rather than just read. If you have to look up an answer, that's the page to reread.
:::

## The questions

### 1. The single most important mindset shift

**Q:** What's the one default a solo AI builder should adopt in 2026 that most "ML engineering" advice would push them away from?

**A:** Frontier API by default. Don't fine-tune, don't self-host, don't build infra. Call Claude/GPT via the SDK and deviate only when cost, latency, or privacy forces you. → [01-mindset](./01-mindset.md)

### 2. Project shape

**Q:** Of the four project shapes that work solo, which is highest-risk for v0 and why?

**A:** Narrow agents (Shape 3). Tool loops can run away cost-wise, and debugging multi-step agent failures is hard at solo scale. Default to Shape 1 (single-prompt tool) for your first project. → [02-project-types](./02-project-types.md)

### 3. Planning artifacts

**Q:** What three artifacts should exist *before* any code is written?

**A:** A one-pager spec, a pre-mortem (5 failure modes + 5 guardrails), and a 20-row `eval.csv`. All produced in one afternoon. → [03-planning](./03-planning.md)

### 4. Stack picks

**Q:** What's the default 2026 solo AI stack for a chat-shaped project?

**A:** Next.js + Vercel AI SDK + TypeScript + Supabase (Postgres + auth + pgvector) + Vercel hosting + Langfuse for observability + Claude Sonnet 4.5 or GPT mid-tier as the model. → [04-stack-selection](./04-stack-selection.md)

### 5. Day-one guardrails

**Q:** Which two guardrails must be in place *before* your URL is shared with anyone?

**A:** (1) Auth on the LLM endpoint and per-user rate limit, (2) Hard monthly spend cap in the provider dashboard. Anonymous + uncapped + LLM is how $200+ bills happen overnight. → [05-env-setup](./05-env-setup.md), [07-auth](./07-auth.md)

### 6. The dev loop

**Q:** What does the inner loop of solo AI development look like?

**A:** Edit `prompts/main.md` → run `python eval.py` (or `tsx eval.ts`) → inspect failures → re-edit → commit → push → auto-deploy. Cycle time 2–5 minutes. Prompts live in markdown files, not multi-line strings in route handlers. → [06-development](./06-development.md)

### 7. Pricing shape

**Q:** What's the default solo-AI pricing structure and why not a free trial?

**A:** Free tier (with auth + daily limit) → flat-rate Indie ($5–$15/mo) → flat-rate Pro ($20–$50/mo). No trial — for low-ticket AI tools, a 14-day trial creates more support burden than subscribers; the free tier *is* the trial. → [08-payments](./08-payments.md)

### 8. Environment separation

**Q:** Why do production Stripe / email / LLM keys belong only in the Production environment, not Preview or Development?

**A:** Preview URLs are shareable; a tester clicking one shouldn't trigger a real charge or send a real email to prod users. Test keys (`sk_test_...`) for everything outside Production; live keys only in Production. → [09-deployment](./09-deployment.md)

### 9. Minimum observability

**Q:** What's the smallest observability setup that earns its keep?

**A:** Langfuse for every LLM call (with user ID, tokens, latency, cost) + Sentry for server errors + a daily cron emailing yesterday's total cost and top users. Twenty minutes of setup; repays itself the first time a user reports "this used to be better." → [10-observability](./10-observability.md)

### 10. Launch tactics

**Q:** What are the three channels that consistently work for a 2026 solo AI tool launch?

**A:** X (30-second silent screen recording, posted Tue/Wed/Thu morning ET), Show HN (with a back-story comment from you), and one niche subreddit *for your user's domain* (not `r/MachineLearning`). Plus a domain you can speak aloud. → [11-launching](./11-launching.md)

### 11. The agent kill switch

**Q:** What three caps must a narrow-agent route enforce to prevent runaway cost?

**A:** `maxSteps` (e.g. 4), per-session token budget (e.g. 20K), and size cap on tool outputs (e.g. truncate fetched pages to 8KB). All three, hard-coded, never removed. → [14-pitfalls](./14-pitfalls.md), [15-templates](./15-templates.md)

### 12. Graduation signals

**Q:** Which set of conditions indicates "real graduation moment" rather than normal solo turbulence?

**A:** Revenue approaching day-job income + consistent customer demand + bottleneck is your time, not user demand + 20+ hours/week and growing. That's the "incorporate, maybe hire" fork — not "grind harder solo." → [17-graduating](./17-graduating.md)

## How you scored

- **10–12 confident:** you've internalized the chapter. Start Chapter 6.
- **7–9:** revisit the pages flagged in any answer you stumbled on, then come back.
- **\&lt;7:** the chapter didn't stick yet. Re-read [01-mindset](./01-mindset.md), [04-stack-selection](./04-stack-selection.md), and [14-pitfalls](./14-pitfalls.md) — those three are the load-bearing pages.

## The applied check

Beyond the quiz, the real test is whether you can answer these about *your own current project*:

- One sentence: what does it do, for whom?
- Which of the four shapes is it?
- What's the cost per use? (Actual number, not "low.")
- Where's the demo video? (Recorded, not "I'll do it.")
- Which three launch channels?

If any of those is fuzzy, you're not ready to ship — go back to [planning](./03-planning.md).

## What's next

→ Continue to [Chapter 6: Startup AI Team](/docs/startup) where the same workflow scales to a team of 3–10, with the trade-offs that come with not being alone.
