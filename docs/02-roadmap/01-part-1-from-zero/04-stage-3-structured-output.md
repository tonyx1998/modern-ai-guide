---
id: stage-3-structured-output
title: Stage 3 — Structured output
sidebar_position: 4
sidebar_label: Stage 3 — Structured output
description: Extract typed, validated data from messy text. The single highest-leverage AI pattern — half of all production AI features are this.
---

# Stage 3 — Structured output

> **Time budget:** ~3–5 days

> **In one line:** Get the model to return a schema-validated object, not free-form text — the pattern that turns LLMs into reliable function-shaped components.

This is the most undersold stage in the roadmap. Once you can reliably get `{category, priority, summary, confidence}` back from a model — typed, validated, schema-checked — an enormous fraction of "AI features" reduce to a one-call function. Ticket triage, intent classification, form auto-fill, entity extraction, content moderation, sentiment, code review heuristics — same pattern.

:::tip[In plain English]
Free-form text from an LLM is hard to use in code: you have to parse it, hope it's well-formed, handle edge cases. Structured output flips this — you tell the model "return JSON matching this exact schema," and the provider's machinery (constrained decoding, JSON mode, function-calling under the hood) guarantees you get back something you can parse. Failure modes shrink from "model said something weird" to "model said something I can validate and re-prompt about."
:::

## 1. The shape of the problem

Goal: paste in a customer support email; get back a typed object you can route on.

```python
{
  "category": "billing",        # one of a closed set
  "priority": "high",            # one of: low | medium | high | urgent
  "summary": "Customer charged twice for September subscription.",
  "needs_human": True,
  "confidence": 0.9,
}
```

Doing this with raw text + regex is misery: the model might say "Category: billing." or "**billing**" or "billing\n\n" or "I think this is billing, possibly account." Schema-constrained generation removes the entire class of parsing bugs.

## 2. Three ways to get structured output

In ascending order of reliability:

| Approach | Reliability | Notes |
|----------|-------------|-------|
| "Reply in JSON" prompt + `json.loads()` | ~80% | Model usually obliges; sometimes wraps in markdown fence; rarely emits trailing commas |
| `response_format={"type": "json_object"}` (OpenAI JSON mode) | ~98% | Guarantees valid JSON syntax — not schema correctness |
| `response_format={"type": "json_schema", ...}` (OpenAI Structured Outputs) / Anthropic tool-output-as-schema / Pydantic AI | ~99.9% | Provider enforces the schema during decoding — invalid outputs are impossible by construction |

Always use option 3 when available. Options 1 and 2 are fallbacks for older models or providers that don't yet support strict schemas.

## 3. The Python version (with Pydantic)

```python
# stage-3/triage.py
from typing import Literal
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()


class TriageResult(BaseModel):
    category: Literal["billing", "technical", "account", "feedback", "other"]
    priority: Literal["low", "medium", "high", "urgent"]
    summary: str = Field(description="One sentence summary of the ticket.")
    needs_human: bool = Field(description="True if a human agent should look at this before the bot replies.")
    confidence: float = Field(ge=0.0, le=1.0, description="Model's confidence in this classification, 0-1.")


SYSTEM = """You triage incoming customer support emails.
Return your analysis using the provided schema.
If you're unsure, lower your confidence and set needs_human=true."""


def triage(email_body: str) -> TriageResult:
    completion = client.chat.completions.parse(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": email_body},
        ],
        response_format=TriageResult,
    )
    return completion.choices[0].message.parsed


if __name__ == "__main__":
    email = """Hi, I was charged twice for my September subscription -
    once on the 1st and once on the 5th. Card ending 4242. Please refund."""
    result = triage(email)
    print(result.model_dump_json(indent=2))
```

`client.chat.completions.parse` (in `openai>=1.40`) auto-converts the Pydantic class into a JSON schema, passes it to the API with `strict: true`, and returns the parsed Pydantic instance directly. No `json.loads`, no schema-validation in your code — the parsed object is guaranteed to satisfy the schema.

## 4. The TypeScript version (with Zod)

```ts
// stage-3/triage.ts
import "dotenv/config";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const client = new OpenAI();

const TriageResult = z.object({
  category: z.enum(["billing", "technical", "account", "feedback", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  summary: z.string().describe("One sentence summary."),
  needs_human: z.boolean(),
  confidence: z.number().min(0).max(1),
});

type TriageResult = z.infer<typeof TriageResult>;

const SYSTEM = `You triage incoming customer support emails.
Return your analysis using the provided schema.`;

export async function triage(emailBody: string): Promise<TriageResult> {
  const completion = await client.chat.completions.parse({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: emailBody },
    ],
    response_format: zodResponseFormat(TriageResult, "triage"),
  });
  return completion.choices[0].message.parsed!;
}

// usage
const result = await triage("I was charged twice for September...");
console.log(result);
```

`zodResponseFormat` converts your Zod schema to a JSON schema, sets the API's `strict: true` flag, and TypeScript gets full inference on `parsed`. The model literally cannot return shapes that fail validation.

## 5. The mental shift

A regular LLM call gives you text. A structured-output call gives you a **typed value**. That changes the surrounding code:

```python
# Before: parse + branch on strings
text = response.choices[0].message.content
if "billing" in text.lower():
    route_to_billing(text)
elif "technical" in text.lower():
    route_to_tech(text)
# ... brittle, breaks on phrasing changes

# After: switch on enums
match result.category:
    case "billing": route_to_billing(result)
    case "technical": route_to_tech(result)
    case "account": route_to_accounts(result)
# ... refactor-safe, type-checked, exhaustive
```

You're no longer doing NLP in your application code; the model handed you a struct.

## 6. Building an eval *now* (yes, already)

The whole point of structured output is reliability. The only way to measure reliability is an eval. Stage 6 will make this rigorous; here, do the lite version:

```python
# stage-3/eval.py
import json
from triage import triage

CASES = [
  {
    "id": "billing-001",
    "email": "I was charged twice for September.",
    "expected": {"category": "billing", "priority": "high"},
  },
  {
    "id": "tech-001",
    "email": "The dashboard won't load on Safari.",
    "expected": {"category": "technical", "priority": "medium"},
  },
  {
    "id": "feedback-001",
    "email": "Just wanted to say I love the new UI.",
    "expected": {"category": "feedback", "priority": "low"},
  },
  # ... add 10-20 more cases
]


def run_eval():
    passed, failed = 0, 0
    for case in CASES:
        result = triage(case["email"])
        ok = all(
            getattr(result, k) == v
            for k, v in case["expected"].items()
        )
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"FAIL [{case['id']}]: expected {case['expected']}, got "
                  f"{{'category': '{result.category}', 'priority': '{result.priority}'}}")
    print(f"\n{passed}/{passed+failed} passed")


if __name__ == "__main__":
    run_eval()
```

This is *the eval mindset* in 30 lines. Add a case every time you find a wrong answer in real use. Re-run after every prompt change. By Stage 6 you'll have this on rails.

## 7. The patterns that fall out for free

Once you can extract `{category, priority, summary, confidence}`, you can also:

- **Classification** — `{label: Literal[...], confidence: float}`.
- **Entity extraction** — `{names: list[str], emails: list[str], dates: list[date]}`.
- **Form auto-fill** — extract `{first_name, last_name, address, ...}` from free-text input.
- **Content moderation** — `{is_safe: bool, categories_violated: list[str], severity: int}`.
- **Code intent parsing** — `{action: "create" | "delete" | "update", target: str, args: dict}`.
- **Multi-step planning** — `{steps: list[Step]}`.

Most "AI features" in shipped products are some variant of this template.

## 8. Sampling tricks that matter here

- **Temperature 0** (or close): for classification, you almost never want creativity. Set `temperature=0` so the same input maps to the same output. (This is also the only way to make evals stable.)
- **Strict mode**: always pass `strict: true` to the schema. It's the difference between "the model usually conforms" and "it's structurally impossible for it not to."
- **Closed sets > open strings**: every field that has a finite set of valid values should be a `Literal` / enum, not a `str`. This is your first line of defense against the model inventing categories.

## 9. When structured output is the wrong tool

- **Long-form generation**: writing a 5-paragraph email response, summarizing a long doc with markdown formatting, generating code. Structured outputs add friction for negligible benefit — and the `content` field becomes the whole product anyway.
- **Streaming UX**: you can stream structured outputs, but parsing partial JSON is finicky. For chat-style UIs, free-form streaming + a structured *second* call is often cleaner.
- **Strict schema with creative content**: forcing a poem into `{title, line1, line2, ...}` will produce a worse poem than asking for free-form text. Schema is a constraint; constraints help reliability but can hurt creativity.

## Where to go deeper

- [OpenAI Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs) — the canonical doc; covers strict mode, edge cases, recursive schemas.
- [Anthropic tool use as JSON schema](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) — Claude doesn't have a separate "json_schema mode"; you use a tool definition with `tool_choice: {type: "tool", ...}` to force structured output.
- [Pydantic AI](https://ai.pydantic.dev/) — Python framework that puts structured output at the center of its model.
- [Instructor](https://python.useinstructor.com/) — Pydantic-based structured output across many providers, with built-in retries on validation failure.

## Deeper in this guide

- [Foundations: Structured output](/docs/foundations/structured-output) — what constrained decoding actually does under the hood.
- [Patterns: Structured output in production](/docs/patterns/pattern-structured-output) — retry strategies, partial parsing, schema versioning.

## Project

:::tip[Project — Ticket triage extractor + eval]
Build a small script: takes a customer support email body on stdin, returns a Pydantic/Zod object with `{category, priority, summary, needs_human, confidence}`. Write **20+ test cases** in a JSON file (real-feeling examples — billing, tech, account, feedback, edge cases, ambiguous ones). Add a `run_eval.py` that loops the cases and prints a pass/fail report. **Run the eval. Get to 90%+ on your set.** Then change the prompt and re-run; watch which cases regressed. That's the AI engineering feedback loop in miniature.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Using "reply in JSON" prompts when strict mode is available.** "Reply in JSON" works 80% of the time; strict-mode schemas work 99.9% of the time. There is no scenario where the worse option is correct.
- **Schemas with open `str` fields where an enum would fit.** Every `str` is a chance for the model to invent. `category: Literal["billing", "technical", "account"]` reduces the surface area by orders of magnitude.
- **Setting temperature > 0 for classification.** Higher temperature = different answer on the same input = unreproducible evals. For schema-constrained calls, temperature 0 is the default that's almost always right.
- **Treating confidence as truth.** A model self-reporting "confidence: 0.95" is not a calibrated probability. It correlates with correctness loosely; use it as a triage signal ("if confidence < 0.7, route to a human") but never as a substitute for ground-truth measurement.
- **Schema-validating in your code as well "for safety."** The whole point of strict mode is that the provider already validated. Re-validating in your code wastes CPU and ages your code against schema changes. Trust strict mode; if it fails (rare), let it fail loudly so you notice.
:::

## Page checkpoint



→ [Next: Stage 4 — Tool calling](./05-stage-4-tools.md) · [Back to Part I overview](./index.md)
