---
id: startup-ai-development
title: The Development Loop
sidebar_position: 8
sidebar_label: 7. Development
description: The 2-week feature playbook, daily prompt iteration loop, AI-aware PR review, preview deploys with real provider keys.
---

# The Development Loop

> **In one line:** Ship one new AI feature every two weeks using the playbook below. Every prompt change runs evals in CI. Preview deploys hit real providers.

:::tip[In plain English]
The biggest difference from regular web development: a prompt change is a *code change* that goes through review, runs in CI, and deploys behind flags. If your team treats "I tweaked the prompt" as different from "I changed a function," you'll regress silently. Same rigor, same review, same tests — just with eval suites doing the heavy lifting that unit tests do for deterministic code.
:::

## The 2-week AI-feature playbook

A repeatable cycle for shipping a new AI feature.

### Week 1 — build

| Day | Output                                                                                                  |
|-----|---------------------------------------------------------------------------------------------------------|
| Mon | One-page spec from PM. 5 example I/O pairs hand-written. Risk-tier set. Eval bar set.                    |
| Tue | v0 implementation. Raw SDK call via the gateway. Frontier model. Streaming UI end-to-end.                 |
| Wed | 30-case eval suite seeded from real customer traces (or domain expert hand-writing). Baseline eval run.    |
| Thu | Prompt iteration with eval suite as scoreboard. Add structured output / retrieval / tools as needed.       |
| Fri | Hardening: cost cap, rate limit, `max_tokens`, fallback provider, kill-switch flag. Internal launch.        |

### Week 2 — ship

| Day | Output                                                                                                  |
|-----|---------------------------------------------------------------------------------------------------------|
| Mon | Internal dogfood. Add 10 new eval cases from internal-user failures.                                      |
| Tue | 5% real-user rollout. Observability dashboards on. Cost alerts armed at 2x forecast.                       |
| Wed | Sample 50 prod traces by hand. Triage worst failure class. Fix.                                            |
| Thu | 25% rollout if scores hold; otherwise back to Tuesday with another iteration.                             |
| Fri | 50% → 100% rollout if metrics hold. Schedule the post-launch retro for two weeks out.                      |

### What's NOT in the playbook

- Multi-week prompt-engineering sprints with no eval feedback.
- Switching frameworks mid-feature.
- "Let's also fine-tune."
- Demos to investors using features that haven't passed eval gating.

## The daily prompt iteration loop

```
1. Read 10 worst-scoring eval traces.
2. Form a hypothesis. ("Model is missing the clause when it's nested in a list.")
3. Change one thing in the prompt (or retrieval, or model).
4. Run the eval suite (8 minutes).
5. Score moved up → commit. Score moved down → revert and try again.
6. Repeat 4–6 times per day.
```

Senior AI engineers ship 4–8 small prompt changes per day with this loop. The eval suite is the safety net that makes that velocity safe.

## AI-aware PR review

A PR that touches `packages/prompts/` gets reviewed differently:

- **Reviewer reads the prompt diff out loud.** Words matter. Comma placement matters. Try it.
- **Reviewer checks the eval delta posted by CI.** If eval score moved, by how much, on which cases?
- **Reviewer asks: what new cases were added?** A prompt change without new eval cases is suspect.
- **Reviewer sanity-checks model + cost.** Did the PR accidentally bump from Haiku to Opus?

Two-engineer team: reviewer is the other engineer. Larger team: AI-engineer reviews AI-engineer; the platform engineer reviews shared prompts.

## Preview deploys with real keys

Every PR gets a Vercel preview that hits **real provider APIs**, not mocks. Why:

- Mock responses lie. The real provider has rate limits, latency variance, occasional 500s.
- The preview is where the designer, PM, and stakeholders test before merge.
- Cost is negligible at preview scale (~$1–5 per PR if anyone uses it).

Guardrails:

- Preview env uses a *sandbox tenant* with seeded data, not real customer data.
- Preview keys have spend caps at the gateway level (e.g., $20/day max).
- Preview branches auto-delete after merge or after 7 days idle.

## Trunk-based for AI

- Short-lived branches (1–3 days). Long-lived branches mean prompt drift vs `main` that confuses evals.
- Merge incrementally behind a feature flag if the work is large.
- Flags + cohort rollouts (see [deployment](./10-deployment.md)) replace long branches.

## When the eval suite says "regression" but you think the model is actually better

This will happen. New model output is qualitatively different — sometimes better in ways the eval doesn't capture. The discipline:

1. Don't merge anyway. The eval is the contract.
2. *Update the eval cases* to capture what "better" means. If the new behavior really is better, add cases that score it favorably.
3. Re-run. If now it passes, merge. If not, the model isn't actually better on the cases that matter.

This is how the eval suite *learns* over time. Resist the temptation to overrule it.

:::note[Worked example: a 4-engineer team shipping like a 20-engineer one]
A 4-person AI startup running the playbook above ships ~2 new AI features per month and ~30 small prompt iterations per week. A 12-person team without eval discipline ships ~1 feature per month and spends 60% of their time firefighting silent regressions caught by customer complaints.

The difference isn't talent or hours. It's that the 4-person team treats every prompt change as a code change with CI evals, and the 12-person team treats prompts as "wording" that doesn't need review. Speed and discipline compound together.
:::

:::info[Highlight: the regenerate button as a dev tool]
Every AI feature you ship has a "regenerate" button for users. That same button is a *power tool for the dev team* during iteration — internal admin views let any engineer regenerate any historical trace, optionally with a different prompt or model. This is the single highest-leverage internal tool you can build. Build it in week 2 of the company.
:::

## Pair programming on AI features

Pair programming pays back unusually well on AI features because:

- Two pairs of eyes on prompt wording catch more failures than one.
- The non-driver can sample traces in parallel while the driver iterates.
- Hand-labeling 30 eval cases is 2x faster with two people calibrating "what does good look like."

Schedule one pairing session per week per AI engineer minimum. Half-day for hard prompts.

## A sample PR review checklist for prompt changes

```
□ Prompt diff read end-to-end out loud
□ Eval delta posted by CI (cite the score change in the review)
□ At least 3 new eval cases added if the prompt narrowed or broadened scope
□ Model + version still pinned (no silent upgrade)
□ max_tokens still set
□ No secrets in the prompt
□ No PII placeholders that could leak
□ Adversarial suite passed (for Tier 0/1)
□ Designer has previewed if user-facing output changed
□ Cost dashboard scanned for unexpected jump in preview env
```

Print this. Tape it above the desk. Run through it every prompt PR.

## Common mistakes

:::caution[Where people commonly trip up]
- **Skipping evals for "trivial" prompt changes.** There is no such thing as a trivial prompt change. The "fix" that breaks 10% of cases looks identical to the "fix" that helps 10% of cases until you measure.
- **Eval suite as a separate workflow nobody runs.** If evals aren't *in* CI, they aren't real. Engineers will skip them under deadline pressure.
- **Mocking the LLM in preview deploys.** The mock doesn't have the failure modes. The preview becomes useless for actual review.
- **Treating prompts as "PM-owned" content.** PMs draft, engineers implement, both review. Pure PM ownership of prompts means no eval discipline.
- **Shipping the demo, never shipping the production version.** The week-1 demo is a prototype. The week-2 hardening (cost cap, rate limit, fallback, kill switch) is what makes it shippable. Skipping week 2 means you launch a feature that takes you down at 1% rollout.
:::

## What's next

→ Continue to [Testing Strategy](./08-testing.md) where we cover the four-layer test stack: unit, integration, evals, and adversarial.
