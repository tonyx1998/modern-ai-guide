---
id: framework-pick
title: Framework Pick — When to Use Which (or None)
sidebar_position: 7
sidebar_label: Framework pick
description: LangChain, LlamaIndex, Vercel AI SDK, OpenAI Agents SDK, Pydantic AI, Mastra — which one when, and when to use no framework at all.
---

# Framework Pick — When to Use Which (or None)

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Raw SDK is the right answer until it isn't — then pick the framework that matches the *one* abstraction you actually need (provider-swap, agent loops, RAG pipelines, evaluation).

:::tip[In plain English]
A framework is a pre-built kit of code that promises to save you from writing common plumbing yourself — and the AI world has a crowded shelf of them. The catch is that every kit hides details, and when something breaks inside one you don't understand, you're stuck. This page decides when to use a kit at all, and if so, which one fits the single problem you actually have. The rule it teaches: build the thing by hand once first, so you know exactly what the kit is doing for you — and keep the kit at arm's length in your code, because these kits change fast and you'll likely swap them someday.
:::

## The cardinal rule

**Don't adopt a framework until you've built the equivalent yourself once.** Frameworks paper over real complexity that you need to understand. Adopting one in Stage 1 means you have no model for what's happening when (not if) it leaks.

By the time you've completed [Part I](../01-part-1-from-zero/index.md), you've built:

- A raw LLM call (Stage 1).
- A streaming chat with state (Stage 2).
- Structured output (Stage 3).
- A tool-calling loop (Stage 4).
- A RAG pipeline (Stage 5).
- An eval runner (Stage 6).
- An observability layer (Stage 7).
- An agent (Stage 8).

NOW you have something to compare frameworks against.

## What each framework actually buys you

### Provider-abstraction layer (raw call → many providers)

The lowest-friction win: write code once, call any model.

| Framework | Language | Notes |
|-----------|----------|-------|
| **Vercel AI SDK** | TypeScript | The cleanest abstraction; `streamText`, `generateObject`, `tool()`; bind to any provider |
| **LiteLLM** | Python | Most extensive provider list; proxy-server mode for ops |
| **Pydantic AI** | Python | Type-safe agents on top of any provider |
| **Anthropic SDK / OpenAI SDK** | Both | Raw; one provider only |

If you're routing between models or want vendor flexibility, this is the abstraction worth adopting.

### Agent loop frameworks

If you found yourself reimplementing the Stage 8 loop with retries, caps, tracing, and tool registries — these wrap that for you.

| Framework | Language | Notes |
|-----------|----------|-------|
| **OpenAI Agents SDK** | Python/TS | Official, opinionated, handles handoffs |
| **LangGraph** | Python | Agents as state graphs; great for branching workflows |
| **Pydantic AI** | Python | Typed agents; clean ergonomics if you like the Pydantic style |
| **Mastra** | TypeScript | TS-native; opinionated about agent shape |
| **Vercel AI SDK** (`maxSteps` in `generateText`) | TypeScript | Lightweight, for chatbot-shaped agents |

The agent-framework question: do you want graph-of-states (LangGraph), tool-based handoffs (Agents SDK), or just-a-loop-with-tools (Vercel AI SDK)?

### RAG framework

If you found yourself reimplementing chunking + indexing + retrieval + reranking:

| Framework | Language | Notes |
|-----------|----------|-------|
| **LlamaIndex** | Python | Most mature; covers everything from parsing to evaluation |
| **LangChain** | Python/TS | Broader scope; RAG is one of many use cases |
| **Haystack** | Python | Strong production focus; cleaner than LangChain |

LlamaIndex is generally the right pick if RAG is your main thing. LangChain is the right pick if you want one framework for RAG + agents + tools + everything.

### Eval framework

→ Covered in [Eval tool pick](./07-eval-tool-pick.md). Short answer: Braintrust if hosted, Promptfoo or DeepEval if open-source.

### Full-stack opinionated bundles

| Framework | Language | What you get |
|-----------|----------|---------------|
| **DSPy** | Python | A whole paradigm — programmatic prompt optimization; not a "framework" so much as a system |
| **Inferable / Mastra / Genkit** | TS | Opinionated end-to-end LLM app frameworks |

These are higher-risk picks; the abstraction is heavier, the community is smaller, but if the paradigm clicks for your team, productivity gains can be large.

## The matrix

| Your need | Pick |
|-----------|------|
| One provider, simple chat | **Raw SDK** |
| Multi-provider routing in TypeScript | **Vercel AI SDK** |
| Multi-provider routing in Python | **LiteLLM** or **Pydantic AI** |
| Complex agent with branching state | **LangGraph** |
| Simple agent loop with tools | **OpenAI Agents SDK** or Vercel AI SDK |
| Heavy RAG pipeline (PDF parsing, chunking, reranking) | **LlamaIndex** |
| Production focus, no opinion | **Haystack** |
| Type-safe Python agents | **Pydantic AI** |
| Want to experiment with prompt-as-program | **DSPy** |
| You're shipping in TypeScript and want one framework | **Vercel AI SDK** or **Mastra** |

## What LangChain is good at (and what it isn't)

LangChain remains the most-discussed AI framework. Some honest evaluation:

**Good at:**
- Coverage — has integrations for *everything*.
- Tutorials — most online content uses LangChain.
- Quick prototypes — you can wire up a RAG in 50 lines.

**Less good at:**
- API stability — frequent breaking changes; documentation gets out of date.
- Abstraction tax — the wrappers can hide important details (token counts, latency).
- Debugging — `Chain`/`Runnable` traces can be hard to follow without LangSmith.
- "Heavy" feel for simple use cases.

If you want LangChain's coverage and prefer a cleaner core, **LangGraph** (same org, agent-focused) and **Haystack** (different org, production focus) are alternatives.

## When NO framework is the right answer

If your AI feature is:

- One LLM call per user action.
- Simple structured output extraction.
- A chatbot with no tools, no RAG.
- A specific narrow task you've built once.

Raw SDK + ~200 lines of glue is cleaner than any framework. The framework only earns its keep when you have *repeated* patterns across features.

## How frameworks evolve (a warning)

The 2024–2025 LangChain ecosystem looks very different from the 2022 one. AI frameworks have a higher churn rate than most software — APIs change, defaults change, recommended patterns change.

Build a **framework-isolation layer** in your code:

```python
# bad: framework calls scattered everywhere
from langchain.chains import RetrievalQA
qa = RetrievalQA.from_chain_type(llm=ChatOpenAI(...), retriever=vectorstore.as_retriever())

# better: thin internal interface, framework hidden behind it
class RAGService:
    def __init__(self): self._chain = build_chain()  # hidden
    def answer(self, q: str) -> str: ...
```

When the framework breaks (a major version, a deprecation, a switch to a different framework), only `RAGService` changes — not every caller.

## Common mistakes

:::caution[Where people commonly trip up]
- **Adopting a framework before understanding the raw call.** You can't debug what you don't understand. Build the raw version once; THEN evaluate frameworks.
- **Using two frameworks in the same project.** "LangChain for RAG, OpenAI Agents SDK for the agent." Now you have two abstraction layers, two debugging patterns, two upgrade cycles. Pick one ecosystem.
- **Locking in early.** "This framework had the best tutorial six months ago." Frameworks shift. Build with abstraction layers so you can swap.
- **Refusing all frameworks out of purism.** Raw code is great until you've reimplemented the loop, the eval runner, and the observability layer for the third project. At that point, the framework's a productivity multiplier.
- **Picking based on GitHub stars.** Star counts reflect 2-year-old momentum. Evaluate by API stability, current docs quality, recent commit activity, and whether the abstractions match YOUR shape of problem.
:::

<Quiz id="framework-pick-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the cardinal rule this page gives about adopting an AI framework?"
  options={[
    { text: "Adopt the most popular framework early so tutorials are easy to find" },
    { text: "Never use frameworks; raw SDK code is always cleaner" },
    { text: "Use one framework for RAG and a second one for agents" },
    { text: "Do not adopt a framework until you have built the equivalent yourself once" }
  ]}
  correct={3}
  explanation="Frameworks paper over real complexity. If you adopt one before building the raw version, you have no mental model for what is happening when the abstraction leaks — and it will. Build it once by hand; then you can judge what a framework actually buys you."
/>

<Question
  prompt="Your feature is a single LLM call per user action with simple structured output. What does this page recommend?"
  options={[
    { text: "Raw SDK plus a small amount of glue code — no framework" },
    { text: "A full RAG framework, since you may need retrieval later" },
    { text: "An agent framework, since all AI features eventually become agents" },
    { text: "Two frameworks, so you can compare them in production" }
  ]}
  correct={0}
  explanation="A framework only earns its keep when you have repeated patterns across features. For one call, simple extraction, or a narrow task, raw SDK with a couple hundred lines of glue is cleaner than any framework — less to learn, less to debug, less to upgrade."
/>

<Question
  prompt="Given how fast AI frameworks churn, what protective pattern does this page recommend?"
  options={[
    { text: "Pin the framework version forever and never upgrade" },
    { text: "Hide the framework behind a thin internal interface so only one class changes when it breaks or gets swapped" },
    { text: "Choose the framework with the most GitHub stars, since popularity guarantees stability" },
    { text: "Copy the framework source into your repo so it cannot change" }
  ]}
  correct={1}
  explanation="AI frameworks have unusually high churn — APIs, defaults, and recommended patterns shift constantly. A framework-isolation layer means a major version bump or a full framework swap touches one service class instead of every caller in your codebase."
/>

</Quiz>

→ Next: [Eval tool pick](./07-eval-tool-pick.md) — Braintrust, Promptfoo, DeepEval, and friends.
