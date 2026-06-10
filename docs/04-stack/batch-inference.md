---
id: batch-inference
title: Batch inference
sidebar_position: 18
description: OpenAI Batch, Anthropic Message Batches, Gemini batch — half-price inference when you can wait, plus the schedulers that drive them.
---

# Batch inference

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Submit a JSONL file of requests; come back hours later for the responses; pay roughly half. The single biggest cost lever in your stack for anything that doesn't need to be interactive.

:::tip[In plain English]
A "batch" API is the LLM provider's version of "we'll run it when we have spare capacity." You package up thousands of requests into one file, upload it, and the provider returns the results within a window (typically 24 hours, often much sooner). The price tag: 50% off real-time pricing. If you're embedding a corpus, summarizing a backlog, classifying old emails, generating eval data, or doing nightly enrichments — anything where "two minutes from now" is fine — batch APIs cut your bill in half with one line of code change.
:::

## The major options (2026)

| Provider | Batch endpoint | Discount | SLA | Max requests per batch | Cancel |
|----------|---------------|---------|-----|-----------------------|--------|
| **OpenAI Batch** | `/v1/batches` | 50% | within 24h, usually faster | 50k per file, 200MB | yes |
| **Anthropic Message Batches** | `/v1/messages/batches` | 50% | within 24h | 100k per batch | yes |
| **Google Gemini Batch** | Vertex `BatchPredictionJob` | 50% | 24h | scales by project | yes |
| **AWS Bedrock Batch** | per-model | 50% | up to 24h | depends on model | yes |
| **Together / Fireworks / Groq batch** | OpenAI-compatible batch endpoints | 25–50% | varies | model-dependent | yes |

Provider-side batching is the cheapest path. If you need *your own* batching layer (queue many requests, send concurrently, rate-limit, retry, persist), use a scheduler:

| Scheduler | Strengths | Best for |
|-----------|-----------|---------|
| **Modal** | GPU + queue + Python | Self-hosted batch on open models |
| **Inngest batch / debounce** | Event-driven; TS-first | Aggregating bursty events into batches |
| **Trigger.dev** | TS durable jobs | TS batch pipelines |
| **Celery / RQ + Redis** | Boring, well-known | Python teams already using it |
| **SQS / Cloud Tasks / Pub/Sub** | Cloud-native | Existing cloud-locked stacks |
| **Hatchet / Temporal** | Durable batch workflows | Mid-size to large Python teams |

## Default pick for most teams

**The provider's native batch API**, called from a small script that runs nightly. It's 20 lines of code, free of scheduling infrastructure, and gives you the full 50% discount.

When batch jobs become a regular thing — fan-out across tenants, retries, dependencies — wrap it in **Inngest** (TS) or **Modal** (Py) for proper job management.

## When to deviate

- **Truly latency-sensitive but volume-heavy** (a user is waiting, but you have 1000 sub-tasks): you can't use the 24h batch API — use **parallelism + rate-limit aware concurrency** in your own scheduler.
- **Self-hosted open models**: there's no batch API, but **vLLM** continuous batching gives you the same economic benefit at runtime. Run the queue through **Modal** or **Ray**.
- **Mixed-priority queues** (some jobs need 1 minute, some can wait): a scheduler (**Inngest**, **Temporal**) that routes by priority into different lanes.
- **You need to know cost up-front for a fixed corpus**: batch APIs let you submit and see token estimates without committing.

## What batch is great for

- **Embedding a large corpus.** Embedding 1M chunks at $0.02/Mtok is $10; at batch pricing, $5.
- **Backfill / migration.** Re-summarizing or re-classifying old data after a prompt change.
- **Eval runs.** A 500-case eval against three models = 1,500 calls; batch costs half.
- **Synthetic data generation.** Generate 10k training examples overnight at half price.
- **Newsletter / digest jobs.** Daily summaries of yesterday's data.
- **Nightly enrichment.** Score every signup of the day; tag every support ticket from the prior shift.
- **Periodic re-grading.** Score every conversation from the prior week against your latest rubric.

## What batch is NOT for

- Real-time chat.
- Anything where a user is actively waiting.
- Sub-minute SLAs.
- Workflows where you need the result to continue an interactive flow.

## Minimum integration

**OpenAI Batch — three calls:**

```python
import openai, json
client = openai.OpenAI()

# 1. Build a JSONL file of requests
with open("input.jsonl", "w") as f:
    for i, doc in enumerate(docs):
        f.write(json.dumps({
            "custom_id": f"req-{i}",
            "method": "POST",
            "url": "/v1/chat/completions",
            "body": {
                "model": "gpt-5.1-mini",
                "messages": [{"role": "user", "content": f"Summarize: {doc}"}],
            }
        }) + "\n")

# 2. Upload + submit
batch_file = client.files.create(file=open("input.jsonl", "rb"), purpose="batch")
batch = client.batches.create(
    input_file_id=batch_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
)

# 3. Poll, then download (typically 5min–4h, not 24h)
while client.batches.retrieve(batch.id).status != "completed":
    time.sleep(60)

results = client.files.content(client.batches.retrieve(batch.id).output_file_id)
```

**Anthropic Message Batches — same shape:**

```python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"req-{i}",
            "params": {
                "model": "claude-haiku-4-5",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": f"Classify: {text}"}],
            }
        }
        for i, text in enumerate(texts)
    ]
)
# Poll batch.id; results come back as JSONL with the same custom_ids.
```

## Pricing & cost notes (May 2026)

A worked example. Classifying 5 million support tickets through Haiku:

- **Real-time:** ~$25 input + $5 output ≈ **$30**.
- **Batch (50% off):** ≈ **$15**.

Same for embeddings. A 50M-token corpus at OpenAI batch:

- **Real-time embeddings:** $1.00.
- **Batch:** $0.50.

The savings are linear and meaningful at scale. For a startup spending $10k/mo on LLM API calls, moving 40% of traffic to batch saves $2k/mo with one engineer-day of work.

## Patterns worth knowing

- **Batch by time-of-day.** Submit at 11pm; you almost always have results before standup.
- **Mix batch + realtime.** Realtime for the user-facing call, batch for the offline reprocessing. Same model, different price.
- **Per-batch dedupe.** If two rows produce the same prompt, only include it once and fan the result out.
- **Treat the JSONL as input to a workflow step.** Wrap submission + polling + download in a durable workflow (Inngest, Temporal) so a deploy doesn't lose the batch ID.
- **Save the `custom_id`-to-row mapping.** When the batch returns, you need to know which output goes with which input.
- **Self-hosted equivalent:** vLLM with continuous batching gives the same effective discount at runtime on open models.

## Pitfalls

- **Using batch for user-facing requests.** "Within 24 hours" includes the worst case. Users will not wait.
- **Submitting one huge batch instead of many medium ones.** A single 500MB batch is one big retry surface and one slow poll loop. Chunk into 10–50MB batches.
- **No `custom_id`.** You lose the mapping from input to output. Always set it.
- **Forgetting to download before the retention window** (typically 29 days). After that, results are gone.
- **No retry strategy for failed lines.** Batches return per-line success/failure. Handle the failures.
- **Doing batch by hand-rolling concurrency to the realtime API.** You'll hit rate limits and pay full price. Use the actual batch endpoint.
- **Not tagging spend.** Without a metadata field, you can't tell batch vs realtime in your billing dashboard.

<Quiz id="batch-inference-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the core trade that batch APIs offer?"
  options={[
    { text: "Higher accuracy in exchange for longer prompts" },
    { text: "Roughly half the price in exchange for results arriving within a window, typically up to 24 hours" },
    { text: "Unlimited rate limits in exchange for a monthly fee" },
    { text: "Free input tokens in exchange for paid output tokens" }
  ]}
  correct={1}
  explanation="Batch is the provider running your requests on spare capacity: same models, same quality, about 50% off, with a completion window instead of an instant response. Nothing about the outputs changes — the only thing you give up is interactivity, which is why it's the biggest pure cost lever in the stack."
/>

<Question
  prompt="Which job is a BAD fit for a batch API?"
  options={[
    { text: "Embedding a million-chunk corpus" },
    { text: "Nightly enrichment of the day's signups" },
    { text: "Re-running a 500-case eval suite against three models" },
    { text: "Generating a response a user is actively waiting on" }
  ]}
  correct={3}
  explanation="The completion window includes a worst case of many hours, so anything with a human waiting is disqualified — that's the page's hard line. Corpus embedding, nightly jobs, and eval runs are the canonical good fits precisely because nobody is staring at a spinner while they finish."
/>

<Question
  prompt="Why must every request in a batch include a custom_id?"
  options={[
    { text: "Results come back per line, and the custom_id is how you map each output to its input row" },
    { text: "Providers reject batches without IDs" },
    { text: "The custom_id determines processing priority" },
    { text: "It enables the 50% discount to apply" }
  ]}
  correct={0}
  explanation="Batch results are not guaranteed to come back in submission order, so without the ID you have thousands of answers and no idea which question each one belongs to. It has nothing to do with priority or pricing — it's purely your bookkeeping thread back to the source row."
/>

</Quiz>

---

→ Next: [Voice infrastructure](./voice-infra.md)
