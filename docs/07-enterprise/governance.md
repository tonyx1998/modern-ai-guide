---
id: enterprise-governance
title: Governance & Risk (Deep Dive)
sidebar_position: 21
sidebar_label: Governance (deep dive)
description: Model registry, prompt registry, risk tiering, prompt review committees, AI Risk Review process. The artifacts auditors want and the process that produces them.
---

# Governance & Risk (Deep Dive)

> **In one line:** Working enterprise AI governance produces a continuous stream of artifacts — model cards, risk-tier assignments, prompt registry entries, eval results, prompt-review records, AI Risk Review sign-offs — that map directly to the controls auditors and regulators look for.

:::tip[Where this fits]
The [Mindset](./01-mindset.md) page argued that governance *is* the work, not overhead. The [Security & Compliance](./12-security-compliance.md) page covered the formal regimes (SOC 2, HIPAA, EU AI Act). This page is the operational view: what the governance function does day-to-day, what artifacts it produces, what its rituals look like, and how to keep it from sliding into theater.
:::

## The artifacts auditors actually want

The list is long but the shape is consistent. For every AI feature in production, an auditor wants to be able to ask "show me…" and get a link back. The minimum set:

- **A model registry entry** — every model in use, its version, its provider, its data residency, its opt-out status, its approved-use cases.
- **A prompt registry entry** — every production prompt, its owner, its current version, its eval suite, its last review date, its committee sign-off.
- **A risk tier per AI feature** — Low / Medium / High, with documented rationale.
- **A model card per feature** — purpose, intended users, out-of-scope uses, training data summary, evaluation methodology and latest results, known limitations, human oversight design.
- **A per-feature risk assessment** for Medium and High tier — threats considered (bias, prompt injection, hallucination harm, data exfiltration), mitigations, residual risk, sign-offs.
- **Audit logs** — every prompt and response, retained per policy, region-resident, supports targeted deletion for GDPR.
- **Eval results history** — demonstrating that quality was measured before and after each change, with adversarial and fairness slices.
- **Prompt-review records** — who approved which promotion when, with the eval-score deltas at the time.

## Risk tiering (the load-bearing classification)

The most important governance decision per feature, made at intake (the first week):

| Tier | Criteria | Review depth | Typical lead time |
|------|----------|--------------|---------------------|
| **Low** | Internal-only, non-sensitive data, advisory output, no PII | Self-service intake form + platform-team review | 1–2 weeks |
| **Medium** | Customer-facing OR sensitive internal data, but non-decisional and no PHI/PCI | Standard review: eval bar, prompt review, privacy check | 4–8 weeks |
| **High** | Customer-facing AND (decisional OR PHI/PCI/PII OR regulated domain OR EU AI Act high-risk) | Full review: model risk + bias + adversarial + human-oversight design + AI Governance Committee sign-off | 12–26 weeks |

Most enterprise AI features end up Medium. The High tier triggers the dedicated risk-management committee and the heaviest artifact production.

Tier reassignment happens too — a Medium feature that gains a decisional component becomes High; a High feature that's narrowed in scope can drop to Medium. The reassignment is itself a governance event.

## What the AI Risk Review process looks like

A Medium-tier feature, end-to-end:

1. **Intake** (Week 1) — feature team submits the AI feature intake form. CoE auto-tier suggestion + human confirmation. AI Risk ticket opened.
2. **Architecture review** (Week 1–2) — platform team confirms the feature fits the paved road (model in registry, gateway routing, eval scaffolding).
3. **Privacy review** (Week 2–3) — Privacy partner reviews data flow, classifications, DPIA implications.
4. **Security review** (Week 2–3) — Security partner reviews threat model: prompt injection, exfiltration, indirect injection via RAG, tool-use abuse.
5. **Eval bar agreement** (Week 3) — CoE and feature team agree on the eval-suite minimum size, the scorers, the smoke/production split, the adversarial slice, the fairness slice.
6. **Development** (Week 4–6) — feature team builds; eval suite grows.
7. **Prompt promotion to staging** (Week 6) — prompt-review committee signs off on the staging prompt.
8. **Pre-launch evaluation** (Week 7) — full eval suite passes. Adversarial cases pass. Fairness deltas within thresholds (or triaged with explanations).
9. **Prompt promotion to production** (Week 8) — prompt-review committee with Risk partner present signs off on the production prompt.
10. **Change ticket + CAB** (Week 8) — release manager files the change ticket; CAB confirms readiness.
11. **Production rollout** (Week 8) — canary, ramp, full.
12. **Post-launch artifacts** (Week 9) — model card finalized, AI Risk register updated, monitoring confirmed live.

The High-tier version of this process adds: an AI Governance Committee sign-off at week 7, an independent model-validation pass for SR-11-7-relevant features, an EU AI Act technical documentation package for High-risk uses.

## The prompt review committee

A standing committee for Medium and High tier prompt promotions. Composition varies but typically:

- **Chair:** rotating; usually a senior AI engineer or CoE member.
- **At least one AI engineer** outside the feature team (for cross-team perspective).
- **A domain SME** for the feature's domain (e.g., a claims adjuster for claims-summary).
- **An AI Risk partner** for High-tier.

**Cadence:** queue reviewed twice a week. Staging promotion is fast (24–48 hours, sometimes async). Production promotion requires the committee meeting.

**What they look for:** see the [Development Practices page](./07-development-practices.md) for the prompt-review checklist. The committee isn't re-reviewing the technical engineering — that's the PR reviewers' job. The committee reviews scope, safety phrasing, refusal patterns, citation rules, locale handling, and the eval-score delta vs. the last production version.

**Output:** a signed record in the prompt registry. The committee member's identity, the date, the eval-score baseline, and any conditions attached.

:::info[Highlight: real reject rates are the health metric]
A committee that approves 100% of submissions inside 5 minutes per item is theater. A working committee has:

- Real reject rates (10–25% of submissions sent back with concrete changes).
- Real deferrals when artifacts are incomplete.
- Real eval-bar enforcement (a regression in groundedness is a "fix and resubmit," not an "approved with concern").

If your committee approves everything, you're not running governance — you're generating an audit record. Auditors who look at substance, not just form, will notice.
:::

## The model registry

A centrally curated list of approved models. Each entry carries provider, regions, approved-for-tiers, approved-for-data-classifications, contract terms (residency, training opt-out), EOL date, and notes. See the [Developer Experience page](./06-developer-experience.md) for the YAML shape.

Adding a new model is itself a governance event: Procurement + Security + Legal + Responsible AI all sign off. Removing or EOL-ing a model triggers the model-EOL playbook (see [Release Management](./13-release-management.md)).

The model registry feeds: the gateway's policy engine (only registry-approved models can be called), the CI policy-lint (PRs that reference a non-registry model fail), and the audit/compliance artifact pipeline (model cards are generated per registry entry per feature).

## The AI Risk Register

A separate artifact from the model registry. Lives with the Responsible AI function. Each entry:

- **Risk ID** and category (bias, hallucination, prompt injection, data leakage, regulatory, vendor concentration, etc.).
- **Affected features** (or "platform-wide").
- **Likelihood × impact** scoring.
- **Mitigations in place** and their owners.
- **Residual risk** rating.
- **Review cadence** (often quarterly).
- **Trigger events** that would re-escalate.

A typical enterprise risk register has 30–80 entries; the items get reviewed quarterly by the Responsible AI committee. The point is the *active management*, not the document.

:::note[→ Going deeper]
The governance *rituals* on this page sit on top of the AI-safety primitives covered in Chapter 6. For the underlying controls — how to set up [AI governance as a function](/docs/safety/safety-governance), defend against [prompt injection](/docs/safety/safety-prompt-injection), and wire in [guardrails](/docs/safety/safety-guardrails) — start at the [Safety overview](/docs/safety).
:::

## Tooling that helps

- **Braintrust, Vellum, LangSmith Enterprise** — prompt registry + eval platform.
- **MLflow, in-house registries** — model registry storage.
- **Vanta, Drata** — control-mapping and evidence collection across SOC 2 / ISO 27001 / HIPAA.
- **OneTrust** — privacy / DPIA workflow.
- **In-house GitOps repos** — for gateway policies, model registry entries, eval suites. Version-controlled, reviewed via PR.

The shape is the same as the rest of enterprise engineering: every artifact has one system of record, with the others linking back.

## What "governance theater" looks like (in case you need to spot it)

- AI Risk Review meetings approving 100% of items in \&lt;10 min.
- Model cards filled with "TBD" and shipped anyway.
- Quarterly portfolio reviews that re-defer the same decisions.
- A Responsible AI lead with no budget and no veto.
- Prompt review committees where one engineer signs off on everything.
- Eval suites with the same 30 cases as 6 months ago.

See the [Pitfalls page](./15-pitfalls.md) for the longer treatment. The short version: real governance produces visible work — rejections, refinements, deferrals — and silent governance is usually theater.

## Common mistakes

:::caution[Where people commonly trip up]
- **Treating risk tiering as paperwork.** The tier drives everything downstream — review depth, model choice, deployment topology, audit retention, regulatory regime. Getting it wrong at intake creates weeks of rework. Spend the 30 minutes at intake.
- **Approving everything in the prompt-review committee.** A 100% approval rate isn't governance; it's a stamping operation. Healthy committees reject 10–25% with concrete refinements.
- **Multiple sources of truth for the model registry.** Three lists of "approved models" in three systems guarantees inconsistency. One registry, with everywhere else linking back.
- **An AI Risk Register that doesn't get reviewed.** A static risk register is a museum piece. Quarterly active review with owners updating mitigations is what makes it real.
- **Hiring a Responsible AI lead without authority.** Without budget, headcount, or veto on launches, the role becomes ceremonial. Either grant the authority or don't create the role.
- **Letting the model card lag the feature.** A model card written at launch and never updated drifts from reality. Tie model-card freshness to prompt promotions.
- **Forgetting that risk tiering is dynamic.** A Medium feature that adds a decisional capability is now High and needs the full review. Build the re-tiering moment into your change-management process.
:::

## What's next

→ Next: [Deployment topology](./deployment.md) — the four deployment patterns and how the governance constraints drive the choice.
