---
id: career-roles
title: The roles, distinguished
sidebar_position: 4
sidebar_label: 3. The roles
description: AI engineer vs ML engineer vs research engineer vs prompt engineer. Who does what, which roles actually exist as durable jobs, and where the boundaries blur.
---

# The roles, distinguished

> **In one line:** In 2026 the four AI-adjacent titles you'll see — AI Engineer, ML Engineer, Research Engineer, and (vestigially) Prompt Engineer — are real and *not* interchangeable; AI Engineer is the largest and fastest-growing.

:::tip[In plain English]
Job titles in AI are a mess because the field reorganized faster than recruiters could keep up. The four titles below mean specific things at the companies that hire seriously for them — and confusing them is one of the easiest ways to apply to the wrong job. Use the headline-defining task for each role to figure out which one is you (or which one you want to grow into).
:::

## AI Engineer

**Headline-defining task:** ship and operate an LLM-powered feature in production, end-to-end, with evals.

- **Owns:** prompts, retrieval, agents, evals, observability, cost.
- **Does NOT usually own:** model training from scratch, low-level inference kernels.
- **Languages:** TypeScript or Python (often both).
- **Tools you'd see on a resume:** Anthropic SDK, OpenAI SDK, LangChain or LlamaIndex (declining), Vercel AI SDK, MCP (Model Context Protocol), Braintrust, Langfuse, LangSmith, Promptfoo, Modal, pgvector or Pinecone, Inngest or Trigger.dev.
- **Where it lives:** every AI-native scaleup (Cursor, Perplexity, Harvey, Sierra, Glean, Decagon, Cresta, Vellum, Braintrust, Langfuse, Hebbia), every B2B SaaS adding AI (Notion, Linear, Atlassian, Figma, Box, Dropbox, Adobe), every consumer product (Duolingo, Khan Academy, Spotify), every frontier lab's applied / product team.

This is the dominant 2026 LLM-application role. If you're a software engineer adding LLMs to your toolkit, this is the natural shape.

## ML Engineer

**Headline-defining task:** train, fine-tune, evaluate, and serve ML models at production scale.

- **Owns:** data pipelines, training infrastructure, model serving, MLOps, sometimes model architecture.
- **Languages:** Python primarily, plus distributed systems languages (Go, Rust, C++).
- **Tools you'd see on a resume:** PyTorch, JAX, Ray, vLLM, TGI, Kubernetes, Kubeflow or Metaflow, Weights & Biases or Neptune, MLflow, Spark, Airflow, DVC, Triton inference server.
- **Where it lives:** companies that train their own models (frontier labs, plus serious applied-AI shops like Replicate, Together, Fireworks, Modal, Baseten, Anyscale, plus the ML teams at Meta, Google, ByteDance, Tencent), companies that fine-tune at scale (Decagon, Cresta, Speak, Khan Academy), recommendation-heavy companies (Netflix, Pinterest, TikTok, Spotify, DoorDash).

In 2026 there are *fewer* pure ML engineering roles than in 2020 — most product work has shifted to AI engineering — but the role is alive and well at companies that build or operate models, and the comp is among the highest in tech.

## Research Engineer

**Headline-defining task:** build the infrastructure that capability researchers use, and sometimes contribute to research directly.

- **Owns:** training stacks, eval harnesses, distributed training, sometimes paper-publishable contributions.
- **Languages:** Python, plus deep systems work (CUDA, Triton, C++).
- **Tools you'd see on a resume:** PyTorch internals, Megatron-LM, DeepSpeed, FSDP, custom CUDA kernels, internal eval frameworks, sometimes a publication record at NeurIPS, ICLR, ICML, ACL.
- **Where it lives:** **Anthropic, OpenAI, Google DeepMind, Meta FAIR, Mistral, xAI, Cohere, Reka, AI21**, plus the most research-leaning scaleups (Sakana, AI2, Hugging Face's science team).

The bar is the highest in the industry — usually requires either a PhD or an exceptional engineering track record at a frontier lab. Comp is the highest in tech.

## "Prompt Engineer"

**Headline-defining task (2023):** write good prompts.

**Status in 2026:** mostly absorbed into AI Engineer as a *skill*; rarely a job title at serious companies. The exceptions are some enterprise consulting roles, some content / creative-AI roles at media companies, and Anthropic's "Applied AI" team (which is closer to a hybrid solutions architect + prompt expert).

- **As a skill it's essential** — everyone shipping LLM features needs to be a competent prompter.
- **As a job title it's a yellow flag.** Companies that hire "prompt engineers" as a primary discipline in 2026 are often less mature in their AI engineering practice than companies that hire AI engineers and expect them to prompt well.

## Adjacent roles in the orbit

You'll also encounter these in 2026:

- **AI / ML Platform Engineer** — builds the gateway, eval platform, observability platform, model registry for an internal AI team. Internal-tools focus. Common at Stripe, Shopify, Airbnb, Uber, Robinhood — anywhere with a serious internal AI org.
- **Forward-Deployed Engineer (FDE) / Applied AI** — hybrid engineer + solutions architect + customer support. Embed with the customer, ship the integration, bring learnings back. Coined by Palantir, popularized in 2024–2026 by **Anthropic, OpenAI, Sierra, Decagon, Harvey** for enterprise deployments.
- **Responsible AI / AI Governance / AI Safety Engineer** — compliance, risk, oversight, sometimes alignment research. Common at frontier labs, big tech, regulated industries (finance, healthcare).
- **AI Product Manager** — product thinking specifically for AI features (evals, UX patterns, cost, risk, model selection).
- **AI Solutions Architect** — pre-sales technical role at LLM providers (Anthropic, OpenAI), inference platforms (Together, Modal), and enterprise software vendors.
- **Voice AI Engineer** — specialized in real-time speech, latency, telephony. Hot in 2025–2026 at Sierra, Speak, Vapi, Retell, Bland, ElevenLabs Conversational.

## Which to pick

| Background | Most natural next step |
|---|---|
| Already a software engineer | AI Engineer at a scaleup or non-AI SaaS |
| Already an ML engineer | Continue ML, but pick up AI Engineering toolkit (prompting, evals); demand is on that side |
| Researcher / PhD | Research Engineer at a frontier lab, or AI Engineer at a serious scaleup |
| Backend / infra | AI / ML Platform Engineer, or Inference specialization |
| Frontend / product | AI Engineer with a product taste angle (Cursor, Linear, Notion are the archetypes) |
| Consulting / customer-facing | Forward-Deployed Engineer at Anthropic, OpenAI, Sierra, Decagon |
| Voice / telephony / real-time | Voice AI Engineer at Sierra, Speak, Vapi, Retell |

:::note[Worked example: same person, three titles]
A 4-year backend engineer with a year of ML platform experience and one shipped RAG project applies broadly. They hear back as:

- **"AI Engineer"** at Vellum and at Atlassian's Rovo team — both because of the shipped RAG project.
- **"ML Platform Engineer"** at Stripe — because of the year of ML platform work.
- **"Forward-Deployed Engineer"** at Anthropic — because the recruiter saw "shipped RAG + customer-facing background" and pattern-matched FDE.

Three titles, one person. The signal that opened all three doors was the *shipped artifact*, not the title they put on their LinkedIn. **Optimize for shipped work, not for picking the right title in advance.**
:::

:::info[Highlight: the boundary between AI Engineer and ML Engineer is fuzzier than it sounds]
A senior AI Engineer at Decagon who runs SFT/DPO on fine-tuned customer-support models is doing ML work; an ML Engineer at Together who tunes vLLM batching for a customer is doing AI engineering. The titles describe the *primary* slice of the work, not a clean partition. Don't let title gatekeeping stop you from applying to roles where you'd do work you enjoy.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Calling yourself a Prompt Engineer in 2026.** It signals you didn't update your mental model post-2024. "AI Engineer (prompting & evals specialty)" is the modern version of that claim.
- **Conflating AI Engineer with ML Engineer on a resume.** Recruiters skim for the right keywords. If your background is shipping LLM features, lead with "AI Engineer"; if it's training models, lead with "ML Engineer." Mixing them confuses both screens.
- **Applying for Research Engineer roles without a publication or exceptional artifact.** The bar at frontier labs for research-engineering is very high. Without either a NeurIPS / ICML / ICLR paper or a viral OSS project (think nanoGPT-tier), you'll be filtered. Apply for AI Engineer or Forward-Deployed instead.
- **Treating Forward-Deployed Engineer as a downgrade.** At Anthropic and OpenAI, FDE roles are paid at senior IC bands and have unusual upside (you see the most interesting enterprise problems, you have direct customer relationships). It's a legitimate destination, not a consolation prize.
- **Refusing AI Platform Engineer roles because "they're not building product."** Platform roles often have the highest impact-per-engineer at an org with 100+ AI engineers. They also tend to be the route to Staff/Principal in big-tech AI orgs.
:::

<Quiz id="career-roles-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the headline-defining task of an AI Engineer, as distinct from an ML Engineer?"
  options={[
    { text: "Train, fine-tune, and serve ML models at production scale" },
    { text: "Ship and operate an LLM-powered feature in production, end-to-end, with evals" },
    { text: "Build the training infrastructure that capability researchers use" },
    { text: "Write and maintain the prompts for a company's chatbots" }
  ]}
  correct={1}
  explanation="The AI Engineer owns prompts, retrieval, agents, evals, observability, and cost - but not usually model training or inference kernels. That is the ML Engineer's territory. It is the dominant LLM-application role of 2026 and the natural shape for software engineers adding LLMs to their toolkit."
/>

<Question
  prompt="What happened to the Prompt Engineer title by 2026?"
  options={[
    { text: "It became the highest-paid specialization at frontier labs" },
    { text: "It was renamed Context Engineer at most companies" },
    { text: "It disappeared because prompting stopped mattering" },
    { text: "It was absorbed into AI Engineer as a skill, and as a primary job title it is now a yellow flag about a company's maturity" }
  ]}
  correct={3}
  explanation="Prompting is essential as a skill - everyone shipping LLM features must prompt well. But companies hiring 'prompt engineers' as a primary discipline in 2026 are often less mature than ones hiring AI Engineers and expecting strong prompting from them."
/>

<Question
  prompt="In the worked example where one person hears back under three different titles, what was the signal that opened all three doors?"
  options={[
    { text: "The shipped artifact - the RAG project and platform work - not the title on their LinkedIn" },
    { text: "Listing all three titles in their resume header" },
    { text: "A referral from a frontier-lab employee" },
    { text: "Holding an ML certification recruiters searched for" }
  ]}
  correct={0}
  explanation="The same person was pattern-matched into AI Engineer, ML Platform Engineer, and Forward-Deployed Engineer roles based on what they had shipped. The lesson: optimize for shipped work, not for picking the right title in advance."
/>

</Quiz>

→ Next: [The skill stack](./04-skill-stack.md).
