---
id: cutting-edge-checkpoint
title: Optional checkpoint
sidebar_position: 99
sidebar_label: Checkpoint (optional)
description: Self-check quiz for Chapter 17 — Cutting Edge. Optional; does not gate the capstone or glossary.
---

# Chapter 17 Checkpoint (optional)

Quick self-check on the cutting-edge themes: harnesses, agentic RAG, trajectory evals, efficient inference, and research triage. **Passing is not required** to unlock the [Final capstone](../99-capstone.md) or [Glossary](../11-glossary.md).

There are **8 questions in the bank** — each visit picks 4 at random.

<Quiz id="cutting-edge-checkpoint" title="Cutting edge — optional self-check" sampleSize={4}>

<Question
  prompt="What belongs in the agent harness rather than in the base model?"
  options={[
    { text: "Loop control, context assembly, tool allowlists, memory writes, budgets, and tracing" },
    { text: "Transformer attention weights" },
    { text: "The tokenizer vocabulary" },
    { text: "GPU kernel fusion" }
  ]}
  correct={0}
  explanation="The harness orchestrates; the model predicts. Weights and tokenizers are model/provider concerns — budgets and tool policy are yours."
  revisit={{ to: "/docs/cutting-edge/agent-harnesses", label: "Agent harness engineering" }}
/>

<Question
  prompt="Agentic RAG differs from one-shot RAG primarily because:"
  options={[
    { text: "It uses PDFs instead of HTML" },
    { text: "The model can decide when and how to search again across steps, not just accept a fixed top-k pass" },
    { text: "It removes the need for embeddings" },
    { text: "It only runs on reasoning models" }
  ]}
  correct={1}
  explanation="Control flow is the distinction — multi-step retrieval vs. retrieve-once-then-generate."
  revisit={{ to: "/docs/cutting-edge/agentic-rag", label: "Agentic RAG" }}
/>

<Question
  prompt="Why add process (trajectory) evals alongside outcome evals for agents?"
  options={[
    { text: "Outcome evals are impossible for agents" },
    { text: "Final answers can look good while tool chains are unsafe, wasteful, or wrong — process evals grade the path" },
    { text: "Trajectory evals replace observability" },
    { text: "Regulators require trajectory JSON" }
  ]}
  correct={1}
  explanation="Multi-step systems need multi-step grading; outcome-only lets lucky finals hide broken intermediates."
  revisit={{ to: "/docs/cutting-edge/trajectory-evals", label: "Trajectory evals" }}
/>

<Question
  prompt="Test-time compute in this chapter refers to:"
  options={[
    { text: "Fine-tuning on fresh data every night" },
    { text: "Extra inference work at answer time — e.g. reasoning tokens or verifier passes — bounded by harness budgets" },
    { text: "Compiling the model to C" },
    { text: "Using batch APIs only" }
  ]}
  correct={1}
  explanation="Spend at inference, not training — with explicit caps so one request cannot blow the margin."
  revisit={{ to: "/docs/cutting-edge/efficient-models", label: "Efficient models" }}
/>

<Question
  prompt="The research radar page is intentionally dated because:"
  options={[
    { text: "Research never changes" },
    { text: "Themes and hype move faster than evergreen lessons — the page owns volatile direction while chapters own durable concepts" },
    { text: "Docusaurus requires dates on every page" },
    { text: "Model snapshots cannot include research" }
  ]}
  correct={1}
  explanation="Split volatile facts (radar, model snapshot) from durable engineering (rest of guide)."
  revisit={{ to: "/docs/cutting-edge/research-radar", label: "Research radar" }}
/>

<Question
  prompt="When should you adopt agentic RAG in production per Chapter 17?"
  options={[
    { text: "Always, on day one" },
    { text: "When one-shot RAG already passes faithfulness evals on your set" },
    { text: "When multi-hop tasks need it and component evals show retrieval is the bottleneck" },
    { text: "Only after reading every anchor paper" }
  ]}
  correct={2}
  explanation="Extra loops cost latency and add failure modes — earn them with evidence, not headlines."
  revisit={{ to: "/docs/cutting-edge/agentic-rag", label: "Agentic RAG" }}
/>

<Question
  prompt="Model routing without evals is risky because:"
  options={[
    { text: "Routers are illegal in the EU" },
    { text: "You cannot know win rate and cost per tier on your actual task mix" },
    { text: "Small models cannot be routed" },
    { text: "Evals disable caching" }
  ]}
  correct={1}
  explanation="Routing is an economic and quality tradeoff — only your dataset measures it."
  revisit={{ to: "/docs/cutting-edge/efficient-models", label: "Efficient models" }}
/>

<Question
  prompt="How does Chapter 17 relate to the frontier pattern in Chapter 14?"
  options={[
    { text: "Chapter 17 replaces Chapter 14" },
    { text: "Chapter 14 is a short orientation; Chapter 17 is optional deeper coverage of emerging engineering shifts" },
    { text: "Chapter 14 is only for enterprise readers" },
    { text: "They cover unrelated topics" }
  ]}
  correct={1}
  explanation="Same territory, different depth — optional appendix after the core curriculum."
  revisit={{ to: "/docs/cutting-edge/", label: "Cutting edge overview" }}
/>

</Quiz>

---

→ Next: [Final capstone](../99-capstone.md)
