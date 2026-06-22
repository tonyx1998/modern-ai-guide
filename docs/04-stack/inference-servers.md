---
id: inference-servers
title: Inference servers
sidebar_position: 4
description: vLLM, TGI, SGLang, Ollama, llama.cpp — the runtimes that serve open-weight models.
---

# Inference servers

:::info[Dated content — June 2026]
This page names specific tools, models, and prices, which rotate quarterly. The *selection
logic* is durable; the names are a snapshot. Cross-check the
[Model snapshot](/docs/model-snapshot) for current model names and pricing.
:::


> **In one line:** If you self-host an open model, an inference server is what actually loads the weights, batches requests, and serves the tokens. vLLM is the breadth default in 2026; SGLang is the de-facto choice at hyperscale.

:::tip[In plain English]
A model file (the "weights") is just numbers on disk — it can't answer requests by itself. An inference server is the program that loads those weights into GPU memory, accepts HTTP requests, runs the math, and streams tokens back. Picking the right one is mostly about *throughput* (how many concurrent requests can you handle per GPU) and *operational maturity* (does it crash at 3am).
:::

## The major options (2026)

| Server | Best for | Languages | Concurrency model | Notes |
|--------|---------|-----------|-------------------|-------|
| **vLLM** | Production self-hosting | Python (server), any client | PagedAttention + continuous batching | The breadth default. Broadest model support; actively developed (near-weekly releases). |
| **SGLang** (LMSYS) | Hyperscale serving, prefix-heavy, tool flows | Python | RadixAttention | The 2026 hyperscale standard (xAI, Cursor, etc.); strong on shared-context throughput; Day-0 DeepSeek-V4 support |
| **TGI** (HF) | Hugging Face ecosystem | Rust + Python | Continuous batching | Solid; much less prominent than vLLM/SGLang in 2026 |
| **NVIDIA Dynamo** | NVIDIA-only, lowest latency | C++ / Python | TensorRT-LLM kernels (+ vLLM/SGLang) | "Inference OS" (1.0 GA ~early 2026) orchestrating TensorRT-LLM; fastest, hardest to operate |
| **Ollama** | Laptop / dev | Go | Simple queue | Not for prod. Perfect for local. |
| **llama.cpp** | CPU / Mac / edge | C++ | Single-threaded per request | GGUF quantization, runs on a phone |
| **MLX** (Apple) | Apple Silicon dev | Python / Swift | Unified memory | Mac-only; fast on M-series |
| **Provider-managed** | Skip all of this | — | — | Together, Fireworks, Groq, Replicate, Modal |

## Default pick for most teams

**Don't self-host.** Use a managed inference provider — **Together**, **Fireworks**, or **Groq** — and you get vLLM-class performance without operating it. You pay per token, not per GPU-hour.

If you've decided to self-host, **vLLM on Modal or RunPod** is the path of least resistance for most teams. You write a 20-line Modal function, point it at a Llama or Mistral checkpoint, and get a scaling endpoint. At hyperscale (very large GPU fleets, prefix-heavy traffic), **SGLang** is the de-facto 2026 standard. For local development and laptop demos, **Ollama** (now also offered as a hosted "Turbo/Cloud" tier); **LM Studio** is the best local GUI, especially on Apple Silicon (MLX).

## When to deviate

- **Hyperscale serving or prefix/shared-context-heavy workload** (lots of JSON schemas, tool calling, constrained generation, big GPU fleets): **SGLang**'s RadixAttention primitives shine here, which is why it's the de-facto choice at very large deployments in 2026.
- **Sub-50ms first-token latency on a single model**: **TensorRT-LLM**, now under the **NVIDIA Dynamo** umbrella, with a pre-compiled engine — but be ready to maintain it.
- **Edge / on-device inference**: **llama.cpp** with a Q4_K_M quantized model, or **MLX** on Apple Silicon.
- **Hugging Face-native ops** (Inference Endpoints, Spaces): **TGI** integrates more cleanly than vLLM there, though it's less prominent overall in 2026.
- **You need the absolute cheapest hosted endpoint and latency is fine**: **Groq** for LPU speed, **DeepInfra** for cost.

## Minimum integration

**Local dev with Ollama:**

```bash
# One line to a working OpenAI-compatible endpoint:
ollama run llama3.3:70b
# Now POST to http://localhost:11434/v1/chat/completions
```

**Production self-host with vLLM on Modal:**

```python
import modal

app = modal.App("llm")
image = modal.Image.debian_slim().pip_install("vllm")  # pin to a current release; vLLM ships near-weekly

@app.function(image=image, gpu="A100-80GB:2", scaledown_window=300)
@modal.web_server(8000)
def serve():
    import subprocess
    subprocess.Popen([
        "vllm", "serve", "meta-llama/Llama-4-70B-Instruct",
        "--tensor-parallel-size", "2",
        "--max-model-len", "32768",
    ])
```

That's a production-grade autoscaling endpoint in about 15 lines. Modal cold-starts new replicas when traffic spikes and tears them down after 5 minutes idle.

## What you're optimizing

- **Throughput** — total tokens/sec across concurrent requests. Continuous batching is the single biggest win; PagedAttention (vLLM) and RadixAttention (SGLang) extend it further.
- **Latency** — time to first token (TTFT) for the UX, time per output token (TPOT) for the streaming feel.
- **Cost per million tokens** at your real traffic shape, not at saturation.
- **Memory efficiency** — quantization (FP8, INT8, INT4) trades quality for headroom. Measure before promoting.

## Pricing & cost notes

A practical rule from production deployments (June 2026 ballpark):

- **Hosted (Together / Fireworks / Groq):** roughly $0.40–$1.00 / Mtok for ~70B-class open models.
- **Self-hosted vLLM/SGLang at saturation:** can undercut that, *but only if your GPUs stay busy*.
- **Self-hosted at low utilization (~20%):** *more expensive* than hosted, because you pay the full GPU-hour either way.

The breakeven against managed providers is roughly **200M tokens/day sustained**. Below that, hosted is cheaper and saner. Above that, the spreadsheet starts to favor self-hosting — assuming you have someone to operate it.

## Pitfalls

- **Treating Ollama as a production server.** Ollama serializes requests and is missing the batching that makes vLLM economical. Demos and local dev only.
- **Running vLLM without `--max-model-len`.** The default is the model's max (e.g. 128k), which reserves enormous KV-cache memory. Set it to what you actually use; you'll get 5–10× more concurrency.
- **Single-GPU self-host with no failover.** One CUDA OOM and the endpoint dies. At minimum: two replicas behind a load balancer, autoscaling on Modal/RunPod, or a managed provider.
- **Skipping warmup.** Cold-start on a 70B model is 30–90 seconds. A request hitting a cold replica times out. Either pre-warm replicas or set generous client timeouts.
- **Hand-rolling quantization without re-evaluating.** FP16 → FP8 → INT4 each costs a few quality points on hard reasoning. Run your eval suite after every quantization change.
- **Forgetting that "OpenAI-compatible" is partial.** Tool calling, structured output, vision, and image gen vary by server and model. Test the *specific* features you use.

<Quiz id="inference-servers-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Your workload is dominated by JSON-schema constrained generation and tool-call flows. Which inference server does the page suggest considering over the default?"
  options={[
    { text: "SGLang" },
    { text: "TGI" },
    { text: "llama.cpp" },
    { text: "Ollama" }
  ]}
  correct={0}
  explanation="SGLang has better primitives for structured output and constrained generation than vLLM, and its RadixAttention often wins on prefix-heavy workloads. TGI is a general-purpose alternative without that edge, and Ollama and llama.cpp target local dev and edge devices, not production structured-output serving."
/>

<Question
  prompt="Why is Ollama the wrong choice for a production endpoint?"
  options={[
    { text: "It only runs on Apple Silicon hardware" },
    { text: "It cannot expose an OpenAI-compatible API" },
    { text: "It serializes requests and lacks the continuous batching that makes production serving economical" },
    { text: "It refuses to load models larger than 7B parameters" }
  ]}
  correct={2}
  explanation="Continuous batching is the single biggest throughput win in inference serving, and Ollama doesn't have it — requests queue one after another. It actually DOES expose an OpenAI-compatible API and runs on many platforms, which is exactly why it's so tempting to promote from laptop to prod. Don't."
/>

<Question
  prompt="What happens if you run vLLM without setting the max-model-len flag?"
  options={[
    { text: "The server refuses to start until you set it" },
    { text: "It defaults to the model's maximum context and reserves enormous KV-cache memory, slashing your concurrency" },
    { text: "Requests longer than 4k tokens are silently truncated" },
    { text: "Quantization is automatically disabled" }
  ]}
  correct={1}
  explanation="The default is the model's full context window — for example 128k — which pre-reserves huge KV-cache headroom per request. Setting it to what you actually use can yield 5 to 10 times more concurrency on the same GPU. The server starts fine, which is why this footgun goes unnoticed until the bill arrives."
/>

</Quiz>

---

→ Next: [Embedding models](./embedding-models.md)
