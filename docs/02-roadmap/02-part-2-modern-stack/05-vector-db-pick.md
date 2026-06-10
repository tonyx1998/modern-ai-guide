---
id: vector-db-pick
title: Vector DB Pick — pgvector by Default
sidebar_position: 6
sidebar_label: Vector DB pick
description: pgvector is the boring-tech answer for almost every project. When to reach for Qdrant, Pinecone, Weaviate, or specialized stores.
---

# Vector DB Pick — pgvector by Default

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Start with pgvector (Postgres extension) — it covers ~90% of vector workloads through ~50M chunks. Climb only when you can name a specific reason the boring answer doesn't fit.

:::tip[In plain English]
Once your documents are turned into number-lists (embeddings), they need to live somewhere that can quickly answer "which ones are closest to this question?" — that's a vector database. There's a whole industry of shiny specialized products for this, and this page's job is to talk you out of most of them. The boring answer is to add one small extension to the ordinary database you almost certainly already run, which handles far more data than most apps will ever have. The skill being taught is recognizing the few specific, measurable situations where the fancy option genuinely earns its complexity.
:::

## Tier 1 — pgvector

You already have Postgres. Add the `vector` extension. Done.

```sql
CREATE EXTENSION vector;
CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  text TEXT,
  embedding vector(1536)
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
```

**Why pgvector wins by default:**

- **One database to operate.** No new service, no new SDK, no new monitoring.
- **Joins with your other data.** Filter by user_id, tenant_id, date, status — same query.
- **ACID transactions.** Embedding + metadata + business records updated atomically.
- **Hybrid search built in.** Combine `embedding <=> vec` (vector) with `to_tsvector @@ to_tsquery(...)` (BM25-style full-text) in one query.
- **Scales to ~50M chunks** on a respectable Postgres instance with HNSW indexing.
- **Cheap** — no per-query pricing, no separate vector-DB bill.

Best hosted Postgres-with-pgvector options in 2026:

| Provider | Notes |
|----------|-------|
| **Neon** | Serverless Postgres, generous free tier, pgvector preinstalled |
| **Supabase** | Postgres + auth + storage as a bundle; pgvector preinstalled |
| **Render / Railway / Fly.io** | Managed Postgres; install extension manually |
| **AWS RDS / Aurora** | Pgvector supported; for enterprise scale |

## Tier 2 — when to reach for a dedicated vector DB

Climb when you have a **named, measured** reason. Common ones:

### Scale beyond ~50M chunks

pgvector with HNSW handles ~10M–50M chunks comfortably. Beyond that, indexing time, memory pressure, and query latency become real problems. At >100M chunks, dedicated vector DBs are the right call.

### High write throughput

If you're indexing millions of new chunks per day, pgvector's index updates become a bottleneck. Qdrant, Weaviate, and others have better write-throughput characteristics.

### Multi-tenancy with strict isolation

A SaaS where each tenant's vectors must be physically isolated (per regulation): some vector DBs offer per-collection isolation that's cleaner than partitioning a Postgres table.

### Advanced filtering at scale

Filtered vector search ("find the 10 closest chunks where `tenant_id = X AND status = published`") is supported by pgvector but gets expensive at scale. Qdrant and Weaviate have richer filtered-search semantics.

### Specialized features

- **Pinecone Serverless** — auto-scaling, very low ops, pay-per-use.
- **Qdrant** — open-source, Rust, fast, rich filtering, hosted or self-hosted.
- **Weaviate** — strong on multimodal, GraphQL API, hybrid built-in.
- **Milvus** — high-throughput; popular at very large scale.
- **LanceDB** — embedded vector DB; great for local/desktop apps.
- **Turbopuffer** — serverless, cheap, fast — gaining traction in 2025–26.

## Tier 3 — skip or defer

- **Chroma in production**. Chroma is fine for prototypes; the prod story is shakier than alternatives.
- **Building your own vector index** (FAISS, hnswlib directly). Useful as a learning exercise; almost never the right production answer.
- **Vendor-specific niche DBs** (e.g., proprietary embedded). Lock-in risk doesn't justify marginal feature wins.

## The choice matrix

| Need | Pick |
|------|------|
| Default; \&lt;50M chunks; have Postgres | **pgvector** |
| Want zero ops; pay-per-use; small-to-medium scale | **Pinecone Serverless** |
| Open-source self-host; very fast; rich filters | **Qdrant** |
| Multimodal + GraphQL preference | **Weaviate** |
| Embedded (desktop, edge) | **LanceDB** |
| 100M+ chunks at scale | **Milvus / Qdrant / Turbopuffer** |
| Enterprise compliance / on-prem | **Qdrant self-hosted / Milvus** |

## What "scale" actually means

A back-of-envelope for pgvector:

- **1M chunks, 1536 dims** — ~6 GB of embeddings. Fits in RAM on a small DB. Sub-millisecond queries with HNSW. No problem.
- **10M chunks** — ~60 GB. Needs a bigger instance; HNSW still works. Index build takes hours.
- **50M chunks** — ~300 GB. Postgres can handle it but you're approaching the edge — index build is slow, queries get to 10–50ms.
- **100M+** — switch to a dedicated DB.

Most apps never approach 10M chunks. A docs RAG over a 1000-page manual is ~5k chunks. A code RAG over a million-line repo is ~30k chunks. A massive customer-data RAG might hit 1M.

## Hybrid search (BM25 + vector)

Pure vector search misses exact-match queries. Hybrid search is the consistent winner across corpora.

**pgvector hybrid example:**

```sql
WITH vector_hits AS (
  SELECT id, 1 / (1 + (embedding <=> $1::vector)) AS score
  FROM chunks ORDER BY embedding <=> $1::vector LIMIT 20
),
text_hits AS (
  SELECT id, ts_rank(text_tsv, query) AS score
  FROM chunks, to_tsquery($2) query
  WHERE text_tsv @@ query
  LIMIT 20
)
SELECT chunk.id, chunk.text,
       COALESCE(v.score, 0) * 0.6 + COALESCE(t.score, 0) * 0.4 AS combined
FROM chunks chunk
LEFT JOIN vector_hits v ON v.id = chunk.id
LEFT JOIN text_hits t ON t.id = chunk.id
WHERE v.id IS NOT NULL OR t.id IS NOT NULL
ORDER BY combined DESC LIMIT 5;
```

Many dedicated vector DBs (Qdrant, Weaviate, Pinecone) have hybrid built-in with less SQL gymnastics. → [Retrieval quality (Part III)](../03-part-3-beyond/03-retrieval-quality.md) covers RRF (reciprocal rank fusion) and reranking.

## Index types (pgvector)

- **HNSW** (Hierarchical Navigable Small World) — default in 2026. Fast queries, slower builds. The right choice for most apps.
- **IVFFlat** — older; faster to build, slower to query. Only use if HNSW build time is prohibitive on your hardware.
- **No index (sequential scan)** — fine for \&lt;100k chunks; you'll know when to upgrade because queries get slow.

Tune HNSW with `m` (graph connectivity, default 16) and `ef_construction` (build effort, default 64). Bigger = better recall, slower build. Defaults are fine for most apps.

## Migration story

When you outgrow pgvector:

1. **Build the new DB alongside the old one.** Index everything into both.
2. **Dual-write** for some period — every new chunk goes to both stores.
3. **Shadow-read** — run queries against both, log discrepancies, fix bugs without affecting users.
4. **Cutover** when shadow-read shows parity.
5. **Decommission** the old store.

This is engineering boilerplate, not vector-DB-specific. The fact that you can do it gradually is part of why "start with pgvector" is the right answer — you can always migrate later; you can't easily un-adopt a complex vector DB you didn't need.

## Common mistakes

:::caution[Where people commonly trip up]
- **Reaching for Pinecone on day one.** You'll spend a week integrating it, then ship something that runs on 100 chunks where pgvector would have been an `CREATE EXTENSION;` away. Default to boring; upgrade when forced.
- **No index on the vector column.** Sequential scan over 1M chunks is seconds-slow. Always add an HNSW (or IVFFlat) index, always.
- **Embeddings in JSON columns instead of `vector`.** Storing embeddings as `jsonb` arrays works but kills query speed and prevents the index from being used. Use the `vector` type.
- **Treating vector DB as the bottleneck before measuring.** "Retrieval is slow, we need Pinecone." Measure first. Often the slowness is in embedding the query, in chunking quality, or in over-fetching K=50 when K=5 would do.
- **Vendor lock-in via the SDK.** Some vector DB SDKs assume their data model end-to-end. Keep your retrieval code thin — `def retrieve(query, k) -> list[Chunk]` — so swapping stores is a one-day project, not a refactor.
:::

<Quiz id="vector-db-pick-quick-check" variant="micro" title="Quick check">

<Question
  prompt="You are starting a new RAG project and already run Postgres. What does this page say to do for vector storage?"
  options={[
    { text: "Adopt a dedicated managed vector database so you never have to migrate" },
    { text: "Build your own index with a low-level library for maximum control" },
    { text: "Add the pgvector extension to the Postgres you already have" },
    { text: "Benchmark five vector databases before writing any code" }
  ]}
  correct={2}
  explanation="pgvector is the boring-tech default: one database to operate, joins with your existing data, transactions, built-in hybrid search, and comfortable scale to tens of millions of chunks. You can always migrate gradually later; you cannot easily un-adopt a complex system you never needed."
/>

<Question
  prompt="Which of these is a legitimate, named reason to move off pgvector to a dedicated vector database?"
  options={[
    { text: "Retrieval feels slow, though nobody has measured where the time goes" },
    { text: "Your corpus is heading past 100 million chunks, or you index millions of new chunks per day" },
    { text: "A dedicated vector database was featured at a conference your team attended" },
    { text: "You want to be prepared in case the app grows later" }
  ]}
  correct={1}
  explanation="The climb must be named and measured: extreme scale, high write throughput, strict tenant isolation, or heavy filtered search. Feelings of slowness are not a reason — measure first, because the bottleneck is often query embedding, chunking, or over-fetching rather than the store."
/>

<Question
  prompt="Why does this page recommend hybrid search (combining keyword and vector search) rather than pure vector search?"
  options={[
    { text: "Pure vector search misses exact-match queries, and hybrid is the consistent winner across corpora" },
    { text: "Hybrid search is cheaper to run than vector search alone" },
    { text: "Vector search cannot handle more than a few thousand documents" },
    { text: "Keyword search alone is always more accurate than vectors" }
  ]}
  correct={0}
  explanation="Vectors capture meaning but can whiff on exact terms like error codes, names, or IDs. Combining a keyword signal with the vector signal consistently beats either alone — and pgvector supports both in a single SQL query."
/>

</Quiz>

→ Next: [Framework pick](./06-framework-pick.md) — when to use LangChain, Vercel AI SDK, OpenAI Agents SDK, or raw.
