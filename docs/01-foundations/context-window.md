---
id: context-window
title: Context windows
sidebar_position: 9
description: The hard cap on how many tokens the model can see and emit in one call. Why bigger isn't always better.
---

# Context windows

> **In one line:** The context window is the maximum tokens (input + output combined, for most providers) that fit in a single call. 2026 frontier models are typically 200K–2M tokens.

:::tip[In plain English]
The context window is the model's working memory for one call — everything it can "see" at once. Picture a giant whiteboard. You write the system prompt, the conversation, any documents, anything the model should reference. The whiteboard has a fixed size. Run out of room? You have to erase, summarize, or pick smaller documents.
:::

![Context window budget: the system prompt, chat history, retrieved docs, and the answer all share one fixed space](/img/context-budget.svg)

## Numbers to know (May 2026)

- **Frontier chat models:** 200K tokens (Claude Opus 4.7, GPT-5) — some up to 1M–2M (Gemini 2.5).
- **Workhorse:** 128K–200K is standard.
- **Small / mid-tier:** 32K–128K is the common floor.
- **Open-weight models:** 8K–128K depending on architecture and how it was fine-tuned for long context. Llama 3.3 and Qwen 2.5 ship 128K out of the box.

A million tokens is roughly a 750,000-word document — *War and Peace* twice over. You can fit a lot. Whether you *should* is a different question.

## Why bigger isn't free

- **Cost** — every token in the prompt is billed.
- **Latency** — long prompts take longer to process (the "prefill" stage).
- **Quality** — "lost in the middle" effects are real: information buried mid-context is recalled less reliably than info at the start or end.
- **Quadratic attention cost** — providers absorb most of this with flash attention and KV cache tricks, but it's why long context costs scale super-linearly under the hood.

```mermaid
flowchart LR
    A[Tokens added] --> B[Cost: linear]
    A --> C[Prefill latency: linear-to-quadratic]
    A --> D[Quality: starts to dip past 50-80K]
```

## Worked example: budgeting a 200K window

You have a 200K window. You want:

- 4K-token system prompt (cached).
- 20-message conversation history (~10K).
- 5 RAG chunks of 1K each (~5K).
- Tool definitions (~2K).
- Response budget (~4K).

```
system:        4,000
history:      10,000
RAG:           5,000
tools:         2,000
output budget: 4,000
overhead:        500
total:        25,500 / 200,000 = 13% used
```

You have plenty of room. If the user uploads a 500-page PDF (~250K tokens), you suddenly *don't*. Now you have to chunk it and use RAG instead of stuffing the whole thing in.

## The "lost in the middle" effect

Studies (Liu et al. 2023, replicated since) show that long-context models recall the **start** and **end** of their context reliably, but accuracy on facts buried in the *middle* drops 20–40%.

```mermaid
flowchart LR
    A[Start: high recall] --> B[Middle: low recall]
    B --> C[End: high recall]
```

Practical implications:

- Put the user's actual question at the **end** of the prompt, after the context.
- Put the system prompt and "answering rules" at the **start**.
- If you have a critical fact, repeat it both places — start (rule) and end (reminder).
- Don't trust "needle in a haystack" benchmark scores. Real workloads are messier than the synthetic tests.

## Practical patterns

- **Pack the right things, not all things.** RAG with a strong retriever almost always beats "shove the whole document in."
- **Put the most important context near the end.** Long-context models recall the *most recent* tokens best.
- **Use prompt caching for stable prefixes.** A long system prompt or a long document being asked many questions becomes 5–10× cheaper if cached. See [Prompt caching](./prompt-caching.md).
- **Watch your *output* budget separately.** The same context window holds both input and output for most providers; if you let the prompt grow to 199K of a 200K window, the model can only generate 1K tokens.
- **Reserve headroom.** Always leave at least 10–20% of the window unused — both for the response and for an unexpected long retrieval result.

## When to actually use a 1M+ window

Useful:

- **Single-shot doc analysis** — "here's a 500-page contract, find every clause about liquidated damages." Beats chunking-and-stitching for one-off tasks.
- **Code repo Q&A on small repos** — paste the whole repo and ask questions. Beats RAG when the repo fits.
- **Multi-document synthesis** — comparing 50 PDFs in one call to look for contradictions.

Not useful:

- **Chatbots** — recent history is enough. Hauling 100K tokens of history every turn is just expensive.
- **High-volume production** — long inputs are billed every call. Multiply by your QPS.
- **Tasks where you don't know exactly which parts matter** — RAG outperforms huge-context most of the time, on both quality and cost.

## What beginners get wrong

:::caution[Common mistakes]
- **Treating "200K context" as a free buffet.** Every token in is paid. A 100K-token prompt at $3/M is 30 cents *per call*. 100K queries/day = $30K/month.
- **Letting context grow unbounded.** Chat with 200 messages and no summarization will eventually break (cost first, then window). Implement [memory](./memory.md) early.
- **Confusing input window with output cap.** Most providers have a separate `max_output_tokens` cap (often 4K–16K) much smaller than the input window. Read the model card.
- **Not measuring TTFT vs total latency.** A 100K prompt has a long prefill (slow first token) but normal decode rate. If users complain "it's slow to start," that's prefill — caching helps.
- **Believing the marketing.** "2M context" benchmarks rarely match real-world recall at 2M. Test with *your* docs and *your* questions before relying on it.
- **Ignoring rate limits.** A 100K-token request might fit in the context window but blow your TPM rate limit. Two different ceilings.
:::

:::info[Highlight: context window is the wrong knob to chase]
You can solve almost any "I need more context" problem with better retrieval, summarization, or caching — for a fraction of the cost. Reach for the giant context window when the task genuinely demands it, not because it sounds capable.
:::

## A useful checklist before you decide "we need more context"

- [ ] Have you run a retrieval baseline (top-5 chunks instead of the whole doc)?
- [ ] Have you measured per-query token usage at p50 / p95 / p99?
- [ ] Have you confirmed lost-in-the-middle isn't hurting you on long inputs?
- [ ] Have you enabled prompt caching for the stable prefix?
- [ ] Have you compared cost of "big context every call" vs "small context + RAG"?
- [ ] Does the workload genuinely require *cross-document reasoning* (where the model needs to compare facts from page 3 and page 250)?

If you can't check all six, retrieval beats raw context for this workload.

---

→ Next: [Prompt caching](./prompt-caching.md)
