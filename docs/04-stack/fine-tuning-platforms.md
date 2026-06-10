---
id: fine-tuning-platforms
title: Fine-tuning platforms
sidebar_position: 20
description: OpenAI fine-tuning, Together, Modal, Hugging Face, Unsloth, Predibase — where (and when) to fine-tune.
---

# Fine-tuning platforms

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** Where you actually run the training job. Pick after you've decided fine-tuning is the right tool — most of the time, it isn't.

:::tip[In plain English]
Fine-tuning takes a base model and continues training it on your data so it gets better at your specific task. It's not magic: it can't teach the model facts (that's RAG), it doesn't fix bad prompts, and it costs more time and money than people expect. When it works, it's transformative — a small specialized model that beats a frontier model on your one task, for 1/10th the cost per call. When it doesn't, you've spent two weeks for nothing. The platforms here are the *how*; deciding *whether* is the bigger question.
:::

> **→ Going deeper:** This page is the *platform* layer. For the method — the decision tree, data prep, LoRA vs full SFT, and how to evaluate a fine-tune — see [Chapter 7: Fine-tuning & Customization](/docs/fine-tuning), starting with [When to fine-tune](/docs/fine-tuning/ft-when) and [LoRA / QLoRA](/docs/fine-tuning/ft-lora).

## The major options (2026)

| Platform | Type | Models supported | Style | Best for |
|----------|------|-----------------|-------|---------|
| **OpenAI fine-tuning** | Hosted | GPT-4o, GPT-5.1 mini, o-mini lines | SFT, DPO, RFT | Easiest path; production-ready in days |
| **Anthropic (via Bedrock)** | Hosted | Claude family (limited) | SFT | Enterprise; AWS-stack |
| **Together AI** | Hosted | Llama, Mistral, Qwen, DeepSeek | SFT, LoRA, DPO | Open-weight fine-tuning at scale |
| **Fireworks** | Hosted | Open weights | LoRA, SFT | Fast iteration on open models |
| **Replicate** | Hosted | Many open models | SFT, LoRA | Quick and visual |
| **Modal** | Serverless GPUs | Anything (you write the script) | DIY | Custom training loops, full control |
| **Hugging Face AutoTrain** | Hosted | HF Hub models | No-code SFT | Non-engineers; small experiments |
| **Unsloth** | OSS library | Llama, Mistral, Qwen, Gemma | 2x faster, 70% less memory | Pairs with Modal / RunPod |
| **Axolotl** | OSS config-driven | Most open models | YAML configs | Reproducible community recipes |
| **Predibase** | Hosted (Ludwig) | Many open models | LoRA-as-a-service | Production LoRA at scale |
| **Mosaic AI (Databricks)** | Enterprise | Open weights | SFT, continued pre-training | Databricks shops |
| **NVIDIA NeMo / NIMs** | Self / NVIDIA-managed | NVIDIA-curated models | Enterprise full-stack | NVIDIA enterprise |

## Default pick for most teams

**Don't fine-tune.** First exhaust prompting, structured output, RAG, and tier-routing. The frontier model is updated faster than you can re-train, and prompt iteration is hours, not days.

When you've genuinely decided to fine-tune:

- **You want the easiest path:** **OpenAI fine-tuning** on `gpt-5.1-mini` for SFT, or **RFT** if you have graders.
- **You want an open model you can rehost cheaply:** **Together AI** or **Fireworks** to fine-tune Llama / Mistral, then serve it on the same platform.
- **You want full control or weird training setups:** **Modal + Unsloth** + Llama / Qwen / Gemma. ~$5–$50 a job; pure Python.

## Fine-tuning flavors

- **SFT (Supervised Fine-Tuning)** — `{input, ideal_output}` pairs. The default. Teaches the model "for inputs like this, produce outputs like this." Needs ~500+ clean examples.
- **DPO (Direct Preference Optimization)** — `{input, chosen, rejected}` triples. Teaches preferences ("this answer style is better than that style") without needing a reward model.
- **RFT (Reinforcement Fine-Tuning, OpenAI 2024+)** — Grader function defines the reward. Useful when you have a programmatic check ("the answer is correct iff this regex matches") but can't write the perfect output by hand.
- **LoRA / QLoRA** — Adapter-based: you don't touch the full model, you train a small low-rank addition. ~100× cheaper than full fine-tuning; quality usually within 1–3% of full SFT for most tasks.
- **Continued pre-training** — Take a base model and keep training on raw domain text (medical literature, legal corpora). Rare; expensive; for specialty domains only.

## When fine-tuning makes sense

- You've **exhausted prompting and RAG** and hit a quality ceiling.
- You have **hundreds to thousands of high-quality examples** of the input → ideal-output pattern.
- The task is **narrow and stable** — you're not going to need to retrain monthly.
- **Latency or cost pressure** justifies a smaller specialized model (e.g. Sonnet → fine-tuned Haiku).
- You want **specific output style/format** that prompting can't enforce reliably.
- You need **on-prem** and want a model fully under your control.

## When it doesn't

- "The model doesn't know X." That's a **RAG** problem, not a fine-tune problem.
- You have **< 200 clean examples**. You'll overfit; the model will get worse on anything not in the training set.
- The task **changes often**. Every retrain is a new bill.
- A **larger frontier model** would solve it without retraining (often does).
- **You haven't built evals yet.** You can't tell if fine-tuning helped.

## Minimum integration

**OpenAI SFT — three steps:**

```python
import openai
client = openai.OpenAI()

# 1. Upload JSONL with {"messages": [...]} per line
training_file = client.files.create(
    file=open("train.jsonl", "rb"),
    purpose="fine-tune",
)

# 2. Kick off a fine-tune
job = client.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-5.1-mini-2025-08",
    method={"type": "supervised"},
)

# 3. When done, the fine-tuned model has its own ID; call it like any other.
client.chat.completions.create(model=job.fine_tuned_model, messages=[...])
```

**Together — LoRA on Llama:**

```python
from together import Together
client = Together()

job = client.fine_tuning.create(
    training_file="train.jsonl",
    model="meta-llama/Llama-3.3-70B-Instruct-Reference",
    lora=True,
    n_epochs=3,
)
# Same shape as OpenAI; serve the resulting model on Together's endpoints.
```

**Modal + Unsloth — DIY at half the cost:**

```python
# Modal function that runs Unsloth's training script on an A100
import modal
app = modal.App("ft")
img = modal.Image.debian_slim().pip_install("unsloth", "trl", "torch")

@app.function(image=img, gpu="A100-80GB", timeout=3600)
def train():
    from unsloth import FastLanguageModel
    model, tok = FastLanguageModel.from_pretrained("meta-llama/Llama-3.3-8B")
    # ... write SFTTrainer config, train, push to HF hub or save to volume
```

## Pricing & cost notes (May 2026)

| Platform | Training cost | Inference markup |
|----------|--------------|------------------|
| OpenAI fine-tuning | ~$3/Mtok training | ~2× base model for inference |
| Anthropic (Bedrock) | enterprise pricing | usually ~1.5–2× base |
| Together | ~$0.40/Mtok training (Llama 70B) | same as base + small LoRA premium |
| Fireworks | ~$0.50/Mtok training | base + ~$0.20/Mtok |
| Modal + Unsloth | $1.50/hr GPU; ~$5–$50 per job | self-served = your GPU cost |
| Predibase | usage-based | usage-based |

A typical "1000-example SFT on a small model" costs $5–$50 in training; the real cost is your engineering time and the per-call inference surcharge after.

## Pitfalls

- **Fine-tuning before evals.** You can't measure success. Always build the eval set first.
- **Fine-tuning to teach facts.** Use RAG. Fine-tuning bakes in patterns, not knowledge.
- **Dirty training data.** One mis-labeled example per fifty is the difference between a great model and a confidently-wrong one. Spend time on data quality.
- **Too few examples.** Below ~200 you're more likely to overfit than to learn.
- **No held-out set.** Train and evaluate on the same data = you have a memorizer, not a generalizer.
- **Fine-tuning a model you can't roll back.** Always keep the base-model call wired up so you can A/B and revert.
- **Catastrophic forgetting.** The model gets great at your task and worse at general reasoning. Mix in some general examples or evaluate broadly.
- **Forgetting that frontier models keep getting better.** A fine-tune that won by 10% over GPT-5.1 today may be tied by GPT-5.2 in six months. Re-check periodically.
- **Hand-rolling distributed training.** Modal, Together, Unsloth — they exist so you don't have to. Don't reinvent.

<Quiz id="fine-tuning-platforms-quick-check" variant="micro" title="Quick check">

<Question
  prompt="The model keeps getting facts about your product wrong. What is the right fix, per the page?"
  options={[
    { text: "RAG — fine-tuning bakes in patterns and style, not knowledge" },
    { text: "Fine-tune on a corpus of product documentation" },
    { text: "Increase the temperature so the model explores more" },
    { text: "Switch to DPO with preference pairs" }
  ]}
  correct={0}
  explanation="'The model doesn't know X' is the canonical RAG problem: retrieval injects current facts at query time, while fine-tuning teaches output patterns and formats. Training on docs is the tempting move, but baked-in facts go stale immediately and the model still confabulates around them."
/>

<Question
  prompt="What does the page say to exhaust BEFORE reaching for fine-tuning?"
  options={[
    { text: "Distributed training and a custom reward model" },
    { text: "Continued pre-training on domain text" },
    { text: "A larger GPU cluster" },
    { text: "Prompting, structured output, RAG, and tier-routing" }
  ]}
  correct={3}
  explanation="Prompt iteration takes hours while a fine-tune takes days and a new bill on every retrain — and frontier models improve faster than you can re-train, often erasing your edge. Continued pre-training is rarer and more expensive than ordinary fine-tuning, so it is even further down the list, not before it."
/>

<Question
  prompt="What is the appeal of LoRA over full supervised fine-tuning?"
  options={[
    { text: "It permanently improves the base model for all users" },
    { text: "It works without any training examples" },
    { text: "Training a small low-rank adapter is roughly 100 times cheaper, with quality usually within a few percent of full SFT" },
    { text: "It eliminates the need for a held-out eval set" }
  ]}
  correct={2}
  explanation="LoRA leaves the base weights untouched and trains a compact adapter, capturing most of the quality at a fraction of the cost — which is why it is the default flavor for open-weight tuning. It still needs clean examples and a held-out set; cheaper training does not exempt you from eval discipline."
/>

</Quiz>

---

→ Next: [Stack checkpoint](./stack-checkpoint.md)
