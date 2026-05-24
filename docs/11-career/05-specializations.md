---
id: career-specializations
title: Specialization tracks
sidebar_position: 6
sidebar_label: 5. Specializations
description: Retrieval, agents, evals, inference, voice, multimodal, safety, fine-tuning, FDE — the durable 2026 AI-engineering specializations.
---

# Specialization tracks

> **In one line:** After 1–2 years as a generalist AI engineer, most people specialize into one of about nine durable 2026 tracks — and the right one is the one that overlaps your curiosity with where the companies you want need depth.

:::tip[In plain English]
"Specialize" doesn't mean "stop doing the rest of AI engineering" — it means "be known as the person who's deepest on X" while still shipping features that touch everything. The tracks below are the ones that are real (have multiple companies hiring for the title), durable (will likely still matter in 3 years), and pay a premium (10–30% over generalist AI-engineer at the same level).
:::

## When to specialize

**Not in Year 1.** As a junior, breadth across prompting / retrieval / evals / observability is more valuable than depth in any one. You need to *feel* which problems energize you, which means trying all of them.

**Year 2–3 is the natural pivot.** By then you've shipped 4–8 features, you've felt which kinds of problems you enjoy debugging at 11pm, and you can read the team's roadmap and see which depth would compound for your career.

The wrong reason to specialize: "this track pays 25% more on levels.fyi." If you don't enjoy reading model release notes every week, you will burn out as a retrieval or fine-tuning specialist faster than the premium pays back.

## The nine durable tracks

### 1. Retrieval (RAG at scale)

**Owns:** RAG quality across an org's products.

- **Deep in:** chunking strategies (semantic, structural, hierarchical), hybrid search (BM25 + vector + score fusion), reranking (Cohere rerank-3, Voyage, cross-encoders), knowledge graphs (Neo4j, Memgraph, knowledge-graph-augmented RAG), query understanding (query rewriting, HyDE, multi-query).
- **Pairs with:** information-retrieval backgrounds, search-engine backgrounds, library science (yes, really — top RAG engineers often have search or library backgrounds).
- **Companies hiring deep retrieval roles:** Glean, Hebbia, Harvey, Perplexity, Notion AI, Atlassian Rovo, Box AI, Dropbox Dash, every enterprise-AI search company.
- **Conferences worth attending:** SIGIR (academic), Search Engines Day (industry), Vector Search talks at QCon, the Pinecone / Weaviate user days.
- **Open-source projects to contribute to:** **Vespa, Qdrant, Weaviate, LanceDB, Marqo, Haystack, LlamaIndex, Verba**.

### 2. Agents

**Owns:** agentic systems — multi-step, tool-using, sometimes autonomous LLM workflows.

- **Deep in:** planning, tool design (the schema and description of each tool matters more than the orchestration framework), memory (short-term, long-term, episodic), orchestration (LangGraph, Inngest, Mastra, Restate, Temporal-for-agents), multi-agent (CrewAI, AutoGen, but increasingly homegrown), evaluation of agent traces.
- **Pairs with:** workflow-engine backgrounds (Airflow, Temporal), distributed-systems experience.
- **Companies hiring deep agent roles:** Sierra, Decagon, Cresta, Cognition (Devin), Anthropic (Claude Code), Cursor, MultiOn, Lindy, Crew.ai, Harvey, every "AI employee" company.
- **Conferences worth attending:** **AI Engineer Summit / AI Engineer World's Fair** (the agent track is the headliner in 2025–2026), Latent Space's events, NeurIPS agent workshops.
- **Open-source projects to contribute to:** **LangGraph, Mastra, Inngest, OpenAI swarm-successor projects, smolagents (HF), AutoGen, Restate's agent layer, MCP server implementations**.

### 3. Evals & quality

**Owns:** the eval platform and the practices around it.

- **Deep in:** LLM-as-judge methodology (calibration, judge prompt design, bias mitigation), regression discipline, statistical testing for stochastic systems, production sampling, alignment of evals to user-perceived quality.
- **Pairs with:** QA backgrounds, statistics / data-science backgrounds, search-quality / relevance-engineering backgrounds.
- **Companies hiring deep eval roles:** Braintrust, Langfuse, LangSmith, Inspect AI (UK AISI), Anthropic (alignment / evals teams), OpenAI (evals teams), every serious AI-native scaleup has an evals lead by 2026.
- **Conferences worth attending:** **AI Quality Conference**, **EvalsCon** (new in 2025), NeurIPS evaluation workshops, METR's public talks.
- **Open-source projects to contribute to:** **Promptfoo, Inspect AI, OpenAI evals, BIG-bench, lm-evaluation-harness, Phoenix (Arize), DeepEval**.

### 4. Inference / model serving

**Owns:** the model runtime.

- **Deep in:** vLLM, TensorRT-LLM, TGI (Hugging Face), SGLang, quantization (GPTQ, AWQ, FP8, MXFP4), continuous batching, paged attention, speculative decoding, GPU scheduling, multi-LoRA serving.
- **Pairs with:** traditional ML engineering, systems engineering, CUDA / Triton kernel work.
- **Companies hiring deep inference roles:** Together AI, Fireworks AI, Modal, Baseten, Anyscale, Replicate, vLLM project itself (Berkeley → now hosted by LF AI), NVIDIA (TensorRT-LLM team), Cerebras, Groq, SambaNova, frontier labs' inference teams.
- **Conferences worth attending:** **MLSys**, NeurIPS systems track, **GTC** (NVIDIA), Ray Summit, vLLM community meetups.
- **Open-source projects to contribute to:** **vLLM, SGLang, TGI, llama.cpp, MLX, ExecuTorch, candle (Rust)**.

### 5. Voice

**Owns:** voice-native AI products.

- **Deep in:** end-to-end speech models (GPT-4o realtime, Sesame, Moshi), turn-taking, latency budgets (you live or die at \&lt;500ms), telephony (Twilio, Vonage, LiveKit, Daily), interruption handling, voice cloning ethics, real-time media plumbing.
- **Pairs with:** real-time backends, WebRTC, telephony backgrounds.
- **Companies hiring deep voice roles:** Sierra, Decagon, Cresta, Speak, Vapi, Retell, Bland, PolyAI, ElevenLabs (Conversational), OpenAI (Realtime), Anthropic (voice for Claude), Hume.
- **Conferences worth attending:** Voice & AI conference (London), Bots & AI, LiveKit user days.
- **Open-source projects to contribute to:** **LiveKit Agents, Pipecat, Daily's daily-python**, vapi-style frameworks.

### 6. Multimodal

**Owns:** vision / audio / video features.

- **Deep in:** document parsing via vision models (the new "OCR + layout"), video understanding, image generation pipelines (SDXL → Flux → next), VLM (vision-language model) inference, multimodal evals.
- **Pairs with:** computer-vision backgrounds, graphics, video engineering.
- **Companies hiring deep multimodal roles:** Runway, Pika, Suno, Midjourney, Adobe Firefly, Stability, Krea, Higgsfield, the multimodal teams at Anthropic / OpenAI / Google, document-AI companies (Reducto, Unstructured, Mendable, Mathpix).
- **Conferences worth attending:** **CVPR**, NeurIPS, **SIGGRAPH** (for image / video generation), Runway's Gen Summit.
- **Open-source projects to contribute to:** **Unstructured, Marker, Llama Index multimodal, ColPali / ColQwen retrieval, ComfyUI, Diffusers (Hugging Face)**.

### 7. Safety / responsible AI

**Owns:** the harms surface.

- **Deep in:** prompt-injection defense, jailbreak testing (red-teaming as a discipline), bias auditing, output filtering (classifier-based, model-based), regulatory alignment (EU AI Act compliance, NIST AI RMF, SOC2-for-AI), watermarking, deepfake detection.
- **Pairs with:** security engineering, policy backgrounds, ML research.
- **Companies hiring deep safety roles:** Anthropic (safety teams), OpenAI (safety teams), Google DeepMind, UK AISI / US AISI, Lakera, HiddenLayer, Robust Intelligence (Cisco), Protect AI, every regulated-industry AI team (banks, insurers, healthcare AI).
- **Conferences worth attending:** **DEF CON's AI Village**, USENIX Security AI workshops, FAccT, NeurIPS safety workshops.
- **Open-source projects to contribute to:** **Garak (NVIDIA), PyRIT (Microsoft), Inspect AI (UK AISI), TrustyAI, Promptfoo (red-team templates)**.

### 8. Fine-tuning / custom models

**Owns:** custom-model work.

- **Deep in:** data curation (the #1 lever), SFT / DPO / RFT / RLHF, LoRA and QLoRA, eval-driven training, evaluation of fine-tuned vs base + prompt, distillation.
- **Pairs with:** ML-engineering background.
- **Companies hiring deep fine-tuning roles:** Decagon, Cresta, Speak, Khan Academy, Together AI, Fireworks (managed fine-tuning), Predibase, OpenPipe, Anthropic (post-training), OpenAI (post-training), most "AI for X" verticals where the domain is narrow enough to justify custom models.
- **Conferences worth attending:** NeurIPS, ICLR, **ICML**, MLSys, ACL, Stanford NLP seminar.
- **Open-source projects to contribute to:** **Axolotl, Unsloth, TRL (Hugging Face), torchtune, OpenRLHF, LLaMA-Factory, verl**.

### 9. Forward-Deployed Engineer (FDE) / Applied AI

**Owns:** customer success through engineering.

- **Deep in:** the customer's actual workflow, integration with the customer's stack, on-site debugging, feedback loops back to the core product, sometimes one customer per quarter relationship.
- **Pairs with:** consulting backgrounds, customer-facing engineering, generalist AI engineering.
- **Companies hiring FDE / Applied AI:** **Anthropic, OpenAI, Sierra, Decagon, Harvey, Hebbia, Glean, Cresta, Palantir (the original).**
- **Comp note:** at frontier labs, FDE is paid at senior IC bands and often has unusual upside.

## Picking a track: the curiosity audit

:::note[Try it yourself: a 2-hour curiosity audit]
Block 2 hours and ask yourself:

1. **Which AI problem made me lose track of time in the last six months?** A finicky chunking strategy? A confusing eval result? A slow agent that should be fast? A latency spike in a voice loop? A prompt that wouldn't generalize?
2. **What did I read in my own free time?** Eval blog posts (→ evals)? Inference deep-dives (→ inference)? Agent design notes (→ agents)? Vision-model demos (→ multimodal)?
3. **Which conference talk this year did I actually finish?** That track is a hint at your specialization energy.
4. **Where do the companies I'd kill to work at need depth?** Glean for retrieval, Sierra for voice + agents, Modal for inference, Anthropic for safety + research engineering.

The intersection of (3) and (4) is your specialization. If they don't intersect, lean (3) — the energy lasts longer than the comp premium.
:::

:::info[Highlight: specialize at the team level, not the resume level]
The way you actually become "the retrieval person" is by being the one your team brings retrieval problems to — *not* by changing your job title. Get assigned the next chunking-strategy decision, write the team's retrieval eval suite, give a brown-bag on hybrid search. Three months of being-the-person beats six months of resume rewrites. The title follows the work.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Picking a specialization on day one of your AI career.** You can't know what energizes you before you've tried each. Be a generalist for at least a year.
- **Chasing whichever specialization Twitter says is hot this quarter.** In 2024 it was agents; in 2025 it was voice; in 2026 it's already shifting to long-context / memory. The fundamentals across tracks compound; trend-chasing resets your depth clock every year.
- **Specializing in a track that doesn't match your day job.** "I'm an evals specialist" requires that you're allowed to spend time on evals at work. If your manager wants more shipped features and less platform work, you'll burn out trying to be both.
- **Refusing to specialize past year 5.** "I'm a generalist AI engineer" at year 6 often means "I'm replaceable at every level by someone with depth somewhere." Senior comp is paid for depth; pick where.
- **Treating Forward-Deployed Engineer as a downgrade.** At Anthropic, OpenAI, Sierra, and Decagon, FDE is a senior IC track with high comp and unusual career upside (you see the most interesting enterprise problems first).
:::

→ Next: [Portfolio anatomy](./06-portfolio.md).
