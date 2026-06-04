# Modern AI Engineer Guide

A comprehensive, beginner-friendly 2026 guide to how AI systems and LLM-powered applications are actually built, paired with a step-by-step roadmap for getting there from zero. **17 chapters in 7 parts**, written so a complete beginner can read it front to back and finish job-ready — while still being useful to working engineers. *Last reviewed: May 2026.*

> **Live site:** https://tonyx1998.github.io/modern-ai-engineer-guide/

---

## What's in the guide

The guide is organized into seven parts. Read top to bottom and you go from "what is a token?" to designing evals, shipping safely, fine-tuning, building voice agents, and reading the architectures of real products.

| # | Chapter | One-line summary |
|---|---------|-----------------|
| - | [Introduction](docs/00-intro.md) | Start here. How to read the guide. |
| **A** | **Fundamentals** | |
| 1 | [Foundations](docs/01-foundations/) | How LLM systems actually work: tokens, embeddings, transformers, inference, sampling, streaming, tool use, RAG, agents. |
| 2 | [Roadmap](docs/02-roadmap/) | The progression view: stages from "first API call" to "shipping evaluated production AI." |
| **B** | **Building & shipping** | |
| 3 | [Lifecycle](docs/03-lifecycle/) | Every phase an AI project moves through: problem framing → data → evals → build → deploy → monitor → improve. |
| 4 | [Tech Stack](docs/04-stack/) | Every major 2026 AI tool decoded: providers, frameworks, vector DBs, eval/obs platforms, gateways, voice infra. |
| **C** | **Core disciplines** | |
| 5 | [Evaluation & Measurement](docs/13-evaluation/) | The #1 AI-engineering skill: eval types, datasets, metrics, LLM-as-judge, human eval, CI gating, production evals. |
| 6 | [Responsible & Safe AI](docs/14-safety/) | Threat modeling, prompt injection & jailbreak defense, guardrails, hallucination control, bias/fairness, privacy, red-teaming, governance. |
| **D** | **Specializations** | |
| 7 | [Fine-tuning & Customization](docs/15-fine-tuning/) | When to fine-tune, data prep, SFT, LoRA/QLoRA, preference tuning (RLHF/DPO), distillation, serving. |
| 8 | [Multimodal & Voice AI](docs/16-multimodal/) | Vision, image generation, audio/speech, realtime voice agents, video, multimodal retrieval, and evaluating non-text outputs. |
| **E** | **Workflows by scale** | |
| 9 | [Solo / Indie](docs/05-solo/) | One-person AI builders, side projects, demos, indie apps. Free tiers and maximum shipping speed. |
| 10 | [Startup AI Team](docs/06-startup/) | 3–30 person teams, real customers, real evals, managed everything. |
| 11 | [Enterprise AI](docs/07-enterprise/) | 100+ engineers, governance, on-prem/private cloud, compliance, MLOps + LLMOps. |
| 12 | [Comparison](docs/08-comparison/) | Solo / startup / enterprise AI workflows side-by-side. |
| **F** | **Judgment & patterns** | |
| 13 | [Decisions](docs/09-decisions/) | The recurring AI-engineering choices: prompt vs RAG vs fine-tune, agent vs chain, open vs closed, build vs buy. |
| 14 | [Production Patterns](docs/10-patterns/) | The patterns that actually ship: streaming, structured output, tool use, agents, evals, caching, cost control, LLMOps. |
| **G** | **Career & reference** | |
| 15 | [Career](docs/11-career/) | AI engineer career path, specializations, 2026 compensation context. |
| 16 | [Case Studies](docs/12-case-studies/) | Eight shipped 2026 architectures reconstructed from public sources — Cursor, Claude Code, Perplexity, Sierra, Harvey, Glean, Notion AI, Duolingo Max. |
| 17 | [Glossary](docs/11-glossary.md) | Every term used in the guide, in plain English. |

---

## Who this is for

- **Absolute beginners** — you've used ChatGPT but never written code against an LLM. Start at chapter 1 and read straight through.
- **Software engineers adding AI to a product** — chapters 3, 4, 5, and 14 give you the practical build-and-measure workflow.
- **ML/data scientists pivoting to LLMs** — chapters 1, 4, 7, and 14 cover what's different about LLM systems.
- **Engineering leads sizing an AI initiative** — chapters 6, 11, 12, and 13 cover the org-level and decision concerns.

---

## Running the site locally

The website is built with [Docusaurus](https://docusaurus.io). You need Node.js 20+ installed.

```bash
# Install dependencies (one-time)
npm install

# Start the dev server at http://localhost:3000
npm run start

# Build a production bundle (output in build/)
npm run build

# Serve the production build locally
npm run serve
```

The dev server hot-reloads as you edit any file in `docs/`, `src/`, or the config.

---

## Repository layout

```
modern-ai-engineer-guide/
├── docs/                       # The guide, split into focused per-topic pages
│   ├── 00-intro.md
│   ├── 01-foundations/         # How LLM systems work
│   ├── 02-roadmap/             # Learning progression from zero
│   ├── 03-lifecycle/           # AI project lifecycle phases
│   ├── 04-stack/               # 2026 AI tooling
│   ├── 13-evaluation/          # Evaluation & measurement (chapter 5)
│   ├── 14-safety/              # Responsible & safe AI (chapter 6)
│   ├── 15-fine-tuning/         # Fine-tuning & customization (chapter 7)
│   ├── 16-multimodal/          # Multimodal & voice AI (chapter 8)
│   ├── 05-solo/                # solo / indie AI workflow (chapter 9)
│   ├── 06-startup/             # startup AI workflow (chapter 10)
│   ├── 07-enterprise/          # enterprise AI workflow (chapter 11)
│   ├── 08-comparison/          # (chapter 12)
│   ├── 09-decisions/           # (chapter 13)
│   ├── 10-patterns/            # production AI patterns (chapter 14)
│   ├── 11-career/              # (chapter 15)
│   ├── 12-case-studies/        # eight shipped 2026 architectures (chapter 16)
│   └── 11-glossary.md          # (chapter 17)
├── src/
│   ├── pages/index.tsx         # Landing page
│   ├── components/             # Quiz, CodeChallenge, FeedbackWidget
│   ├── theme/                  # MDX component registry + swizzled Mermaid
│   └── css/                    # Global theme + landing styles
├── static/img/                 # Logos, favicon, social cards
├── docusaurus.config.ts        # Site configuration
├── sidebars.ts                 # Sidebar structure (chapter order lives here)
├── package.json
└── README.md                   # This file
```

> Note: directory number prefixes reflect creation order, not chapter order. The reading order (and chapter numbers) is defined in `sidebars.ts`; URLs are slug-based, so the on-disk prefixes don't affect them.

---

## License

Content licensed CC BY 4.0. Site code licensed MIT.
