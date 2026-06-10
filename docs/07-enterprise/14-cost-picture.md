---
id: enterprise-ai-cost-picture
title: A Realistic AI Cost Picture
sidebar_position: 15
sidebar_label: 14. Cost Picture
description: Enterprise AI cost — $1M–$50M+ annual, FinOps chargeback, vendor commit negotiations, self-hosted ROI math.
---

# A Realistic AI Cost Picture

> **In one line:** Enterprise AI spend runs from ~$1M/year for early-stage programs to $50M+/year for AI-heavy Fortune 100s — but the spend is dominated by committed-capacity contracts, FinOps chargeback decides who actually feels the bill, and self-host ROI math is almost always more complicated than the spreadsheet suggests.

:::tip[In plain English]
The shock for engineers joining enterprise AI from a startup isn't how big the bill is — it's how *committed* it is. A startup pays per-token to OpenAI on a credit card. An enterprise signs a three-year, $15M committed-spend contract with AWS for Bedrock capacity, and the commitment is recognized as opex whether your features use it or not.

That changes every cost decision. The marginal call is "free" up to the commit; the marginal feature isn't. FinOps becomes about *commit utilization* and *chargeback fairness*, not "stop using the AI."
:::

## Approximate annual ranges (2026)

| Category | Approximate annual cost |
|---|---|
| Model API spend (Bedrock / Azure OpenAI / Vertex) | $500K – $30M+ |
| Self-hosted GPU compute (vLLM on H100/MI300 clusters) | $0 – $15M+ |
| Vector DB + retrieval infra (Vespa, Pinecone Ent, OpenSearch) | $100K – $5M |
| LLM observability + eval platform (Datadog LLM Obs + Langfuse + Braintrust) | $150K – $3M |
| AI gateway (Portkey Enterprise, Kong AI) | $50K – $1M |
| Fine-tuning + experimentation (SageMaker, Vertex Pipelines, Databricks Mosaic) | $100K – $5M |
| AI developer-productivity SaaS (Cursor, Copilot Enterprise, Claude Code) | $200K – $4M |
| Governance tooling (Vanta, OneTrust AI module) | $50K – $500K |
| **Total cloud + tools** | **$1M – $50M+/year** |

Engineering payroll for the AI function (platform + CoE + governance + embedded engineers) is typically **$10M – $80M/year** for a 500–5,000 engineer org. As with general infrastructure, **people dominate**.

## Where the spend really goes

A few patterns hold across most enterprises:

- **Token spend dominates** at most scales unless you've moved heavy workloads to self-hosted.
- **Long-tail features add up.** A "rounding error" feature at $200/day spends $73K/year. Twenty of them is $1.5M.
- **Eval traffic is non-trivial.** Production eval suites running 200 cases nightly across 30 features can be 5–15% of your total token spend.
- **Internal-dev productivity is the surprise line item.** Cursor + Copilot Enterprise + Claude Code across 2,000 engineers is easily $1.5M/year.
- **Self-hosted GPU is lumpy.** $4M of H100 capex amortized vs. $300K/month of operations + cooling + power. Forecasting it as a steady line is wrong.

## Committed-capacity contracts

The defining cost-structure feature of enterprise AI:

- **AWS Bedrock Provisioned Throughput** — committed capacity for specific models, billed monthly regardless of utilization. 30–60% discount vs. on-demand.
- **Azure OpenAI PTUs (Provisioned Throughput Units)** — same shape. Multi-year discounts deeper.
- **GCP Vertex** — committed-use discounts for managed model endpoints.
- **Self-hosted** — capex amortization + power + operations; the most committed of all.

Typical pattern: 60–80% of forecast load on committed capacity, 20–40% on-demand for burst. Lower commit ratios mean over-paying. Higher means risking burst rejection.

:::info[Highlight: commit utilization is the FinOps KPI for AI]
The single most important AI FinOps metric is **commit utilization** — what fraction of your committed Bedrock/Azure/Vertex capacity is actually getting used.

- 95%+: you're under-committed, paying on-demand premium for burst. Negotiate more commit at the next renewal.
- 70–95%: healthy.
- 50–70%: you over-committed. Either find new use cases (shift more features to that model) or renegotiate down at renewal.
- Under 50%: you over-committed badly; have a hard conversation with finance about the write-off.

Treat commit utilization with the same rigor as cloud RI/SP coverage. Quarterly review; tied to renewal cycles.
:::

## FinOps chargeback

At 500+ engineers, "the AI bill" being a single line item doesn't work. You need chargeback — attributing spend back to the business units that incurred it. The gateway record (see [Observability](./11-observability.md)) carries `feature_id` and `tenant_id`, which feed a daily chargeback report.

Two patterns:

- **Showback** — each BU sees their spend on a dashboard, no budget impact. Soft pressure to optimize.
- **Chargeback** — each BU's actual budget is debited for their AI spend. Hard pressure.

Showback is the common starter; chargeback follows when the bill grows past the threshold the CFO cares about (~$5M/year is a common trigger). Chargeback without consequences (showback) drives no behavior change; consequences without warning produce angry VPs.

## Self-hosted ROI math

The recurring enterprise question: "should we self-host Llama on our own GPUs instead of paying Bedrock?"

The naive math (made-up but representative):

- Bedrock spend on `claude-haiku-4-5`: $200K/month.
- An 8x H100 cluster: $40K/month amortized (over 3 years) + $20K ops + power.
- "We save $140K/month!"

The honest math:

- 8x H100 serving `llama-4-70b-instruct` at vLLM-optimized throughput: ~600 RPS sustained.
- Real workload: spiky, average 80 RPS, peak 900 RPS. Need 12x H100 to absorb peak without burst-rejecting.
- 12x H100 amortized + ops + power + redundancy + multi-region: ~$110K/month.
- Add: dedicated platform-team capacity to operate the cluster — ~2 FTE = $700K/year fully loaded = $58K/month.
- Add: model quality gap (Llama-4-70B is genuinely worse than Claude Sonnet on your eval suite). Some features have to re-route to Bedrock anyway.
- Add: capex tie-up, slower iteration on model upgrades, internal carrying costs.

Real saving: maybe $30K/month, or maybe negative. The right cases for self-host:

- **Volume + narrow task** where a small model works (classification, embedding generation, structured extraction). Self-host wins here at moderate scale.
- **Data-sovereignty requirements** that contractual private endpoints can't satisfy (defense, intelligence, certain medical research).
- **Latency-critical co-location** with the rest of your stack on internal GPU regions.

The wrong cases for self-host: "we're paying a lot for Bedrock and Llama is open source."

:::info[Highlight: self-host is an operating commitment, not a cost play]
Self-hosting open models is almost never a cost play once you account for the operating burden. The genuine reasons are *control* (data sovereignty, customization, predictable performance) and *unit economics on specific narrow workloads* — not "Llama is free."

If your spreadsheet shows a big saving, dig in. The hidden costs (FTE, capex, redundancy, model-quality gap) usually shrink the saving to a rounding error.
:::

## Vendor negotiation

At enterprise scale, AI vendor contracts are negotiated:

- **Multi-year discounts.** 20–40% off list for 2-year commits, 40–60% for 3-year.
- **Cross-product bundling.** Bedrock commits often bundled with EC2, S3, networking commits.
- **Model-mix flexibility.** Commit to dollars, not specific models — gives you room to migrate when EOLs hit.
- **Marketplace SKUs.** Buying through AWS Marketplace inherits an approved contract path and often unlocks pre-negotiated AI tooling discounts.
- **Capacity guarantees.** During peak times (holiday season for retail, open enrollment for healthcare), confirmed PTUs.

Procurement-led negotiations rarely include the engineering input that matters most — which model variants you actually plan to use, what your peak-vs-average load profile is, which features are migrating to/from. Sit on the negotiation call.

## What changes vs. startup AI cost

| | Startup | Enterprise |
|---|---|---|
| **Billing** | Pay-as-you-go on a credit card | Multi-year committed-spend contracts |
| **Marginal cost feel** | Every call costs something | Free up to commit; over-commit cost is brutal |
| **FinOps** | "Don't run up the bill" | Commit utilization KPI; chargeback to BUs |
| **Self-host** | Rare | Real option for specific cases; usually not a cost play |
| **Negotiation** | "What's the list price?" | Multi-year discounts, bundles, capacity guarantees |
| **Surprise line item** | Token spend | Internal-dev productivity tools (Cursor + Copilot + Claude Code) |

## Common mistakes

:::caution[Where people commonly trip up]
- **Optimizing token spend while ignoring engineering payroll.** A team spending two engineer-weeks to save $5K/month on Bedrock just lost the company money. Always compare against fully-loaded engineering time — that's the math FinOps actually cares about.
- **Self-hosting "to save money" without the operating-cost math.** The spreadsheet always shows a saving. Add the FTE for the cluster, the redundancy multiplier, the model-quality gap, and the saving usually evaporates. If you self-host, do it for control, not for cost.
- **Under-utilized commits with no renegotiation plan.** Over-committed and at 60% utilization for two quarters? That's a renegotiation conversation, not a "let's just live with it" line item. Tie utilization reviews to renewal cycles.
- **No chargeback (or showback) at $10M+ annual spend.** When no BU sees their AI spend, every BU's spend grows. Showback at minimum at that scale; chargeback when the CFO starts asking questions.
- **Forgetting eval-suite traffic in cost models.** Production evals running nightly across many features can be 5–15% of token spend — invisible until you go looking.
- **Treating internal-dev productivity tools as "DevEx's problem."** Cursor + Copilot + Claude Code at scale is one of the largest AI line items. It's a real category and deserves the same scrutiny as model spend.
- **Engineering not at the procurement table.** Procurement-only negotiations get list-minus-30%; engineering input on actual load shape, model mix, and migration plans gets list-minus-50%. Be in the room.
:::

<Quiz id="enterprise-ai-cost-picture-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What does the page call the single most important AI FinOps metric?"
  options={[
    { text: "Cost per thousand tokens" },
    { text: "Total monthly model spend" },
    { text: "Cost per AI engineer" },
    { text: "Commit utilization — the fraction of committed capacity actually used" }
  ]}
  correct={3}
  explanation="Enterprise spend is dominated by committed-capacity contracts billed whether you use them or not, so utilization determines whether the contract was sized right: 70–95% is healthy, under 50% is a hard conversation with finance. Per-token cost matters at startups paying on demand — the cost structure changes once you commit."
/>

<Question
  prompt="According to the honest math, when is self-hosting open models the right call?"
  options={[
    { text: "Whenever the monthly Bedrock bill exceeds the amortized GPU cost" },
    { text: "For data-sovereignty requirements or very-high-volume narrow tasks — control, not general cost savings" },
    { text: "Whenever an open model matches the closed model on public benchmarks" },
    { text: "Never — enterprises should always use managed endpoints" }
  ]}
  correct={1}
  explanation="Once you add peak-load redundancy, roughly two FTEs to run the cluster, the model-quality gap, and capex tie-up, the spreadsheet saving usually shrinks to a rounding error or goes negative. The naive bill comparison is the trap the page works through in detail. Self-host wins on control and on narrow high-volume tasks, not on 'Llama is free.'"
/>

<Question
  prompt="What does the page identify as the surprise line item in enterprise AI budgets?"
  options={[
    { text: "Internal developer-productivity tools like Cursor, Copilot Enterprise, and Claude Code at company scale" },
    { text: "Vector database licensing" },
    { text: "Prompt registry hosting" },
    { text: "Eval platform seats" }
  ]}
  correct={0}
  explanation="AI coding tools across a couple thousand engineers easily exceed a million dollars a year — one of the largest AI line items, and often treated as someone else's budget problem. The infrastructure answers are real costs but smaller and expected; the page's point is the category that deserves model-spend-level scrutiny and rarely gets it."
/>

</Quiz>

## What's next

→ Continue to [Enterprise-Specific Pitfalls](./15-pitfalls.md) — what still goes wrong even with all this investment.
