---
id: decision-frameworks
title: 9. Decisions — Overview
sidebar_position: 1
sidebar_label: Decisions intro
description: The recurring choices in AI engineering — prompt vs RAG vs fine-tune, agent vs chain, open vs closed, build vs buy. Decision rules, not opinions.
---

# Part 9: Decision Frameworks

*The recurring "should we…" debates, with decision rules instead of vibes.*

> **In one line:** Most AI engineering decisions are not novel; they're variations on twenty recurring questions. Internalize the rules and you'll spend debate time on the actually-hard parts.

:::tip[In plain English]
Every AI feature kicks off the same arguments. "Should this be an agent?" "Do we need RAG?" "Open or closed model?" "Build it ourselves or use LangChain?" In 2026, almost none of these are open questions — there are good default answers and a small number of conditions where the default flips. This chapter gives you the defaults, the flip conditions, and the language to talk about them.
:::

## Why this chapter exists

Most AI projects don't fail on the model or the prompt. They fail because someone picked the wrong shape for the system — a multi-agent setup when a chain would do, fine-tuning when prompting was fine, a self-hosted LLM when the API was cheaper, an "agent platform" when raw SDK plus a function would have shipped in a week.

These are recurring decisions. They show up in the first week of a project, again at the first scale wall, and again every time the team turns over. The cost of getting them wrong is months of wasted engineering and, more often, a quietly cancelled launch.

This chapter is a compressed playbook. Each page is a single decision rule: when does it apply, what's the default, what's the override.

:::info[Jargon used throughout this chapter]
- **Boring AI** — choosing the most-deployed proven option (e.g., GPT-4.1, Claude Sonnet, OpenAI Embeddings) over the leaderboard winner. The AI version of "boring technology."
- **Reversibility ladder** — the ranked cost of unwinding an AI choice. Prompt changes are cheap; self-host migrations are not.
- **Eval bar** — the minimum measured quality (accuracy, helpfulness, refusal rate) a feature has to hit before shipping or before a model swap.
- **Gateway tax** — the latency and cost of routing every LLM call through a model-routing service (Portkey, OpenRouter, LiteLLM).
- **Agent runtime** — the long-running execution layer that owns an agent's loop, state, tool use, retries, and observability.
- **Strangler ramp** — feature-flagged rollout from 1% → 100% of traffic, with shadow comparison and a kill switch. The only safe AI cutover.
- **Asymmetric upside/downside** — a feature where the best plausible outcome is far larger (in revenue, retention, time saved) than the worst plausible outcome. AI features are often asymmetric.
- **Kill switch** — a single config flag that disables an AI feature or routes it to a deterministic fallback. Every production AI feature must have one.
:::

:::info[Highlight: the single most important principle]
**Boring AI beats exciting AI in almost every situation that matters.** The frontier model on the LMArena leaderboard last week is exciting; GPT-4.1 and Claude Sonnet are boring. Boring means: documented failure modes, ecosystem-wide observability, predictable cost, a stable SDK that won't break in three months. Boring is what your future self maintaining the system actually wants.

When two AI options look roughly equal, pick the one with more production deployment hours behind it, not the one with a higher benchmark number.
:::

## How to read this chapter

Each page is short and prescriptive. The structure is identical:

1. **One-line rule.** What you'd put on a sticky note.
2. **Plain-English version.** What it means without jargon.
3. **The default.** What 80% of teams should do.
4. **When it doesn't apply.** The 20% override cases — with the evidence you'd need.
5. **Real-world examples.** What this looks like in production code and team decisions.
6. **Next.** A pointer to the next rule.

Use them as a check before you commit to an architecture: *did I actually justify this against the rule, or did I default to the trendy answer?*

## The rules, in the order they bite

### Foundational mindset

1. [Decisions overview](./index.md) — this page.
2. [Pick boring models](./01-boring-models.md) — the most-deployed model that passes evals.
3. [The reversibility ladder](./02-reversibility.md) — optimize for the cheap-to-undo rungs.
4. [Team-size heuristic](./03-team-size-heuristic.md) — what AI tooling each team size can support.

### The classic architecture forks

5. [Prompt vs RAG vs fine-tune](./prompt-vs-rag-vs-finetune.md) — try in this exact order.
6. [Agent vs chain vs multi-agent](./agent-vs-chain.md) — chain by default.
7. [Closed vs open-weight model](./closed-vs-open.md) — when each wins.
8. [Build vs buy](./build-vs-buy.md) — the buy-leaning defaults for every layer.
9. [When *not* to use AI](./when-not-to-use.md) — the question that saves quarters.

### Engineering investment

10. [Eval investment](./04-eval-investment.md) — what fraction of eng time to spend on evals.
11. [Cost of inaction](./05-cost-of-inaction.md) — the cost of NOT shipping an AI feature.
12. [When to rebuild](./06-when-to-rebuild.md) — signals for a full rebuild vs incremental.
13. [Single vs multi-provider](./07-single-vs-multi-provider.md) — when the gateway tax is worth it.
14. [Sync vs async](./08-sync-vs-async.md) — streaming chat vs background workflow.
15. [On-prem vs cloud](./09-on-prem-vs-cloud.md) — when self-hosted earns its cost.
16. [Framework vs raw SDK](./10-framework-vs-raw-sdk.md) — build a raw v0 first.
17. [Prompt engineering vs fine-tuning](./11-prompt-engineering-vs-fine-tuning.md) — the explicit escalation rule.
17b. [Fine-tuning — the decision walkthrough](./fine-tuning-walkthrough.md) — once you've decided to fine-tune, SFT vs DPO vs RFT with worked numbers.

### Risk, planning, and people

18. [What would hurt](./12-what-would-hurt.md) — the worst-plausible-failure pre-mortem.
19. [When to buy an agent platform](./13-when-to-buy-agent-platform.md) — build vs Cognition / Crew / Sierra.
20. [Hiring constraint](./14-hiring-constraint.md) — what "AI engineer" actually means in 2026.

### Putting it together

21. [The 1-page checklist](./15-checklist.md) — model, RAG, agent, eval bar, kill switch, cost cap, owner.
22. [When to override these rules](./16-overriding.md) — when intuition beats process.

### Checkpoint

99. [Chapter 9 checkpoint](./17-checkpoint.md) — a short self-test.

---

→ Start with [Pick boring models](./01-boring-models.md).
