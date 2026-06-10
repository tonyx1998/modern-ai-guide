---
id: agent-vs-chain
title: Single agent vs chain vs multi-agent
sidebar_position: 6
description: The hype-vs-reality view of AI architectures. Chain by default. Single agent on evidence. Multi-agent rarely.
---

# Single agent vs chain vs multi-agent

> **In one line:** Chain by default. Promote to single agent when the chain branches too much. Reach for multi-agent only with evidence.

:::tip[In plain English]
"Build an agent" was the 2024 instinct. By 2026 it's clear: most so-called agents should have been chains. Chains are predictable, debuggable, and cheap to evaluate. Agents have an exploding state space and one bad LLM decision can blow up the whole workflow. Start with the simpler thing and only escalate when you have proof the simpler thing isn't enough.
:::

:::note[New to agents?]
This page is about *when* to use each shape. For the mechanics — what an agent loop actually is, planning/reflection, and how multi-agent works — see Foundations: [the agent loop](/docs/foundations/agent-loop), [planning and reflection](/docs/foundations/planning-and-reflection), and [multi-agent systems](/docs/foundations/multi-agent).
:::

## The three patterns

- **Chain** — A predetermined sequence of LLM and non-LLM steps. Predictable. Easy to debug. Easy to evaluate.
- **Single agent** — One LLM with a tool set, run in a loop. The LLM decides which tool to call next. Used when the workflow varies per request.
- **Multi-agent** — Multiple LLMs with distinct roles, communicating with each other. Powerful in narrow cases, wildly over-applied elsewhere.

## When chain is right (the default)

- The steps are known in advance.
- Each step has a clear input/output contract.
- You want to enforce ordering for correctness, compliance, or cost.
- You need to test sub-steps in isolation.

Most "AI features" are chains. Don't be embarrassed to ship a chain. A chain in production is worth ten agents in a demo.

### What a chain looks like
1. User submits a question.
2. Classifier LLM call categorizes it.
3. Based on category, either: (a) retrieve from KB and answer, (b) call a tool and answer, (c) escalate to human.
4. Format response with a small LLM call.

Every step is testable. Every failure has a name. You can swap a model in step 4 without touching step 2.

## When single agent is right

- The set of needed actions varies meaningfully per request.
- The cost/latency of a dynamic decision is worth more than the predictability you'd get from hard-coding it.
- You can give the model 3–10 well-described tools (not 50).
- You can afford the harder eval surface (multi-turn).

### What a single agent looks like
A loop where the LLM is given tools (`search_docs`, `query_db`, `send_email`, `finish`) and a goal, and decides each step. Used well for: data analysis agents, customer support agents handling varied requests, coding agents.

## When multi-agent is right

- **Planner + worker** — The planner reasons about the whole task; workers execute focused sub-tasks. Works when the planning step is qualitatively different from execution.
- **Specialist agents with disjoint knowledge / tool sets** — A "search agent" with retrieval tools, a "writing agent" with formatting tools.
- **Adversarial / debate** — Two agents argue; a judge decides. Sometimes improves accuracy on hard reasoning.
- **Massive parallel decomposition** — When you can split a problem into independent sub-tasks, run them simultaneously, and aggregate.

## When multi-agent is *not* right (most cases)

- **You added a second agent because the first wasn't reliable.** Fix the first. Adding agents to compensate for unreliability multiplies the unreliability.
- **The "agents" are really just stages.** That's a chain. Calling them agents doesn't make them agents.
- **A larger or better-prompted single agent would do the job.** Almost always cheaper, faster, and easier to debug.
- **You want the architecture to "feel sophisticated."** This is the most expensive vanity in AI engineering.

## The 2026 default

Start with a chain. Promote to single agent if branching gets gnarly. Multi-agent only with evals showing a clear win over single-agent.

## How to apply it

When someone pitches an agent, force these questions:

1. **What's the chain version?** Can you draw the workflow with arrows? If yes, ship the chain.
2. **What's the eval that proves the agent is better than the chain?** Without one, the agent is a vibe.
3. **What's the worst tool call sequence the agent could make?** Have you bounded it (max steps, max cost, kill switch)?
4. **Who owns the agent's loop when it goes wrong at 3am?** "It's emergent" is not an answer.

## When this rule doesn't apply

- **Genuinely open-ended workflows** (research, coding, debugging) where you can't enumerate the steps. Agents are right.
- **High-stakes one-shot decisions** where the model needs to weigh many tools and human feedback. Agents may be right, with heavy guardrails.
- **You're shipping a horizontal agent platform.** Then agents are your product — but they're still wrapped in chain-like orchestration internally.

## Common mistakes

- **Counting "agents" the wrong way.** A pipeline of three LLM calls is a chain, not "three agents." Don't inflate your architecture.
- **Multi-agent by default because the framework supports it.** CrewAI and LangGraph make it easy to spawn agents. Easy doesn't mean correct. Default still applies.
- **Treating tool count as agent sophistication.** A 30-tool agent is a 30-tool nightmare. Real production agents have 3–10 well-chosen tools.
- **Skipping the kill switch.** Every agent in production needs a cost ceiling, a step ceiling, and a config flag that disables it. Without one, a runaway loop costs thousands before you notice.

:::note[Worked example: an agent that became a chain]
A startup builds a "research agent" that takes a question, searches the web, reads pages, and writes a report. They use a 5-agent multi-agent setup: planner, searcher, reader, writer, critic. It works in demos, costs $4 per query, takes 90 seconds, fails 25% of the time.

They rebuild it as a 4-step chain: query rewrite → web search → read top 5 → summarize. Each step is testable. They drop in a reranker between search and read. Cost: $0.30. Latency: 12 seconds. Failure rate: 6%.

The "agent" was solving a fixed-shape problem. The chain solved it 10x cheaper, 7x faster, and 4x more reliably. Multi-agent didn't add value — it added cost and unreliability.
:::

<Quiz id="agent-vs-chain-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the 2026 default architecture for an AI feature?"
  options={[
    { text: "Multi-agent, since hard problems need multiple specialists" },
    { text: "Single agent, since flexibility is king" },
    { text: "Whatever the chosen framework supports best" },
    { text: "Chain by default; promote to single agent on evidence; multi-agent rarely" }
  ]}
  correct={3}
  explanation="Chains are predictable, debuggable, and cheap to evaluate — a chain in production is worth ten agents in a demo. Agents have an exploding state space where one bad LLM decision can blow up the workflow, so you escalate only with proof the simpler shape isn't enough."
/>

<Question
  prompt="When is a single agent justified over a chain?"
  options={[
    { text: "When the architecture should feel sophisticated" },
    { text: "When the needed actions vary meaningfully per request and you can give the model 3-10 well-described tools" },
    { text: "When you can supply the agent with 50 tools" },
    { text: "When the first version of the chain had bugs" }
  ]}
  correct={1}
  explanation="The agent's dynamic decisions must be worth more than the chain's predictability, and you must afford the harder multi-turn eval surface. A 30-tool agent is called a 30-tool nightmare, and 'sophisticated-feeling' architecture is named the most expensive vanity in AI engineering."
/>

<Question
  prompt="In the worked example, what happened when the 5-agent research system was rebuilt as a 4-step chain?"
  options={[
    { text: "Cost dropped to $0.30, latency to 12 seconds, and the failure rate fell from 25% to 6%" },
    { text: "Quality collapsed because agents were essential" },
    { text: "Nothing changed measurably" },
    { text: "It became more expensive but more reliable" }
  ]}
  correct={0}
  explanation="The task had a fixed shape — query rewrite, search, read, summarize — so the multi-agent setup was adding cost and unreliability, not capability. The chain solved it roughly 10x cheaper, 7x faster, and 4x more reliably, and every step became individually testable."
/>

</Quiz>

---

→ Next: [Closed vs open](./closed-vs-open.md).
