---
id: what-would-hurt
title: What would hurt — the pre-mortem
sidebar_position: 18
description: Before shipping an AI feature, do the worst-plausible-failure exercise. The questions that catch the launches that shouldn't have shipped.
---

# What would hurt — the pre-mortem

> **In one line:** Before you ship an AI feature, write down the worst plausible thing it could do, decide if you can live with that outcome, and design the guardrails before launch — not after.

:::tip[In plain English]
Most AI incidents could have been predicted. "What if the model hallucinates a price?" "What if a user uploads a prompt injection?" "What if a tool call deletes the wrong record?" Asking these questions before launch costs a meeting. Discovering them after launch costs a post-mortem, a customer apology tour, and sometimes a contract. Do the pre-mortem.
:::

## The exercise

Sit the team in a room (or doc). For the feature you're about to ship, answer:

1. **What's the worst plausible thing this could do to a user?**
2. **What's the worst plausible thing this could do to the business?** (PR, lost customer, regulator notices.)
3. **What's the worst plausible thing this could cost?** (Runaway cost, infinite loop.)
4. **What's the worst plausible thing an adversary could make it do?** (Prompt injection, jailbreak, data exfiltration.)
5. **What's the worst silent failure?** (Wrong answer that looks confidently right and goes unnoticed.)

For each one, decide: **can we live with this happening? If yes, log and ship. If no, what guardrail prevents it?**

## Categories to walk through

### User harm
- Wrong medical / legal / financial advice.
- Offensive or biased output to vulnerable users.
- Encouraging unsafe actions.
- Misrepresenting capabilities ("I'll call you back" when there's no follow-up).

### Business harm
- Hallucinated pricing, terms, or commitments.
- Output that looks like an official company statement and isn't.
- Confidential info leaked to wrong customer.
- Reputational damage from a screenshot going viral.

### Operational harm
- Infinite agent loops burning cost.
- Single user driving 1000x the average load.
- Tool calls with side effects (delete, refund, send email) firing wrongly.
- Cascading failures (one bad agent step triggers many).

### Adversarial harm
- Prompt injection from user input or from retrieved content.
- Jailbreaks producing harmful or off-policy output.
- Adversary uses the AI to enumerate internal data.
- Adversary uses an agent's tools to take harmful actions.

### Silent quality decay
- A model upgrade subtly worsens a key workflow.
- A retrieval index goes stale and answers degrade.
- A new prompt edit fixes one case and breaks ten others.
- Cost-per-call doubles without anyone noticing.

## Guardrails to consider

Once you've named the failures, the guardrail set is fairly stable:

- **Kill switch.** A config flag that disables the feature or routes to a deterministic fallback.
- **Cost cap.** Per-request and per-user spend ceiling.
- **Step cap.** Agents can't loop more than N times.
- **Human in the loop** for high-stakes actions (refunds, deletions, sending to external recipients).
- **Output validators** that catch obvious failure modes before user sees them.
- **Eval gate in CI** that catches regressions on the categories you care about.
- **Production monitoring** for the silent decay categories.
- **Logging + sampling** so you can review what the system actually did.
- **Prompt injection defenses** for any feature that incorporates untrusted content.

## When this rule doesn't apply

- **Genuinely throwaway internal tools** where the worst case is "engineer notices it's wrong." Pre-mortem is overkill.
- **The feature is gated to a small alpha cohort** where you can fix-as-you-go. Even then, write the worst-case before scaling.
- **Time-critical incident response** where the choice is "ship now with one guardrail or lose the customer." Ship with the kill switch, do the full pre-mortem in the followup.

## Common mistakes

- **Doing the pre-mortem too late.** "Pre-mortem at the launch readiness review" is too late. Do it during design.
- **Hand-waving the adversary case.** "Nobody would think to do that" is the worst sentence in security engineering. Someone will.
- **Pricing the worst case at zero because it's unlikely.** Low-probability × catastrophic-impact is still an unacceptable expected value for some failure modes.
- **Skipping the silent-failure category.** Most AI incidents are silent — wrong answers that look right. These are the hardest to design against and the most likely to bite.
- **Treating the pre-mortem as a compliance ritual.** Filling out a template without actually thinking through the failures defeats the purpose. The point is to *think*, not to document.

## How to apply it

For every AI feature about to ship:

1. Schedule a 60-minute pre-mortem with engineers + PM + a security/legal stakeholder.
2. Walk through the five categories. Write the worst plausible failure in each.
3. For each, decide: accept, mitigate, or kill.
4. Mitigations become launch blockers, not "we'll add it next sprint."
5. Document the accepted risks so future-you can re-evaluate.

The 60 minutes prevents the 60-day fire drill.

:::note[Worked example: the launch that didn't crash]
A team is about to launch an AI feature that drafts customer-facing emails for sales reps. The pre-mortem surfaces:

- **User harm**: low — rep reviews before sending.
- **Business harm**: the AI could draft something inappropriate that the rep sends without reading. Mitigation: a "this is AI-drafted, please review" banner in the UI, plus a hold for emails containing certain keywords ("guarantee," "promise," dollar amounts above a threshold).
- **Operational harm**: rep clicks "generate" repeatedly, runs up cost. Mitigation: cap at 10 generations per email, log usage.
- **Adversarial**: customer email content could contain prompt injection. Mitigation: strip user-controlled content from the system prompt, use it as data only.
- **Silent decay**: model upgrade changes tone. Mitigation: weekly eval of tone-of-voice on 50 sample drafts.

The mitigations take 1 sprint to add. The feature launches with no incidents. Three months in, a customer's email *does* contain a prompt injection that would have produced a problematic draft — the guardrail catches it.

The cost of the pre-mortem: one meeting. The cost of the incident if launched without it: a chunk of a quarter, a customer apology, a possible board update. Always worth it.
:::

<Quiz id="what-would-hurt-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What does the pre-mortem exercise ask the team to do before launch?"
  options={[
    { text: "Estimate how fast the feature can ship" },
    { text: "Confirm the newest model is being used" },
    { text: "Write down the worst plausible failures across user, business, cost, adversary, and silent categories" },
    { text: "List additional features for the roadmap" }
  ]}
  correct={2}
  explanation="For each named failure you then decide: accept, mitigate, or kill — and mitigations become launch blockers, not next-sprint items. The exercise costs a meeting; discovering the same failures after launch costs a post-mortem and a customer apology tour."
/>

<Question
  prompt="Why is the silent-failure category called out as especially dangerous?"
  options={[
    { text: "Because silent failures are the loudest in monitoring" },
    { text: "Because it only affects internal tools" },
    { text: "Because regulators never notice silent failures" },
    { text: "Because most AI incidents are wrong answers that look confidently right and go unnoticed" }
  ]}
  correct={3}
  explanation="Silent decay — a model upgrade subtly worsening a workflow, a stale retrieval index, a prompt edit that fixes one case and breaks ten — is the hardest category to design against and the most likely to bite. Skipping it is a listed common mistake precisely because the other categories feel more dramatic."
/>

<Question
  prompt="When can you legitimately defer the full pre-mortem?"
  options={[
    { text: "Whenever there is a deadline" },
    { text: "Time-critical incident response — ship with a kill switch, do the pre-mortem in the followup" },
    { text: "Any customer-facing feature, if the team feels confident" },
    { text: "Whenever the demo is impressive" }
  ]}
  correct={1}
  explanation="The exceptions are narrow: genuinely throwaway internal tools, small gated alphas, and time-critical incidents where you ship with at least the kill switch and complete the exercise after. Confidence and deadlines are not exceptions — doing the pre-mortem at launch readiness review is already too late; it belongs in design."
/>

</Quiz>

---

→ Next: [When to buy an agent platform](./13-when-to-buy-agent-platform.md).
