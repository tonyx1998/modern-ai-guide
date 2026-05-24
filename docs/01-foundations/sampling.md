---
id: sampling
title: Sampling — temperature, top_p, top_k
sidebar_position: 11
description: How the next token is picked from the model's probability distribution. The knobs that make outputs more deterministic or more creative.
---

# Sampling

> **In one line:** The model outputs a probability over every possible next token; the sampler picks one. `temperature`, `top_p`, and `top_k` shape how adventurous that pick is.

:::tip[In plain English]
Imagine the model handing you a stack of cards, each showing a candidate next word and how likely it thinks that word is. The sampler is the rule for picking one card. *Always pick the highest* → boring, deterministic. *Reshuffle proportionally to weights* → varied, sometimes surprising. *Throw out the long tail first* → safer creativity. That's it.
:::

## The three knobs

- **`temperature`** (typically 0–2) — Sharpens or flattens the distribution. **0** = always pick the top token (most deterministic). **1** = use the raw distribution. **>1** = flatter, more random. For factual/structured tasks: 0–0.3. For creative writing: 0.7–1.2.
- **`top_p`** (nucleus sampling, 0–1) — Only consider the smallest set of tokens whose probabilities sum to `p`. **0.9** is a common default. Lower = safer/more conservative.
- **`top_k`** — Only consider the top K tokens. Less common in modern APIs (top_p usually replaces it).

You typically set **one** of `temperature`, `top_p`, or `top_k` — combining them is mostly overkill.

```mermaid
flowchart LR
    A[Raw distribution] --> B{Apply temperature}
    B -->|temp 0| C[Always top token]
    B -->|temp 0.7| D[Slightly varied]
    B -->|temp 1.5| E[Wildly varied]
    A --> F{Apply top_p}
    F --> G[Drop unlikely tail, sample from rest]
```

## When to use what

- **Deterministic-ish output (classification, JSON extraction, code):** `temperature=0`. Note: even at temp 0, perfect determinism is not guaranteed across providers and across time (batching, hardware non-determinism).
- **Default chat / Q&A:** `temperature=0.7` is the OpenAI default. Reasonable starting point.
- **Brainstorming / creative writing:** `temperature=1.0–1.2`.
- **High-stakes evals:** drop to 0 to compare runs, then verify the live config matches.
- **Function-calling / tool use:** `temperature=0` or near. You want the model to pick the right tool with the right args, not improvise.

## Worked example: same prompt, three temperatures

Prompt: *"Suggest a name for a coffee shop near a library."*

| Temperature | Sample output                     |
|-------------|-----------------------------------|
| 0           | "The Reading Room"                |
| 0.7         | "Margin Notes Coffee"             |
| 1.2         | "Foxglove & Foxed Pages Espresso" |

At 0, you'd get "The Reading Room" *every* time. At 0.7, you'd get a small spread of plausible names. At 1.2, you get oddballs — useful for brainstorming, terrible for "extract this user's email."

## Other relevant params

- **`seed`** — Some providers expose a seed for reproducibility. Best-effort, not guaranteed (batching, version drift, hardware non-determinism still apply).
- **`stop`** — A list of strings that, if generated, end the response. Useful for structured outputs and chain-of-thought termination.
- **`presence_penalty` / `frequency_penalty`** — Discourage repeats. Rarely needed in modern models.
- **`max_tokens` / `max_output_tokens`** — Hard cap on output length. Always set this. Always.
- **`logprobs`** — Some providers return the top-K logprobs per token. Useful for confidence estimates and reranking.

## Logprobs: the secret weapon

When you need to know "how sure was the model?", request logprobs:

```python
response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[{"role": "user", "content": "Sentiment of: 'It's fine I guess.'"}],
    logprobs=True,
    top_logprobs=5,
)
for tok in response.choices[0].logprobs.content[:3]:
    print(tok.token, [(t.token, round(t.logprob, 2)) for t in tok.top_logprobs])
```

You'll see for each output token, the top 5 alternatives and their log-probabilities. Convert to probability with `math.exp(logprob)`. Use cases:

- **Confidence-based routing.** If top token < 0.7 prob → escalate to a stronger model.
- **Calibrated classification.** Take the logprob of each class label, normalize, use as probability.
- **Better reranking.** Score candidate completions by total logprob.

## The "deterministic at temp 0" myth

`temperature=0` makes the *sampling step* deterministic, but the model itself isn't. You can get different outputs from the same prompt because:

- **Batching** — your request runs with different siblings, causing tiny floating-point differences that flip the top token at ties.
- **Hardware non-determinism** — different GPU schedules give different rounding.
- **Provider version drift** — `gpt-5-mini` today is not the exact same checkpoint as `gpt-5-mini` two months ago.

For evals you care about: pin the version (e.g., `gpt-5-mini-2026-04-15`), use temp 0, and log the response so you can compare exact strings.

## What beginners get wrong

:::caution[Common mistakes]
- **Setting temperature high "for creativity" on a structured task.** Higher temperature = more invented JSON keys, more malformed schemas, more hallucinated facts. Use temp 0 for extraction.
- **Setting both `temperature` and `top_p` aggressively.** Either alone is enough; both together gives unpredictable behavior.
- **Believing temp 0 means perfect reproducibility.** It doesn't. Test, log, expect drift.
- **Forgetting `max_tokens`.** A runaway generation is a budget incident. Set a hard cap.
- **Using `stop` strings that appear naturally in the output.** `stop=["\n"]` will end a code block mid-line.
- **Tuning sampling before tuning the prompt.** Sampling moves the needle 5%; prompt structure moves it 50%. Fix the prompt first.
- **Setting `presence_penalty` to mask a bad prompt.** Penalties paper over repetition; a better instruction fixes it at the root.
:::

## A reasonable defaults table

| Task                          | temperature | top_p | max_tokens |
|-------------------------------|-------------|-------|------------|
| JSON extraction               | 0           | -     | tight cap  |
| Classification                | 0           | -     | tight cap  |
| Chat (general)                | 0.7         | 1     | 1000–4000  |
| Code generation               | 0.2         | -     | as needed  |
| Brainstorming / naming        | 1.0         | -     | small      |
| Creative writing              | 0.9–1.1     | -     | as needed  |
| Tool calling                  | 0           | -     | small      |

:::info[Highlight: temperature is a UX dial, not a quality dial]
Lower temperature isn't "smarter" — it's just *less varied*. The model knows the same things at temp 0 and temp 1; the difference is whether you see its second-best guess as easily as its first.
:::

## Reproducibility recipe

When you need the *same* prompt to produce the *same* output as often as possible:

1. Pin the model version explicitly (`gpt-5-mini-2026-04-15`, not `gpt-5-mini`).
2. Set `temperature=0`.
3. Pass `seed` if the provider supports it.
4. Log the exact request and response.
5. Re-test on a small fixture set after any model upgrade — silent drift is real.

This still isn't *guaranteed* reproducibility (see the myth section above), but it's as close as the providers allow today.

---

→ Next: [Streaming](./streaming.md)
