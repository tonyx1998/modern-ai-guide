---
id: framework-vs-raw-sdk
title: Framework vs raw SDK
sidebar_position: 16
description: When LangChain, LlamaIndex, and agent frameworks help vs hurt. The "build raw v0 first" rule.
---

# Framework vs raw SDK

> **In one line:** Build the raw-SDK v0 first; adopt a framework only when you've felt the specific pain the framework solves — and even then, prefer the thinnest framework.

:::tip[In plain English]
LangChain, LlamaIndex, CrewAI, LangGraph — they all promise to save you time. In practice, they save you 30 minutes on day one and cost you 30 days of debugging across the next year. The framework's abstraction is wrong for your specific use case, you have to fight it constantly, and the upgrade cycle introduces breaking changes you didn't sign up for. Raw SDK with a few helper functions is usually less code AND less surprise.
:::

## The default: raw SDK + a few helpers

For most AI features, the right starting point is:

- The vendor's native SDK (`anthropic`, `openai`, `google-generativeai`).
- A thin wrapper for the patterns you reuse (retry, JSON parse, prompt template).
- Vercel AI SDK if you're streaming to a frontend.
- A simple agent loop is ~30 lines of code; you don't need a framework for it.

This gets you 90% of what a framework would, with code you fully understand.

## When a framework helps

- **You're using LlamaIndex for very heavy retrieval pipelines** (ingestion, multiple retrievers, query engines composed together) and the abstraction matches your workflow.
- **You're using LangGraph specifically for graph-structured agent state** with complex branching that's painful to express in raw code.
- **You're using a vertical framework that owns its niche well** — like an instructor/structured-output library that does one thing.
- **You need observability and tracing that the framework offers for free** (LangSmith integration, etc.).

## When a framework hurts

- **You only use 10% of its surface area** but pay for the conceptual overhead of all 100%.
- **Debugging requires understanding the framework's internals**, which the docs don't cover.
- **Upgrades break things** in opaque ways — the framework changes its abstraction, your code breaks.
- **The "framework abstraction" leaks** — you end up reaching past it to the raw SDK anyway.
- **You can't tell where a prompt actually lives** — it was assembled by 5 layers of class hierarchy.

## The "build raw v0 first" rule

Before adopting any framework:

1. **Build the simplest version of the feature in raw SDK.** Probably 100–300 lines.
2. **Use it for at least two weeks.** Feel where the pain is.
3. **If the pain is "I'm rewriting the same retry/parse/loop code"** — extract helpers. You don't need a framework.
4. **If the pain is "this workflow's structure is genuinely complex and my code is unreadable"** — *now* consider a framework, and pick the smallest one that fits.

You'll find that 80% of the time, the framework was solving a problem you don't actually have.

## Why this matters more for AI than for web

In web dev, frameworks (Next.js, Rails, Django) save you real work. The abstractions are mature and the pain points are well-understood.

AI frameworks are 2–3 years old. The patterns are still being discovered. Adopting a framework now is betting on someone else's bet about what the right pattern is — and that bet is often wrong.

Code that calls the SDK directly survives framework churn. Code wrapped in LangChain v0.x ends up rewritten when LangChain v0.y changes the API.

## Concrete examples

**Things you don't need a framework for:**

- A chat completion with streaming. (10 lines.)
- A RAG flow: embed query → vector search → top-K → prompt with context. (50 lines.)
- An agent loop: call LLM → execute tool → append result → repeat until done. (40 lines.)
- Structured output: JSON schema → call with response format → validate. (20 lines.)

**Things where a framework might help:**

- A multi-stage indexing pipeline with multiple retrievers, query engines, and reranking.
- A complex agent graph with conditional branching that's painful to express imperatively.
- An eval harness across hundreds of prompts and test cases (use Promptfoo or Braintrust).

## When this rule doesn't apply

- **The framework is the right level of abstraction for your team.** Some teams genuinely like LangChain's mental model — fine if you've evaluated alternatives honestly.
- **You're prototyping and the framework gets you to a demo in an hour.** Use it for the demo, then decide whether the production version needs it.
- **A specific framework feature is genuinely irreplaceable** for your use case (some LlamaIndex retrieval features are hard to replicate from scratch).

## How to apply it

When someone proposes adopting a framework, ask:

1. **Have we built the raw version yet?** If no, don't pick the framework.
2. **What specific code would disappear with the framework?** Name the functions.
3. **What's the framework's upgrade cadence?** Are we OK with breaking changes?
4. **Can we trace a single request through the framework, end to end, in our heads?** If no, the abstraction is too thick.

## Common mistakes

- **Adopting the framework first to "save time."** This is almost always backwards. You save 2 hours on day 1 and lose 2 weeks on month 3.
- **Wrapping the raw SDK in your own framework "for flexibility."** You don't yet know what flexibility you'll need. Wrap when the second use case appears, not before.
- **Treating "we use LangChain" as a competitive advantage.** Nobody cares which framework you use. They care whether the product works.
- **Sunk-cost framework loyalty.** "We've already built so much on it" is not a reason to keep it. The cost of staying is often larger than the cost of migration.

:::note[Worked example: LangChain in, LangChain out]
A startup adopts LangChain in week one. By month four, they have:
- A retrieval pipeline that uses LangChain's loaders but also calls the OpenAI SDK directly when LangChain's chat abstraction is too inflexible.
- An agent loop that's nominally LangGraph but bypasses LangGraph's state management because it's confusing.
- A prompt management layer in LangChain that nobody can edit because the prompts are assembled across 7 classes.
- A breaking change every minor version bump that costs ~2 engineer-days to fix.

They do an honest accounting: the framework saved them maybe 3 days of initial setup. It has cost them roughly 25 engineer-days in maintenance, debugging, and version upgrades.

They migrate to raw SDK + 4 helper functions in one sprint. Total post-migration code is 40% smaller than the framework-wrapped version. Onboarding new engineers takes a day instead of a week.

The lesson: the framework optimized for the wrong thing. They needed code they could understand, not abstractions someone else built.
:::

---

→ Next: [Prompt engineering vs fine-tuning](./11-prompt-engineering-vs-fine-tuning.md).
