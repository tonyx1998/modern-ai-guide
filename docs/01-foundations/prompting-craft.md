---
id: prompting-craft
title: Prompting — the craft
sidebar_position: 8.5
description: Chain-of-thought, ReAct, self-consistency, prompt chaining, few-shot vs zero-shot, role assignment. The repeatable techniques behind reliable prompts.
---

# Prompting — the craft

> **In one line:** Beyond "write a clear instruction," there are a half-dozen named techniques — chain-of-thought, few-shot, ReAct, self-consistency, prompt chaining, role assignment — and a senior AI engineer knows when each one helps, when it hurts, and how to compose them.

:::tip[In plain English]
"Prompt engineering" sounds vague because the public conversation about it is. The actual craft is a small toolkit of *named patterns* — like design patterns for software. Each one has a known shape, known wins, known failure modes. Once you can name them, you can pick the right one for a problem instead of fumbling phrasing until something works.
:::

## The big picture: instructions, examples, and structure

Every prompt is some combination of three ingredients:

1. **Instructions** — what you want the model to do.
2. **Examples** — what success looks like (the few-shot trick).
3. **Structure** — how the output should be shaped (the schema / format trick).

Most prompts use all three. The techniques on this page are *how* to combine them.

## Technique 1 — Zero-shot vs few-shot

**Zero-shot:** describe the task; let the model do it.

```
Classify this review as positive, negative, or neutral.

Review: "The food was fine but the wait was 40 minutes."
```

**Few-shot:** include 2–5 worked examples before the real input.

```
Classify reviews as positive, negative, or neutral.

Review: "Best meal of my life."
Sentiment: positive

Review: "Cold soup, rude waiter."
Sentiment: negative

Review: "It was okay, nothing special."
Sentiment: neutral

Review: "The food was fine but the wait was 40 minutes."
Sentiment:
```

When few-shot helps:

- **Format is non-obvious.** "Sentiment: neutral" vs `{"sentiment": "neutral"}` — show the model.
- **Edge cases need anchoring.** Mixed reviews → show one labeled `neutral` to anchor the boundary.
- **The model misclassifies a particular pattern.** Add an example that handles it.

When few-shot hurts:

- **With reasoning models.** They suppress reasoning to pattern-match. Use zero-shot.
- **When examples are unbalanced.** 4 positive + 1 negative biases the model toward positive.
- **When examples leak the answer.** Don't include the test case in your few-shots.
- **When you have structured output.** A JSON schema enforces format better than examples.

## Technique 2 — Chain-of-thought (CoT)

Explicit instruction: *"think step by step before answering."*

```
Question: A train leaves Boston at 60mph at 2pm. Another leaves NYC at
80mph at 3pm. Boston-NYC is 215 miles. When do they meet?

Think through this step by step, then give the final time.
```

**When CoT helps:** math, logic, multi-step problems on non-reasoning models. Reliable accuracy gains.

**When CoT hurts:** with reasoning models (already thinking, you suppress it). Simple lookups (you waste tokens). Latency-sensitive paths (longer output = slower).

**The structured CoT variant** separates thinking from final answer:

```
Think through your reasoning inside <thinking>...</thinking> tags.
Then output the final answer inside <answer>...</answer> tags.
```

You parse and discard the thinking, keep the answer. Good UX (clean output), still gets the reasoning benefits.

## Technique 3 — ReAct (reason + act)

For tool-using agents. Alternate "thought" and "action" turns:

```
Thought: I need to know the user's order status.
Action: lookup_order(order_id="ABC-123")
Observation: {status: "shipped", eta: "2026-05-28"}
Thought: I should also check their loyalty tier for shipping options.
Action: get_user(user_id="u_42")
Observation: {tier: "gold"}
Thought: Gold tier gets free upgrades; I'll offer that.
Final: "Your order is shipped, ETA May 28. As a Gold member, want a free upgrade?"
```

Modern tool-calling APIs (OpenAI, Anthropic) build ReAct in — you don't write the "Thought/Action" scaffold by hand. But the *pattern* still matters: agents that explicitly think between tool calls are more reliable than agents that chain tools without reflection.

See [The agent loop](./agent-loop.md) and [Planning and reflection](./planning-and-reflection.md).

## Technique 4 — Self-consistency

Generate N answers with `temperature > 0`, take the majority vote.

```python
answers = [call_model(prompt, temperature=0.7) for _ in range(5)]
final = majority_vote(answers)
```

**When it helps:** math, multi-step reasoning, anything with a unique right answer. Often improves accuracy by 5–10 points over a single greedy run.

**Cost:** 5× tokens. Use selectively — for the 5% of requests where confidence matters.

**Alternative in 2026:** reasoning models (see [Reasoning models](./reasoning-models.md)) often outperform self-consistency for similar cost, since their built-in thinking is essentially "self-consistency with a shared scratchpad."

## Technique 5 — Prompt chaining (multi-step prompts)

Split a big task into several model calls, each focused.

```mermaid
flowchart LR
    U[User input] --> P1[Step 1: extract entities]
    P1 --> P2[Step 2: classify intent]
    P2 --> P3[Step 3: draft response]
    P3 --> P4[Step 4: refine tone]
    P4 --> O[Final output]
```

**When it helps:**

- A task is "one prompt with three jobs" and the model conflates them.
- You want to inject a deterministic step between (e.g., DB lookup based on step-1's entities).
- Each sub-step is easier to eval and debug separately.

**When it hurts:**

- Latency: each hop adds round-trip time.
- Cost: each hop pays for the shared system prompt unless you cache.
- Error compounding: a wrong step-1 propagates.

**Rule of thumb:** if you can get 90% accuracy in one call, stay there. If you can't, chain.

## Technique 6 — Role assignment (the "you are a …" pattern)

Open the system prompt with a role:

```
You are a senior tax accountant with 20 years of experience advising
US small businesses. You only answer in the context of US federal tax
code. If a question is outside your scope, say so.
```

**Why it works:** the role primes the model's vocabulary, tone, and refusal behavior. A "senior accountant" is more conservative than a generic assistant. A "10x engineer" writes more aggressive code than a "thoughtful senior."

**Limits:** role assignment is a tone knob, not a capability knob. "You are a world-class mathematician" does not make a non-reasoning model better at math. Don't use roles as a substitute for actual scaffolding (tools, retrieval, reasoning).

## Technique 7 — Structured output as the scaffold

Force the model to emit JSON / XML matching a schema.

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    tools=[{
        "name": "categorize",
        "description": "Categorize the support request",
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "enum": ["billing", "tech", "feature"]},
                "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                "summary": {"type": "string", "maxLength": 200},
            },
            "required": ["category", "confidence", "summary"],
        },
    }],
    tool_choice={"type": "tool", "name": "categorize"},
    messages=[...],
)
```

The schema is a *cleaner* form of "few-shot examples" — instead of showing the model what success looks like, you make it impossible to produce anything else.

See [Structured output](./structured-output.md) for the full pattern.

## Technique 8 — Anthropic XML structure

Anthropic's models are trained to respect XML-style tags. Use them for long prompts:

```
<task>
Summarize the customer support ticket.
</task>

<context>
The customer has been a paying user for 3 years.
</context>

<ticket>
[the actual ticket text]
</ticket>

<output_format>
Two sentences, professional tone.
</output_format>
```

This is more robust than markdown sections, especially for long prompts where the model might lose track of which section is which.

## Composition — the typical production prompt shape

Real prompts mix several techniques:

```
[ROLE]
You are a customer support agent for Acme SaaS.

[INSTRUCTIONS]
Help the customer with their issue. If you don't know the answer,
say so and offer to escalate. Never invent policies.

[EXAMPLES — few-shot, 2-3 cases]
Customer: "How do I cancel?"
Response: "You can cancel from Settings > Billing. Want me to walk you through it?"
[...]

[CONTEXT — retrieved chunks]
<docs>
{retrieved_chunks}
</docs>

[STRUCTURED OUTPUT]
Respond with JSON: { "answer": "...", "escalate": bool, "cited_chunks": [...] }
```

Six techniques in one prompt: role, instruction, few-shot, retrieval grounding, XML structure, structured output. That's a typical production prompt.

## Iteration: how senior engineers actually improve prompts

1. **Write the first draft.** Get a baseline.
2. **Build an eval set** of 20–50 representative inputs ([evals](../03-lifecycle/04-evals.md)).
3. **Score the baseline.** Maybe 70% pass.
4. **Look at the failures.** Group them by pattern.
5. **Pick the dominant failure pattern.** Apply the technique that fixes it (e.g., "model misclassifies sarcasm" → add few-shot examples of sarcasm).
6. **Re-score.** If you improved, keep the change; if not, revert.
7. **Repeat.** Each round fixes one pattern.

This is the difference between "prompt engineering" (vibes) and **prompt engineering** (eval-driven iteration). The eval set is the engine.

## What beginners get wrong

:::caution[Common mistakes]
- **Adding "important!" and "you must!" everywhere.** Models don't escalate to capital letters. Clear, specific instructions beat shouting.
- **Stacking techniques without measuring.** Throwing role + few-shot + CoT + structured output + XML at every problem inflates tokens with no eval-backed gain. Add techniques that fix specific failures.
- **Few-shotting reasoning models.** Suppresses their reasoning. Zero-shot is right for o-series, R1, extended-thinking Claude.
- **"Think step by step" with a reasoning model.** It already does. Wasted instruction.
- **Vague schemas.** `"output: object"` is not a schema. Use strict JSON schema with required fields, types, enums.
- **No examples for non-obvious tasks.** "Classify intent" with 12 possible intents and no examples → low accuracy. Show the boundary cases.
- **Putting the question before the context.** Long-context models attend less to early tokens. Put the question at the end ("recency bias"), instructions at the start.
- **Iterating without an eval set.** "It worked on my one test case" is not validation. Build 20-50 cases before tuning.
:::

:::info[Highlight: the craft is the eval loop, not the words]
The internet pretends prompt engineering is about finding magic phrases. The actual craft is: write a measurable spec, build an eval set, iterate against it. Engineers who can build an eval set and iterate against it consistently beat engineers with bigger prompt-trick vocabularies and no eval discipline.
:::

---

→ Next: [Context windows](./context-window.md)
