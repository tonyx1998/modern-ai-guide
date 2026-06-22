---
id: overriding
title: When to override these rules and just ship
sidebar_position: 22
description: Frameworks are heuristics, not laws. The situations where intuition beats process, and how to recognize them honestly.
---

# When to override these rules and just ship

> **In one line:** Every rule in this chapter is a default; experienced engineers know when to override — and the discipline is being honest about *why* you're overriding instead of letting "I have intuition" become an excuse.

:::tip[In plain English]
You will face situations where the framework says one thing and your gut says another. Sometimes your gut is right. Sometimes you're rationalizing. The skill is telling the difference. A justified override has a real reason, articulated in words your team accepts, with an explicit risk you're taking. A lazy override is "I just felt like it" dressed up as expertise.
:::

## Frameworks are heuristics, not laws

Every rule in this chapter is a *default* — the right answer in 80% of cases. The remaining 20% is where judgment lives. Sometimes:

- **Use a non-boring model** because evals show it's genuinely a game-changer for your task.
- **Build instead of buy** because the vendor is genuinely missing a critical feature.
- **Multi-agent over single agent** because your problem really is decomposable and you have the evidence.
- **Skip the checklist** because the situation is genuinely urgent and the alternative is missing a customer commitment.

These are real cases. They happen. The discipline is being honest about whether the case really is what you think it is.

## What makes an override legitimate

A legitimate override has all of these:

1. **A specific reason** that connects to your situation, not "best practices say."
2. **Evidence**, where evidence is available (evals, cost numbers, user reports).
3. **Articulation** — you can defend it in writing in 2 sentences.
4. **Stakeholder buy-in** from the people who'd be affected if it goes wrong.
5. **Awareness of the risk** you're taking, written down so future-you can re-evaluate.

If you're missing any of these, you're probably rationalizing.

## What makes an override lazy

The override that doesn't survive scrutiny:

- "I have intuition." (Not a reason.)
- "It feels right." (Same as above with extra syllables.)
- "Everyone else is doing it." (Reverse boring-tech instinct.)
- "We've already started." (Sunk cost.)
- "It would be more fun." (Honest, but not a reason.)
- "The senior engineer wants it." (Argument from authority, not evidence.)

Most failed AI projects have at least one of these as a hidden driver.

## The cases where intuition often beats process

Some situations genuinely reward intuition over framework:

- **Speed of response in a competitive market.** If a competitor ships an AI feature and you have 6 weeks, the full pre-mortem may not fit. Ship with a kill switch, do the pre-mortem in week 2.
- **Personal experience with a specific failure mode.** If you've debugged 10 RAG retrieval issues, your instinct on chunking is better than a framework's general advice.
- **Cross-domain pattern recognition.** A senior engineer who's seen 30 architectures may immediately see that this one is wrong, in a way they can't fully articulate. Trust that — but write down the result.
- **Team dynamics.** Sometimes the right framework answer is the wrong team answer, because the team needs to learn by doing rather than be told.

## The cases where the framework usually wins

- **Architectural decisions** where the framework crystallizes years of others' mistakes.
- **Tooling decisions** where personal preference would otherwise drive the choice.
- **Build vs buy** where engineer enthusiasm always biases toward build.
- **Anything involving fine-tuning, self-hosting, or multi-agent.** These are the high-rung decisions where overrides are usually wrong.

## How to apply this

When you're tempted to override:

1. **Write the override out in 3 sentences.** If you can't, you don't understand it well enough.
2. **Imagine your most skeptical teammate.** Could they accept your reasoning?
3. **Identify the risk you're taking.** What happens if you're wrong?
4. **Set a re-evaluation trigger.** "If we hit X by date Y, we revisit."
5. **Log it.** Future-you needs the context to know whether to keep or reverse.

The override that survives this exercise is usually a good one. The one that doesn't is usually rationalizing.

## When to skip the rules entirely

Yes, sometimes. Situations:

- **Genuinely urgent incident** where stopping to apply frameworks would let the situation get worse. Fix first, document later.
- **Throwaway prototype** that won't see production. Frameworks are for production decisions.
- **Personal learning** — sometimes you should adopt the "wrong" tool just to learn it. Do it on side projects, not on customer features.

## Common mistakes

- **Calling every deviation an override instead of a mistake.** Sometimes "we deviated from the framework" is just "we got it wrong and won't admit it." Use the right label.
- **Overriding without writing it down.** Then future engineers don't know the reasoning and reverse the decision badly.
- **Treating one team's successful override as a license.** "OtherCo overrode the boring-AI rule and it worked for them" doesn't mean it'll work for you. Their context is different.
- **Forgetting to revisit.** Overrides should be tagged with re-evaluation triggers. Without them, they calcify and become "how we do things."
- **Overriding before you've internalized the rule.** New engineers reach for overrides on day one. Use the defaults for at least a year of real decisions before claiming the situation is special.

## When this rule doesn't apply

The override-the-rule rule is itself a rule, and it has the same exceptions:

- **In genuine emergencies, just do what needs doing.** Process is for non-emergencies.
- **When the rule is genuinely wrong for your context.** Frameworks have failure modes. The skill is recognizing them.
- **When you have meta-rules from your own experience** that override the chapter's defaults. You're allowed to disagree with this chapter; just be ready to defend it.

## The meta-skill: knowing when to refuse complexity

If there's one thing to remember from this chapter, it's that **most failed AI projects fail because they took on too much, not too little**. The single biggest predictor of AI engineering success isn't intelligence or model selection or framework choice — it's *restraint*. Building the smallest thing that could possibly work, shipping it behind a kill switch, measuring what users actually do, and only then deciding what to build next.

The frameworks in this chapter all point in the same direction: **simpler is usually right; commit to complexity only when the simple version has provably failed.** Boring models. Cheap rungs first. Chains before agents. Buy before build. Prompts before fine-tunes. Single provider before multi. Sync before agent runtime.

The override skill is knowing when the simple version *won't* work — and being able to defend that claim with evidence, not vibes.

:::note[Worked example: a legitimate override]
A team chooses to self-host a fine-tuned Llama model on day 60 of a new feature, against the "default to hosted closed" rule.

Their reasoning, in writing:
- The feature is high-volume classification (~5M calls/day) — closed API cost would be $40k/month.
- They already have an internal eval set showing fine-tuned Llama matches GPT-4.1 on this task.
- They have a platform engineer who's built ML serving before — not theoretical capacity.
- The task is narrow and stable; retraining cadence is acceptable.
- Risk: ops complexity. Mitigation: hosted-open (Together) as the first deployment, self-hosted only after 3 months of validation.
- Re-evaluation trigger: if cost savings < $20k/month or quality drops below 95% of GPT-4.1, revert.

This is a justified override. Compare to: "We want to self-host because it'd be cool" — same final architecture, completely different decision quality.

The framework's value isn't in the answer; it's in forcing you to defend the override in words your team accepts. If you can't write those three sentences, you're probably wrong.
:::

<Quiz id="overriding-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What makes an override of the chapter's rules legitimate?"
  options={[
    { text: "A senior engineer's strong intuition" },
    { text: "Everyone else in the industry is doing it" },
    { text: "A specific reason, evidence, written articulation, stakeholder buy-in, and awareness of the risk" },
    { text: "The team has already started down that path" }
  ]}
  correct={2}
  explanation="A legitimate override has all five elements; missing any usually means you are rationalizing. The distractors are the listed lazy overrides: 'I have intuition' is not a reason, popularity is the reverse boring-tech instinct, and 'we've already started' is sunk cost."
/>

<Question
  prompt="Where does the framework usually BEAT intuition?"
  options={[
    { text: "High-rung decisions like fine-tuning, self-hosting, and multi-agent" },
    { text: "A competitive sprint with a 6-week deadline" },
    { text: "A senior engineer's chunking instinct after debugging 10 RAG issues" },
    { text: "Situations where the team needs to learn by doing" }
  ]}
  correct={0}
  explanation="High-rung, expensive-to-reverse decisions are where overrides are usually wrong — the framework crystallizes years of other teams' mistakes. The other three are the cases where intuition often legitimately wins: speed under competition, hard-won personal experience with a failure mode, and team dynamics."
/>

<Question
  prompt="What is the meta-skill this chapter says predicts AI engineering success?"
  options={[
    { text: "Picking the most capable model" },
    { text: "Building the most complete system up front" },
    { text: "Adopting agents before competitors do" },
    { text: "Restraint — ship the smallest thing that could work, and add complexity only when the simple version provably failed" }
  ]}
  correct={3}
  explanation="Most failed AI projects fail because they took on too much, not too little. Every framework in the chapter points the same way: boring models, cheap rungs first, chains before agents, buy before build. The override skill is proving — with evidence, not vibes — that the simple version won't work."
/>

</Quiz>

---

→ Next: [Chapter 13 checkpoint](./17-checkpoint.md).
