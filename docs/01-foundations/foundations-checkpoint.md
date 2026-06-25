---
id: foundations-checkpoint
title: Foundations checkpoint
sidebar_position: 99
description: A self-test before you move on. If you can answer these without scrolling back, you have the foundations.
---

# Foundations checkpoint

You've finished the Foundations chapter. Take a minute to make sure the core ideas stuck.

There are **16 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page to revisit.

You must pass (≥ 60%) to unlock the Next button at the bottom.

<Quiz id="foundations-checkpoint" title="Foundations checkpoint" sampleSize={5}>

<Question
  prompt="A rough rule of thumb: 1 token ≈ how many characters of English text?"
  options={[
    { text: "About 1 character" },
    { text: "About 4 characters" },
    { text: "About 10 characters" },
    { text: "About 25 characters" }
  ]}
  correct={1}
  explanation="For English, ~4 characters per token is the standard back-of-envelope estimate (roughly 0.75 words). Languages like Japanese or Chinese tokenize much less efficiently — often closer to 1 character per token."
  revisit={{ to: "/docs/foundations/tokens", label: "Tokens" }}
/>

<Question
  prompt="Why does the same string tokenize to different token counts on Anthropic vs OpenAI vs Google?"
  options={[
    { text: "Each provider charges different rates, so they pad the count" },
    { text: "Every model family ships its own tokenizer trained on different corpora and vocab sizes" },
    { text: "The Unicode standard changed between releases" },
    { text: "Network compression strips whitespace differently" }
  ]}
  correct={1}
  explanation="Tokenizers are model-specific artifacts — different vocabularies, different merge rules, different special tokens. The same sentence can vary by 20%+ across providers, which matters for cost estimation."
  revisit={{ to: "/docs/foundations/tokenizers", label: "Tokenizers" }}
/>

<Question
  prompt="An embedding represents a piece of text as a vector. What's the standard operation to measure how similar two embeddings are?"
  options={[
    { text: "Euclidean distance" },
    { text: "Cosine similarity" },
    { text: "Hamming distance" },
    { text: "String edit distance" }
  ]}
  correct={1}
  explanation="Cosine similarity (dot product on normalized vectors) is the default for semantic embeddings — it measures direction, not magnitude, which matches how meaning is encoded."
  revisit={{ to: "/docs/foundations/embeddings", label: "Embeddings" }}
/>

<Question
  prompt="Why does the cost of attention grow roughly quadratically with context length?"
  options={[
    { text: "Each token has to attend to every other token, so the work scales with N × N" },
    { text: "The transformer rebuilds the embedding table for every new token" },
    { text: "Longer contexts force the model to reload weights from disk" },
    { text: "Quadratic growth comes from the softmax normalization step, not the attention pattern" }
  ]}
  correct={0}
  explanation="In self-attention every token computes a score against every other token in the window — that's O(N²) in both compute and memory. It's why 1M-token contexts are an engineering achievement, not a free lunch."
  revisit={{ to: "/docs/foundations/transformer", label: "The transformer" }}
/>

<Question
  prompt="Which of these will you do regularly as an AI engineer in 2026, but almost never the others?"
  options={[
    { text: "Train a foundation model from scratch" },
    { text: "Run inference against a hosted model API" },
    { text: "Hand-derive backpropagation gradients" },
    { text: "Pre-train your own tokenizer on web-scale data" }
  ]}
  correct={1}
  explanation="Inference (calling an API or hosted model) is your day job. Training a foundation model costs tens of millions and is done by a handful of labs. Fine-tuning sits in between but is increasingly rare too."
  revisit={{ to: "/docs/foundations/training-vs-inference", label: "Training vs inference" }}
/>

<Question
  prompt="A `system`, `user`, and `assistant` message walk into a chat API. When you add tool use, what fourth role appears?"
  options={[
    { text: "`developer`" },
    { text: "`agent`" },
    { text: "`tool` (or `tool_result`)" },
    { text: "`function`" }
  ]}
  correct={2}
  explanation="Tool/function results come back as their own message role — `tool` in most APIs (or `tool_result` blocks in Anthropic's). The assistant emits a tool call; you reply with a tool message containing the result."
  revisit={{ to: "/docs/foundations/messages", label: "Messages" }}
/>

<Question
  prompt="A model advertises a 200K context window. What does that 200K count?"
  options={[
    { text: "Input tokens only" },
    { text: "Output tokens only" },
    { text: "Input plus output combined" },
    { text: "Characters, not tokens" }
  ]}
  correct={2}
  explanation="The window is the total budget for the request — prompt plus generated response must fit inside it. Output is usually further capped by a separate max_tokens param."
  revisit={{ to: "/docs/foundations/context-window", label: "Context windows" }}
/>

<Question
  prompt="What's the single most common mistake that nukes your prompt-caching hit rate?"
  options={[
    { text: "Using a model that's too small" },
    { text: "Putting volatile content (timestamps, user IDs, randomized examples) at the start of the prompt" },
    { text: "Calling the API from more than one region" },
    { text: "Setting temperature above 0" }
  ]}
  correct={1}
  explanation="Caches work on prefix match. Anything that varies between calls — a timestamp, a user ID, today's date — invalidates the cache from that point onward. Keep volatile content at the END of the prompt."
  revisit={{ to: "/docs/foundations/prompt-caching", label: "Prompt caching" }}
/>

<Question
  prompt="You're extracting structured JSON fields from incoming customer emails. What's the right temperature?"
  options={[
    { text: "0 — you want deterministic, repeatable extraction" },
    { text: "0.7 — the model needs creativity to handle edge cases" },
    { text: "1.0 — maximum variety in the output" },
    { text: "Temperature doesn't matter for extraction tasks" }
  ]}
  correct={0}
  explanation="Extraction is a 'one right answer' task — you want the model to pick the most likely token every time. Save higher temps for brainstorming, naming, or creative writing where variety is the point."
  revisit={{ to: "/docs/foundations/sampling", label: "Sampling" }}
/>

<Question
  prompt="Why is streaming effectively non-optional for any user-facing AI feature?"
  options={[
    { text: "It reduces total token cost" },
    { text: "It cuts perceived latency by showing tokens as they generate, instead of waiting for the full response" },
    { text: "It improves answer quality" },
    { text: "It's required by the API spec" }
  ]}
  correct={1}
  explanation="A 5-second wait feels broken; 5 seconds of streaming text feels fast. Total wall-clock time is identical — streaming just frontloads the user's signal that something is happening."
  revisit={{ to: "/docs/foundations/streaming", label: "Streaming" }}
/>

<Question
  prompt="What's the difference between 'JSON mode' and 'schema-constrained / structured outputs'?"
  options={[
    { text: "Nothing — they're marketing names for the same feature" },
    { text: "JSON mode guarantees valid JSON; structured outputs guarantee JSON that matches your specific schema" },
    { text: "JSON mode is faster; structured outputs are slower" },
    { text: "JSON mode works on any model; structured outputs require fine-tuning" }
  ]}
  correct={1}
  explanation="JSON mode just promises parseable JSON — the model can still pick wrong field names. Structured outputs constrain decoding to a schema you supply, so you get the exact shape you asked for."
  revisit={{ to: "/docs/foundations/structured-output", label: "Structured output" }}
/>

<Question
  prompt="Why are images surprisingly expensive in tokens?"
  options={[
    { text: "Images are billed at a flat 10x rate regardless of size" },
    { text: "Each image is encoded as hundreds-to-thousands of tokens based on resolution and detail level" },
    { text: "The model has to download the image, and bandwidth is billed as tokens" },
    { text: "Images require a separate, more expensive model" }
  ]}
  correct={1}
  explanation="A single 1024×1024 image typically costs 1000+ tokens. Mitigation: downscale before sending, use 'low detail' mode when available, or crop to just the relevant region."
  revisit={{ to: "/docs/foundations/multimodal-inputs", label: "Multimodal inputs" }}
/>

<Question
  prompt="Why does almost every modern retrieval system combine BM25 (keyword) with vector search?"
  options={[
    { text: "Vector search is too slow to use alone" },
    { text: "BM25 nails exact terms (names, IDs, codes) while vectors catch semantic paraphrases — they complement each other" },
    { text: "BM25 is required for legal compliance" },
    { text: "Embeddings can't handle queries longer than 100 tokens" }
  ]}
  correct={1}
  explanation="Vectors miss exact-string matches (model numbers, error codes, proper nouns). BM25 misses paraphrases. Hybrid search gets both, and the gains are usually significant — often 10-20% recall."
  revisit={{ to: "/docs/foundations/hybrid-search", label: "Hybrid search" }}
/>

<Question
  prompt="What's the 'cheap retrieval → expensive rerank' pattern in RAG?"
  options={[
    { text: "Retrieve a large candidate set with fast methods (BM25 + vectors), then use a slower cross-encoder reranker to reorder the top N" },
    { text: "Use a small embedding model first, then re-embed with a large model" },
    { text: "Run retrieval twice and average the results" },
    { text: "Cache previous queries and skip retrieval entirely" }
  ]}
  correct={0}
  explanation="Retrieval is O(corpus), so it must be cheap. Reranking is O(candidates), so it can afford a much smarter model. Pulling 100 candidates and reranking to 10 is a standard, high-leverage move."
  revisit={{ to: "/docs/foundations/reranking", label: "Reranking" }}
/>

<Question
  prompt="What's the *one* line of code that turns a chain into an agent?"
  options={[
    { text: "A `while` loop around the model call that feeds tool results back in until the model stops calling tools" },
    { text: "An `import openai` statement" },
    { text: "A call to a vector database" },
    { text: "Setting `temperature=0`" }
  ]}
  correct={0}
  explanation="An agent is structurally a loop: model emits tool calls → you execute them → results go back into context → model decides what to do next → repeat until done. The loop IS the agent."
  revisit={{ to: "/docs/foundations/agent-loop", label: "Agent loop" }}
/>

<Question
  prompt="An LLM confidently tells you '4,829 × 7,613 = 36,748,177', but the real product is different. Why did a model that writes working code get basic multiplication wrong?"
  options={[
    { text: "The number was too large to fit in the context window" },
    { text: "There's no arithmetic unit inside a transformer — it pattern-matches number-shaped text, so large, rare products come out plausible but wrong" },
    { text: "Multiplication requires a fine-tuned model" },
    { text: "The temperature was set too high, adding randomness to the digits" }
  ]}
  correct={1}
  explanation="A transformer has no ALU; it predicts likely tokens. Small, common sums it has seen often are reliable, but a large product it never saw verbatim gets a plausible-shaped guess. The fix is to make it show its work or hand it a calculator tool — never trust mental math for exact numbers."
  revisit={{ to: "/docs/foundations/what-llms-cant-do", label: "Where LLMs fail (and why)" }}
/>

</Quiz>

---

## If you missed more than 2

Re-read the linked pages. Don't push through to chapter 2 with foundation gaps — every later decision (which model? when to RAG? when to agent?) compounds on the basics.

## If you got them all

You have a working mental model of how modern LLM systems are built. Ship something. Then come back for the next chapter.

Got them? → On to [Chapter 2: Roadmap](/docs/roadmap).
