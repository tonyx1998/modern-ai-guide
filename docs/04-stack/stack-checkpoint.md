---
id: stack-checkpoint
title: Stack checkpoint
sidebar_position: 99
description: Mandatory checkpoint quiz for the 2026 AI Tech Stack chapter — 5 random questions from a 14-question bank.
---

# Stack checkpoint

You've finished the 2026 AI Tech Stack chapter. Take a minute to confirm the defaults and the "when to deviate" rules actually stuck.

There are **14 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card links you to the exact section to revisit.

You must pass (≥ 60%) to unlock the Next button and Chapter 5 in the sidebar.

<Quiz id="stack-checkpoint" title="AI Tech Stack checkpoint" sampleSize={5}>

<Question
  prompt="A startup with under 10M vectors is already running Postgres for its app data. What's the chapter's default vector DB pick?"
  options={[
    { text: "Pinecone — managed is always worth it for vectors" },
    { text: "Weaviate, because it has built-in hybrid search" },
    { text: "pgvector — you already have Postgres, one DB and one ops burden" },
    { text: "Qdrant, because Rust is the fastest" }
  ]}
  correct={2}
  explanation="The 2026 default is pgvector: no new service, no new ops burden, and good enough up to roughly 10M vectors with hot QPS. Only move to Qdrant/Weaviate/Pinecone when you've measured a real pgvector pain point."
  revisit={{ to: "/docs/stack/vector-databases", label: "Vector databases" }}
/>

<Question
  prompt="You're building a typed TypeScript app that calls Claude and streams tokens to the browser. Which LLM SDK does the chapter recommend as the default?"
  options={[
    { text: "LangChain.js — most stars on GitHub" },
    { text: "Vercel AI SDK — thin, typed, framework-agnostic, with first-class streaming" },
    { text: "Hand-rolled fetch calls against each provider" },
    { text: "Semantic Kernel for TS" }
  ]}
  correct={1}
  explanation="The Vercel AI SDK is the default TS pick: typed providers, unified streaming primitives, and no framework tax. Pydantic AI plays the same role in Python."
  revisit={{ to: "/docs/stack/llm-sdks", label: "LLM SDKs" }}
/>

<Question
  prompt="Your team wants to manage prompts. The chapter's day-one recommendation is:"
  options={[
    { text: "Buy PromptLayer immediately so non-engineers can edit prompts" },
    { text: "Store prompts in a separate Postgres table behind an admin UI" },
    { text: "Git + Markdown + Promptfoo — PR-reviewable, zero new vendors" },
    { text: "Hard-code them as Python string literals scattered across files" }
  ]}
  correct={2}
  explanation="Prompts are code: keep them in the repo as Markdown, version them with Git, and test them with Promptfoo in CI. Only reach for PromptLayer/Braintrust Prompts when non-engineering authors become the bottleneck."
  revisit={{ to: "/docs/stack/prompt-management", label: "Prompt management" }}
/>

<Question
  prompt="A founder wants to build a v0 RAG pipeline. Which approach matches the chapter's verdict?"
  options={[
    { text: "Adopt LangChain end-to-end so you don't reinvent the wheel" },
    { text: "Write the retrieval + prompt assembly yourself in raw code with pgvector; reach for LlamaIndex later if needed" },
    { text: "Use Haystack because it has the best docs" },
    { text: "Start with DSPy and let it optimize the prompts automatically" }
  ]}
  correct={1}
  explanation="RAG v0 is ~100 lines: embed, store in pgvector, top-k, stuff into a prompt. Building it yourself teaches the failure modes. LlamaIndex earns its keep once you need advanced retrievers or 50+ document types."
  revisit={{ to: "/docs/stack/rag-frameworks", label: "RAG frameworks" }}
/>

<Question
  prompt="You need to build an agent that loops between an LLM and tools. The chapter says to start with:"
  options={[
    { text: "CrewAI with multiple specialized agents from day one" },
    { text: "AutoGen, because multi-agent is the future" },
    { text: "A DIY `while` loop you fully understand; move to LangGraph (or Pydantic AI graphs) once the state machine gets gnarly" },
    { text: "LangChain AgentExecutor — it's the standard" }
  ]}
  correct={2}
  explanation="Most production 'agents' are a `while` loop with tool calls. Build it once by hand so you understand control flow, retries, and budget. Reach for LangGraph when branching/state genuinely warrant a framework."
  revisit={{ to: "/docs/stack/agent-frameworks", label: "Agent frameworks" }}
/>

<Question
  prompt="Your nightly summarization job is racking up $8k/month on a non-interactive workload. The chapter's first move is:"
  options={[
    { text: "Negotiate enterprise pricing with the provider" },
    { text: "Fine-tune a small open model immediately" },
    { text: "Move it to the OpenAI or Anthropic Batch API for ~50% off" },
    { text: "Switch to a cheaper provider via OpenRouter" }
  ]}
  correct={2}
  explanation="Native batch APIs from OpenAI and Anthropic give ~50% off in exchange for up-to-24h turnaround — perfect for non-interactive jobs. Fine-tuning and provider switching are later moves."
  revisit={{ to: "/docs/stack/batch-inference", label: "Batch inference" }}
/>

<Question
  prompt="You're running Claude in production with one provider and decent traffic. When does the chapter say to add a gateway like Portkey or LiteLLM?"
  options={[
    { text: "Day one — never call a provider SDK directly" },
    { text: "When you're using 2+ providers in production, or you need to swap models in one place" },
    { text: "Only if you're on Kubernetes" },
    { text: "When your bill crosses $100/month" }
  ]}
  correct={1}
  explanation="A gateway earns its keep once you have multi-provider routing, fallback, or central model-swap needs. With one provider, it's another moving part and an extra hop."
  revisit={{ to: "/docs/stack/gateways", label: "AI gateways" }}
/>

<Question
  prompt="Your agent needs to write and execute arbitrary Python the model just generated. The chapter's recommended runtime is:"
  options={[
    { text: "Run it directly in your API process with `eval`" },
    { text: "Spin up a Docker container per call on your own VM" },
    { text: "E2B or Modal sandboxes — purpose-built ephemeral runtimes for LLM-generated code" },
    { text: "AWS Lambda with a custom layer" }
  ]}
  correct={2}
  explanation="E2B and Modal sandboxes are designed for exactly this: fast cold-starts, strong isolation, and a clean API for the agent loop. Never `eval` model output in your own process."
  revisit={{ to: "/docs/stack/agent-runtimes", label: "Agent runtimes" }}
/>

<Question
  prompt="A flow involves an LLM call, a webhook, a 2-minute wait, then another LLM call. The chapter's pick for orchestrating it (TS stack) is:"
  options={[
    { text: "Keep it in a single HTTP handler with a `setTimeout`" },
    { text: "Inngest — durable steps, retries, and sleep primitives built for serverless TS" },
    { text: "A bash script on a cron" },
    { text: "Redis pub/sub with hand-rolled retry logic" }
  ]}
  correct={1}
  explanation="Once a flow exceeds ~30s or needs durable retries, you want an orchestrator. Inngest is the TS default; Temporal or Modal are the Python equivalents."
  revisit={{ to: "/docs/stack/orchestration", label: "Orchestration" }}
/>

<Question
  prompt="You're picking an embedding model for an English-language RAG app on day one. The chapter's default is:"
  options={[
    { text: "OpenAI `text-embedding-3-small` — ubiquitous, cheap, good enough for v0" },
    { text: "Voyage `voyage-3` — always best quality" },
    { text: "Cohere `embed-v3` for multilingual" },
    { text: "A locally hosted BGE model behind vLLM" }
  ]}
  correct={0}
  explanation="`text-embedding-3-small` is the boring default: $0.02/Mtok, well-supported, and good enough until you measure embedding quality as the bottleneck. Then move to Voyage `voyage-3` (or `voyage-code-3` for code)."
  revisit={{ to: "/docs/stack/embedding-models", label: "Embedding models" }}
/>

<Question
  prompt="A compliance team mandates that no customer data leave the VPC. Which serving approach does the chapter recommend for running open weights inside your own network?"
  options={[
    { text: "Ollama on a developer laptop, then port-forward in production" },
    { text: "TGI behind a load balancer, since it's the original HF server" },
    { text: "vLLM — the production-grade open-source inference server with PagedAttention" },
    { text: "Run llama.cpp on CPU instances" }
  ]}
  correct={2}
  explanation="vLLM is the production default for self-hosted open models: high throughput, continuous batching, and broad model support. Ollama is for local dev; TGI is a fine alternative but vLLM has the momentum."
  revisit={{ to: "/docs/stack/inference-servers", label: "Inference servers" }}
/>

<Question
  prompt="You want a free, open-source observability tool for LLM traces, costs, and feedback on day one. The chapter's pick is:"
  options={[
    { text: "Datadog APM with custom spans" },
    { text: "Langfuse — open-source, self-hostable, with traces, evals, and prompt mgmt in one" },
    { text: "Helicone only, since proxying is simpler" },
    { text: "Roll your own with OpenTelemetry" }
  ]}
  correct={1}
  explanation="Langfuse is the OSS default: traces, costs, eval scores, and prompt management in one tool. Helicone (proxy-mode) is a nice complement when you want zero SDK changes."
  revisit={{ to: "/docs/stack/observability", label: "Observability" }}
/>

<Question
  prompt="You're building an in-app voice assistant for the web. The chapter's simplest path is:"
  options={[
    { text: "Vapi — purpose-built for phone numbers" },
    { text: "Stitch together ElevenLabs TTS + Whisper STT + GPT yourself" },
    { text: "OpenAI Realtime API — one WebSocket, speech-to-speech, lowest integration cost" },
    { text: "Retell because it has the best latency" }
  ]}
  correct={2}
  explanation="OpenAI Realtime is the simplest in-app voice path: one WebSocket, speech-in/speech-out. Use Vapi or Retell when you need a phone number; ElevenLabs when voice quality is the headline feature."
  revisit={{ to: "/docs/stack/voice-infrastructure", label: "Voice infrastructure" }}
/>

<Question
  prompt="A team's eval set has grown from 30 to 300 cases and product managers want a dashboard. The chapter's recommended move is:"
  options={[
    { text: "Stick with Promptfoo in CI — dashboards are overkill" },
    { text: "Graduate from Promptfoo to Braintrust (or Langfuse evals) for the dashboard, sharing, and richer scorers" },
    { text: "Build a custom Streamlit dashboard on top of your CI artifacts" },
    { text: "Move to Patronus, since it's the only enterprise option" }
  ]}
  correct={1}
  explanation="Promptfoo is the right starting point — version-controlled, lightweight, runs in CI. Once eval discipline becomes the bottleneck and non-engineers need to look at results, Braintrust or Langfuse evals are the natural graduation."
  revisit={{ to: "/docs/stack/eval-tools", label: "Eval tools" }}
/>

</Quiz>

---

→ Continue to [Chapter 5: Evaluation & Measurement](/docs/evaluation) — you can build the stack now; next you learn to *measure* whether it's any good.
