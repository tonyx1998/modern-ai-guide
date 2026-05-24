---
id: career-continuous-learning
title: Continuous Learning
sidebar_position: 9
sidebar_label: 8. Continuous Learning
description: How to stay current in a field that moves monthly — the diet of papers + Twitter + blogs + side projects, with concrete cadence.
---

# Continuous Learning

> **In one line:** 20 minutes daily + 90 minutes weekly + one quarterly deep-dive on a new tool + one yearly career audit — sustained for years — beats any intensive burst, and is the only way to keep up with AI without burning out.

:::tip[In plain English]
AI engineering moves faster than any other software discipline in 2026. Anthropic, OpenAI, and DeepMind each ship a meaningful release roughly monthly. New eval frameworks, vector stores, and agent libraries appear weekly. You will not read everything. The engineers who stay current for years treat learning like exercise — small, regular, sustainable — not like cramming for a final.
:::

## The cadence that works

### Daily (20 minutes)

- 10 minutes: scan one of **Latent Space, The Batch (Andrew Ng), Import AI (Jack Clark), TLDR AI, AI News by Smol AI, Ben's Bites, Last Week in AI**. Pick *one* — not all.
- 10 minutes: skim X / Bluesky for what 5–15 people you trust are talking about. Mute everyone else.

If you only do this much, you'll know what shipped this week within 48 hours.

### Weekly (90 minutes, one fixed slot)

- 30 minutes: read one paper or one in-depth blog post properly. Not a thread — actual long-form.
- 30 minutes: try one new tool hands-on. Read the docs, build a tiny example.
- 30 minutes: write something — a tweet thread, a short blog post, a Slack message to your team — about what you learned.

The "write something" step is the magic. It forces you from skim-comprehension to actual understanding.

### Monthly (one half-day)

- Pick one new technology or technique to learn properly (not just skim). Examples in 2026: a new model architecture (Mamba-2, hybrid SSMs), a new agent framework (Mastra, Restate), a new eval methodology (CALI, AlignBench), a new inference technique (speculative decoding, structured generation).
- Build a small demo with it. Add it to a portfolio project or write it up.

### Quarterly (one full day, recurring)

- Pick one new technology to learn *properly* — not just play with. Read the source code. Write something non-trivial. Compare it honestly to what you were using before.
- Re-evaluate your skill stack — what's becoming legacy (LangChain v0.1, raw OpenAI completions API, hand-rolled prompt chains)? What's emerging (MCP, structured generation by default, eval-driven prompt iteration)?

### Yearly (one full weekend)

- Audit your career trajectory. Are you growing? In the right direction? On track for your 3-year goal?
- Consider a side project that pushes you out of your comfort zone (a different specialization, a different tier of company, a different stage of career).
- Update your levels.fyi data; benchmark your comp.

## Information diet: the named sources

### Newsletters (pick 1–2, not all)

- **Latent Space** (Swyx & Alessio) — the closest thing to "AI Engineering canonical." Long-form, with podcast.
- **The Batch** (Andrew Ng / DeepLearning.AI) — Sunday roundup.
- **Import AI** (Jack Clark) — weekly, opinionated, frontier-lab-flavored.
- **TLDR AI** — daily, fast skim.
- **AI News by Smol AI** — daily, very technical.
- **Ben's Bites** — daily, business-flavored.
- **Last Week in AI** — weekly podcast-style summary.
- **The Sequence** — twice weekly, technical depth.
- **Interconnects** (Nathan Lambert) — ML / RLHF / model-evaluation depth.

### Blogs to follow

- **Anthropic blog** (especially Engineering and Research posts).
- **OpenAI blog** (less technical depth than Anthropic but tracks the frontier).
- **Simon Willison's blog** — possibly the highest-signal individual AI blog in 2026.
- **Hamel Husain** — evals, applied AI engineering.
- **Eugene Yan** — applied ML / AI patterns.
- **Chip Huyen** — ML systems, AI engineering book author.
- **Phillip Carter** (Honeycomb) — AI in production / observability.
- **Lilian Weng** — deeply technical AI surveys.
- **Sebastian Raschka** — clear explanations of model architectures.
- **Jay Alammar** — visual explanations (the OG "Illustrated Transformer").
- **Engineering blogs:** Anthropic, OpenAI, Vercel (AI), Cloudflare (AI), Notion AI, Linear, Cursor, Sourcegraph, Stripe, GitHub, Replicate, Modal.

### X / Twitter / Bluesky accounts worth following

(Not an endorsement of any individual — these are people whose technical output is high-signal.)

- Practitioners: @swyx, @hwchase17, @soumithchintala, @jeremyphoward, @karpathy, @ID_AA_Carmack, @simonw, @HamelHusain, @eugeneyan, @chipro, @AnthropicAI, @OpenAI, @sama, @demishassabis.
- Eval / observability: @bryanwilhite, @vintrocode, @phillipcarter.
- Inference / infra: @woosuk_k, @soumith, @charles_irl.
- Voice / agents: @kwindla, @swyx (again), folks at Sierra and Decagon.

Build your list from people whose tweets you actually read end-to-end; mute everyone whose tweets you scroll past.

### Podcasts

- **Latent Space** (Swyx & Alessio) — the canonical AI-engineering podcast.
- **Dwarkesh Podcast** — long-form interviews with frontier-lab leaders.
- **No Priors** (Sarah Guo, Elad Gil) — investor-flavored but high signal.
- **Cognitive Revolution** — broad AI conversations.
- **Practical AI** — applied AI engineering.
- **The TWIML AI Podcast** — long-running, broad.

## AI as a learning tool

Modern AI assistants (Claude, ChatGPT, Cursor) are excellent at:

- Explaining unfamiliar code line by line.
- Walking through concepts at your level — and re-explaining when you say "I don't get it, try again."
- Pair-programming on learning projects.
- Generating practice problems and grading your attempts.
- Reviewing your code with senior-engineer-level critique.

Use them as tutors. Ask questions you'd be embarrassed to ask a colleague. **Verify the answers** — they're sometimes wrong, especially on AI-engineering topics that postdate their training — but the learning loop is fast.

The best 2026 self-study workflow: read the official docs first, ask Claude to explain anything confusing, then build the thing without the chat open.

## Books worth reading (for AI engineers)

- **"Designing Machine Learning Systems"** by Chip Huyen — production ML / AI infra.
- **"AI Engineering"** by Chip Huyen (2025) — the canonical book for the role.
- **"Build a Large Language Model (From Scratch)"** by Sebastian Raschka — for the depth-curious.
- **"Hands-On Large Language Models"** by Jay Alammar & Maarten Grootendorst — practical patterns.
- **"Designing Data-Intensive Applications"** by Martin Kleppmann — the backend bible; AI systems are data-intensive systems.
- **"The Pragmatic Programmer"** by Hunt & Thomas — timeless.
- **"Site Reliability Engineering"** (Google, free online) — how big systems are operated.
- **"Staff Engineer"** by Will Larson — the senior IC track for engineering management awareness.

## Free courses & curated resources

- **Hugging Face NLP & LLM courses** — free, excellent.
- **Andrej Karpathy's "Zero to Hero" series** on YouTube — the canonical "build it from scratch" path.
- **DeepLearning.AI short courses** — bite-sized, often with named instructors (Andrew Ng + a specific company partner).
- **Anthropic's prompt engineering documentation + interactive tutorial.**
- **OpenAI's GPT best practices guide.**
- **MIT 6.5940 (TinyML / Efficient ML)** — free lecture videos.
- **Stanford CS25 — Transformers United** — guest-lecture series.
- **fast.ai's Practical Deep Learning** — still the best free DL course in 2026.

## Paid courses worth the money in 2026

- **Maven cohort courses** — "Mastering LLMs" by Hamel Husain et al., "AI Engineering Bootcamp" by Greg Kamradt, "Building Voice Agents." Cohort-based, expensive ($1.5K–$3K), high signal for serious learners.
- **DeepLearning.AI's longer specializations** — for foundations.
- **Anthropic Academy / OpenAI Academy** — official, free or low-cost, often the most up-to-date.

## Conferences worth the trip

- **AI Engineer World's Fair / AI Engineer Summit** — the canonical industry conference. SF, twice a year.
- **NeurIPS, ICML, ICLR** — academic; increasingly industry-attended.
- **MLSys** — systems / inference depth.
- **AI Quality Conference / EvalsCon** — evals depth.
- **CVPR, SIGGRAPH** — multimodal / visual AI.
- **Voice & AI** (London) — voice AI depth.
- **GTC** (NVIDIA) — hardware + inference.
- **Latent Space's "AI in Action" events** — small, high-signal.

:::note[Try it yourself: a Sunday 30-minute habit]
Pick a fixed slot — say, Sunday evening, 30 minutes. In that slot only:

1. Skim your newsletter backlog (10 min).
2. Pick one link that looks the most interesting and read it properly (15 min).
3. Note one thing you'd try in your next project or share with your team (5 min).

That's it. Done weekly for a year, this gives you 50 deep reads — more than enough to stay in touch with AI engineering without falling into the doomscroll-shaped hole that X creates.
:::

:::info[Highlight: writing is the single biggest learning-amplifier]
You retain ~10% of what you read passively, ~50% of what you discuss, ~90% of what you teach. The cheapest way to "teach" is to write — a Slack message to your team, a tweet thread, a 400-word blog post, a comment on someone else's post. **Write about every non-trivial thing you learn.** If you can't summarize it in your own words in three paragraphs, you don't actually know it yet.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Subscribing to 30 newsletters and reading none of them.** A bulging inbox feels like learning and isn't. Pick one daily + one weekly; archive the rest.
- **Mistaking AI-generated explanations for understood concepts.** Asking Claude to explain LLM-as-judge calibration and nodding along is not the same as building an eval suite. After every AI explanation, force yourself to build the tiny version without the chat open.
- **Doomscrolling X and calling it "staying current."** The release-noise-to-signal ratio on AI Twitter in 2026 is brutal — most "breakthrough" threads are marketing. The Sunday 30-minute habit beats two hours of scrolling on Wednesday.
- **Reading papers without ever building the technique.** A paper-a-week habit with zero implementation is worse than a paper-a-month habit where you build a working version of one. Implementation surfaces what the paper didn't tell you.
- **Skipping the conferences because "it's all online now."** AI engineering is still very much a relationships-driven field. One in-person AI Engineer Summit can yield more job opportunities than three months of LinkedIn.
- **Stopping career audits once employed.** The yearly "am I still growing?" question is easier to dodge once a paycheck is landing. Put it on the calendar; otherwise three years vanish.
- **Chasing every new framework.** In 2024 it was DSPy; in 2025 it was CrewAI; in 2026 it'll be something else. The primitives (prompts, embeddings, evals, tools, observability) change slowly; frameworks come and go.
:::

→ Next: [Career Pitfalls](./10-pitfalls.md).
