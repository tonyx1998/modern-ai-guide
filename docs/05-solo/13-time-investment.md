---
id: solo-time-investment
title: Realistic Time Investment
sidebar_position: 14
sidebar_label: 13. Time investment
description: Weekend MVP, month to first 100 users, three months to first $100 MRR. Honest numbers for solo AI in 2026.
---

# Realistic Time Investment

> **In one line:** Weekend to MVP. Month to 100 users. Three months to first $100 MRR. Anything faster is luck; anything slower is scope.

:::tip[In plain English]
The point of stating numbers is calibration. If your MVP is taking 6 weekends, you've over-scoped — not "you're slow." If you're at month 3 with zero paying users, the issue is distribution or product-market fit, not "you didn't try hard enough." This page is here so you can locate yourself on the standard curve and adjust honestly.
:::

## The honest timeline

| Milestone                                  | Realistic time      | If you take much longer, the cause is usually…   |
|---------------------------------------------|---------------------|---------------------------------------------------|
| One-pager + 20-row eval                     | 1 afternoon         | The idea isn't crisp enough — iterate the spec   |
| Empty deploy to production                  | 1 hour              | Account/secret friction; tutorial-mode account setup |
| Working v0 (one prompt, one input, one output) | 1 weekend (16h)  | Scope creep — you added a second prompt or DB    |
| Auth + per-user rate limit                  | +4 hours            | Wrong auth provider for your stack               |
| Payments (Stripe Checkout + webhook)        | +6 hours            | Building a custom billing UI instead of using Checkout |
| Custom domain + landing page                | +6 hours            | Designing instead of writing copy                |
| Launch (X + HN + 1 subreddit)               | 1 day               | Trying to be "polished" before posting           |
| First 100 signups                           | 1–4 weeks           | No distribution plan; or no one-line value prop  |
| First 10 paying users                       | 1–3 months          | No upgrade path; trial-and-paid friction         |
| First $100 MRR                              | 2–4 months          | Pricing too low; or stuck at free-tier ceiling   |

## Weekend 1: shippable v0

```
Saturday
  09:00 — Open the seven accounts, set spend caps             [1h]
  10:00 — Empty deploy of Next.js to Vercel                   [30m]
  10:30 — Wire .env.local, verify env vars in prod             [30m]
  11:00 — Write prompts/main.md and eval.csv                   [1h]
  12:00 — Lunch
  13:00 — eval.py works against eval.csv                       [1h]
  14:00 — Iterate prompt until 18+/20 pass                     [2h]
  16:00 — Wire one production route, stream to UI              [2h]
  18:00 — Deploy, click around, fix the obvious bugs           [1h]

Sunday
  09:00 — Add Clerk auth                                       [1h]
  10:00 — Add per-user rate limit (Upstash)                    [1h]
  11:00 — Write a landing page (one section, no design)        [2h]
  13:00 — Lunch
  14:00 — Polish UI: spacing, error states, empty state        [2h]
  16:00 — Record 30-second demo video                          [1h]
  17:00 — Buy domain, point DNS, configure on Vercel           [1h]
  18:00 — Deploy, click around with mom/friend, fix obvious   [1h]
  19:00 — Done. Don't launch tonight; tomorrow morning.        [0]
```

End of weekend 1: a live URL at a real domain, auth-gated, rate-limited, with one working tool. Total: ~28 hours.

## Weekend 2 (optional): payments + launch

```
Saturday
  09:00 — Stripe Checkout + webhook for one $10 tier           [4h]
  13:00 — Test full upgrade flow with test cards               [1h]
  14:00 — Wire tier into rate limits                           [2h]
  16:00 — Polish the pricing page                              [2h]

Sunday
  09:00 — Final UI polish, sweep error states                  [2h]
  11:00 — Sentry + Langfuse + daily cost email cron            [2h]
  13:00 — Write launch tweet, prep video, prep HN post         [2h]
  15:00 — Launch (X) and reply for 4 hours                     [4h]
```

End of weekend 2: launched, with paid tier and observability. Total: ~16h on top of weekend 1. Call it ~45h to a real launched product with paid tier.

## Month 1: getting to 100 users

| Week | Focus                                  | Result                       |
|------|----------------------------------------|------------------------------|
| 1    | Launch on X, HN, 1 subreddit           | 20–100 signups (high variance) |
| 2    | Reply to feedback, fix top 3 bugs      | 20–50 signups from word of mouth |
| 3    | Ship 1 feature based on user requests, tweet about it | 20–50 from "v1.1" post |
| 4    | Second launch venue (different subreddit, AI Tinkerers, ProductHunt) | 20–50 more |

Realistic: 80–250 signups by end of month 1. **If you have under 30, the problem is distribution, not product.** Re-launch with a better demo video, or pick a different audience.

## Months 2–3: first $100 MRR

The path from "people use it" to "people pay for it" is its own multi-week project:

- **Week 5–6:** add a real Pro tier; tier-up prompts when users hit the free limit.
- **Week 7–8:** ship one Pro-only feature (a feature genuinely worth $15/mo on its own — e.g., bulk processing, export, faster model, higher limits).
- **Week 9–12:** iterate the pricing page, upgrade modals, and email follow-ups based on what converts.

First $100 MRR typically means: 8–10 paying users at $10–$15/mo. Getting there in 3 months requires roughly 200–500 active free users to convert from.

## The graph nobody shows you

```
Hours of work
   ^
   |                                              ___________
   |                                             /
   |                                            /
   |                                           /
   |                                          /
   |        ______________________           /
   |       /                      \_________/
   |      /
   |_____/
   +------------------------------------------------------> Time
   weekend 1  |  weekend 2  |  month 1  |  month 2-3   |  month 4+
   build v0      launch       triage      payment        feature
                                                          requests
```

Hours spike at build. Drop after launch. Rise gradually as user requests pile up. Then either:

- **You ride the wave** (graduate to a real product — see [graduating](./17-graduating.md)).
- **You stabilize** (15 min/week, see [maintenance](./12-maintenance.md)).
- **You step away** (no shame; tools die, founders move on).

## Why projects miss the timeline

The four standard causes, in order of frequency:

1. **Scope.** v0 ended up being v2. You added a feature "while you were in there" 12 times.
2. **Yak-shaving setup.** Wrong host, wrong auth, wrong DB choice; days lost to "I'll just configure X."
3. **Polish before launch.** A pixel-perfect landing page for an app nobody's tried doesn't move the needle.
4. **Avoiding distribution.** Building feels safe; posting feels risky. The fix is to launch ugly and iterate in public.

:::note[Worked example: a 4-weekend slip and the fix]
You planned a weekend MVP. Four weekends later, you're still building. What happened?

Weekend 1: spent 80% on stack selection / DB schema / auth library comparison. **Fix in retrospect:** would've shipped if you'd taken the Stack A defaults from [stack selection](./04-stack-selection.md).

Weekend 2: built a second feature "because users will want it." **Fix:** v0 should have been one prompt, one input, one output. Second feature goes on `v2.md`.

Weekend 3: redesigned the landing page three times. **Fix:** copy beats design at v0; ship the ugly version.

Weekend 4: ah finally launched. But four weekends late means motivation drops 50%. Launch lands quieter than it would have on weekend 1. **Real fix:** notice the slip at the *end of weekend 1* and re-scope.
:::

:::info[Highlight: the calibration matters more than the targets]
The numbers above are medians, not promises. The point is to recognize *which direction* you're missing on. Building took longer than expected? You over-scoped. Built fast but no users? Distribution. Have users but no payers? Pricing or upgrade path. **Diagnose the bottleneck, don't push harder in every direction simultaneously.**
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Comparing to founder-storytelling on Twitter.** "Built $10K MRR in 4 weeks" posts are survivorship bias. The fix is to compare yourself to the median, not the outlier.
- **Setting deadlines on user growth.** "100 users by month-end" is mostly out of your control. The fix is to set deadlines on *outputs you control* (ship v2, post launch, send 20 cold DMs), not outcomes.
- **Treating the timeline as a contract.** Solo AI projects vary 3x in time based on luck of the distribution channel. The fix is to use the timeline as a sanity check, not a goal.
- **Pushing through obvious burnout.** A second 60-hour weekend after the first one taking 50 produces low-quality code and zero motivation. The fix is to plan a recovery week into the timeline, not after you collapse.
- **Quitting too early.** Three months with under 10 paying users feels like failure. For an indie AI tool, it's often month 5–8 before things click. The fix is to give it one more launch cycle before declaring death.
:::

## Page checkpoint

Self-check:

- Did your v0 actually take ~16 hours of focused work? If much more, what was the scope creep?
- Is your distribution plan written down with specific channels and dates?
- Have you set yourself a "step back and reassess" date (3 months out) so you don't either give up too early or grind too long?

## What's next

→ Continue to [Common Pitfalls](./14-pitfalls.md) where we'll cover the 10 things that consistently kill solo AI projects — and the specific guardrails for each.
