---
id: math-primer
title: Math primer (appendix)
sidebar_position: 90
description: Optional 1-page intuition for the math you can ignore as an AI engineer — but want to understand if you specialize into ML, fine-tuning, or research engineering.
---

# Math primer (appendix)

> **In one line:** You can ship LLM apps for years without any of this — but if you ever want to specialize into fine-tuning, inference optimization, or research engineering, this is the intuition you'll need on the on-ramp.

:::tip[In plain English]
This appendix is explicitly optional. Every other page of this guide says "no calculus required" — and means it. But if you're curious about what's actually happening inside the box, or you're planning to specialize later, this page gives you the four mental images that matter: embeddings as geometry, softmax as a vote, attention as a similarity-weighted average, and gradient descent as rolling downhill. No proofs, no derivations — just intuition.
:::

## 1. Embeddings — geometry, not magic

A token embedding is a vector — say, 1536 numbers. Each number is a coordinate in a 1536-dimensional space. Tokens with related meanings end up near each other in that space; unrelated tokens end up far apart.

"Near" and "far" are defined by:

- **Cosine similarity:** dot product of the two vectors, normalized by their lengths. Range: -1 (opposite) to 1 (same direction). The default similarity metric for embeddings.
- **L2 distance:** straight-line distance. Useful when magnitude matters.

Why a dot product? If both vectors have unit length, the dot product equals the cosine of the angle between them. Vectors pointing the same way → high dot product → similar meaning.

```
"king" - "man" + "woman" ≈ "queen"
```

That cliché actually works (more or less) because of this geometric structure. Concepts are *directions* in the space — the "royalty direction," the "gender direction," etc. — and you can add and subtract directions.

This is the whole intuition behind vector search ([Vector search](./vector-search.md)) and embeddings ([Embeddings](./embeddings.md)).

## 2. Softmax — turning numbers into a vote

Anywhere the model has to *choose* something — which token to emit next, which input position to attend to — softmax is the mechanism.

Input: a list of arbitrary numbers (called "logits"). Output: a list of probabilities that sum to 1.

```
logits = [2.0, 1.0, 0.1]
softmax(logits) ≈ [0.66, 0.24, 0.10]   # sums to 1
```

Mechanically: exponentiate each logit, divide by the sum of the exponentials. The exponential is what makes softmax "winner-takes-most" — small differences in logits become big differences in probabilities.

The **temperature** knob ([Sampling](./sampling.md)) scales the logits before softmax. Low temperature (e.g. 0.1) sharpens the distribution — the top option dominates. High temperature (e.g. 1.5) flattens it — the distribution is closer to uniform.

That's the entire math behind `temperature` and `top_p` knobs.

## 3. Attention — a similarity-weighted average

This is the trick that defines the transformer. For each token, attention answers: *"which other tokens should I look at, and how much?"*

Each token has three derived vectors:

- **Query (Q):** "what am I looking for?"
- **Key (K):** "what am I about?"
- **Value (V):** "what info do I carry?"

The mechanism, for one token:

1. Compute dot product of my Q with every other token's K → a similarity score per token.
2. Apply softmax → those scores become weights summing to 1.
3. Take the weighted average of every token's V using those weights.
4. The result is *my new representation* — a blend of information from the tokens I attended to most.

That's it. Stack 60 layers of this, train on the internet, and you get a transformer.

Why it's O(n²) in context length: every token computes a Q·K dot product with every *other* token. Doubling context → quadrupling pairs → roughly quadrupling cost. This is the source of the long-context expense and why flash attention / paged attention / prefix caching exist.

See [The transformer](./transformer.md) for the higher-level view.

## 4. Loss, gradient, and the "rolling downhill" picture

Training a model means adjusting its parameters (the billions of numbers inside) so that its predictions match the training data better.

**Loss** is a single number that measures "how wrong" the model is on a given example. For next-token prediction, the typical loss is **cross-entropy** — high when the model assigned low probability to the actual next token, low when it assigned high probability.

**The training landscape** is the loss as a function of the parameters. Imagine it as a hilly surface — each point is a possible setting of the model's weights, and the height is the loss for that setting. You want to find a low spot.

**The gradient** is a vector pointing in the direction of steepest *increase* of the loss. Flip its sign and you have the direction of steepest *decrease*.

**Gradient descent** is the algorithm:

1. Compute the gradient at the current point (via *backpropagation*).
2. Take a small step in the opposite direction (multiplied by a "learning rate").
3. Repeat.

You're rolling downhill on the loss surface. Modern optimizers (Adam, AdamW) are gradient descent with momentum and per-parameter learning rates, but the picture is the same.

That's all "training" is, at a hand-wavy level. Everything else — RLHF, DPO, fine-tuning, SFT — is variations on what *loss* you minimize and what *data* you use.

## What this gives you that the rest of the guide doesn't

- **Why long contexts are expensive.** O(n²) attention.
- **Why embedding similarity is just geometry.** Dot products, cosine, vector arithmetic.
- **Why temperature works the way it does.** Logit scaling pre-softmax.
- **What "training" actually does.** Adjust parameters to minimize loss via gradient descent.
- **The on-ramp to fine-tuning literature.** SFT (cross-entropy on demonstrations), DPO (a different loss using preferences), RFT (reward-driven loss).

You don't need any of this to ship AI products. You do need it if you specialize into:

- **Fine-tuning.** You're literally choosing a loss and optimizing it.
- **Inference optimization.** Understanding flash attention, paged attention, quantization formats requires the math.
- **Research engineering.** Reading papers requires fluency at this level.

## When (and when not) to study deeper

**Don't:**

- Read PyTorch tutorials before you've shipped your first LLM app.
- Try to "really understand" backprop before knowing whether you'll ever train a model.
- Take an MOOC on linear algebra "just in case." The opportunity cost is shipping something.

**Do, when:**

- You've shipped 3+ AI features and want to specialize.
- A fine-tuning project is on your roadmap.
- You're targeting an inference / serving role.
- You want to read papers and apply their ideas.

For that, the canonical path is: the [3Blue1Brown deep-learning series](https://www.3blue1brown.com/topics/neural-networks) for intuition, *Deep Learning* (Goodfellow) for the formal version, Andrej Karpathy's *nanoGPT* and *micrograd* for hands-on building. That stack, done well, is roughly a year of evenings.

## What this primer does NOT cover

- **Backprop derivation.** Useful if you'll modify training code; not for inference.
- **Optimizer specifics** (Adam betas, weight decay, learning-rate schedules). Tuning territory.
- **Positional encoding variants** (rotary, ALiBi, learned). Architecture detail.
- **RLHF / DPO loss functions.** Specialization territory; understandable once you know "loss" and "gradient."
- **Quantization formats** (FP16, BF16, FP8, MXFP4, INT4). Inference-engineering territory.
- **Distributed training** (FSDP, DeepSpeed, tensor parallelism). Research-engineering territory.

The point of this appendix isn't to make you an ML engineer — it's to give you enough vocabulary to *decide* whether you want to become one, without months of detour.

---

→ Back to: [Foundations checkpoint](./foundations-checkpoint.md)
