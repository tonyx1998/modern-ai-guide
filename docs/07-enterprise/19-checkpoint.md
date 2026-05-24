---
id: enterprise-ai-checkpoint
title: Chapter 7 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test for Chapter 7 — Enterprise AI. Use these questions to confirm the core ideas stuck before moving on.
---

# Chapter 7 Checkpoint

You've finished the Enterprise AI chapter. Take a few minutes to make sure the core ideas stuck.

This is a self-test — no quiz framework, just questions you should be able to answer in a sentence or two. If a question is fuzzy, the linked page is the one to revisit.

---

### 1. What's the single sentence that best captures the enterprise AI mindset?

Reliability, governance, and standardization beat speed and local optimization; the paved road exists to make the *safe* path the *easy* path; the system has to keep working when the original prompt author has left and a new on-call engineer is paged at 2 AM. ([Mindset](./01-mindset.md))

---

### 2. What does the AI Platform team actually own at a 500-engineer org?

The shared infrastructure every AI feature depends on: the central AI gateway (Portkey Enterprise / Kong AI / in-house), the prompt registry, the eval platform, LLM observability, RAG infrastructure, the fine-tuning platform, and the model registry. Their OKRs are about paved-road *adoption*, not features shipped. ([Team Structure](./02-team-structure.md))

---

### 3. What's the throttle on how fast an enterprise can ship AI features — engineering, money, or governance?

Usually governance, specifically **review capacity for High-tier features**. A healthy enterprise AI governance function can deeply review only 3–6 High-tier features per quarter, regardless of how many engineers or dollars are available. ([Planning](./03-planning.md))

---

### 4. Why does every enterprise AI architecture eventually converge on a central AI gateway?

The gateway is the **audit boundary**. When an auditor asks "show me every model call made on behalf of EU customers last quarter," the answer needs to be a single query against gateway logs. Without a single egress point, that answer is "we can't tell you" — which fails the audit. ([Architecture](./04-architecture.md))

---

### 5. What's the difference between AI A/B testing at startup vs. enterprise scale?

At enterprise scale, the experimentation framework treats **eval scores as guardrail metrics**, not just observed metrics. A treatment variant that lifts CSAT but regresses the groundedness eval is shipping more hallucinations — the eval guardrail catches that before it reaches production. Variants include the *prompt registry version*, not just code paths. ([Frontend Architecture](./05-frontend-architecture.md))

---

### 6. What does a golden-path AI feature scaffold (`acme ai feature new`) actually do?

In one command: creates the repo, registers it in Backstage, generates a starter eval suite from a pattern template, opens a PR with the gateway policy, creates Datadog dashboards, opens the AI Risk Review intake ticket, drafts the model card, and configures the eval-gated CI pipeline. The first 12 things an engineer would otherwise spend three weeks doing — gone. ([Developer Experience](./06-developer-experience.md))

---

### 7. What does a healthy prompt-review committee actually do?

For Medium- and High-tier features, a small standing committee (AI engineer + domain SME + AI Risk partner for High-tier) reviews prompt promotions to production: scope clarity, jailbreak resistance, locale safety, refusal correctness, citation rules, and eval-score delta. Sign-off is recorded in the prompt registry; auditors can query it. ([Development Practices](./07-development-practices.md))

---

### 8. What are the four testing layers for an enterprise AI feature?

1. **Unit + integration tests** (non-AI code paths).
2. **Eval suite** (behavioral correctness).
3. **Adversarial suite** (jailbreaks, prompt injection, refusal correctness).
4. **Fairness / bias slice** (same cases varied by locale, persona, demographic markers).

Each runs in CI; layers 2–4 also run nightly or weekly against the production prompt. Artifacts feed the SOC 2 / HIPAA / EU AI Act / SR 11-7 audit pipeline. ([Testing](./08-testing.md))

---

### 9. Why does enterprise AI deployment require segregation of duties?

SOC 2 (CC8.1), HIPAA §164.308(a)(3), SR 11-7, and the EU AI Act's human-oversight requirements all want a separation between the engineer who *wrote* the change and the engineer who *deployed* it to production. The release manager role exists to provide that separation; without it, the audit fails regardless of how careful the engineer is. ([CI/CD](./09-ci-cd.md))

---

### 10. What are the three layers of kill switch in an enterprise AI deployment, and why must they be tested quarterly?

**Feature** kill switch (this AI feature off, fallback to non-AI), **model** kill switch (this model out of rotation across the company, route to fallback model), **tenant** kill switch (AI off for this customer). They must be tested quarterly because a switch that hasn't been exercised in 6 months has roughly a 30% chance of being broken — wiring rotted, flag misconfigured, fallback path missing. Quarterly game days keep them real. ([Deployment](./10-deployment.md))

---

### 11. Why does an enterprise route AI telemetry to four sinks instead of one?

Different audiences, different requirements: **app observability** (Datadog) for engineers debugging; **LLM observability** (Langfuse / Phoenix) for AI engineers analyzing prompt quality; **SIEM** (Splunk / Sentinel) for the SOC; **audit log store** (S3 Object Lock) for Legal and auditors. No single tool serves all four well — bodies in the audit store, metadata in the others. ([Observability](./11-observability.md))

---

### 12. What is eval-on-production and why is it the highest-leverage AI ops investment?

Taking a sample of live model calls and scoring them against the same eval scorers used in CI. Catches the failure mode CI can't: silent quality degradation from model-version drift, retrieval-index decay, real-world inputs the eval set didn't cover. Teams with eval-on-production catch regressions in hours; teams without catch them in weeks via customer complaints. ([Observability](./11-observability.md))

---

### 13. What's the auditor's most common question, and what does it imply for how you build artifacts?

**"Show me."** Show me the model card for this feature. Show me the eval results from before and after the April 12 prompt change. Show me how you'd delete a specific user's prompts from the audit log. If the answer is "we can pull that together in a few days," you're failing; if it's "here, this link," you're passing. Every artifact needs a single system of record with a stable URL. ([Security & Compliance](./12-security-compliance.md))

---

### 14. When do you use a release train vs. a per-feature continuous deploy?

Trains for cross-cutting changes (SDK upgrades, gateway-policy changes, model EOLs, eval-scorer changes) that require many teams to coordinate. Continuous per-feature deploys (within release windows) for everything else. The mistake at both extremes — trains for everything, or nothing — is what to avoid. ([Release Management](./13-release-management.md))

---

### 15. Why is self-hosting open-source models *usually* not a cost play?

The naive spreadsheet shows big savings. The honest math adds: FTE to operate the cluster (~2 dedicated engineers, ~$700K/year), redundancy multiplier on GPU capacity (peak load is much higher than average), model-quality gap (open models often genuinely worse on enterprise eval suites — some features re-route to managed endpoints anyway), and capex tie-up. Real savings often shrink to a rounding error. Self-host for **control and unit economics on narrow workloads**, not for cost. ([Cost Picture](./14-cost-picture.md))

---

### 16. Why is shadow AI feedback, not failure?

Shadow AI exists because the official paved road is too slow or too painful — engineers route around it. Cracking down without fixing the paved road drives it underground; out-shipping it pulls the work back into the supportable, observable, compliant path. The teams that successfully eliminate shadow AI usually do it by improving the paved road, not by policing. ([Pitfalls](./15-pitfalls.md))

---

### 17. What's the highest-leverage hour in a senior enterprise AI platform engineer's day?

Usually the **eval-clinic office hour** — pairing with a feature team for 60 minutes on eval-case design. By the end, that team is unblocked for two weeks of work. Your personal PR count moves zero; the org's throughput moves significantly. The cultural shift to senior IC is accepting that this trade is a win. ([Day in the Life](./16-day-in-life.md))

---

### 18. When is the right time to build a central AI platform?

When **any two** signals fire: 5+ AI features in production, 50+ engineers building AI, any regulated workload, 3+ model providers, 2+ AI incidents in a quarter, procurement/security as the consistent ship-blocker, or visible shadow AI growth. Below that, you can hold it together with conventions; above, conventions stop scaling and the platform's overdue. ([When to Use](./17-when-to-use.md))

---

### 19. What's the right test of an enterprise AI platform's health?

**"Is a new AI feature easier to build *correctly* on the paved road than it would be off it?"** If yes, the platform is earning its cost. If no — if engineers find it easier to route around than to use — the platform has become a tax, regardless of how thoughtful it is. Test annually; prune ruthlessly. ([Too Big](./18-too-big.md))

---

### 20. What's the single most important governance discipline at enterprise scale?

The **risk tier** assigned at intake. Low / Medium / High drives review depth, reviewer staffing, model choice, deployment topology, audit retention, and which compliance regimes apply. Getting the tier wrong at intake creates weeks of rework downstream. Take the 30 minutes at intake; it's the highest-leverage decision in the whole lifecycle. ([Planning](./03-planning.md) and [Governance](./governance.md))

---

## If you got most of these right

You have the working model of enterprise AI engineering. The chapter pages are reference material — come back to specific ones when you need the details of, say, the gateway policy format or the EU AI Act artifact list.

## If several were fuzzy

Re-read the linked pages for the questions you struggled with. The enterprise AI mindset is genuinely different from startup AI; it takes a couple of passes to settle.

---

→ Continue to [Chapter 8: Comparison](/docs/comparison) where solo / startup / enterprise AI workflows are laid out side by side.
