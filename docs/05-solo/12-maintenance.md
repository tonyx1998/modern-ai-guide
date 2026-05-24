---
id: solo-maintenance
title: Maintenance
sidebar_position: 13
sidebar_label: 12. Maintenance
description: A 15-minute weekly cadence. Model deprecations, provider price changes, eval drift, and how to keep a solo AI tool alive without burning out.
---

# Maintenance

> **In one line:** 15 minutes a week — eval re-run, cost check, inbox triage, deps. That's the whole maintenance load on a healthy solo AI tool.

:::tip[In plain English]
A shipped solo AI tool is *much* less work to maintain than a normal SaaS, because there's almost no code. But there are three things that move under you: the model (deprecations, price changes), the prompt (drift as real inputs differ from your eval set), and the user expectations. A 15-minute weekly check catches all three before they become emergencies.
:::

## The 15-minute weekly ritual

Same time each week (Sunday evening works for most). Set a recurring calendar block.

1. **Re-run `eval.py`** (1 min). All 20 rows still pass? If not, investigate.
2. **Open Langfuse dashboard** (3 min). Any error spike? Any latency regression? Top user reasonable?
3. **Open Anthropic / OpenAI console** (1 min). Spend on track? Any unusual day?
4. **Open Sentry** (2 min). Triage new issues. Most can be ignored or rate-limited; one in ten is real.
5. **Open Stripe dashboard** (2 min). Any failed charges? Any chargebacks? Cancellations?
6. **Triage user inbox** (5 min). Reply to anyone who emailed. Even "got it, will look" beats silence.
7. **Merge safe Dependabot PRs** (1 min). Patch + minor versions for known-good deps.

15 minutes, real number. Anything more is either fire-fighting (rare) or feature work (different time block).

## The four things that move under you

### 1. Model deprecations

Providers ship new models and quietly retire old ones. The cycle in 2026 is:

- New model ships → old model gets a "deprecated" badge.
- ~12 months later → old model becomes unavailable.
- Your code throws on the next request.

**Defenses:**

- Pin the model string explicitly (`claude-sonnet-4-5`, not `claude-latest`).
- Subscribe to your provider's announcement RSS / email.
- When you see a deprecation warning, schedule a bump within a month, don't defer indefinitely.
- The bump process: change the model string in your config → re-run `eval.py` → spot regressions → adjust prompt if needed → commit & deploy.

### 2. Provider price changes

Providers can raise (rarely lower) prices with ~30 days notice. The impact on a solo tool is usually small in absolute dollars but can flip a tier's margin negative.

**Defenses:**

- Track cost-per-active-user in Langfuse weekly.
- If a price change hits, re-run the margin math from [payments](./08-payments.md). Decide: raise price, lower limit, swap model, eat the cost.
- Don't quietly eat repeated cost increases. They compound.

### 3. Eval drift

Real user inputs are weirder than your hand-curated 20-row eval. After two months in production, you'll have hundreds of real inputs. Some are doing things your eval doesn't cover.

**The cadence:** monthly, not weekly.

- Pull 20 random recent traces from Langfuse.
- For each, ask: "is this output what I'd want?"
- For any "no", add a row to `eval.csv` with the expected behavior, and iterate the prompt until that row passes alongside the existing ones.

This is the single most valuable monthly habit. The eval grows from your real users, which means your prompt gets better at handling reality.

### 4. User-expectation drift

If GPT-5 ships next week and is 10% better than your model, your users will notice — they'll compare your output to ChatGPT's. Solo tools can't always be on the frontier of frontier, but you can be *responsive*.

**Defenses:**

- When a new top-tier model ships, run your eval against it. Even if you don't switch, *know* the gap.
- If the gap is large and your tier economics still work on the new model, switch.
- Tell users when you upgrade — a tweet or a tiny in-app changelog reassures.

## When to invest beyond 15 min/week

Three signals that maintenance load needs to go up:

| Signal                                | Add                                                        |
|---------------------------------------|-------------------------------------------------------------|
| Same user issue 3+ times in a month   | Specific eval row + prompt fix (graduate from manual reply) |
| Sentry error count growing            | Look at the actual top issue (not all of them) and fix     |
| Cost rising faster than active users  | Investigate per-user cost distribution; cap heavy users    |
| You're answering the same email a lot | Add a FAQ section or a tooltip in the product              |

The pattern: maintenance work *should* convert into structural fixes, not become a permanent firefighting hill.

## When NOT to add features

Maintenance time is not feature time. The instinct, when you have 15 minutes spare, is to ship a small new feature "while you're in there." Resist for two reasons:

- Features add maintenance load. You'll regret the surface area in three months.
- Each feature should be planned with a one-pager (see [planning](./03-planning.md)) — not stuffed in during the weekly check.

Keep maintenance and feature work in separate time blocks.

## When to take a week off

Solo projects burn out their creators. If you're dreading the Sunday check-in for two weeks straight, you're heading toward "quietly let it die." Pre-empt by:

- Taking a planned week off. Set the auto-responder. Tell yourself it's allowed.
- Coming back to do the weekly check the following Sunday.
- If after that you still don't want to touch it: see [graduating](./17-graduating.md) — it's signaling that the project should either be sold, open-sourced, or shut down with dignity.

:::note[Worked example: catching a quiet regression]
Your weekly eval run shows row #14 (the adversarial prompt-injection test) failing for the first time since launch. The model now follows the injection where it used to ignore it.

Likely cause: provider silently updated the model snapshot, or you bumped versions without re-evaling.

Fix: pin the older version if available, or update the system prompt to be more robust against the injection. Add 2–3 more adversarial rows that catch the same class of attack. Commit.

Without the weekly eval, you'd have learned about this from a user (best case) or a Twitter screenshot of your tool being jailbroken (worst case).
:::

:::info[Highlight: the prompt is the maintenance surface]
On a normal SaaS, you maintain code, dependencies, and infra. On a solo AI tool, the **prompt** is the highest-maintenance surface. It's where bugs hide, where quality drifts, and where the most impactful improvements live. Treat it like the most important file in your repo — because it is.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **No weekly cadence at all.** Maintenance becomes "when something breaks," which means users find bugs before you do. The fix is a recurring calendar block — same time each week.
- **Ignoring deprecation warnings.** The model will keep working… until the morning it won't. The fix is to plan the swap when the warning lands, not when the API starts 410-ing.
- **Not re-running evals after a model bump.** "It's just a minor version, should be fine" → quality regresses silently. The fix is: every model string change requires a fresh eval run before merge.
- **Letting Sentry go to ignore-by-default.** New issues accumulate; the dashboard becomes useless. The fix is to triage to zero each week — mark as resolved, ignore deliberately, or fix.
- **Treating user emails as a low priority.** Replies in \&lt;24h are why solo tools feel personal and earn loyalty. The fix is to make user inbox part of the 15-minute weekly ritual.
:::

## Page checkpoint

Self-check:

- Is there a recurring calendar block for the weekly maintenance ritual?
- Is the model string pinned explicitly in your code?
- Do you run `eval.py` weekly? Add real-user-input rows monthly?

## What's next

→ Continue to [Realistic Time Investment](./13-time-investment.md) where we'll calibrate weekend-MVP, month-to-100-users, and three-months-to-$100-MRR expectations.
