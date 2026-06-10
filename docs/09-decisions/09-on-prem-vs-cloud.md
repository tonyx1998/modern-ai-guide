---
id: on-prem-vs-cloud
title: On-prem / self-hosted vs cloud-hosted models
sidebar_position: 15
description: When self-hosting an open-weight model earns its operational cost — and when "we want to self-host" is just engineering bravado.
---

# On-prem / self-hosted vs cloud-hosted models

> **In one line:** Self-host an open-weight model only when residency, scale economics, customization, or latency genuinely demand it — and budget for the operational cost, which is much larger than the GPU bill.

:::tip[In plain English]
"Let's self-host Llama" is one of the most expensive sentences in AI engineering. The hardware is the cheap part. The expensive parts are: a serving stack you have to tune, an upgrade cycle every six months, on-call rotations for GPU outages, capacity planning, autoscaling, eval infrastructure to confirm parity with hosted APIs. Most teams pay for years before realizing it would have been cheaper to keep writing OpenAI checks.
:::

## When self-hosting is right

- **Data residency**: regulation prohibits sending data to a hosted provider (EU sovereignty, government, sector-specific PHI rules).
- **Hyperscale cost**: you're spending >$50k/month on a closed API and a self-hosted equivalent would cost \&lt;30% of that, even after ops.
- **Customization**: you've fine-tuned an open model and need to serve your own weights.
- **Latency floor**: you need sub-100ms time-to-first-token that closed APIs can't reliably hit.
- **Air-gap**: deployment is in an environment with no public internet access.
- **Reproducibility**: a closed model that updates silently is unacceptable (regulated systems, scientific work).

## When hosted-cloud is right (the default)

- You don't have a dedicated ML ops person.
- You're under the cost threshold where self-hosting would pay back.
- You need broad capabilities (multimodal, tool use, long context, structured output) without integration work.
- You're still iterating fast and don't want infra in the critical path.
- Your usage is bursty (some days 10M tokens, some days 100k) — paying per token is cheaper than reserving GPUs.

## The hidden costs of self-hosting

Engineers compare "$0.01 per 1k tokens hosted" to "a GPU is $2/hour" and conclude self-hosting is cheaper. The actual delta includes:

- **Serving stack tuning.** vLLM, TGI, SGLang each need months of tuning to hit hosted-API quality and throughput.
- **GPU redundancy.** A single H100 isn't a production deployment. You need failover.
- **Capacity planning.** Hosted APIs handle traffic spikes; you have to provision for peak.
- **Autoscaling.** Either you over-provision (wasted spend) or under-provision (latency spikes).
- **Model upgrade cycle.** Every new Llama release is a re-tune, re-eval, re-deploy project.
- **Observability.** Hosted APIs come with traces; you have to build them yourself.
- **On-call.** When the cluster dies at 2am, your team owns it.
- **Quality gap.** Most open models lag closed on tool use, structured output, and reliability. Closing the gap is engineer-months.

A realistic all-in cost for self-hosting a production open model is **2–4 hosted ML engineers** plus GPU spend. Below ~$30–50k/month of hosted spend, you're spending more by self-hosting.

## The middle path: hosted-open

Together, Fireworks, Groq, Replicate run open-weight models for you. You get:

- Open-model cost economics (often 5–10x cheaper than frontier closed).
- No GPU ops, no upgrade cycle, no capacity planning.
- The model is the same code as your eventual self-hosted version, so the migration is real if needed.
- Speed: Groq especially serves at speeds closed APIs can't.

For most teams that want "open economics without owning a GPU cluster," this is the right answer. Self-hosted comes later, when the volume justifies it.

## The hybrid pattern

Mature teams often end up with:

- **Frontier closed** for the hard, low-volume, varied tasks.
- **Hosted-open** for the high-volume narrow tasks where economics matter.
- **Self-hosted open** only for the regulated / residency / hyperscale subset.

The decision is feature-by-feature, not company-wide.

## When this rule doesn't apply

- **You're an AI infrastructure or model-serving company.** Self-hosting IS your product.
- **You're a sovereign / defense deployment.** Hosted may not be a legal option.
- **You have a moat-level fine-tune and your competitors don't have access to those weights.** Owning the deployment is strategic.
- **You're at hyperscale where 60–80% savings on a $5M/year bill is worth the platform team.**

## How to apply it

When someone proposes self-hosting, ask:

1. **What's our current hosted spend?** If under $30k/month, the math probably doesn't work.
2. **Do we have ML ops capacity?** If no, you're hiring 2–3 people. Budget for it.
3. **Have we tried hosted-open first?** Together / Fireworks / Groq solve 80% of the same problem with 10% of the operational cost.
4. **What's our upgrade plan?** A new open model lands every 3–6 months. Who runs the re-tune and re-deploy?
5. **What's our quality baseline?** Run evals on the open model first. The cost savings disappear if quality drops 20%.

## Common mistakes

- **Comparing GPU rental cost to per-token API cost.** Apples to oranges. Add serving, ops, redundancy, capacity, upgrades.
- **"We'll just spin up a Llama on a single H100."** That's a demo, not a production service. Production needs redundancy, autoscaling, monitoring, on-call.
- **Self-hosting without an eval set.** You can't tell if quality regressed against the hosted alternative.
- **"We can hire someone for that."** ML ops engineers cost $300k+ all-in. Two of them is more than most of your hosted bills.
- **Building before measuring.** Run the workload through hosted-open for a quarter. If costs justify it, then build.

:::note[Worked example: when hosted-open was the right answer]
A logistics company has 30M document classifications per month going through GPT-4.1. Cost: $80k/month. They consider self-hosting Llama 3 70B in their own VPC. Estimated GPU cost: $4k/month. Cost savings: $76k/month — irresistible.

They actually price out the full self-hosted plan:
- 2 ML platform engineers: $600k/year ≈ $50k/month
- GPU cost with redundancy: $12k/month
- Tuning + eval infra build: 6 months of effort
- Ongoing model upgrade cadence: ~1 engineer-quarter every 6 months

Real all-in: ~$70k/month, with significant up-front time. Plus they'd have to match GPT-4.1's quality, which their initial eval showed Llama was 4 points short of.

They pivot to hosted-open (Together AI running Llama 3 70B). Cost: $9k/month. Quality: same as self-hosted (same model). Ops: zero. They save $71k/month, don't hire the platform team, and the migration takes 4 weeks instead of 6 months.

Two years later, when they're at 200M documents/month, self-hosting finally makes sense. They build the platform team then, with a real cost target. The lesson: hosted-open is almost always the right intermediate step. Self-host is the destination, not the starting point.
:::

<Quiz id="on-prem-vs-cloud-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the default deployment choice for a team without dedicated ML ops?"
  options={[
    { text: "Self-host Llama on a single H100" },
    { text: "Hosted cloud model APIs" },
    { text: "Build a small GPU cluster first" },
    { text: "An air-gapped on-prem deployment" }
  ]}
  correct={1}
  explanation="Hosted cloud is the default — the expensive part of self-hosting is not the GPU bill but the serving stack tuning, redundancy, capacity planning, upgrade cycle, and on-call. A single H100 running Llama is explicitly called a demo, not a production service."
/>

<Question
  prompt="Below roughly what monthly hosted spend does self-hosting usually NOT pay back?"
  options={[
    { text: "About $1k per month" },
    { text: "About $5k per month" },
    { text: "About $500k per month" },
    { text: "About $30-50k per month" }
  ]}
  correct={3}
  explanation="A realistic all-in self-hosting cost is 2-4 ML engineers plus GPU spend, so below roughly $30-50k/month of hosted spend you'd be spending more to self-host. The low figures are tempting because GPU rental looks cheap — that comparison ignores everything except the hardware."
/>

<Question
  prompt="What middle path gets open-model economics without owning GPU operations?"
  options={[
    { text: "Hosted-open providers like Together, Fireworks, or Groq" },
    { text: "Renting one spot-priced GPU" },
    { text: "Negotiating a bigger closed-API discount" },
    { text: "Quantizing the model to run in the browser" }
  ]}
  correct={0}
  explanation="Hosted-open gives open-weight cost economics (often 5-10x cheaper than frontier closed) with no ops, and since it runs the same weights, the eventual self-hosted migration stays real. In the worked example it cost $9k/month versus roughly $70k/month all-in for self-hosting the same model."
/>

</Quiz>

---

→ Next: [Framework vs raw SDK](./10-framework-vs-raw-sdk.md).
