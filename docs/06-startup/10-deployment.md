---
id: startup-ai-deployment
title: Deployment & Rollouts
sidebar_position: 11
sidebar_label: 10. Deployment
description: Feature flags, cohort rollouts, kill switches, deploy windows. Why AI features are change-managed rituals, not "push to prod."
---

# Deployment & Rollouts

> **In one line:** Every AI feature ships behind a flag, rolls out by cohort, has a kill switch flippable in under a minute, and is treated as a change-managed release — not a casual push.

:::tip[In plain English]
A button color change can ship to 100% of users instantly. A new AI feature absolutely cannot. The model is non-deterministic; the output can degrade with traffic shape; the cost can spike unexpectedly; a single bad output to a high-profile customer can become a tweet. Every AI deploy is treated more like a regulated release than a routine push.
:::

## Feature flags as the deployment primitive

Every AI feature ships behind a flag from day one. Use PostHog or Statsig (both have generous free tiers up to a few million events/month).

```ts
const enabled = await posthog.isFeatureEnabled(
  "ai-clause-extractor",
  { user, tenant }
);
if (!enabled) return <FallbackUI />;
return <AIClauseExtractor />;
```

Three properties every AI flag has:

1. **Per-tenant scope.** Roll out to specific customer cohorts, not just percentages of users.
2. **Kill switch.** A single toggle that flips to `false` for *everyone* in under a minute.
3. **Targeting rules.** Internal-only, beta-customers, free-tier, paid-tier, etc.

## The cohort rollout pattern

| Stage         | Cohort                                      | Watch for                              |
|---------------|---------------------------------------------|----------------------------------------|
| 0 — Internal   | Team only                                   | Obvious bugs, broken UX                |
| 1 — Friends-of-house | Select friendly customers (5–10 tenants) | Real-world failures, missing eval cases |
| 2 — Canary 5% | 5% of paid users, random                    | Quality score on prod traces, cost, p95 |
| 3 — 25%       | 25%                                         | Same metrics, with more signal         |
| 4 — 50%       | 50%                                         | Cost trends start to be reliable       |
| 5 — 100%      | All users                                   | Steady state monitoring                |

Typical timeline: stages 0–3 take a week; 4–5 take another week. Faster on Tier-3 features, slower on Tier-0/1.

## The kill switch

Every AI feature must have a single toggle that disables it for all users in under a minute.

- Lives in the feature flag platform (PostHog / Statsig) — not in code, not in env vars.
- The on-call engineer has the link to it bookmarked.
- Test it monthly. Anyone on call who can't demonstrate flipping it doesn't go on call.
- When flipped: feature returns the graceful fallback UI ("temporarily unavailable" or non-AI path).

Triggers for flipping the kill switch:

- Cost spike beyond 5x normal/hour.
- Quality score drop beyond a defined threshold on the prod-trace LLM-as-judge.
- Provider incident (gateway already does failover, but if both providers are down).
- Public-facing bad output (PR fire).
- Customer-reported regression that requires investigation before continuing.

## Deploy windows

| Change type           | Allowed window                              |
|-----------------------|---------------------------------------------|
| Code (non-AI)         | Mon–Thu 9–5, Fri until 2pm                   |
| Tier-3 AI feature     | Same                                         |
| Tier-2 prompt change  | Mon–Thu                                      |
| Tier-1 prompt change  | Mon–Wed                                      |
| Tier-0 prompt change  | Tue or Wed only, with senior eng + PM on call |
| Hotfix (any)          | Any time, with on-call engineer monitoring   |
| Model version pin bump| Tue or Wed, with full eval suite re-run      |

The point: more important changes get more daylight engineering hours for response.

## Per-tenant rollout for white-glove accounts

Top customers often get *opted out* of new features by default and opt in explicitly when they're ready. Pattern:

- A "stability tier" tag per tenant in PostHog.
- "Stable" tenants only get features at 100% rollout, after 2 weeks of steady-state.
- "Early access" tenants get features at stage 1 (friends-of-house).
- The default tenant is "standard" — gets features at stage 3 onward.

This costs a tiny amount of complexity. It saves the bigger conversation of "we shipped a regression to your $200K/year contract on a Friday."

## Provider failover via gateway

The gateway (Portkey, OpenRouter, LiteLLM) handles model-provider failover automatically. Verify monthly:

- Manually disable the primary key in the gateway dashboard.
- Watch traffic shift to the fallback.
- Verify p95 latency stays under SLO.
- Re-enable.

This is *the* test that prevents the worst kind of incident: "Anthropic is down for 4 hours and our app is down with them."

## Migrations: app deploys vs prompt deploys

Two different rituals:

- **App code deploys:** Vercel handles this automatically on merge. Preview → production. Standard web-deploy rules.
- **Prompt + model changes:** *Also* deployed via code (because prompts live in code), but additionally cohort-rolled via feature flags. The prompt-change part of a PR may stay at 5% for a week while the code part of the same PR is at 100%.

This is why eval-gating in CI and feature-flag cohorts are *both* needed — they handle different risks at different layers.

:::note[Worked example: kill switch saved an account]
A 30-person AI startup's prompt change passed all evals, deployed to canary, soaked 24 hours, and rolled to 25%. At hour 36 of the 25% rollout, a high-volume customer hit a specific input shape that produced loops the eval set didn't cover. Cost for that customer jumped 18x in two hours.

The on-call engineer saw the cost alert, opened PostHog, flipped the kill switch. Feature reverted to the previous prompt globally in 45 seconds. The customer never noticed; their dashboard never showed weirdness; they just got the slightly older but stable version of the feature.

Post-mortem: add an eval case for the input shape, fix the prompt, redeploy through the same gates. Total customer-visible impact: zero. Total team stress: low because the kill switch was a reflex.
:::

:::info[Highlight: AI is in the change-management process]
Engineers raised on "push to prod whenever" sometimes resist cohort rollouts. The reframe: AI features aren't more dangerous because they're AI; they're more dangerous because their *failure mode is fluent and confident*. A buggy non-AI feature breaks visibly. A buggy AI feature lies smoothly.

Cohort rollouts buy you time to spot fluent failures before they reach everyone. Two weeks of staged rollout for a high-stakes feature is cheap insurance compared to a 50% churn moment.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **No kill switch.** Every quarter someone needs one urgently. Every quarter a team without one ships an incident they could have stopped in seconds.
- **Manual cohort management.** Engineers hand-editing user lists in admin panels. Use the flag platform's cohort tooling; never let cohort logic live in product code.
- **No "stability tier" for top accounts.** Friday afternoon, a roll-out hits your biggest customer, things go sideways. They cared about reliability, not the new feature. Tier them differently from day one.
- **Treating model upgrades as routine.** Anthropic / OpenAI release new models monthly. Each is a *Tier-1 change* even if it looks better — different latency curves, different failure modes, different cost. Eval, cohort, roll out.
- **Skipping the monthly failover drill.** It works in theory until the day you need it. Drill quarterly minimum, monthly ideally.
:::

<Quiz id="startup-ai-deployment-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Which of these correctly describes the kill switch every AI feature must have?"
  options={[
    { text: "An environment variable redeployed within the hour" },
    { text: "A single toggle in the feature-flag platform that disables the feature for everyone in under a minute, tested monthly" },
    { text: "A code branch that reverts the feature, merged through normal CI" },
    { text: "A provider-side setting that pauses the API key" }
  ]}
  correct={1}
  explanation="The switch lives in PostHog or Statsig — not in code or env vars — because flipping a flag takes seconds while a redeploy takes minutes you don't have during a cost spike or PR fire. The revert-branch option is the tempting 'proper' answer, but the worked example shows why speed wins: the on-call engineer killed an 18x cost spike in 45 seconds with zero customer-visible impact."
/>

<Question
  prompt="Why does the page say AI features are MORE dangerous to deploy than regular features?"
  options={[
    { text: "AI features use more compute, so failures are more expensive" },
    { text: "AI providers have worse uptime than other dependencies" },
    { text: "Regulators require staged rollouts for AI" },
    { text: "Their failure mode is fluent and confident — a buggy non-AI feature breaks visibly, while a buggy AI feature lies smoothly" }
  ]}
  correct={3}
  explanation="Cohort rollouts buy time to spot fluent failures before they reach everyone — the danger is not that AI breaks more often, but that when it breaks, the output still LOOKS right. The compute-cost option is plausible since cost spikes are a real trigger, but the page's core reframe is about detectability, not expense."
/>

<Question
  prompt="A new model version from your provider 'looks better' across the board. How should you treat the upgrade?"
  options={[
    { text: "As a Tier-1 change — eval it, cohort it, roll it out, because it has different latency curves, failure modes, and costs" },
    { text: "Adopt it immediately everywhere to stay competitive" },
    { text: "As a routine dependency bump handled by Dependabot" },
    { text: "Wait a year for the version to stabilize before evaluating" }
  ]}
  correct={0}
  explanation="Model upgrades pattern-match to routine dependency bumps, which is exactly the mistake — a 'better' model can regress your specific use cases, shift latency, and change cost structure, so it goes through the same eval-gate and cohort machinery as any Tier-1 prompt change. Immediate adoption is the hype-driven failure; a year's delay is the opposite overcorrection."
/>

</Quiz>

## What's next

→ Continue to [Observability](./11-observability.md) where we cover Langfuse/Braintrust + Datadog dashboards and the quality/cost/latency triple.
