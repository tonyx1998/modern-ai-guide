---
id: comparison-checkpoint
title: Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test on the key differences across solo / startup / enterprise AI.
---

# Checkpoint — did the comparison stick?

You've finished the Comparison chapter. Take a minute to make sure the three-column thinking — Solo / Startup / Enterprise — actually stuck before moving on.

There are **12 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page section to revisit.

<Quiz id="comparison-checkpoint" title="Comparison checkpoint" sampleSize={5}>

<Question
  prompt="A Solo dev, a 25-person Startup, and a 5,000-engineer Enterprise are each shipping AI features. What is the underlying arc that explains how team shape and process formality co-evolve across the three?"
  options={[
    { text: "Team and process stay roughly constant — only headcount and budget grow" },
    { text: "Team specializes (one generalist → a few AI-leaning generalists → many specialized AI/ML/safety/platform teams) and process formalizes in lockstep (vibes → Slack + lightweight eval gates → RFC + risk-tier review + change advisory board)" },
    { text: "Teams specialize but process stays informal even at enterprise scale" },
    { text: "Process formalizes but everyone stays a generalist across all three columns" }
  ]}
  correct={1}
  explanation="The same arc runs through both: as the team specializes from one person doing everything to many narrow AI/ML/safety/platform teams, process formalizes from intuition to Slack-thread-plus-eval to written RFCs with risk-tier review. The two patterns move together because larger surface areas need shared written context to stay aligned."
  revisit={{ to: "/docs/comparison/comparison-team-and-process#decision-style", label: "Decision style" }}
/>

<Question
  prompt="Why does the chapter recommend the frontier API direct at solo scale, a gateway (LiteLLM/Portkey/OpenRouter) at startup scale, and a private endpoint (Azure OpenAI / AWS Bedrock / on-prem) at enterprise scale?"
  options={[
    { text: "Each tier is technically better than the previous one, and solos just can't afford the good options" },
    { text: "What's being procured is fundamentally different at each scale — a tool, a multi-provider abstraction with cost/routing/fallback, and a contractual vendor relationship with data-residency and audit obligations" },
    { text: "All three should use a gateway; direct API and private endpoints are legacy patterns" },
    { text: "The choice is determined by the founder's personal preference, not scale" }
  ]}
  correct={1}
  explanation="Solos buy a tool (a credit card and an API key). Startups buy an abstraction (fallback, routing, cost attribution across providers). Enterprises buy a vendor relationship (DPIA, data residency, contractual liability). Each picks the cheapest option that solves the problem its column actually has."
  revisit={{ to: "/docs/comparison/comparison-stack#models-and-providers", label: "Models and providers" }}
/>

<Question
  prompt="The same one-sentence prompt addition takes ~90 seconds at solo scale, ~30 minutes at startup scale, and 1–2 weeks at enterprise scale (Low risk tier). What is that time differential paying for?"
  options={[
    { text: "Slower CI hardware and worse internal tooling at large companies" },
    { text: "Risk absorption proportional to blast radius — reviewers, eval batteries, deploy windows, cohort soak times, and audit-log writes, each of which exists because a past incident proved it was needed at that blast radius" },
    { text: "Mandatory weekly release trains that artificially batch all changes" },
    { text: "Enterprises rewriting the prompt in a templating DSL for compliance reasons" }
  ]}
  correct={1}
  explanation="The thinking — 'add this sentence' — takes 5 minutes everywhere. The rest is reviewers, eval batteries, deploy windows, cohort soak times, and audit-log writes. Each gate exists because a past incident proved it was needed at that blast radius."
  revisit={{ to: "/docs/comparison/comparison-workflow#prompt-change", label: "Prompt change" }}
/>

<Question
  prompt="How does eval discipline progress across solo → startup → enterprise, and why?"
  options={[
    { text: "Solos skip evals entirely; startups eyeball outputs; only enterprises run real evals" },
    { text: "Vibe-checks plus a tiny golden set → an eval suite in CI with regression gates and per-feature pass-rate dashboards → multi-tier eval gates (offline + shadow + canary + human-graded) tied to risk tier and required for promotion" },
    { text: "All three run identical eval suites; only the dashboards differ" },
    { text: "Eval discipline is mostly performative at every scale and doesn't catch real regressions" }
  ]}
  correct={1}
  explanation="Solo gets away with a vibe-check plus a 20-row golden set. Startup needs a CI eval suite with regression gates once multiple people ship to the same prompt. Enterprise layers offline + shadow + canary + human-grading per risk tier — because the cost of a quality regression scales with user count."
  revisit={{ to: "/docs/comparison/comparison-workflow#eval-bar-evolution-by-scale", label: "Eval-bar evolution by scale" }}
/>

<Question
  prompt="A 25-engineer startup with one AI surface is offered an enterprise observability suite (e.g. Datadog LLM at ~$50K/year) 'to be ready for scale.' What does the chapter say?"
  options={[
    { text: "Buy it — the cross-team aggregation features will save time later" },
    { text: "Skip it — its value lives in cross-team aggregation that a one-surface startup can't yet use; Langfuse Pro plus Sentry covers the same ground for ~$500/month until the enterprise problem actually appears" },
    { text: "Self-host an open-source equivalent on Kubernetes from day one" },
    { text: "Observability tier is dictated by compliance, so the answer is independent of scale" }
  ]}
  correct={1}
  explanation="Datadog LLM's value is cross-team correlation you don't yet have. Langfuse Pro + Sentry is the column-appropriate pick at ~$500/month. Buy the enterprise tool when you have the enterprise problem — multiple teams sharing one AI surface — not before."
  revisit={{ to: "/docs/comparison/comparison-ops#observability-stack", label: "Observability stack" }}
/>

<Question
  prompt="A 12-person Series A team just signed a six-figure enterprise customer and is now standing up a Center of Excellence, a prompt registry, and a risk-tier classification system. What's the chapter's read?"
  options={[
    { text: "Smart — better to over-build governance early than retrofit it under pressure" },
    { text: "They're solving the wrong problem — a CoE coordinates dozens of independent AI efforts they don't have. Import enterprise practices selectively in order of risk-reduction-per-dollar (kill-switch drill, per-tenant cost dashboards, an incident runbook, a Notion 'prompt registry' for SOC 2) rather than the whole bundle" },
    { text: "They should refuse the customer until their governance matches enterprise expectations" },
    { text: "Spin up a separate enterprise-process subsidiary" }
  ]}
  correct={1}
  explanation="Importing the full enterprise bundle at 12 people is how startups go from 'moves fast' to 'ships nothing' in a quarter. Take the specific imports the customer's due diligence will ask about, leave the coordination machinery for when there's actually something to coordinate."
  revisit={{ to: "/docs/comparison/comparison-tradeoffs#wrong-column-mistakes", label: "Wrong-column mistakes" }}
/>

<Question
  prompt="How does vector DB choice scale across the three columns?"
  options={[
    { text: "Postgres with pgvector at solo scale → a managed vector DB (Pinecone / Weaviate / Qdrant Cloud) at startup scale → a self-hosted / horizontally sharded cluster integrated with internal data platforms at enterprise scale" },
    { text: "Everyone should use Pinecone — it's the only production-grade option" },
    { text: "Vector DBs are obsolete; all three columns should use long-context models instead" },
    { text: "Enterprises uniquely need vector DBs; solo and startup don't" }
  ]}
  correct={0}
  explanation="At solo scale pgvector inside your existing Postgres is plenty. At startup scale a managed vector DB removes ops work for ~$100–1,000/month. At enterprise scale, scale and data-residency push toward a self-hosted, sharded cluster wired into internal data platforms."
  revisit={{ to: "/docs/comparison/comparison-stack#application-layer", label: "Application layer" }}
/>

<Question
  prompt="Roughly how long does onboarding a new model provider take at each scale, and why does the gap stretch so wide?"
  options={[
    { text: "Same day, hours-to-a-week, 3–9 months — because what's being onboarded is different at each column: a tool (credit card), a backup-model option (eval suite on the gateway), and a vendor relationship (security review + DPIA + legal + procurement)" },
    { text: "All three can onboard a provider in a day if they're disciplined" },
    { text: "Same day, same day, same day — provider onboarding is a solved problem" },
    { text: "Months, months, months — every column has identical procurement overhead" }
  ]}
  correct={0}
  explanation="Solo signs up with a credit card. Startup adds a key to the gateway and runs its eval suite. Enterprise runs a vendor security review + DPIA + legal + procurement + contract negotiation. The technology is identical; the contract surface is not."
  revisit={{ to: "/docs/comparison/comparison-workflow#provider-change-eg-swap-primary-model", label: "Provider change" }}
/>

<Question
  prompt="A solo dev with ~500 monthly users on one AI-powered product asks whether they need a kill switch. What's the answer?"
  options={[
    { text: "No — kill switches are an enterprise concern; for solo, just push a fix when something goes wrong" },
    { text: "Yes — even at solo scale, the only acceptable answer to 'what do you do if the model starts saying something it shouldn't?' is 'flip this thing.' Right-sized for solo, it's an AI_ENABLED env var that flips to false and redeploys in 60 seconds" },
    { text: "Only if they're regulated; otherwise no" },
    { text: "Yes, and they need per-feature × per-tenant switches with quarterly fire drills" }
  ]}
  correct={1}
  explanation="The kill-switch mechanism is universal; only its sophistication scales. Solo needs an env-var toggle. Enterprise needs per-feature × per-tenant switches plus a quarterly fire drill. The mistake is skipping the mechanism, not right-sizing it."
  revisit={{ to: "/docs/comparison/comparison-ops#kill-switch-process", label: "Kill-switch process" }}
/>

<Question
  prompt="At a startup spending ~$20K/month on AI inference, what's the single most important cost-related thing to build first?"
  options={[
    { text: "Switch to a cheaper open-weights model on a self-hosted GPU" },
    { text: "Per-tenant and per-feature cost attribution — once you have multiple paying customers you need to know which one is costing 10x the others, or 'cut AI spend' becomes a fishing trip" },
    { text: "Negotiate an enterprise discount with your primary provider" },
    { text: "Add aggressive prompt-caching everywhere before measuring" }
  ]}
  correct={1}
  explanation="Optimizing the bill before measuring what you're paying for is one of the most common waste patterns at startup scale. Per-tenant / per-feature attribution first; optimization second."
  revisit={{ to: "/docs/comparison/comparison-economics#what-this-implies-at-each-scale", label: "What this implies at each scale" }}
/>

<Question
  prompt="Across all three columns, what stays exactly the same?"
  options={[
    { text: "Headcount, governance overhead, and procurement timelines" },
    { text: "The core patterns (streaming, tool use, RAG, agent loops, structured output), the discipline of evals before shipping, prompts in version control, and the universal list of failure modes (quality drift, cost blowup, safety regression, provider degradation) — only cadence, tooling, and blast radius change" },
    { text: "Nothing stays the same — solo, startup, and enterprise AI are fundamentally different disciplines" },
    { text: "Only the model provider stays the same; everything else changes" }
  ]}
  correct={1}
  explanation="A solo dev and a bank write the same tools=[...] array, both run evals before shipping, both keep prompts in version control, and both worry about the same four failure modes. What changes is who can ship, how fast, and how much paperwork each change generates."
  revisit={{ to: "/docs/comparison/comparison#what-stays-the-same--what-changes", label: "What stays the same / what changes" }}
/>

<Question
  prompt="The chapter frames the two big tradeoffs as 'speed vs reliability' and 'autonomy vs alignment.' What's the cleanest way to use them when deciding which column's playbook to copy?"
  options={[
    { text: "Always optimize for speed and autonomy — reliability and alignment slow you down" },
    { text: "Always optimize for reliability and alignment — speed and autonomy create incidents" },
    { text: "Match the dial to the blast radius of being wrong: small blast radius (solo) → speed and autonomy; large blast radius (enterprise) → reliability and alignment. Copying the wrong column's dial setting is the canonical mistake at every scale" },
    { text: "The two tradeoffs are independent and there's no general rule for picking" }
  ]}
  correct={2}
  explanation="The dials aren't moral choices — they're calibrated to blast radius. Solo can dial speed/autonomy high because the cost of being wrong is small. Enterprise dials reliability/alignment high because the cost is large. Mis-set the dial for your column and you either ship nothing or cause an incident."
  revisit={{ to: "/docs/comparison/comparison-tradeoffs#the-three-tradeoff-axes", label: "The three tradeoff axes" }}
/>

</Quiz>

---

## What's next

→ Continue with [Chapter 13: Decision Frameworks](/docs/decisions) — the recurring choices (build vs buy, prompt vs RAG vs fine-tune, agent vs chain, closed vs open) that apply *across* all three columns.
