---
id: solo-pitfalls
title: Common Pitfalls
sidebar_position: 15
sidebar_label: 14. Pitfalls
description: The 10 things that kill solo AI projects in 2026 — over-scoping, no auth, no rate limits, agent runaway, premature fine-tuning, and more. Each with a specific guardrail.
---

# Common Pitfalls

> **In one line:** Almost every dead solo AI project died of one of ten causes. Each has a specific, cheap, day-one guardrail.

:::tip[In plain English]
Bad outcomes in solo AI aren't usually about skill. They're about a handful of specific traps that catch almost everyone the first time. Read this page early — most of the guardrails take an hour, and skipping them is the difference between a quietly-running tool and a "I gave up after the $400 bill" tweet.
:::

## The ten that matter

### 1. Over-scoping v0

**How it dies:** v0 turns into v3 in your head. Six weekends in, no shipped URL, motivation cratered.

**Guardrail:** The shape rules from [project-types](./02-project-types.md) — one prompt, one input, one output. Any feature not on the one-pager goes on `v2.md`. Re-read the one-pager every weekend; if you've drifted, cut.

### 2. No auth on the LLM endpoint

**How it dies:** Tweet at 9pm, $240 bill by 2am. A bot found your endpoint and is reselling your tokens.

**Guardrail:** [Auth](./07-auth.md) before public URL. Clerk in 20 minutes. No exception, not even for "just sharing with friends."

### 3. No per-user rate limits

**How it dies:** A real user — usually not malicious, just curious — hits the LLM 5,000 times in a weekend "testing it."

**Guardrail:** Upstash Ratelimit, 10 requests/hour per user-id. See [auth](./07-auth.md).

### 4. No spend cap on the provider dashboard

**How it dies:** Even with auth, a bug in a loop or a runaway agent overshoots. You get the bill at the end of the month.

**Guardrail:** Hard monthly cap in Anthropic/OpenAI console. $20–$50 for hobby v0. See [env-setup](./05-env-setup.md). The cap is a *ceiling*, not a warning.

### 5. Agent loop runaway

**How it dies:** Your "narrow agent" hits a corner case where each tool call generates another LLM call, infinite-loop style. 2,000 API calls in one user session.

**Guardrail:** Hard iteration limit (`max_steps=5`), hard total-tokens limit per session, explicit kill on "no progress in last step." See [project-types](./02-project-types.md) — agent shape is hard, defer if you can.

### 6. Premature fine-tuning

**How it dies:** Three weekends spent prepping data and running training jobs to beat the base model by a tiny margin. Meanwhile, no users.

**Guardrail:** Default to frontier API. Only fine-tune when you have (a) clear eval-measured quality gap that base prompts can't close, AND (b) enough volume to justify the per-call cost-savings math. Almost never true at solo scale.

### 7. Building a RAG or agent framework "for yourself"

**How it dies:** You're now a framework author with no users. Maintenance overhead grows; the original tool stalls.

**Guardrail:** Write the 80 lines you need. Don't generalize until you've built three things that share the abstraction. (You probably won't build three things.)

### 8. Logging raw user content into three SaaS dashboards

**How it dies:** A user emails about their data living in Langfuse + Sentry + your own logs. Trust evaporates; in EU, you're a GDPR violation.

**Guardrail:** Sample or redact logged inputs. PII (emails, names, IDs) gets hashed. Sensitive verticals (legal/medical/finance): turn on sampling and redaction from day one. See [observability](./10-observability.md).

### 9. Quietly broken streaming / stop button

**How it dies:** Users click "stop" but the backend keeps generating — and billing you. Or streaming silently fails and users see a hung screen and refresh repeatedly.

**Guardrail:** Test the stop button by hand each release. Use the AI SDK's abort signal correctly. Add a global server-side timeout (~30s for most prompts). Refresh shouldn't trigger a fresh generation — gate it behind an explicit "regenerate" button.

### 10. No distribution plan, period

**How it dies:** You ship the perfect tool. You tweet it once. Nobody cares. You silently retire it.

**Guardrail:** [Launching](./11-launching.md) plan written down before shipping: which 3 channels, what video, who specifically you'll DM, what the second-launch trigger is (a new feature in 4 weeks).

## Five more that are real but second-tier

### 11. Stack churn between projects

Every new project, a new framework. You never get fluent in any one. Fix: lock in the [stack-selection](./04-stack-selection.md) defaults for 5+ projects before re-evaluating.

### 12. Free trial on a $5 product

The credit-card-required free trial earns fewer subscribers than a "free with a daily cap → upgrade" flow. Fix: see [payments](./08-payments.md) — no trial.

### 13. Building "for everyone"

If your headline doesn't name a specific user, your marketing copy can't either. Fix: pick one audience for v1; expand only after one audience works.

### 14. Treating model upgrades as automatic improvements

A new "smarter" model can regress your specific use case. Fix: every model bump requires a fresh `eval.py` run before merge.

### 15. Working alone, hearing nothing

Solo doesn't mean isolated. If you don't talk to other builders, your blind spots stay blind. Fix: join one community (AI Tinkerers, an indie-hackers Discord, a city meetup) — one conversation a week is enough.

## The "what would have to be true" check

Before shipping, run this for each of the top 10 above:

> "If [pitfall N] happened to me tonight, what would the cost be?"

If the answer is "$50 and 20 minutes of stress," fine. If it's "$400 and a Twitter quote-tweet thread," put the guardrail in tonight.

:::note[Worked example: the agent-runaway story]
Solo builder ships a "research agent" — paste a topic, get a 5-source briefing. The agent decides to call a search tool, then a fetch tool, then a summarize tool.

A user's input is "summarize the impact of climate change on global agriculture in the next 50 years." The agent loops: search → 10 results → fetch each → each fetch turns into another search inside a sub-loop → no `max_steps` cap → 47 LLM calls before a 30-second timeout finally kills it. One user, $1.40. Times 50 users over the day, $70 for nothing.

Fix: `max_steps=5`. Hard. Plus a per-session token budget of 20K. Plus a log entry every time the cap is hit so you notice the pattern. Cost the next day with the same load: \&lt;$5.
:::

:::info[Highlight: pitfalls are cheap to fix early, expensive to fix late]
Almost every pitfall on this page can be guardrailed in under an hour *before* it bites. Once it has bitten — provider bill, jailbreak screenshot, GDPR email — fixing it is a 10x project. The guardrail-everything-upfront approach is one of the few areas where solo work *should* look like enterprise work.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Skipping guardrails because "no one will find this yet."** They will. The fix is: ship the guardrails before the URL is shareable.
- **Adding guardrails after the first incident.** You'll add them — but you've already paid the cost. The fix is to read this page on day one of every new project.
- **Treating the "low priority" pitfalls as unimportant.** Number 13 (building for everyone) is what kills marketing fit; number 14 (model auto-upgrade) is what kills quality silently. The fix is to take the bottom-five as seriously as the top-ten.
- **Reading this page once and not revisiting.** The pitfalls shift relative importance as your project matures. The fix is to re-read at every milestone (launch, first paying user, first 100 users).
:::

## Page checkpoint

Self-check, all answers should be honest "yes":

- Auth + per-user rate limit + provider spend cap, all live?
- Agent kill switch (or no agent in v0)?
- Model string pinned, evals re-run on each bump?
- Distribution plan with 3 channels written down?

## What's next

→ Continue to [Starter Templates](./15-templates.md) where we'll list the four templates worth knowing so you don't start from scratch.
