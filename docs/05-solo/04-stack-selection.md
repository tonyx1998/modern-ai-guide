---
id: solo-stack-selection
title: Stack Selection
sidebar_position: 5
sidebar_label: 4. Stack Selection
description: The two default 2026 solo AI stacks — TypeScript (Next.js + Vercel AI SDK) and Python (FastAPI + Modal) — and when to pick which.
---

# Stack Selection

> **In one line:** Pick TypeScript if your project is mostly chat / streaming UI; pick Python if it's mostly data, vision, or background jobs. Don't agonize.

:::tip[In plain English]
There's a TypeScript path and a Python path. Both are well-trodden in 2026, both have free tiers, both ship in a weekend. The wrong choice costs you a few weeks of friction; the worst choice is *no choice* — analysis-paralysis is the actual project killer. Read this page, pick one, never reopen it.
:::

## The two default stacks

### Stack A: TypeScript-first (chat-shaped projects)

```
App framework:    Next.js 15 (App Router)
LLM library:      Vercel AI SDK
Language:         TypeScript
Styling:          Tailwind + shadcn/ui
Database:         Supabase Postgres (with pgvector)
Auth:             Supabase Auth or Clerk
Payments:         Stripe Checkout (or Polar)
Hosting:          Vercel free tier
Observability:    Langfuse free tier
Model:            Claude Sonnet 4.5 (Anthropic) or GPT-5 mini (OpenAI)
```

**Use this if:**

- The user experience is a chat box, a streaming text output, or a form-in / markdown-out tool.
- You want to deploy from `git push` with zero infra config.
- You care about TypeScript end-to-end.
- The LLM call is the entire backend.

### Stack B: Python-first (data, vision, batch, agents)

```
App framework:    FastAPI
Runtime/host:     Modal (preferred) or Render or Fly.io
Language:         Python 3.12
Frontend:         Next.js or Streamlit or Gradio (Hugging Face Spaces)
Database:         Supabase Postgres (with pgvector)
Auth:             Supabase Auth or Clerk
Payments:         Stripe Checkout (or Polar)
Hosting:          Modal serverless functions
Observability:    Langfuse free tier
Model SDK:        Anthropic Python SDK or OpenAI Python SDK
Model:            Claude Sonnet 4.5 or GPT-5 mini
```

**Use this if:**

- You're doing PDF parsing, document chunking, image / audio work, or anything `numpy`-shaped.
- You want background jobs, cron, or batch processing without standing up infra.
- You want a quick Streamlit / Gradio demo to iterate before building a real UI.
- You're more comfortable in Python than TypeScript and the project's center of gravity is the model call.

## Why these specific picks

### Why Vercel AI SDK (TS)

Streaming chat is one line. Tool calling, structured output, and provider-swapping all share one interface. You can move from OpenAI to Anthropic to Google by changing the `model:` arg.

### Why Modal (Python)

Serverless Python with GPU access, cron, and queues, all defined in Python decorators. No Dockerfile, no Kubernetes, no infra dashboard. Pay per second of execution. Free credits cover hobby use. The closest thing Python has to "Vercel for AI."

### Why Supabase

Postgres + auth + pgvector + storage + a dashboard, on a free tier that's generous enough you'll probably never pay. One product, one bill, one URL. The boring choice.

### Why Claude Sonnet 4.5 OR GPT-5 mini as the default model

You want a frontier-class model that costs roughly **$3 / $15 per million tokens** (Sonnet) or comparable on GPT mid-tier. Don't start on the top-flagship ($15 / $75-ish) — your evals usually don't justify the markup at v0. Don't start on the cheap-tier model — you'll spend the savings on prompt engineering for quality you could've gotten for free.

### Why Langfuse free tier

Captures every prompt, response, latency, and cost. Free up to a real volume of traces. Replaces having to roll your own logging.

### Why Stripe Checkout (with Polar as the alternative)

Stripe Checkout is the boring default for payments. Polar handles sales tax (Stripe Tax also does, but adds setup) and is built for indie / digital products. For a US-only or US-mostly customer base, Stripe Checkout direct is fine.

## Why NOT [other stack]?

You'll be tempted to evaluate alternatives. Resist for v0:

- **Why not LangChain?** The SDK + 80 lines beats it for solo projects. You'll fight LangChain abstractions when debugging instead of fighting the prompt. Reach for it later if your project genuinely needs the integrations.
- **Why not Pinecone / Weaviate / Qdrant?** pgvector handles up to millions of rows for $0. If you outgrow it, you have a real product, not a side project.
- **Why not LiteLLM / OpenRouter?** Useful once you have multiple models in production, premature at v0 with one model.
- **Why not deploy on AWS / GCP?** Because you'd spend the weekend on IAM instead of the product.
- **Why not Bun / Deno?** Use them if you already love them; otherwise the default Vercel + Next runtime has fewer footguns.
- **Why not a self-hosted open model?** See [mindset](./01-mindset.md). At solo scale, the math almost never works out.

## The "I can't decide" rule

If you've spent more than 30 minutes deciding between Stack A and Stack B, **default to Stack A** (TypeScript / Vercel AI SDK / Next.js). It has the lowest infra ceiling and the shortest time to a deployed URL. You can always do data-heavy parts as Modal sidecars later.

:::note[Worked example: how to pick in 60 seconds]
Project: "Paste a YouTube URL → get a structured summary."

- The UI is a single input + streaming markdown output → chat-shaped → Stack A.
- But: I need to download the transcript, which is a Python ecosystem strength.
- Decision: Stack A for the UI on Vercel, with one Modal function that handles transcript fetching, called from the Vercel route handler. Total: one Vercel project, one Modal function. Under two hours of wiring.

Project: "Batch-summarize my podcast back catalog into a searchable site."

- Heavy data work upfront (transcribe N hours), then a small read-only frontend → Stack B for the batch, Stack A (or just a static site) for the read UI.
- Decision: Modal to transcribe + chunk + embed. Supabase as the store. Next.js static frontend hitting Supabase directly.
:::

:::info[Highlight: the boring stack is the right stack]
Indie AI Twitter will tell you about a new framework every week. Most of them are abstractions over the same underlying API call. **The boring stack on this page carries you from zero to roughly 10K MAU and roughly $1K/mo MRR without architectural changes.** By the time you outgrow it, you'll have revenue to fund the rewrite — and the data on your actual workload to make that rewrite smart. Don't pre-pay.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Comparison-shopping LLM providers for a week.** Anthropic vs OpenAI vs Google benchmarks read all weekend, no code written. The fix is to pick one (Claude Sonnet 4.5 *or* GPT mid-tier), commit, and swap later if your evals say so.
- **Adding a framework "to be safe."** "I'll just install LangGraph in case I need it later" leads to abstractions across your codebase you never wanted. The fix is to start with the raw SDK; reach for a framework only when you feel real pain it solves.
- **Splitting hosts to "save money."** Frontend on Cloudflare, API on Fly, DB on Neon, queue on Upstash, auth on Clerk — five dashboards to save $20/mo. The fix is one platform until the bill genuinely hurts.
- **Adopting the hot new model on the day it ships.** The benchmarks lie until the real-world quirks shake out. The fix is to wait two weeks; let other people find the regressions first.
- **Picking the stack you want to learn instead of the stack that ships.** Honest mistake but real. The fix is the same as in the web-dev guide: be honest about whether your primary goal is the product or the learning. Both are fine — just don't pretend.
:::

## Page checkpoint

Self-check:

- Did you pick Stack A or Stack B? (Yes is the only acceptable answer.)
- Have you picked one model — Claude Sonnet 4.5 or GPT-5 mini — and committed to it for v0?
- Did you spend less than 30 minutes on this decision?

<Quiz id="solo-stack-selection-quick-check" variant="micro" title="Quick check">

<Question
  prompt="According to this page, when should you pick the Python-first stack (Stack B) over the TypeScript-first stack (Stack A)?"
  options={[
    { text: "Whenever you want the cheapest possible hosting" },
    { text: "When the project centers on data work, vision or audio, or background and batch jobs" },
    { text: "Whenever the project involves calling an LLM at all" },
    { text: "When you need streaming chat UI with minimal config" }
  ]}
  correct={1}
  explanation="Stack B (FastAPI + Modal) is for PDF parsing, chunking, image or audio work, cron, and batch processing — the numpy-shaped problems where Python's ecosystem wins. Streaming chat UI is the signature use case for Stack A with the Vercel AI SDK, so that option inverts the page's advice."
/>

<Question
  prompt="You have spent more than 30 minutes torn between Stack A and Stack B. What does the page tell you to do?"
  options={[
    { text: "Prototype both stacks for a day each and compare" },
    { text: "Pick whichever stack you most want to learn" },
    { text: "Default to Stack A, since it has the lowest infra ceiling and shortest time to a deployed URL" },
    { text: "Post in a community and ask which stack is better" }
  ]}
  correct={2}
  explanation="The 'I can't decide' rule is explicit: past 30 minutes of deliberation, default to TypeScript / Next.js / Vercel, and bolt on Modal sidecars later if data-heavy parts appear. Prototyping both sounds rigorous but doubles the cost of a decision the page says barely matters — analysis-paralysis, not the wrong stack, is the actual project killer."
/>

<Question
  prompt="Why does the page recommend pgvector over a dedicated vector database like Pinecone for v0?"
  options={[
    { text: "pgvector has better retrieval quality than any dedicated vector DB" },
    { text: "Dedicated vector DBs cannot store more than a few thousand vectors" },
    { text: "Pinecone does not offer any free tier" },
    { text: "pgvector handles up to millions of rows for free, and outgrowing it means you have a real product" }
  ]}
  correct={3}
  explanation="The argument is about scale-appropriate cost: pgvector inside Supabase covers solo-scale corpora for $0, and if you ever outgrow it you have revenue and real workload data to fund the upgrade. The quality claim is the tempting distractor — the page never says pgvector retrieves better, only that dedicated clusters are premature at this scale."
/>

</Quiz>

## What's next

→ Continue to [Environment Setup](./05-env-setup.md) where we'll open the seven free-tier accounts and get your `.env.local` populated in under an hour.
