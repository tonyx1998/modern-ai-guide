---
id: sync-vs-async
title: Sync streaming vs async batch / background
sidebar_position: 14
description: When to use the live streaming-chat pattern vs an async job queue or background workflow. The default and the flip conditions.
---

# Sync streaming vs async batch / background

> **In one line:** Use sync streaming when the user is watching; use async background workflow for everything else — and stop forcing every AI task into a chat box.

:::tip[In plain English]
The chat pattern is so ubiquitous that teams reach for it even when the user shouldn't be sitting there waiting. If the task takes more than 10 seconds, or if the user kicked it off and wants to come back later, or if you're processing 10,000 items overnight — it's not a chat. It's a background job. Use a queue, send a notification when done, and stop holding HTTP connections open for 60 seconds.
:::

## When sync streaming is right (the chat box)

- The user is **actively waiting** and expects sub-30-second response.
- Streaming tokens reduces perceived latency (chat assistants, conversational interfaces).
- The interaction is **conversational** — the next message depends on the previous answer.
- Cancellation matters — the user can stop generation mid-stream.
- The output **fits on screen** as it generates (writing, code, short answers).

The classic example: a chat assistant. The user types, sees tokens stream back, can interrupt or follow up.

## When async background is right (the job queue)

- The task takes **more than 10–15 seconds** end-to-end.
- The user kicked it off and **doesn't need to wait** (kicks off a report, walks away).
- The task is **part of a workflow** with multiple agent steps, retries, external calls.
- You need **durability** — if the server crashes mid-task, the work should resume.
- You're processing **batches** of items at scale (10s, 100s, 1000s).
- You need **retries with backoff** on flaky upstream APIs.
- You need an **audit trail** of what the system did and when.

Use a real job runner (Inngest, Temporal, Trigger.dev) — not your web server holding a request open for two minutes.

## The middle case: long-running but user-facing

What about something like an agent that takes 60–90 seconds? The user is sort of waiting, but the request would time out at most edges (Vercel, Cloudflare). Patterns:

- **Start-then-poll.** POST kicks off a job, returns a job ID. Client polls (or WebSocket) for status.
- **Server-sent progress events.** Stream not just tokens but structured progress updates (`step: 'searching'`, `step: 'reading'`, `step: 'writing'`).
- **WebSocket / SSE with checkpoints.** Useful for agent loops where the client wants to see thinking.

The principle: don't hold an HTTP request open for 60+ seconds. Even if it works in dev, the production stack will time out somewhere — load balancer, CDN, function platform.

## Pattern by use case

| Use case                                | Pattern                       |
|----------------------------------------|-------------------------------|
| Chat assistant                          | Sync streaming                |
| Code completion                         | Sync streaming                |
| "Summarize this 300-page document"      | Async background, notify when done |
| "Generate 10,000 product descriptions"  | Batch async                   |
| "Research agent — answer in 2 minutes"  | Async with progress events    |
| "Classify all 50M tickets in our DB"    | Batch async with a scheduler  |
| "Voice assistant"                       | Streaming with low-latency model |
| "Approve / reject this expense"         | Sync (sub-second classification) |

## What async lets you do that sync can't

- **Use the batch API.** Anthropic and OpenAI offer 50% discounts on batch endpoints, with hours of latency but enormous cost savings.
- **Retry without blowing up the user request.** Mid-batch failures don't burn the customer's session.
- **Cap concurrency.** Don't hammer your downstream APIs.
- **Use cheaper / slower models** where appropriate (longer thinking models, batched calls).
- **Pause and resume.** Long workflows can checkpoint and resume after deploys.

## When this rule doesn't apply

- **The task is deterministic and fast.** Sync, no streaming needed.
- **You have a real-time UI requirement** that requires sub-100ms response — neither pattern fits; you need pre-computed answers or a small local model.
- **A regulatory requirement forces synchronous acknowledgement** (e.g., trade confirmation). Even then, the AI part may be async with a sync wrapper.

## Common mistakes

- **Holding an HTTP request open for 2 minutes "because it works in dev."** Production load balancers will kill it. You'll lose the response and the user.
- **Making the user watch a 60-second spinner.** They'll close the tab. Async + email/push notification is better.
- **Sync streaming when the user can't read fast enough anyway.** A 5,000-word document being streamed doesn't help — generate it async, render it when done.
- **Async when the conversation needs to flow.** A chat assistant that takes 30 seconds to respond is a dead chat.
- **Building your own job queue.** Use Inngest / Trigger.dev / Temporal. Don't roll your own.

## How to apply it

For every AI feature, ask:

1. **Is the user actively waiting?** If no, async.
2. **Is the task likely > 15 seconds?** If yes, async (or streaming with structured progress).
3. **Does it need durability across crashes?** If yes, definitely async with a real job runner.
4. **What's the cost-per-call?** If using batch API would save serious money, async.

:::note[Worked example: the chat box that should have been a queue]
A research tool launches an "AI research assistant" — type a question, get a 4-paragraph answer with citations. Initial design: synchronous streaming in a chat box. The agent calls 5–8 tools, takes 60–120 seconds.

Production problems:
- Vercel function timeout at 60s kills half of requests.
- Users close the tab during long generations.
- Failures mid-stream lose all progress; the user has to restart from scratch.
- Cost-per-query is high because every call is on the live API tier.

The fix: rebuild as an async background job. User submits the question, gets a "we're working on it" page, can leave or wait. Backend runs on Inngest with checkpoints. Notification sent when done; user returns to a permalink with the full answer + sources.

Result:
- 0% timeout failures.
- 30% cheaper (now uses Anthropic's batch API for the non-urgent parts).
- Higher completion rate because users come back rather than abandoning.
- Workflow durability — server deploys don't kill in-flight research.

The product is no worse for the user. The "chat" instinct was the bug.
:::

<Quiz id="sync-vs-async-quick-check" variant="micro" title="Quick check">

<Question
  prompt="When is sync streaming the right pattern?"
  options={[
    { text: "For every AI feature, since chat is the standard UI" },
    { text: "For tasks that take over a minute" },
    { text: "When the user is actively waiting and expects a sub-30-second response" },
    { text: "For overnight batch processing of 10,000 items" }
  ]}
  correct={2}
  explanation="Streaming fits conversational, actively-watched interactions where tokens reduce perceived latency and the user can interrupt. The page's core warning is the opposite instinct: forcing every AI task into a chat box even when the user shouldn't be sitting there waiting."
/>

<Question
  prompt="Why shouldn't you hold an HTTP request open for 60+ seconds, even if it works in dev?"
  options={[
    { text: "Production load balancers, CDNs, and function platforms will time it out" },
    { text: "HTTP cannot carry streamed tokens" },
    { text: "Provider terms of service forbid it" },
    { text: "It makes the model respond less accurately" }
  ]}
  correct={0}
  explanation="The production stack will kill the connection somewhere — in the worked example, the platform's 60s timeout killed half of all requests. For long user-facing tasks, use start-then-poll or server-sent progress events instead of an open request. 'It works in dev' is exactly the trap."
/>

<Question
  prompt="What does going async unlock that sync cannot?"
  options={[
    { text: "Lower model quality requirements" },
    { text: "Faster token generation" },
    { text: "Better conversational flow" },
    { text: "Batch APIs at about 50% discount, plus retries and durability" }
  ]}
  correct={3}
  explanation="Batch endpoints trade hours of latency for roughly half the cost; async also gives retries that don't burn the user's session, concurrency caps, and pause/resume across deploys. Conversational flow is the one thing async is WORSE at — a chat that takes 30 seconds to respond is a dead chat."
/>

</Quiz>

---

→ Next: [On-prem vs cloud](./09-on-prem-vs-cloud.md).
