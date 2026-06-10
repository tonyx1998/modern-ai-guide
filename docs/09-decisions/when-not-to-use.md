---
id: when-not-to-use-ai
title: When *not* to use AI
sidebar_position: 9
description: The single most under-asked question in 2026. Sometimes a regex is the right answer.
---

# When *not* to use AI

> **In one line:** AI is the right tool when the input is open-ended and a wrong answer is recoverable. When either of those isn't true, prefer a rule, a query, or a human.

:::tip[In plain English]
In 2026, "let's add AI to it" is the new "let's add a microservice." Most ideas don't survive a hard look. Before you reach for an LLM, ask: would a regex work? Would a query work? Would a better form work? Would a rules engine work? When the input is structured and the failure mode is dangerous, AI is the wrong tool — even though the demo will be impressive.
:::

## Don't use AI when

- **A regex, query, or rules engine works.** Faster, cheaper, deterministic, auditable, debuggable.
- **The cost of a wrong answer is catastrophic** and there's no human review step.
- **The input is already structured.** A SQL `SELECT` is the right tool for structured data.
- **Latency must be sub-100ms at scale.** LLM call round-trip kills the budget.
- **Cost-per-decision must be sub-cent at scale** and the volume is huge.
- **The "AI" decision is really a UI / UX problem.** Sometimes a better form is the actual answer.
- **The task is high-stakes and the failure mode would be invisible.** Bad answers that look good are worse than no answer.
- **You can't explain what "right" looks like.** Without a measurable target, you can't tell if the AI is working.

## Things that look like AI problems but aren't

- **"Recommend articles."** Collaborative filtering still wins at scale for many cases. AI helps with cold start, not steady state.
- **"Detect fraud."** Gradient-boosted models on structured data still beat LLMs for tabular fraud detection — and they're 10,000x cheaper per call.
- **"Search the help center."** BM25 + good content is often better than RAG; add RAG only when BM25 misses specifically-semantic queries.
- **"Classify the support ticket."** A fine-tuned small classifier or even a rules cascade often beats an LLM call per ticket on cost and latency.
- **"Spell-check / autocomplete."** Real autocomplete is a trie or an n-gram model. LLM autocomplete is overkill for most fields.
- **"Translate this string."** For a fixed catalog of strings, a translation database wins. For real-time user content, AI wins.
- **"Schedule a meeting."** Most of "AI scheduling" is calendar arithmetic. The AI part is parsing the human's request, which is one prompt — not the whole product.

## When AI clearly is the right tool

- **Generation** of free-form content (emails, code, marketing copy, summaries).
- **Summarization / rewriting** of unstructured text.
- **Open-ended Q&A** over unstructured corpora.
- **Reasoning** over messy inputs that humans currently spend cognition on.
- **Tool orchestration** where the right tool depends on the request.
- **Classification of long unstructured inputs** where labeling-then-training is too slow to keep up.
- **Multimodal understanding** (image, audio, video → text).

## The pre-mortem

Before greenlighting an AI feature, ask: *if this fails in the worst plausible way, what happens?*

- If the answer is "a customer doesn't notice" — proceed.
- If the answer is "a customer gets a slightly worse experience" — proceed with monitoring.
- If the answer is "a user is harmed, a contract is lost, a regulator notices, or our brand takes a hit" — design for human oversight from day one, or pick a different solution.

## When this rule doesn't apply

- **You're using AI as one feature among many** and the failure mode is contained to that feature. AI in a draft mode that the user accepts or rejects is low-risk.
- **The bar is "better than what we have," not "perfect."** A 90% accurate summary beats no summary, even if it has occasional errors.
- **You're in an exploratory phase** and the cost of getting it wrong is small. Prototype freely; productionize carefully.

## Common mistakes

- **"AI" as feature theater.** Adding an AI feature to look modern, with no real user demand. These features ship, generate one demo gif, and then nobody uses them.
- **Confusing "the demo is impressive" with "this is shippable."** Demos run on cherry-picked inputs. Production runs on whatever users actually type.
- **Skipping the "is this even an AI problem?" question.** Engineering manager pressure to "add AI" leads to LLM calls bolted onto features that were fine without them.
- **Pricing the failure mode as zero.** "It's just a chat assistant, what's the worst that could happen?" The worst is a hallucinated medical or legal claim that lands you on the news.

## How to apply it

For every proposed AI feature, run a 5-minute filter:

1. **Is the input structured?** If yes, prefer a query or rules.
2. **Could a regex / template / form fix this?** If yes, do that.
3. **What's the worst plausible failure?** If catastrophic, require human-in-the-loop or kill the idea.
4. **What's the latency budget?** If sub-100ms, AI usually doesn't fit.
5. **What's the eval that proves this is working?** No eval = not ready.

If the feature survives the filter, it's worth building.

:::note[Worked example: the AI search that didn't ship]
A SaaS team plans an "AI-powered search" over their docs. Six weeks in: RAG works, but it's slower than the existing keyword search, costs 100x more per query, and the answers are sometimes confidently wrong.

They go back to first principles. The data: ~80% of user queries are exact-match for a known feature name. ~15% are typos. ~5% are genuinely conceptual.

The fix: ship a better keyword search with typo tolerance and an "ask AI" button for the 5%. The button calls RAG only when the user opts in. Search latency drops 90%. Cost drops 95%. The AI feature still exists, but only where it actually helps.

The lesson: "we're adding AI to search" wasn't wrong, but the framing was. "We're adding AI to the 5% of search queries keyword can't handle" is the right framing — and it falls out of asking "when *not* to use AI" honestly.
:::

<Quiz id="when-not-to-use-ai-quick-check" variant="micro" title="Quick check">

<Question
  prompt="According to this page, when is AI the right tool?"
  options={[
    { text: "Whenever the demo is impressive" },
    { text: "When the input is open-ended and a wrong answer is recoverable" },
    { text: "When latency must stay under 100ms at scale" },
    { text: "When the input is already structured" }
  ]}
  correct={1}
  explanation="Both conditions matter: open-ended input and recoverable failure. Structured input calls for a query or rules engine, sub-100ms latency budgets kill the LLM round-trip, and impressive demos run on cherry-picked inputs while production runs on whatever users actually type."
/>

<Question
  prompt="What does the page recommend for fraud detection on structured tabular data?"
  options={[
    { text: "A frontier LLM call per transaction" },
    { text: "A multi-agent review pipeline" },
    { text: "RAG over historical fraud cases" },
    { text: "Gradient-boosted models on the structured data" }
  ]}
  correct={3}
  explanation="Tabular fraud detection is one of the listed 'looks like an AI problem but isn't' cases — gradient-boosted models still beat LLMs there and are about 10,000x cheaper per call. The LLM options are tempting because fraud feels like reasoning, but the input is structured, so classical ML wins."
/>

<Question
  prompt="In the worked example, what was the fix for the slow, expensive AI-powered docs search?"
  options={[
    { text: "Better keyword search with typo tolerance, plus an opt-in 'ask AI' button for the roughly 5% of conceptual queries" },
    { text: "Running full RAG on every query with a bigger model" },
    { text: "Removing search from the product entirely" },
    { text: "Caching every possible RAG answer in advance" }
  ]}
  correct={0}
  explanation="The data showed about 80% of queries were exact-match and 15% were typos — only 5% genuinely needed semantic answering. Scoping AI to that 5% dropped latency 90% and cost 95%. The lesson: 'add AI to search' wasn't wrong, but asking when NOT to use AI produced the right framing."
/>

</Quiz>

---

→ Next: [Eval investment](./04-eval-investment.md).
