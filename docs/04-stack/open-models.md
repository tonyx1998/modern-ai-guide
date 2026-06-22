---
id: open-models
title: Open-weight models
sidebar_position: 3
description: Llama, Mistral, Qwen, DeepSeek, Gemma — when self-hosting open weights makes sense, and when it doesn't.
---

# Open-weight models

> **In one line:** Models whose weights you can download. You can run them on your own GPUs, on a managed inference provider, or even on a laptop. The freedom is real; so is the operational cost.

:::tip[In plain English]
"Open-weight" doesn't mean "open-source" the way Linux is — most of these licenses come with restrictions, and you almost never get the training data. What you do get is the *model file*: a multi-gigabyte bag of numbers you can load into your own inference server (vLLM, Ollama) or hand to a hosting provider (Together, Fireworks, Groq, Replicate). The pitch is privacy, control, and cost at scale. The catch is that you now own a piece of ML infrastructure.
:::

## The major families (June 2026)

| Family | Maintainer | Top sizes | Best for | License notes |
|--------|-----------|-----------|---------|---------------|
| **DeepSeek V4** | DeepSeek | 284B & 1.6T MoE (small active) | Reasoning, agentic coding, cost-efficiency, 1M context | MIT |
| **Qwen 3 / 3.5** | Alibaba | 7B–235B MoE, dual thinking modes | Multilingual (esp. CJK), reasoning | Apache 2.0 (open tier) |
| **Llama 4** | Meta | Scout (10M ctx), Maverick (1M ctx) | General workhorse, broad community | Llama Community License (commercial OK with caps) |
| **Mistral Large 3 / Ministral 3** | Mistral AI | 3B–14B dense, 675B MoE | European workloads, MoE efficiency | Apache 2.0 |
| **GLM / MiniMax / Kimi** | Zhipu / MiniMax / Moonshot | Large MoE | Frontier-adjacent open weights | Mostly permissive |
| **Gemma 3** | Google | 2B, 9B, 27B | On-device, edge | Gemma license (commercial OK) |

:::note[Two big 2026 shifts in the open-weight world]
- **Meta pivoted away from open weights at the frontier.** In April 2026 Meta's new Superintelligence Labs shipped **Muse Spark** — a *closed*, API-only model that succeeds Llama 4. The Llama 4 herd (Scout, Maverick) remains downloadable, but don't expect a future open Llama flagship. If you picked Llama for "the open default," re-evaluate.
- **The open-weight frontier is now mostly Chinese.** As of mid-2026 the strongest open-weight models on public leaderboards come from **DeepSeek (V4), Alibaba (Qwen), Zhipu (GLM), MiniMax, and Moonshot (Kimi)** — with Google's Gemma and NVIDIA's Nemotron the main Western entries. The best open models trail the closed frontier by a small margin and win decisively on cost.
:::

## Default pick for most teams

**Don't.** If you're under ~$5k/month in API spend and you don't have a hard compliance requirement, stay on closed providers. The operational cost of running an open model in production — GPU procurement, autoscaling, quantization tuning, eval drift — almost always swamps the API savings.

If you've decided you need open weights, a mid-size **Llama 4** or **Qwen 3** model via **Together AI** or **Fireworks** is the no-think default. You get a serverless endpoint, predictable pricing, and zero infra. For reasoning- and coding-heavy tasks, **DeepSeek V4** is the open price/quality leader as of June 2026.

## When to deviate (i.e. when open weights actually make sense)

- **Data residency / privacy** prevents sending content to a US-hosted closed provider. Self-host inside your VPC.
- **Cost at scale.** Past ~100M tokens/day, self-hosted Llama on rented GPUs can beat hosted APIs by 3–5×.
- **Customization.** You want to fine-tune a model you fully control, including for retention/IP reasons.
- **Latency floor.** **Groq** serves Llama 4 70B at 500+ tokens/sec — faster than any closed provider can do today.
- **Air-gapped deployments.** Defense, healthcare, certain regulated finance. No cloud allowed; weights on disk is the only option.

## How most teams adopt open weights

A three-step ramp that almost everyone follows:

1. **Start on a closed API.** Ship the feature. Learn the prompt. Build the eval suite.
2. **Move one expensive sub-task to an open model via a managed provider.** Classification, summarization, embedding — the high-volume / lower-stakes pieces. You get cost savings without owning GPUs yet.
3. **Self-host on vLLM** only when (a) the bill from step 2 is large enough to justify a platform team, or (b) compliance forces you off shared infrastructure.

Most teams never get past step 2. That's fine.

## Minimum integration

Open models served by a managed provider look identical to OpenAI — that's the whole point of the OpenAI-compatible API standard.

```python
# Together AI — drop-in OpenAI client
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["TOGETHER_API_KEY"],
    base_url="https://api.together.xyz/v1",
)

# Model IDs are provider-specific and change often — check the provider's catalog.
response = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V4",
    messages=[{"role": "user", "content": "Explain MoE in one sentence."}],
)
```

For local dev, **Ollama** is one command:

```bash
ollama run llama3.3:70b   # downloads + serves on localhost:11434, OpenAI-compatible API
```

## Pricing & cost notes (June 2026 ballpark)

| Path | Cost shape | Example for a ~70B-class open model |
|------|-----------|------------------------|
| Managed (Together, Fireworks) | $0.40–$1.20 / Mtok blended | ~$0.88 / Mtok blended |
| Groq (fast) | $0.40–$1.00 / Mtok | ~$0.80 / Mtok, 400+ tok/s |
| Self-hosted (your GPUs) | $/GPU-hour ÷ throughput | A100 80GB ~$1.50/hr; ~$0.15/Mtok at saturation |
| Self-hosted (idle) | Same $/GPU-hour, no requests | $$$$ — idle GPUs are pure burn |

The trap: self-hosting is cheap only at saturation. A GPU sitting at 10% utilization is *more* expensive than a hosted API. Autoscaling on **Modal** or **RunPod** helps; even better is to combine open + closed providers so the cheap model only sees enough traffic to keep the GPU warm.

## Pitfalls

- **Picking open weights for "control" without measuring the API bill first.** The closed provider's bill is almost always less than one platform engineer's salary.
- **Skipping the eval suite when you swap.** Llama 70B is not Sonnet. Behavior shifts on edge cases, formatting, tool-call compliance. Re-run your evals before promoting.
- **Quantizing too aggressively.** INT4 saves memory but tanks reasoning quality on hard tasks. Measure, don't assume.
- **Self-hosting on a single GPU node.** No autoscaling, no failover, no observability. The first incident teaches a lesson you didn't need to learn.
- **Trusting MMLU scores.** Open-model benchmark sheets are even more gamed than closed ones. The "this 7B beats GPT-4" claim almost never survives contact with your actual workload.
- **Ignoring license clauses.** Llama's Community License has a 700M-MAU cap. Cohere's Command R+ is non-commercial. Read the license before you build a product on it.

---

→ Next: [Inference servers](./inference-servers.md)
