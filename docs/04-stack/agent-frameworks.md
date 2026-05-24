---
id: agent-frameworks
title: Agent frameworks
sidebar_position: 9
description: LangGraph, CrewAI, AutoGen/AG2, OpenAI Agents SDK, Pydantic AI, Vercel AI SDK — managed agent loops with state, retries, and tracing.
---

# Agent frameworks

> **In one line:** Libraries that wrap the "loop until done" pattern around your LLM — state machines, tool routing, retries, checkpointing, and (sometimes) multi-agent orchestration.

:::tip[In plain English]
An "agent" is just an LLM in a loop that can call tools. The loop is fifteen lines of code. So why frameworks? Because the *production* version of those fifteen lines needs to survive a deploy, resume after a 429, trace every step, persist state between turns, and let a human approve sensitive actions. Frameworks give you those capabilities as primitives instead of you reimplementing them. The trade-off, as always, is hiding the loop you might have wanted to debug.
:::

## The major options (2026)

| Framework | Language | Model | Multi-agent | Checkpointing | Best for |
|-----------|---------|-------|------------|---------------|---------|
| **LangGraph** | Py / TS | State machine | yes | first-class | Complex, production-grade agent flows |
| **OpenAI Agents SDK** | Py / TS | Linear with handoffs | yes (handoffs) | basic | OpenAI-centric, clean primitives |
| **Pydantic AI** | Py | Typed agent loop | yes | yes | Typed Python, structured tools |
| **CrewAI** | Py | Role-based teams | yes (core feature) | yes | "Team of agents" patterns |
| **AutoGen / AG2** | Py | Conversational agents | yes | yes | Research-flavored multi-agent |
| **Agno** | Py | Lightweight | yes | yes | Faster, lighter CrewAI alternative |
| **Vercel AI SDK** | TS | Loop + tools | partial | partial | TS apps; agent inside a Next.js route |
| **Mastra** | TS | Workflows + agents | yes | yes | TS-native LangGraph alternative |
| **Smolagents** (HF) | Py | Code-writing agent | partial | basic | Agent that writes Python to act |
| **DIY `while` loop** | any | whatever you write | what you build | what you build | v0 always |

## Default pick for most teams

**Write the loop yourself first.** A working agent in 30 lines (`while not done: response = llm.call(messages); if tool_call: execute; else: done = True`) is what every framework is doing under the hood. Build it once so you understand it.

When you outgrow that — usually around "I need this to survive a deploy" or "I need to checkpoint mid-flow" — graduate to:

- **LangGraph** for Python and serious complexity.
- **Pydantic AI** for typed Python and simpler flows.
- **Vercel AI SDK** for TypeScript apps where the agent lives behind a Next.js route.
- **OpenAI Agents SDK** if you're already all-in on OpenAI and want their primitives.

## When to deviate

- **Long-running flows with checkpoints and resume**: **LangGraph**. Nothing else is as mature on persistent state.
- **Multi-agent role play** (a "researcher" + "writer" + "editor" team): **CrewAI** or **Agno**.
- **Agent that needs to write and execute its own code**: **Smolagents** + an **agent runtime** sandbox (see [agent runtimes](./agent-runtimes.md)).
- **You want types everywhere and Pydantic on the tool args**: **Pydantic AI**.
- **TypeScript-first stack**: **Vercel AI SDK** or **Mastra**.
- **You want the simplest possible "handoff to specialist agent" pattern**: **OpenAI Agents SDK**.

## Minimum integration

**DIY loop — what every framework hides:**

```python
def run_agent(user_msg: str) -> str:
    messages = [{"role": "user", "content": user_msg}]
    for _ in range(10):  # max steps
        r = llm.create(messages=messages, tools=TOOLS)
        msg = r.choices[0].message
        messages.append(msg)
        if not msg.tool_calls:
            return msg.content
        for tc in msg.tool_calls:
            result = execute_tool(tc.function.name, tc.function.arguments)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
    raise RuntimeError("max steps reached")
```

**LangGraph — the same logic as a graph with checkpointing:**

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver

graph = StateGraph(AgentState)
graph.add_node("llm", call_llm)
graph.add_node("tools", run_tools)
graph.add_conditional_edges("llm", lambda s: "tools" if s.tool_calls else END)
graph.add_edge("tools", "llm")
graph.set_entry_point("llm")

checkpointer = PostgresSaver(conn_string)
app = graph.compile(checkpointer=checkpointer)

# Resumable across deploys, restarts, transient failures
app.invoke({"messages": [...]}, config={"thread_id": "user-123"})
```

**Vercel AI SDK — agent in a Next.js route:**

```typescript
import { generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const result = await generateText({
  model: anthropic("claude-sonnet-4-6"),
  tools: {
    weather: tool({
      description: "Get weather for a city",
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => fetchWeather(city),
    }),
  },
  maxSteps: 10,
  messages,
});
```

## What an agent framework actually buys you

- **Checkpointing**: snapshot state to Postgres / Redis so a deploy doesn't kill mid-flight agents.
- **Tracing**: every node, every tool call, every retry as a structured trace.
- **Retries and backoff** at the right granularity (one tool fails ≠ kill the whole run).
- **Human-in-the-loop**: pause on a sensitive tool, surface to a UI, resume on approval.
- **Multi-agent handoffs** with a defined interface, not ad-hoc string passing.
- **Concurrency** primitives (parallel tool calls, fan-out fan-in) that are awkward in raw code.

## Multi-agent caveat

Most multi-agent frameworks make it *easy* to spin up six agents talking to each other. Easy ≠ a good idea. Each agent multiplies token cost, latency, and failure modes. The honest 2026 default is **one strong agent with many tools**; reach for multi-agent only when you have a real division-of-labor reason (parallel research, distinct skill domains, separation-of-concerns for safety). See [the multi-agent foundations page](/docs/foundations/multi-agent) before adopting one.

## Pricing & cost notes

All major frameworks are open-source. Hosted control planes (LangSmith for LangGraph, LlamaCloud, etc.) add ~$0–$500/mo for small teams and usage-based pricing at scale. The real cost of agent frameworks is **token spend** — a 10-step agent on Sonnet can cost $0.20 *per run* before you notice. Budget per-conversation cost in your observability tool from day one.

## Pitfalls

- **Reaching for a framework before you have a working `while` loop.** You're hiding the thing you most need to understand.
- **Unbounded loops.** Always set `max_steps`. The first runaway loop on Opus is a $50 wake-up call.
- **Multi-agent for everything.** A single agent with the right tools is usually better, cheaper, and easier to debug.
- **Tools that the model can't tell apart.** Two tools named `search` and `lookup` with overlapping descriptions = a confused agent. Make tool names and descriptions distinctive.
- **No checkpointing on a long-running flow.** A deploy at minute 8 of a 10-minute run loses everything. Persist state.
- **Mixing checkpointing storage with operational data.** Don't put agent state in the same Postgres table as your users. Separate schema or separate DB.
- **Trusting tool args without validation.** The model *will* pass a stringified date when you asked for an int. Validate on the boundary (Pydantic / Zod).

---

→ Next: [Vector databases](./vector-databases.md)
