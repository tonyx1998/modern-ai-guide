---
id: intro
title: Modern AI Engineer Guide
sidebar_position: 1
sidebar_label: Introduction
slug: /
description: How AI systems are actually built in 2026 — for absolute beginners and beyond. 18 chapters in seven parts, designed so you can master one topic per page.
toc_max_heading_level: 2
---

# Modern AI Engineering: A Comprehensive Guide (2026)

*How AI systems are actually built in 2026 — for absolute beginners and beyond.*

**What it is** — A 2026 reference on how LLM-powered applications are designed, built, evaluated, shipped, and operated, paired with a step-by-step roadmap for getting there from zero. **18 chapters in seven parts**, split into focused single-topic pages. Read it front to back as a complete beginner and you finish job-ready.

**Who it's for** — Anyone from "I've used ChatGPT but never written code against an LLM" to "I build production AI systems and want a refresh on 2026 tooling."

**Where to start** — If you're new to AI engineering, jump straight to [the first lesson →](/docs/foundations/tokens). Everything else fans out from there.

*Last reviewed: June 2026. Model names, pricing, and "current state" claims live on the [Model snapshot](/docs/model-snapshot) page and in clearly dated sections — the AI space moves faster than anywhere else in software, so confirm specifics before relying on any single recommendation.*

---

## Two ground-truth facts before you start

1. **An LLM is just a function that takes text in and produces text out.** Every advanced AI feature — chat, search, agents, multimodal — is layered on top of that single primitive.

2. **Building LLM apps is mostly software engineering, plus three new disciplines: prompting, retrieval, and evals.** If you can already build a CRUD app, you're 70% of the way there.

---

## What this guide covers

**Seven parts, eighteen chapters** — written so a complete beginner can follow along while still being useful to working engineers. Read top to bottom and you go from "what is a token?" to designing evals, shipping safely, fine-tuning a model, building voice agents, and reading the architectures of products like Cursor and Glean. Each part builds on the one before it.

### Part A · Fundamentals
How LLMs actually work, and how to learn the rest of this guide.

- **[1. Foundations →](/docs/foundations)** — The bedrock: tokens, embeddings, the transformer (just enough to be useful), context windows, sampling, streaming, structured output, tool calling, RAG, and agent loops.
- **[2. Roadmap →](/docs/roadmap)** — A staged, beginner-to-job-ready learning path: what to learn, in what order, and how to know you've learned it.

### Part B · Building & shipping
The process you follow and the tools you reach for.

- **[3. Lifecycle →](/docs/lifecycle)** — What an AI project looks like from "idea" to "shipped and measured": problem framing, data, evals, build, harden, deploy, monitor, improve.
- **[4. Tech Stack →](/docs/stack)** — Every major provider, framework, and service explained — OpenAI / Anthropic / Google / open models · vLLM / Ollama · LangChain / LlamaIndex / DSPy / Vercel AI SDK · Pinecone / pgvector / Turbopuffer · Braintrust / Langfuse · Portkey / OpenRouter.

### Part C · Core disciplines
The two skills that separate a demo from a production system.

- **[5. Evaluation & Measurement →](/docs/evaluation)** — The #1 AI-engineering discipline: eval types, datasets, metrics, LLM-as-judge, human eval, regression-gating in CI, and production evals + the data flywheel.
- **[6. Responsible & Safe AI →](/docs/safety)** — Threat modeling, prompt injection & jailbreak defense, guardrails, hallucination control, bias & fairness, privacy, red-teaming, and 2026 governance (EU AI Act, NIST AI RMF).

### Part D · Specializations
Change the model's behavior, and build beyond text.

- **[7. Fine-tuning & Customization →](/docs/fine-tuning)** — When fine-tuning beats prompting/RAG, dataset prep, SFT, LoRA/QLoRA, preference tuning (RLHF/DPO), distillation, and serving fine-tunes.
- **[8. Multimodal & Voice AI →](/docs/multimodal)** — Building with vision, image generation, audio/speech, realtime voice agents, video, and multimodal retrieval — and how to evaluate non-text outputs.

### Part E · Workflows by scale
The same kind of AI feature, shipped three radically different ways.

- **[9. Solo / Indie →](/docs/solo)** · **[10. Startup AI Team →](/docs/startup)** · **[11. Enterprise AI →](/docs/enterprise)** — Free-tier solo stack, startup eval + obs stack, enterprise governance + private cloud, and how a feature actually ships at each scale.
- **[12. Comparison →](/docs/comparison)** — The three workflows side by side: stack, process, economics, and the tradeoffs.

### Part F · Judgment & patterns
How to decide, and what recurs in every production LLM app.

- **[13. Decisions →](/docs/decisions)** — The recurring "should we…" debates with concrete rules: prompt vs RAG vs fine-tune · single agent vs chain vs multi-agent · closed vs open model · build vs buy · when *not* to use AI.
- **[14. Production Patterns →](/docs/patterns)** — The patterns that recur in every shipped app: streaming UX, structured output, tool use, RAG in production, cost control, LLMOps, safety, and fallbacks.

### Part G · Career & reference
Grow as an AI engineer, study shipped systems, and look things up.

- **[15. Career →](/docs/career)** — What an AI engineer actually does in 2026: AI engineer vs ML engineer vs research engineer, portfolio anatomy, specialization tracks, compensation context.
- **[16. Case Studies →](/docs/case-studies)** — Eight shipped 2026 architectures reconstructed from public sources — Cursor, Claude Code, Perplexity, Sierra, Harvey, Glean, Notion AI, Duolingo Max — what's durable vs. what's a snapshot.
- **[17. Cutting Edge →](/docs/cutting-edge/)** — Optional post-curriculum look ahead: agent harnesses, agentic RAG, trajectory evals, efficient inference, and a dated research radar.
- **[18. Glossary →](/docs/glossary)** — Every term in the guide, defined in plain English.

---

## Conventions used throughout

- **Code samples** are illustrative, not always copy-pasteable. They show the shape of solutions in Python or TypeScript.
- **Model names** reflect the dominant choices as of *May 2026*. Tier names ("frontier," "mid-tier," "small") are used so the advice ages better than specific model IDs.
- **Cost estimates** are in US dollars and assume small/mid-scale usage unless specified.
- **"In 2026"** indicates current-state context — these things change.
- **Pitfalls and gotchas** are flagged explicitly. Most of the value of experience is knowing what *not* to do.

## Does this guide send you elsewhere to learn?

**No.** Each page teaches its topic in full, right here. The cross-links you'll see — the "→ Next" at the foot of every page, and the inline "see [X]" pointers — are *internal*: they move you around this guide, not off it. External links appear only for two things: tools you need to install, and optional further reading you can safely skip. The learning path is self-contained from "what is a token?" to the case studies.

On select pages where a concept reduces to a small piece of code — cosine similarity, chunking, greedy decoding — you'll find a **runnable challenge** right there: write the function, click *Run*, and it's auto-checked in your browser. No setup, no account, nothing to install. We're adding these to more pages over time; most pages teach through worked, traced examples instead.

## A note on bias

This guide is opinionated. Where multiple defensible options exist, it recommends the one that:

1. Has the most active community and ecosystem in 2026
2. Is the easiest to hire for over the next 2–3 years
3. Has the lowest operational burden for the team size
4. Doesn't lock you in beyond reasonable reversibility

Disagree with some choices? That's fine — read the reasoning, then make your own call based on your context.

---

**Ready?** → [Start with the first lesson: What is a token?](/docs/foundations/tokens)
