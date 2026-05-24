---
id: when-to-buy-agent-platform
title: When to buy an agent platform vs build your own runtime
sidebar_position: 19
description: Build your own agent runtime vs use Cognition / Crew / Sierra / SuperAGI. The rule and the conditions that flip it.
---

# When to buy an agent platform vs build your own runtime

> **In one line:** Build a raw agent loop first; buy an agent platform only when you've felt the specific operational pain it solves and your differentiator isn't the runtime itself.

:::tip[In plain English]
The agent-platform pitch sounds great: state management, durability, retries, observability, human-in-the-loop, audit logs. In reality, your first agent doesn't need any of that — it needs to work. You'll know you need a platform when you're hand-rolling all of those features and they're starting to dominate your code. Until then, a raw SDK loop with a job runner is enough.
:::

## What an "agent platform" actually gives you

Platforms like Sierra (customer support), Cognition (Devin / coding), Crew (multi-agent orchestration), and SuperAGI offer some combination of:

- **Durable execution.** Agent runs that survive crashes, redeploys, and timeouts.
- **State management.** Conversation memory, agent state, checkpointing.
- **Tool registry.** A way to register and version tools the agent can call.
- **Retries with backoff.** Built-in for flaky upstream APIs.
- **Human-in-the-loop.** Pause for approval, escalation flows, agent-to-human handoff.
- **Observability.** Per-step traces, cost attribution, replay.
- **Multi-agent orchestration.** Coordinate multiple agents on a task.
- **Domain templates.** Pre-built agents for support, coding, research.

Each one is genuinely valuable — *if you need it.*

## When to build (the default for most teams)

- You have ≤2 agents in production.
- Workflows are simple — a single LLM in a loop with 3–10 tools.
- Average run completes in under 30 seconds.
- You're not yet doing human-in-the-loop or pause/resume.
- You have a job runner (Inngest / Trigger.dev) handling durability already.

In this regime, a 100-line agent loop on top of your existing job infrastructure is the right answer.

## When to buy

- You're running **10+ distinct agents** and need a registry, version control, deployment story.
- You need **durable runs that span hours or days** (long-running research, multi-day workflows).
- You need **human-in-the-loop** as a first-class feature — pause, route to a human, resume with feedback.
- You need **compliance-grade audit logs** of every agent action (regulated industries).
- You need **multi-agent orchestration** that genuinely benefits from a coordination layer.
- The platform's domain (e.g., support automation in Sierra) is *exactly* your problem and you'd rather buy the 90% solution than build the 100%.

## When to use a vertical platform vs general

- **Vertical platforms** (Sierra for support, Cognition for coding) include opinionated workflow, domain prompts, integrations. Pick these if your problem matches the vertical and you're OK with their opinions.
- **General platforms** (Crew, LangGraph Cloud, custom on Inngest) give you the runtime without the domain — pick these when your workflow is unique and you just need infrastructure.

## The build-first signals

Before you adopt a platform, you should have:

- A working agent in raw code.
- A clear list of what the raw version doesn't give you.
- A measurement of how much your team is spending on building those missing pieces.
- A vendor that solves >70% of your missing pieces (not all of them — that's rare).

Without these, "let's adopt an agent platform" is shopping, not engineering.

## Costs of adopting a platform

- **Vendor lock-in.** Agents written for one platform are hard to port.
- **Less control.** When you hit a weird edge case, you're stuck with the platform's mental model.
- **Cost.** Per-agent or per-execution pricing adds up at scale.
- **Yet another upgrade cycle.** Platform versions change; your agents may break.
- **Observability gap.** The platform's traces may not integrate with your existing observability stack.

## Costs of building your own

- **Reinventing wheels.** Durable execution is a known hard problem; you might do it badly.
- **Ongoing maintenance.** Every new "this agent needs to pause for approval" turns into a project.
- **No domain expertise.** A vertical platform may have learned things from running 10,000 support agents that you'd discover slowly.

## When this rule doesn't apply

- **Your moat IS the agent runtime.** If you're building a horizontal agent product, you build the runtime.
- **You're at hyperscale.** Per-execution platform pricing doesn't work at 10M agent runs/month.
- **A specific platform feature is irreplaceable.** Sierra's pre-built support workflow may be cheaper than 6 months of build, even at month 2.
- **You have zero ML/agent expertise on the team and need to ship now.** A managed platform de-risks shipping at the cost of long-term flexibility.

## How to apply it

When evaluating an agent platform, ask:

1. **What's the raw-code version of this?** Build it as a v0.
2. **What specifically does the platform give us that's hard to replicate?** Name 3 features.
3. **What's the lock-in?** Can we leave in a quarter if it doesn't work?
4. **What does pricing look like at 10x scale?** Does the unit economics still work?
5. **Who on our team owns this in 12 months?** Platforms aren't free — they're a long-term relationship.

## Common mistakes

- **Buying the platform before having an agent.** You don't yet know what you need from a platform.
- **Building a platform when you need an agent.** Reinventing Inngest + state management because you wanted to "control the runtime."
- **Multi-platform sprawl.** Different teams adopt different agent platforms; nothing is shared.
- **Treating the platform as a substitute for evals.** A platform with great observability still doesn't tell you whether the agent is *good*. That's evals.

:::note[Worked example: the raw agent that ran in production for a year]
A SaaS team builds a single customer-support agent: an LLM in a loop with 6 tools (search docs, look up account, escalate, close ticket, send response, query order status). They run it on Inngest for durability. State is a Postgres table. Observability is Langfuse. Total code: ~400 lines.

It runs for a year handling 70% of tickets. They add a second agent for billing questions. Still all raw code.

In year 2, they need: 4 more agents, a way for engineers across teams to register new tools without coordinating, audit logs for SOC 2, and human-in-the-loop for refunds. The build cost for these features is real — they estimate 2 engineer-quarters.

They evaluate Sierra and a custom build on LangGraph Cloud. Sierra wins because its support-agent domain matches their use case and includes the audit + HITL features they need. Migration takes 6 weeks; the existing raw agents continue running during migration.

The lesson: the raw version got them to year 2. The platform earned its cost only once the problem outgrew the raw approach. Buying on day one would have over-paid for a year; building on day 2 would have been undifferentiated infra work.
:::

---

→ Next: [Hiring constraint](./14-hiring-constraint.md).
