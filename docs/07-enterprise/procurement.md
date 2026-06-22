---
id: enterprise-procurement
title: Procurement & Vendor Management (Deep Dive)
sidebar_position: 23
sidebar_label: Procurement & vendors
description: How a new AI vendor actually gets approved at a 500+ engineer enterprise. The 3-9 month timeline, what accelerates it, what slows it down, and how to run procurement in parallel with engineering.
---

# Procurement & Vendor Management (Deep Dive)

> **In one line:** A new AI vendor at a 500+ engineer enterprise takes 3–9 months to onboard — Security, Privacy, Legal, AI/Responsible-Use, and Procurement each have their own review — and the right play is to start all five clocks the same week you start the proof-of-concept, not after.

:::tip[In plain English]
At home, buying software means typing in a credit card. At a big company, buying an AI tool means five separate teams — Security, Privacy, Legal, the responsible-AI group, and the purchasing department — each examine the vendor before anyone can use it. That examination takes 3 to 9 months, and it can quietly become the longest part of your whole project. The trick this page teaches: start the paperwork the same week you start trying out the tool, so both finish around the same time.
:::

:::tip[Where this fits]
The [Architecture page](./04-architecture.md) lists the vendors a typical enterprise stack uses (Bedrock, Azure OpenAI, Vertex, Portkey, Vespa, Snowflake, Datadog, etc.). This page is the operational view: what it actually takes to add a new vendor to that list, why it takes so long, and what an engineer can do to make procurement *not* the bottleneck on a launch.
:::

## The reality

A new AI vendor — even a small one, even one you trust — typically requires:

- **Security review** (SOC 2 Type II, ISO 27001, SIG questionnaire, pen test reports).
- **Privacy review** (DPA, data flow diagram, sub-processors, residency, GDPR/CCPA assessment).
- **Legal review** (MSA, indemnification, IP terms, AI-specific clauses like training-data warranties).
- **AI / Responsible-Use review** (training data sources, model cards, bias testing posture, opt-out controls).
- **Procurement** (commercial negotiation, contract, PO, vendor master data setup).

End-to-end: **3–9 months**. For sensitive or high-spend deployments, longer (12+ months for new model providers with significant data exposure).

## What each function actually looks at

### Security review

- SOC 2 Type II report (current, ideally within 12 months).
- ISO 27001 cert (preferred but not always required).
- HIPAA BAA (if PHI is in scope).
- SIG (Standardized Information Gathering) questionnaire — long, detailed, painful for vendors but the standard.
- Pen test summary (third-party tested).
- Vulnerability disclosure program.
- Sub-processor list.
- For AI vendors specifically: how is the vendor itself securing its model traffic, its training data, its model weights, its customer prompts.

### Privacy review

- DPA (Data Processing Agreement) — usually a back-and-forth on terms.
- Data flow diagram — what data goes from us to them, where it sits, how long.
- Sub-processor list — every party that touches the data.
- Residency commitments — EU data stays in EU?
- GDPR Article 28 obligations, CCPA service-provider language.
- For AI: opt-out from training on customer data, content-retention policies, deletion-on-request.

### Legal review

- MSA (Master Service Agreement) — many clauses, often a multi-month negotiation.
- Indemnification (who pays if their model causes harm).
- IP ownership of outputs.
- Warranty / liability caps.
- Termination terms, exit / data portability.
- AI-specific: model-warranty language, training-data warranties, IP-infringement indemnity (for model outputs that arguably reproduce training data).

### AI / Responsible-Use review

- Training data sources — what was the model trained on; provenance.
- Model cards — capabilities, limitations, known biases, intended uses.
- Bias and fairness testing posture.
- Safety evaluations — what alignment / red-teaming the vendor has done.
- Versioning and EOL policy.
- Content provenance / watermarking (relevant under EU AI Act).

This function may sit in Legal, in Responsible AI, or as a virtual review by the AI Risk Committee.

### Procurement

- Commercial negotiation — list price → discount.
- Multi-year commit terms.
- Vendor master data setup.
- PO and invoicing.

## End-to-end timeline (typical)

A new mid-sized AI SaaS vendor (say, an eval platform):

| Phase | Elapsed time | Active work |
|---|---|---|
| Initial vendor discovery + POC | Week 1–4 | Engineering pilot, in parallel below |
| Security review (kickoff to closeout) | Week 1–10 | SIG response, doc review, follow-ups |
| Privacy review (DPA) | Week 4–14 | DPA back-and-forth |
| Legal review (MSA) | Week 6–18 | MSA negotiation |
| AI / Responsible-Use review | Week 6–12 | Model cards, training data discussion |
| Procurement / commercial | Week 12–18 | Discount, commit terms, PO |
| Contract signature + vendor onboarding | Week 18–20 | |
| Production go-live | Week 20+ | |

**End-to-end: 4–5 months for a relatively simple AI SaaS vendor.** A model provider with deep data exposure routinely takes 6–12 months.

## What accelerates it

- **Vendors with existing approvals at your company.** Adding a new SKU from an already-approved vendor (e.g., enabling a new Bedrock model on existing Bedrock contracts) can take days.
- **Vendors with SOC 2 Type II, ISO 27001, HIPAA BAA already in place.** Drastically shortens Security review.
- **Vendors with private deployment options** (BYO cloud, single-tenant, contractual data-residency).
- **Buying through a hyperscaler marketplace** (AWS Marketplace, Azure Marketplace, GCP Marketplace). The marketplace often inherits an existing contract path, shortens Procurement, and applies existing approved vendor status.
- **Pre-approved AI vendor list.** The Responsible AI / Procurement function maintains a curated shortlist of pre-vetted AI vendors. Engineers steered to this list ship faster.
- **Vendor liaison engagement.** Larger vendors have enterprise customer-success teams who shepherd their own review process; use them.
- **Standard contracting templates** for AI vendors (the company's preferred clauses already drafted).

## What slows it down

- **Sub-processor list with surprising entries** (e.g., training data labeled by a third party in a country your residency policy disallows).
- **Training-on-customer-data terms** without strong opt-out.
- **No EU residency option** for a tool you'll need in EU.
- **New ownership / unclear funding** — vendors recently acquired or with funding question marks.
- **"Beta" or "preview" SKUs.** Legal hates these because the warranty language is often weak.
- **Vendor that refuses to sign your DPA without significant edits.** Long back-and-forth.
- **Vendor without a HIPAA BAA when you need one.** Often a deal-breaker for healthcare-adjacent companies.
- **Vendor without a SOC 2.** Possible to navigate but adds months of additional security review.

## The pragmatic playbook

Working patterns:

- **Start vendor onboarding the same week you start the POC.** Both clocks run in parallel. By the time engineering says "this works, let's ship," the legal/security clocks are already half-done.
- **Maintain a pre-approved AI vendor shortlist.** New AI work goes to the shortlist first; off-shortlist requires a deliberate "we need this" justification.
- **Use the gateway to abstract providers.** Adding a new model provider behind the gateway is a smaller change than adding a new app-level integration; the engineering surface is smaller, so the review surface is smaller.
- **Lean on hyperscalers when timelines are tight.** Bedrock-mediated access to Anthropic is often *much* faster than a direct Anthropic enterprise contract, because the contract is already in place via AWS.
- **Use marketplace SKUs.** AWS Marketplace + Azure Marketplace + GCP Marketplace cover much of the AI ecosystem in 2026; the inherited contract path is real value.
- **Get engineering to the negotiation table.** Pure-procurement negotiations get list-minus-30%; engineering input on load shape, commit horizon, model mix gets list-minus-50% or better.

:::info[Highlight: the gateway shortens the procurement surface]
The deepest reason every mature enterprise eventually has a central AI gateway isn't observability or cost — it's that **the gateway shortens the procurement surface for new providers**.

Without a gateway, adding "let's try Mistral Large for our French support feature" means a new app-level vendor integration, new auth, new observability wiring, new exception handling — and a procurement review focused on a complete application stack.

With a gateway, the same "let's try Mistral Large" is "add this model to the registry, route this feature's calls to it." Procurement reviews a much smaller surface; engineering ships in days instead of months once approval lands.

This is one of the highest-leverage operational benefits of central platform investment, and it almost never shows up in the platform team's stated value proposition.
:::

## Vendor ongoing management

Approval isn't the end. Ongoing:

- **Annual SOC 2 refresh.** Vendor's SOC 2 report needs to be re-reviewed annually.
- **DPA + sub-processor updates.** Vendors update their sub-processor lists; you need to be notified and re-approve.
- **Contract renewals.** Multi-year commits hit renewal; renegotiate based on actual usage and roadmap.
- **Incident notifications.** Vendor security incidents have to be communicated within contractual SLAs.
- **EOL handling.** Vendor announces a model EOL; your model-EOL playbook kicks in (see [Release Management](./13-release-management.md)).

A "Vendor Relationship Manager" role often exists for major vendors at large enterprises — the named human who keeps the relationship healthy.

## What changes vs. startup vendor procurement

| | Startup | Enterprise |
|---|---|---|
| **Onboarding time** | A credit card | 3–9 months |
| **Reviews required** | None | Security + Privacy + Legal + AI + Procurement |
| **Contract type** | Click-through TOS | MSA, DPA, BAA, custom AI clauses |
| **Procurement** | Doesn't exist | Multi-month commercial negotiation |
| **Hyperscaler advantage** | Doesn't apply | Often the fastest path |
| **Marketplace advantage** | Marginal | Major time-saver |

## Common mistakes

:::caution[Where people commonly trip up]
- **Starting procurement after the POC succeeds.** You've just added 3–9 months to the timeline. Start both clocks the same week.
- **Picking a vendor that doesn't have a SOC 2 because "the product is so much better."** The product being better is rarely worth 6 extra months. Pick the SOC-2-having competitor when you can; push the better one to get a SOC 2 if you must.
- **Skipping the hyperscaler / marketplace path when it's available.** The contract overhead is the largest hidden cost in enterprise AI vendor onboarding. If the hyperscaler version exists, take it.
- **Negotiating without engineering input.** Procurement alone gets list-minus-30%; engineering at the table gets list-minus-50%+ with better commit terms. Be in the room.
- **Letting the pre-approved vendor list go stale.** A list updated annually is a list nobody uses by Q3. Quarterly refresh, owner named.
- **Forgetting that vendor approval includes ongoing obligations.** A signed contract isn't "done" — annual SOC 2 refreshes, sub-processor updates, contract renewals all need owners.
- **Engineering treating procurement as someone else's problem.** The engineer who shepherds their vendor through procurement gets months faster than the engineer who waits passively. Procurement is part of the project.
:::

<Quiz id="enterprise-procurement-quick-check" variant="micro" title="Quick check">

<Question
  prompt="When should vendor onboarding start, relative to the engineering proof-of-concept?"
  options={[
    { text: "After the POC succeeds and the team commits to the vendor" },
    { text: "After the budget is approved for the next fiscal year" },
    { text: "Only once Legal requests it" },
    { text: "The same week the POC starts, so all five review clocks run in parallel" }
  ]}
  correct={3}
  explanation="Security, Privacy, Legal, AI review, and Procurement each take weeks to months; starting them after the POC adds 3–9 months to the timeline. Waiting until the POC proves out feels prudent — why do paperwork for a tool you might reject? — but the page's playbook is to run both clocks together so they finish around the same time."
/>

<Question
  prompt="Why does buying through a hyperscaler marketplace (AWS, Azure, GCP) accelerate vendor onboarding?"
  options={[
    { text: "Marketplace tools skip security review entirely" },
    { text: "It inherits an existing approved contract path and vendor status" },
    { text: "Hyperscalers guarantee the vendor's product quality" },
    { text: "Marketplace purchases fall below procurement thresholds" }
  ]}
  correct={1}
  explanation="The contract relationship with the hyperscaler already exists, so the marketplace SKU rides an approved path — Bedrock-mediated access to Anthropic, for example, is often much faster than a direct enterprise contract. Nothing is skipped entirely; the surface that needs review shrinks. That distinction is why the skip-security answer is wrong."
/>

<Question
  prompt="How does the central AI gateway shorten the procurement surface for new model providers?"
  options={[
    { text: "It hides new vendors from the security team" },
    { text: "It bundles all vendors into a single annual review" },
    { text: "Adding a provider becomes a registry-and-routing change instead of a new app-level integration, so reviewers examine a much smaller surface" },
    { text: "Gateway vendors handle procurement on your behalf" }
  ]}
  correct={2}
  explanation="Without a gateway, trying a new model means new auth, observability, and exception handling reviewed as a full application integration. Behind a gateway, it is a model registry entry and a routing policy — and engineering ships in days once approval lands. The page calls this one of the platform's highest-leverage benefits, and one that almost never appears in its stated value proposition."
/>

</Quiz>

## What's next

→ Next: [Regulatory landscape](./regulatory.md) — the regimes that drive much of what procurement and governance are actually trying to satisfy.
