---
id: startup-ai-design
title: AI Product Design
sidebar_position: 5
sidebar_label: 4. Design
description: Streaming, citations, confidence, undo, regenerate, fallback states. The designer-engineer pairing pattern that produces shippable AI UX.
---

# AI Product Design

> **In one line:** Stream the answer, cite the source, show confidence, make regenerate one click, make undo one click, and have a graceful fallback when the model is down.

:::tip[In plain English]
A regular web UI shows a button, you click, you get a result. An AI UI is showing you something that might be wrong, might be slow, might cost real money to generate, and might need to be tried again. Every design pattern in this page exists to keep the user in control when the underlying system is non-deterministic.
:::

## The seven AI UX patterns

### 1. Streaming

Stream tokens from the model to the UI. Target **time to first token (TTFT) under 800ms p95**. Anything slower and users will think the app is broken.

- Use server-sent events (SSE) or the Vercel AI SDK's `useChat`.
- Show a cursor or shimmer while streaming.
- Render markdown progressively (most renderers handle this).

### 2. Citations / sources

If the answer is grounded in retrieved documents, **show the sources inline**. Click a citation, jump to the underlying doc. This single pattern moves trust scores 30+ points in user research.

```tsx
<Answer>
  The refund policy is 30 days <Citation source="policy-2024.pdf" page={3} />
</Answer>
```

If you can't show citations (pure generation), say so — never imply grounding that doesn't exist.

### 3. Confidence indicators

For Tier-1 features, expose a confidence signal. Options:

- Model self-rating ("How confident are you, 1–10?") — surprisingly useful.
- Logprobs-based score (when the API exposes them).
- Retrieval-similarity score, surfaced as a chip.

Show it as a small badge: "High confidence," "Review carefully," "Low confidence — regenerate?" Don't show raw 0.78 scores; users can't calibrate to them.

### 4. Regenerate

Every AI output gets a "Regenerate" button. One click. Maybe also "Regenerate with more detail" / "Make it shorter." Cheap to build; massively reduces user frustration with a single bad output.

### 5. Undo

If the AI takes an action (sends an email, files a ticket, schedules a meeting), there must be an **undo window**. Standard pattern: action is queued for 5–10 seconds before execution; toast shows "Sent — Undo." Inngest or Trigger.dev are great for this.

### 6. Fallback states

When the model is down, slow, or returns garbage:

- **Graceful degradation:** non-AI behavior (manual form, last cached answer, "feature temporarily unavailable").
- **Never just spin forever.** A 30-second loading spinner is worse than an honest error.
- **Surface the kill-switch state.** If the feature is off (because cost spike or quality regression), say so cleanly.

### 7. Edit-the-prompt-not-the-output

Power users want to refine. Instead of asking them to edit the *output*, let them edit the *input* and re-run. Examples:

- Chat: "Edit this message" → re-runs the assistant turn.
- Generation: "Change tone to formal" → adds to system prompt, regenerates.

This pattern keeps the model in the loop instead of producing a hand-edited artifact the model can't help iterate on.

## The designer-engineer pairing pattern

AI features can't be designed in Figma alone. The output shape changes with every prompt iteration. The pattern that works:

- **Day 1–2:** Designer + AI engineer pair on the v0 prompt. Designer writes example outputs by hand ("this is what good looks like"). Engineer wires up the basic call.
- **Day 3–5:** They iterate together. The designer is in the loop watching real outputs and saying "the bullet lists look bad here," "this needs a citation," "the tone is wrong on the third example."
- **Day 6–10:** Real Figma + real frontend work. Now the designer knows what the data actually looks like.
- **Day 11+:** Internal dogfood. Designer watches usage sessions. Re-pairs with engineer on the failure modes.

When the designer is not in the loop, you get a product where the prompt and the UI fight each other. The first version of every AI feature you ship needs an embedded designer.

## Component libraries built for AI

A few component primitives you'll use repeatedly. Build or pick once, reuse everywhere:

| Primitive          | What it does                                                       | 2026 options                       |
|--------------------|--------------------------------------------------------------------|------------------------------------|
| Streaming Markdown | Renders markdown as tokens arrive                                  | Vercel AI SDK, react-markdown      |
| Citation popover   | Tap a citation, see source snippet                                 | Custom on top of shadcn `Popover`  |
| Confidence chip    | Small badge with traffic-light coloring                            | Custom on top of shadcn `Badge`    |
| Regenerate button  | One-click rerun with optional modifier menu                        | Custom; menu via shadcn `Dropdown` |
| Undo toast         | Toast with action, queue underlying mutation                       | sonner or shadcn `Toast`           |
| Token usage badge  | Optional — shows cost on power-user views                          | Custom                             |

shadcn/ui + Tailwind is the dominant base layer in 2026 startups. Build the AI-specific primitives on top once, share across features.

:::note[Worked example: trust scores moved by citations]
A 20-person legal-research startup ships a Q&A feature on top of case law. Initial version is just answer text. Internal NPS for the feature: 6/10. Users say "I don't know if I can trust this."

They add inline citations: each claim has a clickable source. Hover shows the source snippet; click opens the original case at the right paragraph. No prompt change, no model change.

Two weeks later, NPS is 8.5/10. Customer support tickets about "is this accurate?" drop 70%. The work was two days of frontend.

The lesson: the most leveraged AI improvements are often UX patterns, not model swaps.
:::

:::info[Highlight: latency is a design problem, not just an engineering problem]
A 4-second response feels broken even if the answer is perfect. The designer's job: make the wait feel productive — skeletons that mirror the final layout, partial results that progressively render, a "thinking..." indicator that says what the system is doing ("searching policy docs," "drafting response"). Latency is a UX problem first, an infrastructure problem second.
:::

## The streaming-UX checklist

Things every streaming AI feature gets right:

- TTFT < 800ms p95 (otherwise add a "thinking..." indicator that names the step).
- Cursor or shimmer while streaming, removed cleanly on completion.
- Stop button (visible during stream, kills the request and frees tokens).
- Auto-scroll that *the user can override* (don't fight them when they scroll up to read).
- Markdown progressive rendering (lists, code blocks render token-by-token without flicker).
- Final-message animations *off* once streaming is done (no fade-in that delays read).
- Copy button on completed output.
- Regenerate button beside copy.

Miss any two of these and the feature feels janky. Get all eight and the feature feels world-class.

## Edge cases the design needs answers for

Before launch, the designer + engineer should have explicit answers for:

| Edge case                                    | Default answer                              |
|----------------------------------------------|---------------------------------------------|
| Model returns empty response                 | Show "no answer," offer regenerate          |
| Model returns wildly long response           | Truncate with "show full" disclosure        |
| Model returns malformed JSON                 | Catch, log, fall back to generic message    |
| Provider is rate-limited                     | Queue with "Hang tight, busy moment" toast  |
| Provider is fully down                       | Switch to fallback (gateway handles); UI shows nothing |
| User clicks "Stop" mid-stream                | Cancel request, keep partial output, show "Stopped" badge |
| User regenerates 5x in a row                 | After 5, show "Tell us what's wrong" feedback prompt |
| Cost cap hit for tenant                      | Graceful "You've hit your daily limit" with upgrade CTA |

Document these in the feature spec. The team that hasn't agreed on these *will* ship a broken state to a customer in the first week.

## Common mistakes

:::caution[Where people commonly trip up]
- **Building a ChatGPT clone.** Generic chat is a weak UX for almost every domain-specific problem. Design *for the task* — a contract reviewer needs a side-by-side diff view, not a chat.
- **Hiding the AI to "make it feel magical."** Users want to know when AI is involved so they can apply appropriate skepticism. Label clearly. "Generated by AI" is not embarrassing; it's responsible.
- **Skipping the regenerate button to "force users to engage."** They'll just leave. Regenerate is cheap insurance.
- **Designing without watching real outputs.** Figma mocks always look better than the actual model output. Insist the designer be in the loop during prompt iteration.
- **No fallback state.** When the provider has a 30-minute outage (it happens), your app shows a spinner forever. Build the "AI is temporarily unavailable, here's the manual flow" state on day one.
:::

## What's next

→ Continue to [Architecture](./05-architecture.md) where we cover the monolith + LLM gateway + pgvector + Inngest stack and when to split.
