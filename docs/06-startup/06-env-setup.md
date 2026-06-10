---
id: startup-ai-env-setup
title: Environment Setup
sidebar_position: 7
sidebar_label: 6. Environment Setup
description: Repo structure with a shared prompt library, eval scripts wired into CI, gateway config in code, secrets via Doppler or 1Password.
---

# Environment Setup

> **In one line:** Monorepo with a `prompts/` package, an `evals/` package that runs in CI, gateway config checked into git, and secrets via Doppler or 1Password.

:::tip[In plain English]
The single biggest predictor of an AI startup's iteration speed is whether prompt changes are *first-class code*. If your prompts live in random `.md` files, untracked Notion docs, or hardcoded strings, you'll regress silently and review will be painful. Treat prompts the same way you treat source code — versioned, reviewed, evaluated on every change.
:::

## Repository structure

```
my-ai-startup/
├── apps/
│   ├── web/                  # Next.js app
│   └── worker/               # Python Modal/Render workers (optional)
├── packages/
│   ├── prompts/              # Versioned prompt library (TS or YAML)
│   │   ├── extract-clause.ts
│   │   ├── summarize-doc.ts
│   │   └── system-prompts.ts
│   ├── evals/                # Eval datasets + scripts
│   │   ├── datasets/
│   │   │   ├── extract-clause.jsonl
│   │   │   └── summarize-doc.jsonl
│   │   ├── runners/
│   │   └── ci.ts             # Entry point for CI
│   ├── llm/                  # Gateway client + retry/fallback
│   ├── db/                   # Drizzle schema + pgvector helpers
│   └── ui/                   # Shared shadcn components + AI primitives
├── gateway/
│   └── portkey-config.yaml   # Gateway routing + fallback config
├── .env.example              # Sacred — every env var the app reads
└── turbo.json
```

> **Reading this layout:** `packages/prompts/` is where every prompt lives, in TypeScript or YAML, versioned in git. `packages/evals/` holds the eval datasets and the script CI runs on every PR. `packages/llm/` wraps the gateway client with retry/fallback logic. `gateway/portkey-config.yaml` is checked-in so gateway changes go through code review like any other config.

## The prompt library pattern

Every prompt is a typed function, not a magic string:

```ts
// packages/prompts/extract-clause.ts
import { z } from "zod";

export const ExtractClauseInput = z.object({
  contractText: z.string(),
  clauseType: z.enum(["indemnification", "termination", "ip"]),
});

export const ExtractClauseOutput = z.object({
  found: z.boolean(),
  text: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const extractClausePrompt = (input: z.infer<typeof ExtractClauseInput>) => ({
  system: `You are a legal-clause extractor. Return strict JSON matching the schema.`,
  user: `Extract the ${input.clauseType} clause from:\n\n${input.contractText}`,
  // Pinned model version, structured output, eval set linked
  model: "claude-sonnet-4.5-20251022",
  schema: ExtractClauseOutput,
  evalSuite: "extract-clause-v3",
});
```

Now every caller is type-safe, the prompt is reviewable, model version is pinned (no silent upgrades), and the eval suite name is linked from the prompt itself.

## Eval scripts in CI

Every PR that changes a file under `packages/prompts/` triggers the relevant eval suite. Example GitHub Actions step:

```yaml
- name: Run affected eval suites
  run: bun run evals:affected --base=${{ github.event.pull_request.base.sha }}
  env:
    BRAINTRUST_API_KEY: ${{ secrets.BRAINTRUST_API_KEY }}
    PORTKEY_API_KEY: ${{ secrets.PORTKEY_API_KEY }}
```

Rules:

- Eval runtime budget: **8 minutes** for the affected suite. Faster than that and engineers will actually wait for it; slower and they'll skip.
- A regression on *any* case blocks merge.
- The eval result is posted as a PR comment with a diff vs `main`.
- The full suite (all features) runs nightly against `main`.

## Gateway configuration as code

`gateway/portkey-config.yaml` lives in the repo:

```yaml
strategy:
  mode: fallback
targets:
  - provider: anthropic
    api_key: $ANTHROPIC_API_KEY
    weight: 1.0
  - provider: openai
    api_key: $OPENAI_API_KEY
    weight: 1.0
retry:
  attempts: 2
  on_status: [429, 500, 502, 503, 504]
cache:
  mode: semantic
  ttl: 3600
```

PRs to this file go through review like any other change. No more "someone changed gateway routing in the dashboard and nobody knows when or why."

## Three environments

| Environment | Use                                           | Models               | Eval gating              |
|-------------|-----------------------------------------------|----------------------|--------------------------|
| Local       | Per-dev machine                               | Real provider keys, low-spend personal accounts | Pre-commit subset (~30s) |
| Preview     | Per-PR Vercel deploy                          | Real providers, sandbox tenant data | Full affected suite (8m) |
| Production  | The real thing                                | Pinned model versions | Nightly full suite        |

## Secrets

- **Doppler** or **1Password Developer** for syncing across the team.
- `.env.example` is the contract: every variable the app reads appears with a placeholder.
- Critical AI keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PORTKEY_API_KEY`, `BRAINTRUST_API_KEY`) live in Doppler, synced to Vercel and Modal.
- **Per-engineer personal LLM keys** in dev — separate from prod — so a dev infinite-loop doesn't bill the company $4K.

## The onboarding script

```bash
#!/usr/bin/env bash
set -e
echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash
echo "Installing deps..."
bun install
echo "Pulling secrets from Doppler..."
doppler setup
doppler secrets download --no-file --format env > .env.local
echo "Spinning up local Postgres + pgvector..."
docker-compose up -d
bun run db:migrate && bun run db:seed
echo "Running a smoke eval against your dev keys..."
bun run evals:smoke
echo "Starting dev server..."
bun run dev
```

End of day one bar: app running locally, dev keys configured, smoke eval passed, one merged PR. If a new hire can't hit this, the onboarding script is broken.

:::note[Worked example: a prompt change that should never have shipped]
A 15-person AI startup had prompts as inline template strings inside route handlers. An engineer "cleaned up" a system prompt during refactoring — no eval ran because the file looked like a route file, not a prompt file. Three days later, support tickets spike: the assistant now refuses certain valid queries because the cleaned-up prompt accidentally narrowed its scope.

Root cause: prompts buried inside non-prompt files were invisible to the eval-gating logic. Fix: every prompt moved to `packages/prompts/`. CI rule: changes there trigger evals. Total fix time: one afternoon. Total avoided: weeks of recurring stealth regressions.
:::

:::info[Highlight: dev keys should never be prod keys]
The number-one cause of "we spent $8,000 in an afternoon" is an engineer's local script using the production API key in a runaway loop. Doppler can serve different secrets to `dev` and `prod` environments. Set this up *before* the first new engineer joins.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Storing prompts in a Notion page.** Notion changes aren't reviewed. Notion changes don't trigger evals. By month three the Notion version doesn't match the code. Always: prompts in git.
- **Eval suite that takes 25 minutes.** Nobody waits for it. They merge anyway, eval fails on `main`, the alert is ignored. Aim for under 8 minutes; subset aggressively for the affected suite.
- **Sharing one staging vector index across all preview environments.** Two engineers run different embedding jobs into the same index and start seeing each other's data. Use per-PR or per-engineer namespaces.
- **Letting the gateway config drift in the dashboard.** Three people edit Portkey UI; nobody documents it. Move config to code immediately.
- **No smoke eval in onboarding.** Day one of every new hire should include a successful eval run against their own dev key. If it doesn't work, *that* engineer's onboarding gets stuck on real production incidents two weeks later.
:::

<Quiz id="startup-ai-env-setup-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What does the page identify as the single biggest predictor of an AI startup's iteration speed?"
  options={[
    { text: "How many engineers are dedicated to AI features" },
    { text: "Which frontier model the team has standardized on" },
    { text: "Whether prompt changes are first-class code — versioned, reviewed, and evaluated on every change" },
    { text: "Whether the team uses a monorepo or polyrepo" }
  ]}
  correct={2}
  explanation="Prompts living in random files, Notion docs, or hardcoded strings means silent regressions and painful review; the worked example shows a prompt buried in a route file shipping un-evaled and breaking the assistant for three days. Headcount is the intuitive answer, but the page's comparison teams show discipline beats size — the structure of the prompt workflow is the lever."
/>

<Question
  prompt="Why is the CI eval runtime budget set at 8 minutes?"
  options={[
    { text: "GitHub Actions bills by 10-minute increments" },
    { text: "Faster than that and engineers will actually wait for it; slower and they will skip it" },
    { text: "Eval platforms time out after 10 minutes" },
    { text: "Provider rate limits make longer runs impossible" }
  ]}
  correct={1}
  explanation="The budget is behavioral, not technical: a 25-minute suite gets skipped under deadline pressure, fails on main, and the alert gets ignored — so you subset aggressively to only the affected suites per PR, with the full suite running nightly. The billing and timeout options sound like plausible technical constraints, but the page's reasoning is entirely about engineer behavior."
/>

<Question
  prompt="Why should each engineer have a personal dev LLM key separate from production?"
  options={[
    { text: "So a developer's runaway local loop bills a small capped personal key instead of the company production account" },
    { text: "Providers prohibit key sharing between developers" },
    { text: "Personal keys get faster rate limits than shared ones" },
    { text: "It lets each engineer pick their own favorite model" }
  ]}
  correct={0}
  explanation="The page names the number-one cause of 'we spent $8,000 in an afternoon': a local script in a runaway loop using the production key. Doppler serving different secrets to dev and prod environments contains the blast radius. The rate-limit option is the tempting technical justification, but the motivation is purely financial isolation."
/>

</Quiz>

## What's next

→ Continue to [Development Loop](./07-development.md) where we cover the daily prompt iteration rhythm, PR review for AI changes, and preview deploys.
