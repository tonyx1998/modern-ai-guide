---
id: solo-launching
title: Launching
sidebar_position: 12
sidebar_label: 11. Launching
description: Distribution channels for solo AI tools in 2026 — X demos, Show HN, niche subreddits, HF Spaces, AI Tinkerers. Plus the launch-tweet template.
---

# Launching

> **In one line:** A 30-second screen recording on X, a thoughtful Show HN post, and one targeted niche subreddit. That's the launch.

:::tip[In plain English]
"Launching" in 2026 doesn't mean a coordinated multi-platform splash. It means posting one short demo video in two or three places where the audience for your specific tool actually hangs out, then being responsive in the replies. The launch is a *day*, not a *campaign*. The compounding comes from doing this repeatedly across many small ships.
:::

## The 2026 channels that actually convert

### X (Twitter)

Still the dominant launch venue for AI tools. The format that works:

- **30-second screen recording.** No talking, no edit suss; just the tool doing its thing. QuickTime + Cleanshot or OBS. Compress to \&lt;10MB.
- **First line of the post: what it does and who for.** "I built [thing] for [audience]. Demo:"
- **Second line: link.**
- **Optionally: one specific detail you're proud of** — "uses Claude Sonnet 4.5, costs me $0.03 per summary."

Post around 9–11am ET on Tuesday/Wednesday/Thursday. Reply to every comment for the first 2 hours; the algorithm rewards engagement.

### Show HN

The bar is higher; the audience is more critical; the spike is bigger if it lands. Format:

- **Title: `Show HN: [Thing] – [one-line description]`**.
- **First comment from you: the back-story.** Why you built it, what's hard about it, what's the tech, what's the business model.
- **Be available for the 6 hours after posting.** HN questions deserve detailed, technical, honest answers.

Post Monday or Tuesday morning ET. Don't ask friends to upvote (the HN voting ring detection is brutal).

### Niche subreddits

For most solo AI tools, the right subreddit is *not* `/r/MachineLearning`. It's the one for your *user*, not your *tech*:

- AI writing tool → `/r/writing`, `/r/freelanceWriters`.
- AI for devs → `/r/programming`, `/r/sideproject`, language-specific subs.
- AI for legal → `/r/legaltech`, `/r/lawyertalk`.
- AI for accountants → `/r/accounting`.
- Local LLM hobbyists → `/r/LocalLLaMA`.
- Solo dev / indie → `/r/SaaS`, `/r/Entrepreneur`, `/r/sideproject`.

Read the subreddit's self-promo rules first. Most allow Saturday self-promo threads. Some require X comments-to-self-posts ratio.

### Hugging Face Spaces

If your project is a demo (Gradio or Streamlit interface), publishing it as a Space gets it in front of the AI-builder community and gives you a free hosted URL. Especially good for *open* tools where users will fork, modify, or run locally.

### AI Tinkerers

In-person meetups in major cities (SF, NYC, London, etc.). 5-minute demo slots. Tiny audiences (50–200 people) but high signal — the people who attend are the people who *talk about new AI tools online*. One memorable Tinkerers demo can outperform a successful HN post for inbound.

### Product Hunt

Less hype than 2020 but still useful for B2B-flavored tools and for the badge. Don't make PH your *only* channel.

## The launch-tweet template

```
I built [tool name].

It takes [input] and gives you [output] in [time / for whom].

Demo (30s):
[video]

Try it: [URL]
```

Real example:

```
I built Contract Snippets.

Paste a contract, get back a plain-English summary plus 5 risk callouts in ~10 seconds. Built for freelancers who can't afford a lawyer.

Demo:
[30-second screen recording]

Try it: contractsnippets.com — 10 free runs, no signup for the first one.
```

Three sentences. One video. Two links. That's it.

## What to ship with the launch

The minimum viable launch surface:

- **A landing page** with: the one-sentence headline, the demo video embedded, a "try it" form right on the page (no signup wall for the first try), and pricing below the fold.
- **A real domain.** Not `something.vercel.app`.
- **An OG image / social card** for nice link previews. Vercel OG can generate one in 20 lines.
- **A working "stop" button** on streaming output.
- **The "Try one for free without signup"** flow, gated by tight per-IP rate limits.
- **The signup → upgrade funnel** if you have paid tiers.

## What NOT to ship

- A long blog post explaining the tech (write that *after* launch, when curious devs ask).
- A "story" landing page that hides the demo three scrolls down.
- A waiting list. (For a solo AI tool in 2026, a waitlist is friction; just let people use it.)
- A Discord. (Adds support burden; nobody's there yet.)

## The first-week rhythm

| Day              | Action                                                                  |
|------------------|--------------------------------------------------------------------------|
| Day 0 (launch)   | Post to X. Watch metrics. Reply to everything.                          |
| Day 1            | Show HN (if it's still fresh). Reply to feedback all day.               |
| Day 2            | One niche subreddit (the one where your user lives).                    |
| Day 3            | Email any specific person you know who'd use it. Personal, not blast.   |
| Day 4–7          | Reply to anyone who tried it. Fix the top bug. Ship one tweak.          |
| End of week 1    | Write a "what I learned from launch" tweet thread. That's launch #2.    |

## Distribution that doesn't work

- **Cold outreach to strangers.** Burns goodwill, ~0% conversion.
- **LinkedIn unless you already have an audience there.** Different vibe; AI tools are a poor fit.
- **Paid ads at this stage.** You don't know the conversion funnel well enough; you'll burn $200 learning nothing.
- **"Stealth" launches.** Solo AI tools die from no distribution, not from competitors copying.
- **Generic AI-tool directories.** Some traffic, ~0% qualified. Worth ~10 minutes of submission, not more.

## The thing that compounds

**Ship in public.** Tweet each ship. Reply to people who tried it. A year of doing this builds an audience that the *next* project inherits. Most successful solo AI builders in 2026 are on their 3rd–8th shipped tool; the audience compounds, not the launch.

:::note[Worked example: a launch that worked]
Solo builder ships an AI tool that turns a job description into a tailored resume. Tuesday launch:

- 11am ET: X post with 30s screen recording. Cost: 4 hours making the video.
- 12pm: replying to every comment. First serious reach by 3pm (500 likes, 50 replies).
- Wednesday 9am: Show HN. Lands at #15 by noon.
- Wednesday afternoon: posts to `/r/resumes` (yes, that's a subreddit). Top of the day.
- Friday: 200 signups, 8 paying users, $80 in MRR.

Launch *campaign* cost: ~20 hours total, $0 in ads.

Three months later they ship a follow-up tool. Existing followers from this launch carry the second launch to the same numbers in a single day.
:::

:::info[Highlight: the product is the launch]
A great product with a mediocre launch grows slowly but compounds. A mediocre product with a great launch spikes then crickets. If you have to choose where to spend your last weekend before shipping, **spend it on the product, not the launch tactics**. The video is shootable in an evening; the product is the actual work.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Posting to "everywhere" at once with the same message.** Each channel has different norms. The fix is to write a channel-specific version: X = punchy video, HN = honest tech back-story, Reddit = "I built this because [problem]" framing.
- **Hiding the demo behind signup.** Friction kills the launch. The fix is: first try is free, no signup. Signup unlocks more. Payment unlocks more again.
- **No video.** A static screenshot doesn't show what the tool *does*. The fix is a 30-second silent screen recording — it'll outperform any landing page.
- **Disappearing for the first 6 hours after posting.** Replies are where the launch lives. The fix is to block the launch day on your calendar and be present in the comments.
- **One launch and done.** A single post is rarely enough. The fix is to plan 3 launches (X, HN, Reddit) staggered across the week, and a 4th in a month with new features ("v2: now with [thing]").
:::

## Page checkpoint

Self-check:

- Do you have a 30-second silent screen recording ready?
- Is your first-try-free path working without signup?
- Do you have a launch-day calendar blocked out for replies?

## What's next

→ Continue to [Maintenance](./12-maintenance.md) where we'll cover the 15-minute weekly cadence that keeps a solo AI tool alive past month one.
