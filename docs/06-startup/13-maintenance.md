---
id: startup-ai-maintenance
title: Maintenance & Steady State
sidebar_position: 14
sidebar_label: 13. Maintenance
description: Weekly eval review, quarterly model audits, deprecating features, vector index hygiene, dependency upgrades, on-call rituals.
---

# Maintenance & Steady State

> **In one line:** Weekly eval review, quarterly model audit, monthly cost review, retire one feature per quarter, rotate keys quarterly, drill the kill switch monthly.

:::tip[In plain English]
Most AI-startup pain after launch comes not from new features but from features quietly drifting — a model release changes behavior, a vector index drifts, a customer's input distribution shifts, the bill creeps up 10% per month. Maintenance is the discipline that catches these before they become incidents.
:::

## The weekly cadence

| Day  | Ritual                                                                                                       |
|------|--------------------------------------------------------------------------------------------------------------|
| Mon  | Eval review — 30 min. Triage worst 20 prod traces per feature. Add new eval cases. Open any urgent issues.     |
| Tue  | Sprint planning — 60 min. Includes "what do we sunset?" question.                                              |
| Wed  | Cost dashboard scan — 10 min. Anything jumping? Any tenant outliers? Any feature crossing $/answer cap?         |
| Thu  | Open PR + customer-trace deep-dive. The AI engineer spends 1–2 hours on raw traces from real users.            |
| Fri  | Full nightly eval suite runs against prod traffic sample; results published in Slack.                            |

This is a half-day per week. Skip it for a month and you start regressing without knowing.

## The monthly cadence

- **Cost review.** Finance + AI engineer go through the bill line by line. Surface anything jumping 20%+ MoM.
- **Kill-switch drill.** Pick an AI feature, flip its kill switch, verify the fallback works, flip it back.
- **Provider failover drill.** Disable primary provider in the gateway; verify failover; re-enable.
- **Dependency upgrades.** SDK versions (`@anthropic-ai/sdk`, `openai`, gateway client). Read the changelog for behavior changes — these matter more than version numbers in normal libs.
- **Vector index hygiene.** Reindex if drift detected; rebuild IVFFlat lists if dataset grew significantly.

## The quarterly cadence

### Model audit

Once per quarter, review every feature's model choice:

- What model is it on? When was it pinned?
- What's available now that wasn't?
- Could the feature run on a cheaper / faster / better model?
- Run the affected eval suite on candidate models; pick the best on the quality/cost/latency triple.

Output: typically 1–3 features get model upgrades per quarter, with full cohort rollouts.

### Cost review (with finance)

A 60-minute meeting:

- Spend by feature, by tenant, MoM trend.
- Top features by $/answer.
- Hypotheses: which can move to a cheaper model? Cache more? Batch? Add tighter `max_tokens`?
- Concrete action items with owners.

Two or three of these meetings will save 30–50% of your AI bill in the first year.

### Eval set review

- Are eval sets growing? (They should be — 10–30% per quarter at this stage.)
- Are any features' eval sets stuck in time? (Bad sign.)
- Are domain experts still being pulled in to add cases? (Should be quarterly minimum.)

### Feature retirement

- What features have < 5% adoption among active users after 90 days? Kill or rebuild.
- What features cost > $0.50/answer with no clear cheaper path? Reprice or kill.
- What features' eval scores have plateaued below the bar for two quarters? Kill or fundamentally rebuild.

Retiring features feels bad but is necessary. The surface area of features the team maintains directly bounds velocity on new ones.

### Compliance refresh

- Re-confirm provider opt-out is still in effect.
- Re-review sub-processor list; update DPA if it changed.
- Access review: who has prod LLM keys, prod DB access, eval-platform admin? Right-size.
- Vanta/Drata evidence check.

## Vector index hygiene

pgvector indexes degrade as data grows. Quarterly:

- Check query p95 latency on the vector store. Drifting upward?
- Rebuild IVFFlat lists if dataset grew >2x since last rebuild.
- Consider HNSW migration if you're on IVFFlat and latency is an issue.
- Evaluate moving to Pinecone / Turbopuffer if pgvector latency stays bad even after tuning.

## Key rotation

Quarterly minimum, after any departure immediately:

- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PORTKEY_API_KEY`, `BRAINTRUST_API_KEY` (or `LANGFUSE_*`).
- Rotate at the provider; update in Doppler; redeploy.
- The gateway is your friend here — it makes key rotation a 5-minute job rather than a multi-deploy ritual.

## Model deprecation handling

Providers retire models with 6–12 month notice. Process:

1. New deprecation announcement → file in `docs/model-deprecations.md` with the sunset date.
2. Open an issue per pinned feature on the deprecated model.
3. Find the candidate replacement; run eval suite; cohort roll.
4. Migrate at least 4 weeks before the sunset date — never the week of.

Calendar reminders are the only thing that prevents the "we wake up to broken features because the model retired overnight" incident.

## On-call maintenance

- One engineer at a time. Weekly rotation.
- Runbooks live in `runbooks/` in the repo (not Notion — searchable in PRs).
- Add a new runbook after any novel incident.
- Quarterly: review runbook list, archive stale ones, freshen the active ones.

:::note[Worked example: a 12% cost reduction from one quarterly review]
A 25-person AI startup at $2.3M ARR runs their quarterly cost review. Findings:

- Summarization feature is on the flagship model. Eval scores show the mid-tier model performs within 2 points of the flagship. **Switch to mid-tier → saves $4K/month.**
- Tag-suggestion feature has no `max_tokens` cap. 8% of calls return 2,000-token responses (way more than needed). **Add cap of 100 tokens → saves $1.2K/month.**
- 23 tenants are on free tier hitting the assistant feature heavily. **Add per-day cap on free tier → saves $2.8K/month.**

Total: $8K/month savings, ~$96K/year, identified in 60 minutes. No quality regression because each change was evaluated before rolling out.
:::

:::info[Highlight: maintenance is the unglamorous source of compounding returns]
The team that does weekly eval review for a year ends up with a much better product than the team that ships flashy features and skips maintenance — even if the second team ships twice as many features. Compounding works in evals just like in money.

Defend the weekly half-day. It's the highest-leverage time on the AI engineer's calendar.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Skipping the weekly eval review for "real work."** Real work *is* eval review. Without it, you ship regressions.
- **Letting model deprecations sneak up.** "We have until October." It's now October. The feature is broken. Add a calendar reminder the day the deprecation is announced.
- **Not retiring any features.** The surface area calcifies. New features take longer because of all the old ones to maintain.
- **Skipping the failover drill.** It works in theory. The day you need it, you discover the failover config drifted three months ago and no longer works.
- **Treating cost reviews as finance's problem.** Engineering owns the bill; finance keeps engineering honest. Both in the room or neither.
:::

<Quiz id="startup-ai-maintenance-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What happens in the quarterly model audit?"
  options={[
    { text: "Every feature is migrated to the newest model automatically" },
    { text: "Each feature's pinned model is reviewed against what is now available, candidates are run through the eval suite, and the winner on the quality/cost/latency triple gets a full cohort rollout" },
    { text: "The provider contracts are renegotiated for volume discounts" },
    { text: "All model pins are removed so features track the latest versions" }
  ]}
  correct={1}
  explanation="The audit asks what is available now that was not at pin time, then lets the eval suite and the triple decide — typically 1-3 features get upgrades per quarter, each through full rollout machinery. Auto-migrating to the newest model is the tempting 'stay current' answer, but it is exactly the stealth-regression recipe the pinning discipline exists to prevent."
/>

<Question
  prompt="Which of these is a stated criterion for retiring a feature?"
  options={[
    { text: "The feature is more than a year old" },
    { text: "A competitor shipped a similar feature" },
    { text: "Under 5% adoption among active users after 90 days, cost above $0.50/answer with no cheaper path, or eval scores plateaued below the bar for two quarters" },
    { text: "The original author has left the company" }
  ]}
  correct={2}
  explanation="The retirement criteria are quantitative — adoption, unit cost, and stalled quality — because the surface area of maintained features directly bounds velocity on new ones. Age alone is the intuitive proxy people reach for, but an old feature with healthy adoption and margins is fine; the page targets features failing on measurable value."
/>

<Question
  prompt="What is the only thing the page says prevents the 'we woke up to broken features because the model retired overnight' incident?"
  options={[
    { text: "Calendar reminders filed the day the deprecation is announced, with migration completed at least 4 weeks before sunset" },
    { text: "Using model aliases that automatically resolve to supported versions" },
    { text: "A clause in the provider contract guaranteeing indefinite support" },
    { text: "Weekly emails from the provider about upcoming sunsets" }
  ]}
  correct={0}
  explanation="Providers give 6-12 months notice, which paradoxically causes the failure: 'we have until October' becomes 'it is now October and the feature is broken'. The process is file the date, open an issue per pinned feature, eval the replacement, cohort-roll, and never migrate the week of sunset. Auto-resolving aliases avoid the breakage but reintroduce silent behavior changes — the cure the pinning discipline rejects."
/>

</Quiz>

## What's next

→ Continue to [Cost Breakdown](./14-cost-breakdown.md) for realistic 20-person AI startup line items and the $50K–$200K/month range.
