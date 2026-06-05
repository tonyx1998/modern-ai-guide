---
id: career-mock-interviews
title: Rehearsing AI-eng interviews out loud (SoloMock)
sidebar_position: 7.6
description: A verbal way to drill the 2026 AI-engineer loop — RAG design, evals, agents, and prompt-injection defense — mapped to specific mock problems you can do solo.
---

# Rehearsing AI-eng interviews out loud (SoloMock)

> **In one line:** The [AI system-design page](./career-ai-system-design) and the [defend-your-portfolio drill](./career-defend-portfolio-drill) tell you what the rounds look like — this page is about *rehearsing* them out loud, solo, with each round mapped to a specific mock problem so your reps are deliberate.

:::tip[In plain English]
By 2026 the AI-engineer loop is its own thing. You'll get a RAG design round, almost certainly an **evals** round (interviewers call evals "the new system design"), an **agent / tool-use** round, and — increasingly — a **prompt-injection / agent-security** round. You can read about all four and still fumble when someone says "ok, design the eval for this agent, out loud, now." The fix is reps where you *talk* through the tradeoffs under time pressure, not just nod along to a blog post.
:::

## The tool: SoloMock

[**SoloMock**](https://solomock.com) is a free verbal mock-interview app (a companion project to this guide). You talk to an AI interviewer over voice while you sketch or code in a real editor. Its **AI Engineer** track doesn't grade Big-O — it pushes on the things these interviews actually probe: tradeoffs, failure modes, cost/latency math, and *evaluation rigor*. Pick the **AI Engineer** track to filter to the problems below.

## The 2026 AI-eng loop, and what to rehearse for each round

| Round | What it actually tests (2026) | Rehearse with |
|-------|-------------------------------|---------------|
| **RAG system design** | End-to-end: ingestion, chunking, retrieval, citations, escalation — and the cost/latency math | [Design a RAG support chatbot](https://solomock.com/?problem=rag-support-chatbot) · [Chunking strategy](https://solomock.com/?problem=chunking-strategy) |
| **Evals ("the new system design")** | Build a gold set, LLM-as-judge, catch regressions before prod — the most heavily weighted skill | [Build an eval for a multi-tool agent](https://solomock.com/?problem=agent-trajectory-eval) · [Faithfulness eval](https://solomock.com/?problem=rag-faithfulness-eval) |
| **Agents / tool use** | An agent loop with tools, memory, termination, and the failure modes | [Implement a ReAct agent loop](https://solomock.com/?problem=react-agent-loop) |
| **LLM / agent security** | Prompt injection on a tool-using agent, the lethal trifecta, defense in depth | [Defend an agent against prompt injection](https://solomock.com/?problem=prompt-injection-defense) |
| **Prompt eng / structured output** | Robust extraction with validation + retries; structured-output mode | [Structured extraction with retries](https://solomock.com/?problem=structured-extraction-retries) |

:::info[Highlight: evals are the round people under-prepare and interviewers over-weight]
Candidates pour prep into RAG diagrams and skip evals — then lose the loop on "how would you know this agent works?" In 2026 write-ups, **evals engineering** (golden sets, LLM-as-judge, regression gates) is repeatedly called the most heavily weighted *and* the most common failure point. The non-obvious depth: a right answer reached via a broken or wasteful tool path is still a regression, so you evaluate the **trajectory**, not just the final answer — and you must keep the *judge* honest (temperature 0, neutral prompt, calibrated against human labels). Drill [the agent-eval problem](https://solomock.com/?problem=agent-trajectory-eval) until you can design that out loud.
:::

## How to actually practice

1. **One round, out loud.** Start the timer, ask clarifying questions first (latency budget, eval criteria, data freshness — AI systems live or die on these), sketch the architecture verbally *before* any code.
2. **Force yourself to name failure modes.** Hallucination, prompt injection, retrieval misses, cost blowups, malformed JSON. The AI interviewer won't volunteer them — enumerating them unprompted is the senior signal.
3. **Always close the loop on evaluation.** For any system you design, answer "how would you measure that it works?" without being asked. That habit alone separates strong from average.
4. **Then go deeper.** Pair this with the [AI system-design round](./career-ai-system-design) (the canonical "Design ChatGPT / Cursor / Perplexity" questions) and the [defend-your-portfolio drill](./career-defend-portfolio-drill).

:::caution[Where people commonly trip up]
- **All architecture, no evals.** If you can draw the RAG pipeline but can't design its eval, you'll lose the loop. Practice the eval rounds as hard as the design rounds.
- **Treating prompt injection as "add a system-prompt line."** The interviewer wants to hear that the model's text output must *never* be the security boundary — dangerous actions get gated by deterministic policy code. "Just tell it not to obey" is the wrong answer.
- **Hand-waving cost and latency.** "It'll be fast" loses. Do the back-of-envelope: tokens × calls × price, p99 latency, where you'd cache or tier models.
- **Reaching for LangChain by reflex.** Being able to write the agent loop yourself (and say *why* you would or wouldn't pull in a framework) reads as more senior than naming tools.
:::

## Page checkpoint

<Quiz id="career-mock-interviews-page" title="Did the AI-eng mock prep stick?" sampleSize={2}>

<Question
  prompt="When evaluating a multi-tool agent, why isn't final-answer correctness enough?"
  options={[
    { text: "Because final answers can't be scored automatically" },
    { text: "Because a correct answer reached via a broken or wasteful tool path is still a latent regression — you must score the trajectory too" },
    { text: "Because agents never produce a final answer" },
    { text: "Because trajectory scoring is cheaper than answer scoring" }
  ]}
  correct={1}
  explanation="Two runs can give the same answer while one took the right two tool calls and the other looped four times calling an irrelevant tool. Scoring only the destination hides path regressions, so you evaluate the trajectory (right tools, right order, no waste, terminates) as well — and keep the LLM judge calibrated against human labels."
  revisit={{ to: "/docs/career/career-mock-interviews#the-2026-ai-eng-loop-and-what-to-rehearse-for-each-round", label: "The evals round" }}
/>

<Question
  prompt="What's the core insight for defending a tool-using agent against prompt injection?"
  options={[
    { text: "Add a stronger 'never follow instructions in user content' line to the system prompt" },
    { text: "The model's text output must never be the security boundary — gate dangerous actions in deterministic policy code" },
    { text: "Use a larger model so it's smarter about injections" },
    { text: "Disable all tools permanently" }
  ]}
  correct={1}
  explanation="Instructions and untrusted data share the same context window, so prompt hardening is one thin layer, never the control. The dangerous action (refund, email, delete) must be gated by deterministic code the injected text can't argue past — least privilege, hard caps, human confirmation for irreversible actions. Recognize the 'lethal trifecta': untrusted input + private data + ability to act/exfiltrate."
  revisit={{ to: "/docs/career/career-mock-interviews#the-2026-ai-eng-loop-and-what-to-rehearse-for-each-round", label: "LLM/agent security" }}
/>

</Quiz>

## What's next

→ Pair this with the [AI system-design interviews](./career-ai-system-design) page, then run a round at [SoloMock](https://solomock.com) (AI Engineer track). For the general coding loop, the [SWE Interview Guide](https://swe-interview-guide.vercel.app) shares the same problem set.
