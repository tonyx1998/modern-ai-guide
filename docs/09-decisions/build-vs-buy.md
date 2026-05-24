---
id: build-vs-buy
title: Build vs buy
sidebar_position: 8
description: When to use a framework, when to use a hosted platform, when to write your own. The buy-leaning defaults for every layer of the AI stack.
---

# Build vs buy

> **In one line:** For every layer of the AI stack, default to buy or use OSS — build only when the layer IS your differentiator.

:::tip[In plain English]
Engineers love building things. "I could write a thin LLM client in a day" turns into a year of fighting a half-finished gateway. The right move at every layer is: use the boring tool that already exists, and save your engineering for the prompts and product logic that make you different. The only thing you should build is the thing nobody else is going to build for you.
:::

## A reasonable default by layer

| Layer                | Default                                                                                                  |
|----------------------|----------------------------------------------------------------------------------------------------------|
| **Models**           | Buy (API). Almost never build (train your own from scratch).                                             |
| **LLM SDK**          | Use the native vendor SDK or Vercel AI SDK. Don't build.                                                 |
| **Eval tooling**     | Start with `pytest` or Promptfoo (OSS). Buy hosted (Braintrust, Langfuse) when eval sprawl gets painful. |
| **Observability**    | Start with Langfuse (OSS). Buy hosted (Braintrust, LangSmith, Helicone) when you need integrated eval.   |
| **Vector DB**        | Start with pgvector. Buy (Pinecone) or self-host (Qdrant) when scale or features force it.               |
| **Gateway**          | Buy (Portkey, OpenRouter) or OSS (LiteLLM). Don't build — the surface area is large.                     |
| **Orchestration**    | Buy (Inngest, Temporal, Trigger.dev). Don't build a job runner.                                          |
| **Document parsing** | Start with `unstructured` or LlamaParse. Build only for very specific document shapes.                   |
| **Agent runtime**    | Raw SDK loop first. If you need real runtime features, buy (Cognition, Crew, Sierra) before you build.   |
| **Fine-tuning**      | Managed (OpenAI fine-tune, Together) before self-hosted training.                                        |
| **Prompt registry**  | Git first. Adopt PromptLayer/Braintrust when you need cross-team prompt collaboration.                   |
| **Voice infra**      | Buy (Vapi, Retell, LiveKit). Don't build SIP plumbing.                                                   |

## The buy-vs-build heuristic

**Buy when:**

- The tool solves a generic problem (not your unique advantage).
- The vendor's pace exceeds yours on this surface.
- The cost of a half-built version dwarfs the subscription.
- The maintenance burden compounds (you'll be patching this in three years).

**Build when:**

- It IS the differentiator (your prompt library, your eval set, your fine-tuned model, your retrieval corpus).
- No vendor fits the use case after honest evaluation.
- Data sensitivity rules out vendors.
- The vendor's lock-in is genuinely unacceptable (rare, but real for some enterprise contexts).

## The hidden cost of building

When an engineer estimates "two weeks to build a gateway," what they usually mean is the happy path. What gets discovered later:

- Retries with backoff and jitter.
- Token counting per provider (every vendor counts differently).
- Streaming SSE handling.
- Multi-provider key rotation and rate limit handling.
- Cost attribution per team / per feature.
- Prompt caching coordination.
- Schema validation per vendor's tool-use format.
- Observability and tracing.
- A UI for the non-engineers who want to inspect calls.

A real gateway is a year of work. Portkey costs $99/month. Do the math.

## The middle path: open-source self-hosted

Often the right answer when you want vendor-grade tooling without sending data out: Langfuse, Qdrant, vLLM, LiteLLM proxy, Promptfoo. You pay operational cost instead of subscription cost. This is the right move when:

- Subscription cost would be material at your scale.
- Your data class genuinely can't go to a vendor.
- You have at least one engineer who can own the layer.

It is *not* the right move when:

- You're 5 people and adopting 4 OSS tools simultaneously.
- The OSS project is sparsely maintained.
- The cost difference is hypothetical (you're not at the scale where it matters).

## When this rule doesn't apply

- **Your moat is the layer itself.** If you're selling AI observability, you build the AI observability platform. If you're selling vector search, you build the vector DB.
- **A vendor is genuinely missing a critical capability.** Then you build the thin piece you need, not the whole platform. A 200-line wrapper isn't a rebuild.
- **You're at scale where vendor pricing is uneconomic.** A $50k/month gateway bill justifies a real internal gateway team. A $500/month bill doesn't.

## How to apply it

When someone proposes building a piece of the stack, force this conversation:

1. **What's the OSS or hosted alternative?** Name three.
2. **What's the build estimate, and is it the happy-path version?** Multiply by 3.
3. **Who owns the maintenance in two years?** If no one, you're not budgeting honestly.
4. **Is this layer our differentiator?** If no, default to buy.

## Common mistakes

- **"We need flexibility, so let's build it."** Flexibility you don't yet need is yet-another product you have to maintain. Buy the tool with the integration points you can extend.
- **Wrapping vendor SDK in your own "abstraction layer" on day one.** You don't yet know which vendor you'll switch to, or what your real common interface needs to be. Wrap *after* you've felt the pain of two vendors, not before.
- **Building a thing because a framework made it easy.** LangChain makes it easy to ship an agent framework. That doesn't mean shipping one is the right move for your product.
- **Sunk-cost building.** You spent three months on a half-done eval platform. Throw it away and adopt Braintrust. The next three months are worth more than the last three.

:::note[Worked example: the gateway that didn't need to exist]
A team at a 30-person startup spends a quarter building an "LLM gateway" — multi-provider routing, retries, cost tracking. It works for the OpenAI calls. It doesn't yet handle Anthropic's tool format. It has bugs in streaming. The cost tracking is approximate.

They evaluate Portkey: it does all of the above, plus prompt caching coordination, plus a UI, for $99/month. They migrate in two weeks. The quarter of build work goes in the bin.

The post-mortem: the gateway felt like the kind of thing they "should" own. In reality, it was undifferentiated plumbing. Building it cost more than the next three years of Portkey subscriptions. The team's actual differentiator (their fine-tuned classifier and proprietary eval set) got *less* attention because the gateway was eating engineer-weeks.

The rule: own the layer that makes you you. Buy the rest.
:::

---

→ Next: [When *not* to use AI](./when-not-to-use.md).
