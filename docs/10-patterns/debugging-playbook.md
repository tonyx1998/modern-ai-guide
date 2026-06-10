---
id: pattern-debugging-playbook
title: The LLM debugging playbook
sidebar_position: 13.5
description: Symptom → likely root causes → first three things to check. The reference card you pull up when an AI feature is misbehaving in dev or prod.
---

# The LLM debugging playbook

> **In one line:** Most production LLM bugs fall into a dozen shapes — "JSON breaks intermittently," "the model picks the wrong tool," "RAG misses an obvious chunk," "the agent loops" — and each has a near-deterministic root-cause shortlist if you check the right thing first.

:::tip[In plain English]
LLMs are stochastic, so the temptation when something breaks is to shrug and re-run. Don't. Almost every "weird" LLM failure has a small set of likely causes — and a debugging order that gets you to the answer faster than another prompt-tweak iteration. This page is the reference card. Use it when you're stuck in dev, and use it as a triage tree during an incident.
:::

:::info[Industry jargon — LLM debugging]
| In plain English | What engineers call it |
|---|---|
| Re-run until output looks fine | **Prompt roulette** — the habit this page replaces |
| Change the prompt hoping it fixes itself | **Prompt tweaking** before reading traces |
| Log of one request: prompt in, model out, tools | A **trace** — "pull the **Langfuse** trace", "check **observability**" |
| Pin randomness while investigating | **`temperature=0`**, **fixed seed** — "make it deterministic" |
| Model invents a function that doesn't exist | **Hallucination** — **confidently wrong** when it reads plausible |
| JSON that breaks sometimes | **Structured output** / **`response_format`** when you enforce schema |
| Agent runs forever | **Agent loop** — fix with **max iterations** cap |
| Retrieved wrong document chunk | **RAG miss** — check **chunking**, **reranker**, **hybrid search** |
| Test set that catches regressions | **Eval set** / **regression evals** — not the same as unit tests |
| Deploy new model, quality drops | **Model regression** — run **canary** or **A/B** before full cutover |
:::

:::info[What this page covers — and what it doesn't]
This playbook is for debugging **LLM-powered features** (chat, RAG, agents, tool calling) — when the *model or pipeline* misbehaves. For debugging **regular application code** (including code an AI assistant wrote for you), the same scientific loop applies: reproduce → hypothesize → test one change at a time. The usual suspects are off-by-one errors, wrong types, async races, and silent `catch` blocks. Everything you need for that is below in brief; the optional links at the end point to longer job-focused guides if you want them.
:::

## The universal loop (all software, including AI-generated code)

Before the LLM-specific tables, the loop that works on *any* bug:

1. **Reproduce** — trigger the failure on demand. No repro = guessing.
2. **Observe** — read the error, stack trace, or failing test output literally.
3. **Hypothesize** — one specific, falsifiable guess ("the loop skips index 0").
4. **Test cheaply** — print, log, breakpoint, or a tiny test that fails iff your guess is right.
5. **Fix one thing, verify, add a regression test.**

When the broken code came from Cursor/Copilot/Claude, check **invented APIs**, **missing edge cases**, and **partial multi-file edits** before exotic theories. Re-prompting "fix it" without a reproducer produces another confidently-wrong answer.

## The debugging mindset (LLM systems)

Three reflexes that distinguish engineers who debug LLMs fast:

1. **Look at the trace first, not the prompt.** What did the model actually receive? What did it actually emit? Half the time the bug isn't in the prompt — it's in what your *code* sent to the model. A **trace** is a recorded log of one request: the exact prompt, model output, tool calls, and latencies. Open your observability tool (Langfuse, LangSmith, Helicone, or your gateway's trace UI) before you open the prompt editor.
2. **Reproduce with temperature=0 and a fixed seed.** If the bug only happens 20% of the time, your job is to bisect what changes between runs. Pin the sampler first.
3. **Trust the model less than your code.** When an output is "wrong," check whether the input was correct, whether the schema validator agrees, whether the tool actually returned what the model says it returned. The model is usually doing exactly what the inputs imply.

## The symptom → root-cause table

For each symptom, the **top three things to check** in order. If none of them is it, you have a real bug; otherwise it's one of these.

### Output category

#### "JSON output breaks intermittently"

1. **Schema enforcement is off.** Are you using the provider's structured-output mode (OpenAI `response_format`, Anthropic tool-calling for JSON) or just *asking* in the prompt? Asking is unreliable. Switch to enforced.
2. **Streaming + parse mid-stream.** A partial chunk isn't valid JSON. Either accumulate then parse, or use a streaming JSON parser (`partial-json`, `jsonrepair`).
3. **Trailing punctuation / markdown fences.** ` ```json … ``` ` wrappers are common; strip them before parsing.

#### "Output is occasionally empty"

1. **`max_tokens` truncation.** Stop reason is `length`, not `stop`. Bump the cap.
2. **Content filter triggered.** Check `finish_reason` / refusal flag. Adjust prompt to avoid the trigger or use a less restrictive endpoint.
3. **Tool-call response with no text.** When the model emits a tool call, the text field can be empty by design. You read the tool calls, not the text.

#### "Output sometimes refuses"

1. **Refusal triggered by a phrase in the *input*, not the task.** The user's name, an example, or a retrieved doc is hitting a safety classifier. Sanitize or move to system prompt.
2. **Over-aligned to "be helpful but careful."** Adjust system prompt to give explicit license for the in-scope task.
3. **Model upgrade changed refusal behavior.** A model swap (4.5 → 4.6) can shift refusal rates. Compare on a regression set.

### Tool use category

#### "Model picks the wrong tool"

1. **Bad tool descriptions.** The description is what the model picks on. Vague description = vague selection. Rewrite as 2–3 sentences explaining *when* to use and *when not*.
2. **Two tools with overlapping purpose.** `find_user_by_email` and `search_users(query)` confuses the model. Merge or sharpen boundaries.
3. **Tool count too high.** Past ~30 tools, selection accuracy degrades. Cluster, route, or split into multiple agents.

#### "Model invents tool arguments"

1. **Required parameters lack descriptions or formats.** `"city": "string"` is worse than `"city": "City and country, e.g. 'Paris, France'"`.
2. **Enum values missing.** If a field is one-of-N, use an enum — the model can't typo it.
3. **Temperature > 0 on a function-calling path.** Force `temperature=0` for structured/tool-use calls.

#### "Tool result comes back but model ignores it"

1. **Wrong message ordering.** Each tool result must follow the tool-call turn with the matching `tool_call_id`. Out of order, model treats it as junk text.
2. **Tool result is too large.** A 50KB JSON dump exceeds context budget; the model truncates or skips. Paginate; return only what the model needs.
3. **Result wasn't actually appended to messages.** Bug in your loop — log the messages array before the second call.

#### "Agent gets stuck in a loop"

1. **No max-iteration cap.** Always cap (5–10 is typical for support flows).
2. **Tool keeps returning ambiguous results.** "Found 5 matching users" with no disambiguation → model retries with the same query. Return structured "needs clarification" results.
3. **Reflection pattern misfiring.** "Are we done?" check keeps saying "not yet." Add an explicit done-condition the reflection model evaluates against.

### RAG category

#### "RAG misses an obvious chunk"

1. **Chunking boundary cuts the relevant sentence in half.** Increase chunk size or use semantic chunking. Check the actual chunk that contains the fact — is it intact?
2. **Embedding model trained on a different distribution.** Generic embeddings on legal text underperform. Try a domain model (Voyage law, Cohere v4 with the right input type) or fine-tune.
3. **Hybrid search not enabled.** Pure vector search misses exact-keyword queries ("error code E5021"). Add BM25 with [hybrid search](../01-foundations/hybrid-search.md).

#### "RAG retrieves irrelevant chunks"

1. **No reranker.** Top-K from a vector index is noisy. A cross-encoder reranker (Cohere rerank, Voyage rerank) on the top 50 → top 5 fixes most "looks similar but isn't" misses.
2. **Query embedding ≠ chunk embedding distribution.** A short user query embedded next to a long chunk often retrieves badly. Try HyDE (hypothetical-answer rewriting) or query expansion.
3. **Index includes outdated content.** Check the actual chunk you got back. If it's stale, your refresh pipeline is broken — that's an ingest bug, not retrieval.

#### "RAG answer hallucinates a fact not in the chunks"

1. **System prompt doesn't constrain to retrieved context.** Add: *"Answer only using the provided context. If the answer is not present, say 'I don't know.'"*
2. **No citation enforcement.** Force the model to cite chunk IDs; reject responses with invented IDs.
3. **Chunks contain conflicting info.** The model picked one. Deduplicate, version, or rank by freshness during retrieval.

### Latency category

#### "TTFT (time to first token) is slow"

1. **Long prompt without prompt caching.** Prefill scales with input length. Either cache or shorten. See [prompt caching](../01-foundations/prompt-caching.md).
2. **Cold provider region.** First request to a regional endpoint pays a connection setup cost. Pre-warm.
3. **Reasoning model with thinking enabled.** Extended thinking budgets add 1–10s of "invisible" latency before the first user-visible token. Use a non-reasoning model if TTFT matters more than depth.

#### "Streaming feels choppy"

1. **Your gateway buffers.** Some proxies (Cloudflare default, Vercel without `runtime: 'edge'`) buffer SSE. Configure them to flush.
2. **You're parsing JSON before yielding chunks.** Yield tokens as raw text; parse later. Or use a streaming JSON parser.
3. **Client doesn't render incrementally.** React state updates batched too aggressively — switch to a ref or `flushSync` for streaming render.

#### "Total latency spiked from 2s to 30s today"

1. **Provider degradation.** Check the provider's status page; check your traces for elevated TTFT. Fall back to a secondary provider ([fallbacks](./12-fallbacks.md)).
2. **A retrieval hop got slow.** Vector DB CPU spike, hot index. Look at the trace.
3. **Tool call timed out.** A downstream API is slow. Add per-tool timeouts and retries.

### Cost category

#### "Bill doubled this week"

1. **Prompt grew.** Check the average input-tokens-per-request in your observability. Often a new context section was added.
2. **Prompt caching stopped hitting.** A small system-prompt change broke the cache key. Check the cache-hit rate metric.
3. **More tool-call iterations.** Agent loop avg-steps went up. Check; cap if needed.

#### "One user is 70% of the cost"

1. **Power user or scraper.** Per-user rate limit + spend cap. Not optional past day one.
2. **A long conversation history is being resent every turn.** Implement context truncation or summary memory.
3. **Bug causing duplicate calls.** Look at idempotency — same request fingerprint twice in 100ms.

### Eval category

#### "Evals pass in dev, fail in prod"

1. **Eval set isn't representative.** Sample N% of prod queries, label, fold in. The distribution gap is the bug.
2. **Different model or model version in prod.** The eval ran against `claude-sonnet-4-5`; prod is on `claude-sonnet-4-6`. Pin model versions in both.
3. **Retrieval is different in prod.** Eval uses a frozen mini-corpus; prod uses a live one with different freshness. Mirror the indexing pipeline in eval.

#### "LLM-as-judge disagrees with humans"

1. **Self-preference bias.** Judge is the same model family as the one being judged. Switch judge to a different family.
2. **Verbosity bias.** Judge rewards longer answers. Add to the rubric: "length is not a quality signal."
3. **Position bias** (in pairwise comparisons). Randomize order; report agreement after swapping.

### Voice category

(See also [Realtime voice — the engineering details](../04-stack/realtime-voice-engineering.md).)

#### "AI doesn't respond to user audio"

1. **VAD never fired `speech_started`.** Microphone permission denied, mic muted at OS level, or audio levels too low. Log `getStats()` audio levels.
2. **Data channel not open before audio.** Race condition — sent audio before the WebRTC channel was ready. Wait for `dc.readyState === 'open'`.
3. **Ephemeral key expired between mint and connect.** Mint right before `setRemoteDescription`, not on page load.

#### "AI talks over the user (no barge-in)"

1. **VAD detected interruption but client didn't stop playback.** Wire `speech_started` event → `audioEl.pause()` + clear buffer.
2. **No `response.cancel` emitted.** Model keeps generating tokens you'll pay for. Always cancel on interrupt.
3. **Buffered audio queued client-side.** Even after stop, queued chunks play. Drop the queue.

### Production / deploy category

#### "Works locally, broken in prod"

1. **Different API key, different model access.** Org limits or region restrictions. Hit the model directly from the prod env to confirm.
2. **Env var typo or missing secret.** Boring but constant. Read the actual env in prod, don't trust the deploy config.
3. **Different timeout in the prod gateway.** A 30s timeout at the LB kills calls that take 35s. Check infra timeouts, not just your code.

#### "New model version regressed quality"

1. **Prompt tuned to the old model's quirks.** Sycophancy patterns, reasoning style, refusal rate all shift between versions. Re-tune the prompt against the new model.
2. **Output format changed.** Some prompts that "worked" relied on the model emitting a quirky format — the new model emits clean output and your parser breaks. Tighten the schema.
3. **Tool descriptions need updating.** Newer models follow instructions more literally. Vague descriptions that "worked" now don't.

## The first five minutes of any LLM bug

A checklist for when you get paged or get the "AI isn't working" message:

1. **Open the trace for a failing request.** What was the actual prompt? Actual output? Actual tool sequence?
2. **Check the provider's status page.** Five minutes saved if it's their outage.
3. **Compare a passing and a failing trace.** What's different in the input? Almost always something.
4. **Run the failing input through the eval harness locally.** Reproduces? Now you have a tight loop.
5. **Check recent deploys and prompt-version changes.** `git log` on `prompts/` is often the answer.

If step 5 is the culprit, your **regression eval set** wasn't catching it — that's a follow-up to expand coverage after the fix.

## What beginners get wrong

:::caution[Common mistakes]
- **Re-running until it works.** Stochastic flakiness is real, but if a bug repros at 20% it'll bite a user. Find the cause.
- **Tweaking the prompt before reading the trace.** Half the bugs are in the inputs the model received, not the prompt itself.
- **Treating model nondeterminism as the answer.** "Sometimes it's wrong" is a description, not a root cause. Find the input pattern that flips it.
- **Skipping `temperature=0` during debugging.** You can't bisect a stochastic function. Pin the sampler before you investigate.
- **Debugging without an eval set.** "I'll know it when I see it" doesn't scale. Build a 20-case regression set for the bug and use it on every prompt change.
- **Asking the LLM to debug itself with no traces.** "Here's a broken output, what's wrong?" loses 90% of the signal. Show the input, output, and what you expected.
:::

:::info[Highlight: the bug log compounds]
Every weird LLM bug you debug, write down: symptom, root cause, fix, and which check caught it. A team of three engineers with a year of these notes catches new bugs in minutes instead of hours. The notes also become the seed for your eval suite — each fixed bug becomes a regression case.
:::

<Quiz id="pattern-debugging-playbook-quick-check" variant="micro" title="Quick check">

<Question
  prompt="An AI feature is misbehaving. What does this page say to do FIRST?"
  options={[
    { text: "Tweak the prompt and re-run to see if it improves" },
    { text: "Swap to a different model version" },
    { text: "Open the trace — see what the model actually received and actually emitted" },
    { text: "Add more examples to the system prompt" }
  ]}
  correct={2}
  explanation="Half the time the bug is not in the prompt — it is in what your code sent to the model, and only the trace shows that. Prompt tweaking first is the instinct the page explicitly warns against: you are iterating blind on the wrong layer."
/>

<Question
  prompt="Why pin temperature to 0 and fix the seed when reproducing a flaky LLM bug?"
  options={[
    { text: "You cannot bisect a stochastic function — pin the sampler so the only changes between runs are the ones you make" },
    { text: "Temperature 0 makes the model smarter" },
    { text: "Providers charge less for deterministic calls" },
    { text: "It prevents the content filter from triggering" }
  ]}
  correct={0}
  explanation="A bug that reproduces 20 percent of the time cannot be debugged by re-running and shrugging; pinning the sampler turns it into a deterministic function you can bisect. Temperature 0 does not improve capability — it just removes sampling variance, which is exactly what you want while investigating."
/>

<Question
  prompt="JSON output breaks intermittently. What is the first thing the playbook says to check?"
  options={[
    { text: "Whether the model is too small for the task" },
    { text: "Whether you are using the provider's enforced structured-output mode, or just asking for JSON in the prompt" },
    { text: "Whether the user's input contains special characters" },
    { text: "Whether the context window is full" }
  ]}
  correct={1}
  explanation="Asking for JSON in prose is unreliable by design; enforced schema modes constrain the output at decode time. The 'model is too small' answer is the expensive misdiagnosis — teams upgrade models to fix what a response_format flag would have fixed for free. The other two checks on the list are mid-stream parsing and markdown fences, not input characters."
/>

</Quiz>

## Going deeper (optional)

This page is self-contained for debugging LLM features in dev and prod. If you want more on adjacent topics:

- [Observability tools](../04-stack/observability-tools.md) — Langfuse, LangSmith, gateway tracing in depth
- [Evaluation overview](../13-evaluation/evaluation-overview) — building regression sets so bugs stay fixed
- [Modern Web Dev Guide — Debugging methodology](https://modern-web-dev-guide.vercel.app/docs/foundations/debugging) — production app debugging, unfamiliar codebases, performance and flaky tests
- [SWE Interview Guide — debugging rounds](https://swe-interview-guide.vercel.app/#/lesson/debugging-round) — the same hypothesis loop under interview pressure

---

→ Next: [Safe model swaps & canary deploys](./model-swaps.md)
