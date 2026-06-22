---
id: embedding-tier
title: Embedding Tier — The Vectors Under Your RAG
sidebar_position: 5
sidebar_label: Embedding tier
description: text-embedding-3-small/large, Voyage, Cohere v3, BGE, plus when to consider domain-specific embeddings.
---

# Embedding Tier — The Vectors Under Your RAG

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** The embedding model decides what "similar" means for retrieval — and it's nearly always the same answer (text-embedding-3-small) until you have evidence to climb.

:::tip[In plain English]
An embedding model turns a piece of text into a list of numbers, placed so that texts with similar meaning end up near each other — like assigning every sentence a spot on a giant map. When your app searches for relevant documents, it's really asking which spots on that map are closest to the question. This page decides which mapmaker to use, and the honest answer is that the popular default is fine for almost everyone. The one rule you genuinely cannot break: documents and questions must be mapped by the exact same model, or your search quietly returns nonsense.
:::

## What's in this tier (as of 2026)

### Tier 1 — adopt by default

| Model | Provider | Dims | Cost per 1M tokens | Notes |
|-------|----------|------|---------------------|-------|
| **text-embedding-3-small** | OpenAI | 1536 | $0.02 | The boring-tech answer; great quality, cheap, fast |
| **text-embedding-3-large** | OpenAI | 3072 | $0.13 | When 3-small's quality isn't enough; ~10% better on MTEB, ~6x cost |

### Tier 2 — reach for when there's evidence

| Model | Provider | Notes |
|-------|----------|-------|
| **Voyage v3 / voyage-3-large** | Voyage AI | Often beats OpenAI on technical-doc / code corpora; competitive pricing |
| **Cohere Embed v3** | Cohere | Strong multilingual; good multimodal options |
| **Gemini text-embedding-004** | Google | Free tier; tightly integrated with Google Cloud stack |
| **bge-m3 / bge-large** | BAAI (open-source) | Self-hostable; good for data-residency requirements |
| **nomic-embed** | Nomic | Open-source, long-context (8k tokens), commercial-friendly license |

### Tier 3 — niche

- **Custom fine-tuned embeddings** — only when domain-specific recall matters AND you have ground-truth pairs to train on. Rare for app-shaped AI.
- **Multilingual / domain-specialized models** — useful for non-English-heavy corpora or specific domains (medical, legal).

## Why embeddings matter (and how much)

The embedding model decides how "close" two texts are in vector space. That determines what gets retrieved in your RAG, which determines what your LLM sees, which determines the answer quality. **Embedding quality dominates retrieval quality on tough corpora.**

That said, on most corpora the differences between top-tier embeddings are small (3–8% retrieval recall). The bigger lever is *chunking and hybrid search* (see [Retrieval quality (Part III)](../03-part-3-beyond/03-retrieval-quality.md)).

:::tip[The pragmatic rule]
Start with `text-embedding-3-small`. Build the rest of the pipeline. Measure recall on your eval set. If recall is below ~75%, your problem is almost certainly chunking or pure-vector-vs-hybrid, NOT the embedding model. If those are fixed and you're still below 80%, try `text-embedding-3-large` or Voyage v3.
:::

## Dimensions and the cost trade

Embeddings have a fixed dimension (e.g., 1536 for 3-small). More dimensions = more storage, more compute for similarity, marginally better recall.

| Dim | Storage per chunk | Notes |
|-----|---------------------|-------|
| 384 (bge-small) | ~1.5 KB | Cheap; OK quality |
| 768 (older models) | ~3 KB | Legacy default |
| 1536 (3-small) | ~6 KB | The right balance |
| 3072 (3-large) | ~12 KB | Better but expensive at scale |

For 1M chunks, that's 6 GB at 1536 vs 12 GB at 3072. Indexing cost (HNSW build time) and query latency both rise sub-linearly with dimension. For ≤10M chunks, dimension is rarely the binding constraint.

**Matryoshka embeddings** (3-small supports this) let you truncate the vector to a smaller dim if storage is tight, with graceful quality degradation. Useful at very large scale.

## The same-model-everywhere rule

You MUST embed your documents and your queries with the **same model and same version**. Mixing:

- `text-embedding-3-small` for docs + `text-embedding-3-large` for queries → silent garbage retrieval. The vectors don't live in the same space.
- v1 of an open-source model for the index, v2 for queries → also broken.
- One provider's model for docs and a different provider's for queries → completely broken.

When you upgrade your embedding model, you must **re-embed the entire corpus** before any new queries hit. The migration is often slow (hours-to-days for large corpora) and expensive.

## When to consider non-OpenAI embeddings

### Voyage v3
- Often the winner for technical-doc corpora (code, API docs, engineering writeups).
- Competitive pricing.
- The right A/B test target if you're plateaued at 80% recall.

### Cohere v3
- Strong on non-English corpora.
- Built-in multimodal (text + image) variants.

### Gemini text-embedding-004
- Free tier is generous.
- Integrates cleanly with Google Cloud (Vertex AI, BigQuery vector search).

### Open-source (bge-m3, nomic-embed)
- Self-hostable: data-residency requirements, air-gapped deployments.
- Often quality-competitive with OpenAI for the right corpus.
- The latency / ops cost of self-hosting often dwarfs the API savings unless you're at very high volume.

## Embedding for code (special case)

If your RAG is over codebases, dedicated code-embedding models can win:

- **Voyage code-3** — currently the best at code retrieval.
- **OpenAI 3-large** — surprisingly strong on code.
- **CodeBERT, codet5 family** — older, specialized, but limited.

Run an eval on your code corpus before defaulting to generic text embeddings.

## Embedding for multimodal (special case)

- **CLIP family** — text + image retrieval (find images matching a text query).
- **Cohere embed-multilingual + image** — text and image in the same vector space.
- **Gemini multimodal embedding** — same space for text + image + audio.

For most apps "search images by text description" is the actual use case; CLIP-style models nail it.

## Cost intuition

Embedding cost is small compared to LLM cost — but at scale it's still meaningful.

Example: 1M documents, average 1000 tokens each, embedded once with 3-small:
- 1M × 1000 = 1B tokens
- 1B / 1M × $0.02 = $20

One-time cost of $20 for a million-doc corpus. Re-embedding for an upgrade: another $20. Embedding 100M queries/year: $2000.

The cost dwarves only matters at very large scale — and even then, embeddings are typically \&lt;5% of total AI cost.

## When fine-tuning embeddings is worth it

Almost never for app-shaped AI. The conditions where it IS worth it:

- **Domain-specific language** that off-the-shelf embeddings don't capture well (medical, legal, internal jargon).
- **Ground-truth pairs** are available — sets of (query, correct-document) pairs to train on.
- **Retrieval is the bottleneck** — you've fixed chunking, hybrid search, reranking, and you're STILL below acceptable recall.
- **High enough query volume** to justify the engineering cost.

For 95% of apps, off-the-shelf embeddings + careful retrieval engineering wins.

## Common mistakes

:::caution[Where people commonly trip up]
- **Embedding model mismatch between index and query.** Silent garbage; one of the hardest bugs to spot. Always pin the model version explicitly in code.
- **Defaulting to the biggest embedding model.** 3-large is ~6x the cost of 3-small for ~10% recall lift. Only worth it on hard corpora where chunking and hybrid are exhausted.
- **Ignoring chunking and hybrid; tweaking embedding instead.** 80% of retrieval-quality wins come from chunking and hybrid search. Embedding swaps are the long-tail optimization.
- **Self-hosting embeddings prematurely.** "We'll save money self-hosting bge-m3 on our own GPUs!" — then you spend two engineers' salaries on ops. At \&lt;10M queries/month, hosted embeddings are nearly free; self-hosting is theater.
- **Not pinning version.** OpenAI may update embedding models. If your code says `model="text-embedding-3-small"` and they release a v2 with the same name, your retrieval silently breaks. Pin model strings and verify on provider docs.
:::

<Quiz id="embedding-tier-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Your RAG retrieval recall is measuring around 70 percent. According to this page, what is the most likely culprit?"
  options={[
    { text: "Chunking strategy or relying on pure vector search instead of hybrid" },
    { text: "The embedding model is too small and needs the largest available upgrade" },
    { text: "The vector database is too slow" },
    { text: "The LLM generating answers is too cheap" }
  ]}
  correct={0}
  explanation="Below roughly 75 percent recall, the problem is almost certainly chunking or pure-vector-versus-hybrid search, not the embedding model. Differences between top embeddings are small; chunking and hybrid search are the big levers. Swap embeddings only after those are fixed."
/>

<Question
  prompt="What happens if you embed your documents with one model and your queries with a different one?"
  options={[
    { text: "Retrieval works but runs slower" },
    { text: "Retrieval silently returns garbage, because the vectors do not live in the same space" },
    { text: "The vector database raises an error at query time" },
    { text: "Quality drops slightly but remains usable" }
  ]}
  correct={1}
  explanation="This is the same-model-everywhere rule. Mismatched models — or even mismatched versions of the same model — produce vectors in incompatible spaces, and nothing errors out; you just get silently broken retrieval. It is one of the hardest bugs to spot, which is why upgrading means re-embedding the entire corpus first."
/>

<Question
  prompt="When is fine-tuning a custom embedding model actually worth it?"
  options={[
    { text: "As soon as your corpus contains any specialized vocabulary" },
    { text: "Whenever you want a few extra points of recall" },
    { text: "For most production RAG systems past a certain size" },
    { text: "Almost never — only when domain language is unusual, you have ground-truth pairs to train on, and retrieval is still the bottleneck after fixing chunking, hybrid search, and reranking" }
  ]}
  correct={3}
  explanation="For about 95 percent of apps, off-the-shelf embeddings plus careful retrieval engineering wins. Fine-tuning needs all the conditions at once: unusual domain language, training pairs, exhausted simpler fixes, and enough volume to justify the engineering cost."
/>

</Quiz>

→ Next: [Vector DB pick](./05-vector-db-pick.md) — where these embeddings actually live.
