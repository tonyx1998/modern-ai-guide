---
id: pattern-structured-output
title: Structured output everywhere
sidebar_position: 3
description: JSON / typed objects as the default output shape — not just for "extraction" features.
---

# Structured output everywhere

> **In one line:** If the model's output is read by code, it should be a typed object. If it's read by a human, it should still often be a typed object with a `display_text` field — because *you* still want to log, evaluate, and conditionally render it.

:::tip[In plain English]
"Free-form text" is a debugging tax you pay forever. Every place you parse a model's prose with a regex is a future bug. Make the model fill in a form instead — declare the shape, validate the output, fail loudly when it doesn't match. The few cases where you really do want prose can still come back as one field of an object.
:::

## Why default to structured

- **Composability** with the rest of your code (`result.message`, not `parse(result)`).
- **Built-in validation** — Zod / Pydantic rejects malformed responses *before* they reach your business logic.
- **Cleaner UI** — render `confidence`, `citations`, `next_action` independently.
- **Easier evals** — deterministic checks on field values, no fuzzy string matching.
- **More predictable behavior** — schema-constrained sampling narrows the distribution.

## Common shapes

- **Single-shot extraction** — input text in, structured object out. The classic.
- **Tagged chat response** — `{message: string, confidence: float, citations: SourceId[]}` even for chat.
- **Tool-call style** — `{action: "search" | "answer" | "escalate", payload: ...}`. Union of action types lets one model call drive a state machine.
- **Progressive disclosure** — model emits a summary field first (streams fast) then a detail field.
- **Classification** — `{label: Literal["billing", "technical", "account", "other"], reasoning: str}`. Bounded labels + a reasoning field for evals.

## Worked example — support-ticket triage (TypeScript)

The first layer of our customer-support assistant: route an incoming ticket to the right queue, with a confidence score and a one-line reason. Cheap, fast, fully typed.

```typescript
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const TriageSchema = z.object({
  category: z.enum(['billing', 'technical', 'account', 'feedback', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(200),
  suggested_response_template: z
    .string()
    .nullable()
    .describe('id of a canned response if one applies, else null'),
});

export async function triage(ticket: string) {
  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5'),  // cheap; the task is bounded
    schema: TriageSchema,
    schemaName: 'TicketTriage',
    system:
      'You triage support tickets for Acme Corp. ' +
      'Be conservative with `urgent` — only outage-level issues.',
    prompt: `Ticket:\n${ticket}`,
  });
  return object;  // already typed and validated
}
```

The same task in Python with the OpenAI SDK + Pydantic:

```python
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import Literal

client = OpenAI()

class Triage(BaseModel):
    category: Literal["billing", "technical", "account", "feedback", "other"]
    priority: Literal["low", "normal", "high", "urgent"]
    confidence: float = Field(ge=0, le=1)
    reasoning: str = Field(max_length=200)
    suggested_response_template: str | None

def triage(ticket: str) -> Triage:
    resp = client.responses.parse(
        model="gpt-5-mini",
        input=[
            {"role": "system", "content": "You triage support tickets for Acme. Be conservative with `urgent`."},
            {"role": "user", "content": f"Ticket:\n{ticket}"},
        ],
        text_format=Triage,
    )
    return resp.output_parsed
```

Either way you get a `Triage` object you can route, log, and evaluate directly. No JSON-parsing regex, no "what if the model added a trailing comma."

## What to put in the schema

- **`Literal[...]` / `enum`** for closed sets. The smaller the set, the better the model behaves.
- **Required vs optional fields**, deliberately — every optional field is a place the model can dodge work.
- **Per-field descriptions.** They are prompt-engineering surface, not documentation. `priority: 'urgent' only for outage-level issues` measurably reduces over-escalation.
- **A `confidence` or `uncertain_about` field** when honest uncertainty matters; use it to gate escalations.
- **A `reasoning` or `notes` field**, even if you don't display it — invaluable for debugging and as eval input.

## When to stream structured output

Yes — for any non-trivial object, stream it. Vercel AI SDK's `streamObject` and Pydantic AI's `Agent.run_stream` both emit progressively-valid partial objects:

```typescript
import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  model: anthropic('claude-sonnet-4-5'),
  schema: TriageSchema,
  prompt,
});

for await (const partial of partialObjectStream) {
  render(partial);  // category may be present before priority, etc.
}
```

Renders the `category` chip as soon as it lands; renders `reasoning` while it generates. Same UX win as streaming chat.

## Schema-driven prompt engineering

Once you commit to a schema, the schema *itself* is prompt-engineering surface. Three high-leverage tweaks:

- **Field order matters.** Models tend to fill fields top-down; put fields whose values you want to *condition on* first. A `reasoning` field before a `decision` field measurably improves the decision.
- **Descriptions are instructions.** `priority: z.enum(['low','normal','high','urgent']).describe("'urgent' is for active outages only")` materially reduces over-escalation versus the same enum with no description.
- **Names matter too.** `is_outage` is clearer than `flag1`; `customer_email` is clearer than `email`. The model reads the field names.

The schema and the system prompt should agree. If they conflict, the model picks one and the result is non-deterministic.

## Watch out for

- **Deep nesting and recursion** are flaky across providers. Flatten. `customer.address.line1` is fine; `node.children[].children[].children[]` is not.
- **Constrained sampling is slightly slower** than free generation (~5–20%). Worth it for everything but raw-prose chat.
- **Don't put very long free-form fields in the schema** unless you want long, slow responses. A `summary: string` field of "any length" will reliably bloat to 500 tokens. Cap it: `z.string().max(280)` or describe length expectations in the field description.
- **Schema mismatch on provider migration.** OpenAI strict mode, Anthropic tool-use JSON, and Google `responseSchema` all support slightly different subsets of JSON Schema. Stick to the intersection: object/array/string/number/boolean/enum/`anyOf`/`required`. No `format`, no `pattern`, no advanced refs.
- **Hallucinated enum values.** Even with constrained decoding, in odd edge cases the model picks a value not in your `Literal`. Re-validate at the boundary; treat schema validation as defense-in-depth, not a guarantee.
- **Silent retry loops.** Some SDKs (LangChain, LlamaIndex) silently retry on parse failures, eating cost and latency. Cap retries to 2 and surface failures.

## 2026 stack

| Layer    | Default pick                                                                          |
|----------|---------------------------------------------------------------------------------------|
| Schema (TS) | Zod (with `generateObject` / `streamObject` from the AI SDK). Effect Schema if you're already in the Effect ecosystem. |
| Schema (Py) | Pydantic v2 (with native SDK `responses.parse`, Anthropic `tools`, or Instructor / Pydantic AI). |
| Validation runtime | Zod / Pydantic both. Validate again at the boundary; never trust the SDK alone. |
| Streaming partials | `streamObject` (TS), Pydantic AI `Agent.run_stream` (Py).                 |
| Provider mode | OpenAI Structured Outputs (strict), Anthropic tool use, Google `responseSchema`. |

:::note[Worked example: classification beats prose every time]
A team had a "summary" feature returning free-form text. They added one optional field — `{summary: string, sentiment: 'positive'|'neutral'|'negative', topics: string[]}` — and three weeks later half the product was using the `sentiment` and `topics` fields they hadn't asked for. The model wasn't doing more work; the structure made what it already produced *usable*.

Whenever you're about to ask the model for a paragraph, ask whether 80% of the value is in 3 facts you can extract. The answer is yes more often than you'd think.
:::

## Validation as defense-in-depth

Even with strict structured output, validate *again* at your boundary. Constrained decoding is excellent, but never a guarantee — providers ship bugs, you'll switch models, your schema's JSON-Schema translation isn't always perfectly enforced. The pattern:

```typescript
import { TriageSchema } from './schemas';

const raw = await generateObject({ model, schema: TriageSchema, prompt });
const parsed = TriageSchema.safeParse(raw.object);
if (!parsed.success) {
  metrics.incr('structured_output.invalid', { schema: 'Triage' });
  return fallbackTriage(prompt); // human queue, rule-based default, etc.
}
return parsed.data;
```

The reparse is microsecond-cheap and turns a silent latent bug into a metric you can alert on. Track `structured_output.invalid` per schema — a spike usually means a provider model change you didn't know about.

## Provider matrix

Mode names differ; the concept is the same.

| Provider  | Mode                          | Notes                                             |
|-----------|-------------------------------|---------------------------------------------------|
| OpenAI    | "Structured Outputs" (strict) | `response_format: { type: 'json_schema', json_schema: {..., strict: true} }`. Strict requires every property listed in `required`. |
| Anthropic | Tool use                      | Define a single tool whose input schema is your output schema; force `tool_choice: { type: 'tool', name }`. |
| Google    | `responseSchema`              | Subset of OpenAPI schema. No `anyOf` in `gemini-1.5`; better in 2.x. |
| Mistral   | JSON mode                     | Looser — validate harder.                         |
| Local (vLLM, Ollama) | Grammar / JSON Schema | Use `outlines` / `lm-format-enforcer` for hard constraints. |

For TS, Vercel AI SDK papers over most differences. For Python, Instructor or Pydantic AI do the same.

---

→ Next: [Tool use done right](./tool-use.md).
