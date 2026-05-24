---
id: enterprise-ai-developer-experience
title: 'Phase 4: The Internal AI Platform'
sidebar_position: 7
sidebar_label: 6. Developer Experience
description: Golden-path templates, prompt registry CLI, eval-suite scaffolds, gateway-keys-as-code — the developer experience an enterprise AI Platform team builds.
---

# Phase 4: The Internal AI Platform

> **In one line:** A mature enterprise AI platform turns "I want to add AI to my service" into a one-command scaffold that produces a feature with gateway routing, an eval suite, observability, a prompt registry entry, and an AI Risk Review intake form — all wired up before the engineer writes a single prompt.

:::tip[In plain English]
At a startup, an engineer adding AI to their service writes the API call themselves, hard-codes a prompt, and ships it. At an enterprise, that same engineer runs `acme ai feature new --tier=medium --template=summarization`, gets a fully-wired feature directory with eval scaffolds and gateway config, and is producing reviewable PR diffs an hour later — without having to know how the gateway or eval platform works.

The platform's job is to make the *governed* path easier than the un-governed path. If your engineers find it easier to paste data into ChatGPT than to use the paved road, your platform has failed.
:::

## What "the platform" actually ships

A mature internal AI platform is a set of products:

- **A CLI** (`acme ai`) that scaffolds, deploys, evaluates, and observes AI features.
- **A standard AI SDK** that all feature teams import; talks only to the gateway.
- **A prompt registry** (Git-backed, with a CLI and a web UI; layered on Braintrust or Vellum).
- **An eval-suite scaffold** per common pattern (summarization, classification, RAG, agent).
- **Gateway-keys-as-code** — workload identity and policy bindings provisioned via Terraform PRs.
- **A model registry** — which models are approved at which risk tiers, with EOL dates.
- **An LLM-observability dashboard pack** per feature, auto-generated on first deploy.
- **An AI Risk Review intake** — a structured intake form auto-populated from the feature's manifest.
- **A model card template** that picks up most fields from the manifest.

## Golden-path templates

The single most important thing the platform ships. A golden-path template is a complete, batteries-included scaffold for a common AI pattern.

A typical org has 4–8 templates:

- **`summarization`** — input text → short, grounded summary. Eval suite: groundedness, length, format.
- **`classification`** — input → one of N categories. Eval suite: per-class accuracy, confusion matrix, fairness slice.
- **`rag-qa`** — query → retrieve → answer with citations. Eval suite: groundedness, citation accuracy, refusal correctness.
- **`extraction`** — input → structured JSON. Eval suite: schema validity, field accuracy, completeness.
- **`agent-tool-use`** — multi-step tool-calling. Eval suite: tool-call correctness, end-state correctness, cost ceiling.
- **`internal-copilot`** — chat-style assistant for an internal app. Eval suite: helpfulness, refusal, hallucination.

A scaffold looks like:

```bash
$ acme ai feature new \
    --template=rag-qa \
    --feature-id=policy-search-v1 \
    --team=hr-platform \
    --tier=medium \
    --regions=us-east-1,eu-west-1

[acme-ai] Created repo: github.com/acme/ai-feature-policy-search-v1
[acme-ai] Registered in Backstage (owner: hr-platform)
[acme-ai] Created prompt registry entry: policy-search-v1@v0.1
[acme-ai] Generated eval suite: 30 starter cases (rag-qa template)
[acme-ai] Provisioned gateway policy (PR opened in acme/gateway-policies)
[acme-ai] Created Datadog dashboards: latency, cost, eval-score
[acme-ai] Opened AI Risk Review intake ticket: AIRR-2143
[acme-ai] Bootstrapped model card draft (acme/model-cards/policy-search-v1.md)
[acme-ai] CI pipeline configured: lint, unit, eval-gate, security scan

Next steps:
  1. cd ai-feature-policy-search-v1
  2. Edit prompts/main.prompt.md
  3. Add 20+ eval cases to evals/cases/
  4. Open PR; eval gate will run automatically
  5. Complete AIRR-2143 by Friday for Q2 review slot
```

The first 12 things an engineer would otherwise spend three weeks doing — gone, replaced by one command.

:::info[Highlight: the scaffold is policy as code]
The deepest value of the scaffold isn't convenience — it's that **policy lives in the template**.

When `acme ai feature new` automatically creates a gateway policy, opens an AI Risk Review ticket, generates a model card draft, and wires the eval gate into CI, those things stop being suggestions in a wiki page. They're the default path, and the un-default path requires deliberate work to escape.

That's how enterprises scale governance without scaling pain: build the safe path *easier* than the unsafe path, then make it the only path most people learn.
:::

## The prompt registry CLI

Prompts at enterprise scale are managed like code — versioned, reviewed, and linked to evals. The CLI shape:

```bash
acme prompt list --feature=policy-search-v1
acme prompt show policy-search-v1@v2.3
acme prompt edit policy-search-v1   # opens editor; commits a draft version
acme prompt diff policy-search-v1@v2.3 policy-search-v1@v2.4
acme prompt eval policy-search-v1@v2.4 --suite=production
acme prompt promote policy-search-v1@v2.4 --to=staging
acme prompt promote policy-search-v1@v2.4 --to=production --requires-review
```

`promote --to=production` triggers the prompt review committee for Medium/High-tier features. Without the registry, prompts live in code; with the registry, they live in a system that can answer "who changed this prompt three months ago, and what eval score did it have at the time?"

## Eval-suite scaffolds

Each golden-path template ships an eval-suite scaffold. A `rag-qa` scaffold provides:

```
evals/
  cases/
    01-basic-policy-lookup.yaml
    02-policy-with-citation.yaml
    03-refusal-out-of-scope.yaml
    ...
  scorers/
    groundedness.py        # uses an LLM judge with a known-good prompt
    citation_accuracy.py
    refusal_correctness.py
  suites/
    smoke.yaml             # 10 cases, runs on every PR
    production.yaml        # 200+ cases, runs nightly + on promotion
  fairness/
    locale_slice.yaml      # same cases, varied locales
    persona_slice.yaml     # same cases, varied user personas
```

Feature teams add their own cases on top. The scaffold means the team isn't reinventing the eval harness, the scorer prompts, or the slicing methodology.

## Gateway-keys-as-code

Workload identity, per-feature policies, model allowlists, spend caps — all in Terraform under `acme/gateway-policies`. A feature's policy lives in a YAML file (see the [Architecture page](./04-architecture.md) for the shape); changes go through PR review with platform-team approval.

This is the difference between "an engineer Slacks the platform team for a gateway key" and "an engineer opens a PR that platform reviews in 24 hours." The latter scales; the former doesn't.

## Model registry

Centrally curated. Each entry:

```yaml
# model-registry/anthropic-claude-sonnet-4-5.yaml
model_id: anthropic.claude-sonnet-4-5
providers:
  - aws-bedrock (us-east-1, eu-west-1, ap-southeast-2)
  - vertex (us-central1, europe-west4)
approved_for_tiers: [low, medium, high]
approved_for_data_classes: [public, internal, customer-confidential, phi]
not_approved_for: [classified-restricted]
contracts:
  - vendor: aws
    type: enterprise-private-endpoint
    data_residency: contract-bound, no training
  - vendor: gcp
    type: vertex-private-endpoint
    data_residency: contract-bound, no training
eol_date: 2027-08-01
deprecation_warning: false
notes: |
  Preferred default for Medium-tier text generation as of 2026 Q1.
  Excellent groundedness scores on internal RAG eval; ~3x cheaper than
  Sonnet 4 with similar quality.
```

Feature teams pick from the registry. Adding a new entry requires Procurement + Security + Legal sign-off (the [Procurement page](./procurement.md) covers this).

## A representative day on the platform team

Most platform-team work breaks down into:

- **Paved-road shipping** — new templates, new eval scorers, new SDK features.
- **Migration tooling** — when a model EOLs or a policy changes, codemods + dashboards.
- **Feature-team office hours** — embedded help, often the highest-leverage time.
- **On-call** — the gateway is now critical infrastructure; pages happen.
- **Eval-clinic sessions** — co-author eval suites with feature teams that need help.

Platform-team OKRs are typically about *paved-road adoption percentage* (e.g., "85% of AI features use the standard SDK by EOY") rather than "ship N features."

## Common mistakes

:::caution[Where people commonly trip up]
- **Building the platform in isolation.** A platform team that doesn't sit with feature teams ships features feature teams don't want. Embed rotations — platform engineers spending two weeks per quarter inside a consuming team — keep the roadmap honest.
- **Shipping a scaffold without an opinion.** A template that "supports any pattern" is no template. Pick the 4–8 patterns most of the company actually builds and make those one-command excellent; refuse the rest until they're real.
- **Forgetting day-2 ergonomics.** The scaffold gets a feature to green PR. Day 2 is "how do I add an eval case," "how do I see my gateway logs," "how do I rotate my prompt." Build the CLI for day 2 too, or your scaffold is a one-day honeymoon.
- **Letting the prompt registry diverge from the deployed prompts.** If the registry and the running code can drift, the registry becomes a documentation site that nobody trusts. Make the SDK fetch by registry ID at runtime; make code reviews fail if a prompt isn't in the registry.
- **Treating the eval scaffold as optional.** Templates without evals produce features without evals. Eval suites are part of the scaffold, not an upgrade.
- **Running an eternal migration with no deadline.** When a model EOLs or the SDK changes, ship a codemod, post a dashboard tracking adoption by team, escalate laggards to their directors, and pick a removal date. Without a date, nobody migrates.
- **Investing in the senior AI engineers' workflow first.** They already know the tricks. The right customer is the back-end engineer adding their first AI feature next month — and the best DevEx metric is "minutes from `acme ai feature new` to a passing eval on a non-trivial case."
:::

## What's next

→ Continue to [Development Practices for AI Code](./07-development-practices.md) — what daily coding looks like once the platform exists.
