---
id: startup-ai-planning
title: Quarterly Planning for AI Features
sidebar_position: 4
sidebar_label: 3. Planning
description: Quarterly AI roadmaps, sequencing features by leverage, and tiering features by failure cost (tier-0 catastrophic to tier-3 cosmetic).
---

# Quarterly Planning for AI Features

> **In one line:** Plan in 13-week quarters, ship in 2-week cycles, re-tier every feature by failure cost before you build it.

:::tip[In plain English]
The frontier model capability curve moves faster than a 12-week roadmap. The trick is to commit to a *direction* (what customer outcome are we improving this quarter?) but stay flexible on *features* (which exact LLM patterns we use to get there). The first time you commit to "we'll ship X using fine-tuning by Q3" and a new model release makes fine-tuning unnecessary, you'll feel the trap.
:::

## The cadence

| Cadence       | Output                                                                        |
|---------------|-------------------------------------------------------------------------------|
| Quarterly     | 3–5 OKRs tied to customer outcomes (not features). One model-capability review. |
| Monthly       | Roadmap review with PM, AI eng, design. Re-tier features. Kill what's not landing. |
| 2-week sprint | One AI feature shipped or one major iteration completed. Eval suite extended.  |
| Weekly        | Eval review meeting. Triage worst-20 production responses.                    |
| Daily         | Standup, prompt iteration, eval runs.                                         |

## The risk-tiering framework

Before building any AI feature, tier it by failure cost:

| Tier   | Failure cost                                | Examples                                       | Required process                                                                 |
|--------|---------------------------------------------|------------------------------------------------|----------------------------------------------------------------------------------|
| **Tier 0** | Catastrophic — legal, safety, financial loss | Medical advice, contract generation, financial recs | Human-in-the-loop required. Eval bar >95%. Quarterly external review.            |
| **Tier 1** | High — major churn, brand damage           | Summarization of legal docs, customer-facing answers in regulated domains | Eval bar >90%. Adversarial test set. Confidence indicator in UI. Easy regenerate. |
| **Tier 2** | Medium — frustration, ticket volume        | Search ranking, chat assistant, draft generation | Eval bar >80%. Real-user trace sampling weekly. Kill switch tested monthly.       |
| **Tier 3** | Low — cosmetic, easily reverted            | Tag suggestions, autocomplete, content tone hints | Eval bar >70%. Standard observability. Iterate freely.                           |

Most teams default-tier everything as Tier 2. Wrong. A tag suggestion feature with no consequence shouldn't pay the same process tax as a contract-clause extractor.

## Sequencing AI features

The wrong instinct: build the flashy demo first. The right instinct: build the *boring foundational* features first — they unlock the flashy ones cheaply later.

A typical first-year sequence for a B2B SaaS AI startup:

1. **Q1: Foundational retrieval over customer data.** RAG over docs/emails/Slack. Tier 2. Powers everything downstream.
2. **Q2: One narrow Tier-1 feature.** A high-value workflow your top customers have specifically asked for. Eval bar set; weekly customer trace review.
3. **Q3: A Tier-2 assistant on top of (1).** Conversational interface that uses the retrieval. Cheap because the infra is already there.
4. **Q4: One agentic or tool-using feature.** Multi-step workflow. Tightly scoped tools. Tier 1 because agent loops can run away.

Bad sequence: agent first. Then realize you need retrieval. Then realize you need evals. Then realize the original agent doesn't work because retrieval is bad. Six months gone.

## Discovery before commitment

For any Tier-1 or Tier-0 feature, spend the first 1–3 days on discovery, not implementation:

- 5–10 customer interviews about the specific workflow.
- 20 hand-collected examples of "what good looks like" — the eval seed set.
- A v0 prompt + manual inspection of 30 model outputs.
- A go/no-go decision before committing the sprint.

The discipline: if the v0 inspection shows the model can't do the task at acceptable quality with reasonable prompting, *do not commit to building the feature this sprint*. Either iterate on the approach (retrieval? tools? different framing?) or escalate to "this requires more research, push to next quarter."

The startups that skip discovery commit two-week sprints to features that turn out to be six-week features. Velocity collapses.

## The model-capability review

Once per quarter, the AI engineer + PM spend a half-day asking:

- What's possible now that wasn't 90 days ago? (New models, new context windows, new modalities.)
- Which of our features could be 30% better, cheaper, or faster on a new model?
- Which of our features could be *removed* because the base model now handles them?
- Any new failure modes the new generation introduced? (E.g., new models hallucinate differently.)

Output: 1–3 concrete experiments for the next quarter. *Not* "let's adopt the new model everywhere" — that's a recipe for stealth regressions.

## Killing features

A surprising amount of AI roadmap value comes from *killing* features that aren't earning their bill:

- Feature has < 5% adoption among active users after 90 days → kill or rebuild.
- Feature costs > $0.50/answer and there's no clear path to cheaper → kill or reprice.
- Feature's eval scores have plateaued below the bar for two quarters → kill, fundamentally rebuild, or downgrade tier.

The PM owns the kill list. Every monthly review includes "what do we sunset?"

:::note[Worked example: tiering caught a near-disaster]
A 25-person legal-tech startup is two weeks from launching an "AI clause suggestion" feature. In monthly review, they re-tier: originally Tier 2, now they realize the suggested clause goes into a contract a lawyer signs. That's Tier 0 — a wrong suggestion could create real legal liability.

The team pulls the launch. They add: a confidence threshold below which the feature doesn't suggest, a "this is AI-generated, lawyer must review" banner, an audit log of every suggestion, and a Tier-0 eval set built from 50 real contracts with their senior counsel.

Three weeks late to launch. But the alternative (launching at Tier 2 process, hitting a real malpractice claim) ends the company. Re-tiering is cheap; mis-tiering is fatal.
:::

:::info[Highlight: customer-outcome OKRs beat feature OKRs]
"Ship the assistant" is a feature OKR. "Reduce time-to-first-draft for our top 20 accounts by 50%" is a customer-outcome OKR. The first one is checked off whether or not customers use it; the second one forces the team to actually measure use.

Pick outcome OKRs. They keep the team honest when a feature ships but doesn't move the metric — that's a signal to iterate, not declare victory.
:::

## A worked quarterly OKR for an AI-first startup

Example: a 22-person legal-tech AI startup, Q3 plan:

**Objective:** Make our top 50 accounts 30% faster at first-draft contract review.

**Key results:**

- KR1: Median time-to-first-draft for top-50 accounts drops from 38 min to ≤27 min, measured via PostHog session timing.
- KR2: Eval suite for "clause-extraction" feature grows from 180 cases to 280, with ≥90% pass rate on Tier-1 set.
- KR3: $/answer on clause-extraction drops from $0.11 to ≤$0.06 via mid-tier-model migration + prompt caching.
- KR4: 0 Tier-0 incidents (no model output reaching a customer's final contract without lawyer review).

**Roadmap features in service of OKRs:**

| Sprint        | Feature                              | OKR served | Risk tier |
|---------------|--------------------------------------|------------|-----------|
| Sprint 1–2    | "Suggest similar clauses" assistant  | KR1        | Tier 2    |
| Sprint 3–4    | Clause-extraction mid-tier-model migration | KR3  | Tier 1    |
| Sprint 5–6    | "Compare against playbook" tool       | KR1        | Tier 1    |

Notice what's missing: no "build an agent." No "add fine-tuning." No vanity features. Every sprint maps to a key result.

## Common mistakes

:::caution[Where people commonly trip up]
- **Annual roadmaps in a quarterly world.** Anything beyond 90 days is fiction in 2026 AI. State a 1-year *direction*; commit to 90-day OKRs; replan honestly each quarter.
- **Default-tiering every feature as Tier 2.** A tag suggester should not pay legal-tech process tax. Re-tier each feature explicitly before building.
- **Locking the roadmap and refusing model-capability re-evaluation.** A new model release that obsoletes 6 weeks of planned work is *good news*. Roadmaps that don't bend to it are rigidity, not discipline.
- **No kill list.** Every team accumulates features that nobody uses. Quarterly review must include "what do we sunset?" or the surface area calcifies and slows you down.
- **Confusing "eval bar" with "feature done."** Hitting the eval bar gets you to launch readiness, not to "done." Real customer evidence is the only sign-off that counts.
:::

## What's next

→ Continue to [AI Product Design](./04-design.md) where we cover the UX patterns specific to AI features and how designers pair with engineering.
