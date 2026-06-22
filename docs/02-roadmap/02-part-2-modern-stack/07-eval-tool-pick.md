---
id: eval-tool-pick
title: Eval Tool Pick — From Script to Platform
sidebar_position: 8
sidebar_label: Eval tool pick
description: Start with a 50-line script. Move to Braintrust, Langfuse, Promptfoo, or DeepEval when the eval set outgrows it.
---

# Eval Tool Pick — From Script to Platform

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Start with a 50-line Python script (Stage 6). Move to a platform when you have ~100+ cases, need diff-across-runs visualizations, or want eval+observability in one place.

:::tip[In plain English]
An eval is your test suite for AI: a list of example inputs plus what a good answer looks like, run automatically so you can tell whether a change made things better or worse. This page picks the tool that runs those tests — and the honest starting answer is a short script you write yourself, not a product you buy. Paid platforms earn their keep later, when your test set grows large and you want nice side-by-side comparisons or team sharing. The one non-negotiable: your test cases are the most valuable data you'll create, so they must always live in your own files, never only inside some vendor's website.
:::

:::note[Tools vs the discipline]
This page picks the *tool*. To learn *what* these tools measure and how to design an eval suite — metrics, datasets, LLM-as-judge, CI gating, production evals — see [Chapter 5: Evaluation & Measurement](/docs/evaluation).
:::

## Tier 1 — start here, no framework

A flat JSON file of cases + a runner script + git versioning. Stage 6 walked through this.

Why this is the right starting point:

- Zero learning curve; no SDK to read.
- Full control; you understand every line.
- Trivial to integrate into CI.
- No vendor lock-in for the most important data you'll generate (your eval set).

When you outgrow it: when you want to **diff results across runs visually**, **compare two model versions side-by-side**, or **share eval state across a team** without merge conflicts.

## Tier 2 — when to climb

### Braintrust (hosted, premium)

The best eval UI on the market. Run an experiment, see the score matrix, click any failing case to see the full input/output, compare two experiments side-by-side.

**Strengths:**
- Excellent comparison UI.
- Logs integrate with evals (you can sample production traces into eval sets).
- Strong on LLM-as-judge with built-in scoring frameworks.
- Used at scale by AI teams.

**Trade-offs:**
- Hosted only (data leaves your network).
- Paid; pricing scales with usage.

**Pick if:** you're a pro AI team, you want zero infra work, the UI matters.

### Langfuse (OSS + hosted)

Observability and evals in one tool. You can self-host (Docker compose) or use Langfuse Cloud.

**Strengths:**
- Open source — full data ownership if self-hosted.
- Evals + traces + cost analytics in one place.
- Free for hosted (within generous limits) or self-hosted.
- Strong Python and JS SDKs.

**Trade-offs:**
- Eval UI is less polished than Braintrust.
- Self-hosting adds ops work.

**Pick if:** you want OSS, you want obs + evals together, you're cost-conscious.

### LangSmith (hosted)

LangChain's hosted eval + observability tool.

**Strengths:**
- Tightest integration if you use LangChain / LangGraph.
- Datasets, experiments, comparison UI.
- Production traces tie in naturally.

**Trade-offs:**
- Best fit for LangChain users; awkward for raw SDK or other frameworks.
- Hosted only.

**Pick if:** you're already deep in the LangChain ecosystem.

### Promptfoo (OSS, CLI-first)

Open-source, CLI-driven, pytest-style for LLM evals. YAML or JS config; CI-friendly.

**Strengths:**
- CLI-first; fits naturally into CI/CD.
- YAML config is readable and reviewable in PRs.
- Built-in support for many providers and metrics.

**Trade-offs:**
- No hosted dashboard for trends-over-time (BYO).
- Less integrated with production observability.

**Pick if:** you want CI-driven evals, your team likes config-over-code, you don't want a hosted UI.

### DeepEval (OSS, pytest-style)

Pytest-style assertions for LLM outputs. Familiar shape for Python teams.

**Strengths:**
- Looks and feels like normal pytest.
- Built-in metrics: faithfulness, contextual precision, hallucination detection.
- Integrates with CI directly via pytest.

**Trade-offs:**
- Python-only.
- Less rich than Braintrust for UI / comparison.

**Pick if:** you're a Python team, you want evals to feel like unit tests.

### Ragas (OSS, RAG-specific)

Built specifically for RAG metrics: faithfulness, answer correctness, context recall, context precision.

**Strengths:**
- The right metrics for RAG out of the box.
- Open-source.
- Integrates with LlamaIndex, LangChain.

**Trade-offs:**
- RAG-only; not useful for non-RAG LLM apps.
- Less polished UI.

**Pick if:** RAG is your main thing, you want canonical RAG metrics.

### OpenAI Evals (OSS)

The reference framework; the original OpenAI evals library.

**Strengths:**
- Reference / educational.
- Open-source.

**Trade-offs:**
- Bare-bones compared to the others.
- Not actively the recommended tool.

**Pick if:** you're learning the eval mental model and want to see how it's been done.

## The matrix

| Need | Pick |
|------|------|
| Just starting; eval set is small | **A script** |
| Best UI; premium experience; team usage | **Braintrust** |
| OSS, obs + evals in one | **Langfuse** |
| You're deep in LangChain | **LangSmith** |
| CI-driven, YAML config | **Promptfoo** |
| Pytest-style for Python | **DeepEval** |
| RAG-specific metrics | **Ragas** |

## The mistakes to avoid

### Adopting too early

A team with 5 eval cases doesn't need Braintrust. Run the script. Grow to 50 cases. Then evaluate platforms.

### Not pinning the judge model version

If your eval uses LLM-as-judge and the judge model silently updates, all your historical scores become incomparable. Pin the model version explicitly: `model="gpt-5-mini-2025-08-07"` not `model="gpt-5-mini"`.

### Eval-set-as-source-of-truth in a vendor

Your eval cases are the most important data you'll produce. They should live in git (as JSON or YAML), even if you load them into a vendor tool for the UI. Never let the vendor become the only place this data exists.

### Evaluating only what the tool measures

Built-in metrics (faithfulness, helpfulness, etc.) are starting points. Your domain-specific eval cases (this billing question must mention "refund," this RAG answer must cite source X) are the real signal. Don't let the tool's built-ins constrain what you evaluate.

## The integration pattern

The architecture that scales across teams and time:

```
.evals/
  cases/
    ticket-triage.json
    rag-faq.json
  scripts/
    runner.py
  results/
    [tool-of-choice exports]
```

- Cases in git.
- Runner script in git, calls into the tool's SDK.
- Results either in the tool's hosted dashboard OR exported back into git for diff-across-PRs.

The day you switch tools (and you will), only the runner script changes.

## Common mistakes

:::caution[Where people commonly trip up]
- **Adopting a platform before having 30+ cases.** You're paying for a UI to display nothing meaningful. Build the script; grow the set; THEN evaluate platforms.
- **Letting the tool define what you measure.** Built-in metrics are templates, not your eval suite. The eval cases that matter are the ones specific to your problem.
- **Eval data only in the vendor.** Your cases must live in git. Vendors come and go; eval cases are forever.
- **No CI integration.** An eval suite that someone has to remember to run manually gets run once a quarter and catches nothing. Tie it to PRs or daily cron.
- **Judge model drift.** If the judge model updates silently, your scores become incomparable across time. Pin model versions everywhere — judges most of all.
:::

<Quiz id="eval-tool-pick-quick-check" variant="micro" title="Quick check">

<Question
  prompt="A team with 5 eval cases asks which hosted eval platform to buy. What does this page advise?"
  options={[
    { text: "Buy the platform with the best comparison UI right away" },
    { text: "Stick with a simple script and git-versioned cases; evaluate platforms after the set grows to dozens of cases" },
    { text: "Use whichever platform integrates with their cloud provider" },
    { text: "Self-host an open-source platform to avoid vendor fees" }
  ]}
  correct={1}
  explanation="With 5 cases, a platform is a UI for displaying nothing meaningful. The script gives zero learning curve, full control, trivial CI integration, and no lock-in. Climb when you actually need run-over-run diffs, side-by-side model comparison, or team sharing."
/>

<Question
  prompt="Where should your eval cases live, according to this page?"
  options={[
    { text: "In the eval vendor's hosted dashboard, since that is where they get used" },
    { text: "In a shared spreadsheet the whole team can edit" },
    { text: "In git as JSON or YAML, even if you also load them into a vendor tool" },
    { text: "Inside the application database next to production data" }
  ]}
  correct={2}
  explanation="Eval cases are the most important data you will produce, and vendors come and go. Keeping cases in git means you can switch tools by changing only the runner script — the data that matters survives every migration."
/>

<Question
  prompt="Why must you pin the exact version of an LLM-as-judge model?"
  options={[
    { text: "Unpinned versions cost more per call" },
    { text: "Newer judge versions refuse to grade outputs" },
    { text: "Providers require version pins for judge workloads" },
    { text: "If the judge silently updates, historical scores become incomparable across time" }
  ]}
  correct={3}
  explanation="An eval score only means something relative to past scores. If the judge model changes underneath you, a score shift could be your change or the judge's — you can no longer tell. Pin model versions everywhere, judges most of all."
/>

</Quiz>

→ Next: [Observability pick](./08-observability-pick.md) — what to use to log production LLM calls.
