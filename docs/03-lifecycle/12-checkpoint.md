---
id: lifecycle-checkpoint
title: Chapter 3 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test covering all twelve phases of the AI project lifecycle.
---

# Chapter 3 Checkpoint

> **In one line:** If you can answer these without scrolling back, you've got the lifecycle. If not, the link on each question takes you to the right section.

:::tip[How to use this]
This isn't a graded quiz — it's a self-test. Read each question, decide your answer in your head, then read the answer + commentary. If you got it wrong (or right for the wrong reason), follow the link back to the source page. Aim to score yourself at 11+/15. Below that, re-read the chapter; you'll save weeks of confusion later.
:::

## Phase coverage

The 15 questions are spread roughly:

- Framing + data + approach (Phases 1-3): 4 questions
- Evals + build + iterate (Phases 4-6): 4 questions
- Harden + deploy + monitor (Phases 7-9): 4 questions
- Improve + handoffs (Phases 10-11): 3 questions

---

## Q1. Framing: when AI is the wrong tool

A stakeholder says, "we want to add AI to validate email addresses on signup." What does the framing phase say to do?

<details>
<summary>Answer</summary>

**Push back and use a regex or a deterministic validator.** The input is already structured, the rules are well-known, and a wrong answer is catastrophic (locking out real users) at sub-cent cost per call where AI would cost orders of magnitude more.

The framing question that catches this: *"Is there a deterministic alternative?"* If yes, that's almost always the right v0.

→ Revisit: [Problem framing — when AI is the wrong tool](./01-problem-framing.md#when-ai-is-the-wrong-tool)
</details>

---

## Q2. Framing: what to write down before building

Before any code, what three things must exist on a one-pager?

<details>
<summary>Answer</summary>

1. **The user + the problem** in plain English.
2. **5 hand-written ideal outputs** for representative inputs.
3. **The failure cost + the success metric** (numeric, measurable in 90 days).

Plus a dated go/no-go decision with names. If any of these are missing, you're not ready to build — you're ready to do framing first.

→ Revisit: [Problem framing — output of this phase](./01-problem-framing.md#output-of-this-phase)
</details>

---

## Q3. Data: the three data piles

What are the three different data needs in an AI project, and which one do teams most often underestimate?

<details>
<summary>Answer</summary>

1. **Knowledge data** — the docs RAG retrieves from.
2. **Eval data** — graded `(input, expected)` cases used to score the system.
3. **Training data** — `(input, ideal_output)` pairs used to fine-tune (most projects never need this).

Teams most often underestimate the **eval set**. They reach launch with great knowledge data and zero graded eval cases, and then can't tell whether their next change helps or hurts.

→ Revisit: [Data sourcing — three uses of data](./02-data.md#the-three-uses-of-data)
</details>

---

## Q4. Approach: the default order

In what order should you try AI patterns, and what's the rule for moving from one to the next?

<details>
<summary>Answer</summary>

Order: **pure prompting (frontier) → pure prompting (cheap) → add structured output → add RAG → add tools → make it an agent → fine-tune.**

The rule: *stop at the first one that passes your evals*. Don't escalate complexity until evals prove the simpler thing isn't enough. Each step up adds cost, latency, and operational pain.

The most common mistake: jumping straight to "let's build an agent" or "let's fine-tune" before exhausting prompting.

→ Revisit: [Approach — default decision order](./03-approach.md#default-decision-order)
</details>

---

## Q5. Evals: what makes them different from unit tests

Why can't you just write `assert output == "expected_string"` for AI evals?

<details>
<summary>Answer</summary>

Because the system is **stochastic and the surface of correct answers is fuzzy**. Two equally-good answers can be worded entirely differently. Eval `expected` fields are structured *behavioral* checks:

- "Must cite this doc ID."
- "Must contain these phrases."
- "Must NOT contain these phrases."
- "Tone must match this rubric" (scored by an LLM judge).
- "Output must validate against this schema."

Aggregate score across the set tells you whether things are getting better or worse. Per-slice breakdown tells you *for whom*.

→ Revisit: [Eval design — what an eval is](./04-evals.md#what-an-eval-is)
</details>

---

## Q6. Build: what v0 deliberately omits

Name five things v0 should *not* have, and one thing it must have.

<details>
<summary>Answer</summary>

**v0 deliberately omits:**

- Multiple models or routing.
- Multiple personas.
- A framework that hides the provider SDK.
- A vector DB if a flat file works.
- Caching, retries beyond default, pretty UI.

**v0 must have:**

- A logged baseline eval score on real inputs.

Without the baseline you can't tell whether the next month of iteration helped. Without the omissions you're debugging the wrong layer.

→ Revisit: [Build — what v0 looks like](./05-build.md#what-v0-looks-like)
</details>

---

## Q7. Iterate: the one rule

What's the cardinal rule of the iterate-with-evals loop?

<details>
<summary>Answer</summary>

**Change one thing per cycle.** Bundle three changes into one PR, and when the score moves you don't know which change caused it. Three separate eval runs cost a few dollars and save weeks of debugging confusion.

Bonus rule: always look at the *per-slice* breakdown, not just the aggregate. A +3% aggregate that hides a -7% on your biggest tenant is a regression you'd ship without knowing.

→ Revisit: [Iterate — what to avoid](./06-iterate.md#what-to-avoid)
</details>

---

## Q8. Iterate: order of operations

If your eval score is stuck, what should you try *before* fine-tuning?

<details>
<summary>Answer</summary>

In order of cheapness: **prompt wording → few-shot examples → system prompt structure → output schema → retrieval settings → model → decomposition.** Fine-tuning is the *last* resort and almost never the right next step.

Teams that fine-tune early end up locked into a stale model that takes weeks to refresh, when adding three sentences to the prompt would have moved the score the same amount in 20 minutes.

→ Revisit: [Iterate — what to vary, in order of cheapness](./06-iterate.md#what-to-vary-in-order-of-cheapness)
</details>

---

## Q9. Harden: cost cap discipline

Where should the daily $ spend cap live?

<details>
<summary>Answer</summary>

**In both places: at the provider console *and* in your application code.** Belt + suspenders.

The app-side cap catches runaway logic; the provider-side cap catches bugs in your app-side cap. The cost of getting this wrong is a weekend $5K bill that nobody noticed until Monday. Cost of implementing it: one hour.

→ Revisit: [Harden — cost](./07-harden.md#cost)
</details>

---

## Q10. Harden: prompt injection

What's a *structural* defense against prompt injection (not just trusting the model)?

<details>
<summary>Answer</summary>

- **Clearly delimit user/retrieved content from system instructions** (e.g., `<<< >>>` blocks or explicit XML tags).
- **Label untrusted content as untrusted** in the system prompt.
- **Validate outputs** before acting on them, especially for tool calls and security-relevant decisions.
- **Sandbox tools** — the executor enforces what's allowed for that user, not the model.
- **Never put user content in the system slot.**

Relying on the model's safety training alone is insufficient. Architectural defenses are required.

→ Revisit: [Harden — safety](./07-harden.md#safety)
</details>

---

## Q11. Deploy: cohort discipline

Why ship to 5% before 100%?

<details>
<summary>Answer</summary>

Because **about 30% of eventual issues only appear at full traffic** — but the *first* 30% appear in the internal cohort and another 30% appear in the 5% cohort. Ramping in stages lets you catch those at low blast radius.

Plus: rollback at 5% is "0.3% of users saw a bad experience"; rollback at 100% is "everyone did." The flag flip is identical in both cases — the user impact isn't.

→ Revisit: [Deploy — deployment pattern](./08-deploy.md#deployment-pattern)
</details>

---

## Q12. Monitor: cold-eval vs prod-eval divergence

Your cold eval set scores 0.92 but the nightly prod-eval drifts down to 0.78 over a month. What does this tell you?

<details>
<summary>Answer</summary>

Most likely, **the eval set has drifted out of sync with real production traffic** — you've overfit to a stale case mix while real users have shifted topics or styles.

Action: sample fresh production failures, add them as eval cases, and *prune* eval cases that no longer represent real usage. The eval set should roughly track the production distribution. When it doesn't, the eval score lies to you.

Other possibilities to rule out: a provider model update (re-pin to a specific version), a retrieval regression (the embedder cron failed), or a new product feature whose docs aren't indexed yet.

→ Revisit: [Monitor — drift detection](./09-monitor.md#drift-detection) and [Improve — pruning the eval set](./10-improve.md#pruning-the-eval-set)
</details>

---

## Q13. Monitor: what NOT to alert on

Which of these should trigger a page, and which should not?

- (a) Daily spend 1.6× forecast
- (b) Individual user reports a bad answer
- (c) Eval score drops 6% week-over-week
- (d) One call takes 25 seconds
- (e) Schema-validation failures > 2% for 15 minutes
- (f) Free-tier user's thumbs-down

<details>
<summary>Answer</summary>

**Page:** (a), (c), (e) — these are aggregate / threshold signals.

**Do not page:** (b), (d), (f) — these are individual events. Triage them, don't alert.

The rule: alert on *rates and trends*, not on individual events. Pager fatigue from per-call alerts kills real alerts' signal value.

→ Revisit: [Monitor — what *not* to alert on](./09-monitor.md#what-not-to-alert-on)
</details>

---

## Q14. Improve: the compounding loop

What's the single highest-leverage habit for compounding quality over a year?

<details>
<summary>Answer</summary>

**Turn every production failure into an eval case, weekly.** Sample logs → triage real failures → add them with correct `expected` outputs → run iterate loop → ship.

Teams that do this watch their eval set grow from 100 → 800+ cases in year one, with eval scores climbing from ~0.6 to ~0.9. Teams that don't watch quality slowly slide while the cold-eval score stays flat.

The weekly review meeting is the cadence that makes it stick. Without the meeting, "we'll sample logs" turns into "we never did."

→ Revisit: [Improve — the weekly review meeting](./10-improve.md#the-weekly-review-meeting)
</details>

---

## Q15. Handoffs: artifacts vs vibes

Why is "the prompt lives in a Python string in the codebase" considered an anti-pattern?

<details>
<summary>Answer</summary>

Because prompts are **versioned product artifacts**, not implementation details. They deserve:

- A registry entry with a version, owner, model, and changelog.
- PR review when changed.
- An eval-score baseline attached to each version.
- Linkage from monitoring (so you can answer "which prompt version was live when this happened?").

A prompt buried in a code file with no version history means: no reproducibility, no clear ownership, no way to attribute regressions, no way for a domain expert to suggest changes via PR. The prompt registry pattern is one of the highest-ROI process changes you can make.

→ Revisit: [Handoffs — AI engineer owns the prompt registry](./11-handoffs.md#ai-engineer)
</details>

---

## Scoring yourself

| Score | What it means |
|---|---|
| 14-15 | Solid. You can pitch the lifecycle to a teammate confidently. |
| 11-13 | Most of it stuck. Re-read the 2-3 sections you missed. |
| 7-10 | The shape is there but the details are fuzzy. Re-read the chapter in one sitting. |
| < 7 | Re-read the chapter and re-do the checkpoint. The lifecycle is the load-bearing skill for everything that follows. |

## Where to go next

- If you nailed it: continue to [Chapter 4: Tech Stack](/docs/stack) where we map specific 2026 tools to each phase.
- If you want practice: pick a real AI feature you've used (a support bot, a code completion tool, a search assistant) and reverse-engineer which phase choices that team made.
- If a specific phase felt shaky: jump back to it via the [Lifecycle overview](./index.md) — each page stands alone.

:::note[A final thought]
The lifecycle isn't a process to follow once. It's the loop your AI features will live inside for as long as they exist. The teams that ship AI well aren't smarter or better-funded — they've just internalized this loop and built habits around each phase. You now have the map. The next year of practice is what turns it into instinct.
:::

---

→ Back to [Lifecycle overview](./index.md), or continue to [Chapter 4: Tech Stack](/docs/stack).
