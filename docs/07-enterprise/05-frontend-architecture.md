---
id: enterprise-ai-frontend-architecture
title: 'Phase 3.5: AI in Enterprise Frontends'
sidebar_position: 6
sidebar_label: 5. Frontend Architecture
description: AI in enterprise frontends — design-system AI components, accessibility, internationalization, A/B testing at scale.
---

# Phase 3.5: AI in Enterprise Frontends

> **In one line:** At enterprise scale, AI UI is not bespoke — it's a small set of design-system components (chat, suggestion chip, summarization card, agent timeline) that every product team uses, with accessibility, internationalization, telemetry, and A/B framework wiring built in.

:::tip[In plain English]
A startup ships an AI feature by writing a custom chat UI in React with a streaming endpoint. An enterprise can't — there are 60 product surfaces, each owned by a different team, and shipping 60 slightly-different chat UIs would be a disaster for accessibility, brand consistency, internationalization, and analytics.

So the design system team builds 4–8 canonical AI components, each meeting the same accessibility (WCAG 2.2 AA), internationalization, telemetry, and theming standards. Feature teams use those components and only those components.
:::

## The canonical AI components

A mature enterprise design system in 2026 typically includes:

- **`<AIChat>`** — full chat interface (message list, streaming token render, regenerate, copy, feedback thumbs, accessibility transcript).
- **`<AISuggestion>`** — inline suggestion chips ("Try this query," "Did you mean…?").
- **`<AISummary>`** — summarization card with collapsible expansion, source citations, "draft" badge.
- **`<AIAutocomplete>`** — typeahead with model-generated completions; merges into existing form inputs.
- **`<AIDraft>`** — multi-paragraph drafting surface, with undo, regenerate, accept/reject diffing.
- **`<AIAgentTimeline>`** — multi-step agent run UI; tool calls, intermediate state, cancel.
- **`<AIDisclosure>`** — the legal-mandated "this content is AI-generated" badge with hover-card explanation.
- **`<AIFeedback>`** — thumbs / rating / text feedback that wires straight into the eval platform.

Each component has:

- **Theming** via design tokens (no hard-coded colors).
- **i18n** — every string ID lives in the translation pipeline; languages added centrally.
- **Accessibility** — keyboard nav, screen reader announcements for streaming tokens, reduced-motion support, focus management.
- **Telemetry** — events emitted with feature ID, prompt registry ID, eval suite ID, A/B variant.
- **A/B / feature-flag wiring** — controls whether the AI variant or the non-AI fallback is shown.

## Accessibility for AI UIs (genuinely hard)

AI UI raises accessibility problems most engineers don't think about:

- **Streaming output and screen readers.** Naive token-by-token streaming spams screen readers with partial words. Mature components batch into semantic chunks (sentence or clause) before announcing.
- **Loading states.** AI calls can take 5–30 seconds; an `aria-live="polite"` "thinking…" region is mandatory.
- **Keyboard for chat.** Send on Enter vs. Shift+Enter, escape to cancel a streaming response, focus return after a streamed reply finishes.
- **Cognitive accessibility.** Drafts have to be clearly labeled as drafts. Summaries that hide source content must offer expansion. Regenerate must be obvious.
- **WCAG 2.2 AA conformance.** Required for federal contracts (Section 508) and increasingly enforced in regulated industries.

The pattern that works: a single accessibility-first AI components library, audited by a dedicated a11y specialist on the design-system team, with WCAG conformance evidence baked into the storybook docs. Every consuming feature inherits the audit.

## Internationalization

A US-only AI feature is a fiction at most Fortune 500s. The frontend i18n requirements:

- **All UI strings translated** through the standard translation pipeline (Lokalise, Smartling, in-house TMS). Including the AI disclosure strings, which legal often writes per market.
- **Model output language matched to user locale.** The standard SDK sets a `response_language` hint per call; gateway policy can enforce it.
- **Right-to-left layouts** for Arabic, Hebrew. Streaming output flips correctly.
- **Locale-specific safety policies.** A model output that's fine in en-US may be illegal in DE or AE; policy engine layers regional content filters.
- **Currency, dates, numbers.** AI-generated content that includes these has to be locale-formatted, ideally by post-processing rather than asking the model to format.

## A/B testing AI at scale

A/B testing AI features differs from testing non-AI features in three ways:

- **Variants include the *prompt version*, not just code paths.** Your experimentation platform (Statsig, LaunchDarkly, in-house) has to be able to assign a prompt registry version per variant.
- **Outcome metrics include eval scores, not just business metrics.** A variant with 30% higher conversion but a 12% drop in groundedness eval may be the wrong call.
- **Holdouts run longer.** Model and prompt drift means a 1-week A/B can be misleading. Mature teams run 4–8 week tests with periodic eval re-baselining.

A typical config:

```yaml
# experiments/summary-card-v3.yaml
experiment_id: summary-card-v3
hypothesis: "Claude Sonnet 4.5 summaries lift ticket-resolution by >=5%"
variants:
  - name: control
    component: AISummary
    prompt_registry_id: summary-card@v2.4
    model: bedrock/anthropic.claude-haiku-4-5
  - name: treatment
    component: AISummary
    prompt_registry_id: summary-card@v3.0
    model: bedrock/anthropic.claude-sonnet-4-5
allocation:
  control: 0.50
  treatment: 0.50
guardrail_metrics:
  - eval_score >= 0.85    # from the per-feature eval suite
  - p95_latency_ms <= 4500
  - cost_per_call_usd <= 0.012
business_metrics:
  - ticket_resolution_rate
  - csat_score
duration_weeks: 6
holdout_pct: 5
required_signoff: [product_manager, ai_governance_partner]
```

:::info[Highlight: the eval suite is a guardrail metric]
The single most important difference between AI A/B testing and conventional A/B testing is that **eval scores are guardrails**, not just observed metrics.

A treatment variant that lifts CSAT 4% but drops the groundedness eval from 0.91 to 0.78 is shipping more hallucinations. The business metric looks good for the test window, but you're accruing a reputational debt that will land six months later as a viral "the AI told me to put glue on pizza" tweet.

Wire eval scores into the experimentation framework as guardrails from day one. The discipline of "lift the business metric *without* regressing the eval suite" is what separates teams that ship sustainable AI from teams that ship one viral mistake.
:::

## Telemetry the design system enforces

Every AI component, regardless of feature team, emits a standard event shape:

```typescript
// emitted automatically by <AIChat>, <AISummary>, etc.
interface AIComponentEvent {
  event: 'ai.surface.shown' | 'ai.surface.action' | 'ai.surface.feedback';
  component: 'AIChat' | 'AISummary' | 'AIDraft' | /* ... */;
  feature_id: string;
  prompt_registry_id: string;
  eval_suite_id: string;
  ab_variant?: string;
  ab_experiment?: string;
  model: string;          // resolved by gateway, returned to client
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  user_locale: string;
  user_pseudonym: string; // never raw user id
  action?: 'accept' | 'reject' | 'regenerate' | 'copy' | 'feedback_positive' | 'feedback_negative';
}
```

Standardizing this shape across the company is what makes cross-feature analysis possible — "how does Claude 4.5 perform vs. GPT-4o across all AI features?" is a SQL query, not a six-team effort.

## What changes vs. a startup frontend

| | Startup | Enterprise |
|---|---|---|
| **AI UI** | Bespoke per feature | 4–8 design-system components |
| **Accessibility** | Best-effort | WCAG 2.2 AA audited, evidence in storybook |
| **i18n** | English-first | 8–30 languages, locale-aware safety policies |
| **A/B** | "We launched it and it felt better" | Statsig/LaunchDarkly experiment with eval guardrails |
| **Telemetry** | Whatever the team logs | Standard event shape across all AI components |
| **Disclosure** | Optional badge | Mandatory `<AIDisclosure>` per market |

## Common mistakes

:::caution[Where people commonly trip up]
- **Letting feature teams build their own chat UI "because they need something different."** Every team thinks their case is special. The design system has to absorb the variance — if a team needs an `AIChat` variant, ship it as a prop on the canonical component, not a separate component.
- **Treating accessibility as something the design-system team owns alone.** A11y for AI is an active design and content problem (drafts, regenerate, streaming, focus). Feature teams need a11y checklists for their AI flows, not just trust in the components.
- **Forgetting i18n until launch.** A "we'll translate later" AI feature usually ships with prompts that produce English-only output, hard-coded English strings in the UI, and an architecture that can't pass `response_language` through. Retrofitting i18n is a 6–10 week project per feature.
- **Running AI A/B tests for one week.** Model and prompt drift make short tests misleading. Plan for 4–8 weeks with re-baselined evals at the midpoint.
- **Not wiring eval scores into the experimentation framework.** If your A/B platform can only see business metrics, you'll happily ship hallucination regressions because the click-through went up. Make eval-score guardrails a hard requirement.
- **Treating the AI disclosure badge as cosmetic.** It's legally required in several jurisdictions (and the EU AI Act tightens this through 2026). Mishandling it can cost regulatory standing. Treat it like a privacy notice — non-optional, reviewed by Legal, consistent across the product.
:::

## What's next

→ Continue to [The Internal AI Platform](./06-developer-experience.md) — the developer experience the AI Platform team builds on top of this architecture.
