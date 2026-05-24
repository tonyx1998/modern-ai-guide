---
id: solo-project-types
title: What Kinds of AI Side Projects Actually Work Solo
sidebar_position: 3
sidebar_label: 2. Project types
description: Four shapes of solo AI project that consistently finish — single-prompt tools, niche RAG, narrow agents, AI-augmented existing tools. Plus the shapes that don't.
---

# What Kinds of AI Side Projects Actually Work Solo

> **In one line:** Solo AI projects that ship are narrow, single-prompt, single-input, single-output. Anything that has "platform," "agent ecosystem," or "AI OS" in the description is dead before it starts.

:::tip[In plain English]
Most "AI startup ideas" are about the size of a small company. As a solo builder, you're slicing one of those ideas into the *thinnest possible version* that's still useful — usually one prompt doing one thing. The four shapes below are the ones that consistently finish and find users.
:::

## The four shapes that work

### Shape 1: The single-prompt tool

One prompt, one input, one output. Examples:

- "Paste a contract → get a plain-English summary with risk callouts."
- "Paste a cover letter → get five specific edits."
- "Paste a SQL query → get an EXPLAIN-style breakdown."
- "Paste a doctor's note → get a patient-readable version."

**Why it works:** You can finish v0 in a weekend. No state, no DB, no auth needed for the demo. The whole product is essentially `{ system_prompt, user_input } → completion`. You'll add auth and rate limits in week two, payments in month two.

**Cost shape:** Maybe $0.005–$0.05 per request. A free tier of 10/day per user is cheap.

### Shape 2: Niche RAG over a specific corpus

Q&A or search over a *small, specific, hard-to-google* corpus you legitimately have access to. Examples:

- Q&A over the docs of a tool you use professionally.
- Search across a podcast feed you transcribed.
- "Ask my journal" / "Ask my Obsidian vault" (single-user).
- Q&A over a regulator's PDF library that nobody indexes well.

**Why it works:** The corpus is small enough that pgvector handles it for $0, the audience is narrow enough that you don't need SEO, and the value is high per user (because the data is genuinely hard to get elsewhere).

**Cost shape:** Embeddings once at ingest (cents per thousand chunks), then per-query LLM calls.

### Shape 3: A narrow agent (one to three tool calls, max)

One automation loop that takes a real action. Examples:

- "Drop in a URL → it screenshots, summarizes, posts to your Notion."
- "Forward an email → it triages, drafts a reply, files it."
- "Paste a calendar invite → it researches attendees and writes a one-pager."

**Why it works at solo scale:** You constrain the agent to one or two specific tools you've hand-wired. No open-ended tool selection, no infinite loop risk, no "agent picks its own tools" weirdness.

**Cost shape:** Two to four LLM calls per run. Cap the loop at 5 iterations *with a hard kill*. See [pitfalls](./14-pitfalls.md) — agent runaway is the #1 way solo AI builders blow their budget.

### Shape 4: AI-augmenting an existing tool you already built

Take a non-AI tool you already shipped (or use daily) and bolt on one AI feature. Examples:

- Your todo app → "Summarize what I did this week."
- Your bookmarks app → "Auto-tag and cluster."
- Your blog → "Suggest five tweets from this post."

**Why it works:** Distribution is already solved (you have users / it's your own daily driver), and the AI feature has a clear before/after to measure.

**Cost shape:** Usually invocation-based on a button click, so naturally rate-limited by user behavior.

## The shapes that don't work

:::caution[Anti-patterns: ideas that look big and are]
- **"An AI agent that handles all my [job function]."** End-to-end autonomy is a 50-person company problem, not a solo weekend problem. Ship one tool the agent would have used; let the human be the loop.
- **"A platform for building AI agents."** The platform is the product, you're not the user. You'll spend 12 weekends on auth, billing, and dashboards before anyone agents anything.
- **"A foundation-model-agnostic LLM gateway with cost routing."** This is OpenRouter / Portkey / LiteLLM. They have teams. You don't.
- **"A multimodal multi-agent assistant."** Each adjective is a doubling of scope. By "assistant" you've already committed to indefinite product surface area.
- **"ChatGPT but for [vertical]."** If the only differentiator is a system prompt, the user will just go to ChatGPT and paste the system prompt themselves.
- **Anything with "OS" in the name.** Operating systems are not solo projects.
:::

## How to slice a too-big idea

Take your idea. Find the noun-verb pair at the center of it. Strip everything else.

| Too big                                                | Solo-shaped slice                                   |
|--------------------------------------------------------|-----------------------------------------------------|
| AI sales rep that handles outbound and replies         | "Paste a prospect URL → get a 3-line cold email"    |
| AI lawyer for small businesses                         | "Paste an NDA → get a redline of unusual clauses"   |
| AI personal trainer with vision and tracking          | "Describe today → get tomorrow's 30-min workout"    |
| AI tutor for the SAT                                   | "Paste a question you missed → get one targeted drill" |
| Multi-agent research assistant                         | "Paste a topic → get a 5-source briefing in 60s"   |

The right-hand column is what fits. Ship it. If it works, the left-hand column becomes year 2.

:::note[Try it yourself]
Write your current AI idea as a single sentence. If that sentence has more than one verb, or any of {"platform", "ecosystem", "assistant", "agent for everything"}, you have a too-big idea. Slice it on the table above. Ship the slice this weekend; the rest can grow from a real, used v0.
:::

:::info[Highlight: distribution shape follows project shape]
Single-prompt tools spread on X with a 30-second screen recording. Niche RAG spreads inside the specific community that needs the corpus. Narrow agents spread in `r/sideproject` and AI Tinkerers meetups. AI-augmented existing tools spread to your existing user base. **Pick the shape whose distribution channel you can actually reach** — building a vertical-medical-AI tool when you don't know any doctors is harder than the building part.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Picking Shape 3 (agent) for v0.** Agents are the most fun to demo and the most expensive to debug. The fix is to ship Shape 1 (single-prompt tool) first, learn the auth/rate-limit/cost discipline, *then* try an agent.
- **Picking Shape 2 (RAG) without a real corpus.** Building "RAG over PDFs" with no specific PDF collection is a framework, not a product. The fix is to start from a corpus you genuinely have and that real people want to search.
- **Picking Shape 4 (AI-augment) without an existing tool.** "I'll build the base tool *and* the AI feature" is two projects, not one. The fix is to wait until you have the base tool shipped before adding AI.
- **Confusing "many use cases" with "many users."** A tool that does 10 things for one user is fine. A tool that tries to do 10 things for 10 different audiences is 10 products and you can't market any of them. The fix is to name one audience, one job, one outcome — and put it in the headline.
:::

## Page checkpoint

Self-check:

- Which of the four shapes is your current idea? If you can't pick one, your idea is too big.
- What's the *single sentence* describing your tool, in noun-verb form? Less than 12 words.
- Which distribution channel will the first 10 users come from? If you can't name one, see [launching](./11-launching.md).

## What's next

→ Continue to [Planning a Solo AI Project](./03-planning.md) where we'll turn the chosen shape into a one-pager spec — including eval criteria *before* you write code.
