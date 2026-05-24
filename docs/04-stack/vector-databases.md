---
id: vector-databases
title: Vector databases
sidebar_position: 10
description: pgvector, Pinecone, Weaviate, Qdrant, Chroma, Turbopuffer, Milvus, LanceDB — picking a vector store for production RAG.
---

# Vector databases

> **In one line:** Storage with a nearest-neighbor index over high-dimensional vectors. Pick mostly on your team's ops appetite and your corpus size — the algorithms are commoditized.

:::tip[In plain English]
A vector database is just a regular database that also knows how to answer "give me the 10 rows whose vector is closest to *this* vector," fast. The "fast" is the magic — naive scan over a million vectors is 200ms+; with an HNSW or IVF index it's 2ms. Everything else (filters, hybrid search, persistence) is what you'd want from any database. In 2026 the big choice isn't which algorithm — they all use HNSW or a variant — it's "do I want a new service, or can I use the Postgres I already have?"
:::

## The major options (2026)

| DB | Hosting | Scale sweet spot | Hybrid search | Filters | Cost shape |
|----|---------|------------------|---------------|---------|-----------|
| **pgvector** (Postgres extension) | self / Supabase / Neon | < 10M vectors | with `pg_trgm` / FTS | excellent (SQL) | Postgres cost |
| **Pinecone** | hosted only | 1M–1B+ | yes (sparse-dense) | good | $$ (pod / serverless) |
| **Weaviate** | self / hosted | 1M–100M | excellent (BM25 + vector) | good | OSS / hosted |
| **Qdrant** | self / hosted | 1M–100M | yes | excellent | OSS / cheap hosted |
| **Chroma** | embedded / hosted | < 1M (prod) | basic | basic | OSS, free embedded |
| **Turbopuffer** | hosted only | 100M+, many tenants | yes | good | object-storage cheap |
| **Milvus / Zilliz** | self / hosted | 100M–10B+ | yes | good | enterprise |
| **LanceDB** | embedded + cloud | 1M–1B (columnar) | yes | good | OSS / cloud |
| **Vespa** | self / hosted | extreme scale | best-in-class | best-in-class | complex to operate |
| **Elasticsearch / OpenSearch** | self / hosted | 1M–100M | mature BM25 + vector | excellent | familiar to ops |

## Default pick for most teams

**pgvector.** If you already run Postgres (and you probably do), turn on the extension, add a column, and you have a vector store. One service to back up, one mental model, SQL filters out of the box. This is the right starting point until you have a measured reason to leave.

When you do leave: **Pinecone** if you want zero ops and you'll pay for it, **Qdrant** if you want OSS and you're happy operating one extra service, **Turbopuffer** if you have many tenants and most data is cold.

## When to deviate

- **>10M vectors with hot QPS**: pgvector's index build time and recall start to wobble. Move to **Qdrant**, **Weaviate**, or **Pinecone**.
- **Hybrid search is the core feature** (not an add-on): **Weaviate** or **Vespa** ship it with the cleanest defaults.
- **Multi-tenant SaaS with thousands of small corpora**: **Turbopuffer** is built for exactly this; pgvector and Pinecone both struggle with index-per-tenant economics.
- **Embedded / prototype / no service**: **Chroma** or **LanceDB**.
- **Already in Elastic for logs / search**: just turn on dense-vector and stay in **Elasticsearch**.
- **Truly massive (billions of vectors, complex ranking)**: **Vespa** or **Milvus**.

## Minimum integration

**pgvector — the boring, correct default:**

```sql
CREATE EXTENSION vector;

CREATE TABLE docs (
    id          bigserial PRIMARY KEY,
    text        text NOT NULL,
    embedding   vector(1536),
    metadata    jsonb
);

CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);
```

```python
# Insert
db.execute("INSERT INTO docs (text, embedding) VALUES (%s, %s)", [text, vec])

# Top-5 nearest neighbors
rows = db.execute(
    "SELECT text FROM docs ORDER BY embedding <=> %s LIMIT 5",
    [query_vec],
).fetchall()
```

**Qdrant — when you outgrow pgvector:**

```python
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct

client = QdrantClient(host="localhost", port=6333)
client.create_collection("docs", vectors_config=VectorParams(size=1536, distance=Distance.COSINE))

client.upsert("docs", points=[PointStruct(id=1, vector=vec, payload={"text": text})])

hits = client.search("docs", query_vector=query_vec, limit=5)
```

## Hybrid search

The 2026 consensus: combine **BM25** (keyword) with **vector** (semantic) and fuse the rankings. Vector search alone misses exact-match cases ("error code E-417"); BM25 alone misses paraphrasing ("how do I reset my password" vs. "rotate credentials"). Most production-grade vector DBs ship hybrid (**Weaviate**, **Qdrant**, **Pinecone** sparse-dense, **Vespa**); pgvector users typically pair with **Postgres FTS** or **ParadeDB** (`pg_search`).

Then **rerank** the top-50 with a cross-encoder (Cohere Rerank 3, Voyage Rerank) down to top-5. That's the single biggest RAG quality win for the cost.

## Pricing & cost notes (May 2026 ballpark)

| DB | Cost for 1M vectors @ 1536d, modest QPS |
|----|----------------------------------------|
| pgvector (Supabase / Neon small) | $0–$50/mo (your Postgres bill) |
| Pinecone Serverless | ~$50–$150/mo |
| Qdrant Cloud (1 node) | ~$80/mo |
| Weaviate Cloud (sandbox) | ~$25–$100/mo |
| Turbopuffer | ~$10–$50/mo (cold data dirt cheap) |
| Self-hosted Qdrant on a VM | $20/mo (just the VM) |

At 10M+ vectors the picture flips: hosted Pinecone/Weaviate get expensive, and self-hosted Qdrant or Turbopuffer dominate cost.

## Pitfalls

- **Adding a vector DB before you've shipped one RAG feature.** pgvector inside the Postgres you already run beats every standalone choice for v0.
- **Wrong distance metric.** Cosine for normalized embeddings, L2 for raw. Pick wrong and the rankings are subtly garbage.
- **No HNSW index, querying at full scan.** "Why is retrieval 800ms?" Because you forgot `CREATE INDEX`.
- **Tuning HNSW parameters by vibes.** `m` and `ef_construction` change build time, recall, and memory non-trivially. Read the docs; benchmark on your data.
- **Storing only the vector, no metadata.** You can't filter by tenant, language, or doc type, and you can't show the user what they retrieved. Always store the source text + metadata next to the vector.
- **No re-embedding plan.** Six months in, you'll want to swap embedding models. Without an `embedding_model_id` column, you can't tell which rows are which.
- **Treating Chroma as production.** Chroma is a fantastic prototype DB. It is not where you put your million-document corpus.
- **Not measuring recall.** A vector DB with 70% recall@10 *looks* fine in demos and breaks subtly in production. Build a small labeled set and measure.

---

→ Next: [Document parsing](./document-parsing.md)
