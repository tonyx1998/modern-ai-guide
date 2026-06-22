---
id: enterprise-ai-deployment-change-mgmt
title: 'Phase 8: Deployment & Change Management'
sidebar_position: 11
sidebar_label: 10. Deployment
description: Change management, release windows, blast-radius limits, platform-level kill switches for enterprise AI deployments.
---

# Phase 8: Deployment & Change Management

> **In one line:** A production AI deploy at an enterprise is wrapped in change management — release window, blast radius cap, named approvers, kill switch tested — because the cost of a bad model-call configuration reaching millions of users is too high to skip the ritual.

:::tip[In plain English]
At a startup, "deploy" is a single action: click a button, the change is live. At an enterprise, "deploy" is a *process*: the change ticket is filed with approvers, the release window opens, the canary ramps with watchers paying attention, the kill switch is verified ahead of time, and someone — sometimes a literal release manager on a bridge call — coordinates the actual ramp.

This looks heavy, and is. The justification is that an AI configuration mistake can have a blast radius of *every user in a region* for *hours*. The change management ritual exists to make that blast radius small and recoverable.
:::

## The change ticket

Every production change to an AI feature opens a change ticket (Jira, ServiceNow, Linear with a change template). Typical fields:

- **Change ID** (e.g., `CHG-2026-04891`).
- **Author + release manager** (separate people for High-tier; see [CI/CD](./09-ci-cd.md)).
- **Risk tier** (inherits from the feature).
- **Risk classification of *this* change** (config change, prompt change, model swap, retrieval-index change, schema change).
- **Eval-results delta** vs. the currently deployed version.
- **Rollback plan** (one paragraph; specific steps).
- **Kill-switch path** (which flag flips this off if needed).
- **Blast radius** (how many users / regions; max % traffic during ramp).
- **Linked artifacts** (PR, prompt registry version, model card, AI Risk Review ticket if Medium/High).
- **Release window** (when, who is on bridge, paging list).

For Low-tier changes, this is mostly auto-populated. For High-tier, several fields are written by hand and reviewed.

## Release windows

Enterprise AI deploys are not 24/7:

- **Standard window:** Tue/Wed/Thu, 10am–4pm local. No Mondays (start of week), no Fridays (weekend on-call).
- **Freeze windows:** quarter-end financial close, peak-shopping periods (retail), open-enrollment windows (healthcare/insurance), major company events.
- **Emergency window:** anytime, but requires the emergency pipeline (see CI/CD page) and an exec approval.

The cultural piece: "we don't deploy on Friday" isn't superstition. It's that the on-call population is thinnest, the cost of an incident is highest (longer time-to-detection over a weekend), and the recovery process pulls people away from the rest of their life. AI features get the same treatment as any other production change.

## Blast radius limits

Every AI deploy has explicit blast radius caps. The canary stages from the CI/CD page (1% → 10% → 50% → 100%) are blast-radius limits in action. Beyond that:

- **Per-tenant ramps for B2B platforms.** New AI versions ship to internal employees first, then to a curated set of design-partner tenants, then to a self-service tier, then to enterprise tenants.
- **Per-region ramps for B2C.** Often Australia or Canada first (smaller user base, well-instrumented), then EU, then US.
- **Per-feature-flag cohorts.** Specific user cohorts (free tier, internal, opted-in) absorb new changes first.

The blast-radius decision lives in the change ticket and is enforced by the rollout tooling, not by hope.

## Kill switches at the platform level

Three layers of kill switches, all tested quarterly:

- **Feature kill switch.** A flag that turns *this specific AI feature* off. The feature's UI falls back to a non-AI default (or is hidden). Owned by the feature team.
- **Model kill switch.** A gateway policy flag that takes *a specific model* out of rotation across the company (e.g., "stop sending traffic to GPT-4o, route everything to Claude Sonnet"). Owned by the platform team.
- **Tenant kill switch.** A flag that turns AI off for *a specific tenant* — used when an enterprise customer requests it during an incident or for compliance reasons. Owned by the customer-support engineering team.

```yaml
# gateway-policies/kill-switches.yaml
feature_kill_switches:
  policy-search-v1:
    enabled: true
    fallback: keyword-search-v3
  underwriting-decision-v2:
    enabled: true
    fallback: human-review-queue

model_kill_switches:
  # Set to true to immediately stop new traffic to this model
  - model: openai.gpt-4o-2024-11
    disabled: false
    fallback_model: anthropic.claude-sonnet-4-5
  - model: bedrock.anthropic.claude-haiku-4-5
    disabled: false
    fallback_model: bedrock.anthropic.claude-sonnet-4-5

tenant_kill_switches:
  enterprise-tenant-12891:
    ai_disabled: true
    reason: "tenant compliance pause; ticket SUP-44012"
    expires: 2026-06-30
```

:::info[Highlight: untested kill switches are theatrical]
A kill switch that hasn't been exercised in 6 months might not work — the flag might be wired wrong, the fallback might be broken, or the deploy pipeline might cache the old config.

The working pattern: a quarterly "kill-switch game day" where the platform team exercises each kill switch in production on a small canary slice and verifies the user-facing fallback. It takes 2 hours. It's the difference between "we have a kill switch" and "we have a kill switch that worked the one time we needed it at 2 AM."
:::

## Change Advisory Board (CAB)

For Medium- and High-tier changes, a CAB reviews the change ticket before approval. Typical CAB:

- A senior engineer from the AI platform team.
- A senior engineer from the consuming feature team.
- An AI Risk partner (for High-tier).
- A representative from the customer-impact function (for customer-facing changes).

The CAB is *not* re-reviewing the technical change — that happened in code review and prompt review. The CAB confirms that the change ticket is complete, the rollback plan is real, the kill switch is current, the release window is appropriate, and the blast radius is sized correctly. Most CAB reviews are 5–10 minutes.

## Worked example: shipping a prompt change to a customer-support AI

A Medium-tier change to a customer-support AI feature serving 4M users:

1. **Author edits prompt** to handle a new product line; opens PR.
2. **PR passes pre-merge gates** (eval-smoke, adversarial, policy-lint, security scan).
3. **Code review** by two engineers; one is on the prompt review committee.
4. **PR merged**; auto-deployed to staging.
5. **Staging suite runs** (production eval + adversarial + locale fairness slice). Groundedness up 1.2%, refusal correctness unchanged, no fairness deltas. Posted to change ticket.
6. **Change ticket filed** (auto-populated; release manager adds rollback plan and confirms kill-switch path).
7. **CAB approves** at the daily 10am standup, 8 minutes of discussion.
8. **Release window opens** Wednesday 10am.
9. **Canary deploys 1%**; eval-score drift on live samples watched. After 30 min, no drift. Auto-promotes.
10. **10% for 4 hours.** Negative-feedback rate steady. Auto-promotes.
11. **50% for 24 hours.** All metrics within SLO.
12. **100%** Thursday afternoon.
13. **Post-deploy review** Friday morning: 10 min, confirms metrics held, ticket closed.

Total elapsed time: 4 days. Total active engineering time: maybe 4 hours.

## What changes vs. a startup AI deploy

| | Startup | Enterprise |
|---|---|---|
| **Change record** | Git commit | Change ticket with approvers and rollback plan |
| **When you can deploy** | Anytime | Standard release windows + freezes |
| **Who deploys** | Author clicks deploy | Release manager triggers; automation deploys |
| **Blast radius** | Often "everyone immediately" | Capped per stage; ramped over hours/days |
| **Kill switch** | "We could push a fix fast" | Tested quarterly; per-feature, per-model, per-tenant |
| **CAB** | Doesn't exist | 5–10 min for Medium/High |

## Common mistakes

:::caution[Where people commonly trip up]
- **Treating change management as paperwork to fill out after the fact.** The change ticket is supposed to be a *thinking aid* before the deploy — what's the rollback, what's the kill switch, what's the blast radius? Filling it out after deploy gets you no benefit and creates a fictional audit record.
- **Skipping the rollback plan because "the deploy is reversible."** Many AI changes aren't trivially reversible — fine-tuned model promotions, RAG index re-ingestions, schema changes. Write the rollback plan even when the change feels reversible; "feels reversible" is how teams discover at 2 AM that it wasn't.
- **Letting kill switches rot.** A kill switch that wasn't tested in two quarters is roughly a 30% chance of not working. Quarterly game days; non-negotiable.
- **Running the CAB as a Soviet-style approval committee.** A CAB that nitpicks technical decisions duplicates code review and burns trust. Its job is the change ticket's completeness and the operational plan, not the technical merit — that's the PR reviewers' job.
- **No emergency-pipeline doctrine.** When a jailbreak goes public on a Friday at 5pm, you need a documented path that's faster than the standard window without breaking the audit story. If that doesn't exist, your team will improvise badly under pressure.
- **Treating all AI changes as the same risk.** A prompt-clarity edit and a model swap are not the same change. Tier them; let the small ones move fast, gate the big ones hard.
:::

<Quiz id="enterprise-ai-deployment-change-mgmt-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Why does the page say 'we don't deploy on Friday' is not superstition?"
  options={[
    { text: "Model providers do maintenance on weekends" },
    { text: "Release managers are contractually off on Fridays" },
    { text: "On-call coverage is thinnest and weekend incidents take longest to detect and recover from" },
    { text: "Change tickets cannot be filed outside business hours" }
  ]}
  correct={2}
  explanation="The on-call population is thinnest, time-to-detection stretches over the weekend, and recovery pulls people away from the rest of their lives — so the cost of an incident is highest. The other answers invent mechanical restrictions; the page's reasoning is about incident economics, not rules."
/>

<Question
  prompt="What are the three layers of kill switches described on the page?"
  options={[
    { text: "Feature, model, and tenant" },
    { text: "Gateway, database, and frontend" },
    { text: "Regional, national, and global" },
    { text: "Soft, hard, and emergency" }
  ]}
  correct={0}
  explanation="A feature switch turns one AI feature off (falling back to a non-AI default), a model switch pulls one model out of rotation company-wide, and a tenant switch turns AI off for a single customer. Each has a different owner — which is the point: the right team can act fast at the right scope. And all three are tested quarterly, because an unexercised kill switch is theatrical."
/>

<Question
  prompt="What is the Change Advisory Board's actual job when reviewing an AI change?"
  options={[
    { text: "Re-reviewing the technical merits of the code and prompt" },
    { text: "Negotiating the release date with customers" },
    { text: "Approving the feature's risk tier" },
    { text: "Confirming the ticket is complete: real rollback plan, current kill switch, sized blast radius, appropriate window" }
  ]}
  correct={3}
  explanation="The CAB is not a second code review — technical merit was settled in code review and prompt review. Its job is operational readiness, which is why most CAB reviews take 5–10 minutes. Re-litigating technical decisions is the failure mode the page calls a Soviet-style approval committee."
/>

</Quiz>

## What's next

→ Continue to [Observability & Audit Logging](./11-observability.md) — what you watch once the change is live.
