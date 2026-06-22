---
id: prompt-management
title: Prompt management
sidebar_position: 7
description: PromptLayer, Braintrust prompts, Vellum, Pezzo, Latitude, Helicone Prompts, plus git-backed self-hosted — versioning, testing, and deploying prompts as first-class artifacts.
---

# Prompt management

> **In one line:** Tools that treat prompts like code (or like content) — versioning, diffs, A/B tests, environment-specific deploys, and a non-engineer-friendly UI for the people who actually write the prompts.

:::tip[In plain English]
Once you have more than a handful of prompts, two problems show up. First, prompts change *often* — a small wording tweak can move quality 10%, and you want to compare versions, not lose history. Second, your best prompt engineer is often not the person who can push code to prod. Prompt management tools solve both: prompts get IDs, versions, environments, and an editor your PM can use. The big philosophical split is **git-for-prompts** ("prompts are code, store them in your repo") vs. **registry-as-product** ("prompts are content, fetch them by ID at runtime").
:::

## The major options (2026)

| Tool | Model | Hosted? | Sync to git? | Eval integrated | Best for |
|------|-------|---------|--------------|----------------|---------|
| **PromptLayer** | Registry | yes | yes (one-way) | yes | Non-engineering prompt authors |
| **Braintrust Prompts** | Registry | yes | yes | yes (first-class) | Eval-driven teams |
| **Vellum** | Registry + workflows | yes | partial | yes | Enterprise; deploy prompts as endpoints |
| **Latitude** | Registry | hosted + OSS | yes | yes | Open-source-leaning teams |
| **Pezzo** | Registry | OSS + hosted | yes | basic | Self-hosters |
| **Helicone Prompts** | Registry on top of obs | yes | partial | yes | Already using Helicone |
| **LangSmith Hub** | Registry | yes | partial | yes | LangChain shops |
| **Agenta** | Registry + playground | OSS + hosted | yes | yes | OSS prompt IDE |
| **git + Markdown / YAML** | Code | self-hosted | native | via Promptfoo/DeepEval | Engineering teams who want zero new infra |

## The split: git-for-prompts vs registry-as-product

**Git-for-prompts** treats every prompt as a file in your repo. Edits go through PRs. CI runs evals on the diff. Deploys ship the new prompt with the next release. You get the full power of git (blame, bisect, branches) and zero new infrastructure. The trade-off: prompt authors need to know git, and you re-deploy to ship a wording change.

**Registry-as-product** treats prompts as data. Authors edit in a web UI, hit "publish," and your app fetches `prompts.get("greeting", env="prod")` at runtime. Iteration is instant; no deploy. The trade-off: prompts now live outside your repo (harder to review in PRs), and you've added a runtime dependency.

A common 2026 pattern: **git for the canonical source, registry for the runtime fetch.** PromptLayer, Braintrust, and Latitude all support syncing from a git repo, so engineers PR the prompt and product folks ship the published version — best of both worlds.

## Default pick for most teams

**Git + Markdown / YAML files** plus **Promptfoo** for evals in CI. Zero new vendors, zero new bills, prompts diff like code, and your engineering process already handles versioning. Use this until you have a non-engineering prompt author who needs an editor.

When that day comes: **Braintrust Prompts** (if you're already evaluating with Braintrust) or **PromptLayer** (if you're not). Both give you a registry, a UI, and decent eval hooks without the enterprise weight of Vellum.

## When to deviate

- **Heavy non-engineering authors** (a content team owns the system prompt): **PromptLayer**, **Latitude**, **Vellum** — pick the editor your authors actually like.
- **Eval-first workflow** where every prompt change must clear an eval threshold: **Braintrust Prompts** or **LangSmith Hub**.
- **OSS only / on-prem required**: **Pezzo**, **Latitude OSS**, **Agenta**, or roll your own with **git + Promptfoo**.
- **Already on LangChain**: **LangSmith Hub** is the integrated pick.
- **Enterprise procurement / SOC2 / SLA**: **Vellum** or **PromptLayer Enterprise**.

## Minimum integration

**Git-based — a prompt is a YAML file:**

```yaml
# prompts/summarize.yaml
id: summarize-v3
model: claude-sonnet-4-6
temperature: 0.3
system: |
  You are a concise technical writer. Summarize the provided document
  in exactly three bullet points, each under 20 words.
user: "{{document}}"
```

```python
# At runtime
from pathlib import Path
import yaml
prompt = yaml.safe_load(Path("prompts/summarize.yaml").read_text())
response = client.messages.create(
    model=prompt["model"],
    messages=[
        {"role": "user", "content": prompt["user"].replace("{{document}}", doc)},
    ],
    system=prompt["system"],
)
```

**Registry-based — fetch from PromptLayer:**

```python
import promptlayer
template = promptlayer.templates.get("summarize", label="prod")
response = client.messages.create(
    model=template["model"],
    messages=template["messages"],
)
```

The registry version means you can edit "summarize" in the UI and it's live in seconds — no deploy.

## What a good prompt-management workflow looks like

- Every prompt has a stable ID and a version number.
- Diffs between versions are visible side-by-side, not as a wall of text.
- Variables are explicit and validated (`{{document}}` must be a string of length > 0).
- Environments (`dev`, `staging`, `prod`) let you ship to a slice first.
- Each version is tied to its eval scores — you can see "v3 scored 87, v4 scored 91" before you flip the switch.
- Rollback is a single click.
- The prompt body is searchable across versions for "where did we last say 'be concise'?"

## Pricing & cost notes

| Tool | Free tier | Paid starts at |
|------|----------|----------------|
| PromptLayer | yes (small) | ~$50/mo |
| Braintrust | yes (Hobby) | usage-based |
| Vellum | trial only | enterprise $$ |
| Latitude | OSS free / hosted $20/mo | usage |
| Pezzo | OSS free | self-host |
| Helicone Prompts | yes (with Helicone free) | $25/mo |
| git + files | free | free |

Cost is usually small relative to the API spend — measured in tens to low hundreds per month. The thing you're actually buying is iteration speed for prompt authors.

## Pitfalls

- **Splitting truth between code and the registry.** A prompt edited in the registry that nobody reflects back into git becomes the "real" version no engineer knows about. Pick one source of truth.
- **No environments.** Editing the prod prompt directly is the AI equivalent of pushing to main on Friday afternoon.
- **No evals tied to the change.** A wording tweak that drops quality 8% should fail CI, not get noticed two weeks later.
- **Storing API keys in the prompt template.** Don't. Templates are content; secrets live in env vars.
- **Templating with naive `str.replace`.** Variables containing the literal `{{` or user-supplied formatting tokens will bite you. Use a real templater (Jinja, Handlebars, Mustache).
- **Hot-reloading prompts in a long-running agent mid-conversation.** The model's tool-use state is tied to the prompt it saw; swap it mid-flight and tool-call IDs stop matching. Snapshot the prompt for the life of a session.
- **No audit log.** "Who changed the system prompt at 2am?" is a real incident response question. The registry should answer it.

---

→ Next: [Programmatic prompt optimization](./prompt-optimization.md)
