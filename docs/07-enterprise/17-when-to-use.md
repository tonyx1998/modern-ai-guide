---
id: enterprise-ai-when-to-use
title: When to Use an Org-Wide AI Platform
sidebar_position: 18
sidebar_label: 17. When to Use
description: When an org-wide AI platform is justified; signals it's premature; how to phase the build.
---

# When to Use an Org-Wide AI Platform

> **In one line:** A central AI platform pays for itself when you cross roughly 5 AI features in production *or* 50+ engineers building AI *or* any regulated workload — and before that point, premature centralization slows your one feature down without delivering the benefits it's designed for.

:::tip[In plain English]
The temptation reading this chapter is to think every company building AI needs a platform team, a CoE, a Responsible AI function, a multi-sink observability story, and an eval-gating CI pipeline. They don't. Most of this scaffolding pays off at scale and creates pure overhead at small scale.

The other temptation is to insist you don't need any of it until much later than you do. The signs you need it are concrete — count your features, count your AI engineers, look at your regulatory exposure. When the signals fire, build the platform. Before that, don't.
:::

## The signals it's time to build the platform

Build the AI platform when **any two** of these are true:

- **5+ AI features** in production owned by different teams.
- **50+ engineers** building AI features (embedded across product teams).
- **Any regulated workload** (PHI, PCI, fair-lending, EU AI Act High-risk, FedRAMP).
- **3+ model providers** in use (Bedrock + Azure OpenAI + Vertex, or hyperscaler + a self-host).
- **2+ AI incidents** in the last quarter that "more centralization could have prevented."
- **Procurement / Security review** is the bottleneck on shipping any new AI feature.
- **Shadow AI** is visibly large and growing (CASB data, cloud spend anomalies on personal accounts).

If only one signal fires, you can usually solve it with a smaller intervention (a shared library, a single point of contact in Legal, an opinionated reference architecture). When two or more fire, you've earned the platform team.

## What to build first

Even when you're building a platform, you build it in stages. The right rough sequence:

1. **A standard SDK and an enforced single point of egress.** Even if "the platform" is one engineer and a Slack channel, getting all AI calls behind one wrapper is the foundation everything else builds on.
2. **A central gateway** (off-the-shelf Portkey/Kong/etc. is fine to start).
3. **A prompt registry** — even a Git-backed YAML directory with a tiny CLI is enough at first.
4. **An eval scaffold per common pattern.**
5. **Eval-gating in CI** for at least one pattern.
6. **LLM observability** that feeds eval-on-production.
7. **A model registry + manifest format** for features.
8. **Policy engine + manifest enforcement** in the gateway.
9. **Risk-tiered intake + AI Risk Review** process.
10. **Adversarial and fairness suites + the full compliance artifact pipeline.**

Phases 1–4 are the minimum viable platform; teams of 50–100 AI-touching engineers can stop here for a long time. Phases 5–8 come in as you cross the regulated-workload or 100+ engineer threshold. Phases 9–10 are full enterprise mode and usually arrive when you cross the High-tier-feature or EU-AI-Act-exposure threshold.

## Signals it's premature

You're probably premature if:

- You have **one or two AI features** and a platform team would outnumber the AI engineers consuming it.
- You're **building a custom gateway** before trying Portkey, Kong, or a thin in-house wrapper around the OpenAI SDK.
- You're **forcing a single eval framework** on three engineers who would each be happier with their own scripts.
- You're **building a 12-person platform team** before the platform has any users.
- Your prompts-as-code story has more **process than prompts**.

The cost of premature platform: real engineering time on platform code, real process tax on the feature team(s), no real benefit because the scale isn't there.

:::info[Highlight: the "five features" tipping point]
The most reliable single signal that you need a real platform is **five AI features in production owned by different teams**.

Below five, you can mostly hold the system together with conventions, a shared library, and a Slack channel. Above five:

- Inconsistencies start to bite (different prompt-storage patterns, different eval styles, different observability levels).
- Cross-cutting changes (new model, new redaction policy, new safety standard) start requiring forty PRs across teams.
- Audit and compliance questions get unanswerable in a reasonable timeframe.
- The first AI Risk Review meeting where the same questions get re-asked across features is the practical "you need a platform" moment.

Don't wait for the seventh feature to ship to start building. The platform takes two quarters to land, so start when you can see the fifth feature on the roadmap.
:::

## What to use *instead* at smaller scale

If you're below the threshold:

- **Solo / startup:** see Chapters 5–6 of this guide. A single AI engineer with a Python script and an eval set is the right answer.
- **Growth-stage:** a shared internal library (`@acme/ai`) around the OpenAI/Anthropic SDK + a single shared eval pattern + one dashboard. Two AI engineers maintain it part-time.
- **Mid-stage (~3 AI features, ~20 AI engineers):** a designated AI tech lead, a shared library, an opinionated reference architecture document. Not a platform team yet.

The pattern: invest in *convention* before investing in *enforcement*. Convention scales until ~5 features; enforcement is what you need beyond.

## What changes by scale

| Scale | Platform investment | Process investment |
|---|---|---|
| 1–2 features, \&lt;20 AI eng | None | A README and a Slack channel |
| 3–5 features, 20–50 AI eng | Shared library, single eval pattern | Lightweight AI design review |
| 5–10 features, 50–100 AI eng | Gateway + prompt registry + eval scaffolds | Risk-tier intake, embedded AI Risk partner |
| 10+ features, 100+ AI eng, regulated | Full platform + CoE + Responsible AI | Full process from this chapter |

## A representative phased build

A real 2024–2026 example (composite, not one company):

- **Q1 2024:** 2 AI features in production. One AI engineer at the company. Shared library = a 200-line wrapper. No platform team.
- **Q3 2024:** 5 AI features, 12 AI-touching engineers. Tech lead designated. Shared library grows to ~2000 lines + a starter eval pattern. Lightweight design-review on Mondays.
- **Q1 2025:** 9 AI features, regulatory exposure (first HIPAA-relevant feature). Platform team formed: 3 engineers. Portkey Enterprise deployed as gateway. Braintrust as eval platform. First AI Risk Review committee.
- **Q3 2025:** 18 AI features, 80 AI engineers, Bedrock commit signed. Platform team at 8. CoE virtual team formed. Eval-gating in CI for all production features. Eval-on-production live.
- **Q1 2026:** 30 AI features, 200+ AI engineers, EU AI Act readiness program. Platform at 14. Full Responsible AI function. Multi-region gateway. SIEM integration shipped.

The shape: each addition was justified by a concrete signal, not a master plan. Premature investment in any of these would have been wasteful; deferred investment past the signal would have created the problems platforms are meant to solve.

## Common mistakes

:::caution[Where people commonly trip up]
- **Building a 10-person AI platform team for 3 AI features.** You'll spend a year building a platform that solves problems you don't have. Wait for the signals; in the meantime, ship features.
- **Refusing to invest in platform after the signals fire.** Once you're at 5+ features and adding regulatory exposure, conventions stop scaling. The platform investment is overdue — every quarter you delay is a quarter of growing inconsistency you'll have to migrate later.
- **Skipping straight to "full enterprise mode."** Even at 500-engineer orgs, the platform is built in stages over 12–24 months. Trying to ship all ten phases in one quarter produces an unused platform.
- **Letting the platform team be the bottleneck on the first feature.** In the early days, the platform exists *to support feature teams*. If the platform team is rate-limiting the only consumer, you've inverted the incentive. Ship platform features as fast as the consuming team needs them, not on your own roadmap.
- **Building bespoke instead of using the off-the-shelf option that works.** Portkey, Kong AI Gateway, Braintrust, Langfuse, Datadog LLM Observability — each is good enough to start with. Building your own at small scale is engineering vanity; build your own only when the SaaS genuinely fails to fit.
- **Treating "we need a platform" as evidence we need a CoE, Responsible AI lead, and Risk Review board on day one.** Those come later, in response to the signals (regulated workload, 100+ engineers, EU exposure). Build the technical platform first; the governance bodies follow.
:::

<Quiz id="enterprise-ai-when-to-use-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What does the page call the most reliable single signal that you need a real AI platform?"
  options={[
    { text: "Annual AI spend crossing one million dollars" },
    { text: "Hiring your first dedicated AI engineer" },
    { text: "A board member asking about AI strategy" },
    { text: "Five AI features in production owned by different teams" }
  ]}
  correct={3}
  explanation="Below five features, conventions, a shared library, and a Slack channel mostly hold things together. Above five, inconsistencies bite, cross-cutting changes need forty PRs, and audit questions become unanswerable in reasonable time. Spend and headcount matter as signals too, but the five-feature mark is the one the page singles out — and it says to start building when the fifth feature is visible on the roadmap."
/>

<Question
  prompt="What should be built first when standing up an AI platform?"
  options={[
    { text: "A standard SDK and a single enforced point of egress for all AI calls" },
    { text: "A full Responsible AI function with a risk review board" },
    { text: "A custom-built gateway tuned to your infrastructure" },
    { text: "Adversarial and fairness suites for every feature" }
  ]}
  correct={0}
  explanation="Getting every AI call behind one wrapper is the foundation everything else builds on — even if 'the platform' is one engineer and a Slack channel. Governance bodies and full compliance pipelines are phases 9 and 10, arriving with regulated workloads. And the custom gateway is explicitly premature: try Portkey, Kong, or a thin wrapper first."
/>

<Question
  prompt="Below the platform threshold, what should you invest in instead?"
  options={[
    { text: "Enforcement tooling that blocks non-standard choices" },
    { text: "Convention — shared libraries and opinionated reference patterns" },
    { text: "A 10-person platform team to get ahead of growth" },
    { text: "Multi-region gateway infrastructure" }
  ]}
  correct={1}
  explanation="Convention scales until roughly five features; enforcement is what you need beyond that. Building enforcement early — or a platform team that outnumbers its users — is premature centralization that slows your one feature down without delivering the benefits the machinery is designed for."
/>

</Quiz>

## What's next

→ Continue to [When You're "Too Big"](./18-too-big.md) — the failure mode at the *other* end of the spectrum, when central AI platforms ossify.
