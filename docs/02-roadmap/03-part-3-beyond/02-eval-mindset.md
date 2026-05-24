---
id: eval-mindset
title: The Eval Mindset
sidebar_position: 3
sidebar_label: Eval mindset
description: How to think about measurement. LLM-judge biases (positional, verbosity, self-preference) and the mitigations that actually work.
---

# The Eval Mindset

> **In one line:** Evals are the foundation of every other AI skill — and the bulk of the work isn't the runner, it's curating cases that reflect reality and avoiding the biases of LLM-as-judge.

You built an eval runner in [Stage 6](../01-part-1-from-zero/07-stage-6-evals.md). This page is the *thinking* side: what to grade, how to grade it, what biases corrupt your scores, and how to keep an eval set honest as your product evolves.

## 1. What an eval is actually for

Three separate purposes, all worth keeping distinct in your head:

| Purpose | What you're measuring | Cadence |
|---------|-----------------------|---------|
| **Regression guard** | Did this change break any case that used to pass? | Every commit / PR |
| **Improvement signal** | Did this change increase the pass rate? | Per-iteration |
| **System characterization** | What kinds of inputs does this system handle vs. fail on? | Periodic audits |

A single eval set can serve all three, but the design choices differ. A regression set wants stability and breadth. An improvement set wants the hard cases at the boundary. A characterization audit wants representative sampling.

## 2. Three categories of grading, ranked by trust

### Deterministic (high trust, narrow scope)

- Schema validation.
- Required / forbidden substrings.
- Citation source-exists.
- JSON parse.
- Length bounds.

Use for everything you possibly can. Free, fast, completely repeatable.

### Reference-based (medium trust)

You have a "gold" answer (curated by you / your team). Score similarity:

- **Exact match** — only for very constrained outputs (classification labels).
- **Cosine similarity** of embeddings — captures semantic equivalence but loses faithfulness.
- **Token-level overlap** (BLEU, ROUGE) — legacy NLP metrics, weak signal for modern LLMs.
- **LLM-judge with the gold as reference** — much better than gold-free judging.

The reference-based approach is the gold standard for evals — literally. The cost is curating the gold answers in the first place.

### LLM-as-judge (lower trust, broad scope)

A separate LLM grades the output. Powerful for open-ended tasks; carries known biases (next section).

## 3. The LLM-judge biases everyone hits

### Positional bias

When comparing A vs B, the judge prefers whichever was presented first. Real effect; reproducible across model families.

**Mitigation:** randomize order on every comparison. Run each pair twice with the order flipped. If the verdict flips with the order, mark the pair "no signal" rather than a tie.

### Verbosity bias

The judge prefers longer answers. Real effect — longer outputs *feel* more substantive even when they're padded.

**Mitigation:** in the judge prompt, explicitly say "length is not a quality signal; rate equally regardless of word count." Also: include cases where the correct answer is short ("I don't know") so the judge calibrates.

### Self-preference / familial preference

When a judge from family X grades outputs from family X, it scores them higher than equivalent outputs from a different family.

**Mitigation:** use a judge from a *different family* than the system being judged. If you're testing GPT-5, use Claude as the judge.

### Confidence bias

LLMs tend to be over-confident in their own grades. A "5/5" from an LLM judge is more like "this isn't obviously wrong" than "this is excellent."

**Mitigation:** calibrate against ~20 human-rated cases. Build a small reference set where you've rated the cases yourself; compare your scores to the judge's. Adjust judge prompts or thresholds based on the gap.

### Reference bias

The judge anchors heavily on the gold answer. If your gold is overly specific, the judge will fail correct-but-different responses.

**Mitigation:** make gold answers *characteristic* rather than literal. "An answer mentioning refund process and timeline" not "Exactly: 'We will refund you within 5 business days.'"

## 4. The judge prompt template

A workable starting point:

```
You are evaluating an AI assistant's response.

QUESTION: {question}

REFERENCE (a good answer; not the ONLY good answer): {gold}

ACTUAL RESPONSE: {actual}

Score on a 1-5 scale on each dimension:
- Correctness: does it answer the question? (1 = wrong/irrelevant, 5 = correct)
- Faithfulness: does it stay grounded (no fabricated facts)? (1 = hallucinated, 5 = strictly grounded)
- Helpfulness: would a user be satisfied? (1 = useless, 5 = great)

Length is NOT a quality signal. Stylistic differences from the reference don't lower the score if the substance is right.

Return JSON: {"correctness": int, "faithfulness": int, "helpfulness": int, "rationale": str}
```

The explicit "length is not a signal" and "stylistic differences are OK" lines compensate for verbosity and reference biases respectively.

## 5. The curation problem

The hard part of evals isn't the runner; it's the cases.

### Where good eval cases come from

1. **Production failures.** Users complain, you investigate, add the failing case to the eval. This is the dominant source after launch.
2. **Adversarial brainstorming.** Sit down for an hour, ask "how would I break this?" Then write those as cases.
3. **Coverage audits.** "We have 50 cases. Do we cover all 6 categories? All 4 priority levels? Multi-turn? Refusals?"
4. **Real-traffic sampling.** Sample 1% of production calls, manually grade them, the disagreements become new cases.
5. **Cases from peer teams / users.** Bug reports, support tickets — all gold mines for eval cases.

### What a 100-case set should cover

Rough breakdown:

| Type | Share | Purpose |
|------|-------|---------|
| Easy / representative | 60% | Catch regressions |
| Hard / ambiguous | 20% | Push the system to its boundary |
| Edge cases | 10% | Empty input, super-long input, unusual formats |
| Refusal | 5% | Should answer "I don't know" or refuse gracefully |
| Adversarial | 5% | Prompt injection, leading questions, wrong premises |

## 6. The drift problem

Your eval set was good in Q1. Now it's Q3. Three things drift:

- **Your docs / data changed.** Refusal cases that should now answer become wrong-coded. Periodic audits.
- **The model changed.** Provider silently updates the model under the same name. Pin model versions everywhere.
- **The judge model changed.** Same problem, with more leverage — your scores become incomparable. Pin judge model versions.

Schedule an eval-set audit every quarter. Walk through cases, mark stale ones, write replacements.

## 7. The "right answer" trap

LLM evals often don't have ONE right answer. Two responses can both be correct in different ways. Embrace this:

- Use **judge prompts** that accept characteristic-not-literal matches.
- For classification, use **deterministic checks** on the label only; let the rest vary.
- For open-ended generation, use a **pass-band score** ("anything ≥4/5 is acceptable") not a precise threshold.

The discipline: don't reject correct-but-different responses just because they don't match your gold exactly.

## 8. When to trust the eval (and when not to)

You should trust the eval more when:

- The case set is large (100+) and covers the input distribution.
- Deterministic checks make up most of the grading.
- Judge biases are mitigated.
- You've calibrated judges against human grading.

You should trust it less when:

- The set is small (\&lt;30 cases — statistical noise dominates).
- All cases come from one source (overfitting risk).
- LLM-judge does all the grading with no human calibration.
- The eval set hasn't been audited recently.

## 9. The CI / CD integration

```yaml
# .github/workflows/eval.yml
on: [pull_request]
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: python evals/run.py --baseline main --candidate ${{ github.head_ref }}
      - run: python evals/compare.py --fail-on-regression
```

The diff is the signal. Block PRs that regress. Don't block on small absolute drops if variance is high; do block on case-level regressions (a case that used to pass now fails).

## Common mistakes

:::caution[Where people commonly trip up]
- **Trusting LLM-judge scores blindly.** Without calibration against human grading, you're trusting a model to grade a model. Run a 20-case human-rated calibration set; verify the judge aligns.
- **Overfitting the prompt to the eval set.** When you've tuned 10 prompt iterations against the same 100 cases, you're memorizing the test. Hold out 20% as a "test set" you check less often.
- **Using the same model family for system and judge.** Self-preference inflates scores. Always use a different family for judging.
- **Static eval sets.** A set you never update reflects reality 18 months ago. Continually add production failures.
- **Pass-rate as the only metric.** Track per-case results, not just the aggregate. A 90% pass rate that's regressed on critical cases is worse than 80% with no regressions.
- **No judge model versioning.** When the judge model updates, scores become incomparable. Pin versions everywhere.
:::

→ Next: [Retrieval quality](./03-retrieval-quality.md) — why chunking and hybrid search dominate embedding-model swaps.
