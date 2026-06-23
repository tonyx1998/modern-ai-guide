---
id: quantization
title: Quantization (smaller weights, cheaper inference)
sidebar_position: 6.2
description: Storing model weights at lower precision (FP8, INT8, INT4) to fit bigger models on smaller GPUs and serve them faster — the memory math, the quality trade-off, and when a quantized big model beats a small one.
---

# Quantization (smaller weights, cheaper inference)

> **In one line:** Quantization stores a model's weights at lower numeric precision — 16-bit floats down to 8-bit or 4-bit — so the model takes far less GPU memory and runs faster, at a small and measurable accuracy cost. It's the main lever for serving open models cheaply.

:::tip[In plain English]
A model is billions of numbers. By default each number is stored in 16 bits — fairly precise, fairly bulky. Quantization rounds those numbers to fewer bits (say 4), the way you might store a price as `$3` instead of `$2.9987`. The file shrinks, it fits on a smaller GPU, and each token is generated faster because there's less data to shuffle around — and if you don't round too hard, the answers barely change. That's the whole trick: trade a sliver of precision for a big cut in memory and cost.
:::

:::note[Prerequisites]
This page builds on [Training vs. inference](./training-vs-inference.md) (where inference cost comes from) and pairs with [QLoRA](/docs/fine-tuning/ft-lora) (which quantizes a model so you can *fine-tune* it cheaply — a different goal from serving it). If "GPU memory" and "tokens per second" are fuzzy, skim those first.
:::

## Terms, defined once

- **Precision** — how many bits represent each weight. **FP16 / BF16** = 16-bit (2 bytes), the default. **FP8 / INT8** = 8-bit (1 byte). **INT4** = 4-bit (½ byte).
- **Quantization** — converting weights from higher to lower precision after (or during) training.
- **Weight-only quantization** — shrink the stored weights; do the math in higher precision. The common, safe choice.
- **Weight + activation quantization (e.g. W8A8)** — also lower the precision of the numbers flowing *through* the model. Bigger speedup, bigger quality risk.
- **Calibration** — running a small sample of data through the model to choose smart rounding ranges. Good schemes (**GPTQ**, **AWQ**, **NF4**) calibrate; naive round-to-nearest (**RTN**) doesn't, and it shows.

## The memory math (the part that decides everything)

Memory for the weights is just **parameter count × bytes per parameter**. Take a 70-billion-parameter open model:

```
FP16 (2 bytes):   70B × 2.0 = 140 GB
INT8 (1 byte):    70B × 1.0 =  70 GB
INT4 (0.5 byte):  70B × 0.5 =  35 GB
```

Now line that up against real GPUs (an H100/A100 is 80 GB):

| Precision | Weights | Fits on… |
|---|---|---|
| FP16 | 140 GB | **2× 80 GB GPUs** (won't fit on one) |
| INT8 | 70 GB | **one 80 GB GPU**, tight |
| INT4 | 35 GB | **one 48 GB GPU** (with room for the KV cache) |

That single table is why quantization exists: it's the difference between renting two H100s and renting one smaller card. (Add ~20% on top of the weight numbers for the KV cache and runtime overhead.)

## Why it also makes inference *faster*

Generating each token is **memory-bandwidth bound** — the GPU spends most of its time reading the weights out of memory, not doing arithmetic. Halve the bytes per weight and you roughly halve the data moved per token, which in the memory-bound regime can nearly **double throughput**. FP8 goes further on modern hardware (H100/H200/Blackwell) because the chip has native FP8 math units, so it speeds up the compute too — that's why FP8 is the default serving precision for many 2026 open-model deployments.

## The quality trade-off (measure it, don't guess)

Lower precision = some accuracy loss. The size of the loss depends almost entirely on the *scheme*, not just the bit count:

| Precision | Typical quality hit | Notes |
|---|---|---|
| **FP8** | Near-zero | Hardware-accelerated; common production default |
| **INT8** (weight-only) | `<1%` on most tasks | Safe, well-supported |
| **INT4** with AWQ/GPTQ/NF4 | ~1–3% on many tasks; more on hard reasoning/math | The calibrated schemes; the usable 4-bit |
| **INT4** naive (RTN) | Often large, unpredictable | Avoid — this is where "quantization ruined my model" stories come from |

The rule of thumb that matters most: **a bigger model quantized to 4-bit usually beats a smaller model at full precision for the same memory budget.** A 70B model at INT4 (35 GB) typically outperforms a 13B model at FP16 (26 GB). When you're GPU-constrained, quantize *up* a tier rather than dropping to a smaller model.

## Why it matters

- **It's the cost lever for open models.** [Self-hosting](./training-vs-inference.md) only beats hosted APIs when your GPUs are well-utilized; quantization is how you fit the model on cheaper hardware and push more tokens through it.
- **It's mostly invisible on closed APIs — and that cuts both ways.** Providers quantize their served models however they like and may change it silently between checkpoints. You can't control it, but it's one more reason your [eval set](/docs/evaluation) is the only ground truth: a provider re-quantizing can move your quality without any version-number change.
- **KV-cache quantization is a separate lever.** You can also store the *KV cache* (the running attention memory) at lower precision to fit longer contexts. Treat it as its own knob — it's more quality-sensitive than weight quantization.

## Common pitfalls

:::caution[Where teams trip]
- **Quantizing, then not re-running evals.** The whole point is a *measured* trade-off. Always run your held-out eval set at the target precision before shipping — the quality hit is task-specific and you cannot eyeball it.
- **Assuming all 4-bit is equal.** Naive RTN and a properly calibrated AWQ/GPTQ build can differ by many points on the same model. The scheme matters more than the bit count.
- **Quantizing activations and the KV cache as aggressively as the weights.** Weight-only INT8/INT4 is forgiving; pushing activations and KV to 4-bit often hurts far more for far less gain. Quantize weights first, measure, then consider the rest.
- **Confusing serving quantization with QLoRA.** [QLoRA](/docs/fine-tuning/ft-lora) quantizes a frozen base model so you can *train* an adapter on a small GPU. That's a fine-tuning technique. This page is about quantizing for *inference*. Same idea (fewer bits), different goal.
- **Over-quantizing a reasoning model.** [Reasoning models](./reasoning-models.md) lean on long, precise chains of thought; they tend to degrade earlier under aggressive 4-bit than chat models do. Be more conservative there.
:::

:::info[Try it — a one-afternoon project]
Pick an 8B open model (e.g. a Llama or Qwen 8B). Serve it twice with [Ollama](/docs/stack/inference-servers) or vLLM: once at FP16/BF16, once at 4-bit (a `Q4_K_M` GGUF, or bitsandbytes NF4). Then measure three things on both:
1. **Peak VRAM** (`nvidia-smi`),
2. **Tokens/sec** on a fixed prompt,
3. **Quality** on 20 of your own eval prompts (reuse the eval set from [Stage 6](/docs/roadmap/part-1-from-zero/stage-6-evals)).

Write up the deltas: how much VRAM and latency you bought, and what (if anything) it cost you in answer quality. That single table — memory and speed won vs. quality lost — *is* the quantization decision, and it's exactly the kind of "I measured a real trade-off" artifact a [portfolio](/docs/career/career-portfolio) post is made of.
:::

## Where this fits

Quantization is one of the levers behind the "[cheapest place on the curve](./training-vs-inference.md)" advice and the [closed-vs-open decision](/docs/decisions/closed-vs-open): the reason a self-hosted open model can undercut a hosted API on price is that you can quantize it onto commodity GPUs and keep them busy. For the serving stack that applies it, see [inference servers](/docs/stack/inference-servers) and [open models](/docs/stack/open-models).

<Quiz id="quantization-quick-check" variant="micro" title="Quick check">

<Question
  prompt="A 70B-parameter model won't fit on your single 80 GB GPU at FP16. Roughly how much memory do its weights need at INT4, and what does that enable?"
  options={[
    { text: "About 140 GB — still needs two GPUs" },
    { text: "About 35 GB — it now fits on one GPU with room for the KV cache" },
    { text: "About 70 GB — exactly filling the 80 GB card" },
    { text: "Quantization doesn't change memory, only speed" }
  ]}
  correct={1}
  explanation="Weight memory is parameters × bytes-per-parameter. INT4 is half a byte, so 70B × 0.5 = 35 GB — a quarter of the 140 GB FP16 footprint. That's the core payoff: a model that needed two 80 GB GPUs now fits comfortably on one, with headroom for the KV cache. Quantization changes both memory and speed (token generation is memory-bandwidth bound)."
/>

<Question
  prompt="You have a fixed 35 GB memory budget. Which usually gives better quality?"
  options={[
    { text: "A 13B model at FP16" },
    { text: "A 70B model quantized to INT4 with a calibrated scheme (AWQ/GPTQ)" },
    { text: "They're identical — only parameter count matters" },
    { text: "Whichever was released more recently" }
  ]}
  correct={1}
  explanation="For the same memory budget, a bigger model quantized to a well-calibrated 4-bit typically beats a smaller model at full precision. A 70B at INT4 (~35 GB) generally outperforms a 13B at FP16 (~26 GB). The practical rule when GPU-constrained: quantize up a tier rather than dropping to a smaller model — provided you use a calibrated scheme, not naive round-to-nearest."
/>

<Question
  prompt="What's the single most important step after quantizing a model for production?"
  options={[
    { text: "Nothing — INT4 is lossless if the file loads" },
    { text: "Re-run your held-out eval set at the target precision to measure the actual quality hit" },
    { text: "Immediately quantize the activations and KV cache to 4-bit too" },
    { text: "Switch to a reasoning model to compensate" }
  ]}
  correct={1}
  explanation="The quality cost of quantization is real and task-specific — you cannot eyeball it. Running your eval set at the target precision turns 'I hope this is fine' into a measured trade-off. Quantization is never lossless, naive 4-bit can be badly lossy, and aggressively quantizing activations/KV on top of the weights usually hurts more than it helps. Measure first."
/>

</Quiz>

---

→ Next: [Reasoning models](./reasoning-models.md)
