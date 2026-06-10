---
id: document-parsing
title: Document parsing
sidebar_position: 11
description: Turning PDFs, HTML, Word, slide decks, and scanned images into clean text and structure for RAG.
---

# Document parsing

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** The unglamorous, quality-defining prerequisite to every RAG system. Bad parsing → bad chunks → bad retrieval → bad answers. Spend more time here than you think you should.

:::tip[In plain English]
A PDF is not text. It's a layout description — fonts, positions, vectors, sometimes raster images. Pulling clean text *and the structure* (headings, tables, lists, page numbers) out of one is genuinely hard. Document parsing is the pipeline that turns "blob.pdf" into "here is a list of clean text chunks, each with its heading and source page." Get this wrong and every other RAG decision is downstream of broken inputs.
:::

## The major options (2026)

| Tool | Type | Strengths | $ shape | Best for |
|------|------|-----------|---------|---------|
| **unstructured** (OSS + API) | Hybrid | Broadest format support | OSS / $0.01 per page hosted | General-purpose default |
| **LlamaParse** | LLM-based hosted | Excellent tables, layout | $0.003–$0.03/page | Complex PDFs, financials |
| **Docling** (IBM) | OSS | Strong PDF + tables, on-prem | free | Compliance, on-prem |
| **Reducto** | Hosted | Tables, forms, accuracy SOTA | $0.005–$0.02/page | Spreadsheets, dense docs |
| **Omni** | Hosted | LLM-vision based | $0.005+/page | Mixed layouts |
| **Mistral OCR** | Hosted | Multimodal LLM OCR | $1 / 1000 pages | Scanned docs, multilingual |
| **AWS Textract** | Cloud | Forms, tables, signatures | $0.0015–$0.05/page | AWS-native pipelines |
| **GCP Document AI** | Cloud | Tuned processors per doc type | tiered | GCP-native; insurance/legal |
| **Azure Document Intelligence** | Cloud | Pre-built models, forms | tiered | Azure-native; receipts/invoices |
| **pypdf / pdfplumber / pdfium** | OSS libs | Lightweight text extract | free | Simple, mostly-text PDFs |
| **Marker** | OSS | PDF → Markdown, fast | free | Markdown-target pipelines |
| **Vision LLM (Claude / GPT / Gemini)** | Hosted LLM | Tables, charts, hand-written | LLM $$ | Edge cases nothing else handles |

## Default pick for most teams

**`unstructured` (open-source library) for the common case, with a fallback to a vision LLM for the pages that look garbled.** It handles PDF / DOCX / HTML / EPUB / images / emails / PPTX out of one API and is well-supported by LlamaIndex and LangChain.

When you hit complex tables or financial PDFs: **LlamaParse** or **Reducto**. Both reliably beat `unstructured` on heavily-tabled documents, and the price is fine at modest scale.

## When to deviate

- **Mostly clean text PDFs** (blog exports, books, papers): **`pypdf`** or **`pdfplumber`** — fast, free, sufficient.
- **Heavily tabular** (10-K filings, lab reports, scientific tables): **LlamaParse**, **Reducto**, or a **vision LLM**.
- **Scanned / hand-written / multilingual OCR**: **Mistral OCR**, **Google Document AI**, or **Claude / Gemini vision**.
- **Compliance / on-prem / air-gapped**: **Docling** or self-hosted **unstructured**.
- **Already in AWS / GCP / Azure**: the native service usually wins on integration.
- **You want Markdown out the other side for an LLM**: **Marker** or **LlamaParse** in Markdown mode.

## Minimum integration

**unstructured — the workhorse:**

```python
from unstructured.partition.auto import partition

elements = partition(filename="report.pdf")
for el in elements:
    print(el.category, "|", el.text[:80])
# Title | Q3 2025 Earnings Report
# NarrativeText | We exceeded expectations...
# Table | <table HTML preserved>
# ...
```

**LlamaParse — when tables matter:**

```python
from llama_parse import LlamaParse

parser = LlamaParse(api_key=os.environ["LLAMA_CLOUD_KEY"], result_type="markdown")
documents = parser.load_data("financial-report.pdf")
print(documents[0].text)  # Markdown with tables, headings preserved
```

**Vision LLM — the last-resort hammer:**

```python
import base64
img = base64.b64encode(Path("page-12.png").read_bytes()).decode()
r = client.messages.create(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img}},
        {"type": "text", "text": "Extract all tables on this page as JSON arrays."},
    ]}],
)
```

## Patterns worth knowing

- **Vision-based extraction is rapidly winning on hard pages.** Giving the page image directly to Claude Sonnet or Gemini 2.5 Pro often beats traditional OCR + parsing on tables and forms — especially in 2026 with native vision.
- **Layout-aware chunking** (keep table rows together, keep headings with their sections, never split mid-sentence) beats naive fixed-token chunking by a lot.
- **Hierarchical chunks** (small chunks for embedding match, larger parent chunks returned to the LLM) is the 2026 best-practice default.
- **Store the original page reference** alongside chunks so you can cite "page 12 of report.pdf" — a non-negotiable UX feature.
- **Parse once, store the structured output.** Don't re-parse on every query.
- **Run a small "is this garbage?" check** after parsing (length > threshold, percent of non-ASCII, etc.). Bad pages happen; catch them at ingest, not at query.

## Pricing & cost notes

Document parsing is sneakily expensive at scale. A 1,000-page corpus:

- **`unstructured` OSS:** free + compute (~$0–$5 on a small VM).
- **`unstructured` API:** ~$10.
- **LlamaParse:** ~$3–$30 depending on mode.
- **Reducto:** ~$5–$20.
- **AWS Textract (tables/forms):** ~$15–$50.
- **Vision LLM (one model call per page):** $20–$100+ depending on model.

For a *one-million-page* enterprise corpus, parsing alone is often the biggest line item — bigger than embeddings, bigger than the LLM. Pick deliberately.

## Pitfalls

- **Treating PDF as text.** It isn't. A "blank-looking" PDF often has 6 invisible columns, footnotes embedded in body text, and tables stored as graphics.
- **Naive fixed-size chunking.** Splitting "Total revenue was" | "$1.2B" across two chunks means the retriever finds half the answer.
- **Ignoring tables until they break things.** Tables are where dollars, dates, and SKUs live. If your domain has tables, evaluate parsers on *your* tables.
- **No page-level provenance.** Users want citations. If you didn't store the page number, you can't show it.
- **Re-parsing on every retrieval.** Parse at ingest, store the result, never re-parse at query time.
- **Trusting one parser for every file type.** A PDF parser does not parse Excel well; an HTML parser does not parse PowerPoint. Route by mime type.
- **No quality canary.** Build a small labeled set of "we know what should come out of these 10 docs" and run it on every parser upgrade — catches silent regressions.

<Quiz id="document-parsing-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Why does the page call document parsing the quality-defining prerequisite of every RAG system?"
  options={[
    { text: "Parsing is the most expensive API call in the stack" },
    { text: "Embedding models only accept Markdown input" },
    { text: "Bad parsing produces bad chunks, which cascade into bad retrieval and bad answers" },
    { text: "Vector databases reject documents that have not been parsed" }
  ]}
  correct={2}
  explanation="Every downstream RAG decision operates on the chunks parsing produced; broken inputs cannot be fixed by better embeddings or prompts. Parsing CAN become the biggest cost line at enterprise scale, but that's a budgeting concern — the durable reason to care is the quality cascade."
/>

<Question
  prompt="Your corpus is regulatory filings dense with financial tables. Which tools does the page steer you toward?"
  options={[
    { text: "pypdf or pdfplumber" },
    { text: "LlamaParse, Reducto, or a vision LLM" },
    { text: "Marker with default settings" },
    { text: "A plain HTML parser routed by mime type" }
  ]}
  correct={1}
  explanation="Heavily tabular documents are where the specialized parsers and vision models reliably beat general-purpose extraction — tables are where dollars, dates, and SKUs live. pypdf and pdfplumber are the right call for mostly-clean text PDFs, which is the opposite of this workload."
/>

<Question
  prompt="Why must you store the source page reference alongside every chunk?"
  options={[
    { text: "Vector databases require a page field in the schema" },
    { text: "Page numbers improve embedding quality" },
    { text: "Reranking models use page position as a feature" },
    { text: "Users want citations like 'page 12 of report.pdf', and you cannot show what you never stored" }
  ]}
  correct={3}
  explanation="Provenance is a non-negotiable UX feature: when the system answers, users need to verify where the claim came from. None of the infrastructure technically requires it — which is exactly why it's easy to skip at ingest and impossible to retrofit at query time."
/>

</Quiz>

---

→ Next: [Synthetic data tools](./synthetic-data-tools.md)
