---
id: rag-frameworks
title: RAG frameworks
sidebar_position: 8
description: LangChain, LlamaIndex, Haystack, DSPy, Llmware — and when to skip a framework entirely.
---

# RAG frameworks

> **In one line:** Libraries that bundle the RAG pipeline — parsing, chunking, embedding, indexing, retrieving, reranking, prompting, and answering — into reusable abstractions.

:::tip[In plain English]
RAG ("Retrieval-Augmented Generation") is a five-line idea: embed a question, find similar documents, paste them into the prompt, ask the model. A *framework* is a library that turns those five lines into a reusable pipeline with twenty configurable knobs. The win is consistency across features and pre-built integrations to a hundred data sources. The cost is opacity — when retrieval is bad, you're debugging the framework instead of your data.
:::

## The major options (2026)

| Framework | Language | Style | RAG depth | Agents | Best for |
|-----------|---------|-------|----------|--------|---------|
| **LangChain** | Py / TS | "do everything" | broad | yes | Teams that want a one-stop kit |
| **LlamaIndex** | Py / TS | RAG-first | deepest | yes (via LlamaAgents) | Document-heavy, ingestion-heavy |
| **Haystack** (deepset) | Py | Pipelines as DAGs | strong | yes | Production retrieval + custom pipelines |
| **DSPy** (Stanford) | Py | Programmatic, optimized | moderate | yes | Eval-disciplined teams |
| **Llmware** | Py | Enterprise-RAG | strong | partial | On-prem, small-model RAG |
| **txtai** | Py | Embedded | moderate | partial | Lightweight, single-process |
| **Vercel AI SDK + raw code** | TS | DIY | what you build | DIY | TS apps, full control |
| **Pydantic AI + raw code** | Py | DIY + typed | what you build | yes | Typed Python, full control |

## Default pick for most teams

**Build it raw the first time.** A working RAG v0 in pgvector + your LLM SDK is 100–200 lines and teaches you *why* your retrieval misses what it misses. You will reuse this knowledge forever.

Reach for **LlamaIndex** when you're past v0 and you have document ingestion at scale — it has the cleanest connectors for Notion, Confluence, Slack, SharePoint, S3, and the most thoughtful chunking primitives.

Reach for **LangChain** when you want the broadest kitchen-sink toolkit and you'll standardize many AI features on its abstractions. Reach for **DSPy** when your team treats prompts as programs to be compiled against an eval set.

## When to deviate

- **Single RAG feature, short timeline**: raw code beats any framework.
- **20+ document source integrations**: **LlamaIndex** or **LangChain** — the connector libraries are the value.
- **You need a DAG with branches, conditionals, and parallel paths**: **Haystack** pipelines.
- **Your eval suite is mature and you want the prompt to be *optimized* against it, not just versioned**: **DSPy**.
- **On-prem, small-model, regulated environment**: **Llmware** is built for it.
- **Tiny app, embedded, single-process**: **txtai** or raw.

## Minimum integration

**Raw — what every framework is hiding from you:**

```python
def rag_answer(question: str) -> str:
    # 1. embed the question
    q_vec = embed(question)

    # 2. nearest neighbors from pgvector
    chunks = db.execute(
        "SELECT text FROM docs ORDER BY embedding <=> %s LIMIT 5",
        [q_vec],
    ).fetchall()

    # 3. build the prompt
    context = "\n\n".join(c["text"] for c in chunks)
    prompt = f"Answer using only the context.\n\nContext:\n{context}\n\nQ: {question}"

    # 4. call the model
    return llm.complete(prompt)
```

**LlamaIndex — same idea, with built-in chunking and persistence:**

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

docs = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(docs)
engine = index.as_query_engine(similarity_top_k=5)
print(engine.query("How do I rotate the API key?").response)
```

**DSPy — prompts as compiled programs:**

```python
import dspy

class RAG(dspy.Module):
    def __init__(self):
        self.retrieve = dspy.Retrieve(k=5)
        self.generate = dspy.ChainOfThought("context, question -> answer")
    def forward(self, q):
        return self.generate(context=self.retrieve(q).passages, question=q)

# Compile against an eval set; DSPy tunes the prompts for you.
compiled = dspy.BootstrapFewShot(metric=my_metric).compile(RAG(), trainset=examples)
```

## What a framework actually buys you

- **Connectors** to N document sources (S3, Notion, Confluence, Google Drive, Slack, GitHub...) so you don't write 30 parsers.
- **Chunking strategies** (semantic, layout-aware, by-heading, hierarchical) — non-trivial to get right.
- **Index abstractions** that let you swap vector DBs in one line.
- **Reranking, hybrid search, query rewriting** as pre-built primitives.
- **A standard project shape** so a new engineer can find their way around.

If you don't need any of those, you don't need the framework.

## Pricing & cost notes

All major RAG frameworks are open-source and free at the code layer. The cost is in what they call: embeddings, vector DB, LLM, parsing service. Most also offer **hosted control planes** (LangSmith, LlamaCloud, Haystack Cloud, DSPy with paid evaluators) that bundle observability + a managed orchestrator — typically $0–$500/mo for small teams, usage-based at scale.

## Pitfalls

- **Adopting a framework before you've shipped RAG once.** You can't tell which abstractions are useful vs in-the-way until you've built it raw.
- **Trusting framework defaults for chunking.** "1000-token splits with 200 overlap" is fine for blog posts and terrible for financial PDFs. Measure retrieval quality on *your* data.
- **Hiding the prompt.** Every RAG framework eventually constructs a prompt that goes to the LLM. If you can't print it, you can't debug it. Always know how to dump the final prompt.
- **Skipping reranking.** The single biggest RAG quality win is a cross-encoder rerank on top-50 → top-5. Most frameworks support it; most tutorials skip it.
- **No evals.** A RAG framework with no eval set is a black box you tune by vibes. Wire in Promptfoo or Ragas from day one.
- **Mixing frameworks.** LangChain orchestrating LlamaIndex inside a Haystack pipeline is a debugging nightmare. Pick one.
- **Using LangChain as your LLM SDK.** It's heavy; you pay a 50MB+ dependency for what `@ai-sdk/anthropic` does in 200KB. Use a real SDK for plain LLM calls and reach for LangChain only when the higher-level primitives earn their keep.

---

→ Next: [Agent frameworks](./agent-frameworks.md)
