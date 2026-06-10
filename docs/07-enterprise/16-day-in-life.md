---
id: enterprise-ai-day-in-life
title: A Day in the Life
sidebar_position: 17
sidebar_label: 16. Day in the Life
description: An hour-by-hour walkthrough for an enterprise AI platform engineer at a 500+ engineer org.
---

# A Day in the Life

> **In one line:** A senior enterprise AI platform engineer spends maybe 30% of the day coding, the rest on reviews, eval clinics, partnering with Risk/Privacy, debugging cross-team integrations, and shaping what the platform ships next.

:::tip[In plain English]
If you imagine an enterprise AI engineer as someone tuning prompts all day, you're imagining the wrong job. By the time you're senior on a platform team or embedded in a major feature team, your highest-leverage activity is usually *helping other AI engineers ship safely* — through reviews, eval co-authoring, shaping the gateway, and translating between feature teams and Risk/Privacy.

This sometimes catches mid-career engineers off-guard when they join from a startup: "I joined to do AI, and now I'm in a prompt review committee meeting." The leverage is real — your eval clinic helps five features at once — but the work looks different.
:::

## An hour-by-hour walkthrough (senior AI platform engineer)

**8:30 AM** — Glance at the platform on-call channel from overnight. Two minor incidents: a Bedrock region had elevated latency for 20 min (auto-routed to backup region; no user impact), and a prompt-registry write failure that auto-retried (one team's promotion was delayed 5 minutes). Both fine; ack and move on.

**9:00 AM** — Triage overnight eval-on-production results. Three features have eval-score drift > 1% from yesterday's baseline:
- `policy-search-v1`: groundedness down 1.4% → check the corpus, find a new HR policy doc was added overnight with malformed headers, retrieval is hitting bad chunks. Open ticket with HR-platform team.
- `support-summarize`: tone score down 1.1% → probably noise (sample size small last night). Leave a note; watch for two more days.
- `agent-tool-use-v2`: cost-per-call up 12% → a new tool call was added in yesterday's deploy; the agent's hop count grew. Flag for the feature team to investigate.

**9:30 AM** — Stand-up with the platform team. Five-minute updates each: someone's shipping the EU regional gateway routes; someone's prepping the SDK v4.3 RC; someone's pairing with Claims team on a tricky RAG eval suite. Coordinate the SDK release window.

**10:00 AM** — PR reviews. Three PRs in the queue:
- Gateway-policy change adding a new redaction pattern. Approve, with a request to add three more adversarial cases that exercise the pattern.
- A feature team's new AI feature using a model not yet in the approved-for-Medium registry. Block; explain the path to get it approved or to use the approved alternative.
- Eval-scorer prompt update. Skim the new judge prompt, ask for a re-baseline run on 100 cases before merge.

**11:00 AM** — Eval-clinic office hour. A new feature team (Internal Tools) is building a code-search assistant. Pair with their AI engineer for an hour on eval-case design. By the end, they have 18 starter cases and a clear path to 50. This is probably the highest-leverage hour of the day — that team is now unblocked for two weeks of work.

**12:00 PM** — Lunch. Sit with two feature-team engineers; informal updates on what they're trying to ship and where the platform is in the way. Make a note about a friction in the prompt-promotion UX they raised; bring to the next platform retro.

**1:00 PM** — Cross-functional with Privacy. New PII pattern (Brazilian CPF numbers) needs to be added to gateway redaction; coordinate with the Privacy lead on the spec, the rollout window, the audit-evidence artifact. 30 minutes.

**1:30 PM** — Catch up on async: a Slack thread about whether to bring an additional model (Mistral Large) into the registry. Engineer the answer with the AI Risk partner: there's a use case (multi-lingual European customer support) where the current models are weaker, and the procurement path through Bedrock looks viable. Outline the eval bake-off plan.

**2:30 PM** — Coding: implement the changes to the SDK that allow per-feature timeout overrides. About 200 lines of TypeScript, tests, docs. Push a draft PR.

**4:00 PM** — Prompt review committee (weekly, 90 minutes). Six prompt promotions to review. Three are routine; two need refinements (one has refusal phrasing that's too curt for the user-facing surface; one is missing locale guidance for fr-CA users); one is from a High-tier feature and triggers a fuller discussion with the AI Risk partner present. All approved with conditions.

**5:30 PM** — Wrap up. Reply to a Slack thread from the morning. Note tomorrow's first thing: review the eval-suite refresh that the Support team is shipping.

**6:00 PM** — Done.

## The work mix

Roughly:

- **25–35% coding** (platform code, SDK, scaffold updates).
- **20% PR review** (code, prompt, eval scorer, manifest).
- **15% eval clinic / pairing** with feature teams.
- **10% incident response / on-call** (real and shadow).
- **10% cross-functional** with Risk, Privacy, Security, Legal, Procurement.
- **10% meetings** (standups, committees, retros, planning).
- **5% writing** (RFCs, docs, post-incident reviews).

Feature-team AI engineers (embedded, not platform) skew higher on coding and eval design, lower on cross-functional. AI Engineering Managers and Staff Engineers code less and shape more.

## A representative on-call shift

Platform AI on-call (one week, every 6–10 weeks for a senior engineer):

- 2–4 pages per week typical.
- Most pages: gateway latency anomalies (usually a model-provider regional issue), eval-on-production drift alerts (most are stale-corpus issues at one feature), or AI-SDK installation failures from a feature team's new repo.
- Rare but real: a regional gateway outage requiring auto-routing kicks in correctly; a feature with a prompt-promotion that broke its eval gate and shipped anyway because the gate misfired.
- Game-day exercises once per quarter (testing the kill switch, exercising a model-provider failover).

:::info[Highlight: leverage is the senior IC's metric]
The cultural shift from mid-level to senior IC on an AI platform team is that your output is no longer measured in *features you ship* — it's measured in **how much better the work of every AI engineer in the company becomes**.

A staff platform engineer who shipped one SDK feature this quarter but unblocked four feature teams via eval-clinic time, prompt-review feedback, and architecture coaching delivered enormously more value than one who shipped four SDK features that nobody adopted.

The right metric for "did I have a good quarter" isn't your PR count. It's: did paved-road adoption move? Did the prompt-review committee's reject rate stay meaningful (not 0% theater)? Did teams who had blocked features get unblocked because of your involvement?
:::

## What's not on this schedule

A few things that *aren't* on the example day but happen regularly:

- Writing or reviewing RFCs (often blocks of focused time on a less meeting-heavy day).
- Annual / quarterly portfolio planning (a week of intense meetings every 3 months).
- Vendor due-diligence reviews (~half-day each, several per quarter as new vendors come in).
- Game-day exercises for kill switches and failovers.
- Speaking at internal AI eng meetings or contributing to the AI engineering style guide.
- Mentoring 1:1s with junior AI engineers (often weekly).

## A representative day for an embedded feature-team AI engineer

Different shape:

**9:00 AM** — Pair with a teammate on the eval suite for a new sub-feature.
**10:30 AM** — Standup.
**10:45 AM** — Implement the retrieval-filter change for the latest A/B variant.
**12:00 PM** — Lunch.
**1:00 PM** — Open PR; address feedback on yesterday's PR.
**2:00 PM** — Read overnight eval drift; investigate one finding; turns out to be sampling noise.
**3:00 PM** — Office hour with the platform team; get help on a tricky prompt-version migration.
**4:00 PM** — Write up the feature's model-card update for the upcoming review.
**5:30 PM** — Wrap up.

Higher coding/eval ratio, lower cross-functional ratio. The platform team is their partner, not their job.

## Common mistakes

:::caution[Where people commonly trip up]
- **Chasing the "lines of code" metric into a platform role.** If you grade yourself on personal output after moving onto the platform team, you'll feel like you're failing every week — and you'll skip the eval-clinic time and prompt-review work that's now your actual job. The metric changes; your sense of progress has to change with it.
- **Saying yes to every meeting "for visibility."** A calendar with twelve 30-minute meetings is a calendar that ships nothing. Accept meetings where you can make a decision or unblock someone — decline the rest.
- **Hoarding focus time and ghosting reviews.** The other extreme — closing Slack and locking your calendar to "ship more SDK features" — produces a platform engineer whose PRs sit in queues across multiple feature teams. Reviews are part of the throughput; balance them with focus time.
- **Treating on-call as something to delegate up.** Senior platform engineers who skip rotation lose touch with how the gateway actually fails. Your architectural opinions slowly drift from reality.
- **Mentoring as Slack support instead of structured time.** Drive-by questions are fine, but real mentoring needs scheduled 1:1s with a growth plan. Without that structure, "mentoring" becomes ad-hoc debugging help that doesn't develop the junior engineer.
- **Skipping the eval clinic to ship one more feature.** The eval clinic is leverage — an hour there unblocks weeks of work elsewhere. Protect that hour.
:::

<Quiz id="enterprise-ai-day-in-life-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Roughly what fraction of a senior enterprise AI platform engineer's day goes to writing code?"
  options={[
    { text: "About 30%" },
    { text: "About 80%" },
    { text: "Under 5%" },
    { text: "About 60%" }
  ]}
  correct={0}
  explanation="The work mix is roughly 25–35% coding, with the rest spent on reviews, eval clinics, cross-functional work with Risk and Privacy, and incident response. Engineers joining from startups expect the 80% answer — which is exactly the mid-career surprise the page describes: 'I joined to do AI, and now I'm in a prompt review committee meeting.'"
/>

<Question
  prompt="How is a senior IC's output measured on an AI platform team?"
  options={[
    { text: "Pull requests merged per quarter" },
    { text: "By leverage — how much better the work of every AI engineer in the company becomes" },
    { text: "Number of meetings attended" },
    { text: "Lines of SDK code shipped" }
  ]}
  correct={1}
  explanation="A staff engineer who shipped one SDK feature but unblocked four teams through eval clinics and reviews delivered more than one who shipped four features nobody adopted. PR count is the metric people carry over from feature work — grading yourself on it in a platform role makes you skip the work that is actually your job."
/>

<Question
  prompt="Which hour does the example day call the highest-leverage of the day?"
  options={[
    { text: "The 2:30 PM coding block on the SDK" },
    { text: "The morning on-call triage" },
    { text: "The eval-clinic office hour pairing with a new feature team" },
    { text: "The prompt review committee meeting" }
  ]}
  correct={2}
  explanation="One hour pairing on eval-case design left the Internal Tools team with 18 starter cases, a clear path to 50, and roughly two weeks of unblocked work. The coding block feels most productive in the moment — that is the trap — but the clinic hour multiplies across another team's entire effort."
/>

</Quiz>

## What's next

→ Continue to [When to Use an Org-Wide AI Platform](./17-when-to-use.md) — which of these enterprise practices make sense at your scale, and which to skip.
