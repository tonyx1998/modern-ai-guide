---
id: career-foundational-skills
title: Foundational Skills Checklist
sidebar_position: 3
sidebar_label: 2. Foundational Skills
description: The concrete skill checklist a 2026 AI engineering hiring manager looks for, and how to self-assess each one.
---

# Foundational Skills Checklist

> **In one line:** A 2026 AI-engineering hire is checked on twelve concrete skills across software-engineering, AI-specific, and product / communication axes — and the gate is usually the AI-specific four (prompting, retrieval, evals, observability), not the SWE four.

:::tip[In plain English]
This page is a checklist hiring managers actually use, written in plain language. For each skill, there's a self-test you can do today to know whether you'd pass. The right way to use it is not "tick boxes" — it's "identify the one weakest item and spend the next month on it." A balanced score of 6/12 with no zeros beats a score of 11/12 with one zero, because the zero is what gets you rejected.
:::

The skills are grouped into three axes. The order within each axis is rough priority.

## Axis 1: Software-engineering foundations (four items)

### 1. A modern language, deeply

**TypeScript or Python (ideally both at a working level).** You should be able to write idiomatic code without an LLM open, understand async/await and the event loop, and know your language's typing system well enough to design a clean public interface.

- **Self-test:** Open a blank file. In 15 minutes, write a typed function that takes a list of `{role, content}` messages, a tool list, and an LLM client, and returns a streaming response with tool-call handling. No tutorial open.

### 2. HTTP, REST, and streaming

You can't build LLM features without understanding how data flows. SSE (Server-Sent Events) for streaming tokens, WebSockets for bidirectional voice, REST for the rest, plus basic auth (Bearer tokens, OAuth flow).

- **Self-test:** Explain in 3 minutes why your streaming chat endpoint should use SSE, not WebSockets, and what you'd switch to if you wanted client-driven interrupts.

### 3. Relational databases and one vector DB

SQL is still the lingua franca of state. PostgreSQL is the safe default (pgvector covers vector search for almost every team under 10M documents). You should also know one dedicated vector DB hands-on: **Pinecone, Weaviate, Qdrant, Chroma, or LanceDB**.

- **Self-test:** Design a schema for a RAG corpus that stores chunks, embeddings, source documents, and version history; explain the index choices.

### 4. One cloud, deeply, plus deployment

**AWS, GCP, Azure, or a serverless platform (Vercel, Cloudflare Workers, Modal).** You should be able to deploy a small Python or TypeScript service from scratch, hook up a managed DB, and set up basic logging without an SRE.

- **Self-test:** Deploy a streaming chat endpoint to a custom domain in 2 hours from a blank repo. Bonus: with structured logging.

## Axis 2: AI-specific skills (four items — this is the gate)

### 5. Prompting

Not "writing clever sentences" — designing system prompts that work reliably across the input distribution, with output schemas, few-shot examples, refusal handling, and prompt-injection awareness. You know when to use XML tags, when to use JSON schema, when to use Anthropic's prompt caching, when to put context in system vs user.

- **Self-test:** Take a flaky 100-line prompt from a colleague. In 30 minutes, rewrite it to be 30% shorter, more reliable on edge cases, and add an output schema. Show before/after eval scores.

### 6. Retrieval (RAG done right)

Chunking strategies (semantic vs fixed-window, with overlap), embedding models (you've used **OpenAI text-embedding-3, Cohere embed-v4, Voyage AI, or open-source alternatives like nomic-embed**), hybrid search (BM25 + vector, with score fusion), reranking (Cohere rerank, Voyage rerank, or a cross-encoder), citation enforcement.

- **Self-test:** Given a corpus you've never seen, build a RAG pipeline in a day that beats a naive embed-and-cosine baseline by a measurable amount on a hand-built eval set.

### 7. Evals

The single biggest skill differentiator in 2026. You can design test cases, run **LLM-as-judge** with calibration, track regressions across prompt versions, sample from production for ongoing measurement, and reason about statistical significance for stochastic systems. You've used **Braintrust, Langfuse, Promptfoo, OpenAI evals, or Inspect AI** in anger.

- **Self-test:** Given a feature with no eval suite, design a 50-case eval in an afternoon that catches the three most likely regression modes. Defend why those three.

### 8. Observability and cost

Every LLM call is logged, traceable, and replayable. You know what a span tree looks like in **Langfuse, LangSmith, Helicone, Phoenix, or Datadog APM**. You can read a trace and find the slow tool call. You have intuition for $/request and tokens/sec for the major models.

- **Self-test:** Inspect a production trace from a real agent. In 10 minutes, identify the slowest hop, the most expensive call, and one concrete optimization.

## Axis 3: Product and communication (four items)

### 9. Product taste for AI features

You can tell the difference between a chatbot that should exist and one that shouldn't. You can argue for cutting an AI feature even when the team wants to add it. You know which problems LLMs are good at (summarization, classification, generation from structured inputs) vs bad at (precise arithmetic, multi-step reasoning without scaffolding, anything that needs perfect recall).

- **Self-test:** Walk through three AI features at popular products (e.g., Notion AI, Linear's auto-issue-triage, Spotify DJ). For each, name one thing that works and one design choice you'd argue against.

### 10. Communicating AI capabilities and limits

You can translate "the model hallucinates 8% of the time on this task" into something a PM, a designer, or a CFO understands and acts on. You can write a one-page memo proposing or killing an AI feature.

- **Self-test:** Write a 200-word slack message recommending whether to ship a feature given an 89% eval pass rate, $0.08/request, and a 2-second median latency. Defend tradeoffs.

### 11. Cost and latency intuition

You can ballpark whether a feature design is going to cost $0.01/request or $5/request before you build it. You know roughly: Claude Sonnet input ~$3/M, output ~$15/M; GPT-4o-mini is roughly 100x cheaper than GPT-4o on input; Haiku is faster but worse at agents; embedding calls are ~$0.10/M tokens.

- **Self-test:** Estimate the monthly cost of running a customer-support agent that does ~3 tool calls per conversation across 10K conversations / day, using Claude Sonnet.

### 12. Healthy skepticism of hype

Most "AI breakthrough" tweets are either marketing or methodologically thin. You can read a benchmark table without being snowed, recognize an MMLU-stuffed model, and notice when a "agent autonomously did X" demo is a 30-step cherry-picked tape.

- **Self-test:** Pick a recent "SOTA" announcement on Twitter. In 15 minutes, identify three reasons to discount the claim by 50%.

:::note[Try it yourself: the "balanced scorecard"]
Score yourself 0–3 on each of the twelve items:

- **0** = no exposure
- **1** = followed a tutorial; couldn't do it from blank
- **2** = shipped one project that uses this; can do basic versions confidently
- **3** = could teach this to a junior; have war stories

Total possible: 36. Then find your lowest single score. If anything is 0, that's the next month's project — a 6+/12 distribution with no zeros gets more interviews than 11/12 with a single zero in evals or observability.
:::

:::info[Highlight: the AI-specific four are the gate]
SWE foundations are necessary; they're not sufficient. The interview question that filters most candidates in 2026 isn't "implement merge sort" — it's "walk me through how you'd add an eval suite to a flaky agent that's already in production." If you can't answer that without notes, the rest of your resume doesn't matter. Spend most of your career-prep time on items 5–8.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Optimizing for breadth before depth.** Five projects that use OpenAI's chat API once each is one project repeated. One project with a real eval suite is what hiring managers screen for.
- **Treating prompting as "the easy one."** The 2026 senior bar on prompting includes prompt caching strategy, output-schema enforcement under streaming, and prompt-injection defense. "I write clear sentences" is a junior level.
- **Skipping evals because they're not flashy.** Evals are the single largest career-leverage skill in 2026; engineers who can stand up an eval suite for a new feature get promoted faster than engineers who ship more features without one.
- **Ignoring cost/latency intuition until production.** "It works in dev" is not a green light. The interview question "what's this going to cost at 10K req/day?" is now standard at AI-native scaleups, and "I don't know" is a no-hire signal.
- **Letting an LLM do your self-tests.** The point of the depth checks is calibration. If you ask Cursor to do the self-test, you're calibrating Cursor, not yourself.
:::

## Page checkpoint

Quick self-check:

1. Name the four AI-specific skills that form the "gate" for a 2026 AI-engineering interview.
2. What's the difference between "prompting" at junior vs senior level, per the page?
3. Name three eval platforms a candidate might claim to have used.
4. Why are evals called the single biggest skill differentiator?
5. What's a reasonable monthly cost ballpark for an agent doing 3 tool calls / conversation × 10K conversations / day on Claude Sonnet?

<Quiz id="career-foundational-skills-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Which four skills does the page identify as the gate in a 2026 AI-engineering interview?"
  options={[
    { text: "Prompting, retrieval, evals, and observability" },
    { text: "TypeScript, Python, SQL, and cloud deployment" },
    { text: "Product taste, communication, cost intuition, and skepticism" },
    { text: "Fine-tuning, CUDA, distributed training, and inference" }
  ]}
  correct={0}
  explanation="SWE foundations are necessary but not sufficient - the filter question is 'walk me through how you'd add an eval suite to a flaky agent in production', not 'implement merge sort'. The four AI-specific skills (items 5 through 8) deserve most of your career-prep time."
/>

<Question
  prompt="Why does the page claim a balanced 6 out of 12 score with no zeros beats an 11 out of 12 with a single zero?"
  options={[
    { text: "Hiring managers average scores, so balance raises the mean" },
    { text: "High scores look suspicious and trigger extra screening" },
    { text: "The zero is what gets you rejected - one missing skill like evals or observability is a no-hire signal regardless of strengths elsewhere" },
    { text: "Interviews only test six skills at a time" }
  ]}
  correct={2}
  explanation="The checklist is not about ticking boxes - it is about finding your weakest item and spending the next month on it. A zero in a gating skill like evals sinks the interview no matter how strong the rest of the profile is."
/>

<Question
  prompt="Why does the page warn against letting an LLM do your self-tests?"
  options={[
    { text: "LLMs give wrong answers on most engineering self-tests" },
    { text: "Using AI tools during practice is considered cheating by employers" },
    { text: "Self-tests must be timed, and AI assistance breaks the timing" },
    { text: "The self-tests exist to calibrate your own ability - if Cursor does them, you are calibrating Cursor, not yourself" }
  ]}
  correct={3}
  explanation="The depth checks only work as honest measurements of what you can do from a blank file. The interview will not let you open an assistant to debug a streaming bug or design an eval suite, so the calibration has to be of you."
/>

</Quiz>

→ Next: [The roles, distinguished](./03-roles.md).
