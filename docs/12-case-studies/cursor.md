---
id: case-cursor
title: Cursor
sidebar_position: 2
description: IDE-native coding assistant. The context-retrieval + apply-diff + predictive-autocomplete pattern, reconstructed from public sources.
---

# Case study: Cursor

> **In one line:** Cursor is a VS Code fork with three tightly-coupled AI surfaces — predictive autocomplete (Cursor Tab), chat with codebase context (Cmd-K / Cmd-L), and agent mode (Composer) — and the engineering interesting bit is how it retrieves the *right* code into context within a tight latency budget across all three surfaces.

:::tip[In plain English]
Cursor is a code editor with AI built into every part of it — it predicts your next edit as you type, answers questions about your codebase, and can make changes across many files at once. The hard engineering problem isn't the AI itself but feeding the model the right slice of a huge codebase fast enough that the tool never feels slow. Study this page because its core patterns — different models for different speed needs, indexing a codebase several ways at once, and applying edits as reviewable diffs — show up in almost every serious AI product, not just code editors.
:::

## The product

A code editor with AI deeply integrated, not bolted on. Three primary AI features:

- **Tab autocomplete** — model predicts your next edit (could be multi-line, multi-cursor) as you type.
- **Chat with the codebase** — ask a question with `@-mentions` of files/folders/symbols; model answers using retrieved context.
- **Agent / Composer** — multi-file edits across the project, run-and-verify loop.

The company's wedge was making AI *fast enough* and *integrated enough* that engineers don't context-switch out of the editor.

## Architecture

```mermaid
flowchart LR
    U[User keystroke<br/>or chat msg] --> C[Cursor client<br/>VS Code fork]
    C --> R[Retrieval layer]
    R --> I[(Codebase index<br/>embeddings + AST)]
    R --> G[(Git state)]
    R --> RC[Recent context<br/>cursor pos, open files]
    C --> CC[Context assembly]
    CC --> M[Model router]
    M --> S[Sonnet / GPT-4-class<br/>for chat & agent]
    M --> F[Fast model<br/>for tab autocomplete]
    F --> C
    S --> C
    C --> A[Apply diff<br/>w/ user approval]
```

Five layers: client (the fork), retrieval, context assembly, model routing, diff application. Each surface (Tab, Chat, Composer) uses all five with different latency budgets.

## Key engineering decisions

### 1. Three model tiers for three surfaces

- **Tab autocomplete** uses a custom-trained fast model (sub-200ms response). Cursor has talked publicly about training their own for this — the latency budget can't fit a frontier model call.
- **Chat (Cmd-L)** uses frontier models — Claude Sonnet, GPT-4-class — via direct provider APIs.
- **Agent / Composer** uses the same frontier models but in a multi-step loop with apply-diff verification.

The split matters because trying to use a frontier model for autocomplete would feel slow and wreck the UX. Trying to use a fast model for agent work would produce bad multi-file edits. Three surfaces, three model tiers, one cohesive product.

### 2. Codebase indexing happens locally + remote

Cursor builds an index of your repo combining:

- **Embeddings of chunks** — for semantic retrieval ("where is auth handled?").
- **Symbol/AST data** — for precise lookups ("definition of `parseToken`").
- **File metadata** — paths, git status, recency.

The trade-off they've discussed: shipping the index *to their servers* (for the strongest model and cheapest indexing) vs. *keeping it local* (for privacy / enterprise compliance). Their solution is a hybrid — opt-in for higher-quality retrieval, with a privacy mode that keeps embeddings local.

### 3. Apply-diff with anchor verification

When the model proposes an edit, Cursor doesn't blindly overwrite — it shows a diff for user review. Under the hood, the diff is anchored by surrounding context lines, and if those lines have drifted (because you typed something else), the apply step asks the model to re-emit the edit with current context.

This is the unsexy engineering that makes "the AI edits your code" not become "the AI corrupts your code."

## Stack snapshot (2026)

- **Models:** Anthropic Claude Sonnet 4.6, OpenAI GPT-5-class for chat/agent; custom fast model for Tab.
- **Editor:** VS Code fork (forked, not extension — gives deep control over rendering and shortcuts).
- **Indexing:** internal — embeddings + Merkle tree of repo state for incremental updates.
- **Inference:** primarily direct from model providers; some self-hosted for the fast model.
- **Observability / evals:** internal tooling (publicly discussed but not branded).

## What to copy

- **Latency-tier your models by surface.** If you have a feature that needs &lt;300ms and a feature that can wait 5s, they don't use the same model.
- **Index the repo as multiple representations.** Embeddings alone miss exact-symbol lookups; AST/symbol alone misses semantic queries. Combine.
- **Apply diffs, don't write files.** Show the user a diff for approval, anchor by context, re-emit if anchors drift.
- **Local-first when the user cares.** Enterprise contracts often hinge on whether you can run without sending code to a third party.

## What to avoid

- **Trying to use one model for everything.** Tab and Composer have incompatible requirements.
- **Embedding-only retrieval.** Symbol search by grep / LSP catches what embeddings miss.
- **Writing your own editor from scratch.** The VS Code fork strategy works; "make an editor with AI in it" has killed many startups. Build on shoulders.
- **Skipping the index-staleness problem.** A stale index produces confidently wrong answers. Hash the repo state into your retrieval cache key.

:::caution[What people get wrong when copying this]
- **Copying the stack snapshot instead of the shape.** The durable lesson is the five-layer architecture (client, retrieval, context assembly, model routing, diff apply) — not which specific models Cursor happens to use this quarter.
- **Underestimating the fast-model problem.** Teams bolt a frontier model onto autocomplete, get 2-second completions, and conclude "users don't want AI autocomplete" — when the real issue was the latency budget.
- **Shipping embeddings-only retrieval because it demos well**, then discovering exact-symbol lookups fail in ways users notice immediately.
- **Skipping the anchor-drift and index-staleness work** because it's invisible in a demo. That unsexy machinery is exactly what separates a toy from a product.
:::

## Sources

- Cursor's engineering blog: cursor.com/blog (Tab autocomplete training, indexing strategy posts).
- AI Engineer Summit talks by Cursor founders (2024–2026).
- Founder interviews on Lex Fridman, Lenny's Podcast, Latent Space.
- Public discussion in Cursor's Discord / forum about retrieval and apply-diff.

<Quiz id="case-cursor-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Why does Cursor use three different model tiers for Tab autocomplete, Chat, and Composer instead of one model for everything?"
  options={[
    { text: "Each surface is owned by a different team with its own provider contract" },
    { text: "It lets Cursor charge separately for each feature" },
    { text: "The surfaces have incompatible requirements - autocomplete needs sub-200ms responses a frontier model cannot hit, while agent work needs quality a fast model cannot deliver" },
    { text: "Using multiple providers avoids rate limits on any single API" }
  ]}
  correct={2}
  explanation="The split is driven by latency and quality budgets. A frontier model is too slow for keystroke-level autocomplete, and a fast model produces bad multi-file edits. Latency-tiering models by surface is the durable lesson: features with different latency budgets should not share a model."
/>

<Question
  prompt="Why does Cursor's codebase index combine embeddings, AST/symbol data, and file metadata rather than relying on embeddings alone?"
  options={[
    { text: "Each representation catches what the others miss - embeddings handle semantic queries while symbol data handles precise lookups like a function definition" },
    { text: "Embeddings are too expensive to compute for an entire repository" },
    { text: "AST data is required for the editor to render syntax highlighting" },
    { text: "Embeddings cannot be stored locally, so a fallback is needed for privacy mode" }
  ]}
  correct={0}
  explanation="Embedding similarity alone misses exact-symbol lookups, and symbol search alone misses semantic questions like 'where is auth handled?'. Combining multiple representations of the same repo is the pattern to copy for any code-retrieval system."
/>

<Question
  prompt="In Cursor's apply-diff design, what happens when the context lines anchoring a proposed edit have drifted because the user kept typing?"
  options={[
    { text: "The edit is applied anyway at the original line numbers" },
    { text: "The user is asked to manually merge the conflicting changes" },
    { text: "The edit is silently discarded and the user must re-ask" },
    { text: "The apply step asks the model to re-emit the edit using the current file contents" }
  ]}
  correct={3}
  explanation="Diffs are anchored by surrounding context lines, and if those anchors no longer match, the model re-emits the edit against current context. This verification step is what keeps 'the AI edits your code' from becoming 'the AI corrupts your code'."
/>

</Quiz>

---

→ Next: [Claude Code](./claude-code.md)
