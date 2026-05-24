---
id: startup-ai-checkpoint
title: Chapter 6 Checkpoint
sidebar_position: 99
sidebar_label: 18. Checkpoint
description: Self-test for Chapter 6 — Startup AI Workflow. Verify the core ideas stuck before moving on to enterprise.
---

# Chapter 6 Checkpoint

> **In one line:** Before moving on to enterprise AI, make sure the 15 core ideas of the startup AI workflow are sticky enough to apply on a real team.

:::tip[How to use this page]
Answer each prompt out loud, in your own words, *before* clicking the linked page. If you can't answer in 1–2 sentences, revisit the linked page. The goal isn't perfect recall — it's "I could explain this to a teammate over coffee."
:::

## Self-test

### 1. The mindset

**Q:** Summarize the startup AI mindset in one sentence. What are the two failure modes it sits between?

→ See [The Startup AI Mindset](./01-mindset.md).

### 2. The first AI hire

**Q:** What three things would you look for in the first AI hire? What would you specifically *not* hire for at this stage?

→ See [Team Structure](./02-team-structure.md).

### 3. Risk tiering

**Q:** What are the four risk tiers, and what would you do differently for a Tier-0 feature vs a Tier-3 feature?

→ See [Quarterly Planning](./03-planning.md).

### 4. AI UX patterns

**Q:** Name at least four of the seven AI UX patterns. Why does the designer need to be in the iteration loop with engineering?

→ See [AI Product Design](./04-design.md).

### 5. The reference architecture

**Q:** Sketch the 2026 AI-startup reference architecture in 5–6 components. What does the LLM gateway buy you?

→ See [Architecture](./05-architecture.md).

### 6. Prompts as code

**Q:** Why must prompts live in git (not Notion)? What does the `packages/prompts/` pattern enable?

→ See [Environment Setup](./06-env-setup.md).

### 7. The 2-week playbook

**Q:** Walk through the 2-week feature playbook. What ships at end of week 1? End of week 2?

→ See [Development Loop](./07-development.md).

### 8. The four test layers

**Q:** Name the four test layers and what each catches. Where does LLM-as-judge fit?

→ See [Testing Strategy](./08-testing.md).

### 9. CI for AI

**Q:** What is the pipeline shape (in order)? Why does eval-gating in CI replace a lot of human process?

→ See [CI/CD](./09-cicd.md).

### 10. The kill switch

**Q:** What three properties does every AI feature flag have? When would you flip the kill switch?

→ See [Deployment](./10-deployment.md).

### 11. The quality / cost / latency triple

**Q:** Why must all three be reported on every dashboard? What goes wrong when you optimize one in isolation?

→ See [Observability](./11-observability.md).

### 12. AI-specific threats

**Q:** Name three AI-specific threats (not general web threats). What does "least-privilege tool execution" mean in practice?

→ See [Security & Compliance](./12-security.md).

### 13. The maintenance rhythm

**Q:** What rituals happen weekly, monthly, and quarterly? What's the weekly eval review and why does it matter?

→ See [Maintenance](./13-maintenance.md).

### 14. The cost shape

**Q:** Roughly how much does a 20-person AI-first startup spend on infrastructure each month? Which line item dominates?

→ See [Cost Breakdown](./14-cost-breakdown.md).

### 15. The daily rhythm

**Q:** Roughly how does an AI engineer's day split between deep code and AI-specific rituals? What surprises web engineers about the rhythm?

→ See [Day in the Life](./15-day-in-life.md).

### 16. The eight pitfalls

**Q:** Name at least five of the eight common pitfalls. Which one is the "single biggest"?

→ See [Common Pitfalls](./16-pitfalls.md).

### 17. Outgrowing the stack

**Q:** What 2–3 signals indicate you've outgrown startup AI patterns? What stays the same when you graduate to enterprise?

→ See [Outgrowing the Stack](./17-outgrowing.md).

## Bonus: explain it to a coworker

A useful test for whether the material stuck — can you, in 3–5 minutes, explain the following to a non-AI engineer joining the team next week?

- What an LLM gateway does and why we have two providers.
- Why every prompt change runs the eval suite in CI.
- What a kill switch is and when we'd flip it.
- How a Tier-0 feature differs from a Tier-3 feature in process.
- What we look at on the cost dashboard each week.

If yes, you're ready to apply this in practice. If not, re-skim the linked pages for the gaps.

## Bonus: the spot-check questions for an interview

If you're interviewing at (or hiring for) an AI startup, you can probe the team's maturity with these:

| Question                                                | Mature answer                                                  |
|---------------------------------------------------------|----------------------------------------------------------------|
| "How do you know if a prompt change regressed quality?" | "Eval suite runs in CI on every PR; failures block merge."     |
| "Show me your cost dashboard, broken down per tenant."   | They open it without flinching.                                |
| "What's the kill switch for your largest AI feature?"   | They can flip it in PostHog/Statsig in under a minute.         |
| "When did you last drill provider failover?"            | "This month" or "last month."                                  |
| "Which model is feature X on, and when was it pinned?"  | They know off the top of their head.                           |
| "What's the bottom-20 trace from last week?"            | They've already looked at it.                                  |

A team that fails 3+ of these is operating at solo-AI maturity at startup scale — a major risk signal for both customers and prospective hires.

## The single most important takeaway

If you remember nothing else from this chapter, remember this:

> **Eval discipline is the single biggest quality lever at startup scale.** Every prompt change runs the eval suite before merge. A regression on any case blocks merge. Every new feature ships with its eval suite already populated. Real production failures become new eval cases within the same week.
>
> This one rule replaces dozens of process workarounds and is the difference between an AI startup that ships confidently and one that ships fast then spends six months firefighting regressions.

If you've internalized that, the rest of the chapter is mostly tactical detail in service of it.

## What's next

→ Continue to [Chapter 7: Enterprise AI](/docs/enterprise) for a contrast — same problems, very different solutions at 100+ engineers, regulated industries, and central platform teams.
