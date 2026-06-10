---
id: eval-tools
title: Eval tools
sidebar_position: 13
description: Braintrust, Langfuse, Promptfoo, Ragas, DeepEval, Vellum, Inspect AI — running eval suites in dev and CI.
---

# Eval tools

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Platforms that store your eval cases, run them on every prompt or model change, score the outputs, and track quality over time — the unit tests of your AI stack.

:::tip[In plain English]
"Evals" are how you answer "did my change make things better or worse?" — automatically, repeatedly, and on real cases. An eval is a triple: an input, an expected behavior (sometimes an expected answer, sometimes a rubric), and a way to score the actual output. You build a suite of 50 to 500 of these, run them on every prompt or model change, and watch the aggregate score. Without evals, you're tuning by vibes and your last user complaint. With evals, you ship faster than people without them.
:::

> **→ Going deeper:** This page is the *tool* layer. For the *discipline* — how to design eval cases, pick metrics, use LLM-as-judge well, and gate CI — see [Chapter 5: Evaluation & Measurement](/docs/evaluation), especially [LLM-as-judge](/docs/evaluation/eval-llm-as-judge) and [Production evals](/docs/evaluation/eval-production).

## The major options (2026)

| Tool | Type | OSS? | Eval style | CI-friendly | Best for |
|------|------|------|-----------|-------------|---------|
| **Promptfoo** | CLI + UI | yes | YAML configs | first-class | Lightweight, CI, version-controlled |
| **Braintrust** | Hosted | partial SDK | Code-first | yes | Polished UX, eval-driven teams |
| **Langfuse** | OSS + hosted | yes | Code + UI | yes | Combined obs + evals |
| **LangSmith** | Hosted | no | Code + UI | yes | LangChain-native |
| **Vellum** | Hosted | no | UI + workflow | partial | Non-engineering authors |
| **DeepEval** | Python lib | yes | pytest-style | first-class | Python teams; pytest workflow |
| **Ragas** | Python lib | yes | RAG-specific metrics | yes | RAG faithfulness / context relevance |
| **Inspect AI** (UK AISI) | Python lib | yes | Strong primitives | yes | Safety, security, agent evals |
| **Patronus** | Hosted | no | Hallucination / safety | yes | Hallucination-focused enterprises |
| **Confident AI** | Hosted (DeepEval team) | partial | Pytest + UI | yes | Pytest + dashboard |

## Default pick for most teams

**Promptfoo for CI + DeepEval (or pytest) for code-level assertions.** Eval cases live in YAML or Python *in your repo*, runs are reproducible, the diff between two runs is visible in a PR comment, and there's no vendor lock-in.

When you want the UI, the leaderboards, the prompt-management integration, and the team-wide dashboard: **Braintrust** is the polished choice in 2026, **Langfuse** is the OSS choice. Both let you keep eval cases in code if you want.

## When to deviate

- **You only do RAG and want metrics for free** (faithfulness, context precision, answer relevance): **Ragas** — usually alongside one of the above, not instead.
- **You already use LangChain everywhere**: **LangSmith** integrates with zero extra wiring.
- **You're evaluating agents or safety / jailbreak resistance**: **Inspect AI** has the best primitives.
- **Hallucination is the existential metric** (legal, medical, financial): **Patronus** or a Patronus-style judge in your custom pipeline.
- **Non-engineering authors own the prompts and evals**: **Vellum** or **Braintrust**' UI-driven workflow.
- **You want pytest semantics and nothing more**: **DeepEval**.

## Minimum integration

**Promptfoo — YAML in CI:**

```yaml
# promptfooconfig.yaml
prompts:
  - "Summarize in one sentence: {{document}}"

providers:
  - anthropic:claude-sonnet-4-6
  - openai:gpt-5.1

tests:
  - vars: { document: "Long article text here..." }
    assert:
      - type: llm-rubric
        value: "The summary is one sentence and captures the main point."
      - type: latency
        threshold: 3000
```

```bash
npx promptfoo eval         # runs all cases
npx promptfoo view         # opens the comparison UI
```

Drop the same config into a GitHub Actions workflow and you have eval-on-every-PR.

**DeepEval — pytest-style:**

```python
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric

def test_summarizer():
    case = LLMTestCase(input="Long article...", actual_output=summarize("Long article..."))
    assert_test(case, [AnswerRelevancyMetric(threshold=0.8)])
```

**Braintrust — code-first, hosted dashboard:**

```python
from braintrust import Eval

Eval(
  "summarizer",
  data=lambda: load_eval_cases(),
  task=lambda input: summarize(input),
  scores=[Factuality(), Conciseness()],
)
```

## What good eval ergonomics look like

- Eval cases live in code (version-controlled), not only in the tool's UI.
- Runs are reproducible — same input + same model → same output (or you log the seed / temperature).
- Failures are inspectable with full prompt / response / diff side-by-side.
- You can compare two runs (this PR vs main) at a glance.
- You can promote a production log to an eval case in one click.
- Scores are decomposable — not "78" but "factuality 0.9, conciseness 0.6, format 1.0."
- Runs are tagged with model name, prompt version, and commit SHA.

## Pricing & cost notes

| Tool | Free | Paid starts at |
|------|------|---------------|
| Promptfoo | yes (CLI) | optional hosted |
| Braintrust | Hobby tier | usage-based |
| Langfuse | OSS / Cloud free | $29/mo team |
| LangSmith | Free tier | $39/mo / seat |
| DeepEval / Ragas / Inspect | free | — |
| Vellum / Patronus | trial | enterprise $$ |

The bigger spend is **LLM-as-judge tokens**. A 200-case eval that runs an Opus judge on every case costs ~$5–$15. Multiply by every PR. Use cheaper judges where you can.

## Pitfalls

- **No evals.** "I'll add them later" turns into shipping prompt changes blind for six months.
- **All LLM-as-judge, no deterministic checks.** Judges hallucinate too. Mix: regex, JSON-validates, latency thresholds, *plus* judge for fuzzier dimensions.
- **Tiny eval set.** 5 cases is not statistically meaningful. Aim for 50+ to start, 200+ at maturity.
- **Eval cases that only cover happy paths.** The bugs are in the long tail. Explicitly seed adversarial / confused / multilingual / edge cases.
- **Judge model is the same as the model under test.** It will rate its own output too highly. Use a different family.
- **Evals only in the UI.** They can't be diffed in a PR; they rot. Code first, UI second.
- **No threshold gates in CI.** If the eval score drops 10% and the PR still merges, you don't have evals — you have telemetry.
- **Not promoting prod traces to evals.** Your best eval cases come from real users hitting unexpected paths. Build the "send this trace to evals" button.

<Quiz id="eval-tools-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Your eval score drops 10% but the PR merges anyway. What does the page say you actually have?"
  options={[
    { text: "Telemetry, not evals — without threshold gates in CI the suite does not protect quality" },
    { text: "A healthy process, since evals are advisory by design" },
    { text: "A judge-model problem that a bigger model would fix" },
    { text: "Proof that the eval set is too large" }
  ]}
  correct={0}
  explanation="The point of an eval suite is to block regressions before they ship; scores that merely get recorded are observability, not protection. Treating evals as advisory feels pragmatic but recreates the exact 'tuning by vibes' problem evals exist to solve."
/>

<Question
  prompt="What is wrong with scoring every eval case with LLM-as-judge alone?"
  options={[
    { text: "Judges are too slow to run in CI pipelines" },
    { text: "Judges hallucinate too — mix deterministic checks like regex and JSON validation with judges for the fuzzier dimensions" },
    { text: "LLM judges cannot output numeric scores" },
    { text: "Judge usage violates most provider terms" }
  ]}
  correct={1}
  explanation="A judge model is itself an LLM with failure modes, so cheap deterministic assertions — does the JSON parse, does the latency clear the threshold — should carry the load they can, with judges reserved for qualities only a model can assess. Speed isn't the blocker; reliability is."
/>

<Question
  prompt="Why does the page default to Promptfoo plus DeepEval rather than a hosted, UI-first platform?"
  options={[
    { text: "Hosted platforms cannot run LLM-as-judge metrics" },
    { text: "UI-first tools are always more expensive" },
    { text: "Eval cases live version-controlled in your repo, runs are reproducible, and there is no vendor lock-in" },
    { text: "They are the only tools that support RAG metrics" }
  ]}
  correct={2}
  explanation="Code-first evals diff in PRs, replay identically, and survive a vendor change — 'evals only in the UI' is a named pitfall because they rot there. Hosted platforms run judges just fine and several have free tiers; the durable argument is where the cases live, not capability or price."
/>

</Quiz>

---

→ Next: [Observability tools](./observability-tools.md)
