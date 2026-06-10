---
id: closed-vs-open
title: Closed vs open-weight model
sidebar_position: 7
description: When closed-source APIs win, when open-weight models win, and how most teams in 2026 end up using both.
---

# Closed vs open-weight model

> **In one line:** Default to closed-source APIs; reach for open-weight when residency, scale economics, customization, or latency demand it.

:::tip[In plain English]
Closed APIs (OpenAI, Anthropic, Google) win on raw quality and operational simplicity — you make an API call and you're done. Open-weight models (Llama, Qwen, Mistral, R1-class) win when you have a real constraint that the closed model can't satisfy: your data legally can't leave your network, you're spending $100k/month and could spend $10k, you need to fine-tune the actual weights, or you need sub-100ms latency. Most teams end up with both.
:::

## Closed-source API wins when

- You want the **highest quality** on hard reasoning or coding. Frontier closed > best open as of May 2026, though the gap is narrowing.
- You're at **low to mid scale** and operational simplicity matters more than per-token cost.
- You need **broad capability** packaged: multimodal, long context, tool use, vision, structured output, prompt caching.
- You're **early in the product** and iterating fast — you don't want infra in the critical path.
- Your team **doesn't have ML ops**. Running models well is its own discipline.

## Open-weight wins when

- **Data residency or privacy** prohibits sending data to a hosted provider (defense, healthcare PHI, EU sovereignty).
- **Per-token cost at scale** dominates — high-volume narrow features where you're spending tens of thousands per month on closed APIs.
- **Customization** — you want to fine-tune a model you fully own, with weights you can serve in your own VPC.
- **Latency** — Groq, Cerebras, and Together serve open models at speeds closed APIs can't match (sub-100ms time-to-first-token).
- **Edge / on-device** — only quantized open models fit on phones, browsers, embedded devices.
- **Reproducibility** — a closed model can change under you with no warning. Pinned open weights don't.

## How most teams actually use both

The 2026 norm is **tiered routing**:

- **Frontier closed** for the hardest features (deep reasoning, multi-step agent loops, code generation).
- **Mid-tier closed** for the workhorse features (chat, extraction, classification, summarization).
- **Hosted open** (Together, Fireworks, Groq) for narrow high-volume features that don't need frontier quality.
- **Self-hosted open** only when scale + sensitivity make it worth the operational cost.

A gateway (Portkey, OpenRouter, LiteLLM) lets you route requests across all three from a single client.

## The closed-API hidden costs

People underestimate these when comparing to "free" open weights:

- Per-call latency that you can't tune below ~500ms p50.
- Rate limits that throttle you exactly when traffic spikes.
- Provider outages that take your product down.
- Silent model upgrades that subtly change behavior.
- Token costs that compound — a $0.01 call at 10M calls/month is $100k.

## The open-weight hidden costs

People underestimate these when comparing to "free":

- **GPU infrastructure**: a single H100 is ~$2/hour; production-grade serving needs redundancy.
- **Inference server tuning**: vLLM, TGI, SGLang each have a learning curve.
- **On-call burden**: when your self-hosted Llama dies at 2am, that's your problem.
- **Capability gap**: most open models still lag closed on tool use, structured output, and long-context reliability.
- **Upgrade cycle**: a new Llama release is a re-tuning project, not a config change.

## When this rule doesn't apply

- **You're an AI infrastructure company.** Self-hosting is your business, not an overhead.
- **You're a government / defense / sovereign deployment.** Hosted is often a non-starter from day one.
- **You have a moat-level fine-tune.** Then you own the weights regardless of where they run.
- **You're at hyperscale (>$5M/year in inference spend).** Self-hosting may save 60–80% of that even after ops.

## How to apply it

For a new feature, ask:

1. **Does the closed API meet our eval bar?** If yes, ship on it.
2. **Does the cost at projected scale break our unit economics?** If yes, model open alternatives.
3. **Does our compliance/legal team allow this data class on a hosted provider?** If no, you don't have a choice.
4. **Do we have ML ops to operate a model in production?** If no, you're going to learn — budget for it.

## What changes the calculus

- A new frontier open model release (every 6–12 months) sometimes flips the answer.
- Pricing wars among closed providers compress the "open is cheaper" case — closed pricing has dropped 5x in 24 months.
- Stricter EU and sector regulations push more workloads to private endpoints or self-hosted.
- New hosted-open providers (Together, Fireworks, Groq) make the "open without ops" path real.

Revisit the call every 6–12 months. A choice that was right in 2024 may be wrong in 2026 and vice versa.

:::note[Worked example: when self-hosting earned its cost]
A logistics company is paying $80k/month for OpenAI to classify ~30M shipment documents per month. The classification task is narrow and stable. They run an eval: a fine-tuned Llama 3 70B hits 98% of GPT-4.1's accuracy on the task. Hosted on Together: $9k/month. Self-hosted on their existing GPU cluster: $4k/month.

The math is clear — but only because the task was narrow, stable, and high-volume. If they'd tried to self-host their general-purpose customer-support agent (which uses tool calling, long context, and varied tasks), they'd have spent six months trying to match frontier quality and given up.

The rule: self-host the narrow, high-volume things. Pay the closed-API tax for the things where the model is doing real work.
:::

<Quiz id="closed-vs-open-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the default model-sourcing choice, and what flips it?"
  options={[
    { text: "Always open-weight, since the weights are free" },
    { text: "Self-hosted from day one, to avoid lock-in" },
    { text: "Closed-source APIs by default; open-weight when residency, scale economics, customization, or latency demand it" },
    { text: "Train your own model from scratch" }
  ]}
  correct={2}
  explanation="Closed APIs win on raw quality and operational simplicity — you make a call and you're done. The four flip conditions are real constraints, not preferences: data that legally can't leave your network, a cost wall at scale, needing to own fine-tuned weights, or a latency floor closed APIs can't hit."
/>

<Question
  prompt="What is the 2026 norm for how mature teams actually deploy models?"
  options={[
    { text: "Tiered routing: frontier closed for hard tasks, mid-tier closed for workhorse tasks, hosted open for high-volume narrow tasks" },
    { text: "One model for everything, for simplicity" },
    { text: "Open-weight everywhere, to maximize savings" },
    { text: "Switching entirely to whichever provider is cheapest each quarter" }
  ]}
  correct={0}
  explanation="Most teams end up using both closed and open, routed by feature — self-hosted open only where scale plus sensitivity justify the ops cost. A single model for everything either overpays on easy tasks or underdelivers on hard ones; the decision is feature-by-feature, not company-wide."
/>

<Question
  prompt="Which of these is a hidden cost of OPEN weights rather than closed APIs?"
  options={[
    { text: "Rate limits that throttle you during traffic spikes" },
    { text: "Silent model upgrades that change behavior" },
    { text: "Provider outages taking your product down" },
    { text: "Inference-server tuning and a re-tuning project on every new model release" }
  ]}
  correct={3}
  explanation="vLLM, TGI, and SGLang each have a learning curve, and every new Llama release is a re-tuning project, not a config change — plus GPU redundancy and 2am on-call. The other three are the listed hidden costs of CLOSED APIs, which makes them tempting but reversed answers."
/>

</Quiz>

---

→ Next: [Build vs buy](./build-vs-buy.md).
