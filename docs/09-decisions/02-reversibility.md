---
id: reversibility
title: The reversibility ladder
sidebar_position: 3
description: AI choices vary wildly in how easy they are to unwind. Optimize for living on the high rungs of the ladder.
---

# The reversibility ladder

> **In one line:** AI architectural choices vary by 100x in how hard they are to unwind — design to live on the cheap-to-undo rungs.

:::tip[In plain English]
Changing a prompt takes an afternoon. Swapping your fine-tuned model takes a month and a re-collection of training data. Migrating off your self-hosted vector DB takes a quarter. These are not the same kind of decision. The discipline is making the cheap-to-reverse choices first and only committing to the expensive ones when the cheap ones have provably failed.
:::

## The ladder, cheapest-to-reverse first

| Rung | Change                                         | Typical cost to reverse           |
|------|------------------------------------------------|-----------------------------------|
| 1    | Prompt edit                                    | Minutes                           |
| 2    | Temperature / sampling change                  | Minutes                           |
| 3    | Adding few-shot examples                       | Hours                             |
| 4    | Switching to a sibling model (Sonnet → Opus)   | A day of evals                    |
| 5    | Cross-provider swap (OpenAI → Anthropic)       | 1–2 weeks (prompts re-tune)       |
| 6    | RAG chunking / retrieval strategy change       | Days to weeks (re-index)          |
| 7    | Vector DB swap (pgvector → Pinecone)           | Weeks (data + query rewrite)      |
| 8    | Adding tool use / agent loop                   | Weeks (testing surface explodes)  |
| 9    | Fine-tuning a model                            | Months (data, retraining cadence) |
| 10   | Self-hosting open-weight models                | Months (infra, ops, on-call)      |
| 11   | Public API contract for AI output              | Years (customer integrations)     |

The rule: **prefer to make a change on the lowest rung that could work.**

## How to apply it

When you face an AI problem:

1. **What's the lowest rung that could fix this?**
2. **Try it. Measure with your eval.**
3. **Only climb to the next rung if the lower one failed with evidence.**

Most teams climb too fast. Someone reports "the model is bad at X" — six weeks later, the team is fine-tuning. Often, a prompt edit + 3 few-shot examples would have closed the gap.

## Mistakes by rung

- **Going to fine-tuning when prompting wasn't exhausted.** The single most common climb-too-fast mistake. Fine-tuning is rung 9. Prompting is rung 1.
- **Self-hosting before you've hit a real scale wall.** Rung 10 has a permanent operational cost. Don't pay it for a feature with 500 QPS.
- **Locking in a public-facing JSON schema before the prompt stabilizes.** Once enterprise customers integrate against your `agent_response` shape, the contract is bolted on for years. Treat it like an API.
- **Adding agent loops because a chain "felt limiting."** Agent loops (rung 8) are 10x harder to test and observe than chains. Promote on evidence.

## Designing for reversibility

A few engineering choices keep your future options open:

- **Keep prompts in code, not in a UI vendor.** A prompt locked in Promptlayer's UI is harder to A/B test or fork.
- **Wrap model calls in a thin client.** A `chat(messages, model)` function with one swap point is much cheaper to change than calls scattered across 40 files.
- **Use a model gateway when you're at >2 providers.** The "gateway tax" is worth it once you're routing across Anthropic, OpenAI, and an open model.
- **Version every prompt and every eval set.** Without versioning, you can't tell whether a regression is the new model or the new prompt.
- **Keep evals in git, not in a SaaS vendor.** Eval ownership is the most underrated reversibility lever — if you can re-run your evals against a new model in an afternoon, every model decision is cheap.

## When this rule doesn't apply

- **You've genuinely exhausted lower rungs.** Then climb, with confidence — don't keep tweaking prompts forever.
- **Your differentiator IS on a high rung.** A fine-tuned proprietary model on your proprietary data may be the moat. Pay the rung 9 cost deliberately.
- **Regulatory or contractual constraints force a high rung.** EU data residency may force self-hosting on day one. Skip the lower rungs only because you're forced to.

## Common mistakes

- **Treating "self-hosted" as a status symbol.** Engineers brag about running their own LLMs the way they brag about k8s clusters. Both are usually overkill for the actual workload. Pay rung 10's cost only when rungs 1–9 have failed.
- **Forgetting that today's low rung is tomorrow's high rung.** A prompt is rung 1 — until 200 enterprise customers have memorized the assistant's voice. Then changing it is rung 11. Reversibility decays with adoption.
- **Confusing "we did a hard thing" with "we did the right thing."** Climbing to fine-tuning is impressive engineering. So is shipping the right answer with a prompt. Don't reward the climb; reward the outcome.

:::note[Worked example: the climb-too-fast story]
A team's RAG-powered support bot is missing answers in ~15% of cases. The instinct: "Let's fine-tune."

What the ladder suggests:

1. Rung 1: Tune the system prompt to reference retrieved docs more explicitly. Recovers 5%.
2. Rung 3: Add 6 few-shot examples of "answer covered the question." Recovers another 3%.
3. Rung 6: Switch from naive chunking to semantic chunking with overlap. Recovers another 4%.
4. Rung 6 again: Add a reranker. Recovers another 2%.

Total: 14% recovered, mostly on rungs 1–6, in two weeks. No fine-tuning needed. Most "we need to fine-tune" claims dissolve once you actually walk up the ladder one rung at a time.
:::

<Quiz id="reversibility-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the core rule of the reversibility ladder?"
  options={[
    { text: "Start with fine-tuning since it is the most powerful option" },
    { text: "Prefer to make a change on the lowest rung that could work" },
    { text: "Self-host early to avoid vendor lock-in" },
    { text: "Lock your output schema early so customers can integrate" }
  ]}
  correct={1}
  explanation="Make the cheap-to-reverse change first, and only climb when the lower rung has failed with eval evidence. Locking a public schema early is the opposite move — public API contracts are rung 11, taking years to unwind once customers integrate."
/>

<Question
  prompt="A team's RAG bot misses answers in 15% of cases and they propose fine-tuning immediately. What does the ladder say?"
  options={[
    { text: "Fine-tune, since 15% is a large gap" },
    { text: "Self-host an open model instead" },
    { text: "Switch providers before anything else" },
    { text: "Try prompt edits, few-shot examples, and retrieval changes first" }
  ]}
  correct={3}
  explanation="In the worked example, rungs 1-6 (prompt tuning, few-shot, chunking, reranker) recovered 14 of the 15 points in two weeks. Fine-tuning is rung 9 — months of data collection and retraining — and most 'we need to fine-tune' claims dissolve once you walk up the ladder one rung at a time."
/>

<Question
  prompt="Which engineering choice best preserves reversibility?"
  options={[
    { text: "Keeping evals in git so you can re-run them against any model in an afternoon" },
    { text: "Storing prompts only in a vendor's UI" },
    { text: "Scattering model calls across 40 files" },
    { text: "Freezing a public JSON schema before the prompt stabilizes" }
  ]}
  correct={0}
  explanation="Eval ownership is called the most underrated reversibility lever: if re-running evals against a new model is an afternoon, every model decision becomes cheap. The other three are listed as choices that close off future options — UI-locked prompts, scattered call sites, and prematurely bolted-on contracts."
/>

</Quiz>

---

→ Next: [Team-size heuristic](./03-team-size-heuristic.md).
