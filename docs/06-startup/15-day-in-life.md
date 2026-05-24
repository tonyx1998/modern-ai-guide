---
id: startup-ai-day-in-life
title: A Day in the Life of an AI Engineer
sidebar_position: 16
sidebar_label: 15. Day in the Life
description: A worked day for the AI engineer at a 20-person AI startup. Standup, trace triage, eval iteration, cohort review, on-call, deep work.
---

# A Day in the Life of an AI Engineer

> **In one line:** Standup, trace triage, two prompt iterations gated by evals, a cohort-rollout decision, one PR review, an hour on cost dashboards, deep work on a new feature. ~50% deep work, ~50% AI-specific rituals.

:::tip[In plain English]
The job is more iterative than building a CRUD app. You're not writing 800 lines and then submitting; you're making 20-line changes, watching evals, watching traces, watching costs, and shipping. Most days you write less code than a typical web engineer but you make more *decisions* — model swaps, eval cases to add, features to kill, customers to call.
:::

## A concrete example

A representative day for an AI engineer at a 22-person AI startup.

**8:45 AM** — Coffee. Open three tabs: Langfuse (last night's worst-20 traces), the cost dashboard, Linear inbox.

**9:00 AM** — Standup (15 min). What I shipped yesterday, what I'm shipping today, blockers. Today's main item: iterate on the clause-extraction prompt; eval shows we regressed 4 points on long-input cases last week.

**9:20 AM** — **Trace triage.** Pull up Langfuse, filter to the clause-extraction feature, sort by judge score ascending. Read the 15 worst traces from the last 48 hours. Two patterns jump out:
- 8 traces fail on contracts with nested numbered lists.
- 4 traces fail when the clause type is "indemnification" specifically.

Add both as new eval cases (15 cases total) to the suite. Commit to a `cases/` branch.

**10:00 AM** — **Prompt iteration round 1.** Change the system prompt to explicitly handle nested numbered lists. Push a branch. CI runs eval suite (7 min). Score: +2 points overall, +6 on nested-list cases, but -3 on indemnification. Trade-off.

**10:30 AM** — **Prompt iteration round 2.** Add an indemnification-specific instruction in the prompt. Push. CI: +5 overall, +6 nested-list, +4 indemnification. Ship it.

**11:00 AM** — PR review for a teammate's "summarization quality" change. Read the prompt diff out loud. CI shows +3 on the affected suite. Look for missing eval cases — they added 5 new ones, good. Approve.

**11:30 AM** — Cohort-rollout decision: yesterday's tagging feature rolled to 50% overnight. Open the dashboard. Quality score holding, cost holding, p95 latency holding. Promote to 100% in PostHog. Slack the team.

**12:00 PM** — Lunch.

**1:00 PM** — **Cost dashboard scan.** Three features creeping up. One is the new clause-extraction iteration — expected because of the longer prompt; flag it in the weekly cost review. One is a tenant in EU spiking unexpectedly — open a ticket for CSM to check in with them. One is benign noise.

**1:30 PM** — **Deep work block.** Start v0 on a new feature: "explain this clause in plain language." Pair with the designer for 30 min sketching the UX (regenerate button placement, confidence indicator, citations to original clause). Write the spec for the eval suite — what does "good" look like? Hand-write 8 example I/O pairs.

**3:00 PM** — Implement v0. Raw SDK via the gateway, streaming UI end-to-end, hooked up to the existing retrieval. Deploy to preview. Click around. It works, kind of.

**3:45 PM** — **On-call ping.** Sentry alert: spike in 429s from one of the providers. Open Portkey dashboard: failover already shifted traffic to the secondary. p95 latency blipped 200ms during the shift; recovered. No customer impact. Add a note to the runbook about today's blip.

**4:15 PM** — Back to the new feature. Add the new feature behind a flag (default off). Open draft PR for early feedback. The PM and designer will play with it tomorrow morning.

**4:45 PM** — **Inbox cleanup.** Reply to two Slack threads. File one customer trace forwarded by sales as a new eval case for next week. Update the Linear ticket statuses.

**5:00 PM** — Wrap. Tomorrow: get the new feature's eval suite to 30 cases and start iteration.

This rhythm — small, frequent, eval-gated changes — is the *job*. Iterative, collaborative, focused.

## How the time splits

| Activity                                | Hours/day | Notes                                |
|------------------------------------------|-----------|--------------------------------------|
| Deep code work                           | 2–3       | New features, larger refactors        |
| Prompt iteration (with eval gating)      | 1.5       | Multiple short loops                  |
| Trace triage + eval-case curation        | 1         | Daily ritual                          |
| Dashboard review (cost, quality, latency)| 0.5       | Three dashboards                      |
| PR review                                | 0.5–1     | Includes prompt PRs                   |
| Meetings (standup, pairing, planning)    | 1–1.5     | Standup + ad-hoc                      |
| On-call + customer trace forwarded items | 0.5–1     | Variable                              |

Roughly 40–50% deep work, 50–60% AI-specific rituals. The ratio surprises people coming from pure backend or frontend work.

:::note[Try it yourself]
If you're considering an AI-engineer role at a startup, time yourself across a week.

- How comfortable are you reading 20 raw LLM traces per day looking for patterns?
- How comfortable are you making small prompt changes and shipping them daily?
- How much patience do you have for non-determinism — outputs that are different each run?

If the answers are "low, low, low," AI engineering at a startup will frustrate you. The work *is* non-deterministic, trace-heavy, and incremental. Those who thrive find it interesting; those who don't find it maddening.
:::

:::info[Highlight: the dashboards are the office]
A web engineer's "office" is the IDE. An AI engineer's office is also Langfuse/Braintrust, the cost dashboard, and the trace explorer. Engineers who treat these as side tools spend less time in them than they should. Engineers who keep them open all day are the ones who catch issues early and ship the right things.
:::

## A week, zoomed out

| Day     | Theme                                                                              |
|---------|------------------------------------------------------------------------------------|
| Mon     | Weekly eval review (30m). Trace triage. Plan the week's prompt iterations.          |
| Tue     | Heavy iteration day. 3–5 eval-gated prompt PRs.                                     |
| Wed     | Cohort-rollout decisions. Pair with designer on new feature. Cost dashboard scan.   |
| Thu     | Customer trace deep-dive. Often a call with CSM about a specific account.            |
| Fri     | Hardening + new-feature v0 work. Smaller surface (you don't want to ship Friday afternoon). |

The week has a *rhythm*: research → iterate → ship → review. Engineers who try to do all four every day burn out; engineers who batch by theme stay sustainable.

## What the PM and designer are doing in parallel

The triad operates in tight loop:

- **PM:** customer calls Mon/Wed, spec writing Tue/Thu, monthly review prep Fri. Owns the eval-acceptance criteria for each feature.
- **Designer:** prototyping Mon/Tue, pairing with engineer on output shape Wed, watching real users Thu, refining Fri. Owns the AI UX patterns (citations, regenerate, confidence).
- **AI engineer:** the day above.

Standup catches collisions. Async messaging in a dedicated `#ai-feature-x` channel per feature catches the smaller stuff.

## Common mistakes

:::caution[Where people commonly trip up]
- **Treating prompt iteration as side work.** It's the core work. Carve out dedicated blocks for it daily.
- **Reviewing PRs in 90-second bursts.** A real review of a prompt PR takes 20+ minutes because you have to think about the words. Batch reviews.
- **Skipping trace triage when "things are fine."** Things look fine right up until they don't. The triage routine is what prevents the surprise.
- **Treating standup as status reporting.** Use it to unblock teammates and surface "I'm seeing X weird thing" early.
- **Ignoring dashboards because "the eval suite covers it."** Eval suite is the in-CI line of defense. Prod dashboards are the in-production line. Both, always.
:::

## What's next

→ Continue to [Common Pitfalls](./16-pitfalls.md) where we cover the startup-AI failure modes you'll face: launching without evals, agent runaway, fine-tuning too early, framework lock-in.
