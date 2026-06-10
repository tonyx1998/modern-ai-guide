---
id: eval-metrics
title: Metrics
sidebar_position: 5
description: The metric families every AI engineer needs — exact match, precision/recall/F1, similarity (embedding/ROUGE/BLEU), rubric scores, and retrieval metrics like recall@k, MRR, and faithfulness.
---

# Metrics

> **In one line:** A metric is the function that turns a model output into a number — pick the wrong one and you'll optimize confidently in the wrong direction.

:::tip[In plain English]
A metric is just a recipe for scoring an answer. "Did it match the answer key exactly?" is one recipe. "How much do these two sentences overlap?" is another. "On a scale of 1–5, how helpful is this?" is a third. Each recipe fits some tasks and badly misfits others — grading a poem with "exact match" would fail every good poem. This page walks through the standard recipes, what each is good for, and when it lies to you. By the end you'll be able to look at a task and immediately know which metric to reach for.
:::

## The big picture

Metrics group into families by what kind of output they grade:

```mermaid
flowchart TD
    M[Pick a metric] --> Closed{Is there a<br/>single right answer?}
    Closed -->|Yes, exact| EM[Exact match / accuracy]
    Closed -->|Yes, a set of labels| PRF[Precision / Recall / F1]
    Closed -->|Yes, but phrasing varies| Sim[Similarity:<br/>embedding / ROUGE / BLEU]
    Closed -->|No, it's open-ended| Rubric[Rubric scores<br/>LLM-judge or human]
    M --> Task{Specific sub-task?}
    Task -->|Retrieval| Ret[recall@k, precision@k, MRR, nDCG]
    Task -->|RAG generation| Faith[Faithfulness,<br/>answer relevance]
```

You almost always combine several. A RAG bot might use recall@k for the retriever, faithfulness for grounding, and a rubric score for helpfulness — three metrics, one product.

## Exact match & accuracy

The simplest metric: did the output exactly equal the reference (after normalizing whitespace/case)?

```python
def exact_match(output: str, gold: str) -> float:
    return 1.0 if output.strip().lower() == gold.strip().lower() else 0.0
```

**Accuracy** is just exact match averaged over a set: `correct / total`. Perfect for **classification** ("which label?") and closed extraction ("what's the order ID?"). It's deterministic, free, and unambiguous.

The catch: it's binary and brittle. "Paris." vs "The capital is Paris" both convey the right answer; exact match gives the second a 0. Use it only when the output space is genuinely closed (a fixed label, an ID, a number). For anything generative, exact match punishes correct-but-differently-worded answers — reach for similarity or a rubric instead.

## Precision, Recall, F1

When the answer is a **set** of things — which labels apply, which entities were extracted, which documents are relevant — you can be right and wrong at the same time, and one number can't capture that. You need two:

- **Precision** = of the things you returned, what fraction were correct? *(Did you cry wolf?)*
- **Recall** = of the things you should have returned, what fraction did you get? *(Did you miss any?)*

In terms of true positives (TP), false positives (FP), and false negatives (FN):

```
precision = TP / (TP + FP)
recall    = TP / (TP + FN)
```

These trade off. A model that returns *everything* has perfect recall and terrible precision. A model that returns only its single most-confident answer has high precision and poor recall. **F1** is the harmonic mean — a single number that's only high when *both* are high:

```
F1 = 2 * precision * recall / (precision + recall)
```

The harmonic mean (not the plain average) is used on purpose: it's dragged down hard by the smaller of the two, so you can't game F1 by maxing one and ignoring the other.

```python
def precision_recall_f1(predicted: set, gold: set):
    tp = len(predicted & gold)
    fp = len(predicted - gold)
    fn = len(gold - predicted)
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall    = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return precision, recall, f1
```

> **Which do you care about more?** Depends on the cost of each error. For a *spam filter*, a false positive (real mail in spam) is awful — favor **precision**. For *cancer screening*, a false negative (missed tumor) is catastrophic — favor **recall**. F1 balances them; if your costs are asymmetric, weight accordingly (F-beta).

### Try it: implement F1 from counts

<CodeChallenge
  id="eval-f1"
  fnName="f1"
  prompt="Implement f1(tp, fp, fn) — the F1 score from true-positive, false-positive, and false-negative counts. precision = tp/(tp+fp), recall = tp/(tp+fn), and F1 is their harmonic mean."
  starter={`function f1(tp, fp, fn) {\n  // precision = tp / (tp + fp)\n  // recall    = tp / (tp + fn)\n  // F1 = 2 * p * r / (p + r)\n}`}
  solution={`function f1(tp, fp, fn) {\n  const p = tp / (tp + fp);\n  const r = tp / (tp + fn);\n  return (2 * p * r) / (p + r);\n}`}
  tolerance={0.001}
  tests={[
    {args: [8, 2, 2], expected: 0.8},
    {args: [5, 0, 5], expected: 0.6667},
    {args: [10, 0, 0], expected: 1.0},
    {args: [3, 3, 3], expected: 0.5},
  ]}
  hint="Compute precision = tp/(tp+fp) and recall = tp/(tp+fn) first, then return 2*p*r/(p+r). With tp=8, fp=2, fn=2 you get p=0.8, r=0.8, F1=0.8."
/>

## Similarity metrics

When the answer is free text with no single right wording (summaries, translations, paraphrases), you measure *how close* the output is to a reference rather than exact equality. Three you'll hear about:

**Embedding similarity (cosine)** — embed both texts into vectors and measure the cosine of the angle between them. This captures *meaning*: "The capital is Paris" and "Paris is the capital" score near 1.0 even with different words. This is the modern default for semantic similarity. (Embeddings are covered in [Foundations](/docs/foundations/embeddings).)

```python
def embedding_similarity(output: str, reference: str, embed) -> float:
    a, b = embed(output), embed(reference)
    dot = sum(x*y for x, y in zip(a, b))
    na = sum(x*x for x in a) ** 0.5
    nb = sum(y*y for y in b) ** 0.5
    return dot / (na * nb)  # cosine: 1.0 = identical meaning
```

**ROUGE** (recall-oriented) — measures **n-gram overlap**: how many word-sequences from the reference appear in the output. Designed for summarization. ROUGE-1 = unigram overlap, ROUGE-L = longest common subsequence. Intuition: "did the summary include the key phrases the reference had?"

**BLEU** (precision-oriented) — also n-gram overlap, but the other direction: of the n-grams the output produced, how many appear in the reference, with a penalty for being too short. Designed for machine translation. Intuition: "did the translation use the right phrases without padding?"

| Metric | Captures | Good for | Blind spot |
|---|---|---|---|
| Embedding cosine | Meaning | Semantic match, paraphrase | Can rate fluent-but-wrong text as similar |
| ROUGE | Word overlap (recall) | Summarization | Misses paraphrase; rewards copying |
| BLEU | Word overlap (precision) | Translation | Misses paraphrase; brittle on short text |

**The key intuition:** ROUGE and BLEU are *surface* metrics — they count shared words, so a perfect paraphrase with different vocabulary scores low. They're cheap and historically standard, but in 2026 most teams prefer **embedding similarity** (captures meaning) or an **LLM-judge** (captures correctness) for generative tasks. Know ROUGE/BLEU because you'll see them in papers and legacy pipelines, but don't reach for them first.

## Rubric scores

For genuinely open-ended outputs (a chat reply, an essay, a plan), there's no reference to compare against. Instead you define a **rubric** — explicit criteria with a scale — and score against it. Almost always graded by an LLM-judge or a human.

```python
RUBRIC = {
    "helpfulness": "Does it directly address the user's actual question? (1-5)",
    "faithfulness": "Is every claim supported by the provided sources? (1-5)",
    "tone": "Is it professional and empathetic? (1-5)",
    "completeness": "Does it cover all parts of a multi-part question? (1-5)",
}
```

Rubrics turn "is it good?" into multiple specific, scorable dimensions. A good rubric is *concrete* — "5 = cites a source for every factual claim; 1 = no sources cited" beats "5 = great, 1 = bad," because vague rubrics produce inconsistent scores whether the grader is a model or a human. The full art of rubric-based grading by model is the next page, [LLM-as-judge](./06-llm-as-judge.md).

## Task-specific: retrieval & RAG metrics

These are the metrics that matter most for the most common production system — RAG. They evaluate the *retrieval* step independently of the LLM (see the component-eval idea in [Eval types](./03-eval-types.md)).

**recall@k** — of the queries, what fraction had at least one relevant document in the top *k* results? This is *the* retrieval health metric. If recall@5 is 0.6, the right context is missing 40% of the time and no prompt can fix that.

```python
def recall_at_k(retrieved_ids: list, gold_ids: set, k: int) -> float:
    top_k = set(retrieved_ids[:k])
    return 1.0 if (top_k & gold_ids) else 0.0   # averaged over queries
```

**precision@k** — of the top *k* you returned, what fraction were actually relevant? High precision@k means you're not stuffing the context window with junk (which dilutes the answer and costs tokens).

**MRR (Mean Reciprocal Rank)** — rewards getting the right document *high* in the list, not just present. For each query, take `1 / (rank of first relevant result)`; average over queries. Rank 1 → 1.0, rank 2 → 0.5, rank 5 → 0.2. Use it when *order* matters (the LLM reads top results first).

```python
def mrr(results: list[list], golds: list[set]) -> float:
    total = 0.0
    for retrieved_ids, gold in zip(results, golds):
        for rank, doc_id in enumerate(retrieved_ids, start=1):
            if doc_id in gold:
                total += 1.0 / rank
                break
    return total / len(results)
```

> **nDCG** (normalized Discounted Cumulative Gain) is the heavier-duty cousin of MRR: it handles *graded* relevance (some docs are more relevant than others) and discounts by position. Reach for it when relevance isn't just yes/no. For most product RAG, recall@k + MRR is enough.

**Faithfulness (a.k.a. groundedness)** — a RAG-specific *quality* metric: is every claim in the answer actually supported by the retrieved context, or did the model invent something? This is reference-free and usually LLM-judged. It's the single most important guard against hallucination in RAG.

```python
def faithfulness(answer: str, context: str) -> float:
    prompt = f"""Break the ANSWER into individual factual claims.
For each claim, decide if it is SUPPORTED by the CONTEXT.
Return the fraction of claims that are supported (0.0-1.0).
CONTEXT: {context}
ANSWER: {answer}"""
    return float(judge.generate(prompt))
```

**Answer relevance** — the flip side: does the answer actually address the question (vs. being faithful but off-topic)? Together, faithfulness + answer relevance + recall@k form the standard RAG eval triad. Libraries like **Ragas** and **DeepEval** implement all three out of the box (see [eval tools](/docs/stack/eval-tools)).

## Choosing a metric: a cheat sheet

| Your task | Reach for |
|---|---|
| Classification (one label) | Accuracy / exact match |
| Multi-label / entity extraction | Precision, Recall, F1 |
| Summarization | Embedding similarity (+ ROUGE if required) |
| Translation | BLEU / embedding similarity |
| Open-ended chat / generation | Rubric score via LLM-judge |
| Retrieval quality | recall@k, precision@k, MRR |
| RAG answer grounding | Faithfulness + answer relevance |

## Common pitfalls

:::caution[Where people trip up]
- **Exact match on generative tasks.** It fails every correct-but-reworded answer and pushes you to optimize for memorized phrasing. Use similarity or a rubric.
- **Reporting precision OR recall alone.** Either one is gameable in isolation (return everything → perfect recall). Report both, or F1.
- **Trusting ROUGE/BLEU as "quality."** They count shared words, not correctness. A fluent, confident, *wrong* answer can score well. Pair with faithfulness.
- **Embedding similarity as a correctness check.** Two answers can be semantically close and one still factually wrong. Similarity ≠ correct.
- **Ignoring retrieval metrics in RAG.** If you only eval the final answer, you can't tell whether a failure is bad retrieval or bad generation. Always measure recall@k separately.
- **Averaging scores across mismatched slices.** A mean over wildly different sub-tasks hides which one regressed. Report per-slice (see [datasets](./04-datasets.md)).
:::

<Quiz id="eval-metrics-quick-check" variant="micro" title="Quick check">

<Question
  prompt="You're tuning a spam filter where a false positive means a real email lands in spam. Which metric should you favor, per this page's cost-of-error logic?"
  options={[
    { text: "Recall, because missing spam is the worst outcome" },
    { text: "Accuracy, because it balances all error types automatically" },
    { text: "BLEU, because the filter outputs text labels" },
    { text: "Precision, because false positives (real mail flagged) are the costly error" }
  ]}
  correct={3}
  explanation="Precision asks 'of what you flagged, how much was actually spam?' — exactly the error that hurts when real mail gets buried. Recall is the tempting flip because 'catching all spam' sounds like the goal, but the page's rule is to favor the metric that punishes your costliest error; recall-first is for cases like cancer screening, where misses are catastrophic."
/>

<Question
  prompt="A model produces a perfect paraphrase of the reference summary using almost entirely different vocabulary. What happens to its ROUGE score, and why?"
  options={[
    { text: "High — ROUGE measures meaning, so paraphrases score well" },
    { text: "Low — ROUGE counts n-gram overlap, so different words mean low overlap even when the meaning is identical" },
    { text: "Exactly 1.0 — ROUGE normalizes for vocabulary differences" },
    { text: "Undefined — ROUGE only works on translations, not summaries" }
  ]}
  correct={1}
  explanation="ROUGE (and BLEU) are surface metrics: they count shared word sequences, so a perfect paraphrase with new vocabulary scores poorly. The 'measures meaning' answer is the common misconception — capturing meaning is what embedding similarity does, which is why the page recommends it (or an LLM-judge) over ROUGE/BLEU for most generative tasks today."
/>

<Question
  prompt="Your RAG bot retrieves the right documents (recall@5 is high) but the answer confidently states a 'fact' that appears nowhere in the retrieved context. Which metric is designed to catch this?"
  options={[
    { text: "MRR, since it checks the rank of the first relevant document" },
    { text: "precision@k, since it checks whether retrieved docs are relevant" },
    { text: "Faithfulness, since it checks whether every claim in the answer is supported by the retrieved context" },
    { text: "Exact match, since the invented fact won't equal the gold answer" }
  ]}
  correct={2}
  explanation="Faithfulness (groundedness) breaks the answer into claims and checks each against the context — it is the page's single most important guard against RAG hallucination. The retrieval metrics (MRR, precision@k) are tempting because this is a RAG system, but they grade the retrieval step, which in this scenario worked fine; the failure happened in generation."
/>

</Quiz>

---

→ Next: [LLM-as-judge](./06-llm-as-judge.md)
