---
id: enterprise-ai-too-big
title: When You're "Too Big" — Over-Centralized AI
sidebar_position: 19
sidebar_label: 18. Too Big
description: Pathologies of over-centralized AI platforms — blocked teams, paved roads nobody uses, governance backlogs, platform teams that became gatekeepers.
---

# When You're "Too Big" — Over-Centralized AI

> **In one line:** The failure mode at the far end of enterprise AI maturity isn't no platform — it's an over-centralized platform that's become a gatekeeper, with a months-deep governance backlog, paved roads that don't fit modern workloads, and feature teams quietly going around the central function.

:::tip[In plain English]
The previous page argued you should build a central AI platform once the signals fire. This page is the warning at the other end: if the platform overshoots, it produces the same outcomes as having no platform — except now with the appearance of governance and the political cost of admitting it isn't working.

The symptom: feature teams shipping AI features through workarounds, the platform team shipping abstractions nobody uses, governance backlog measured in months, and the most senior AI engineers privately advising teams how to route around the official process. When you see those signs, the platform has overshot.
:::

## What "too big" actually looks like

A few recurring patterns at over-centralized AI orgs:

- **Paved roads nobody uses.** The platform shipped a beautiful eval framework that requires 80 lines of config; feature teams write a 20-line Python script instead.
- **The platform team as gatekeeper.** Every feature change waits for platform-team review. Lead times measured in weeks.
- **Governance backlog measured in months.** AI Risk Review has a four-month queue; new features wait, or the team finds a way to ship without going through it.
- **A 40-person AI platform team for 30 AI features.** The team's headcount has outpaced the consumption.
- **Mandatory adoption of internal tools that are worse than the public alternative.** Engineers know LangSmith Cloud would be better than the in-house version but are forbidden from using it.
- **Decisions that used to take a week now take a quarter.** Adding a new model to the registry requires three committees.
- **A "shadow platform" emerges.** A small group of engineers builds an internal toolkit that competes with the official platform — usually with more adoption than the official one.

## Why over-centralized platforms ossify

A few mechanisms:

- **Platform teams hire for platform problems.** As the platform team grows, it solves more interesting platform problems — abstractions, frameworks, optimization layers — that don't necessarily match what feature teams need.
- **The CoE / Governance bodies optimize for thoroughness.** Each committee adds checklists; each round of review adds a checkpoint. Nothing is removed.
- **The paved-road requirement becomes religion.** "Use the paved road" was a sensible default; it ossifies into "you may not use anything else, ever."
- **The platform team's OKRs lag the technology.** A platform built around 2024 patterns (single-turn LLM calls) doesn't fit 2026 patterns (agents, multi-modal, on-device); the platform doesn't update fast enough.
- **The cost of saying "no, this exemption is reasonable" is higher than the cost of saying "no, follow the paved road."** So everyone defaults to the latter.

## The Conway's Law trap

Conway's Law shows up brutally in over-centralized AI. The central team's organizational shape (one platform team, one CoE, one governance function) ends up shaping the architecture — which produces:

- One gateway (good).
- One eval framework (good for one type of feature, bad for others).
- One prompt registry pattern (good).
- One agent framework (bad — multiple paradigms make sense).
- One observability stack (good).
- One ingestion pipeline (bad — different domains have different needs).

When the organization is the architecture, the architecture stops fitting the work.

## Symptoms vs. fixes

| Symptom | Likely cause | Common fix |
|---|---|---|
| Paved roads at 30% adoption | Platform shipped what platform wanted to ship, not what feature teams need | Embed rotations + adoption-percentage OKRs + ruthless deprecation of unused paved-road components |
| Governance backlog > 8 weeks | Review committees over-staffed or under-resourced | Re-tier the intake; expand Low-tier auto-approval; staff committees better or reduce their scope |
| Shadow platform exists | Official platform doesn't meet some real need | Absorb the shadow toolkit officially (often the right answer); fight it only if it's a security issue |
| Feature teams quietly choose non-approved tools | The approved tools are genuinely worse | Re-evaluate the approved list; expand or replace |
| Platform team headcount > 25% of AI eng | Built ahead of consumption | Slow platform-team hiring; ship platform features that move adoption |

:::info[Highlight: the right test of an enterprise AI platform]
The right test of an enterprise AI platform isn't "did we ship features?" or "did we satisfy governance?" — it's:

**"Is a new AI feature easier to build *correctly* on the paved road than it would be off it?"**

If the answer is yes, the platform is earning its cost. If the answer is no — if engineers find it easier to route around than to use — the platform has become a tax, regardless of how thoughtful or well-engineered it is.

Test this annually. Survey feature-team AI engineers; measure time-to-first-eval-passing on the paved road vs. off; count how many "exemptions" feature teams have requested. Falling on the wrong side of the test is the signal to prune.
:::

## Worked example: a platform that overshot

A composite (not one company) story:

- **Year 1:** 5 AI features, 2-person platform team. Built Portkey-based gateway, simple eval scaffold, Git-backed prompts. Adoption 100%; feature teams love it.
- **Year 2:** 15 AI features, 6-person platform team. Built a richer SDK, a custom eval DSL, a manifest format. Adoption 90%. Some grumbling about the eval DSL being overkill for classification features.
- **Year 3:** 30 AI features, 14-person platform team. Built a custom multi-agent framework, a custom prompt-templating language, an in-house alternative to LangSmith. AI Risk Review queue grows to 6 weeks. Three feature teams quietly built a smaller internal toolkit that doesn't use the multi-agent framework.
- **Year 4 (the reckoning):** 40 AI features, 22-person platform team. The custom multi-agent framework is 12 months behind what LangGraph/AutoGen can do. The eval DSL has 11 active users. The shadow toolkit is used by 18 teams.

The fix: a year of pruning. The custom multi-agent framework was deprecated in favor of an opinionated LangGraph wrapper. The eval DSL was retired in favor of plain Python + a thin scoring helper. The shadow toolkit was officially blessed and merged with the platform's offerings. The platform team shrank to 12 (through attrition and reassignment).

Adoption went *up* during the pruning. The platform became smaller and more useful at the same time.

## What good pruning looks like

The healthy maintenance discipline:

- **Annual platform audit.** What's used, by how many features, by how many engineers? What's the satisfaction score?
- **Deprecate aggressively.** Any platform component with \&lt;30% adoption after two years should have a high bar to keep. Most should be retired.
- **Survey feature teams quarterly.** "What's the most painful thing about the paved road?" — followed by visible action.
- **Cap platform-team size.** When the platform team is more than ~20% of total AI eng headcount, pause hiring and re-justify each role.
- **Make exemption-grants easy.** A platform that *can't* exempt feature teams for legitimate cases ossifies. Make the exemption process fast (24-hour decision) but documented; the documentation becomes the input for the next platform iteration.

## What changes vs. the previous page

The previous page covered "do you need a platform yet?" This page is the dual: "even if you have a platform, is it earning its cost *today*?" Both questions need quarterly attention.

A platform built right in 2024 can be a millstone by 2026 if no one has pruned it. A platform deferred too long in 2024 can be the right thing in 2026 if it's been built deliberately. The dynamic question is the important one.

## Common mistakes

:::caution[Where people commonly trip up]
- **Treating the platform as permanent infrastructure.** Platforms are products; products have lifecycles; components get deprecated. A platform team that builds and never prunes ends up as the technical debt it was supposed to prevent.
- **Refusing to acknowledge the shadow platform.** Shadow platforms exist because the official platform isn't meeting some real need. Suppressing the shadow without fixing the gap drives it underground; absorbing it usually improves both.
- **Conflating governance with platform.** The Responsible AI / Risk function and the AI Platform team are different things. When one team owns both, governance and platform decisions get bundled and neither gets the focused review it needs.
- **Mandating tools that engineers know are worse.** Engineers can tolerate "use the paved road, it's slightly worse but it's standardized." They can't tolerate "use the paved road, it's much worse, and you may not switch." The latter destroys trust in the platform team's judgment everywhere.
- **Hiring platform engineers ahead of consumption.** A 20-person platform team building for 5 AI features ships abstractions nobody asked for. Headcount lags adoption, not the other way around.
- **Not surveying feature teams.** A platform team that doesn't ask its users what's painful builds for itself. Quarterly surveys with visible follow-through is the cheapest health check available.
- **Treating "the answer is more process" as the default.** When something goes wrong, the instinct is to add a checkpoint. After enough of those, the process is what's wrong. Periodically prune checkpoints with the same rigor with which you add them.
:::

## What's next

→ Continue to [Chapter checkpoint](./19-checkpoint.md) to self-test the core ideas in this chapter.
