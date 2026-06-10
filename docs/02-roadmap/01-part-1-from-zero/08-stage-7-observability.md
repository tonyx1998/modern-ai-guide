---
id: stage-7-observability
title: Stage 7 — Observability
sidebar_position: 8
sidebar_label: Stage 7 — Observability
description: Every LLM call your system makes is logged, traceable, cost-attributed, and replayable. The fastest debugging loop in AI engineering.
---

# Stage 7 — Observability

> **Time budget:** ~3–5 days

> **In one line:** Log every LLM call with full input, full output, tokens, cost, latency, and a trace ID — so you can replay any failure, attribute costs, and feed real traffic into your eval set.

If Stage 6 was "how to measure what you intend to ship," Stage 7 is "how to know what's actually happening once it's shipped." Without logging, every production bug starts with "we have no idea what the model was asked." With it, you click a record and see the exact prompt, exact response, exact cost — and replay it against a different prompt or model in seconds.

:::tip[In plain English]
Observability is the boring infrastructure that, once you have it, you wonder how you ever shipped without. For LLM apps it's not optional — the inputs are huge, the outputs vary, the costs add up silently, and the user "the bot said something weird" report is useless without the exact call to look at.
:::

## 1. What to capture per call

```python
# Minimum useful schema
{
    "id": "call_2026_05_23_001",          # unique
    "trace_id": "trace_xyz",               # links sub-calls in a chain or agent
    "parent_id": null,                     # for nested calls in an agent
    "ts": "2026-05-23T10:14:55Z",
    "user_id": "user_42",                  # or session id, or null for unauthenticated
    "tenant_id": "acme",                   # for multi-tenant apps
    "feature": "ticket_triage",            # which feature in your app made the call

    # Call inputs
    "provider": "openai",
    "model": "gpt-5-mini",
    "temperature": 0.0,
    "system_prompt": "...",
    "messages": [...],                     # full conversation
    "tools": [...],                        # if any
    "prompt_version": "v3-2026-05-21",     # what version of the prompt was used

    # Call outputs
    "response": {...},                     # full assistant message
    "tool_calls": [...],
    "finish_reason": "stop",

    # Metrics
    "prompt_tokens": 1234,
    "completion_tokens": 156,
    "cost_usd": 0.0028,
    "latency_ms_first_token": 240,         # TTFT
    "latency_ms_total": 1850,

    # Outcomes
    "error": null,                          # exception, rate limit, etc.
    "user_feedback": null,                  # thumbs-up/down if collected
}
```

This is a lot, but it's the right amount. If you cut "messages" because "they're too big," you lose the entire debugging workflow.

## 2. The cheapest workable version: a Postgres table + a wrapper

```python
# stage-7/observability.py
import time
import uuid
import json
from contextlib import contextmanager
from openai import OpenAI
import psycopg

client = OpenAI()
db = psycopg.connect("postgresql://localhost/llm_logs")

with db.cursor() as cur:
    cur.execute("""
        CREATE TABLE IF NOT EXISTS llm_calls (
            id TEXT PRIMARY KEY,
            trace_id TEXT,
            parent_id TEXT,
            ts TIMESTAMPTZ DEFAULT now(),
            user_id TEXT,
            feature TEXT,
            model TEXT,
            prompt JSONB,
            response JSONB,
            tool_calls JSONB,
            prompt_tokens INT,
            completion_tokens INT,
            cost_usd NUMERIC(10, 6),
            latency_ms INT,
            error TEXT
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS llm_calls_trace_idx ON llm_calls(trace_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS llm_calls_ts_idx ON llm_calls(ts DESC)")
    db.commit()


PRICING = {
    "gpt-5-mini": (0.25, 2.00),   # ($/M input, $/M output)
    "claude-haiku-4-5": (0.80, 4.00),
    # ... extend
}


def logged_completion(*, messages, model, user_id, feature, trace_id=None, parent_id=None, **kwargs):
    call_id = f"call_{uuid.uuid4().hex[:12]}"
    trace_id = trace_id or call_id  # standalone calls become their own trace
    t0 = time.time()
    error = None
    response = None

    try:
        response = client.chat.completions.create(model=model, messages=messages, **kwargs)
    except Exception as e:
        error = str(e)
        raise
    finally:
        latency_ms = int((time.time() - t0) * 1000)
        in_tok = response.usage.prompt_tokens if response else 0
        out_tok = response.usage.completion_tokens if response else 0
        in_price, out_price = PRICING.get(model, (0, 0))
        cost = in_tok / 1_000_000 * in_price + out_tok / 1_000_000 * out_price

        with db.cursor() as cur:
            cur.execute(
                """INSERT INTO llm_calls (id, trace_id, parent_id, user_id, feature, model,
                   prompt, response, prompt_tokens, completion_tokens, cost_usd, latency_ms, error)
                   VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s, %s, %s, %s, %s)""",
                (call_id, trace_id, parent_id, user_id, feature, model,
                 json.dumps(messages),
                 json.dumps(response.model_dump() if response else None),
                 in_tok, out_tok, cost, latency_ms, error)
            )
            db.commit()

    return response


# Now every call your app makes:
response = logged_completion(
    messages=[{"role": "user", "content": "Hi"}],
    model="gpt-5-mini",
    user_id="user_42",
    feature="ticket_triage",
)
```

100 lines, full observability, no third-party dependencies beyond Postgres. This is *enough* for a small app to ship.

## 3. The trace-ID pattern

For multi-step flows (RAG → LLM → tool call → LLM → response), one user action triggers several LLM calls. Group them with a shared `trace_id`:

```python
def handle_user_query(question: str, user_id: str):
    trace_id = f"trace_{uuid.uuid4().hex[:12]}"

    # Sub-call 1: query rewriting
    rewritten = logged_completion(
        messages=[{"role": "user", "content": f"Rewrite for retrieval: {question}"}],
        model="gpt-5-mini",
        user_id=user_id, feature="query_rewrite",
        trace_id=trace_id,
    )

    # ... do retrieval ...

    # Sub-call 2: answer generation
    answer = logged_completion(
        messages=[{"role": "user", "content": f"Answer: {question}\nContext: {ctx}"}],
        model="gpt-5-mini",
        user_id=user_id, feature="answer_generation",
        trace_id=trace_id, parent_id=rewritten.id,
    )

    return answer
```

In your dashboard, click a trace and see the full chain — query rewrite, retrieved chunks, answer call, every cost. This becomes irreplaceable for debugging agents (Stage 8).

## 4. What to do with the data

### A. Cost dashboards

```sql
-- Daily cost by feature
SELECT date_trunc('day', ts) AS day,
       feature,
       SUM(cost_usd) AS cost,
       COUNT(*) AS calls
FROM llm_calls
WHERE ts > now() - interval '30 days'
GROUP BY 1, 2 ORDER BY 1 DESC;

-- Top users by spend
SELECT user_id, SUM(cost_usd) AS spend, COUNT(*) AS calls
FROM llm_calls
WHERE ts > now() - interval '7 days'
GROUP BY user_id
ORDER BY spend DESC
LIMIT 20;

-- Cost per call by model
SELECT model,
       AVG(cost_usd) AS avg_cost,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cost_usd) AS p95_cost
FROM llm_calls
WHERE ts > now() - interval '7 days'
GROUP BY model;
```

Five SQL queries cover 80% of what you need. Wire them into Grafana or a one-page admin route in your app.

### B. Latency monitoring

```sql
SELECT feature, model,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) AS p50,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95,
       PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) AS p99
FROM llm_calls
WHERE ts > now() - interval '24 hours'
GROUP BY feature, model
ORDER BY p95 DESC;
```

When p95 latency spikes, you have a usable signal. → [Latency intuition (Part III)](../03-part-3-beyond/06-latency-intuition.md).

### C. Replay

```python
def replay(call_id: str, override_prompt: str = None, override_model: str = None):
    """Re-run a logged call with optional overrides."""
    row = db.fetchone("SELECT prompt, model FROM llm_calls WHERE id = %s", (call_id,))
    messages = json.loads(row[0])
    model = override_model or row[1]
    if override_prompt:
        messages[0] = {"role": "system", "content": override_prompt}
    return client.chat.completions.create(model=model, messages=messages)
```

This is *the* fastest debugging loop in AI engineering. User reports "the bot said something weird." You find the call ID, replay it. Then change one thing (system prompt, model, temperature) and replay again. Compare. Ship the fix.

### D. Sample to evals

```python
# Once a week, sample N "interesting" calls and offer them as eval candidates
SELECT id, prompt, response
FROM llm_calls
WHERE ts > now() - interval '7 days'
  AND (
    user_feedback = 'thumbs_down'   -- user said it was bad
    OR latency_ms > 5000             -- slow
    OR cost_usd > 0.10               -- expensive
    OR response::text ILIKE '%i don''t know%'  -- refused
  )
ORDER BY random() LIMIT 50;
```

Review each one. The ones that should have gone differently become new eval cases. This is the loop that keeps your eval set in sync with reality.

## 5. Hosted tools (when the DIY hits its limits)

You should outgrow the SQL table around the time you ship a real product or hit ~10K calls/day. Then:

| Tool | Hosted/OSS | Best for |
|------|------------|----------|
| **Langfuse** | OSS + hosted | The boring-tech answer; OSS, full-featured, has evals built in |
| **Helicone** | OSS + hosted | Drop-in proxy — change base URL, done. Great for cost dashboards |
| **LangSmith** | Hosted | LangChain shops; integrated experience |
| **Arize Phoenix** | OSS + hosted | Strong on traces and embedding visualization |
| **Braintrust** | Hosted | Premium UI, especially good for eval comparisons |
| **Datadog LLM Obs** | Hosted (paid) | If you're already on Datadog for your other observability |

[Stack: Observability tools](/docs/stack/observability-tools) has the full comparison.

The migration from DIY → hosted is usually one of: (1) you want trace UIs, not SQL; (2) you want LLM-eval and obs in one place; (3) you want PII redaction or compliance features.

## 6. PII and redaction

If your prompts contain user PII (emails, phone numbers, addresses), logging the raw prompt + response can violate your privacy policy. Options:

- **Don't log content for sensitive features** — log only metadata (model, tokens, latency, feature) for those.
- **Hash user IDs** in the log table.
- **Redact in transit** — many hosted observability tools support redaction patterns.
- **Sample heavily** — log full content for 1% of calls, metadata only for the rest. Enough for debugging, less storage/risk.

→ More in [Safety mindset (Part III)](../03-part-3-beyond/07-safety-mindset.md).

## 7. The visible-failure design

Without logging, you'll hear about failures only when users complain (loud) and never when they silently churn (most of them). With logging, you can:

- Surface "this user had 3 thumbs-down in a row" → maybe reach out.
- Notice "this model+prompt combo has 10x the refusal rate as last week" → something changed; investigate.
- Catch "calls from this feature take 8s p95" → bad UX; fix.

The data was always there. Observability is the difference between knowing and not knowing.

## Where to go deeper

- [Hamel Husain: Your AI product needs evals](https://hamel.dev/blog/posts/evals/) — the section on logging + sampling-to-eval is the playbook.
- [Langfuse docs](https://langfuse.com/docs) — open-source, good architecture documentation.
- [OpenTelemetry for AI](https://opentelemetry.io/docs/specs/semconv/gen-ai/) — emerging standard for LLM trace semantics.

## Deeper in this guide

- [Stack: Observability tools](/docs/stack/observability-tools) — the full tier list with pros and cons.
- [Patterns: Caching](/docs/patterns/pattern-caching) — once you have observability, cache-hit-rate becomes a measurable target.
- [Lifecycle: Monitor](/docs/lifecycle/lifecycle-monitor) — observability in the build-iterate-ship lifecycle.

## Project

:::tip[Project — Log every call in your RAG]
Wrap the RAG from Stage 5 with the `logged_completion` function above (or sign up for Langfuse's free tier and use their SDK). Make 30+ real queries. Then: write the four SQL queries from this page (cost-by-feature, top users, latency percentiles, sample-to-eval candidates). **Bonus:** build a tiny `/admin` page in your app that renders these as tables. By the end you should be able to point to any past call, click "replay with new prompt," and see the diff.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **"We'll add observability later."** You won't. Add it on day one, even if it's just a SQL table — by month two you'll have a hundred bugs you can debug instantly instead of guess at.
- **Logging only the user message, not the full prompt.** When you debug, you need the EXACT input to the model — including the system prompt, retrieved chunks (for RAG), and any prior assistant turns. Stripping any of these makes the log near-useless.
- **No trace IDs for multi-step flows.** Without a `trace_id` linking sub-calls, debugging an agent run is impossible. Add it on the first multi-call feature you build — refactoring it in later is painful.
- **Storing raw prompts that contain PII.** If a user's email/phone/address ends up in your `llm_calls` table, that table is now in scope for your privacy policy. Decide upfront: redact, hash, or don't log content for those features.
- **Letting the log table grow forever.** A million-call table with full JSONB prompts is hundreds of GB. Set up a retention policy (e.g., full content for 30 days, metadata-only for 1 year, deleted after).
:::

## Page checkpoint

<Quiz id="stage-7-observability-quick-check" variant="micro" title="Quick check">

<Question
  prompt="To save storage, a teammate suggests logging only the user's message instead of the full messages array. Why does this page call that a near-fatal cut?"
  options={[
    { text: "Partial logs violate the OpenTelemetry GenAI spec" },
    { text: "Debugging and replay need the EXACT model input — system prompt, retrieved chunks, prior turns — and stripping any of it makes the log near-useless" },
    { text: "The user message alone cannot be stored as JSONB" },
    { text: "Token counts cannot be computed without the full prompt" }
  ]}
  correct={1}
  explanation="When a user reports 'the bot said something weird', the only useful artifact is the exact input the model saw — which includes the system prompt version, the RAG context, and earlier assistant turns, not just what the user typed. Replay, the fastest debugging loop in AI engineering, depends on reproducing that input verbatim. Storage concerns are real but solved with retention policies and sampling, not by gutting the one field the whole workflow depends on. Token counts come from the API's usage object regardless."
/>

<Question
  prompt="One user question in your RAG triggers a query-rewrite call, then an answer-generation call. What does the trace_id give you that per-call logs alone do not?"
  options={[
    { text: "Automatic retries when any sub-call fails" },
    { text: "Lower latency, since traced calls share a connection" },
    { text: "Deduplication of identical prompts across users" },
    { text: "The ability to see the full chain for one user action — every sub-call, in order, with its cost — instead of disconnected rows" }
  ]}
  correct={3}
  explanation="A shared trace_id links all the LLM calls one user action triggered, so you can click a trace and replay the whole story: what the rewrite produced, what got retrieved, what the answer call saw. Without it, multi-step flows — and especially agents, where one task spawns many calls — are a pile of unrelated log rows, and debugging becomes guesswork. It is pure correlation metadata: it does not retry, speed up, or dedupe anything."
/>

<Question
  prompt="What is the recommended weekly practice for keeping your eval set in sync with reality once you have call logs?"
  options={[
    { text: "Re-run the full eval set against the week's production traffic" },
    { text: "Delete eval cases that have passed for four straight weeks" },
    { text: "Sample interesting production calls — thumbs-down, slow, expensive, refusals — review them, and turn the ones that should have gone differently into new eval cases" },
    { text: "Ask the model to generate new synthetic eval cases from the logs" }
  ]}
  correct={2}
  explanation="A simple SQL query surfaces the week's suspicious calls; human review decides which represent real failures; those become permanent eval cases. This loop is what keeps your eval set covering the actual usage distribution instead of the one you imagined when you wrote it. Re-running evals on traffic conflates testing with sampling, deleting passing cases throws away your regression protection, and synthetic generation skips the step that gives the loop its value — real failures from real users."
/>

</Quiz>

→ [Next: Stage 8 — A simple agent](./09-stage-8-agent.md) · [Back to Part I overview](./index.md)
