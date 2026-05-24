---
id: team-size-heuristic
title: Team-size heuristic for AI tooling
sidebar_position: 4
description: What AI infrastructure and tooling a team can realistically support per headcount — 1, 5, 50, 500.
---

# Team-size heuristic for AI tooling

> **In one line:** What AI infrastructure you can realistically support is a function of how many people are paid to maintain it — match your tooling to your team size, not to your ambition.

:::tip[In plain English]
A 1-person team using LangChain + Pinecone + a custom agent framework + self-hosted Llama is going to spend most of its time on plumbing instead of product. A 500-person team using one Python script and a hand-written `requests.post` is going to be re-implementing observability badly. Pick infrastructure that matches the people you actually have, not the people you wish you had.
:::

## The bands

### 1-person team (solo / indie)

**Your tooling has to fit in your head.** Every tool you adopt is a tool you have to maintain.

- **Model:** one closed provider (OpenAI or Anthropic). Don't run two.
- **SDK:** the native SDK or Vercel AI SDK. No framework layer.
- **RAG:** pgvector inside your existing Postgres. Don't run a separate vector DB.
- **Evals:** a `pytest` file with 50 examples. Don't adopt a platform.
- **Observability:** print statements + Langfuse free tier. Don't run your own.
- **Deployment:** Vercel / Fly / Render. Don't self-host.

**Anti-pattern:** adopting LangGraph + LangSmith + Pinecone + Weaviate + your own agent framework in week one. You will be a dev-ops engineer, not a founder.

### 5-person team (early startup)

You have one person who can own the AI stack part-time. Add structure where it pays back.

- **Model:** 2 providers max (one primary, one fallback).
- **SDK:** native SDK still fine. Consider Vercel AI SDK for streaming.
- **RAG:** pgvector or a hosted vector DB (Pinecone). Pick one.
- **Evals:** Promptfoo or pytest + a small CI job. Versioned in git.
- **Observability:** Langfuse cloud, Braintrust, or Helicone.
- **Gateway:** not yet — flat call from app code is fine.
- **Agent framework:** raw SDK loop, not LangGraph. You don't have the surface to need it.

**Anti-pattern:** introducing a model gateway, a vector DB ops layer, and an agent runtime simultaneously. Pick the one most-broken thing.

### 50-person team (Series B-ish)

You have a dedicated platform / ML-infra person or small team. Now you can support real tooling.

- **Model:** multi-provider with a gateway (Portkey, OpenRouter, or LiteLLM).
- **SDK:** still native + Vercel AI SDK; the gateway handles routing.
- **RAG:** dedicated vector DB (Pinecone, Qdrant, or Weaviate), an indexing pipeline, monitoring.
- **Evals:** dedicated eval platform (Braintrust, Langfuse evals, or Patronus), CI gates on regressions.
- **Observability:** integrated platform (Braintrust / LangSmith), with cost dashboards per feature.
- **Agent framework:** still skeptical — a thin in-house layer over the SDK is usually right. Only adopt LangGraph or Inngest agents if your workflows genuinely exceed what raw code does.
- **Prompt management:** versioned prompts in git or a dedicated registry (PromptLayer, Braintrust).
- **Fine-tuning:** considered for high-volume narrow tasks; managed (OpenAI fine-tuning) before self-hosted.

**Anti-pattern:** every team picking its own LLM stack. Centralize on one gateway and one observability platform, or you'll have ten production blind spots.

### 500-person team (enterprise / hypergrowth)

You have a dedicated AI platform team of 5–15 people. You can build, run, and pay for almost anything — and the failure mode is over-building.

- **Model:** multi-provider, multi-region. Possibly self-hosted open-weight for cost-critical workloads.
- **SDK:** standardized internal client wrapping vendor SDKs, with telemetry, cost attribution, and audit logging baked in.
- **RAG:** custom indexing infrastructure on top of an enterprise vector DB; eval pipelines for retrieval quality.
- **Evals:** integrated with CI/CD; gated rollouts.
- **Observability:** real-time per-feature cost and quality dashboards; alerting on quality drift.
- **Gateway:** internal, with PII redaction, cost controls, model routing, and rate limiting.
- **Agent runtime:** a real one — either a vendor (Sierra, Crew, Cognition) or in-house — with state, retries, and admin tooling.
- **Fine-tuning:** dedicated pipeline; self-hosted training cluster considered for moat-level workloads.
- **Compliance:** SOC 2 / HIPAA / EU AI Act tooling for AI decisions; model cards for every production model.

**Anti-pattern:** building a custom agent framework, custom eval platform, custom vector DB, and custom fine-tuning rig simultaneously. Pick the layers that genuinely differentiate; buy the rest.

## How to apply it

When someone proposes a piece of AI infrastructure, ask:

1. **Who maintains this in 18 months?** If the answer is "us, in our spare time" and you're a 5-person team, that's a no.
2. **Does this scale linearly with our headcount or super-linearly?** A vector DB you operate yourself adds ops load forever; a hosted vector DB doesn't.
3. **Are we choosing this because we need it, or because the big-co reference architecture has it?** A 50-person team copying Netflix's stack is going to drown.

## When this rule doesn't apply

- **Your moat is the infrastructure itself.** If you're Pinecone, you build a vector DB. If you're Anthropic, you train models. Match the rule to your product, not just your headcount.
- **You're acquiring talent specifically to support a layer.** A 5-person team where 3 of them are platform engineers can run more infra than a 50-person team where everyone is a product engineer.
- **A regulatory constraint forces a level you can't otherwise support.** EU residency may force self-hosting on a 10-person team. Pay the cost but cut elsewhere.

## Common mistakes

- **Aspirational tooling.** "We'll be Series B soon so let's adopt the Series B stack now." You won't be Series B if you spend the next six months on plumbing.
- **Tooling cargo-culted from senior engineers' last job.** The new Director of Engineering ran AI platform at a 2,000-person company. Their toolkit will crush a 30-person team.
- **Treating the AI stack like the web stack.** AI ops is younger and changes faster. A reasonable bet two years ago (e.g., a specific agent framework) may now be deprecated. Re-evaluate annually.

:::note[Worked example: stack inflation at a 7-person startup]
A small AI agent startup adopts LangGraph + LangSmith + Pinecone + Modal + Inngest + Braintrust + a self-hosted Llama for cost. Each tool was reasonable in isolation. Combined, the team spends 60% of its time on plumbing.

The fix: collapse to OpenAI API + pgvector + Promptfoo + Vercel. One person spends two weeks ripping out the other tools. Velocity doubles. Three of the seven now work on actual product features instead of stack maintenance.

The lesson: every tool has an operational tax. The tax is invisible until you count the meetings, the on-call, the upgrades, the integrations. At 7 people, you can afford 2 or 3 of these taxes, not 8.
:::

---

→ Next: [Prompt vs RAG vs fine-tune](./prompt-vs-rag-vs-finetune.md).
