---
id: indie-ai-workflow
title: 5. Solo / Indie AI — Overview
sidebar_position: 1
sidebar_label: Solo intro
description: One-person AI builders, side projects, demos, indie apps. Frontier APIs, free tiers, minimal infra, maximum shipping speed.
---

# Part 5: The Solo / Indie AI Workflow

*For the one-person builder shipping AI side projects, demos, and indie apps in 2026.*

> **In one line:** Frontier API by default, free tiers everywhere, ship in days. Skip every "real engineering" practice that doesn't earn its keep at your scale.

:::tip[In plain English]
**Who this chapter is for:** You, alone, on a laptop, with a Claude or OpenAI API key. No team. No infra. No users yet. You want to ship an AI thing this weekend that real strangers can use on Monday.

**The whole philosophy of solo AI in 2026:** Don't fine-tune. Don't self-host a model. Don't build an eval platform. Don't write a custom RAG framework. The frontier API is good enough, the managed-everything stack is good enough, and your time is the only resource that doesn't scale. Spend it on the *product*.

**What "shipping AI" actually means here:** Someone you've never met opens a URL, types something, gets an LLM-generated response, and the bill at the end of the month doesn't make you cry. That's the whole game at this stage.

**The 2026 solo AI stack at a glance:**
- **Model:** Claude Sonnet 4.5 or GPT-5 mini, called via the official SDK
- **App framework:** Next.js + Vercel AI SDK (TS) or FastAPI + Modal (Python)
- **DB + auth:** Supabase (Postgres + pgvector + auth in one)
- **Hosting:** Vercel free tier or Modal pay-per-invocation
- **Observability:** Langfuse free tier
- **Payments (when you need it):** Stripe Checkout or Polar
- **Total monthly cost** at hobby scale: $0–$50

**Mental model:** A solo AI project is like running a food truck, not opening a restaurant. You don't need a sommelier, a maître d', a 60-page menu, or a Michelin star. You need one dish that's good enough that strangers will pay for it, served from a vehicle you can drive yourself.

**If you only remember one thing:** The best solo AI stack is the one that gets you from "idea" to "live URL with auth and a cost cap" by Sunday night. Everything else is procrastination dressed up as engineering.
:::

## How this chapter is organized

Each page focuses on one slice of the solo AI workflow. Read them in order the first time; jump back to any one when you hit that phase on a real project.

The pages are deliberately short and opinionated. There's a whole industry telling you to fine-tune your own 7B model on synthetic data. Ignore it. You're building a thing one person uses on a Friday afternoon.

### Pages in this chapter

1. [The Solo AI Builder Mindset](./01-mindset.md) — Why "real ML engineering" advice usually destroys solo AI projects.
2. [What Kinds of AI Side Projects Actually Work Solo](./02-project-types.md) — Single-prompt tools, niche RAG, narrow agents, AI-augmented existing tools.
3. [Planning a Solo AI Project](./03-planning.md) — The pre-mortem, the one-pager spec, and eval criteria *before* you write code.
4. [Stack Selection](./04-stack-selection.md) — The two default 2026 stacks (TypeScript and Python) and when to pick which.
5. [Environment Setup](./05-env-setup.md) — Dotfiles, env vars, secrets, and the seven free-tier accounts to open on day one.
6. [The Development Loop](./06-development.md) — Prompt iteration in a Jupyter/REPL, fast eval scripts, the "edit prompt, re-run eval, commit" rhythm.
7. [Auth](./07-auth.md) — Clerk or Supabase auth, per-user rate limits, and why anonymous LLM endpoints get abused within hours.
8. [Payments](./08-payments.md) — Stripe Checkout, Polar, Lemon Squeezy, and usage-based pricing for AI tools.
9. [Deployment](./09-deployment.md) — Vercel, Modal, Render, Fly; environment promotion; preview deploys.
10. [Observability](./10-observability.md) — Langfuse free tier, the minimum useful traces, and a cost dashboard that pages you.
11. [Launching](./11-launching.md) — Distribution channels for AI tools in 2026 and the launch-tweet template.
12. [Maintenance](./12-maintenance.md) — Model deprecations, provider price changes, and eval drift on a 15-minute weekly cadence.
13. [Realistic Time Investment](./13-time-investment.md) — Weekend MVP, month to 100 users, three months to $100 MRR.
14. [Common Pitfalls](./14-pitfalls.md) — The ten things that kill solo AI projects.
15. [Starter Templates](./15-templates.md) — Streaming chat, RAG over docs, structured-output classifier, simple agent.
16. [Sample Project: AI Meeting-Notes Summarizer](./16-sample-project.md) — End-to-end walkthrough with code, costs, deploy, and first users.
17. [Graduating Beyond Solo](./17-graduating.md) — When to bring on a co-founder, when to convert to a real company, when to keep it indie.
18. [Chapter 5 Checkpoint](./18-checkpoint.md) — Self-test before moving on.

---

→ Start with [The Solo AI Builder Mindset](./01-mindset.md).

When you finish all 18 pages, move on to [Chapter 6: Startup AI Team](/docs/startup).
