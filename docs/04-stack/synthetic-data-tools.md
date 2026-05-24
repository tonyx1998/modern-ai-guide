---
id: synthetic-data-tools
title: Synthetic data tools
sidebar_position: 12
description: Distilabel, Argilla, Lilac, Gretel, PromptWright, Bonito — generating training and eval data when you don't have enough logs.
---

# Synthetic data tools

> **In one line:** Tools that use an LLM to generate the training, eval, or fine-tuning data you don't have — and the labeling / curation surfaces to clean what you generate.

:::tip[In plain English]
You shipped a feature on Tuesday. By Friday someone asks "how do we know it works?" and you realize you have twelve real conversations and need an eval set of two hundred. Synthetic data tools generate that set: ask a stronger model to produce realistic user inputs (and sometimes answers), then have humans (or a judge model) curate them down to the keepers. Same idea for fine-tuning data, classifier training data, RAG eval sets — anywhere you need *coverage* you don't have logs for.
:::

## The major options (2026)

| Tool | Type | Hosted? | Strengths | Best for |
|------|------|---------|-----------|---------|
| **Distilabel** (Argilla) | OSS Python library | self / HF | Pipelines for synthetic + DPO data | Generating fine-tune datasets |
| **Argilla** | Labeling UI + OSS | self / HF / cloud | Curate, label, version datasets | Human-in-the-loop curation |
| **Lilac** (Databricks) | OSS dataset inspector | self | Search, slice, cluster large datasets | Understanding what you have |
| **Gretel** | Hosted | yes | Tabular + text synthetic data, differential privacy | Compliance, structured data |
| **PromptWright** | OSS lib | self | Lightweight prompt-driven generation | Quick synthetic eval sets |
| **Bonito** | OSS model | self | Task-specific instruction generation | Generating Q&A from a corpus |
| **Mostly AI / Tonic / Hazy** | Hosted | yes | Tabular synthetic at enterprise scale | Test data from prod tables |
| **Synthflow** (Anthropic-style) | DIY with Claude/GPT | — | "Write a prompt that writes prompts" | Custom domain generation |
| **Self-Instruct (DIY)** | Pattern | — | Original Stanford pattern; minimal deps | Bootstrap small datasets |

## Default pick for most teams

**Distilabel + Argilla**, both open-source from the same team. Distilabel runs the generation pipeline; Argilla gives you the UI to curate and label what comes out. They speak the same data format and integrate with Hugging Face datasets out of the box.

For pure eval data generation without the curation UI, a **DIY Self-Instruct loop** with Claude or GPT (write a generator prompt, run it 200 times, dedupe) is 50 lines and often sufficient.

## When to deviate

- **Tabular / structured data with privacy constraints** (synthesize realistic users / orders / transactions): **Gretel**, **Mostly AI**, or **Tonic**. They handle differential privacy and statistical fidelity.
- **You already have a huge dataset and need to understand it** (cluster, dedupe, find outliers): **Lilac**.
- **You want a model that's actually trained to generate instruction data**: **Bonito**.
- **Hosted, want a UI, fine with vendor lock**: **Scale**, **Labelbox**, or **Snorkel Flow** — heavier but production-grade.
- **The eval set is small (~50 examples) and you have an LLM**: skip the tools, write the loop.

## Why synthetic data at all?

- **Eval coverage you don't have logs for.** New feature, no users yet → no production traffic to evaluate against.
- **Adversarial / edge cases.** Real users don't reliably ask malformed questions. You need to generate the long tail.
- **Fine-tuning data.** Need 1,000 examples of "input → ideal output" and you have 30 → generate the gap.
- **DPO / RLHF.** Need preference triples `{prompt, chosen, rejected}` — Distilabel has primitives for this.
- **Privacy-safe test data.** Generate realistic but unrelated users / docs so dev/staging don't leak prod.

## Minimum integration

**DIY Self-Instruct loop — the simplest possible synthetic eval set:**

```python
from anthropic import Anthropic
client = Anthropic()

prompt = """Generate 5 realistic user questions about resetting passwords.
Include 1 short, 2 medium, 1 long, and 1 adversarial / confused one.
Return as a JSON array of strings."""

questions = []
for _ in range(40):  # 40 batches of 5 = 200 questions
    r = client.messages.create(model="claude-sonnet-4-6", max_tokens=2048,
                               messages=[{"role": "user", "content": prompt}])
    questions.extend(json.loads(r.content[0].text))

# Dedupe + manual review of 200 → keep ~150 as the eval set
```

**Distilabel — a pipeline with a stronger model and a judge:**

```python
from distilabel.pipeline import Pipeline
from distilabel.steps.tasks import SelfInstruct, UltraFeedback

with Pipeline("synth-evals") as pipeline:
    gen = SelfInstruct(llm=anthropic_llm, num_instructions=200)
    judge = UltraFeedback(llm=opus_llm)  # rates each one
    gen >> judge

dataset = pipeline.run()
dataset.to_argilla()  # send to Argilla UI for human curation
```

## Patterns worth knowing

- **Generator-judge pair.** Use a strong model to *generate* and an even stronger one (or a different one) to *judge / filter*. Same model for both leaks bias.
- **Seed with real examples.** Hand-write 10 great cases. Have the generator produce variations.
- **Diversity sampling.** Naive generation produces near-duplicates. Cluster the output and sample across clusters.
- **Always human-curate.** Synthetic data has subtle weirdness (formal phrasing, missing typos, model-isms). A 30-minute pass through Argilla catches most of it.
- **Mark synthetic vs real.** Every row in your eval set should be labeled "synthetic" or "from production trace." Mixing them silently distorts scores.
- **Generate for the failure modes you've seen.** "Generate 50 user messages that look like our top-3 confused-user clusters" is more valuable than "generate 200 generic ones."

## Pricing & cost notes

| Approach | Cost for ~1,000 examples |
|----------|--------------------------|
| DIY Self-Instruct via Claude Sonnet | ~$2–$10 |
| Distilabel OSS + provider tokens | same + your compute |
| Argilla OSS | free (self-host) |
| Gretel hosted | $0–$295/mo + usage |
| Tonic / Mostly AI enterprise | $$$$ (annual contracts) |

Synthetic eval data is one of the cheapest, highest-leverage investments in your AI stack. A $5 generation run that surfaces a real regression has paid for itself.

## Pitfalls

- **Treating synthetic data as ground truth.** It's a *seed*. Real production traces still beat it for what users actually do.
- **Same model generates and judges.** The judge will rate its own output too highly. Mix providers.
- **No deduplication.** Naive LLM generation produces high duplication rates (30%+). Embed, cluster, dedupe.
- **No human review.** Subtle phrasing artifacts ("As an AI assistant...") leak into your eval set and quietly bias scores.
- **Using synthetic data to fine-tune away production errors without verifying.** You can over-fit to artifacts. Always evaluate on a held-out, *real* set after training.
- **Not labeling synthetic rows.** Six months later, nobody remembers which examples are real. Always tag.
- **Generating only "easy" cases.** A model generating user questions tends to produce well-formed ones. Real users mangle queries. Explicitly prompt for the messy long tail.

---

→ Next: [Eval tools](./eval-tools.md)
