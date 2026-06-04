---
id: eval-investment
title: How much to invest in evals
sidebar_position: 10
description: How much engineering time should go to evals at each stage of an AI feature. Roughly 10% early, 25% mid, 40% mature. Signs you're under-investing.
---

# How much to invest in evals

> **In one line:** Spend roughly 10% of AI eng time on evals early, 25% as the feature matures, 40% once you're in production — and treat under-investment as the leading cause of silent quality decay.

:::tip[In plain English]
Every team starts the same way: "we'll add evals later." Later never comes. Then the model gets swapped, the prompt gets edited, a vendor changes something silently, and quality drifts down for weeks before anyone notices. Evals are the only thing that catches this. Treat them as core engineering, not a nice-to-have.
:::

## The rough split by stage

| Stage                       | Eval share of AI eng time | What you have                                              |
|-----------------------------|---------------------------|------------------------------------------------------------|
| **Prototype / exploration** | ~10%                      | 30–50 hand-picked examples, run locally, eyeballed         |
| **Early production**        | ~25%                      | 200–500 examples, automated, run on every prompt change    |
| **Mature production**       | ~40%                      | 1,000+ examples, CI-gated, regression dashboards, alerting |
| **Critical / regulated**    | 50%+                      | Continuous evals on real traffic, model cards, audit logs  |

These are *engineering time*, not headcount. A 5-person team might have one person spending half their week on evals; a 50-person team might have a dedicated eval / quality squad.

## What "investing in evals" actually means

It's not "we wrote some tests." Real eval investment includes:

- **A versioned eval set in git.** Inputs + expected outputs (or expected properties) + tags by feature.
- **A test runner.** `pytest`, Promptfoo, or a hosted platform (Braintrust, Langfuse evals).
- **A scoring function.** Exact match, LLM-as-judge, or a domain-specific scorer. Often multiple.
- **CI integration.** Every prompt or model change runs the eval; regressions block merge.
- **Production tracing.** Real user traffic logged; periodic sampling and grading.
- **A regression dashboard.** Quality over time, broken down by feature and model.
- **A process for adding new examples** when bugs are caught in production — your eval grows from your worst real cases.

If you have one or two of these, you're early. If you have all of them, you're mature.

## Signs you're under-investing

- You discovered a regression because a user complained.
- You can't tell whether a prompt edit made things better or worse.
- You haven't tried a new model in six months because "we don't know if it'd work."
- Every model swap is a 3-week project of "running it past the team."
- Your eval set is in someone's Notion doc.
- The metric in your weekly review is "vibe."

## Signs you're over-investing

Rare, but real:

- 80% of AI eng time is eval infrastructure; product features starve.
- You have 50,000 eval examples but no one knows which 500 matter.
- You're building a custom eval platform instead of using Braintrust.
- Eval CI takes longer than the actual feature work.

## How to start (if you're at 0%)

The minimum viable eval setup is one Saturday:

1. **Collect 30 examples** of real user inputs + the answer you would have wanted.
2. **Write a `pytest` file** that calls your AI feature on each and scores it (LLM-as-judge is fine for v0).
3. **Run it.** Note your baseline.
4. **Run it again** every time you change a prompt or model. Block merge on regressions in CI.

This setup catches 80% of the regressions a fancy eval platform would catch. Adopt the platform when "70 eval files in pytest" starts feeling clumsy — not before.

:::note[→ Going deeper]
This page is about *how much* to invest. For *how* to build the evals — scorer design, [LLM-as-judge](/docs/evaluation/eval-llm-as-judge), [the metrics that matter](/docs/evaluation/eval-metrics), and [grading production traffic](/docs/evaluation/eval-production) — see [Chapter 5: Evaluation & Measurement](/docs/evaluation).
:::

## What to eval

For each AI feature, at minimum:

- **Accuracy / correctness** on a representative input set.
- **Refusal rate** — does the model refuse to answer when it shouldn't, or vice versa?
- **Format compliance** — does the structured output parse?
- **Cost per call** — track per-feature spend over time.
- **Latency** — p50 and p99.
- **Toxicity / safety** — if user-facing.
- **Hallucination rate** for RAG features — is the answer grounded in retrieved docs?

## When this rule doesn't apply

- **You're in week one of a prototype that may never ship.** Don't build eval infra yet.
- **The feature is internal-only and low-stakes.** Lighter eval bar is fine.
- **You have a deterministic component that's already tested.** Don't double-test.

## Common mistakes

- **"We'll add evals after launch."** You won't. The launch will produce a backlog that always feels more urgent. Build the eval set *during* the build.
- **Treating evals as QA's job.** Evals are engineering. Engineers who own the prompts own the evals.
- **Eyeballing as a substitute for measurement.** "Looks better to me" is not a regression test. Every model change should produce a number.
- **Eval-set rot.** An eval that hasn't been updated in six months is testing yesterday's product. Allocate time monthly to add cases from real production traffic.

:::note[Worked example: catching the silent regression]
A team upgrades from Claude Sonnet 4 to Sonnet 5 on the prompt edit that "looked good." Two weeks later, customer support flags that a specific class of refunds is failing — the model is now refusing to process them, citing policy.

Their eval set had no refund examples. The new model was being subtly more cautious on financial actions. Quality on that workflow dropped from 96% to 60% silently for two weeks.

The fix:

1. Add 30 refund examples to the eval set.
2. Set a CI gate at 95% on each workflow.
3. Run evals weekly on production traffic samples.

Three months later, when they try the next model upgrade, the regression is caught in CI before it ships. No customer notices.

The investment that would have prevented the two-week regression: about 4 hours of engineer time, one time. Most teams pay this cost eventually — the question is whether they pay it before or after the bad week.
:::

---

→ Next: [Cost of inaction](./05-cost-of-inaction.md).
