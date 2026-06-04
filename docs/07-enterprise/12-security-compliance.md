---
id: enterprise-ai-security-compliance
title: 'Phase 10: Security & Compliance Artifacts'
sidebar_position: 13
sidebar_label: 12. Security & Compliance
description: SOC 2 + HIPAA + GDPR + EU AI Act + sector-specific (SR 11-7 model risk, NIST AI RMF) artifact production for enterprise AI.
---

# Phase 10: Security & Compliance Artifacts

> **In one line:** At enterprise scale, AI engineering produces a constant stream of artifacts — model cards, eval reports, prompt-review records, audit logs, risk assessments — that map directly to the controls SOC 2, HIPAA, GDPR, EU AI Act, SR 11-7, and NIST AI RMF auditors look for.

:::tip[In plain English]
At a startup, "compliance" usually means "we got SOC 2 Type I last year and we'll redo it." At an enterprise, compliance is a continuous artifact-production pipeline. Every AI feature you ship generates documents, every eval run produces evidence, every prompt change leaves a trail.

The good news: most of these artifacts fall out naturally if your platform is built right. The model card mostly populates from the feature manifest. The eval evidence comes from the eval platform. The audit log is the gateway's structured record. The hard part is wiring them together so an auditor can answer "show me everything about feature X" with a few clicks instead of a six-week scavenger hunt.
:::

## The major regimes (2026)

| Regime | Scope | Key AI-relevant pieces |
|---|---|---|
| **SOC 2 Type II** | Service organization controls; almost any SaaS/enterprise | Segregation of duties, change management, access logging, audit retention |
| **ISO 27001** | InfoSec management | Risk management, control documentation |
| **HIPAA** | US healthcare PHI | BAA with model providers, PHI handling, audit logs, breach notification |
| **GDPR / CCPA** | EU / California personal data | Data subject rights, processing records, DPAs, residency |
| **EU AI Act** | AI systems placed in the EU | Risk tiering, technical documentation, human oversight, post-market monitoring |
| **SR 11-7** | US bank model risk | Independent validation, model inventory, ongoing monitoring |
| **NIST AI RMF** | US framework (voluntary, often required by contract) | Govern, Map, Measure, Manage functions |
| **FedRAMP (M/H)** | US federal cloud | Authorized environments only (Bedrock GovCloud, Azure Government) |
| **NYC Local Law 144** | AI hiring tools in NYC | Annual bias audit, candidate notification |
| **Colorado AI Act** | High-risk AI decisions about consumers | Impact assessment, risk management program |

A typical Fortune 500 is in scope for at least 5 of these simultaneously.

## The artifacts you produce

### Model card (per deployed model)

A standardized document. Fields most regimes want to see:

```markdown
# Model Card — Claude Sonnet 4.5 in `policy-search-v1`

**Feature ID:** policy-search-v1
**Risk tier:** medium
**Use case:** Answer employee questions about HR policy with source citations.
**Intended users:** Internal employees (en-US, en-GB, es-MX, fr-FR locales).
**Out-of-scope uses:** Legal advice, medical advice, financial advice, decisions about pay/promotion.

## Model
- Provider: AWS Bedrock
- Model: anthropic.claude-sonnet-4-5
- Region: us-east-1, eu-west-1
- Data residency: contract-bound; no training on customer data.

## Training data
- Provided by Anthropic per Bedrock contract; details in vendor model card v4.5.
- No company fine-tuning.

## Retrieval corpus
- HR policy documents, version-pinned at 2026-04-30 snapshot.
- ACL-aware retrieval (employees only see policies in their geography).

## Evaluation
- 220 cases in production suite; smoke=24; adversarial=48; fairness=64 (locale + name swap).
- Latest scores: groundedness 0.92, citation accuracy 0.94, refusal correctness 0.96.
- See `evals/results/2026-05-12.json`.

## Known limitations
- May refuse policy questions for jurisdictions outside the four supported locales.
- May confuse PTO and sick leave policies in regions where they're combined.

## Human oversight
- Users can flag any answer; flags route to HR ops.
- Quarterly review of flagged answers by HR + AI Risk partner.

## Last reviewed: 2026-05-12 by jchen (AI eng), alopez (HR SME), kpark (AI Risk)
```

### Risk assessment (per feature, per tier)

For Medium and High tier features. Identifies threats, mitigations, residual risk. Owned by the Responsible AI / AI Governance team in partnership with the feature team.

### Prompt-review records

For Medium and High tier. The promotion-to-production record carries the committee member who approved, the eval scores at the time, and any conditions attached.

### Eval-results history

Stored in the eval platform. Auditors can sample any deployed feature and confirm that the latest eval run beat the gating thresholds.

:::note[→ Going deeper]
The eval evidence auditors sample here is only as good as the eval practice that produced it. For how to build the suites, scorers, and production grading that feed this artifact, see [Chapter 5: Evaluation & Measurement](/docs/evaluation) — in particular [LLM-as-judge](/docs/evaluation/eval-llm-as-judge) and [production evals](/docs/evaluation/eval-production).
:::

### Audit logs

Every model call, retained per regime. The [Observability page](./11-observability.md) covers the storage; from a compliance perspective, the requirements are:

- **Tamper-evident** (S3 Object Lock, Azure Immutable Blob).
- **Retention enforced** (lifecycle policies, verified quarterly).
- **Region-resident** (EU stays in EU).
- **GDPR-compatible** (targeted deletion possible).
- **Searchable in days, not months** (Athena/Synapse query path).

### Data Protection Impact Assessment (DPIA)

Required under GDPR for high-risk processing — which includes most AI features touching personal data. Lives with the Privacy team; the AI team supplies the technical input (what data, what processing, what retention, what residency).

### EU AI Act technical documentation

For High-risk systems, a documentation package per the Act's Annex IV: intended purpose, system architecture, model details, training/validation data summary, evaluation results, human oversight design, accuracy/robustness/cybersecurity reports, post-market monitoring plan.

This is the heaviest artifact regime in 2026 enterprise AI work. Most of it draws from documents you already have (model card, eval suite, risk assessment, architecture diagram); the work is the *integration* into a single submission package.

### Vendor due-diligence packets

For each model provider, kept current:

- SOC 2 Type II report.
- ISO 27001 cert.
- HIPAA BAA (if applicable).
- DPA with EU representative info.
- Sub-processor list with monitoring.
- Pen test summary.
- AI-specific: training-data sourcing summary, opt-out controls, model-card-of-the-provider.

## Tooling that helps

- **Vanta, Drata, Secureframe** — control-mapping for SOC 2, ISO 27001, HIPAA. Pull evidence automatically from cloud accounts and ticketing.
- **OneTrust** — privacy / DPIA workflow.
- **In-house model registry** — model card storage and renewal tracking.
- **Eval platform** — Braintrust, LangSmith, MLflow as the eval-evidence store.
- **Audit log store** — S3 + Athena, or Azure Immutable Blob + Synapse.

The pattern is: each artifact has *one* system of record, and Vanta/Drata pulls from the system of record automatically rather than asking engineers to attest manually.

## Sector-specific notes

### Financial services (SR 11-7, OCC, NYDFS)

- Any AI feature that influences a decision is a "model" under SR 11-7.
- Requires independent validation by a model risk team separate from the development team.
- Model inventory, model risk register, ongoing monitoring thresholds.
- For consumer-credit models: fair-lending testing (ECOA, Reg B).

### Healthcare (HIPAA, FDA AI/ML)

- BAA with every model provider that may touch PHI.
- For clinical-decision-support that meets the FDA SaMD definition, FDA AI/ML guidance applies (predetermined change control plan, real-world performance monitoring).
- HHS OCR investigations are a real consequence; logging and access controls matter.

### Public sector (FedRAMP, StateRAMP)

- Models must be hosted in FedRAMP-authorized environments (Bedrock GovCloud, Azure Government).
- FIPS-validated cryptography end to end.
- Continuous monitoring evidence per FedRAMP CM controls.

:::info[Highlight: the auditor's question is "show me"]
The most common auditor question is **"show me"**:

- "Show me the model card for this feature."
- "Show me the eval results from before and after the prompt change on April 12th."
- "Show me the access logs for this PHI-classified prompt last quarter."
- "Show me how you'd delete a specific user's prompts from the audit log."

If the answer is "we can pull that together in a few days," you're failing. If the answer is "here, this link," you're passing. The artifact pipeline exists to make every "show me" a link, not a scavenger hunt.
:::

## What changes vs. startup AI compliance

| | Startup | Enterprise |
|---|---|---|
| **Regimes in scope** | Often 1 (SOC 2) | 5+ simultaneously |
| **Artifact production** | Pre-audit scramble | Continuous, automated |
| **Tooling** | Spreadsheets + a Vanta trial | Vanta/Drata + in-house registries |
| **Audit cadence** | Annual | Continuous control monitoring + multiple annual audits |
| **AI Act readiness** | "We'll figure it out" | Ongoing program, named owner |

## Common mistakes

:::caution[Where people commonly trip up]
- **Treating compliance as a pre-audit project.** The audit reveals the state of your continuous controls — not what you cobbled together in the two weeks before. The artifact pipeline runs every day, not annually.
- **Multiple sources of truth for the same artifact.** If the model card lives in three places, two of them will be wrong. One system of record per artifact, with everywhere else linking back.
- **Letting Vanta/Drata silently break.** The "automatic evidence collection" only works if the pulls are healthy. Treat broken Vanta pulls like broken CI — fix immediately, don't accumulate.
- **Skipping the EU AI Act readiness work because "we don't ship to EU."** If any EU user can use your feature, it's in scope. The Act has extraterritorial reach.
- **Treating SR 11-7 as "the model risk team's problem."** If you're at a bank, the AI engineer is a co-owner of the SR 11-7 artifact production. Engineers who treat MRM as someone else's job become the bottleneck on every launch.
- **No targeted-delete capability for GDPR.** A "we have audit logs" story collapses when GDPR Article 17 requires deletion of a specific subject's records. Design the audit store with selective-delete from day one.
- **HIPAA BAAs not refreshed when models change versions.** A BAA with Anthropic covers a specific service scope; switching to a new model variant may require an addendum. Procurement-to-platform handoff has to flag these.
:::

## What's next

→ Continue to [Release Management](./13-release-management.md) — how the trains of changes coordinate across many teams.
