---
id: enterprise-regulatory
title: Regulatory Landscape (Deep Dive)
sidebar_position: 24
sidebar_label: Regulatory landscape
description: EU AI Act, sector-specific rules (HIPAA, GLBA, NYDFS, SR 11-7, FDA AI/ML), state laws, NIST AI RMF — what enterprise AI teams plan for in 2026.
---

# Regulatory Landscape (Deep Dive)

> **In one line:** In 2026 an enterprise AI team plans for the EU AI Act (enforcement ramping through 2025–2026), a stack of US sector-specific rules (HIPAA, GLBA, SR 11-7, FDA AI/ML), a growing patchwork of US state laws (NYC LL144, Colorado AI Act), and the NIST AI RMF as a de-facto contractual framework — and audit-readiness is a continuous operational state, not a launch event.

:::tip[Where this fits]
The [Security & Compliance page](./12-security-compliance.md) covered the regimes and the artifacts they want. This page is the deeper read on the regimes themselves: what each one requires, who it affects, what the realistic 2026 enforcement posture looks like, and how enterprise AI teams operationalize compliance into their day-to-day work.
:::

## The big ones in 2026

### EU AI Act

The most consequential global AI regulation in 2026. Risk-tiered:

- **Unacceptable risk** (social scoring, real-time biometric ID in public for law enforcement, certain manipulation) — prohibited.
- **High risk** (hiring, credit scoring, critical infrastructure, education, biometrics, law enforcement adjacents, certain medical devices) — mandatory documentation, transparency, human oversight, conformity assessment before market placement, post-market monitoring.
- **Limited risk** (chatbots, generative AI for content) — transparency obligations (e.g., AI-generated content must be disclosed).
- **Minimal risk** (most other AI) — voluntary codes of conduct.

Penalties up to **7% of global annual revenue** (for prohibited-use violations) or 3% for other violations. Enforcement bodies in each member state; coordination via the AI Office.

**2026 status:** the Act entered into force in August 2024 with staged applicability through 2025–2027. By mid-2026, the prohibited uses, general-purpose AI obligations, and most High-risk requirements are in force. Enforcement is ramping; a few high-profile actions have signaled regulators are not waiting.

**Operational impact:** any enterprise serving EU users with anything potentially High-risk needs a technical documentation package, a human-oversight design, a post-market monitoring plan, and a conformity-assessment record. The artifact production is heavy.

### US sector-specific rules

- **HIPAA** (healthcare PHI) — BAA with every model provider touching PHI; audit logs; breach notification within 60 days; minimum-necessary access; Privacy Rule and Security Rule.
- **GLBA** (US financial) — Safeguards Rule (security controls), Privacy Rule (data handling), increasingly AI-specific guidance from CFPB.
- **NYDFS Cybersecurity Regulation (23 NYCRR 500)** — applies to financial entities licensed in NY; CISO required, annual cert, multi-factor everywhere.
- **SR 11-7 (Federal Reserve Model Risk Management)** — for banks; any model that influences decisions is in scope; independent validation, model inventory, ongoing monitoring.
- **FDA AI/ML medical device guidance** — for clinical decision support that meets SaMD criteria; predetermined change control plans, real-world performance monitoring.
- **OCC, FFIEC, FINRA** — additional financial-services guidance increasingly addresses AI.

### GDPR & CCPA/CPRA

- GDPR data-subject rights (Article 15 access, Article 17 erasure, Article 22 automated-decision provisions) apply to AI outputs and to training data.
- DPIA (Article 35) is generally required for AI processing of personal data.
- CCPA/CPRA broadly similar for California residents; "automated decision-making" rulemaking active in 2025–2026.

### US state-level AI laws

Growing patchwork:

- **NYC Local Law 144** — Automated Employment Decision Tools (AEDTs); annual bias audit by independent auditor; candidate notification.
- **Colorado AI Act (SB 24-205)** — High-risk AI decisions about consumers; impact assessments; risk management programs; consumer notifications and appeals. Effective 2026.
- **California SB 1047** (status varies; vetoed/reintroduced cycles) — generative AI safety; large-model developer obligations.
- **Illinois, Texas, Connecticut, Utah** — biometric, automated-decision, and disclosure laws.

The trend is more state laws, not fewer; enterprise AI teams need a state-by-state tracking function.

### NIST AI RMF

US voluntary framework — Govern, Map, Measure, Manage. Increasingly cited in contracts (federal customers, large enterprise customers) as a baseline expectation. Many enterprises adopt NIST AI RMF as a "north star" so they have a defensible framework to cite regardless of which jurisdiction's rules apply.

### FedRAMP

For US federal customers: AI models must run in FedRAMP-authorized environments (Bedrock GovCloud, Azure Government), at appropriate impact levels (Moderate, High). StateRAMP is the equivalent for state-level work.

## Sector cross-walks

A reality check: most large enterprises are in scope for multiple regimes simultaneously.

| Enterprise type | Regimes typically in scope |
|---|---|
| Regional bank, US-only | SOC 2, GLBA, NYDFS (if NY-licensed), SR 11-7, ECOA / Reg B fair-lending, NIST AI RMF |
| Global bank | + EU AI Act, GDPR, sector rules in each jurisdiction |
| US health system | SOC 2, HIPAA, FDA AI/ML (if SaMD), state laws (Colorado, etc.) |
| Pharma R&D | + GxP, FDA 21 CFR Part 11, ICH guidelines |
| Retailer with EU presence | SOC 2, GDPR, EU AI Act (limited or high risk depending on use), CCPA |
| Federal contractor | + FedRAMP, FISMA, NIST SP 800-53 |
| Insurance (US) | SOC 2, GLBA, NAIC AI Model Bulletin, NYDFS Circular Letter 7 (insurance AI) |
| Hiring platform | + NYC LL144, Colorado AI Act, state AEDT laws |

## What "audit-readiness" looks like operationally

Audit-readiness is a continuous state, produced by good engineering practice — not a project that happens before an audit. The minimum:

- **Risk-tier per AI use case** with documented rationale (lives in the AI Risk Register).
- **Model card per deployed model**: purpose, training data summary, known limitations, eval results.
- **Prompt registry** with version history and review trail.
- **Eval result history** per feature, with bias-specific tests for High-risk uses.
- **Logging** that supports data-subject access and deletion requests.
- **Documented incident-response process** for AI failures (hallucinations causing harm, prompt injection, drift).
- **Continuous control monitoring** via Vanta / Drata / Secureframe.
- **Vendor due-diligence packets** kept current per vendor.
- **Per-feature human-oversight design** documented for any decisional use.

## EU AI Act in practical detail

Because it's the heaviest 2026 regime, a closer look at what it requires for a High-risk system:

- **Risk management system** (Annex VIII Article 9) — continuous, throughout the system lifecycle.
- **Data and data governance** (Article 10) — training/validation/test data quality, representativeness, bias mitigation.
- **Technical documentation** (Article 11, Annex IV) — comprehensive package: system description, design choices, monitoring methods, training data, validation results, system architecture.
- **Record-keeping** (Article 12) — automatic logging of events relevant to traceability.
- **Transparency and user information** (Article 13) — instructions for use, intended purpose, accuracy/robustness levels, predetermined human-oversight measures.
- **Human oversight** (Article 14) — meaningful human review of AI outputs, especially for decisions affecting individuals.
- **Accuracy, robustness, and cybersecurity** (Article 15) — appropriate levels per intended purpose; resilience to attacks (prompt injection, etc.); model accuracy reporting.
- **Quality management system** (Article 17) — for providers.
- **Conformity assessment** (Article 43) — before market placement.
- **Post-market monitoring** (Article 72) — ongoing.

The artifact production is heavy — and most of it draws from documents you already produce if your AI engineering practice is sound (model cards, eval suites, risk assessments, observability data). The work is the integration into a submission package, not net-new artifact creation.

## What enterprises actually do (2026 patterns)

- **Hire (or assign) a Responsible AI lead** by the time they have >5 deployed AI features.
- **Adopt NIST AI RMF as a north star** even when not strictly required — gives a defensible framework to cite.
- **Build an AI risk register** with the same rigor as the security risk register.
- **Tier vendors by where regulatory burden falls** — for many enterprises, the burden falls on them (the deployer), not the vendor (the provider). Vendors with explicit "we take the EU AI Act burden" terms are rare and valuable.
- **Run an annual external AI audit** in some regulated industries (banks especially), distinct from SOC 2.
- **Maintain a state-by-state tracking function** for US state AI laws as the patchwork grows.
- **Treat the EU AI Act readiness program as a multi-year initiative** with named exec sponsorship.

:::info[Highlight: regulatory burden usually falls on the deployer]
A common surprise for enterprise teams: when a vendor (e.g., a model provider) is the "provider" under the EU AI Act, and you (the enterprise) are the "deployer," many of the High-risk obligations fall on **you**, not the vendor.

- The conformity assessment, the technical documentation specific to your use, the human-oversight design, the post-market monitoring — all yours.
- The vendor's model card and provider documentation are *inputs* to your work, not substitutes for it.

This shapes vendor evaluation: a vendor that gives you good documentation, evaluation data, and a clean operational story makes your compliance burden lighter, even if their model is slightly weaker than a competitor's whose documentation is poor.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Treating "we don't sell into the EU" as a reason to ignore the EU AI Act.** If EU users can reach your AI, you're in scope. The Act has extraterritorial reach.
- **Adopting NIST AI RMF as a slide deck.** If the framework is in the deck but the controls aren't operationalized in your engineering practice, you'll fail any audit that takes it seriously.
- **Treating SR 11-7 as "the MRM team's problem."** At a bank, the AI engineer is a co-owner of the SR 11-7 artifact production. Engineers who treat MRM as external become the bottleneck on every launch.
- **Assuming the vendor's documentation covers your EU AI Act obligations.** Vendor docs are inputs; the deployer-specific obligations are yours.
- **Ignoring US state laws because "they don't apply to us."** They apply more often than people think; the patchwork grows quarterly. Build a tracking function.
- **Audit-driven engineering.** Reverse it — good engineering produces audit-ready artifacts as a side effect. If your engineering practice doesn't, the engineering is wrong, not the audit.
- **Underestimating EU AI Act technical documentation work.** The package per High-risk system is substantial. Start the artifact pipeline at the beginning of the feature lifecycle, not the end.
- **No documented human-oversight design.** "There's a human in the loop somewhere" isn't a design. The human-oversight design has to be specific: who, with what UI, with what training, with what override authority.
:::

## What's next

→ Back to [Enterprise AI overview](./index.md), or continue to the [Checkpoint](./19-checkpoint.md) to self-test, then on to [Chapter 12: Comparison](/docs/comparison).
