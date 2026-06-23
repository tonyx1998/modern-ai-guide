---
id: glossary
title: 18. Glossary
sidebar_position: 99
sidebar_label: 18. Glossary
description: Every term used in the Modern AI Guide, defined in plain English.
---

# Glossary

A single A–Z reference for every term used in this guide. Plain-English definitions, no circular jargon. Cross-references appear in *italics*.

---

## A

**A2A (Agent2Agent)** — An open protocol (a Linux Foundation project) for one *agent* to discover another's capabilities and delegate a task to it. The horizontal complement to *MCP*: A2A is agent ↔ agent, MCP is agent ↔ tools.

**Activation function** — A simple non-linear function (e.g. *ReLU*, sigmoid) applied to a *neuron*'s weighted sum. Without it, stacked layers would collapse into a single straight-line function.

**Agent** — A setup where an LLM works in a loop: it picks a tool, you run it, you feed the result back, it picks the next tool, until it decides it's done. Contrast with *chain*.

**Agent loop** — The control flow of an agent: think → call tool → observe result → repeat. Usually capped by a max-iteration count and a budget.

**Agent harness** — The orchestration layer around an agent: loop control, context assembly, tool allowlists, memory, budgets, and tracing. Distinct from the base *model*.

**Agentic RAG** — *RAG* where the model acts as an *agent* over retrieval: it decides when to retrieve, rewrites or decomposes the query, retrieves in multiple steps, and reflects on whether the results suffice. Contrast with naive (retrieve-once) RAG.

**Alignment** — The broad research goal of making models behave the way humans actually want, rather than what a misread of the objective might encourage.

**ANN (Approximate Nearest Neighbor)** — A class of algorithms (*HNSW*, *IVF*) for finding the most similar vectors quickly, trading a bit of accuracy for huge speedups versus exact search.

**ASR (Automatic Speech Recognition)** — Converting spoken audio to text. Same idea as *STT*. *Whisper* is the most common open model.

**Attention** — The mechanism inside a *transformer* that lets each token "look at" every other token in the context to decide what's relevant.

**Autoregressive** — Generating one token at a time, where each new token is conditioned on every token before it. The way every mainstream LLM produces output.

---

## B

**Backpropagation** — The algorithm that computes, for every *weight*, how much it contributed to the *loss*. Those gradients are what *gradient descent* uses to train a *neural network* — one efficient backward sweep per step.

**Barge-in** — In a voice agent, the user interrupting while the agent is still speaking. Handling it well (stop TTS, cancel generation, listen) is a core realtime-voice engineering problem.

**Base model** — A pre-trained model that has only learned to predict the next token, without later instruction-tuning. Powerful but raw — not what you'd ship to end users.

**Batch API** — Provider endpoints (OpenAI, Anthropic) that run jobs asynchronously within 24 hours for ~50% off the normal rate. Good for offline evals and bulk generation.

**Batching** — Sending multiple inputs through the model in one forward pass for throughput. Critical for self-hosted *inference* economics.

**Bias** — Systematic skew in model outputs against certain groups, topics, or viewpoints. Audited via subgroup *evals*.

**BLEU** — An old machine-translation metric that counts n-gram overlap between output and reference. Mostly superseded by *LLM-as-judge*.

**BM25** — A classic keyword-ranking algorithm for *sparse retrieval*. Often combined with *dense retrieval* in *hybrid search*.

**BPE (Byte Pair Encoding)** — A *tokenizer* algorithm that builds vocabulary by repeatedly merging the most common pairs of characters. Used by GPT and most modern models.

**Braintrust** — A commercial *eval* and observability platform for LLM apps.

---

## C

**Cache hit** — A request whose prompt prefix matched a cached entry, billed at a fraction of normal input price.

**Cache miss** — A request that did not match any cached prefix; full input price applies.

**Calibration** — How well a model's stated confidence matches its real accuracy. A well-calibrated model that says "70% sure" is right 70% of the time.

**Cerebras** — A hardware company whose wafer-scale chips serve open models at extremely high *tokens-per-second*.

**Chain** — A fixed pipeline of LLM and non-LLM steps (vs. an *agent*, which decides the order itself).

**Chain-of-thought (CoT)** — Prompting the model to produce intermediate reasoning steps before its final answer. Improves accuracy on multi-step problems.

**Chroma** — An open-source vector database, popular for local prototyping.

**Chunk** — One slice of a larger document, sized to fit a *retrieval* index and the *context window*.

**Chunking** — The process of splitting documents into *chunks* before embedding them.

**Claude** — Anthropic's family of LLMs. Tiers in 2026: *Opus* (most capable), *Sonnet* (balanced), *Haiku* (fast and cheap).

**CLIP** — OpenAI's contrastive image-text model: it embeds images and captions into the same vector space, so "find images matching this text" becomes a similarity search. The foundation of most *multimodal RAG*.

**Command-R** — Cohere's LLM family, marketed around *RAG* and *tool use*.

**Constitutional AI** — Anthropic's technique for aligning a model using a written set of principles ("constitution") that the model uses to critique and revise its own outputs.

**Content moderation** — Filtering inputs or outputs against a policy. Provider APIs (OpenAI moderation, Anthropic safety) make this a single call.

**Context engineering** — The discipline of curating what is in the model's *context window* at each step of a long task — via compaction, external notes/memory, sub-agent summaries, and just-in-time retrieval. The 2026 successor framing to "prompt engineering" for production and agent systems.

**Context length** — A synonym for *context window*.

**Context window** — The maximum number of tokens an LLM can read and write in a single call. 2026 frontier models are typically 200K–2M tokens.

**Continuous batching** — A serving technique (used by *vLLM*, *TGI*) that adds and removes requests from a batch every step, dramatically improving GPU utilization.

**Computer use** — A capability where a model takes screenshots and emits mouse/keyboard actions to operate a real computer. Pioneered by Anthropic in 2024.

**Contrastive embedding** — An embedding trained by pulling matching pairs (e.g. an image and its caption) together in vector space and pushing non-matching pairs apart. The training recipe behind *CLIP*-style multimodal models.

**Cosine similarity** — A score from -1 to 1 measuring the angle between two vectors. The default similarity metric for normalized *embeddings*.

**Cross-encoder** — A *reranker* model that scores a (query, document) pair jointly. Slower than embedding-based retrieval, but more accurate.

---

## D

**Data poisoning** — An attack where adversarial documents are inserted into a training set or *RAG* corpus to make the model behave badly later.

**Deep learning** — Machine learning with *neural networks* that have many layers ("deep"). It's the technology under every modern LLM — a *transformer* is a deep-learning model.

**DeepSeek** — A Chinese lab whose 2024–2026 open models pushed reasoning-model quality at very low cost.

**Decoder** — The half of a transformer that generates output tokens. Modern LLMs are typically decoder-only.

**Dense retrieval** — Retrieval using *embedding* vectors. Contrast with *sparse retrieval* (*BM25*).

**Diffusion** — A generative architecture, dominant for *text-to-image* and *text-to-video*, that learns to denoise random noise into samples.

**Distillation** — Training a smaller "student" model to mimic a larger "teacher." Used to ship cheap, fast versions of frontier models.

**Docling** — IBM's open-source document parser for PDFs and complex layouts; competes with *Unstructured* and *LlamaParse*.

**Dot product** — A similarity metric between vectors. Equivalent to *cosine similarity* when vectors are unit-length.

**DPO (Direct Preference Optimization)** — A fine-tuning method that learns from pairs of preferred/rejected responses without needing a separate reward model. Simpler than *RLHF*.

**DSPy** — A Stanford framework for *programmatic* prompt optimization: declare typed input→output *signatures* and compose modules (e.g. ReAct), then an optimizer compiles the prompts and few-shot examples against a metric — instead of hand-tuning strings. See *GEPA*.

---

## E

**ElevenLabs** — A leading *TTS* and voice-cloning provider.

**Embedding** — A fixed-length vector of floats that represents the meaning of a piece of text, image, or other input. Semantically similar inputs have similar vectors.

**Encoder** — The half of a transformer that consumes input. Embedding models (e.g., for *RAG*) are typically encoder-only.

**Episodic memory** — Memory of specific past interactions or events, as opposed to general facts. Used in long-running agents.

**EU AI Act** — The European Union's risk-based regulation of AI systems, in force from 2024–2026 in phases.

**Eval** — A test for an LLM system. Either a deterministic check (regex, schema) or a model-graded judgment (*LLM-as-judge*).

**Eval case** — A single test record: input, optional expected output, and the scorer to apply.

**Eval suite** — A collection of eval cases run together, usually with a scorecard summary.

**Exact match** — A scorer that returns 1 if output equals the reference string, 0 otherwise. Brittle but cheap.

---

## F

**F1** — The harmonic mean of *precision* and *recall*. Common for classification-style evals.

**Faithfulness** — Whether a *RAG* answer is actually supported by the retrieved sources. Often graded by an *LLM-as-judge*.

**Fallback** — Routing to a backup model or provider when the primary fails or rate-limits. Usually configured in an *AI gateway*.

**Feature flag** — A toggle that turns a model, prompt, or feature on/off without redeploying. Critical for safe rollouts of AI changes.

**Few-shot** — Prompting style that includes a handful of input/output examples before the real query.

**Fine-tuning** — Updating the weights of a pre-trained model on your own data. Cheaper than training from scratch, more expensive and less reversible than prompting.

**Fireworks** — A serverless inference provider for open models.

**FP8** — 8-bit floating-point *quantization*. Common for serving frontier models at lower memory cost than FP16.

**Foundation model** — A large model pre-trained on broad data and adaptable to many downstream tasks. Includes LLMs, vision models, multimodal models.

**Function calling** — Letting the model emit a structured call (`name`, `arguments`) that your code executes. Synonym for *tool use*.

---

## G

**Gateway** — See *AI gateway*. A proxy in front of model providers handling routing, retries, logging, and cost controls.

**AI gateway** — A proxy that sits between your app and multiple LLM providers, adding logging, *fallback*, key rotation, and cost limits. Examples: *Portkey*, *LiteLLM*, *OpenRouter*.

**Gemini** — Google's LLM family. Tiers: *Ultra*, *Pro*, *Flash*.

**Gemma** — Google's open-weights model family, sibling to Gemini.

**GGUF** — A file format for quantized open-model weights, used heavily by *llama.cpp* and local-inference tooling.

**Golden dataset** — A curated, hand-verified set of examples used as the ground truth for evals.

**Golden path** — A human-approved reference *trajectory* for an *agent* task — the ideal sequence of steps — used to score a run in *trajectory evaluation*.

**GPT** — OpenAI's LLM family ("Generative Pre-trained Transformer").

**Groq** — A hardware company whose LPUs serve open models at very high *tokens-per-second*.

**Ground truth** — The known-correct answer used to score a model's output during evals.

**Groundedness** — Synonym for *faithfulness*: does the output stay anchored to retrieved evidence?

**GEPA (Genetic-Pareto)** — A 2026 reflective prompt-optimization method: an LLM critiques failures in natural language and evolves the prompt, keeping a Pareto front of candidates. Often more sample-efficient than RL-based tuning. Ships in *DSPy*.

**Gradient descent** — The core training loop: nudge each *weight* a small step in the direction that lowers the *loss*, repeated over many examples. The "learning" in deep learning. See *backpropagation*.

**GraphRAG** — A *RAG* variant that builds a knowledge graph plus community summaries over a corpus; strong for global/multi-hop questions over large document sets, and overkill for simple single-hop lookups.

**GRPO (Group Relative Policy Optimization)** — The dominant 2026 RL algorithm for reasoning post-training (from DeepSeek): score a *group* of sampled responses per prompt and push toward the above-average ones, removing the separate critic network *PPO* needs. See *RLVR*.

**Guardrail** — A pre- or post-processing check that blocks unsafe prompts or outputs. May be regex, classifier, or a separate LLM call.

---

## H

**Haiku** — The smallest, fastest tier in Anthropic's Claude family.

**Hallucination** — When the model produces something confident but wrong. The dominant correctness failure mode; mitigated via *RAG*, citations, validation, and *evals*.

**Haystack** — An open-source framework for building *RAG* and search applications.

**Helicone** — An observability platform for LLM apps.

**HNSW (Hierarchical Navigable Small World)** — A graph-based *ANN* algorithm; the default index type in most modern vector databases.

**Hugging Face** — The dominant hub for open-source models, datasets, and training/inference libraries.

**Hybrid search** — Combining *dense retrieval* (embeddings) with *sparse retrieval* (*BM25*), then merging the rankings.

---

## I

**Image embedding** — A vector representation of an image. Used for similarity search across images, or to feed images into a text model.

**Image-to-text** — Generating a textual description of an image (captioning, OCR, VQA).

**Inference** — Running a trained model to produce outputs. The runtime side of ML, as opposed to *training*.

**Inngest** — A durable workflow platform commonly used to orchestrate multi-step LLM jobs.

**Inspect AI** — UK AI Safety Institute's open-source framework for running model evals and capability tests.

**Instruct model** — A *base model* that has been further trained to follow instructions and chat. The default flavor you call via API.

**INT4** — 4-bit integer *quantization*. Aggressive; common for running open models on consumer GPUs.

**INT8** — 8-bit integer *quantization*. Modest accuracy loss, ~4x memory savings vs FP32.

**IVF (Inverted File Index)** — An *ANN* technique that clusters vectors and searches only the nearest clusters. Used by FAISS.

---

## J

**Jailbreak** — A prompt designed to bypass a model's safety training, often through roleplay, encoding tricks, or persona pressure.

**JSON mode** — A provider feature that constrains the model to emit syntactically valid JSON.

**JSON Schema** — A standard for describing JSON shapes. Used to specify tool parameters and *structured output* schemas.

---

## K

**Kill switch** — An emergency feature flag that disables an AI feature instantly. Pair with *observability* so you know when to flip it.

**KV cache** — The cached key/value tensors from previous tokens during generation. Reusing it makes long-context inference vastly cheaper. Underlies *prefix caching*.

---

## L

**LangChain** — A long-standing Python/TS framework for building LLM apps; broad but heavy.

**LanceDB** — An open-source, embedded vector database built on Apache Arrow.

**LangGraph** — A graph-based agent framework from the LangChain team. Models agents as state machines.

**Langfuse** — Open-source LLM observability and tracing platform.

**LangSmith** — LangChain's commercial observability and *eval* platform.

**LiteLLM** — A drop-in proxy and SDK that exposes 100+ providers behind one OpenAI-compatible API.

**LiveKit** — An open-source realtime audio/video infrastructure platform (WebRTC), widely used as the transport layer for voice agents.

**LlamaIndex** — A Python/TS framework focused on *RAG*, indexing, and data connectors.

**LlamaParse** — LlamaIndex's hosted document parser.

**Llama** — Meta's open-weights LLM family. The de-facto baseline for open models since 2023.

**LLM (Large Language Model)** — A neural network trained on huge amounts of text that takes text in and produces text out. Examples: *Claude*, *GPT*, *Gemini*, *Llama*.

**LLM-as-judge** — Using a strong model to grade another model's output against a rubric. The workhorse scorer for subjective evals.

**Logit** — A raw, unnormalized score the model outputs for each token in its vocabulary. Softmaxed to get probabilities.

**Logprob** — The log of the probability the model assigned to a chosen token. Useful for confidence scoring and ranking.

**Long-term memory** — Persistent storage of facts about a user or domain, surfaced into context on future calls. Usually a vector or key-value store.

**Loop engineering** — Informal name for engineering the agent's *loop* and *harness* — what the model sees each turn, which tools it gets, when it stops, what it remembers — rather than swapping the base model. Same idea as *harness engineering* + *context engineering*. See [Agent harness engineering](./17-cutting-edge/01-agent-harnesses.md).

**LoRA (Low-Rank Adaptation)** — A *fine-tuning* method that trains small adapter matrices instead of all weights. Cheap, fast, and swappable at inference time.

---

## M

**MCP (Model Context Protocol)** — An open protocol introduced by Anthropic in late 2024 for exposing tools, resources, and prompts to AI clients in a standard way. Broadly adopted by 2026.

**MCP server** — A process that implements the MCP protocol and exposes a set of tools/resources for clients (Claude Code, Cursor, Claude.ai, etc.) to consume.

**Memory** — In agent systems, any mechanism for carrying information across turns or sessions. See *short-term memory*, *long-term memory*, *episodic memory*.

**Message** — A single entry in a chat history, with a *role* and content.

**Milvus** — An open-source distributed vector database.

**Mistral** — A French lab and its open-weights LLM family.

**Mixtral** — Mistral's *MoE* model family.

**Modal** — A serverless platform popular for hosting custom Python/GPU inference workloads.

**Model card** — A short document describing a model's intended use, training data, limitations, and known risks.

**Model router** — A component (often inside an *AI gateway*) that picks among models per request based on cost, latency, or task class.

**MoE (Mixture-of-Experts)** — A model architecture where each token activates only a few "expert" sub-networks. Lets total parameter count grow without proportional compute cost.

**Multi-agent** — A system with multiple specialized agents collaborating (e.g., planner + researcher + writer).

**Multimodal model** — A model that consumes or produces multiple modalities — text, image, audio, video.

---

## N

**Neural network** — A stack of layers of *neurons*, each computing a weighted sum plus an *activation function*, that maps an input vector to an output. Trained by *gradient descent*. Every LLM is one, scaled up.

**Neuron (unit)** — The atom of a *neural network*: it multiplies each input by a *weight*, adds a bias, and applies an *activation function*.

**NIST AI RMF** — The US National Institute of Standards and Technology's AI Risk Management Framework. A voluntary playbook for governing AI risk.

---

## O

**Observability** — The discipline of seeing into a running LLM system: logs, *traces*, *spans*, metrics, prompts, costs. *Langfuse*, *Helicone*, *LangSmith*, *Braintrust*.

**OCR (Optical Character Recognition)** — Extracting text from images of documents. Modern multimodal models often replace dedicated OCR.

**OpenCLIP** — The open-source reimplementation of *CLIP*, trained on public data. The default when you need a self-hosted image-text embedding model.

**OpenRouter** — A model marketplace exposing dozens of providers behind one OpenAI-compatible endpoint.

**Opus** — The most capable tier in Anthropic's Claude family.

**Output filter** — A *guardrail* applied to model output before it reaches the user (PII redaction, profanity, policy).

---

## P

**Paged attention** — The memory-management trick at the heart of *vLLM*: stores the *KV cache* in fixed-size pages, like an OS, to avoid fragmentation.

**Parameters** — The learned weights of a model. Counted in billions for modern LLMs.

**pgvector** — A Postgres extension that adds vector columns and similarity search. The default choice when you already run Postgres.

**Phi** — Microsoft's family of small, capable open models ("small language models").

**Pinecone** — A managed vector database, one of the first and still widely used.

**Pipecat** — An open-source Python framework for building realtime voice (and multimodal) agent pipelines — wiring *STT*, the LLM, and *TTS* into one streaming loop.

**Plan-and-execute** — An agent pattern where one step produces a full plan and subsequent steps execute it. Contrast with *ReAct*.

**Planner-worker** — A *multi-agent* pattern where a planner agent decomposes work and dispatches it to worker agents.

**Portkey** — A commercial *AI gateway* with routing, caching, and observability.

**Precision** — Of items the model flagged as positive, what fraction actually were? Pair with *recall*.

**Preference tuning** — The umbrella term for training a model on human (or AI) preference comparisons rather than gold answers — *RLHF* and *DPO* are the two main recipes.

**Pre-training** — The initial, massive training run on raw text that produces a *base model*.

**Prefix caching** — Reusing the *KV cache* for repeated prompt prefixes across requests. Saves cost and latency. Anthropic calls this *prompt caching*.

**Promptfoo** — An open-source CLI for running prompt and model evals.

**Prompt** — The text you send into the model. Usually a *system prompt* (instructions) plus a sequence of user and assistant messages.

**Prompt caching** — A provider-side optimization where repeated prompt prefixes are cached and billed at a fraction of normal input cost.

**Policy adherence** — In *agent* *eval*, scoring whether an action-taking agent stayed inside the rules (e.g. never refund above a cap without approval) on its way to the goal — a constraint on the *trajectory* that outcome scoring can't see. Popularized by the τ²-bench benchmark.

**Prompt injection** — An attack where untrusted input (a webpage, an email, a document) carries instructions the model follows as if they were yours. Mitigations: isolation, *guardrails*, careful tool scoping.

**Prompt leak** — When a model reveals its hidden system prompt to a user, often via *prompt injection*.

**Prompt registry** — A versioned store of prompts, separate from code. Lets you A/B-test and roll back prompts without redeploying.

**Prompt tuning (soft prompts)** — A *PEFT* fine-tuning method that freezes the model and learns a small set of continuous "virtual token" embeddings prepended to the input (a close cousin is *prefix tuning*). Cheaper than *LoRA* but usually lower quality, so LoRA is the 2026 default. Not to be confused with *prompt engineering* (writing better prompts by hand).

**Prompt version** — A specific revision of a prompt stored in a *prompt registry*.

**Pydantic AI** — A Python framework that uses Pydantic models to type-check LLM tool calls and *structured output*.

---

## Q

**Qdrant** — An open-source vector database written in Rust.

**QLoRA** — *LoRA* applied on top of a 4-bit-quantized base model. Lets you fine-tune large models on a single GPU.

**Quantization** — Storing model weights at lower precision (*FP8*, *INT8*, *INT4*) to cut memory and speed up inference, at some accuracy cost.

**Query decomposition** — Breaking a complex question into sub-questions before retrieval. Helps *RAG* over multi-hop queries.

**Query expansion** — Rewriting or augmenting a user query (synonyms, paraphrases) before retrieval to improve recall.

**Qwen** — Alibaba's open-weights LLM family.

---

## R

**RAG (Retrieval-Augmented Generation)** — Handing the model relevant documents at query time so it can answer from real data instead of guessing.

**Ragas** — An open-source framework for evaluating *RAG* pipelines (faithfulness, answer relevance, context precision).

**Rate limit** — The cap a provider puts on requests, tokens, or concurrency per minute. The most common cause of "it broke in production."

**ReAct** — An agent pattern that interleaves Reason and Act steps: model thinks, calls a tool, observes, repeats.

**Realtime API** — Provider endpoints (OpenAI, Google) for low-latency speech-in/speech-out interactions, bypassing the separate *STT* → text → *TTS* loop.

**Reasoning model** — A model trained to spend extra inference compute on chain-of-thought before answering. Examples: o-series, Claude reasoning modes, DeepSeek-R1.

**Recall** — Of all the items that actually are positive, what fraction did the model find? Pair with *precision*.

**Red team** — A group (human or automated) that adversarially probes a system for failures, jailbreaks, and harmful behaviors.

**Refusal** — When a model declines to answer because of safety training. Useful when correct, frustrating when over-triggered.

**Regression test** — An *eval* case kept around specifically to catch a previously-fixed bug from coming back.

**Replicate** — A platform that hosts and serves open-source models behind a simple API.

**Reranker** — A second-stage model that re-scores retrieved candidates more accurately than the first-stage retriever. Usually a *cross-encoder*.

**Retell** — A voice-agent platform built on realtime APIs.

**Retrieval** — Looking up relevant data given a query. The "R" in *RAG*.

**RFT (Reinforcement Fine-Tuning)** — OpenAI's term for fine-tuning where the model is rewarded for correct outputs on user-provided graders.

**RLHF (Reinforcement Learning from Human Feedback)** — Training step where humans rank model outputs, a reward model is trained on those ranks, and the LLM is fine-tuned to maximize the reward.

**RLVR (RL with Verifiable Rewards)** — Reinforcement learning where the reward comes from an automatic *verifier* (a math checker, unit tests, a proof checker) instead of a learned reward model. Dominates math/code/reasoning post-training; struggles on open-ended tasks (the "verifier problem"). See *GRPO*.

**Role** — The label on a message: `system`, `user`, `assistant`, or `tool`.

**ROUGE** — A summarization metric based on overlap with reference summaries. Mostly superseded by *LLM-as-judge*.

**Rubric** — The written criteria an *LLM-as-judge* (or human grader) uses to score outputs.

---

## S

**Sampling** — How the next token is picked from the model's probability distribution. Controlled by *temperature*, *top_p*, *top_k*.

**Scorer** — The function that turns a model output (and optional reference) into a score during evals.

**SentencePiece** — A *tokenizer* implementation popular for non-English languages and Llama-family models.

**SFT (Supervised Fine-Tuning)** — The simplest form of *fine-tuning*: train on (input, desired-output) pairs.

**Short-term memory** — The conversation history kept inside the *context window*. The simplest form of memory.

**SigLIP** — Google's improvement on *CLIP* that swaps the softmax contrastive loss for a sigmoid loss; a common backbone for the vision side of modern *VLMs*.

**SLM (Small Language Model)** — A compact LLM (typically under 10B parameters) suitable for edge or on-device use. Examples: *Phi*, *Gemma*.

**Sonnet** — The middle, balanced tier in Anthropic's Claude family.

**Span** — One unit of work inside a *trace* — e.g., a single LLM call, a single retrieval step.

**Sparse retrieval** — Retrieval based on keyword matches (*BM25*, TF-IDF). Contrast with *dense retrieval*.

**Speculative decoding** — A speedup where a small "draft" model proposes tokens that the big model verifies in parallel.

**SR 11-7** — US Federal Reserve guidance on model risk management. Often applied to AI models in finance.

**SSE (Server-Sent Events)** — A long-lived HTTP connection for server-to-client streaming. The default transport for *streaming* LLM responses.

**STT (Speech-to-Text)** — Converting audio to text. Synonym for *ASR*.

**Streaming** — Sending tokens to the client as soon as they're generated, instead of waiting for the full response.

**Structured output** — Forcing the model to emit data matching a *JSON Schema*. Underlies tool calls and typed responses.

**System card** — A document accompanying a major model release, covering capabilities, evals, and safety mitigations.

**System prompt** — The first, hidden instruction message that sets the model's persona, rules, and tools.

---

## T

**Temperature** — A *sampling* parameter that flattens (high) or sharpens (low) the probability distribution. 0 ≈ deterministic, 1 ≈ balanced, >1 = wilder.

**Test-time compute** — Extra inference work at answer time (reasoning tokens, verifier passes, multiple samples) to improve hard answers — bounded by harness budgets.

**Together** — A serverless inference provider for open models.

**Temporal** — A durable workflow engine often used to orchestrate long-running, retryable LLM jobs.

**Text-to-image** — Generating an image from a text prompt. Dominated by *diffusion* models.

**Text-to-video** — Generating a short video clip from a text prompt. 2026 frontier models can produce minutes of coherent footage.

**TGI (Text Generation Inference)** — Hugging Face's open-source inference server, comparable to *vLLM*.

**tiktoken** — OpenAI's BPE tokenizer library. The reference for "how many tokens is this prompt?" with GPT models.

**Token** — The unit an LLM reads and writes — roughly 4 characters of English, or ¾ of a word. Bills are quoted per million tokens, in and out separately.

**Token bill** — Your usage-based invoice from a model provider. Dominated by input tokens for *RAG*, output tokens for generation.

**Tokenizer** — The component that splits text into *tokens* (*BPE*, *SentencePiece*, *tiktoken*).

**Tokens-per-second (TPS)** — Throughput metric for generation. Frontier-quality models: 20–100 TPS; *Groq*/*Cerebras* on open models: 500–2000 TPS.

**Tool** — A function the model can call. Defined by a name, description, and *JSON Schema* for arguments.

**Tool use** — Synonym for *function calling*.

**Tool-call accuracy** — An *agent* *eval* metric: for a given step, did the agent pick the right tool with the right arguments (and avoid calling a tool when none was needed)? A component-level check that needs labeled traces. See *trajectory evaluation*.

**top_k** — A *sampling* parameter that restricts the next-token choice to the K most probable tokens.

**top_p** — A *sampling* parameter that restricts the next-token choice to the smallest set whose cumulative probability exceeds P (a.k.a. nucleus sampling).

**Trace** — A timeline of all *spans* that made up one logical request. The basic unit of LLM *observability*.

**Trajectory eval** — Evaluating an agent's tool sequence and intermediate steps (process), not only the final answer (outcome).

**Training** — The process of updating a model's *parameters* by minimizing a loss function on data.

**Trajectory evaluation** — Scoring an *agent* on the *sequence* of steps it took (against a *golden path*, or via a rubric judge) — order, efficiency, and not taking forbidden actions — not just the final outcome. The layer between outcome and *tool-call accuracy*.

**Transformer** — The neural network architecture behind every modern LLM. Introduced in 2017 ("Attention Is All You Need").

**TTFT (Time-to-First-Token)** — Latency from request start to the first token of output. The metric users actually feel in *streaming* UIs.

**TTS (Text-to-Speech)** — Generating audio speech from text. *ElevenLabs* is the 2026 default.

**Turbopuffer** — A serverless vector database optimized for cheap storage and fast cold queries.

**Turn-taking** — In voice agents, deciding when the user has finished speaking and the agent should respond. Built on *VAD* plus semantic cues; getting it wrong makes the agent interrupt or lag.

---

## U

**Unstructured** — A widely-used open-source library and hosted API for parsing PDFs, HTML, and office docs into chunks ready for *RAG*.

---

## V

**VAD (Voice Activity Detection)** — Detecting when a speaker starts/stops talking. Essential for realtime voice agents.

**Vapi** — A voice-agent platform built on realtime LLM APIs.

**Vector** — A list of numbers. In AI context, almost always an *embedding*.

**Vector database** — A database optimized for "find the K most similar vectors" queries. Used to power *RAG* and semantic search.

**Vector DB** — Short for *vector database*.

**Vector index** — The data structure (*HNSW*, *IVF*) inside a vector database that enables fast *ANN* search.

**Vellum** — A commercial platform for prompt management, evals, and deployment.

**Vercel AI SDK** — The dominant TypeScript abstraction for LLM integrations, with streaming, tools, and React hooks.

**Vespa** — An open-source search engine combining vector, lexical, and structured queries at very large scale.

**Video generation** — Synthesizing video frames from a prompt or seed image. Usually *diffusion*-based.

**Vision** — Any model capability that involves understanding images.

**Vision-language model (VLM)** — A *multimodal* model that takes both text and images as input. Most 2026 frontier models are VLMs.

**VLA (Vision-Language-Action model)** — A model that maps visual input plus a language instruction directly to actions (e.g. robot motions). The core model type behind 2026 embodied AI.

**World model** — A model that learns an environment's *dynamics* — given a state and an action, predict the next state — so an agent can plan or train in imagination. Approaches split between pixel/video-generative (Genie, Cosmos) and latent-prediction (JEPA).

**vLLM** — A high-throughput open-source LLM serving engine. Uses *paged attention* and *continuous batching*.

---

## W

**Weaviate** — An open-source vector database with built-in hybrid search.

**Weights** — Synonym for *parameters*. The numbers a model has learned.

**Whisper** — OpenAI's open-source *ASR* model. The default baseline for speech-to-text.

---

## Z

**Zero-shot** — Asking the model to do a task with no examples in the prompt — just instructions.
