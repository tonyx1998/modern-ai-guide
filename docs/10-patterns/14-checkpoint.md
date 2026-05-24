---
id: patterns-checkpoint
title: Chapter 10 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test for the production patterns chapter — streaming, structured output, tools, RAG, agents, evals, caching, costs, embeddings, multimodal, safety, fallbacks.
---

# Chapter 10 Checkpoint

> **In one line:** If you can answer these in your head before opening the answer, the patterns chapter stuck. If not, each question links back to the section that fills the gap.

:::tip[How to use this]
Read each question, form an answer in your head, *then* expand the answer. If you got it wrong (or right by luck), follow the link back to the source page. Aim for 11+/14. Below that, re-read the patterns you missed before you build with them.
:::

## What's covered

The 14 questions span the 13 lesson pages:

- Delivery patterns (streaming, structured output, tools, RAG, agents): 5 questions
- Operations (evals, caching, cost control): 3 questions
- Adjacent patterns (embeddings, multimodal, safety, fallbacks): 4 questions
- The complete example glue: 2 questions

---

## Q1. Streaming: the metric that matters

For a streamed chat feature with 3 s total latency, users say it "feels slow." Streaming is on. Where do you look first?

<details>
<summary>Answer</summary>

**Time-to-first-token (TTFT).** Total response time is a misleading metric for streamed chat — users care about how fast the first words appear. A 400 ms TTFT feels instant; a 2 s TTFT feels broken regardless of total time.

Fixes to consider in order: a single buffering proxy (check `text/event-stream` + chunked delivery in DevTools); RAG retrieval serialized ahead of the stream; a model with slow first-token latency; pre-stream middleware that collects chunks.

→ Revisit: [Streaming UX](./streaming-ux.md)
</details>

---

## Q2. Structured output: when to default to it

The model's job is "answer the user's chat message." Should the output be free-form text or a typed object?

<details>
<summary>Answer</summary>

**Typed object with a `display_text` (or `text`) field**, even for chat. You get cheap independent fields (`confidence`, `citations`, `next_action`), better evals, and richer UI — at the price of being marginally slower. Free-form text only for genuinely prose-shaped responses where structure adds no value.

The Zod / Pydantic schema is also the cheapest hallucination guard you have. The model can't "almost" satisfy an enum.

→ Revisit: [Structured output everywhere](./structured-output.md)
</details>

---

## Q3. Tool use: bounding side effects

An agent has a `send_email` tool. A bug causes a confused loop that issues the same call 30 times. Which guardrails would have prevented duplicate emails?

<details>
<summary>Answer</summary>

Three, layered:

1. **`maxSteps` cap** on the agent loop (5–10 is normal).
2. **Tool-call deduplication** within a run — calling `send_email(to=X, body=Y)` twice should be detectable, not silent.
3. **Human confirmation on write/destructive tools.** The model's request to call `send_email` is *not* the user's approval — render a confirmation card; the side effect runs only on Confirm.

If any one of those three is in place, the bug is a noisy log entry instead of a customer-facing disaster.

→ Revisit: [Tool use done right](./tool-use.md) and [Agent loop with guardrails](./agent-loop.md)
</details>

---

## Q4. RAG: what changes from demo to prod

A RAG demo using "embed + cosine + top 5" hits a quality ceiling. What three changes give the biggest jumps?

<details>
<summary>Answer</summary>

1. **Hybrid search** (BM25 + vector) instead of pure vector. Big win on rare terms, SKUs, error codes.
2. **A reranker** (Cohere / Voyage / BGE) over the top 50 → top 5. Often the single biggest quality jump.
3. **Pre-filtering** by tenant/lang/ACL/freshness *in the query*, not after retrieval.

Bonus: structured output with `cited_chunk_ids` and code that **validates citations against the actually-retrieved set** — drops invented sources to near-zero.

→ Revisit: [RAG pattern in production](./rag-prod.md)
</details>

---

## Q5. Agents: when the loop hates you

An agent's wall-clock time and cost have a long tail — 95% of runs are normal, 5% take 20 steps and cost $4. What's the first thing to investigate?

<details>
<summary>Answer</summary>

**The tools, not the model.** Long tails almost always trace back to tool surface problems: a tool's description is ambiguous (two tools that overlap); a tool returns a 200 KB blob the model loops over trying to find the relevant bit; a tool's errors are unstructured (the model can't reason about `Error: 500`), so it retries.

Look at the per-step trace for those 5%. You'll usually find a single tool to fix — better description, structured errors, tighter return shape — and the long tail collapses.

Only then consider model changes.

→ Revisit: [Tool use done right](./tool-use.md) and [Agent loop with guardrails](./agent-loop.md)
</details>

---

## Q6. Evals: the compounding loop

A team has a good eval set of 80 cases. After three months, real users start complaining about a category of failures the eval misses. What's the process habit that prevents this?

<details>
<summary>Answer</summary>

**Sample N production responses per day → LLM-judge them → promote the worst-rated into the eval set.** Aim for ~5–50 sampled responses per day depending on volume. Have a weekly review meeting where the team triages the lowest-scored to add as eval cases.

This is the compounding loop. Without it, the eval set is a snapshot of *yesterday's* failure modes; with it, the eval set is a moving mirror of real production. The teams that ship great AI long-term run this loop religiously.

→ Revisit: [Evals as a product surface](./evals.md)
</details>

---

## Q7. Caching: the 10× lever

What's the single highest-leverage caching change for an app with a long stable system prompt?

<details>
<summary>Answer</summary>

**Turn on prompt caching** at the provider (Anthropic `cache_control`, OpenAI automatic for prefixes ≥ 1024 tokens, Gemini explicit). A 4 KB system prompt called 10× per session was costing 10× the prefix tokens; with caching, you pay full price once and ~10% of the price 9 times. Often a 5–10× reduction on input-cost alone.

Two non-negotiables: keep the prefix byte-identical across requests (no timestamps, request IDs, randomized greetings) and verify it's hitting via the `usage.cached_input_tokens` (or equivalent) field.

→ Revisit: [Caching for cost & latency](./caching.md)
</details>

---

## Q8. Cost control: rate-limit anchoring

A team rate-limits by `x-session-id` from the client. Why is this a bug, and what's the right key?

<details>
<summary>Answer</summary>

The header is **attacker-controlled** — a malicious or buggy client rotates session IDs and dodges the limit entirely. The right key is anchored on **something the server controls**: the authenticated `user_id` (primary), with IP as a fallback for unauthenticated traffic.

Same rule applies to budget caps (per `tenant_id` from the auth context, never from a request header) and to PII redaction keys (consistent server-side tokens, never client-supplied).

→ Revisit: [Cost control patterns](./cost-control.md)
</details>

---

## Q9. Embeddings: the no-LLM superpower

Three features — "find similar tickets," automated dedup, weekly trend report — share one embeddings index. What's the cost implication at query time?

<details>
<summary>Answer</summary>

**Embeddings are pre-computed once per ticket** at ingestion. At query time the cost is one embed call (sub-cent) plus the vector search; *no LLM call needed*. That's what makes "embeddings without the chat model" the most under-rated production pattern — semantic features at near-zero per-query cost.

Even the classification step can run as k-NN (top-K nearest labelled neighbours → majority vote) before any LLM gets involved.

→ Revisit: [Embeddings & semantic search](./09-embeddings-search.md)
</details>

---

## Q10. Multimodal: the collapsed pipeline

A team's 2023 receipt-parsing service had OCR + layout model + field extractor + 1500 lines of glue. What's the 2026 shape that often replaces all of it?

<details>
<summary>Answer</summary>

**`generateObject` with a multimodal LLM, a Zod/Pydantic schema, and the receipt as an image content part.** ~20 lines, typed output, no separate OCR. The model reads the image and fills the schema directly.

Caveats: vision input is token-expensive (resize before sending), and at very high volume (>100 k docs/month) dedicated OCR (Textract, Document AI) can still win on cost-per-doc. Benchmark when you get there; default to the simpler pattern first.

→ Revisit: [Multimodal patterns](./10-multimodal-patterns.md)
</details>

---

## Q11. Safety: the cardinal rule

What's the single rule that underlies every safety pattern in this chapter?

<details>
<summary>Answer</summary>

**Never let the LLM be the security boundary.** Authorization runs in regular code (your DB enforces row-level security; your tool layer checks permissions; your moderation pipeline blocks unsafe content). PII is redacted before it leaves your perimeter. Citations are validated against the retrieved set in code, not by trusting the model. Side-effectful tools require human confirmation.

A line in the system prompt that says "ignore malicious instructions" is theatre. Structural defenses — input segregation, output validation, authz-in-code, human-in-loop on writes — are the only kind that work.

→ Revisit: [Safety & privacy](./11-safety-privacy.md)
</details>

---

## Q12. Fallbacks: the ladder

Provider A goes down. The right response isn't "show an error." Walk the ladder.

<details>
<summary>Answer</summary>

1. **Tiered model fallback** — try Provider B (different vendor, ideally), then a smaller model.
2. **Cached-response fallback** — if you have a recent answer for this query, return it labelled `stale`.
3. **Non-AI fallback** — FAQ keyword search, lexical autocomplete, template; whatever deterministic baseline exists.
4. **Honest "temporarily unavailable"** — clear notice with concrete next steps (email support, browse docs), explicit retry-at time.

Each rung is worse than the one above but always better than a spinner or a 500. Only retry on *transient* errors (429/503/5xx with timeouts); content-policy refusals and schema mismatches won't get better on the next tier.

→ Revisit: [Fallbacks & graceful degradation](./12-fallbacks.md)
</details>

---

## Q13. Complete example: the recurring shape

Strip away tools, schemas, caching from the complete-example handler. What's the underlying *shape* of every production AI feature?

<details>
<summary>Answer</summary>

```
authorize → retrieve → bounded generate → validate → cache → log → respond / fallback
```

That's it. Email summarizer, voice agent, code generator, billing assistant — the boxes fill differently but the wiring is the same. Build it once; every subsequent feature is a variant.

→ Revisit: [Complete worked example](./13-complete-example.md)
</details>

---

## Q14. Complete example: the dashboard

You're handed an existing AI feature with no dashboards. What seven metrics do you instrument first?

<details>
<summary>Answer</summary>

1. **TTFT p50/p95** per tier.
2. **Total cost / day**, per-tenant breakdown.
3. **Fallback rate** — % of requests served by each rung (primary, cheap, cache, non-AI, unavailable).
4. **Eval score** (nightly), plotted over time, alerting on > 5% regression.
5. **Escalation / human-handoff rate** — % of conversations ending with a handoff.
6. **Tool-call distribution + error rates** — which tools, how often, with what error rates.
7. **Citation-invalid rate** (RAG) or schema-validation-failure rate (structured) — should be < 1%; spikes are silent regressions.

Alerts on rates and trends, not on individual events.

→ Revisit: [Complete worked example](./13-complete-example.md)
</details>

---

## Scoring yourself

| Score | What it means                                                                 |
|-------|-------------------------------------------------------------------------------|
| 13–14 | Solid. You can run a design review for a production AI feature with confidence. |
| 11–12 | Most of it stuck. Re-read the 2–3 sections you missed.                        |
| 7–10  | The shape is there but details are fuzzy. Re-read the chapter end-to-end.     |
| < 7   | Re-read the chapter and re-do the checkpoint. These patterns are load-bearing. |

## Where to go next

- If you nailed it: continue to [Chapter 11: Career](/docs/career).
- If you want to practice: pick an AI feature you use daily (a coding assistant, a search tool, a support bot) and reverse-engineer which patterns it uses. Find the rough edges that suggest which it *isn't*.
- If a specific pattern felt shaky: jump back via the [patterns overview](./index.md) — each page stands alone.

:::note[A final thought]
The patterns aren't a checklist you tick once. They're the *vocabulary* you'll use for every AI feature design discussion for the next several years. Once you can say "we need streaming for TTFT, structured output for evals, tools with confirmation on writes, hybrid RAG with reranker, agent loop with `maxSteps`, prompt cache for the system prompt, tiered fallback, and PII scrub on logs" — and another engineer nods — you're operating in the right register. That shared vocabulary is what this chapter buys you.
:::

---

→ Back to [Patterns overview](./index.md), or continue to [Chapter 11: Career](/docs/career).
