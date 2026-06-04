---
id: startup-ai-outgrowing
title: When You're Outgrowing the Startup Stack
sidebar_position: 18
sidebar_label: 17. Outgrowing
description: Signals you've outgrown 5-50 person AI startup patterns and need enterprise governance. The migration playbook.
---

# When You're Outgrowing the Startup Stack

> **In one line:** When your AI org passes 50 people, regulated customers demand audited deployments, or three teams independently rebuild the same eval infra — the startup stack is bending. Time to graduate to enterprise patterns.

:::tip[In plain English]
The startup AI workflow has natural limits. Patterns that worked at 20 engineers start to creak at 60: ad-hoc prompt review across teams becomes blocking, "we use Portkey" stops being enough governance for a regulated customer, and the absence of a central eval registry means three teams answer "what's our SOC 2 evidence for prompt review" three different ways. Recognizing the signals early lets you transition deliberately instead of in crisis.
:::

## The seven signals

1. **AI org > 50 people.** Communication overhead dominates. Decisions take days, not hours. Multiple teams collide on prompt patterns.

2. **A regulated customer (healthcare, finance, gov) demands audited AI deployments.** They need model-risk documentation, prompt-change audit trails, named approvers for every Tier-0 feature. The "we use Vanta" answer no longer satisfies their security team.

3. **Three teams have independently rebuilt the same eval infrastructure.** Each has their own way of running suites, sampling prod traces, scoring. You can't compare scores across teams. There's no shared library of attack prompts.

4. **The prompt library has fragmented.** Half of prompts live in `packages/prompts/`, half in random utility files, some in YAML files in a "legacy" folder. Nobody can answer "show me every prompt that touches PII."

5. **The provider bill is approaching $500K/month.** Optimizations matter at scale that justify a dedicated platform engineer (or team) just on cost.

6. **An incident review surfaces "we have no model risk register."** A bad output to a regulated customer escalates to legal; legal asks "where's the documented review of this model's known failure modes." You have none.

7. **You're considering self-hosting open models.** Driven by cost, latency, residency, or fine-tuning. Doing this in a hand-rolled way at 50+ engineers leads to chaos. It's an MLOps platform decision.

When 2–3 of these signals are flashing red, the transition has started whether you've named it or not.

## What "enterprise patterns" actually adds

| Layer                        | Startup pattern                          | Enterprise pattern                                          |
|------------------------------|------------------------------------------|-------------------------------------------------------------|
| Eval platform                | Per-team Braintrust/Langfuse projects    | Central eval registry; shared attack sets; cross-team scores |
| Prompt management            | Files in repo                            | Central prompt registry with approval workflows              |
| Model risk                   | Implicit                                 | Model risk register; documented review per model              |
| Deployment                   | Cohort rollout via feature flags         | Cohort rollout + named approvers + audit log per Tier-0 deploy |
| Procurement of AI tools      | Engineer signs up with a credit card     | Security + legal + procurement review (3–9 months for new vendors) |
| Self-hosted models           | Don't do it                              | MLOps platform: SageMaker, Vertex AI Pipelines, Databricks    |
| Data residency               | One region                               | Multi-region with per-customer routing                       |
| Provider relationships       | Click-through ToS                        | Enterprise contracts with zero-retention, custom DPAs        |

The full enterprise pattern is the subject of [Chapter 11](/docs/enterprise). The point here: you don't adopt all of it at once.

## The migration playbook

Adopt enterprise patterns *surgically* in response to specific signals — not as a wholesale rebuild.

| Signal                                     | Surgical response                                                                  |
|--------------------------------------------|------------------------------------------------------------------------------------|
| Three teams rebuilding eval infra          | Form a 2-person platform team. Centralize eval registry. Migrate teams over 1 quarter. |
| Regulated customer demands audit trails    | Add named-approver workflow for Tier-0 prompts. Audit log every prompt deploy.        |
| Provider bill > $500K/mo                   | Dedicated cost engineer. Per-tenant caps automated. Quarterly contract renegotiation. |
| Self-hosting open models                   | Hire an MLOps engineer. Stand up vLLM on internal GPUs for one feature. Prove pattern. |
| Multi-region data residency needed         | Adopt Bedrock or Azure OpenAI for the regulated cohort. Keep the rest on primary providers. |
| Model risk register required               | Two-page doc per model: known failures, eval coverage, named owner. Reviewed quarterly. |

Each surgical move takes a quarter or less. You don't become an enterprise overnight; you graduate one piece at a time.

## What stays the same

Things that don't change when you outgrow startup patterns:

- **Eval-gating in CI.** Still the single most important rule.
- **Per-tenant cost dashboards.** Still essential.
- **Kill switches per feature.** Still mandatory.
- **The triad (AI eng + AI PM + designer).** Still the unit that ships features.
- **2-week feature cycles.** Still the cadence; enterprise process layers on top.

If anything, these get *more* important at scale, not less.

## When NOT to graduate

Headcount isn't the only signal — pain is. A 65-engineer AI team without regulated customers, without multi-team eval collisions, and without bill pressure can comfortably stay on startup patterns. Don't import enterprise overhead "because we're 65 now."

Conversely, a 30-engineer team in regulated healthcare with three teams rebuilding eval infra has already outgrown startup patterns despite low headcount.

Watch the symptoms; ignore the org chart.

:::note[Worked example: a clean graduation]
A 55-person AI startup hits four signals in one quarter:
1. Two teams blocked each other on shared prompts twice in a month.
2. A regulated healthcare customer asks for SOC 2 + HIPAA + model risk register.
3. Provider bill crossed $400K/month and trending up 12% MoM.
4. A bad Tier-1 output reached the regulated customer; legal asked "where's our audit trail?"

The CTO doesn't rewrite anything. Over one quarter:

- Spins up a 2-person platform team owning the central eval registry and prompt approval workflow.
- Hires one senior compliance engineer to own model risk register + HIPAA-specific deployment.
- Adds named-approver workflow for Tier-0 prompts via a thin GitHub bot.
- Renegotiates the Anthropic contract (now at enterprise volume) for committed-use pricing.

Three months later, the team operates under enterprise patterns where it counts (regulated cohort, central eval, audit trails) but stays startup-fast elsewhere (the small Tier-2/3 feature teams keep shipping 2-week cycles). Hybrid is the realistic state.
:::

:::info[Highlight: graduating gracefully beats graduating in crisis]
Most companies don't notice they've outgrown the workflow until something breaks badly — a major incident, a regulated customer churns, a key hire quits. The hard skill is noticing the signals early.

Watch the signal list quarterly. When 2–3 are flashing red, *start* the transition. Don't wait for the fourth.
:::

## The half-graduated state is normal

You will not be uniformly startup or uniformly enterprise. The realistic state past ~50 engineers is *hybrid*:

- Tier-0/1 features in regulated cohort use enterprise patterns (audit logs, named approvers, model risk register).
- Tier-2/3 features for non-regulated customers stay on startup patterns (eval-gated CI, cohort rollouts, fast iteration).
- One shared eval registry and prompt library, but feature teams own their suites and prompts.
- Provider contracts are enterprise (committed-use, custom DPA) even though the workflow is largely still startup.

This is the steady state for most successful AI scale-ups. The "we're fully one or the other" companies are usually wrong about it.

## The three roles that don't exist yet but will need to

As you cross 50–80 engineers, three roles tend to need to be created (or named explicitly):

1. **AI Platform Engineering Lead.** Owns the central eval registry, prompt library, gateway tenancy, observability. Not a manager of feature teams.
2. **AI Risk / Governance Lead.** Owns the model risk register, prompt-approval workflows, regulatory engagement. Sometimes a security or legal hire crossed with technical depth.
3. **AI Cost Engineer.** Full-time on cost optimization at $250K+/month bills. Owns contract renegotiation, per-tenant caps, model selection across features.

Hiring these in advance of the signals is over-engineering. Hiring after the signals scream is reactive — but still works.

## Wrapping up Part 6

Startup AI in 2026 is a sweet spot. The tooling is mature, eval discipline is well-understood, and a 10–30 person team can ship genuinely impressive AI product:

- Pick the dominant stack (gateway + pgvector + Inngest + Langfuse/Braintrust).
- Eval discipline is non-negotiable.
- Buy the model; own the prompts, evals, retrieval, UX.
- Add process when missing it causes pain — not before.
- Per-tenant cost is a product metric.
- Plan in quarters; ship in 2-week cycles.

The hardest discipline: resisting both extremes. Don't be vibes-driven like a hackathon project; don't be process-heavy like a regulated enterprise. Stay in the middle, where execution speed is highest and customers actually get value.

## What's next

→ Take the [Chapter 10 Checkpoint](./18-checkpoint.md), then continue to [Chapter 11: Enterprise AI](/docs/enterprise) for a contrast — same problems, very different solutions at 100+ engineers.
