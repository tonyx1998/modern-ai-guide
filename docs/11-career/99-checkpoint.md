---
id: career-checkpoint
title: Chapter 11 Checkpoint
sidebar_position: 99
sidebar_label: Career checkpoint
description: Self-test for AI-engineering career readiness — a checklist for knowing whether you're ready to apply, interview, and negotiate.
---

# Chapter 11 Checkpoint

> **In one line:** A self-test for AI-engineering career readiness. If you can honestly tick most of the items below, you're ready to job-search; if not, this is the checklist of what to build next.

:::tip[In plain English]
This checkpoint isn't a quiz with right answers — it's a self-assessment you can use to figure out where you actually stand. Score yourself honestly. The point isn't to pass; it's to identify the two or three highest-leverage gaps and close them in the next quarter.
:::

## How to use this page

For each section, score yourself **0 / 1 / 2 / 3**:

- **0** — no exposure or no real evidence
- **1** — followed a tutorial; can't reproduce from blank
- **2** — shipped something using this; have one good example
- **3** — could teach this to a junior; have war stories

Total possible: 99. Find your lowest single score within each axis — that's your next month's project.

## Axis 1: Market awareness (Chapter pages 1–3)

- [ ] I can name the three tiers of AI hiring (frontier labs, AI-native scaleups, AI at non-AI companies) and one company in each.
- [ ] I can name at least five AI-native scaleups that are hiring AI engineers in my city or remote-friendly.
- [ ] I know roughly what tier of company I'm targeting for my next role and why.
- [ ] I can articulate the difference between AI Engineer, ML Engineer, and Research Engineer in 30 seconds.
- [ ] I know which title pattern (AI Engineer vs ML Engineer vs FDE) matches my background best.

## Axis 2: Foundational skills (Chapter pages 2 and 4)

- [ ] I can write a typed function in TypeScript or Python from a blank file without a tutorial open.
- [ ] I can explain SSE vs WebSockets and when each is right for an LLM streaming feature.
- [ ] I can design a Postgres schema with pgvector for a RAG corpus in under 30 minutes.
- [ ] I have deployed a streaming chat endpoint to a custom domain in under 4 hours.
- [ ] I can read another engineer's PR substantively (not just LGTM).

## Axis 3: AI-specific skills (Chapter page 2's "gate")

- [ ] I can take a flaky prompt and improve its eval pass rate by 10%+ in an afternoon.
- [ ] I have built a RAG pipeline that beats naive embed-and-cosine on a hand-built eval set.
- [ ] I have designed a 30+ case eval suite and tracked regressions across prompt versions.
- [ ] I have inspected a production trace and identified a specific optimization (slow tool call, expensive model choice, redundant retrieval).
- [ ] I have intuition for $/request and tokens/sec across Sonnet, Haiku, GPT-4o, GPT-4o-mini.

## Axis 4: Portfolio (Chapter page 6)

- [ ] I have one deployed AI project on a custom domain.
- [ ] I have a second deployed AI project that exercises a different discipline (e.g., one is RAG, one is agents).
- [ ] At least one of my projects has a visible eval suite (`evals/` directory or equivalent).
- [ ] I have one merged OSS PR to a serious AI library (Langfuse, Braintrust, vLLM, Promptfoo, LangGraph, etc.).
- [ ] I have a blog with at least 3 posts about specific design decisions in my projects.

## Axis 5: Specialization (Chapter page 5)

- [ ] I have done the curiosity audit and can name the specialization track that pulls me most.
- [ ] I have shipped at least one project in that track at "level 2" depth (substantive, not surface).
- [ ] I can name three companies hiring deeply for that specialization.
- [ ] I have attended (or watched) at least one conference talk on the specialization in the last 6 months.
- [ ] I have read at least one foundational paper or blog post on the specialization.

## Axis 6: Compensation and negotiation (Chapter page 7)

- [ ] I know the rough TC range for my level and target tier from levels.fyi.
- [ ] I can compute year-1 cash-equivalent for an offer (base + sign-on + liquid equity + bonus).
- [ ] I know my walk-away number and my target number for the next offer.
- [ ] I have at least one warm relationship I'd ask for a referral.
- [ ] I have at least one comparable offer or written interest from another company to anchor negotiations.

## Axis 7: Continuous learning (Chapter page 8)

- [ ] I have a daily 20-minute information habit I actually keep (one newsletter or one feed).
- [ ] I have a weekly 90-minute deep-read habit I actually keep.
- [ ] I have a quarterly "learn one new tech properly" pattern.
- [ ] I do a yearly career audit (this checklist counts).
- [ ] I write something monthly about what I learned — even a tweet thread counts.

## Axis 8: Pitfall awareness (Chapter page 9)

- [ ] I can articulate the model-leaderboard-chasing trap and have caught myself doing it.
- [ ] I can articulate the framework-hype trap and have caught myself doing it.
- [ ] I ship-with-evals as a non-negotiable, not as an afterthought.
- [ ] I am not over-indexed on frontier labs to the exclusion of other tiers.
- [ ] I have at least one hobby completely outside AI to anchor against burnout.

## Axis 9: Education investment (Chapter page 10)

- [ ] I have done at least one substantial free course (fast.ai, Karpathy, HF, DeepLearning.AI).
- [ ] I have read at least one of: Chip Huyen's *AI Engineering*, Karpathy's series, or equivalent.
- [ ] If I am considering a paid Maven cohort or bootcamp, I have a clear ROI rationale.
- [ ] If I am considering a CS Master's, I have one of the three legitimate reasons (visa, research pivot, career pivot).
- [ ] I have not stacked Coursera certificates as a substitute for shipping.

## Axis 10: Multi-year trajectory (Chapter page 11)

- [ ] I know which year-bucket I'm in (Year 1 / Year 2–3 / Year 4–5 / Year 6+).
- [ ] I have a 12-month plan with concrete artifacts (not just "get better at AI").
- [ ] I have a 3-year aspiration (specific role, specific tier, specific specialization).
- [ ] I am not comparing my Year 1 to someone else's Year 6 on Twitter.
- [ ] I am committed to consistency over intensity (a year of weekly shipping over a 3-month sprint).

## Interpreting the score

- **80+ total, no single 0:** You're ready to actively job-search at your target tier. Spend the next month on the lowest single score.
- **60–79 total:** You're 3–6 months from "ready to apply broadly." Focus on the two lowest axes.
- **40–59 total:** You have foundations but no shipped evidence yet. Year-1 focus: ship two projects with eval suites, then re-take this checkpoint.
- **Below 40:** You're still in the Year 0 / early Year 1 phase. Pick one foundational skill and one AI-specific skill, build one project that uses both, and re-take this in 3 months.

## What this checkpoint is not

- It is not a hiring rubric — different companies weight different axes differently.
- It is not a certification — it's a self-test you should re-run every 6 months.
- It is not exhaustive — many world-class AI engineers would fail an item or two; that's normal and fine.
- It is not a substitute for shipping — the items reward shipped artifacts because shipped artifacts are what the market rewards.

:::info[Highlight: re-run this every 6 months]
Put a recurring calendar event for the first weekend of January and July: "re-run the Chapter 11 checkpoint." Track your scores in a doc. Year-over-year deltas on this list are a much more accurate measure of your AI-engineering growth than salary or job title — those lag by 12–18 months. The checklist updates in real-time.
:::

---

## You finished the chapter

→ Now go ship the next thing on the list. The fastest way to move from "Year 1" to "Year 3 mid-level" is not to read more career advice — it's to build one more project with one more eval suite and one more blog post by the end of next month.

→ The [Glossary](/docs/glossary) is always available as a reference for terms you encounter in the wild.
