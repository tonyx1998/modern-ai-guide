---
id: pattern-rag-prod
title: The RAG pattern in production
sidebar_position: 5
description: Hybrid search, reranking, metadata filtering, citations, evals. The differences between a RAG demo and a RAG product.
---

# The RAG pattern in production

> **In one line:** A production RAG pipeline is hybrid search, a reranker, per-tenant filters, citation validation, and *separate* evals for retrieval vs generation — not "embed and cosine-search."

:::tip[In plain English]
A RAG demo embeds your docs, finds the closest 5 by cosine similarity, and stuffs them in the prompt. That works on a 50-doc corpus and a friendly demo question. In production, the question is "show me the refund policy for Pro plans in German" and "closest 5 by cosine" returns five chunks about *cancellation*. The fixes — keyword + vector together, a reranker, metadata filtering, layout-aware chunking, source-citation enforcement — are what turns the demo into a feature.
:::

## What changes from demo to prod

- **Hybrid search** (BM25 + vector) replaces pure vector. Big quality win, especially on rare terms (SKUs, error codes, names).
- **Reranker** over the top 50 candidates (Cohere Rerank, BGE reranker, Voyage rerank) narrows to the top 5. Another big quality win.
- **Pre-filtering** by tenant, language, freshness, ACL. Faster and more accurate than post-filtering.
- **Layout-aware chunking** beats fixed-token chunking on documents with structure (headings, tables, lists).
- **Citation enforcement** — the model must cite source IDs from the provided context only. *Validate that the cited IDs are in the retrieved set.*
- **"I don't know" calibration** — the model must say "the docs don't contain this" rather than hallucinate. Top-chunk distance threshold is a cheap defense.
- **Source authorization** — RAG retrieval respects the *user's* permissions, not just "is the doc in the index." (See [safety](./11-safety-privacy.md).)

## The 2026 RAG architecture

```mermaid
flowchart LR
    Q[User query] --> R{Rewrite/<br/>decompose?}
    R --> H[Hybrid search<br/>BM25 + vector]
    H --> F[Filter:<br/>tenant, lang, ACL, freshness]
    F --> RR[Reranker<br/>top 50 → top 5]
    RR --> P[Prompt assembly<br/>+ cite-only-these-IDs]
    P --> G[LLM generate<br/>structured: {answer, cited_ids}]
    G --> V{Citations<br/>valid?}
    V -->|yes| O[Return + log]
    V -->|no| X[Retry / hedge / fallback]
```

1. Ingestion pipeline (parse → chunk → embed → index) with idempotent re-runs.
2. Hybrid index (vector + BM25) with per-tenant / per-language filtering.
3. Query understanding (rewrite, decompose, or expand the query).
4. Retrieval (top 50).
5. Reranker (top 5).
6. Prompt assembly with citations + "I don't know" instruction.
7. LLM generation with structured output (`{answer, cited_ids}`).
8. Citation validation (every cited ID must be in the retrieved set).
9. Eval suite scoring retrieval and generation independently.

## Worked example — support RAG with citations (Python)

The second layer of the support assistant. pgvector + BM25 in Postgres, Cohere rerank, Pydantic-typed output.

```python
from openai import OpenAI
from pydantic import BaseModel
import cohere, psycopg

client = OpenAI()
co = cohere.Client()

class Answer(BaseModel):
    text: str
    cited_chunk_ids: list[str]
    confident: bool

def embed(text: str) -> list[float]:
    return client.embeddings.create(
        model="text-embedding-3-small", input=text
    ).data[0].embedding

def retrieve(query: str, tenant_id: str, lang: str = "en") -> list[dict]:
    qvec = embed(query)
    with psycopg.connect(DSN) as conn:
        # hybrid search: union of vector top-50 and BM25 top-50, then dedup
        rows = conn.execute("""
            WITH vec AS (
              SELECT id, content, doc_title, doc_url
              FROM chunks
              WHERE tenant_id = %s AND lang = %s
              ORDER BY embedding <=> %s
              LIMIT 50
            ),
            kw AS (
              SELECT id, content, doc_title, doc_url
              FROM chunks
              WHERE tenant_id = %s AND lang = %s
                AND ts @@ plainto_tsquery('english', %s)
              ORDER BY ts_rank(ts, plainto_tsquery('english', %s)) DESC
              LIMIT 50
            )
            SELECT DISTINCT * FROM (SELECT * FROM vec UNION SELECT * FROM kw) u
        """, (tenant_id, lang, qvec, tenant_id, lang, query, query)).fetchall()
    return [dict(zip(["id", "content", "doc_title", "doc_url"], r)) for r in rows]

def rerank(query: str, candidates: list[dict], k: int = 5) -> list[dict]:
    docs = [c["content"] for c in candidates]
    res = co.rerank(model="rerank-english-v3.0", query=query, documents=docs, top_n=k)
    return [candidates[r.index] for r in res.results]

def answer(query: str, tenant_id: str) -> Answer:
    candidates = retrieve(query, tenant_id)
    if not candidates:
        return Answer(text="I don't have information on that.", cited_chunk_ids=[], confident=False)

    top = rerank(query, candidates, k=5)
    context = "\n\n---\n\n".join(
        f"[{c['id']}] ({c['doc_title']})\n{c['content']}" for c in top
    )
    resp = client.responses.parse(
        model="gpt-5-mini",
        text_format=Answer,
        input=[
            {"role": "system", "content":
              "Answer using ONLY the provided context. "
              "Cite each fact by [chunk_id]. "
              "If the context does not contain the answer, set confident=false "
              "and say so plainly. Do not invent."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
        ],
    )
    a = resp.output_parsed
    # validate every cited id was actually in the retrieved set
    valid_ids = {c["id"] for c in top}
    a.cited_chunk_ids = [cid for cid in a.cited_chunk_ids if cid in valid_ids]
    return a
```

Five things to notice:

1. Pre-filter by `tenant_id` and `lang` *in the SQL*, before the vector search runs.
2. Hybrid query: vector top-50 ∪ BM25 top-50, then deduped.
3. Reranker collapses 50 → 5 by *true* relevance.
4. Structured output with `confident` flag — the prompt and schema cooperate to defend against hallucination.
5. Citation IDs are validated against the retrieved set. The model *can't* invent a source ID and have it pass.

## Evals: split retrieval and generation

- **Retrieval evals**: "given query X, did the top K contain doc Y?" → mean reciprocal rank, recall@K.
- **Generation evals**: "given the retrieved context, did the model produce a faithful answer?" → LLM-as-judge, exact-match for facts.

Treat them separately — a bad answer might be a retrieval problem (the right chunk wasn't in the top 5) or a generation problem (the right chunk *was* there and the model still got it wrong). You need to know which.

## Watch out for

- **Chunk size that ignores document structure.** Fixed 500-token chunks split mid-sentence and lose section headings. Use the document's structure: one chunk per H2/H3 section, or layout-aware tools (Unstructured, Reducto, AWS Textract layout mode).
- **No metadata.** A chunk without `doc_title`, `doc_url`, `last_updated`, `tenant_id`, `lang` is a chunk you can't filter, cite, or audit. Store metadata at ingestion; never reconstruct it.
- **Re-embedding everything on a model change.** It's expensive; treat embedding-model migration as a deliberate, batched, cheap-tier event with rollback.
- **Cosine on unnormalized vectors.** Cosine assumes unit length. Some providers don't normalize. Match the distance metric to the provider's docs (or normalize at ingest).
- **Stuffing 20 chunks into context.** "Lost in the middle" is real — chunks 8-15 are effectively ignored. Top 5 reranked beats top 20 raw, on both quality and cost.
- **Trusting the model to obey "only cite from the context."** It will, *mostly*. Validate the citations against the retrieved set in code.
- **Treating retrieval as static.** Your corpus changes; your relevance changes. Add new prod queries to the eval set monthly.

## 2026 stack

| Layer       | Default pick                                                                            |
|-------------|-----------------------------------------------------------------------------------------|
| Vector DB   | pgvector (under ~10M vectors). Pinecone / Qdrant / Weaviate / Turbopuffer above that.   |
| Keyword     | Postgres `tsvector` + GIN index. OpenSearch / Elastic at large scale.                  |
| Embeddings  | OpenAI `text-embedding-3-small` (cheap default). Voyage `voyage-3` if quality-bound.    |
| Reranker    | Cohere Rerank 3, Voyage Rerank, BGE Rerank (self-hosted).                              |
| Chunking    | Layout-aware: Unstructured, Reducto, LlamaParse. Otherwise: split on H2/H3 + 500-token cap. |
| Framework   | LlamaIndex (Py) for pipelines; Vercel AI SDK + custom code (TS).                        |

## Chunking strategies

The most common RAG quality bug isn't the model — it's that the *chunks themselves* are incoherent. Common patterns, roughly in order of preference:

- **Section-aware (H1/H2/H3).** One chunk per heading section, with the heading prepended. Best for structured docs.
- **Sliding window with overlap.** Fixed-token chunks (e.g., 500 tokens) with 50-token overlap so context isn't lost at boundaries. Easiest to implement; works on prose.
- **Layout-aware (Unstructured, Reducto, LlamaParse).** Tables, lists, headings, and figures preserved as semantic units. Best for PDFs and slide decks.
- **Recursive splitter (LangChain).** Splits on paragraph → sentence → token boundaries in order. Reasonable default for mixed corpora.
- **One-doc-per-chunk** for short docs (< 1k tokens). No splitting needed.

A practical rule: read the chunks your retriever returns for ten real queries. If a human can answer the question from the chunk alone, you're fine. If not, fix the chunking — usually before swapping models.

:::note[The cheapest RAG quality win you haven't shipped yet]
If your RAG is "embed + cosine + top 5" today, the highest-leverage single change is almost always **adding a reranker on the top 50 candidates**. It's one API call, costs sub-cent per query, and routinely improves answer quality more than swapping the generation model.

The second-highest is **adding BM25 alongside vector search**. Together, hybrid + rerank usually clears the gap between "demo-quality" and "actually-useful."
:::

---

→ Next: [The agent loop with guardrails](./agent-loop.md).
