---
id: solo-templates
title: Starter Templates
sidebar_position: 16
sidebar_label: 15. Templates
description: Four solo-AI starter templates — streaming chat, RAG over docs, structured-output classifier, narrow agent. Each shippable in an afternoon.
---

# Starter Templates

> **In one line:** Four templates, each ~150 lines, each shippable in an afternoon. Pick the one that matches your project shape and skip the from-scratch friction.

:::tip[In plain English]
"Templates" in solo AI mean the simplest possible working skeleton for each common project shape. They're meant to be *read*, not installed blindly. Copy the pattern, paste into your own repo, rewrite as needed. The point is to skip the "how do I structure this" friction and go straight to the prompt.
:::

## Template 1: Streaming chat

**Project shape:** Single-prompt tool (Shape 1 from [project-types](./02-project-types.md)). Text in, streaming text out.

**Files:**

```
prompts/main.md
eval.csv
eval.ts
app/api/chat/route.ts
app/page.tsx
```

**The route:**

```typescript
// app/api/chat/route.ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";
import { ratelimit } from "@/lib/ratelimit";
import fs from "node:fs";

const SYSTEM = fs.readFileSync("prompts/main.md", "utf8");

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const { success } = await ratelimit.limit(userId);
  if (!success) return new Response("rate limited", { status: 429 });

  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: SYSTEM,
    messages,
    maxTokens: 1024,
  });

  return result.toDataStreamResponse();
}
```

**The UI:**

```tsx
// app/page.tsx
"use client";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat();
  return (
    <div className="mx-auto max-w-2xl p-6">
      {messages.map(m => (
        <div key={m.id} className="my-2 whitespace-pre-wrap">
          <b>{m.role}:</b> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input className="flex-1 border p-2" value={input} onChange={handleInputChange} />
        <button className="border px-3">Send</button>
        {isLoading && <button type="button" onClick={stop}>Stop</button>}
      </form>
    </div>
  );
}
```

That's the whole template. ~80 lines, working chat, streaming, with auth and rate limits.

## Template 2: RAG over a small document corpus

**Project shape:** Niche RAG (Shape 2). Embed once, query repeatedly.

**Stack:** Supabase + pgvector. Embeddings via OpenAI's `text-embedding-3-small` ($0.02 / 1M tokens).

**Ingest script (one-time):**

```python
# ingest.py
import os, glob
from supabase import create_client
from openai import OpenAI

sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
oa = OpenAI()

def chunk(text, size=800, overlap=100):
    for i in range(0, len(text), size - overlap):
        yield text[i:i + size]

for path in glob.glob("docs/**/*.md", recursive=True):
    text = open(path).read()
    for i, c in enumerate(chunk(text)):
        emb = oa.embeddings.create(model="text-embedding-3-small", input=c).data[0].embedding
        sb.table("chunks").insert({"source": path, "ord": i, "text": c, "embedding": emb}).execute()
```

**Query route:**

```typescript
// app/api/ask/route.ts
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@/lib/openai-embed";

export async function POST(req: Request) {
  const { question } = await req.json();

  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const queryVec = emb.data[0].embedding;

  const { data: hits } = await supabaseAdmin.rpc("match_chunks", {
    query_embedding: queryVec,
    match_count: 5,
  });

  const context = hits.map(h => `[${h.source}]\n${h.text}`).join("\n\n---\n\n");

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    system: "Answer using ONLY the provided context. Cite sources in brackets.",
    prompt: `Context:\n${context}\n\nQuestion: ${question}`,
  });

  return Response.json({ answer: text });
}
```

**Schema (run once):**

```sql
create extension if not exists vector;
create table chunks (
  id bigserial primary key,
  source text, ord int, text text,
  embedding vector(1536)
);
create function match_chunks(query_embedding vector(1536), match_count int)
returns table (id bigint, source text, text text, similarity float)
language sql as $$
  select id, source, text, 1 - (embedding <=> query_embedding) as similarity
  from chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

~120 lines including SQL. RAG, working, on free tier.

## Template 3: Structured-output classifier

**Project shape:** Tool that takes text in and returns a typed JSON object out. Reliable enough to wire into other code.

```typescript
// app/api/classify/route.ts
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const schema = z.object({
  category: z.enum(["bug", "feature_request", "question", "spam", "other"]),
  urgency: z.enum(["low", "medium", "high"]),
  summary: z.string().max(200),
  requires_human: z.boolean(),
});

export async function POST(req: Request) {
  const { text } = await req.json();

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-5"),
    schema,
    system: "You triage incoming support messages. Return the structured classification.",
    prompt: text,
  });

  return Response.json(object);
}
```

The Vercel AI SDK's `generateObject` plus Zod handles the schema validation. If the model returns malformed JSON, it retries with the validation error. ~30 lines. Useful for any "categorize / extract / triage" project.

Python equivalent with `instructor`:

```python
from instructor import from_anthropic
from anthropic import Anthropic
from pydantic import BaseModel

class Triage(BaseModel):
    category: str
    urgency: str
    summary: str
    requires_human: bool

client = from_anthropic(Anthropic())

def classify(text: str) -> Triage:
    return client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=512,
        messages=[{"role": "user", "content": text}],
        response_model=Triage,
    )
```

## Template 4: Narrow agent (one to three tools)

**Project shape:** Single user input → agent uses 1–3 specific tools you've wired → returns one result.

**Important:** all the guardrails from [pitfalls #5](./14-pitfalls.md) are baked in.

```typescript
// app/api/agent/route.ts
import { generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const tools = {
  search: tool({
    description: "Search the web for a query and return top 5 result titles + URLs",
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      // call your search API of choice
      const res = await fetch(`https://api.search.brave.com/...&q=${query}`);
      const data = await res.json();
      return data.web.results.slice(0, 5).map(r => ({ title: r.title, url: r.url }));
    },
  }),
  fetch_page: tool({
    description: "Fetch the readable text of a URL.",
    parameters: z.object({ url: z.string().url() }),
    execute: async ({ url }) => {
      const res = await fetch(url);
      const html = await res.text();
      return html.slice(0, 8000); // hard cap, never feed an unbounded page back
    },
  }),
};

export async function POST(req: Request) {
  const { task } = await req.json();

  const { text, toolCalls } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    system: "You are a research agent. Use at most 3 tool calls to answer the user's task. Be concise.",
    prompt: task,
    tools,
    maxSteps: 4,        // hard cap — never remove
    maxTokens: 2048,    // per generation
  });

  return Response.json({ result: text, toolCalls });
}
```

`maxSteps: 4` is the cap; the model gets one initial call + 3 tool-result loops, then stops. No infinite loop possible. Tool outputs are size-capped (the `html.slice(0, 8000)`). This is a *narrow* agent — not autonomous, not multi-step research; one task, ≤3 tool calls, done.

## Other templates worth knowing (don't reproduce here)

- **Vercel AI Chatbot** — fuller Next.js + auth + chat history.
- **Modal LLM Engine examples** — Python-side patterns for batch, streaming, GPU.
- **Supabase AI templates** — official RAG starters using pgvector.
- **Pinecone Canopy** / **LlamaIndex starters** — if you outgrow pgvector and need a dedicated vector DB.

Open the source. Read it. Steal the useful patterns. Don't `npm install` a template you can't follow end-to-end — see [pitfalls](./14-pitfalls.md) on opaque templates.

:::note[Worked example: choosing a template]
Idea: "Paste a PDF, get a 1-page summary."

- Pure single-prompt? PDF text → summary. Template 1 (streaming chat) with the input replaced by a file upload + extraction. ~100 lines.
- Need RAG? No, the summary is over the *whole* doc, not Q&A. Skip Template 2.
- Need structured output? Maybe — a `{summary, key_points[], risk_flags[]}` JSON is more useful than free text. Template 3 fits.
- Agent? No, deterministic flow.

Decision: Template 1 for the streaming UI, Template 3 for the structured output. Combine into ~150 lines of TS. One afternoon.
:::

:::info[Highlight: templates are starting points, not endpoints]
The four templates here are *patterns*, not products. Don't try to extend one of them with twelve features into your final product. Use them to skip the boilerplate of an empty project — then prune everything you don't need and write the prompt that's the actual differentiator.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Adopting a template you can't read end-to-end.** When something breaks in prod, "I have no idea, the template does it" is a time bomb. The fix is to spend an evening reading the template's full source before committing to it.
- **Picking a heavy template "in case you need the features."** A chat starter with 12 routes is harder to prune than to write from this page. The fix is to start with the ~80-line versions here; add features only when needed.
- **Mixing templates.** Trying to combine Template 4 (agent) with Template 2 (RAG) before either works standalone. The fix is to ship one template's worth of complexity at a time.
- **Treating the templates as production-ready.** They omit error handling, retries, and observability for clarity. The fix is to add the patterns from [observability](./10-observability.md) and the kill switches from [pitfalls](./14-pitfalls.md) before going live.
:::

## Page checkpoint

Self-check:

- Did you identify which of the four templates fits your project?
- Could you explain the auth + rate-limit flow in your chosen template line by line?
- Did you delete the parts you don't need before adding the parts you do?

## What's next

→ Continue to [Sample Project](./16-sample-project.md) where we'll walk through one end-to-end build — code, costs, deploy, and first users — for an "AI meeting-notes summarizer."
