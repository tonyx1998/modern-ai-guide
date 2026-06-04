---
id: startup-ai-workflow
title: 10. Startup AI Team — Overview
sidebar_position: 1
sidebar_label: Startup intro
description: 5–50 person AI-first startups. Real customers, real evals, real bills. Managed everything, eval-driven iteration, AI as a product surface.
---

# Part 10: The Startup AI Team Workflow (5–50 People)

*For AI-first startups shipping LLM-powered product to paying customers.*

> **In one line:** You have customers, evals, and a CFO who notices the bill. The work shifts from "ship the demo" to "ship the demo, then make it reliable enough to charge for — every week, without regressing."

:::tip[In plain English]
**The leap from solo to AI startup:** Solo, a bad LLM answer is an embarrassment. At a startup with paying customers, a bad LLM answer can churn an account, leak data, or hallucinate a legal commitment. Everything in this chapter exists because *real users will notice your mistakes*, and *the bill at the end of the month is now somebody's KPI*.

**What changes once you have customers:**
- You can't ship a prompt change without an eval suite saying it's safe
- Cost per active user is a real number somebody tracks
- "We had an outage" now includes "the model was wrong for 4 hours"
- Compliance buyers want to know what you do with their data
- You need a kill switch for every AI feature, tested monthly

**The AI-first startup philosophy:** Buy the model, buy the gateway, buy the observability, buy the eval platform. Own the prompts, the retrieval, the eval cases, the UX. Your moat is *data, taste, and speed of iteration* — not infrastructure.

**The 2026 AI-startup stack at a glance:**
- **Models:** 2 providers (Anthropic + OpenAI, or one + Bedrock) via a gateway
- **Gateway:** Portkey, OpenRouter, or LiteLLM
- **Vector:** pgvector inside Supabase/Neon → Pinecone/Turbopuffer when you outgrow it
- **Evals + obs:** Braintrust or Langfuse (pick one, not both)
- **Orchestration:** Inngest or Trigger.dev once flows exceed ~30s
- **App:** Next.js + Vercel for frontend; Modal/Render/Fly for Python workers
- **Total monthly stack cost at ~20 people:** $50K–$200K (provider $ is the largest line)

**Mental model:** Solo AI is cooking at home with a frontier API. AI startup is running a small restaurant *where the chef is sometimes wrong*. You need a way to taste every dish (evals), a way to know which table is over-ordering (per-tenant cost), and a way to apologize gracefully when the kitchen catches fire (kill switches + fallbacks).

**If you only remember one thing:** Eval discipline beats model choice. The startups that win at this stage ship eval-gated prompt changes daily; the ones that don't ship "vibes-driven" releases and silently regress.
:::

## How this chapter is organized

Each page covers one slice of the AI-startup workflow. Read in order the first time; revisit any page later when you hit that phase on a real feature.

The pages are short, opinionated, and full of real tool names. The whole AI ecosystem will tell you to adopt their framework, their orchestrator, their eval platform. Most of it is wrong for a 20-person team. This chapter is the filter.

### Pages in this chapter

1. [The Startup AI Mindset](./01-mindset.md) — Customer evidence beats internal opinion. Eval-driven, ship in weeks.
2. [Team Structure](./02-team-structure.md) — First AI hire, the AI eng + AI PM + design triad, when to add platform.
3. [Quarterly Planning](./03-planning.md) — Sequencing AI features. Risk-tiering by failure cost.
4. [AI Product Design](./04-design.md) — Streaming, citations, confidence, undo, regenerate. Designer-engineer pairing.
5. [Architecture](./05-architecture.md) — Monolith + LLM gateway + pgvector + Inngest + Langfuse. When to split.
6. [Environment Setup](./06-env-setup.md) — Shared prompt library, eval scripts in CI, gateway config, secrets.
7. [Development Loop](./07-development.md) — Prompt review, eval gating, preview deploys per branch.
8. [Testing Strategy](./08-testing.md) — Unit + integration + eval suite + adversarial layers. LLM-as-judge in CI.
9. [CI/CD](./09-cicd.md) — lint → test → eval → preview → cohort deploy.
10. [Deployment](./10-deployment.md) — Feature flags, cohort rollouts, kill switches, deploy windows.
11. [Observability](./11-observability.md) — Langfuse/Braintrust + Datadog. Quality vs cost vs latency triple.
12. [Security & Compliance](./12-security.md) — Prompt injection, PII scrubbing, SOC 2, DPAs, opt-out.
13. [Maintenance](./13-maintenance.md) — Weekly eval review, quarterly model audits, deprecating features.
14. [Cost Breakdown](./14-cost-breakdown.md) — Realistic line items for a 20-person AI startup.
15. [Day in the Life](./15-day-in-life.md) — A worked day for the AI engineer.
16. [Common Pitfalls](./16-pitfalls.md) — Launching without evals, agent runaway, fine-tuning too early.
17. [Outgrowing the Stack](./17-outgrowing.md) — Signals you've outgrown startup and need enterprise governance.
18. [Chapter 10 Checkpoint](./18-checkpoint.md) — Self-test before moving on.

---

→ Start with [The Startup AI Mindset](./01-mindset.md).

When you finish all 18 pages, move on to [Chapter 11: Enterprise AI](/docs/enterprise).
