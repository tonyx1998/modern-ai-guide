---
id: checklist
title: The 1-page AI-feature decision checklist
sidebar_position: 21
description: One page. Every significant AI feature. Model, RAG y/n, agent y/n, eval bar, kill switch, cost cap, owner.
---

# The 1-page AI-feature decision checklist

> **In one line:** Every significant AI feature gets a 1-page decision doc — model, RAG, agent, eval bar, kill switch, cost cap, owner — and shipping without one is the leading cause of preventable AI incidents.

:::tip[In plain English]
You don't need a 20-page design doc for an AI feature. You need a 1-pager that forces you to make the seven decisions that matter, on paper, before code. Most "we should have caught this" incidents are because nobody answered one of these questions out loud.
:::

## The checklist

Copy this into a doc per feature.

```
AI feature: ___
Owner: ___
Status: ___

1. Model
   - Primary model: ___
   - Fallback model (if any): ___
   - Why this model (eval evidence): ___

2. RAG
   - Using RAG? Yes / No
   - If yes: corpus, chunking, retriever, reranker
   - If no: why not

3. Agent / chain
   - Pattern: chain / single agent / multi-agent
   - If agent: tools, max steps, step budget
   - If chain: list of steps

4. Eval bar
   - Eval set: ___ (link)
   - Min passing score: ___
   - CI gate: yes / no
   - Production sampling: ___ %

5. Kill switch
   - Config flag: ___
   - Deterministic fallback when off: ___

6. Cost cap
   - Per-request ceiling: $___
   - Per-user daily ceiling: $___
   - Monthly budget alert at: $___

7. Owner
   - Engineering owner: ___
   - Product owner: ___
   - On-call escalation: ___
```

That's it. One page. No filler.

## Why each line matters

### 1. Model
The first thing that changes when you optimize for cost or quality. Naming it forces you to know what you've actually deployed. Eval evidence prevents "we picked the new one because it's new."

### 2. RAG
"Do we need RAG?" is a question you should answer explicitly, not by accident. Most teams discover later that they retrofitted RAG when prompting would have done — or worse, didn't use RAG when the model was hallucinating because it didn't know your domain.

### 3. Agent / chain
The most over-claimed architectural decision in AI. Most "agents" are chains. Forcing the choice on paper makes you defend it.

### 4. Eval bar
If you haven't decided what "good enough" means, you've already failed. The eval bar is the single line between shipping and not shipping. Without it, the launch is by vibes.

### 5. Kill switch
Every production AI feature needs an off switch. If a regression slips through, if costs spike, if a customer reports something terrible — you need a way to turn it off in seconds, not deploys. No kill switch = no production AI.

### 6. Cost cap
A runaway agent can spend thousands in an hour. Per-request and per-user limits are not optional. Budget alerts catch the slow drift.

### 7. Owner
"Whose pager rings at 3am for this?" Has a specific name. Not "the AI team." Not "the platform." A person.

## When to skip the checklist

- **Internal-only feature with single-digit users.** Filling out the 1-pager would take longer than the feature.
- **Throwaway prototype.** If it can't make it past demo day, the checklist is overkill.
- **A trivial extension of an existing feature** that inherits the parent's decisions.

For anything customer-facing, anything with cost above $100/month, or anything an exec might ask about: do the checklist.

## How to use the checklist in practice

1. **Owner drafts in 30 minutes.** Not days. The point is to crystallize, not to research.
2. **Review with one peer + the on-call lead.** They poke at the eval bar, the cost cap, the kill switch.
3. **Sign off and link the doc in the feature PR.** Future you needs the context.
4. **Revisit quarterly.** Models change, costs change, owners change. The doc should reflect the present.

## Common mistakes

- **Making the checklist a 20-question gate.** Then nobody fills it out. Keep it 1 page.
- **Filling it out after launch.** Defeats the purpose entirely. The checklist exists to catch issues *before* code.
- **Treating "we'll add evals later" as a valid answer to #4.** No, you won't. The eval set lives in git on day one or you didn't ship a production AI feature — you shipped a demo.
- **Listing "the AI team" as owner.** Owner is a person. A team can't be paged.
- **No fallback when the kill switch fires.** The kill switch should route somewhere — "human review queue," "deterministic baseline," "feature unavailable" — not silently break.

## When this rule doesn't apply

- **Research code that won't see production.** Don't gate research on production checklists.
- **You have a higher-fidelity process** (RFC + ADR + launch readiness review) and the 1-pager would be redundant. Then make sure the RFC asks these 7 questions.
- **Internal automation with no user impact.** Pricing and kill-switch sections may not apply; keep the others.

## How to apply it

For every AI feature shipping in the next quarter:

1. Make a folder: `docs/ai-features/`.
2. One file per feature, using the template above.
3. PR review = doc review.
4. Quarterly: walk the folder. Stale docs get updated or the features get retired.

:::note[Worked example: the 1-pager that caught the silent failure]
A team is about to launch an "AI meeting summarizer." They fill out the 1-pager.

Most of it is uncontroversial. But when they get to **#5 kill switch**, they realize there isn't one — the summarizer runs synchronously inline with meeting recordings. There's no way to turn it off without breaking the meeting upload flow.

Pre-checklist, they would have shipped. Post-checklist, they add 2 days of work: feature flag that routes to "no summary" when off, eval gate in CI, cost cap per user.

Three weeks after launch, the model upgrades and quality drops on a specific meeting type. The eval gate catches it in CI before rollout to all users. Even if it hadn't, the kill switch lets them disable in 30 seconds while they fix.

The pre-launch checklist cost 2 days. The incident that didn't happen would have cost weeks. Always worth it.
:::

---

→ Next: [When to override these rules](./16-overriding.md).
