---
id: startup-ai-checkpoint
title: Chapter 10 Checkpoint
sidebar_position: 99
sidebar_label: 18. Checkpoint
description: Mandatory checkpoint quiz for Chapter 10 — Startup AI Workflow. 5 random questions drawn from a 14-question bank. Pass to unlock Chapter 11.
---

# Chapter 10 Checkpoint

You've finished the Startup AI chapter. Take a minute to make sure the core ideas stuck before moving on to enterprise.

There are **14 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page to revisit.

You must pass (≥ 60%) to unlock the Next button and Chapter 11 in the sidebar.

<Quiz id="startup-checkpoint" title="Startup AI checkpoint" sampleSize={5}>

<Question
  prompt="The startup AI mindset sits between two failure modes. What are they?"
  options={[
    { text: "Shipping too slow vs shipping too many features" },
    { text: "Sloppy demo-grade AI that churns paying customers vs enterprise-grade process you can't afford yet" },
    { text: "Using open models vs using closed models" },
    { text: "Hiring AI generalists vs hiring ML PhDs" }
  ]}
  correct={1}
  explanation="The whole chapter is calibrated to that tension. Solo-style sloppiness churns real accounts and leaks data; enterprise-style process starves a 20-person team of velocity. Every section finds the middle."
  revisit={{ to: "/docs/startup/startup-ai-mindset", label: "The Startup AI Mindset" }}
/>

<Question
  prompt="What should you look for in your first AI hire at a startup?"
  options={[
    { text: "A research ML PhD who has published at NeurIPS" },
    { text: "A pragmatic generalist who can own evals, prompts, and production debugging end-to-end" },
    { text: "A prompt engineer who only writes prompts, no code" },
    { text: "A data-labeling lead with a vendor network" }
  ]}
  correct={1}
  explanation="At 5-50 people you need someone who can wire up the gateway, write evals, debug a bad trace, and ship a kill switch — not a researcher. Specialists (labelers, dedicated PMs, RL experts) come later."
  revisit={{ to: "/docs/startup/startup-ai-team-structure", label: "Team Structure — the first AI hire" }}
/>

<Question
  prompt="What is risk tiering used for in startup AI planning?"
  options={[
    { text: "Deciding which engineers get pager duty" },
    { text: "Calibrating process (evals, review, rollout, kill switch) to the blast radius of each AI feature" },
    { text: "Choosing between GPT-4 and Claude" },
    { text: "Setting compensation bands" }
  ]}
  correct={1}
  explanation="A Tier-0 internal demo and a Tier-3 customer-facing legal-summarization feature need different eval rigor, review gates, rollout cohorts, and kill-switch latency. Risk tiers make that explicit instead of one-size-fits-all."
  revisit={{ to: "/docs/startup/startup-ai-planning", label: "Quarterly Planning — risk tiering" }}
/>

<Question
  prompt="Why does the chapter insist the designer iterate alongside engineering on AI features?"
  options={[
    { text: "Designers own the prompt repository" },
    { text: "AI UX (streaming, confidence, citations, undo, refusal states) only works if the prompt, the UI, and the failure modes are co-designed — handoff designs fall apart on contact with model behavior" },
    { text: "Designers need to learn TypeScript" },
    { text: "It's a soft cultural preference with no operational benefit" }
  ]}
  correct={1}
  explanation="Streaming tokens, confidence signals, citations, and refusal states are inseparable from how the model actually behaves. A static Figma handoff cannot predict how a 4-second cold start or a hedged refusal feels — the designer has to sit in the loop."
  revisit={{ to: "/docs/startup/startup-ai-design", label: "AI Product Design" }}
/>

<Question
  prompt="What does an LLM gateway buy a startup vs calling provider SDKs directly?"
  options={[
    { text: "Cheaper token prices via volume discounts only" },
    { text: "One choke point for retries, fallbacks, per-tenant cost attribution, prompt-version pinning, and one-line provider failover" },
    { text: "It removes the need for evals" },
    { text: "It hosts your own fine-tuned models" }
  ]}
  correct={1}
  explanation="The gateway centralizes the cross-cutting concerns — observability, cost per tenant, retries, model pinning, failover — so feature code stays simple. Without it, every feature reimplements those concerns badly."
  revisit={{ to: "/docs/startup/startup-ai-architecture", label: "Architecture — the LLM gateway" }}
/>

<Question
  prompt="Why must prompts live in `packages/prompts/` in git, not in Notion or a database?"
  options={[
    { text: "Notion is too expensive at scale" },
    { text: "So prompt changes go through code review, run the eval suite in CI, are versioned with the code that uses them, and can be rolled back atomically" },
    { text: "Engineers prefer monorepos" },
    { text: "Postgres can't store long strings" }
  ]}
  correct={1}
  explanation="A prompt is code — it controls model behavior. Treating it like code means PRs, diffs, eval-gated CI, version pinning, and instant rollback. Notion gives you none of that and silently changes production."
  revisit={{ to: "/docs/startup/startup-ai-env-setup", label: "Environment Setup — prompts as code" }}
/>

<Question
  prompt="In the 2-week AI feature playbook, what typically ships by the end of week 1?"
  options={[
    { text: "A polished GA launch to all customers" },
    { text: "An internal/flagged version with a working eval suite, behind a feature flag for the team to dogfood" },
    { text: "A model fine-tune" },
    { text: "Nothing — week 1 is research only" }
  ]}
  correct={1}
  explanation="Week 1 lands the thin end-to-end slice plus the eval suite, flagged off for everyone except the team. Week 2 is hardening, cost/latency tuning, cohort rollout, and the kill switch — not greenfield coding."
  revisit={{ to: "/docs/startup/startup-ai-development", label: "Development Loop — the 2-week playbook" }}
/>

<Question
  prompt="The chapter names four test layers for AI features. Which set is correct?"
  options={[
    { text: "Smoke, snapshot, load, chaos" },
    { text: "Unit (deterministic code), integration (gateway/DB/Inngest), eval (quality on a curated set), adversarial (prompt-injection, jailbreaks, PII leaks)" },
    { text: "Manual QA, beta testers, customer support, post-mortem" },
    { text: "Lint, types, build, deploy" }
  ]}
  correct={1}
  explanation="Unit catches code bugs; integration catches wiring bugs; evals catch quality regressions on the cases you care about; adversarial catches the attacks and PII leaks evals won't surface. Skipping any one of them leaves a class of bug unguarded."
  revisit={{ to: "/docs/startup/startup-ai-testing", label: "Testing Strategy — the four layers" }}
/>

<Question
  prompt="Why does eval-gating in CI replace a lot of human process at AI startups?"
  options={[
    { text: "It eliminates the need for code review" },
    { text: "A failing eval blocks merge automatically, so prompt regressions never reach production — no committee meetings or sign-offs needed" },
    { text: "It speeds up Playwright tests" },
    { text: "It deploys to production without staging" }
  ]}
  correct={1}
  explanation="A passing eval suite gated in CI is a stronger guarantee than three humans signing a doc. The bot blocks the merge, every time, without politics. That's why the chapter calls eval discipline the single biggest quality lever."
  revisit={{ to: "/docs/startup/startup-ai-cicd", label: "CI/CD — eval-gating" }}
/>

<Question
  prompt="What three properties does every AI feature flag have at a mature startup?"
  options={[
    { text: "On/off, A/B, multivariate" },
    { text: "Cohort targeting (who sees it), instant kill switch (one click to disable), and per-flag observability (quality/cost/latency for the cohort)" },
    { text: "Owner, expiry date, color label" },
    { text: "Free tier, paid tier, enterprise tier" }
  ]}
  correct={1}
  explanation="Cohorts let you ramp from 1% to 100% safely. The kill switch caps blast radius when something regresses. Per-flag dashboards let you actually see the regression. A flag without all three is theater."
  revisit={{ to: "/docs/startup/startup-ai-deployment", label: "Deployment — flags, cohorts, kill switches" }}
/>

<Question
  prompt="Why must quality, cost, and latency be reported together on every AI dashboard?"
  options={[
    { text: "It looks more impressive to investors" },
    { text: "Optimizing one in isolation almost always silently regresses another — a cheaper model can tank quality; a higher-quality model can blow the budget or the p95" },
    { text: "Langfuse requires it" },
    { text: "SOC 2 mandates it" }
  ]}
  correct={1}
  explanation="The three are coupled. A win on cost that costs you 8 quality points is a loss. A latency improvement that pushes you to a flakier provider is a loss. Seeing all three at once keeps you honest about real trade-offs, per tenant."
  revisit={{ to: "/docs/startup/startup-ai-observability", label: "Observability — the quality/cost/latency triple" }}
/>

<Question
  prompt="What does 'least-privilege tool execution' mean for an AI agent in practice?"
  options={[
    { text: "Only senior engineers may deploy agents" },
    { text: "Each tool the model can call runs with the narrowest possible scope (read-only when possible, scoped to the current tenant, irreversible actions require confirmation) so a successful prompt injection can't drain an account" },
    { text: "The model has to ask permission for every token" },
    { text: "Agents may only run on weekends" }
  ]}
  correct={1}
  explanation="Prompt injection is now a regular event, not a rare one. If your `send_email` tool can email any address from any tenant, one injection drains the company. Per-tool scope and confirmation gates are how you keep the blast radius small."
  revisit={{ to: "/docs/startup/startup-ai-security", label: "Security & Compliance — least-privilege tools" }}
/>

<Question
  prompt="Roughly how much does a 20-person AI-first startup spend on AI infrastructure per month, and which line item usually dominates?"
  options={[
    { text: "$1K-$5K/mo, dominated by Vercel hosting" },
    { text: "$50K-$200K/mo, dominated by LLM provider tokens (often 60-80% of the bill)" },
    { text: "$5M+/mo, dominated by GPU clusters" },
    { text: "It's free because of provider credits" }
  ]}
  correct={1}
  explanation="Tokens dwarf everything else at this stage. Langfuse, pgvector, Inngest, Vercel are rounding errors compared to the OpenAI/Anthropic line. That's why per-tenant cost attribution and prompt/model tuning are the highest-leverage cost work."
  revisit={{ to: "/docs/startup/startup-ai-cost-breakdown", label: "Cost Breakdown" }}
/>

<Question
  prompt="The chapter names the single biggest pitfall for growing AI startups. Which is it?"
  options={[
    { text: "Picking the wrong frontend framework" },
    { text: "Shipping AI features with no eval suite — every prompt change becomes a roll of the dice and regressions are found by customers" },
    { text: "Using TypeScript instead of Python" },
    { text: "Hiring a designer too early" }
  ]}
  correct={1}
  explanation="No-evals is the pitfall that compounds the fastest: every prompt tweak is a gamble, customer-facing regressions pile up, and the team loses confidence to change anything. Per-tenant cost blindness is a close second, but evals come first."
  revisit={{ to: "/docs/startup/startup-ai-pitfalls", label: "Common Pitfalls" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 11: Enterprise AI](/docs/enterprise) for a contrast — same problems, very different solutions at 100+ engineers, regulated industries, and central platform teams.
