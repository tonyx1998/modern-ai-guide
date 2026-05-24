# Modern AI Engineer Guide

A comprehensive, beginner-friendly 2026 guide to how AI systems and LLM-powered applications are actually built, paired with a step-by-step roadmap for getting there from zero. **12 chapters plus an introduction**, written so an absolute beginner can follow along while still being useful to working engineers. *Last reviewed: May 2026.*

> **Live site:** https://tonyx1998.github.io/modern-ai-engineer-guide/

---

## What's in the guide

| # | Chapter | One-line summary |
|---|---------|-----------------|
| - | [Introduction](docs/00-intro.md) | Start here. How to read the guide. |
| 1 | [Foundations](docs/01-foundations/) | How LLM systems actually work: tokens, embeddings, transformers, inference, sampling, streaming, tool use, RAG, agents. |
| 2 | [Roadmap](docs/02-roadmap/) | The progression view: stages from "first API call" to "shipping evaluated production AI." |
| 3 | [Lifecycle](docs/03-lifecycle/) | Every phase an AI project moves through: problem framing → data → prompt/model selection → evals → build → deploy → monitor. |
| 4 | [Tech Stack](docs/04-stack/) | Every major 2026 AI tool decoded: providers, frameworks, vector DBs, eval/obs platforms, gateways, voice infra. |
| 5 | [Solo / Indie](docs/05-solo/) | One-person AI builders, side projects, demos, indie apps. Free tiers and maximum shipping speed. |
| 6 | [Startup AI Team](docs/06-startup/) | 3–30 person teams, real customers, real evals, managed everything. |
| 7 | [Enterprise AI](docs/07-enterprise/) | 100+ engineers, governance, on-prem/private cloud, compliance, MLOps + LLMOps. |
| 8 | [Comparison](docs/08-comparison/) | Solo / startup / enterprise AI workflows side-by-side. |
| 9 | [Decisions](docs/09-decisions/) | The recurring AI-engineering choices: prompt vs RAG vs fine-tune, agent vs chain, open vs closed, build vs buy. |
| 10 | [Production Patterns](docs/10-patterns/) | The patterns that actually ship: streaming, structured output, tool use, agents, evals, caching, cost control. |
| 11 | [Career](docs/11-career/) | AI engineer career path, specializations, 2026 compensation context. |
| 12 | [Glossary](docs/11-glossary.md) | Every term used in the guide, in plain English. |

---

## Who this is for

- **Absolute beginners** — you've used ChatGPT but never written code against an LLM. Start at chapter 1.
- **Software engineers adding AI to a product** — chapters 3, 4, 9, and 10 give you the practical workflow.
- **ML/data scientists pivoting to LLMs** — chapters 1, 4, and 10 cover what's different about LLM systems.
- **Engineering leads sizing an AI initiative** — chapters 6, 7, 8, and 9 cover the org-level concerns.

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
│   ├── 05-solo/                # solo / indie AI workflow
│   ├── 06-startup/             # startup AI workflow
│   ├── 07-enterprise/          # enterprise AI workflow
│   ├── 08-comparison/
│   ├── 09-decisions/
│   ├── 10-patterns/            # production AI patterns
│   ├── 11-career/
│   └── 11-glossary.md
├── src/
│   ├── pages/index.tsx         # Landing redirect → /docs
│   └── css/custom.css          # Global theme overrides
├── static/img/                 # Logos, favicon, social cards
├── docusaurus.config.ts        # Site configuration
├── sidebars.ts                 # Sidebar structure
├── package.json
└── README.md                   # This file
```

---

## License

Content licensed CC BY 4.0. Site code licensed MIT.
