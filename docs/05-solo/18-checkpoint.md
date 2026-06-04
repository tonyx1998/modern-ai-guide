---
id: solo-ai-checkpoint
title: Chapter 9 Checkpoint
sidebar_position: 99
sidebar_label: ✅ Checkpoint quiz
description: Mandatory checkpoint quiz for Chapter 9 — Solo / Indie AI. 5 random questions drawn from a 14-question bank. Pass to unlock Chapter 10.
---

# Chapter 9 Checkpoint

You've finished the Solo / Indie AI chapter. Take a minute to make sure the core ideas stuck.

There are **14 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page section to revisit, and the link highlights the paragraph for you.

You must pass (≥ 60%) to unlock the Next button and Chapter 10 in the sidebar.

<Quiz id="solo-checkpoint" title="Solo AI workflow checkpoint" sampleSize={5}>

<Question
  prompt="You're a solo AI builder in 2026 considering whether to fine-tune a 7B open model or just call Claude Sonnet 4.5 via the API. Per the chapter's core thesis, what's the default you should start from?"
  options={[
    { text: "Fine-tune the open model — you'll own the weights and avoid per-token costs" },
    { text: "Self-host a quantized model on a single GPU — it's cheaper at scale" },
    { text: "Frontier API by default; deviate only when cost, latency, or privacy actually forces you" },
    { text: "Pick whichever the latest benchmark crowns this month" }
  ]}
  correct={2}
  explanation="Most 'ML engineering' advice optimizes for teams with infra budget. Solo, frontier APIs collapse weeks of infra into one SDK call — only deviate when a concrete constraint (cost, latency, privacy) makes the API path impossible."
  revisit={{ to: "/docs/solo/solo-ai-mindset", label: "Mindset — frontier API by default" }}
/>

<Question
  prompt="A friend pitches: 'an AI agent that browses the web, books flights, and replies to my email — all autonomously.' Which of the four solo-viable project shapes is this, and what's the v0 risk?"
  options={[
    { text: "Shape 1 (single-prompt tool) — low risk, ship in a weekend" },
    { text: "Shape 2 (RAG over docs) — medium risk, mostly retrieval tuning" },
    { text: "Shape 3 (narrow agent) — high risk for v0; tool loops can run away cost-wise and multi-step failures are hard to debug solo" },
    { text: "Shape 4 (background batch job) — low risk, just cron a script" }
  ]}
  correct={2}
  explanation="Narrow agents are tempting but the worst v0 choice for a solo dev: a broken loop can burn $50 in an hour, and root-causing a 7-step failure with no team is brutal. Default to Shape 1 first."
  revisit={{ to: "/docs/solo/solo-project-types", label: "Project types — Shape 3 risk" }}
/>

<Question
  prompt="You have an idea Saturday morning. Per the chapter, which three planning artifacts must exist before you write any code — and how long should producing them take?"
  options={[
    { text: "PRD, architecture diagram, sprint plan — about a week" },
    { text: "One-pager spec, pre-mortem (5 failure modes + 5 guardrails), 20-row eval.csv — one afternoon" },
    { text: "Pitch deck, financial model, GTM plan — one weekend" },
    { text: "Just the eval.csv; everything else emerges from code" }
  ]}
  correct={1}
  explanation="The trio is small on purpose — spec, pre-mortem, eval — and the deadline is an afternoon. Anything heavier becomes procrastination; anything lighter and you skip the pre-mortem that catches the obvious failure modes."
  revisit={{ to: "/docs/solo/solo-planning", label: "Planning — three artifacts" }}
/>

<Question
  prompt="For a chat-shaped solo AI project in 2026, what's the default stack the chapter recommends end-to-end?"
  options={[
    { text: "FastAPI + LangChain + Pinecone + AWS Lambda + Datadog" },
    { text: "Next.js + Vercel AI SDK + TypeScript + Supabase (Postgres + auth + pgvector) + Vercel hosting + Langfuse + Claude Sonnet 4.5 or GPT mid-tier" },
    { text: "Streamlit + Ollama + Chroma + a single $5 VPS" },
    { text: "SvelteKit + custom RAG + self-hosted Postgres on Hetzner + Grafana" }
  ]}
  correct={1}
  explanation="One vendor for hosting + framework (Vercel + Next.js), one for data + auth + vectors (Supabase), the AI SDK for streaming, Langfuse for traces, and a frontier model. Boring on purpose — every swap costs a weekend you don't have."
  revisit={{ to: "/docs/solo/solo-stack-selection", label: "Stack — default 2026 picks" }}
/>

<Question
  prompt="Your project needs heavy GPU inference (open-weights Whisper + custom embedding model) that doesn't fit the serverless edge model. What does the chapter recommend as the solo-friendly GPU compute path, and what framework pairs with it?"
  options={[
    { text: "Provision an A100 on AWS EC2 and write a Flask app" },
    { text: "Modal for serverless GPU + FastAPI for the API surface — pay-per-second, no cluster to babysit" },
    { text: "Buy a 4090 and run it from your closet behind ngrok" },
    { text: "Skip GPU work entirely; only ship API-callable features" }
  ]}
  correct={1}
  explanation="Modal gives you serverless GPU containers billed per second, which is the only sane GPU economics for a solo project with bursty load. FastAPI sits cleanly on top for the HTTP surface."
  revisit={{ to: "/docs/solo/solo-stack-selection", label: "Stack — Modal + FastAPI for GPU" }}
/>

<Question
  prompt="It's the night before you share your URL anywhere. Which TWO guardrails MUST be in place to prevent a five-figure overnight bill?"
  options={[
    { text: "A custom 404 page and a privacy policy" },
    { text: "Dark mode toggle and an onboarding tour" },
    { text: "Auth on the LLM endpoint + per-user rate limit, AND a hard monthly spend cap in the provider dashboard" },
    { text: "A status page and an uptime monitor" }
  ]}
  correct={2}
  explanation="Anonymous + uncapped + LLM is how $200+ bills arrive overnight (or $20K if you're unlucky and end up on HN). Auth gates abuse; the provider-side spend cap is your last-line circuit breaker."
  revisit={{ to: "/docs/solo/solo-env-setup", label: "Env setup — guardrails before sharing" }}
/>

<Question
  prompt="What does the inner dev loop of a well-organized solo AI project look like, and roughly how long is one cycle?"
  options={[
    { text: "Edit a 400-line Python file with the prompt inline → restart server → click through UI → 20 minutes/cycle" },
    { text: "Edit prompts/main.md → run eval.py (or tsx eval.ts) → inspect failures → re-edit → commit → push → auto-deploy. 2–5 min/cycle" },
    { text: "Open a Jupyter notebook, paste outputs into a Google Doc, decide directionally — an hour per change" },
    { text: "Open a PR, request review, wait for CI, merge — 30 minutes plus whoever's around" }
  ]}
  correct={1}
  explanation="Prompts belong in markdown files (not multi-line strings in route handlers), evals run on-demand against a small CSV, and deploys are automatic on push. A 2–5 minute loop is the difference between iterating 30 times a day and 3."
  revisit={{ to: "/docs/solo/solo-development", label: "Development — the inner loop" }}
/>

<Question
  prompt="You're tempted to roll your own auth because 'it's just email + password.' The chapter argues the real follow-on work is what makes this catastrophic for a solo AI dev. Which list captures it?"
  options={[
    { text: "Logo design, copywriting, SEO meta tags" },
    { text: "Password resets, email verification, social login, MFA, sessions, account recovery, passkeys, OAuth flows, breach handling" },
    { text: "ESLint config, Prettier rules, Husky hooks" },
    { text: "DNS, TLS, CDN cache headers" }
  ]}
  correct={1}
  explanation="The login form is the trivial part. The list of follow-on security primitives is months of subtle work; Clerk, Supabase Auth, or Auth.js have spent millions getting them right — use one of them."
  revisit={{ to: "/docs/solo/solo-auth", label: "Auth — why hosted" }}
/>

<Question
  prompt="What's the default pricing shape for a solo AI SaaS in 2026, and why does the chapter explicitly recommend AGAINST a 14-day free trial?"
  options={[
    { text: "Pay-per-token only — passes cost through transparently" },
    { text: "Free tier with auth + daily limit → flat-rate Indie ($5–$15/mo) → flat-rate Pro ($20–$50/mo); no trial — for low-ticket AI tools the trial creates more support burden than subscribers, and the free tier IS the trial" },
    { text: "$0 forever; monetize via ads later" },
    { text: "$299/mo enterprise-only with a sales call" }
  ]}
  correct={1}
  explanation="Low-ticket AI products don't have the support budget for trial-extension emails and 'why was I charged' tickets. A capped free tier filters intent and converts the willing — without trial accounting overhead."
  revisit={{ to: "/docs/solo/solo-payments", label: "Payments — pricing shape" }}
/>

<Question
  prompt="You push a preview deploy that accidentally charges a real card and emails a production user. Per the chapter, what's the structural fix — not the band-aid?"
  options={[
    { text: "Add a runtime if (env !== 'production') guard around payment code" },
    { text: "Only run a single Vercel environment to avoid the confusion" },
    { text: "Scope env vars per environment: sk_test_… Stripe keys + sandbox email + preview DB for Development/Preview; live keys ONLY in Production" },
    { text: "Disable webhooks until launch day" }
  ]}
  correct={2}
  explanation="Runtime checks rot. The fix is structural: production secrets simply don't exist in Preview or Development environments, so a stray preview deploy CAN'T charge a real card even if the code path runs."
  revisit={{ to: "/docs/solo/solo-deployment", label: "Deployment — env separation" }}
/>

<Question
  prompt="What's the smallest observability setup the chapter says earns its keep for a solo AI app, and what specifically does Langfuse give you that Sentry doesn't?"
  options={[
    { text: "Just console.log + grep — anything more is overkill solo" },
    { text: "Langfuse for every LLM call (user ID, tokens, latency, cost) + Sentry for server errors + a daily cron emailing yesterday's spend and top users. Langfuse traces prompts/responses/cost; Sentry traces exceptions." },
    { text: "Datadog APM + PagerDuty + on-call rotation" },
    { text: "Grafana + Prometheus + a self-hosted ELK stack" }
  ]}
  correct={1}
  explanation="Langfuse is the LLM-aware tool: per-call prompts, tokens, cost, latency, user. Sentry handles exceptions and stack traces. The daily cost email is the cheapest possible anomaly detector. Twenty minutes to set up, pays back the first time a user says 'this used to be better.'"
  revisit={{ to: "/docs/solo/solo-observability", label: "Observability — the minimum stack" }}
/>

<Question
  prompt="You're shipping a solo AI tool. Per the chapter, which set of launch channels consistently produces traction in 2026 — and which one DOES NOT belong on the list?"
  options={[
    { text: "X (30s silent screen recording, Tue/Wed/Thu AM ET) + Show HN (with back-story comment) + ONE niche subreddit for your user's domain — and explicitly NOT r/MachineLearning" },
    { text: "TikTok dances + LinkedIn thought leadership + cold DM blasts" },
    { text: "Facebook Ads + Google Ads + a paid PR firm" },
    { text: "Only Product Hunt; nothing else converts" }
  ]}
  correct={0}
  explanation="The three that work: X with a tight video, Show HN with a human comment, and a domain-specific subreddit where your actual users live. r/MachineLearning is full of peers, not customers — wrong audience for a product launch."
  revisit={{ to: "/docs/solo/solo-launching", label: "Launching — three channels" }}
/>

<Question
  prompt="Your narrow agent (Shape 3) keeps making one extra tool call and burning budget. The chapter prescribes three hard caps that must be in place and never removed. Which three?"
  options={[
    { text: "maxRetries, timeout, and a Sentry alert" },
    { text: "maxSteps (e.g. 4), per-session token budget (e.g. 20K), and a size cap on tool outputs (e.g. truncate fetched pages to 8KB)" },
    { text: "A Redis lock, a feature flag, and a kill switch in the dashboard" },
    { text: "Lower temperature, smaller model, fewer tools" }
  ]}
  correct={1}
  explanation="The three are independent and load-bearing: step cap stops infinite loops, token budget stops slow bleeds, output truncation stops a single 2MB fetched page from blowing the context window and the bill in one call."
  revisit={{ to: "/docs/solo/solo-pitfalls", label: "Pitfalls — agent kill switch" }}
/>

<Question
  prompt="You shipped the meeting-notes summarizer from the sample chapter. It now has 600 paying users at $9/mo, you're working 35 hrs/week on it, you can't take a vacation, and last week a refactor quietly broke the summary endpoint for 4 hours. Per the chapter, what's this — and what's the response?"
  options={[
    { text: "Normal solo turbulence — push through with more weekend hours" },
    { text: "A clear graduation moment: real users hurt by a real outage + on-call blocking vacation + revenue approaching day-job income + your time (not user demand) is the bottleneck → time to incorporate, add E2E tests + uptime alerts + runbook, and seriously consider a co-founder or first hire" },
    { text: "A signal to throw the project away and start fresh" },
    { text: "Proof the default stack doesn't scale — rewrite in Rust" }
  ]}
  correct={1}
  explanation="That's the textbook graduation moment from the chapter: revenue near day-job, time-bottlenecked (not demand-bottlenecked), and a real incident with real users. The fix isn't 'try harder solo' — it's adding the specific process the previous stage's pain has now earned its way into."
  revisit={{ to: "/docs/solo/solo-graduating", label: "Graduating — clear graduation moment" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 10: Startup AI Team](/docs/startup) where the same workflow scales to a team of 3–10, with the trade-offs that come with not being alone.
