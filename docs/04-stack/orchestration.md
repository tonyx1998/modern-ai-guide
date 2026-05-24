---
id: orchestration
title: Orchestration & workflow infra
sidebar_position: 16
description: Inngest, Temporal, Trigger.dev, Restate, Hatchet — running long-running AI workflows reliably.
---

# Orchestration

> **In one line:** Durable, resumable, observable execution engines. LLM workflows can take minutes (agents, batch jobs, long-context generation); a single HTTP request can't survive that. Workflow engines can.

:::tip[In plain English]
A normal request is "you call my endpoint, I do something, I return a response." That fits inside one HTTP timeout. An *agent* might take three minutes; a *batch summarization* job might take two hours. If your server restarts mid-flow, you lose everything you've spent on tokens. A workflow engine persists every step to durable storage so the work survives deploys, crashes, and provider rate limits. When the LLM 429s, the workflow waits, retries, and picks up where it left off.
:::

## The major options (2026)

| Engine | Language | Hosting | Style | Best for |
|--------|---------|---------|-------|---------|
| **Inngest** | TS-first; Py | Cloud + OSS dev kit | Durable functions, event-driven | TS-first teams; great DX |
| **Trigger.dev** | TS-first | Cloud + self-host | Durable jobs | TS apps; simpler than Temporal |
| **Temporal** | Py / Go / TS / Java | Cloud + self-host | Heavyweight, language-agnostic | Production-grade, large teams |
| **Restate** | TS / Py / Java | Cloud + self-host | Durable + stateful entities | Agentic patterns, virtual actors |
| **Hatchet** | Py / TS / Go | OSS / Cloud | Postgres-backed | Simpler than Temporal, self-hostable |
| **Prefect** | Python | Cloud + OSS | Data-eng flavored | Python data + AI pipelines |
| **Dagster** | Python | Cloud + OSS | Asset-oriented | Data + ML pipelines |
| **Modal** | Python | Hosted | Serverless functions + queues | Python AI workloads; GPU-friendly |
| **AWS Step Functions** | any | AWS | Cloud-native state machine | All-AWS shops |
| **GCP Workflows / Azure Logic Apps** | any | their clouds | Cloud-native | Cloud-locked teams |

## Default pick for most teams

- **TypeScript stack:** **Inngest**. The DX is the best in the category, the OSS dev kit runs on your laptop, durable functions are just `step.run()`, and the cloud tier is generous.
- **Python AI stack:** **Modal** for the "GPU + workflow" combo, **Inngest Python** or **Hatchet** for general-purpose, **Temporal** when you've hit enterprise scale.
- **You want one tool that runs anywhere:** **Temporal**. Heaviest, also most battle-tested.

## When to deviate

- **Long-running agents that need to checkpoint mid-flow and resume on a new container:** **Temporal**, **Restate**, or **Inngest** — anything with first-class durable execution.
- **Agentic patterns with per-session state (virtual actors):** **Restate** is uniquely good here.
- **Batch / scheduled / cron AI jobs at scale:** **Inngest** cron, **Modal** scheduled functions, or **Prefect** for data-pipeline flavor.
- **Already on a cloud platform's primitives:** **Step Functions**, **GCP Workflows**, **Azure Logic Apps** — extra infra avoided.
- **Heavy GPU work + workflow in one tool:** **Modal**. Hosted vLLM, batch fine-tuning, scheduled embeddings — all in one Python decorator.

## Why orchestration matters for AI

- **Survives deploys, restarts, transient failures.** Long-running agent on minute 8 doesn't lose state when the container restarts.
- **Resumable workflows** — pick up where left off when the LLM provider returns 429.
- **Step-level retries** with exponential backoff — `step.run("call-llm", llm_call)` retries that step only.
- **Observability for free** — every step is a span, every retry is recorded.
- **Human-in-the-loop** — pause for approval; resume on the click. The workflow waits cheaply.
- **Concurrency control** — "no more than 5 concurrent embedding jobs per tenant."
- **Idempotency** — re-running a workflow with the same ID picks up the cached result rather than re-paying.

## Minimum integration

**Inngest — TypeScript durable function:**

```typescript
import { inngest } from "./client";

export const summarizeDoc = inngest.createFunction(
  { id: "summarize-doc", retries: 3 },
  { event: "doc.uploaded" },
  async ({ event, step }) => {
    const text = await step.run("parse-pdf", () => parsePdf(event.data.url));
    const chunks = await step.run("chunk", () => chunk(text));
    const summary = await step.run("llm-summarize", async () =>
      llm.complete(`Summarize: ${chunks.join("\n")}`)
    );
    await step.run("store", () => db.save(summary));
  }
);
```

Each `step.run` is durably checkpointed. If `llm-summarize` 429s and the container dies, the next attempt resumes from the LLM step — not the start.

**Temporal — Python workflow:**

```python
from temporalio import workflow, activity

@activity.defn
async def call_llm(prompt: str) -> str:
    return await llm.complete(prompt)

@workflow.defn
class AgentWorkflow:
    @workflow.run
    async def run(self, query: str) -> str:
        for _ in range(10):
            response = await workflow.execute_activity(
                call_llm, prompt=query,
                start_to_close_timeout=timedelta(seconds=60),
                retry_policy=RetryPolicy(maximum_attempts=5),
            )
            if "done" in response:
                return response
            query = f"Continue: {response}"
        raise ApplicationError("max steps")
```

## When to add orchestration

- AI flows take longer than ~30 seconds.
- You have batch / cron / scheduled AI jobs.
- You have human-in-the-loop approval steps.
- Failures mid-workflow are costly (tokens already spent, partial DB writes).
- You need to fan out across many items (embed 100k docs in parallel).

For a single-request streaming chatbot, you don't need orchestration. For an agent that researches over an hour, you need it badly.

## Pricing & cost notes

| Tool | Free tier | Paid |
|------|----------|------|
| Inngest Cloud | 50k steps/mo | $20+/mo, usage-based |
| Trigger.dev Cloud | generous free | $20+/mo |
| Temporal Cloud | trial credit | usage; enterprise $$$$ |
| Restate Cloud | beta credits | usage |
| Hatchet | OSS free | hosted starting low |
| Modal | $30/mo free credits | usage (compute + functions) |
| Step Functions / Workflows | per-transition pricing | tiny for typical AI scale |

Orchestration cost is almost always trivial compared to LLM token cost. The savings from "no more lost mid-flight agent runs" pay for it many times over.

## Pitfalls

- **Putting orchestration on a long-running HTTP request.** You're sidestepping the entire point. Move the work behind an event or a queue.
- **Not making activities idempotent.** Workflows retry. If your "send email" step actually sends on every retry, your users get four copies.
- **One giant workflow function.** Break into steps. Each `step.run` is your retry / checkpoint granularity.
- **Storing large blobs in workflow state.** State gets serialized on every checkpoint. Put files in S3 and pass references.
- **No `start_to_close_timeout`.** A hung LLM call hangs the workflow until heat-death of the universe.
- **Mixing dev and prod workflow IDs.** Re-deploying a workflow definition with the same ID but different code is the classic Temporal footgun. Use versioning.
- **Orchestration for what should be a function call.** A 200ms LLM call doesn't need durable execution. Don't reach for the heavy hammer.

---

→ Next: [Agent runtimes](./agent-runtimes.md)
