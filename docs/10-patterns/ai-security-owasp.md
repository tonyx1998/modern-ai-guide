---
id: pattern-ai-security-owasp
title: AI security — the OWASP LLM Top 10
sidebar_position: 12.5
description: The industry-standard checklist of how LLM apps get attacked — the 2025 OWASP LLM Top 10, in plain English, with the structural defense for each.
---

# AI security — the OWASP LLM Top 10

> **In one line:** The **OWASP LLM Top 10** is the industry-standard list of how LLM apps get attacked. Learn all ten — and the rule that ties them together: *the model is never your security boundary.*

:::tip[In plain English]
OWASP is the group behind the famous web-app security "Top 10." They now maintain a **Top 10 for LLM Applications** — the shared checklist that security teams and employers expect you to know. The mistakes are surprisingly mundane: trusting the model's output, giving an agent too much power, putting secrets where the model can blurt them out. Here's all ten in plain words, each with the *structural* fix — a real control in your code, not "please don't hack me."
:::

## The cardinal rule

Every item below is the same idea wearing a different hat: **the LLM is untrusted.** Authorization, validation, and limits run in deterministic code *around* the model — never inside the prompt. If your only defense is telling the model "ignore malicious instructions," you don't have a defense.

## The ten risks (2025 edition)

### LLM01 — Prompt injection

Attacker text overrides your instructions — either directly ("ignore your rules and...") or **indirectly**, hidden inside a web page, PDF, or email your app reads. It's the #1 risk for the second edition running.
**Defense:** treat every model output as untrusted; give tools least privilege; keep system instructions separate from user and retrieved content; require human approval for high-impact actions; filter inputs and outputs.

### LLM02 — Sensitive information disclosure

The model reveals PII, secrets, or another user's data.
**Defense:** scrub PII before it ever reaches the model or the logs; never put secrets or API keys in prompts; filter outputs.

### LLM03 — Supply chain

A poisoned base model, dataset, adapter, or dependency.
**Defense:** vet provenance, pin versions, scan dependencies, prefer reputable sources.

### LLM04 — Data and model poisoning

Tainted training, fine-tune, or **RAG** data quietly changes behavior or plants a backdoor.
**Defense:** source-control and validate your data; isolate and review untrusted documents before they enter the knowledge base.

### LLM05 — Improper output handling

Downstream code trusts model output — which then produces SQL, HTML, or shell commands, leading to injection, XSS, or remote code execution.
**Defense:** treat model output exactly like untrusted user input — encode it, validate it, use parameterized queries, and sandbox any generated code.

### LLM06 — Excessive agency

The agent can simply *do too much* — too many tools, too-broad permissions, too much autonomy.
**Defense:** give the minimum tools; scope each permission tightly; keep a human in the loop for irreversible actions; gate tool calls with deterministic checks.

### LLM07 — System prompt leakage

Secrets or business logic hidden in the system prompt get extracted by users.
**Defense:** assume the system prompt is public. Never put credentials, keys, or access rules in it — enforce those in code.

### LLM08 — Vector and embedding weaknesses

RAG-specific: a poisoned knowledge base, or one user retrieving another tenant's documents.
**Defense:** apply authorization **at retrieval time** (filter by who is asking, not just at generation); isolate tenants; validate ingested content.

### LLM09 — Misinformation

Confident hallucinations, and humans over-trusting them.
**Defense:** ground answers with retrieval and citations; surface uncertainty; require human review for high-stakes outputs; add **faithfulness** evals (see [eval-driven development](./eval-driven-development.md)).

### LLM10 — Unbounded consumption

"Denial of wallet" — expensive or runaway calls drain your budget or take the service down.
**Defense:** rate limits, per-user and per-session token/cost budgets, request timeouts, and hard caps on agent loop iterations.

## Guardrails — defense outside the model

A guardrail is a check that runs in **regular code**, wrapped around the model:

- **Input guardrails** — detect prompt-injection patterns, scrub PII, block disallowed topics.
- **Output guardrails** — validate format, strip PII, run a safety classifier before anything is shown or executed.
- **Tool-call guardrails** — verify arguments and permissions before an action runs.

Open tools: NeMo Guardrails, Guardrails AI, Llama Guard.

## Red-teaming — attack yourself first

Before shipping, deliberately try to break your own app: fire injection payloads, jailbreak attempts, content-filter bypasses, and access-control probes. For anything high-risk, run it in CI. Tools: **promptfoo**, **deepteam**, **garak**.

:::caution[What people get wrong]
- Trying to "prompt away" injection instead of constraining what the model can actually *do*.
- Handing an agent broad tool access "to be helpful."
- Trusting model output in a downstream system (SQL / HTML / shell).
- Putting authorization rules in the system prompt.
- No cost ceiling — one runaway loop empties the account.
:::

**Further reading:** [OWASP GenAI Security Project — LLM Top 10](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). See also [Safety & privacy](./11-safety-privacy.md) and [enterprise governance](../07-enterprise/governance.md).
