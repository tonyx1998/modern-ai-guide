---
id: embedding-models
title: Embedding models
sidebar_position: 5
description: OpenAI, Cohere, Voyage, BGE, E5 — the models that turn text into vectors for retrieval.
---

# Embedding models

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** A cheaper, smaller model that turns a piece of text (or image, or audio) into a fixed-length vector — the unit currency of RAG, semantic search, classification, and clustering.

:::tip[In plain English]
A regular LLM reads tokens and writes tokens. An embedding model reads tokens and writes one list of numbers — typically 768 to 3,072 of them. That list is a coordinate in "meaning space": two texts that mean similar things end up close together. You store those vectors in a [vector database](./vector-databases.md), then at query time embed the user's question and grab the nearest neighbors. That's RAG in one sentence.
:::

## The major options (May 2026)

| Model | Provider | Dimensions | Max input | Strengths | $ / Mtok |
|-------|---------|------------|----------|----------|---------|
| **text-embedding-3-small** | OpenAI | 1536 (configurable) | 8k | Default; cheap; ubiquitous | $0.02 |
| **text-embedding-3-large** | OpenAI | 3072 (configurable) | 8k | Higher quality | $0.13 |
| **voyage-3** | Voyage AI | 1024 | 32k | Best general retrieval (MTEB top) | $0.06 |
| **voyage-code-3** | Voyage AI | 1024 | 32k | Code search king | $0.06 |
| **embed-v4** | Cohere | 1024 (configurable) | 128k | Multilingual; long doc | $0.10 |
| **text-embedding-005** | Google | 768 | 2k | Vertex AI native | $0.025 |
| **bge-large-en-v1.5** | BAAI (open) | 1024 | 512 | Self-host default | free (your GPU) |
| **nomic-embed-text-v2** | Nomic (open) | 768 | 8k | Long-context open option | free / $0.01 hosted |
| **mxbai-embed-large** | mixedbread (open) | 1024 | 512 | Strong open challenger | free / $0.01 hosted |

## Default pick for most teams

**OpenAI `text-embedding-3-small` at 1536 dimensions.** It's cheap ($0.02/Mtok), good enough for 90% of retrieval, and every vector DB, RAG framework, and tutorial assumes this shape.

Upgrade to **Voyage `voyage-3`** when you measure retrieval quality and it's the bottleneck — Voyage consistently tops the MTEB leaderboard and is worth the 3× price for quality-sensitive RAG.

## When to deviate

- **Code search** (a function, an API call, a stack trace): **`voyage-code-3`**. It's not subtle — it just wins on code.
- **Multilingual corpus** (especially non-Latin scripts): **Cohere `embed-v4`** or **`voyage-3`**.
- **Long documents** you'd rather embed whole than chunk: **Cohere `embed-v4`** (128k) or **`nomic-embed-text-v2`** (8k).
- **Self-host required** (data residency, on-prem): **`bge-large-en-v1.5`** via **Hugging Face TEI** or **Infinity**.
- **Latency-sensitive on-device**: a small open model like **`bge-small`** quantized.
- **You're already in Vertex AI**: Google's `text-embedding-005` saves the integration step.

## Minimum integration

```python
from openai import OpenAI
client = OpenAI()

def embed(text: str) -> list[float]:
    r = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return r.data[0].embedding   # 1536 floats

vec = embed("How do I rotate a Postgres password?")
# Store `vec` next to the source text in pgvector / Pinecone / Qdrant.
```

Batch mode is dramatically cheaper — pass a list of up to ~2,000 strings in a single call:

```python
r = client.embeddings.create(
    model="text-embedding-3-small",
    input=["doc 1 text", "doc 2 text", "doc 3 text"],
)
vectors = [d.embedding for d in r.data]
```

## Critical operational rules

- **Pick once, embed everything once.** Re-embedding ten million chunks on a model swap is a one-week project. Decide deliberately.
- **Same model for queries and corpus.** A query embedded with model A cannot match a corpus embedded with model B. The vectors live in incompatible spaces.
- **Match dimensionality to your index config.** pgvector with HNSW indexed at 1024 dims will *not* serve queries from 3072-dim vectors. Lock dimensions early.
- **Store the model name alongside every vector.** Future you, mid-migration, will need to know which rows are which.
- **Normalize if your DB expects it.** Cosine similarity assumes unit vectors. Some DBs L2-normalize for you; some don't.

## Pricing & cost notes

Embeddings are the cheap part of the AI stack. A typical RAG corpus — say, 1 million chunks at 500 tokens each — costs:

- **text-embedding-3-small:** ~$10 to embed the whole thing once.
- **voyage-3:** ~$30.
- **Self-hosted bge-large on a single A10:** ~free, but your GPU-hour bill.

The expensive part is *re-embedding* on a model change. Plan for it.

## Pitfalls

- **Switching embedding models mid-project without re-embedding the corpus.** Retrieval quality silently degrades; you spend a week debugging your prompt before noticing the embeddings don't match.
- **Embedding 50k-token "documents" whole.** Most models cap at 512–8192 tokens and silently truncate the rest. Chunk first.
- **Truncating embeddings (Matryoshka) without re-indexing.** 3072-dim vectors truncated to 256 dims are *not* the same as native 256-dim vectors. Read the model docs.
- **Mixing models across query and corpus during an A/B test.** The "B" arm looks terrible because nothing matches, not because the model is worse.
- **Skipping a re-ranker on small-`k` retrieval.** Embeddings alone bring back coarse matches. A cross-encoder rerank (Cohere Rerank 3, Voyage Rerank) on top-50 → top-5 is the single biggest RAG quality win for the cost.
- **Putting embeddings in `JSONB` instead of a vector column.** Works for 10 rows, dies at 10k. Use pgvector or a real vector DB.

<Quiz id="embedding-models-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Why is the choice of embedding model worth making deliberately up front?"
  options={[
    { text: "Re-embedding a large corpus after a model swap is a major project, so switching later is expensive" },
    { text: "Embedding models cannot be changed once a vector DB is created" },
    { text: "All embedding models produce the same dimensions, so quality is the only difference" },
    { text: "Query latency doubles every time you change models" }
  ]}
  correct={0}
  explanation="Embedding the corpus once is cheap; RE-embedding ten million chunks on a model change is a one-week project, which is the real switching cost. You absolutely can change models later — it's just painful — and dimensions vary widely across models, which is part of what makes the migration hard."
/>

<Question
  prompt="Your users search a codebase for functions, API calls, and stack traces. Which model does the page call the clear winner?"
  options={[
    { text: "text-embedding-3-small" },
    { text: "voyage-code-3" },
    { text: "bge-small quantized" },
    { text: "text-embedding-005" }
  ]}
  correct={1}
  explanation="The page is blunt: voyage-code-3 just wins on code, no subtlety about it. text-embedding-3-small is the great general-purpose default, but code retrieval is a specialized task where the code-tuned model reliably outperforms generalists."
/>

<Question
  prompt="A query embedded with model A returns garbage against a corpus embedded with model B. What's the root cause?"
  options={[
    { text: "The vector database index needs to be rebuilt weekly" },
    { text: "Cosine similarity only works on English text" },
    { text: "Model A is simply lower quality than model B" },
    { text: "Vectors from different models live in incompatible spaces, so distances between them are meaningless" }
  ]}
  correct={3}
  explanation="Each model defines its own meaning-space; coordinates from one space say nothing about distances in another, so query and corpus must always use the same model. Blaming model quality is the tempting wrong answer — even two excellent models are mutually incompatible. This also bites silently during A/B tests."
/>

</Quiz>

---

→ Next: [LLM SDKs](./llm-sdks.md)
