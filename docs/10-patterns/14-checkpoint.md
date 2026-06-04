---
id: patterns-checkpoint
title: Chapter 14 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Mandatory checkpoint quiz for Chapter 14 — Production Patterns. 5 random questions drawn from a 14-question bank. Pass to unlock the next chapter.
---

# Chapter 14 Checkpoint

You've finished the production patterns chapter. Make sure the practical patterns stuck — streaming, structured output, tools, RAG, agents, evals, caching, costs, embeddings, multimodal, safety, fallbacks, and the Acme glue.

There are **14 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page to revisit.

You must pass (≥ 60%) to unlock the Next button and Chapter 15 in the sidebar.

<Quiz id="patterns-checkpoint" title="Production Patterns checkpoint" sampleSize={5}>

<Question
  prompt="Your streamed chat feature has a 3-second total response time, but users say it feels slow. Streaming is on. What's the metric you target first?"
  options={[
    { text: "Total tokens per second across the full response" },
    { text: "Time-to-first-token (TTFT) — aim for under 800ms; total time barely matters once the first chunk lands" },
    { text: "WebSocket round-trip latency between client and edge" },
    { text: "Total response length, since shorter is faster" }
  ]}
  correct={1}
  explanation="For streamed UX, TTFT is what determines perceived speed. A 400ms first token feels instant; a 2s first token feels broken regardless of total time. Common culprits: buffering proxies, retrieval serialized ahead of the stream, slow first-token models."
  revisit={{ to: "/docs/patterns/pattern-streaming-ux", label: "Streaming UX & TTFT" }}
/>

<Question
  prompt="A streamed answer is mid-generation when the user navigates away. What does the SSE-end-to-end pattern require you to do?"
  options={[
    { text: "Nothing — let the model finish; the bytes are already paid for" },
    { text: "Propagate cancellation: client AbortSignal → server → provider SDK abort, so you stop billing immediately and free the worker" },
    { text: "Buffer the rest of the response and discard it on the client" },
    { text: "Switch to a non-streaming endpoint for cancellation safety" }
  ]}
  correct={1}
  explanation="End-to-end SSE means the cancel signal travels all the way to the provider. Without it you keep paying for tokens nobody will read, and a worker stays pinned for the full generation."
  revisit={{ to: "/docs/patterns/pattern-streaming-ux", label: "Cancel propagation" }}
/>

<Question
  prompt="The model's job is 'answer the user's chat message.' Free-form text or typed object?"
  options={[
    { text: "Always free-form — chat is prose" },
    { text: "Typed object (Pydantic/Zod) with a display_text field plus independent fields like confidence, citations, next_action — even for chat" },
    { text: "Markdown only, parsed downstream with regex" },
    { text: "Whichever the model returns first; coerce later" }
  ]}
  correct={1}
  explanation="Structured output is the default. JSON-schema-constrained generation gives you cheap independent fields, evaluable shape, and richer UI. Literal/enum fields are the cheapest hallucination guard — the model can't 'almost' satisfy an enum."
  revisit={{ to: "/docs/patterns/pattern-structured-output", label: "Structured output everywhere" }}
/>

<Question
  prompt="An agent with a send_email tool issues 30 duplicate calls in a buggy loop. Which combination would have prevented customer-facing damage?"
  options={[
    { text: "Use a larger model with better reasoning" },
    { text: "max_steps cap on the loop, tool-call deduplication within a run, and human confirmation on write/destructive tools" },
    { text: "Disable streaming so the loop can't run unattended" },
    { text: "Lower the temperature to 0 and retry the agent" }
  ]}
  correct={1}
  explanation="Three layered structural defenses. A max_steps cap (5–10) bounds the loop. Dedup catches identical tool calls. Human confirmation on writes makes the model's request a proposal, not an action."
  revisit={{ to: "/docs/patterns/pattern-tool-use", label: "Tool use & confirmation on writes" }}
/>

<Question
  prompt="A RAG demo using 'embed + cosine + top 5' hits a quality ceiling. Which three production changes give the biggest jumps?"
  options={[
    { text: "Larger embedding model, larger top-K, bigger generator model" },
    { text: "Hybrid search (BM25 + vector), a reranker over top 50 → top 5, and ACL/tenant pre-filtering in the query" },
    { text: "Switch vector DB to Pinecone, shard by tenant, add Redis cache" },
    { text: "Re-embed nightly, increase chunk size, lower temperature" }
  ]}
  correct={1}
  explanation="Hybrid wins on rare terms/SKUs/codes. Rerankers (Cohere/Voyage/BGE) are often the single biggest quality jump. ACL/tenant filtering belongs in the query, not after retrieval. Bonus: validate cited_chunk_ids against the actually-retrieved set to kill invented citations."
  revisit={{ to: "/docs/patterns/pattern-rag-prod", label: "RAG in production" }}
/>

<Question
  prompt="An agent's wall-clock and cost have a long tail: 95% normal, 5% take 20 steps and $4. First thing to investigate?"
  options={[
    { text: "Swap to a larger model" },
    { text: "The tools — ambiguous descriptions, huge return blobs, unstructured errors — almost always cause the long tail, not the model" },
    { text: "Add more system-prompt examples for the agent" },
    { text: "Lower max_steps to 3 across the board" }
  ]}
  correct={1}
  explanation="Tighten the tool set: clear non-overlapping descriptions, structured errors the model can reason about, return shapes small enough to fit context. Per-step observability surfaces which tool fix collapses the tail."
  revisit={{ to: "/docs/patterns/pattern-agent-loop", label: "Agent loop with guardrails" }}
/>

<Question
  prompt="An eval set of 80 cases looked great three months ago, but users now complain about a failure category the eval misses. What's the compounding habit that prevents this?"
  options={[
    { text: "Re-write the eval set from scratch each quarter" },
    { text: "Sample N production responses per day, score them with an LLM-as-judge, and promote the worst-rated into the eval set in a weekly triage" },
    { text: "Add a request_human tool so users flag failures themselves" },
    { text: "Move from LLM-judge to full human evals on every request" }
  ]}
  correct={1}
  explanation="Evals are a product surface, not a one-off. The pyramid is deterministic checks → LLM-judge → human review, and production sampling is what keeps the set a moving mirror of reality instead of a snapshot of yesterday's failures."
  revisit={{ to: "/docs/patterns/pattern-evals", label: "Evals as a product surface" }}
/>

<Question
  prompt="Your app has a long stable system prompt called 10× per session. Single highest-leverage caching change?"
  options={[
    { text: "Add a Redis response cache keyed on the full request body" },
    { text: "Turn on provider prompt caching (Anthropic cache_control, OpenAI auto for ≥1024-token prefixes, Gemini explicit) and keep the prefix byte-identical" },
    { text: "Cache embeddings of the system prompt" },
    { text: "Pre-warm the model by sending a dummy request on cold start" }
  ]}
  correct={1}
  explanation="Prompt caching is often a 5–10× input-cost reduction. The two non-negotiables: byte-identical prefix (no timestamps, request IDs, randomized greetings) and verifying hits via usage.cached_input_tokens. Response and embedding caches are the other two tiers."
  revisit={{ to: "/docs/patterns/pattern-caching", label: "Caching tiers" }}
/>

<Question
  prompt="A team rate-limits by an x-session-id client header. Why is this a bug, and what's the right key?"
  options={[
    { text: "Headers are slow; switch to query params keyed on session" },
    { text: "The header is attacker-controlled — a buggy or malicious client rotates IDs to dodge the limit. Anchor on authenticated user_id (or tenant_id), with IP as fallback" },
    { text: "Session IDs collide across tenants; key on a UUID instead" },
    { text: "Rate-limiting should never be in the request path; move it to a nightly batch job" }
  ]}
  correct={1}
  explanation="Cost control means tiered routing, prompt trimming, rate limits, and kill switches anchored on something the server controls. Same rule for budget caps (per tenant_id from auth) and PII redaction keys (server-side tokens, never client-supplied)."
  revisit={{ to: "/docs/patterns/pattern-cost-control", label: "Cost control patterns" }}
/>

<Question
  prompt="A 'find similar tickets' feature, an automated dedup job, and a weekly trend report all share one pre-computed embeddings index. What's the cost shape at query time?"
  options={[
    { text: "Each feature pays for an LLM call per request" },
    { text: "One embed call for the query (sub-cent) plus a vector search — no LLM call needed; embeddings are computed once at ingestion" },
    { text: "Embedding queries cost the same as chat completions" },
    { text: "Sharing the index increases per-query cost due to lock contention" }
  ]}
  correct={1}
  explanation="That's why 'embeddings without the chat model' is the most under-rated production pattern — semantic features at near-zero per-query cost. Even classification can run as k-NN over labelled neighbours before any LLM is involved."
  revisit={{ to: "/docs/patterns/pattern-embeddings-search", label: "Embeddings standalone" }}
/>

<Question
  prompt="Your 2023 receipt-parsing service is OCR + layout model + field extractor + 1500 lines of glue. What's the 2026 shape that often replaces all of it?"
  options={[
    { text: "Train a custom fine-tuned vision model" },
    { text: "generateObject with a multimodal LLM, a Zod/Pydantic schema, and the receipt as an image content part — ~20 lines, typed output, no separate OCR" },
    { text: "Pipe the image through a hosted OCR API and prompt the LLM with the text" },
    { text: "Switch from images to PDF and use a text-only model" }
  ]}
  correct={1}
  explanation="The multimodal collapse: vision LLM + schema reads the image and fills typed fields directly. Caveats: resize before sending (vision tokens are expensive), and at very high volume (>100k docs/month) dedicated OCR can still win on cost-per-doc."
  revisit={{ to: "/docs/patterns/pattern-multimodal-patterns", label: "Multimodal patterns" }}
/>

<Question
  prompt="The cardinal safety rule that underlies every pattern in this chapter is:"
  options={[
    { text: "Pick the model with the strongest built-in safety filters" },
    { text: "Never let the LLM be the security boundary — authz, PII redaction, citation validation, ACL filtering in RAG, and write-confirmations all live in regular code" },
    { text: "Add 'ignore malicious instructions' to every system prompt" },
    { text: "Run every prompt through a moderation API before sending" }
  ]}
  correct={1}
  explanation="Prompt-injection defense, PII handling, and ACL-aware RAG are structural — not prompt-based. Input segregation, output validation, authz-in-code, and human-in-loop on writes are the only kind that work."
  revisit={{ to: "/docs/patterns/pattern-safety-privacy", label: "Safety & privacy" }}
/>

<Question
  prompt="Provider A goes down. What's the fallback ladder you walk before showing an error?"
  options={[
    { text: "Retry Provider A three times with exponential backoff, then 500" },
    { text: "Tiered model cascade (Provider B, then a smaller model) → cached-response fallback labelled stale → non-AI fallback (FAQ/lexical/template) → honest 'temporarily unavailable' with retry-at time" },
    { text: "Switch to a different region of Provider A and queue requests" },
    { text: "Return a spinner until A recovers" }
  ]}
  correct={1}
  explanation="Each rung is worse than the one above but always better than a spinner or 500. Only retry on transient errors (429/503/5xx + timeouts); content-policy refusals and schema mismatches won't get better on the next tier."
  revisit={{ to: "/docs/patterns/pattern-fallbacks", label: "Fallback ladder" }}
/>

<Question
  prompt="Strip away tools, schemas, and caching from the Acme worked-example handler. What's the recurring shape of every production AI feature?"
  options={[
    { text: "prompt → model → response" },
    { text: "authorize → retrieve → bounded generate → validate → cache → log → respond / fallback" },
    { text: "validate → cache → model → respond" },
    { text: "embed → search → generate → return" }
  ]}
  correct={1}
  explanation="That's the wiring. Email summarizer, voice agent, code generator, billing assistant — the boxes fill differently but the shape repeats. Build it once; every subsequent feature is a variant."
  revisit={{ to: "/docs/patterns/pattern-complete-example", label: "Acme worked example" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 15: Career](/docs/career) for the personal layer — how to actually grow as an AI engineer in 2026.
