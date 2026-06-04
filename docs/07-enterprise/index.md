---
id: enterprise-ai-workflow
title: 11. Enterprise AI — Overview
sidebar_position: 1
sidebar_label: Enterprise intro
description: 500+ engineers, governance, private cloud, SOC 2 / HIPAA / FedRAMP / EU AI Act, MLOps + LLMOps. The shape of enterprise AI work in 2026.
---

# Part 11: The Enterprise AI Workflow (500+ Engineers)

*For organizations where every AI decision involves Legal, Security, Procurement, Risk, and at least one VP.*

> **In one line:** Enterprise AI work is half engineering, half governance — the model stack looks a lot like a startup's, but the *process* around it is what actually defines the job.

:::tip[In plain English]
At a startup, an engineer can decide on Monday to use a new model, sign up with a credit card, and ship a feature by Friday. At an enterprise — a bank, a hospital system, a Fortune 500 retailer, a federal agency — that same path takes 3–9 months and involves Security, Privacy, Legal, Procurement, Risk, an AI governance committee, and a VP-level approval.

That's not because enterprise AI engineers are slower or worse. It's because a wrong AI decision at this scale can violate the EU AI Act (up to 7% of global revenue), trigger an HHS OCR investigation under HIPAA, leak protected customer data, or — for regulated industries — get a model risk officer fired. The stakes are genuinely different, so the process is genuinely different.

If you've only worked at startups, the easiest way to misread enterprise AI work is to assume the governance is incompetence or bureaucracy. Usually it's scar tissue from real incidents — at this company or a peer company that made the news.
:::

## What changes at this scale

The technical stack — Bedrock, Azure OpenAI, vector DBs, eval harnesses, prompt registries — is mostly the same as a well-engineered startup. What changes is everything around it:

- **Governance is the work, not the overhead.** Who can deploy an AI feature? Who reviews the prompts? Who signs off on the eval bar? Who owns the model risk register? At an enterprise, those questions have specific named owners, written policies, and audit trails.
- **Data can't leave your perimeter.** Sensitive workloads must run via private endpoints (AWS Bedrock, Azure OpenAI, GCP Vertex), or on self-hosted open models on internal GPUs. "Just call OpenAI" is not on the menu for regulated data.
- **Compliance is non-negotiable.** SOC 2 + HIPAA + GDPR + ISO 27001 + FedRAMP + EU AI Act + sector-specific (SR 11-7 for banks, FDA AI/ML for medical devices). Every one of these regimes wants artifacts an AI team has to produce.
- **A central AI platform team exists.** They own the gateway, evals, observability, prompt registry, RAG infrastructure, and fine-tuning platform. Feature teams build on top — they don't pick their own vector DB.
- **Procurement gates everything.** Vendor reviews run 3–9 months. New AI tools without an existing approval path are effectively unavailable to product teams.
- **Standardization beats local optimization.** Six teams each picking a "slightly better" vector DB is a worse outcome than all six using the company-paved one. The cost of fragmentation at 500+ engineers exceeds the cost of suboptimal tools.

## The 2026 enterprise AI stack at a glance

A representative stack at a Fortune 500 in 2026:

- **Models via private endpoints:** AWS Bedrock (Claude, Llama, Mistral, Titan), Azure OpenAI (GPT-4o, GPT-4.1, o-series), GCP Vertex AI (Gemini, Claude on Vertex).
- **Self-hosted open models** for sensitive or high-volume narrow tasks: Llama 3/4, Mistral, Qwen on vLLM/TGI running on internal H100/MI300 clusters.
- **Central AI gateway:** Portkey Enterprise, Kong AI Gateway, Apigee, or an in-house Envoy-based gateway. Single chokepoint for auth, rate limiting, PII redaction, audit logging.
- **Eval + prompt platform:** Braintrust, Vellum, LangSmith Enterprise, or an in-house registry on top of MLflow.
- **LLM observability:** Datadog LLM Observability or Splunk + Langfuse / Arize Phoenix layered on top.
- **Vector / retrieval:** Vespa, Pinecone Enterprise, OpenSearch with vector plugins, Databricks Vector Search, or Snowflake Cortex Search.
- **MLOps + LLMOps fusion:** SageMaker, Vertex AI Pipelines, Databricks Mosaic AI, Azure ML.
- **Governance tooling:** Vanta, Drata, OneTrust for compliance; in-house model registry on top of MLflow or a custom service.
- **Identity / secrets:** Okta + HashiCorp Vault + cloud KMS.

**Mental model:** Solo AI dev = a chemist working in a home lab. Startup AI = a small biotech with three scientists. Enterprise AI = Pfizer — pipelines, QA, regulatory affairs, batch records, FDA inspections, and a forty-page SOP for changing the label on a bottle. All three "make medicine," but only one of them ships to a billion people without killing anyone.

## How this chapter is organized

Each page focuses on one slice of enterprise AI work. Read in order the first time; revisit individual pages later.

### Setting the stage

1. [The Enterprise AI Mindset](./01-mindset.md) — Governance is the work; standardization beats local optimization.
2. [Team Structure at This Scale](./02-team-structure.md) — Platform team, feature teams, CoE, risk/legal partners.

### Phase-by-phase walkthrough

3. [AI Portfolio Planning](./03-planning.md) — Annual + quarterly portfolio, risk-tiered intake, business-unit sequencing.
4. [Enterprise AI Reference Architecture](./04-architecture.md) — Gateway, policy engine, providers, evals, observability, SIEM.
5. [AI in Enterprise Frontends](./05-frontend-architecture.md) — Design-system AI components, accessibility, i18n, A/B at scale.
6. [The Internal AI Platform](./06-developer-experience.md) — Golden-path templates, prompt CLI, eval scaffolds, gateway-keys-as-code.
7. [Development Practices for AI Code](./07-development-practices.md) — Code review, prompt review committees, pair-programming rituals.
8. [Testing AI in Regulated Environments](./08-testing.md) — Adversarial layers, bias / fairness, FedRAMP/HIPAA test artifacts.
9. [CI/CD for AI](./09-ci-cd.md) — Multi-stage pipeline, segregation of duties, eval gating, canary deploys.
10. [Deployment & Change Management](./10-deployment.md) — Release windows, blast-radius limits, platform-level kill switches.
11. [Observability & Audit Logging](./11-observability.md) — Datadog/Splunk + Langfuse/Phoenix + SIEM, audit logs, data residency.
12. [Security & Compliance Artifacts](./12-security-compliance.md) — SOC 2, HIPAA, GDPR, EU AI Act, SR 11-7, NIST AI RMF.
13. [Release Management](./13-release-management.md) — Release trains, emergency patches, model-vulnerability response.

### The existing-pages deep-dives

These pages cover the original five "what's different about enterprise AI" topics, expanded:

- [The enterprise AI org chart](./org-chart.md) — Platform team vs. feature teams; the AI center of excellence.
- [Governance & risk](./governance.md) — Model registry, prompt review, risk tiering.
- [Deployment topology](./deployment.md) — Private endpoints, hybrid, on-prem.
- [Procurement & vendor management](./procurement.md) — How to actually get a new AI tool approved.
- [Regulatory landscape](./regulatory.md) — EU AI Act, sector-specific rules, audit-readiness.

### Reality check

14. [A Realistic AI Cost Picture](./14-cost-picture.md) — $1M–$50M+/year, FinOps chargeback, vendor commits, self-host ROI.
15. [Enterprise-Specific Pitfalls](./15-pitfalls.md) — Governance theater, vendor sprawl, shadow AI, eval-set neglect.
16. [A Day in the Life](./16-day-in-life.md) — An hour-by-hour walkthrough for an enterprise AI platform engineer.
17. [When to Use an Org-Wide AI Platform](./17-when-to-use.md) — When it's justified; signals it's premature.
18. [When You're "Too Big"](./18-too-big.md) — Pathologies of over-centralized AI.

### Checkpoint

19. [Chapter checkpoint](./19-checkpoint.md) — Self-test on the core ideas.

---

→ Start with [The Enterprise AI Mindset](./01-mindset.md).
