---
id: enterprise-ai-checkpoint
title: Chapter 11 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Mandatory checkpoint quiz for Chapter 11 — Enterprise AI. 5 random questions drawn from a 14-question bank. Pass to unlock Chapter 12.
---

# Chapter 11 Checkpoint

You've finished the Enterprise AI chapter. Take a minute to make sure the core ideas stuck.

There are **14 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page section to revisit, and the link highlights the paragraph for you.

You must pass (≥ 60%) to unlock the Next button and Chapter 12 in the sidebar.

<Quiz id="enterprise-checkpoint" title="Enterprise AI checkpoint" sampleSize={5}>

<Question
  prompt="What's the single sentence that best captures the enterprise AI mindset?"
  options={[
    { text: "Ship the smartest model you can find and iterate on prompts in production" },
    { text: "Reliability, governance, and standardization beat speed and local optimization; the paved road exists to make the safe path the easy path; the system has to keep working when the on-call engineer is paged at 2 AM" },
    { text: "Centralize all AI decisions in a single review board and let them set every prompt" },
    { text: "Treat AI like any other feature — governance is overhead that slows real work" }
  ]}
  correct={1}
  explanation="Enterprise AI engineering trades speed for reliability, governance, and standardization. The paved road exists so that the safe, compliant, observable path is also the easiest one — and so the system keeps working long after the original author has moved on."
  revisit={{ to: "/docs/enterprise/enterprise-ai-mindset", label: "Enterprise AI mindset" }}
/>

<Question
  prompt="At a 500-engineer org, which combination of teams owns enterprise AI end to end?"
  options={[
    { text: "A single AI team that builds every feature" },
    { text: "AI Platform (gateway, registry, evals, obs) + feature teams shipping on the paved road + an AI Center of Excellence + AI Risk/Legal partners" },
    { text: "Just the security team, with engineers consulting as needed" },
    { text: "Product managers, with engineers contracted per feature" }
  ]}
  correct={1}
  explanation="Mature orgs split the work: a Platform team owns shared infra, feature teams ship on the paved road, a CoE spreads patterns, and AI Risk/Legal partners review high-tier features. No single team can own it all."
  revisit={{ to: "/docs/enterprise/enterprise-ai-team-structure", label: "Team structure" }}
/>

<Question
  prompt="What's usually the throttle on how fast an enterprise can ship AI features?"
  options={[
    { text: "Engineering capacity — not enough people who know LLMs" },
    { text: "Compute budget — GPUs are scarce" },
    { text: "Governance review capacity, specifically for High-tier features — a healthy function can deeply review only 3–6 per quarter" },
    { text: "Vendor contracts — procurement is slow" }
  ]}
  correct={2}
  explanation="Money and headcount scale; deep governance review does not. A healthy AI Risk function can only carefully review a handful of High-tier features per quarter, which is the real bottleneck on enterprise AI throughput."
  revisit={{ to: "/docs/enterprise/enterprise-ai-planning", label: "Planning and review capacity" }}
/>

<Question
  prompt="Why does every enterprise AI architecture eventually converge on a central AI gateway?"
  options={[
    { text: "It saves money on API calls through caching" },
    { text: "It's the audit boundary — a single egress point where policy enforcement, logging, and per-region routing live, so auditors can answer 'show me every model call for EU customers last quarter' with one query" },
    { text: "It makes it easier to switch model providers" },
    { text: "It hides API keys from developers" }
  ]}
  correct={1}
  explanation="The gateway is the audit boundary. Without a single egress point, the answer to 'show me every model call for EU customers' is 'we can't tell you' — which fails the audit. Caching and provider swaps are nice side effects, not the reason."
  revisit={{ to: "/docs/enterprise/enterprise-ai-architecture", label: "AI gateway as audit boundary" }}
/>

<Question
  prompt="At enterprise scale, how does the design system handle AI components like streaming chat, citations, and confidence indicators?"
  options={[
    { text: "Each feature team builds its own — variety is a strength" },
    { text: "There are no shared AI components; AI is too new to standardize" },
    { text: "AI primitives ship in the central design system (streaming text, citation chips, confidence badges, refusal cards) so every feature inherits the same accessibility, telemetry, and policy hooks" },
    { text: "AI UI is owned by marketing, not engineering" }
  ]}
  correct={2}
  explanation="A central design system that includes AI primitives means every feature inherits accessibility, telemetry, and policy hooks for free — and a fix to the citation component lands everywhere at once."
  revisit={{ to: "/docs/enterprise/enterprise-ai-frontend-architecture", label: "AI components in the design system" }}
/>

<Question
  prompt="What does a golden-path AI feature scaffold (`acme ai feature new`) actually do in one command?"
  options={[
    { text: "Generates boilerplate code only" },
    { text: "Creates the repo, registers it in Backstage, generates a starter eval suite, opens a PR with the gateway policy, creates Datadog dashboards, opens the AI Risk Review intake, drafts the model card, and configures eval-gated CI" },
    { text: "Spins up a sandbox AWS account" },
    { text: "Asks ChatGPT to write the feature" }
  ]}
  correct={1}
  explanation="The golden path collapses the first three weeks of plumbing into one command. Repo, Backstage entry, eval suite, gateway policy PR, dashboards, risk intake, model card, and CI pipeline are all wired up so the engineer can focus on the actual feature."
  revisit={{ to: "/docs/enterprise/enterprise-ai-developer-experience", label: "Golden paths and prompt registry CLI" }}
/>

<Question
  prompt="What does a healthy prompt-review committee actually approve for Medium- and High-tier features?"
  options={[
    { text: "Only the model temperature setting" },
    { text: "Scope clarity, jailbreak resistance, locale safety, refusal correctness, citation rules, and eval-score delta — with sign-off recorded in the prompt registry so auditors can query it" },
    { text: "Whether the prompt is grammatically correct" },
    { text: "The marketing copy in the UI" }
  ]}
  correct={1}
  explanation="The committee (AI engineer + domain SME + AI Risk for High-tier) reviews promotion to production along multiple axes. Sign-off lives in the prompt registry, which is what auditors query later."
  revisit={{ to: "/docs/enterprise/enterprise-ai-development-practices", label: "Prompt review committee" }}
/>

<Question
  prompt="What are the four testing layers for an enterprise AI feature?"
  options={[
    { text: "Unit, integration, E2E, and manual QA" },
    { text: "Unit/integration + eval suite + adversarial suite (jailbreaks, prompt injection, refusal correctness) + fairness/bias slice — each feeds the SOC 2 / HIPAA / FedRAMP / EU AI Act / SR 11-7 audit pipeline" },
    { text: "Smoke tests only — LLMs are too non-deterministic to test" },
    { text: "Just an eval suite — adversarial and bias tests are nice-to-have" }
  ]}
  correct={1}
  explanation="The four layers are non-AI tests, behavioral evals, adversarial tests, and fairness/bias slices. All four produce audit artifacts that regulators ask to see — FedRAMP, HIPAA, the EU AI Act, and SR 11-7 all want this evidence."
  revisit={{ to: "/docs/enterprise/enterprise-ai-testing", label: "Four testing layers" }}
/>

<Question
  prompt="Why does enterprise AI deployment require segregation of duties between the engineer who wrote the change and the one who deployed it?"
  options={[
    { text: "It's faster that way" },
    { text: "SOC 2 (CC8.1), HIPAA §164.308(a)(3), SR 11-7, and the EU AI Act's human-oversight requirements all require it — without a release-manager role, the audit fails regardless of how careful the engineer was" },
    { text: "It reduces cloud cost" },
    { text: "It's a Kubernetes best practice" }
  ]}
  correct={1}
  explanation="Multiple compliance regimes mandate separation between author and deployer. The release-manager role exists specifically to provide that separation. No segregation, no clean audit."
  revisit={{ to: "/docs/enterprise/enterprise-ai-ci-cd", label: "Segregation of duties and eval gating" }}
/>

<Question
  prompt="What are the three layers of kill switch in an enterprise AI deployment, and why must they be tested quarterly?"
  options={[
    { text: "Region, account, and project — tested when something breaks" },
    { text: "Feature (this AI feature off, fallback to non-AI), model (this model out of rotation), tenant (AI off for this customer) — tested quarterly because an untested switch has roughly a 30% chance of being broken when you need it" },
    { text: "Dev, staging, prod — tested at every release" },
    { text: "There's only one kill switch and it's the API key" }
  ]}
  correct={1}
  explanation="Three layers — feature, model, tenant — give incident commanders the right blast radius for any given problem. Quarterly game days keep them real, because wiring rots, flags drift, and fallback paths silently disappear."
  revisit={{ to: "/docs/enterprise/enterprise-ai-deployment-change-mgmt", label: "Kill switches and release windows" }}
/>

<Question
  prompt="Why does an enterprise route AI telemetry to four sinks instead of one?"
  options={[
    { text: "Vendor lock-in fear" },
    { text: "Different audiences: app observability (Datadog) for engineers, LLM observability (Langfuse) for AI engineers, SIEM (Splunk/Sentinel) for the SOC, and an audit log store (S3 Object Lock) for Legal — no single tool serves all four well" },
    { text: "Redundancy — if one is down, the others have the data" },
    { text: "Each region requires its own observability stack" }
  ]}
  correct={1}
  explanation="Different audiences have different requirements: engineers debugging, AI engineers analyzing quality, the SOC hunting threats, Legal preserving evidence. Bodies in the audit store, metadata in the others — no single tool covers all four."
  revisit={{ to: "/docs/enterprise/enterprise-ai-observability", label: "Four telemetry sinks" }}
/>

<Question
  prompt="What's the auditor's most common question, and what does it imply for how you build artifacts?"
  options={[
    { text: "'Is your code well-commented?' — write thorough docstrings" },
    { text: "'Show me.' — show me the model card, the eval results before and after the April 12 prompt change, how you'd delete a user's prompts. Every artifact needs a single system of record with a stable URL, or you fail" },
    { text: "'How much do you spend on AI?' — keep a tidy invoice spreadsheet" },
    { text: "'Who is your AI vendor?' — keep procurement records" }
  ]}
  correct={1}
  explanation="Auditors ask 'show me.' If the answer is 'we can pull that together in a few days,' you fail; if it's 'here, this link,' you pass. SOC 2, HIPAA, GDPR, the EU AI Act, SR 11-7, and NIST AI RMF all reduce to the same demand for stable URLs to artifacts."
  revisit={{ to: "/docs/enterprise/enterprise-ai-security-compliance", label: "Show-me artifacts and compliance" }}
/>

<Question
  prompt="When do you use a release train vs. per-feature continuous deploy at enterprise scale?"
  options={[
    { text: "Always trains — continuous deploy is too risky for enterprises" },
    { text: "Always continuous — trains are obsolete" },
    { text: "Trains for cross-cutting changes (SDK upgrades, gateway-policy changes, model EOLs, eval-scorer changes) that need many teams to coordinate; per-feature continuous (within release windows) for everything else" },
    { text: "Trains in Q1 and Q3, continuous in Q2 and Q4" }
  ]}
  correct={2}
  explanation="Trains are right for cross-cutting changes that need coordination. Per-feature deploys (within release windows) are right for everything else. The mistake at either extreme — trains for everything or nothing — is what to avoid."
  revisit={{ to: "/docs/enterprise/enterprise-ai-release-management", label: "Trains vs. continuous" }}
/>

<Question
  prompt="An exec asks 'should we self-host open-source models to cut our $20M/year AI bill?' What's the chapter's framing?"
  options={[
    { text: "Yes — the savings are obvious; switch immediately" },
    { text: "Usually no for cost alone: a dedicated ops team (~$700K/yr), GPU redundancy multipliers, model-quality gap forcing fallback to managed endpoints anyway, and capex tie-up shrink savings to a rounding error. Self-host for control and unit economics on narrow workloads, not for cost" },
    { text: "Yes — every enterprise should self-host by default" },
    { text: "No — managed APIs are always cheaper at every scale" }
  ]}
  correct={1}
  explanation="The honest math adds FTE costs, GPU redundancy, quality gaps that force re-routing to managed endpoints, and capex. Enterprise AI spend ($1M–$50M+/yr) rarely shrinks meaningfully through self-hosting. The real reasons to self-host are control and narrow-workload unit economics."
  revisit={{ to: "/docs/enterprise/enterprise-ai-cost-picture", label: "Self-host cost math" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 12: Comparison](/docs/comparison) where solo / startup / enterprise AI workflows are laid out side by side.
