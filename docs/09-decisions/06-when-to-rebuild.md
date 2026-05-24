---
id: when-to-rebuild
title: When to rebuild an AI feature vs incrementally improve
sidebar_position: 12
description: Signals that an AI feature has hit a structural ceiling and needs a rebuild — vs the more common case where one more prompt tweak would work.
---

# When to rebuild an AI feature vs incrementally improve

> **In one line:** Rebuild only when the structure of the feature (not the prompt, not the model) is the ceiling — and prepare for the rebuild to take 3x longer than you estimate.

:::tip[In plain English]
Engineers love rebuilds. "Let's tear this down and do it right" feels like progress. Most of the time, the rebuild solves problems that one more iteration on the current system would have solved cheaper. Real rebuild triggers are structural: the wrong architecture (agent where a chain should be), wrong retrieval shape, an eval ceiling no amount of prompt-tweaking can lift. Everything else, iterate.
:::

## When iteration is enough (the default)

- The eval gap is small (under 10%) and prompt tweaks have moved it in the past.
- The architecture matches the task shape (chain for fixed workflow, agent for variable).
- The model has been swapped once recently and showed improvement.
- The retrieval system finds the right docs most of the time.
- The bug reports cluster around specific input types, not "general quality."

In this regime: tighten the prompt, add few-shot examples for the failing class, expand evals, swap to a better model if available. Each move is hours to days.

## When a rebuild is the right call

Real rebuild signals:

- **The architecture is wrong for the task.** You built an agent for what's really a fixed-shape workflow, or a chain for what's really an open-ended task. No amount of tuning fixes the shape.
- **The eval ceiling is structural.** You've tried multiple models, multiple prompt variants, retrieval changes — quality has plateaued well below your bar. The current design can't go higher.
- **The retrieval corpus or chunking is fundamentally wrong.** You're indexing the wrong things, or the chunks don't carry the right context. A new chunking strategy or a new corpus is a rebuild.
- **You're paying 10x more than necessary** because the design forces frontier-model calls where a small-model + RAG would do.
- **The system can't be observed.** Bugs surface and the team can't tell where in the loop they came from. If the system is unobservable, it's unmaintainable.
- **The original design assumed a model capability that's now outdated.** A 2024 design that worked around poor tool use is wrong for 2026's tool-use-native models.

## How to tell the difference

Ask:

1. **Has the eval plateaued, or are individual changes still moving it?** Plateau = rebuild signal. Movement = keep iterating.
2. **Are bugs concentrated in one part of the design?** Localized bugs = patch. System-wide quality problem = rebuild candidate.
3. **Would the rebuild change the architecture, or just the prompts?** "Same architecture, new prompts" isn't a rebuild — that's a tuning session.
4. **What does the rebuild cost vs the next 6 months of iteration?** If iteration is making progress, finish the iteration before the rebuild.

## The rebuild trap

Engineers consistently underestimate how much "implicit knowledge" lives in a working AI feature:

- The 200 small prompt edits that fix specific edge cases.
- The retrieval filters that work around messy data.
- The post-processing that catches malformed outputs.
- The eval examples that came from production bugs.

A rebuild loses all of this. You'll re-discover the same edge cases for months. Estimate the rebuild as **3x your gut estimate** and you're in the right zone.

## How to actually do the rebuild (when warranted)

- **Build it alongside.** Don't tear down the old system first.
- **Use a strangler ramp.** 1% → 5% → 25% → 100% of traffic, with shadow comparison.
- **Port the eval set first.** The new system must match or beat the old on the same evals.
- **Migrate the production logs.** The old bugs are training data for the new system.
- **Kill switch at every step.** If the new system regresses, instant rollback to the old.

## When this rule doesn't apply

- **The old system is genuinely abandoned and unowned.** Then it's not a rebuild — it's a fresh build of a deprecated thing.
- **The architecture choice is locking out a critical new capability** (e.g., your chain prevents tool use that's now required). Rebuild for capability, not aesthetics.
- **Compliance or security requires the rebuild.** A regulator-driven rebuild is non-negotiable, even when it's expensive.

## Common mistakes

- **Rebuilding because the code is ugly.** Ugly code is real, but it's a refactor, not a rebuild. Refactor in place.
- **Rebuilding because a new framework dropped.** "LangGraph released a new agent runtime" is not a rebuild trigger. Your existing system works.
- **Rebuilding because the original engineer left.** The new engineer wants to understand by rewriting. Make them debug first. The rebuild instinct usually fades after a week of actually using the existing system.
- **Big-bang rebuilds.** "Freeze features for 3 months, ship the new system in one cutover" is the classic disaster. The strangler ramp is the only safe pattern.

:::note[Worked example: the rebuild that worked]
A team's customer-support AI started as a chain: classify intent → retrieve → answer. After a year, it handled 60% of tickets — but the long tail kept growing. Adding more intents made the classifier worse. Adding more docs to retrieval made answers more confused.

The eval plateaued at 60% for four months despite weekly tweaks. Multiple model upgrades didn't move it. Production logs showed the problem: real tickets crossed multiple intents and required multi-step reasoning the chain couldn't express.

They rebuilt as a single-agent system with focused tools (search docs, query order, look up policy, escalate). They ran it shadow-mode for 6 weeks, ported every eval, watched it match the chain on simple tickets and beat it on complex ones. Then ramped from 5% to 100% over 4 weeks.

Final state: 85% resolution rate, 30% lower cost (because most requests now skip retrieval). Total time: 5 months — 2x their original 10-week estimate. The rebuild was justified, but they paid the "implicit knowledge" tax anyway.

The lesson: even *correct* rebuilds take longer than you think. Make sure the structural reason is real before you start.
:::

---

→ Next: [Single vs multi-provider](./07-single-vs-multi-provider.md).
