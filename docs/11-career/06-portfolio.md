---
id: career-portfolio
title: Portfolio anatomy
sidebar_position: 7
sidebar_label: 6. Portfolio
description: What a 2026 AI engineer's portfolio actually looks like. Shipped > polished. Evaluated > impressive. Specific project ideas.
---

# Portfolio anatomy

> **In one line:** Three shipped projects with evals, a live URL on a custom domain, a blog post per project, and one OSS PR to a serious AI library — that's a 2026 AI-engineering portfolio that gets interviews.

:::tip[In plain English]
Recruiters and hiring managers at AI-native companies don't read resumes carefully — they skim portfolios for *evidence you've shipped LLM features end-to-end with the discipline of an evals story*. A live URL with a real eval suite beats a polished GitHub repo with 200 stars and no deployed link. Your portfolio is not a resume; it's your *proof of work*.
:::

## What hiring managers actually look for

In rough order of weight:

- **Things you shipped** — live URLs > GitHub stars > forks > READMEs. A working `yourname.com` link is worth more than 1000 GitHub stars on a demo repo.
- **Evals** — a repo that has an eval suite (`evals/` directory, Braintrust or Promptfoo config, a results table in the README) is rare and immediately impressive. In 2026 surveys of AI hiring managers, "has an eval suite" is the #1 portfolio signal.
- **Real users** — even 10 daily-active users beats 100 synthetic demos. A waitlist with 50 signups counts.
- **Writing** — a blog post per project explaining one specific tradeoff carries enormous signal. "How I cut my retrieval latency from 3s to 400ms" reads as senior; "I built a chatbot" reads as 2023.
- **Cost / quality awareness** — "I cut my bill 60% by routing easy queries to Haiku and hard ones to Sonnet, with a router that adds 0.4% to error rate" reads as senior.
- **OSS contribution to a serious AI tool** — one merged PR to Langfuse, Braintrust, vLLM, Promptfoo, LangGraph, or LlamaIndex is hire-yourself signal.

## A strong 2026 entry-level portfolio

Five components. Pick projects from the menu below, or substitute equivalents — the *shape* is what matters.

### Component 1: a shipped streaming chat app

Your "I can ship the basic AI feature" proof.

- **Stack:** Next.js + Vercel AI SDK + Anthropic or OpenAI + a custom domain.
- **Bonus:** persistent conversation storage, tool calls, prompt caching, basic eval set.
- **Project ideas:** a personalized study buddy fine-tuned to your course load; a chatbot that knows your codebase; a writing coach that learns your style.

### Component 2: a shipped RAG app over a non-trivial corpus

Your "I can do retrieval at production quality" proof.

- **Stack:** Python or TS + pgvector or Qdrant + hybrid search + rerank + LLM-as-judge eval.
- **Bonus:** citation enforcement (the model points at chunks), an eval suite that measures recall@k and end-to-end correctness, a public results table.
- **Project ideas:** RAG over the SEC's EDGAR filings; RAG over the entire arXiv corpus filtered by your field; RAG over your kindle highlights; RAG over a niche dataset you know well (board game rulebooks, climbing routes, recipe corpora).

### Component 3: a shipped agent doing one useful real-world task

Your "I can do agentic systems" proof.

- **Stack:** LangGraph or Inngest or Mastra + MCP servers + Anthropic or OpenAI + observability (Langfuse, LangSmith).
- **Bonus:** a deterministic test harness for at least one critical multi-step trace, an eval that scores agent outcomes not just final messages, MCP server you wrote yourself.
- **Project ideas:** an agent that triages your GitHub issues and drafts responses; an agent that books restaurants via OpenTable; an agent that researches a stock by reading news + filings + Twitter; an agent that auto-applies to jobs (carefully).

### Component 4: a blog post per project

- 800–2000 words each.
- Each one focuses on **one specific decision** you made and why — not a feature tour.
- Examples of good post shapes: "Why I switched from LangChain to LangGraph for project X", "Three eval failures that taught me chunking matters more than the embedding model", "How prompt caching saved $400/month on a side project."
- Hosted at your custom domain or dev.to / Hashnode.

### Component 5: one OSS PR to a serious AI tool

- Pick a tool you actually use: Langfuse, Braintrust, Promptfoo, LangGraph, LlamaIndex, vLLM, Mastra, Inngest, Outlines, Instructor, DSPy, an MCP server.
- Find a "good first issue" or fix a bug you actually hit.
- The PR description matters — write it like you'd write a postmortem.

## Project ideas, expanded

If you're stuck picking projects, these are 2026-current ideas that exercise the right muscles:

- **A code review bot for a public OSS repo.** Pulls PRs, generates structured review comments, includes confidence scores, has an eval set of "good review" vs "bad review" examples.
- **A personalized arXiv digest.** Daily email of new papers in your field, ranked + summarized + tagged with relevance reasons; eval set against your own ground-truth saves.
- **A study planner that reads your syllabus and your calendar.** Ingest PDFs, RAG over your notes, generate daily plans, adjust to feedback.
- **A meeting-notes-to-actions agent.** Transcribes via Whisper or Deepgram, extracts decisions and action items, writes them to Linear or Notion via tool calls.
- **A "your inbox in one screen" RAG.** Index your last 5 years of email, ask natural-language questions, get answers with citations.
- **A small voice-agent.** Vapi or LiveKit + Anthropic + your own knowledge base; latency budget under 1s.
- **An eval platform of your own.** Even a tiny one. The act of building it teaches you what production eval platforms do and don't.
- **A document-AI tool for a niche domain.** Climbing route guides, board game rulebooks, IRS forms — anywhere off the well-trodden corpus.

## What doesn't move the needle

- A LangChain tutorial replica with no original twist.
- "I read 100 AI papers" with nothing built.
- A long README with no live demo.
- A GitHub profile with 30 forks of model repos and zero original repos.
- A Twitter feed full of "wow, AI is wild" without any of your own work.
- A Kaggle notebook with no deployment.

## Open source as a portfolio

A serious AI engineer's portfolio in 2026 usually includes at least one open-source signal. Tiers, weakest to strongest:

1. **Forked a repo, ran the tutorial.** No signal.
2. **One merged docs PR.** Weak positive — shows you can navigate a repo.
3. **One merged bug-fix PR.** Solid positive.
4. **Maintainer of a small library** (50–500 stars) — strong positive.
5. **Significant contributor to a major library** (Langfuse, Braintrust, vLLM, LangGraph) — very strong positive.
6. **Maintainer of a widely-used library** (1K+ stars) — hire-yourself signal at most companies.

Aim for at least tier 3 by your first AI job, tier 4 by Year 3.

:::note[Worked example: a "hireable junior" portfolio]
A junior portfolio that actually moves recruiters at AI-native scaleups in 2026 might look like:

1. **studybuddy.yourname.dev** — streaming chat app fine-tuned to your course load. README has eval scores from a 50-case test set.
2. **arxiv-radar.yourname.dev** — daily personalized arXiv digest, RAG-powered, 30 weekly users, public dashboard of click-through-rate.
3. **issue-triage-bot** on GitHub — open-source MCP-based agent that triages GitHub issues, deployed as a GitHub App on 3 repos.
4. **yourname.dev/blog** — five posts, each on one decision in one project.
5. **One merged PR to Langfuse** — added a missing observability hook for streaming completions.

Each has: a custom domain or active OSS link, a README that talks about evals, a public results page. **Five of these beat fifty LangChain demo repos.**
:::

:::info[Highlight: the live URL + eval suite combination is the single biggest signal]
If you do nothing else from this page, do these two: deploy one project to `yourname-tool.dev`, and add an `evals/` directory with a Braintrust or Promptfoo config + 20 test cases. The gap between `localhost:3000` + no evals and `tool.com` + a results table is the entire gap between "I'm learning AI engineering" and "I'm an AI engineer." A $12 domain + 4 hours of eval work closes it.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Building the portfolio site before the portfolio.** Months spent perfecting a homepage with no real projects to link to is the most common form of procrastination. Ship one real project first; a single markdown README can serve as "the showcase."
- **Wrapping every project in a thin Anthropic / OpenAI API call and calling it AI engineering.** A ChatGPT wrapper around a public API is the 2026 equivalent of a todo app — recruiters see twenty a week. The AI should be solving a real retrieval / agent / eval problem, not the headline.
- **Skipping evals because they're not flashy.** A repo with an `evals/` directory is rarer than a repo with 1K stars in 2026. This is the single highest-leverage portfolio investment.
- **Building three half-projects instead of one finished one.** A junior portfolio with one polished + deployed + written-about project plus an OSS PR beats a portfolio with seven abandoned repos.
- **Open-sourcing only your own toy repos.** Three merged PRs to libraries the hiring team actually uses beats 500 stars on a personal repo nobody else touches.
- **Going quiet between projects.** A blog with one post from 2024 reads worse than no blog. If you can't sustain writing, delete the link.
:::

→ Next: [The "defend your portfolio" drill](./defend-portfolio-drill.md).
