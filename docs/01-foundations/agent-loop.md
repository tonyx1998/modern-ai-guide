---
id: agent-loop
title: The agent loop
sidebar_position: 23
description: Tool call → observation → next tool call → done. The single mechanism behind every "AI agent" you've heard of.
---

# The agent loop

> **In one line:** An agent is an LLM in a `while` loop: call the model, execute the tool(s) it requests, feed the results back, repeat until it stops requesting tools.

:::tip[In plain English]
There is no special "agent" code. There's just a loop. The model talks; you obey by running any tool it asks for; you tell it what happened; it talks again. Sometimes the talk is the final answer. Sometimes it's another tool request. You keep going until it stops asking. Every "agent framework" you've heard of is a fancy version of that loop.
:::

## The loop, in pseudocode

```python
messages = [system_prompt, user_message]
for step in range(MAX_STEPS):
    response = llm(messages, tools=tools)
    if response.tool_calls:
        for call in response.tool_calls:
            result = execute_tool(call.name, call.arguments)
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
        messages.append(response)  # keep the assistant tool-request turn too
    else:
        return response.content  # the model stopped requesting tools — final answer
```

That's the whole architecture. Every "agentic framework" is some variation of this loop, plus convenience layers (retries, parallelism, observability, structured planning).

```mermaid
flowchart TB
    A[System + user message] --> B[LLM call]
    B --> C{tool_calls?}
    C -->|yes| D[Execute each tool]
    D --> E[Append tool results]
    E --> F[Step++; under cap?]
    F -->|yes| B
    F -->|no| G[Stop: max steps]
    C -->|no| H[Return final answer]
```

## Why this works

The model is using its trained-in reasoning ability to decide:

1. What information does it still need?
2. Which available tool gets that information?
3. What arguments to pass?

Repeat until the model believes it has enough to answer.

The same pattern handles wildly different tasks:

- **Research:** `search(q) → read(url) → search(refined_q) → answer`
- **Coding:** `read_file → edit → run_tests → fix_failures → done`
- **Customer support:** `lookup_user → check_orders → issue_refund → notify`
- **Data analysis:** `query_db → plot(result) → query_db(refined) → summarize`

You don't write 4 different agents. You write 4 different tool sets.

## Worked example: a research mini-agent

```python
tools = [
    {"type": "function", "function": {
        "name": "web_search", "description": "Search the web.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
    }},
    {"type": "function", "function": {
        "name": "fetch_url", "description": "Fetch the readable text of a URL.",
        "parameters": {"type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]},
    }},
]

def execute_tool(name, args):
    if name == "web_search":
        return json.dumps(serpapi.search(args["query"])[:5])
    if name == "fetch_url":
        return readability.fetch(args["url"])

def research(question, max_steps=8):
    messages = [
        {"role": "system", "content": "Answer the user's question. Search and read sources as needed. Cite URLs."},
        {"role": "user", "content": question},
    ]
    for step in range(max_steps):
        resp = client.chat.completions.create(model="gpt-5-mini", messages=messages,
                                              tools=tools, parallel_tool_calls=True, temperature=0)
        msg = resp.choices[0].message
        messages.append(msg)
        if not msg.tool_calls:
            return msg.content
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)
            result = execute_tool(call.function.name, args)
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result[:5000]})
    return "I couldn't finish within step budget."

print(research("What's the most-downloaded npm package in May 2026 and why?"))
```

Forty lines, full research agent. The model decides when to search, what to fetch, when it's done. You decided what tools it has and how to format their outputs.

## Cost model: what an agent run actually costs

A single chat call is easy to price. An agent is trickier because **every step is a full LLM call over the *growing* context** — step 3 re-sends everything from steps 1 and 2. Cost grows faster than linearly in steps, so you estimate per *run*, then multiply by volume.

Worked example — a support agent that averages **3 steps**, roughly 4K input + 200 output tokens per step (the input climbs each step as tool results pile up), on a workhorse model at ~$1 / 1M input and ~$5 / 1M output:

```
per step:  4,000 in  × $1 /1M  = $0.004
           200   out × $5 /1M  = $0.001
           ----------------------------
           $0.005 per step  ×  3 steps  ≈  $0.015 per run

at 10,000 runs/day:  ~$150/day  ≈  ~$4,500/month
```

Now the levers, biggest first:

1. **Cap steps and tokens.** The `max_steps` / `max_tokens_total` caps in the skeleton below aren't just safety — they're your cost ceiling. To turn a *dollar* budget into a token budget: `$0.05 ÷ blended price ≈ token cap`.
2. **Truncate / summarize tool results.** The input is what balloons. Returning a 500-token summary instead of a 4K JSON dump cuts every *subsequent* step, not just the current one.
3. **Cache the static prefix.** The system prompt + tool definitions are identical every step — [prompt caching](./prompt-caching.md) bills them at a fraction after the first call, typically 30–50% off input on multi-step runs.
4. **Route easy turns to a smaller model.** Not every step needs the frontier; a [cascade](./model-families.md) inside the loop keeps cheap turns cheap.

:::info[Try it — instrument the cost]
Take the research mini-agent above and log `(step, tokens_in, tokens_out, cost)` per step. Run it on 20 questions and plot cost against step count — you'll see the super-linear curve. Then add tool-result truncation (cap each result at ~800 tokens) and prompt caching, re-run, and measure the savings. The before/after chart is a tidy [portfolio](/docs/career/career-portfolio) artifact: "how I cut my agent's cost per run by 40%."
:::

## Where agents fail

- **Drift over many steps.** Each step has some error rate; long agentic workflows compound it. Keep agents short. If the workflow has more than ~10 steps, consider decomposing.
- **Tool selection errors.** Too many tools = model picks wrong. Tight, well-described tool sets beat sprawling ones.
- **Infinite loops.** Always cap iterations.
- **Silent partial failure.** A tool returned an error message and the model "handled" it by ignoring it. Treat tool errors as first-class signals in the prompt.
- **Cost surprises.** Each loop step is a full LLM call with the full growing context. Costs can balloon. Monitor steps-per-conversation.
- **Context bloat.** After 5 tool calls each returning 2K of JSON, your prompt is 30K and the model loses focus. Truncate / summarize tool results.

## Single-agent vs chain vs multi-agent

- **Chain** — fixed pipeline of LLM/tool calls in a predetermined order. Predictable. Use when the workflow is known.
- **Single agent** — one model, dynamic tool selection. Use when the workflow varies per request.
- **Multi-agent** — multiple specialized agents that delegate to each other. Sometimes useful (planner + worker), often premature complexity. See [multi-agent](./multi-agent.md).

The 2026 default: **start with a chain. Promote to a single agent when the chain branches too much. Reach for multi-agent only with evidence.**

```mermaid
flowchart LR
    A[Hard-coded chain] -->|workflow varies| B[Single agent]
    B -->|specialization win| C[Multi-agent]
```

## Observability you should ship from day one

For every agent run, log:

- The full message list at each step.
- Each tool call (name, args) and its result.
- Step count, total tokens in/out, total cost.
- Final outcome (success / max_steps / error).
- Wall-clock time per step.

Without this you can't debug *anything*. Frameworks (LangSmith, Langfuse, Arize, Helicone, Phoenix) wrap this; even just `JSONL` to a file beats nothing.

## What beginners get wrong

:::caution[Common mistakes]
- **No step cap.** A confused model can chew through hundreds of steps and a fortune. Cap.
- **Sending 50 tools and wondering why selection is bad.** Curate. Group. Route first.
- **Returning huge tool results.** A 50K JSON dump in the context pollutes attention. Return summaries; let the model request detail.
- **No retry on tool failures.** Network blip → tool errors → agent gives up. Wrap tools in retry-with-backoff for transient errors.
- **Pretty-print everything.** Use JSON for tool I/O, not markdown tables. The model doesn't care about formatting; you'll pay for the extra tokens.
- **Forgetting that the model's "thinking" between tool calls is also paid output.** Reasoning models can spend thousands of tokens between visible turns.
- **Treating the agent as autonomous when it shouldn't be.** "Email the customer" or "transfer the funds" should require a confirmation step, not be inside the loop.
- **Hot-loading prompts mid-loop.** Changing the system prompt or tool list during a run breaks reproducibility.
:::

## A reasonable agent skeleton

```python
async def run_agent(system: str, user_msg: str, tools: list,
                     max_steps: int = 10, max_tokens_total: int = 100_000):
    messages = [{"role": "system", "content": system},
                {"role": "user", "content": user_msg}]
    total_tokens = 0
    for step in range(max_steps):
        resp = await client.chat.completions.create(
            model="gpt-5-mini", messages=messages, tools=tools,
            parallel_tool_calls=True, temperature=0,
        )
        total_tokens += resp.usage.total_tokens
        if total_tokens > max_tokens_total:
            return {"status": "budget_exceeded", "final": None}
        msg = resp.choices[0].message
        messages.append(msg)
        log_step(step, msg, resp.usage)
        if not msg.tool_calls:
            return {"status": "done", "final": msg.content, "steps": step + 1, "tokens": total_tokens}
        results = await asyncio.gather(*[safe_exec(c) for c in msg.tool_calls])
        for call, res in zip(msg.tool_calls, results):
            messages.append({"role": "tool", "tool_call_id": call.id, "content": truncate(res, 4000)})
    return {"status": "max_steps", "final": None, "steps": max_steps}
```

Step cap, token cap, error-tolerant exec, truncated results, logged steps. 95% of what a framework gives you, in 25 lines.

:::info[Highlight: agents are loops you can debug]
The hype paints agents as autonomous beings. They're not. They're loops over an LLM that calls tools. If you can read the loop, you can debug the agent. If you can't read the loop (because a framework hid it), you can't debug it. Pick frameworks that let you see the loop.
:::

**→ Going deeper:** This is the foundational loop. For the production version — iteration caps, per-step observability, structured errors, and human handoff — see [The agent loop with guardrails](../10-patterns/agent-loop.md). For how you *measure* whether an agent's loop is actually any good (outcome, trajectory, and tool-call accuracy), see [Evaluating agents](../13-evaluation/095-agent-evaluation.md).

<Quiz id="agent-loop-quick-check" variant="micro" title="Quick check">

<Question
  prompt="In the agent loop, how does your code know the agent is finished?"
  options={[
    { text: "The model's response contains no tool calls — its plain content is the final answer" },
    { text: "The model must call a special done tool" },
    { text: "The loop always runs exactly MAX_STEPS times" },
    { text: "The executor detects that the goal was achieved and breaks" }
  ]}
  correct={0}
  explanation="The termination signal is the model itself: as long as it wants more information it emits tool calls, and when it believes it has enough, it answers in plain content — that's your exit. MAX_STEPS is the safety cap for confused models, not the normal exit. Nothing in your code judges whether the goal was achieved; the model decides when it's done."
/>

<Question
  prompt="After five tool calls each returning 2K of JSON, your agent starts ignoring earlier results and drifting. The page's diagnosis is:"
  options={[
    { text: "The model needs a higher temperature" },
    { text: "Too few tools are available" },
    { text: "Context bloat — large tool results pollute attention; truncate or summarize them" },
    { text: "The loop needs more iterations to recover" }
  ]}
  correct={2}
  explanation="Each loop step carries the full growing context, so five 2K results means a 30K prompt where the model loses focus. The fix is returning summaries or truncated results and letting the model request detail when it needs it. More iterations make it worse — every extra step adds more context and more cost to an already-drowning prompt."
/>

<Question
  prompt="Per the 2026 default on this page, a brand-new workflow should start as:"
  options={[
    { text: "A multi-agent system, since it's the most capable architecture" },
    { text: "A hard-coded chain; promote to a single agent only when the workflow branches too much" },
    { text: "A single agent with 50 tools to cover every case" },
    { text: "A reflection loop wrapped around a planner" }
  ]}
  correct={1}
  explanation="The escalation path is chain, then single agent, then multi-agent — and you only move up with evidence. A chain is predictable and debuggable; an agent earns its keep when the workflow genuinely varies per request. The 50-tool agent is the tempting shortcut, but tool selection accuracy tanks well before 50; tight, curated tool sets beat sprawling ones."
/>

</Quiz>

---

→ Next: [Planning and reflection](./planning-and-reflection.md)
