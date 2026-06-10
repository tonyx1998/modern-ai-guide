---
id: single-vs-multi-provider
title: Single vs multi-provider
sidebar_position: 13
description: The pros and cons of provider lock-in, the gateway tax, and when multi-provider is overkill.
---

# Single vs multi-provider

> **In one line:** Start with one provider; add a second for resilience or cost only when the operational tax of two is genuinely smaller than the cost of one.

:::tip[In plain English]
Multi-provider sounds prudent ("we won't be locked in!") and is mostly a tax you pay every day for a benefit you use rarely. One provider is simpler, faster to iterate, easier to debug. Adopt a second when you've felt a real pain — a serious outage, a cost wall, a feature gap — not because it feels safer in the abstract.
:::

## The default: one provider

For most teams, one provider is right:

- One SDK, one set of error codes, one model family to learn.
- Prompts tuned once, not three times.
- One billing dashboard.
- One vendor's roadmap to track.
- Outages are rare and short; the operational tax of preventing them daily isn't worth it.

If your team is under 50 people and you don't have a hard regulatory or cost constraint, this is almost always the right call.

## When to add a second provider

Real reasons:

- **You've had a real outage** that meaningfully hurt customers, and the second provider would have saved you. Multiple, not one.
- **One provider's pricing is breaking unit economics**, and a comparable model elsewhere is materially cheaper.
- **A specific capability** lives on only one provider (Claude's long context, Gemini's native multimodal, OpenAI's o-series reasoning) and another feature needs it.
- **A customer / regulator requires it** for vendor diversification (common in EU enterprise and government).

Bad reasons:

- "What if they raise prices?" (You'll find out at renewal, not 2am.)
- "What if they deprecate?" (Deprecation cycles are months, plenty of time to migrate.)
- "What if their model gets worse?" (You'll see it in evals.)
- "It's prudent to not be locked in." (Lock-in cost is real but usually overestimated.)

## The gateway tax

Once you have multiple providers, you'll want a gateway (Portkey, OpenRouter, LiteLLM). The gateway costs you:

- **Latency:** 20–100ms of extra hop on every call.
- **Failure surface:** the gateway is now a critical dependency. If it goes down, all providers go down for you.
- **Cost:** subscription or self-hosting overhead.
- **Debugging:** an extra layer between your code and the model.

In exchange, you get: unified SDK, automatic retries and failover, consolidated billing, prompt caching coordination, model routing, and observability.

The trade is worth it once you're genuinely routing across 2+ providers. It's a net loss for a single-provider team.

## The "we'll switch providers if X" plan

A useful middle path is **prepared to switch, not actively running both**. This means:

- Calls go through a thin internal client, not the vendor SDK directly.
- Prompts are in code, not in the vendor's UI.
- Eval set is provider-agnostic.
- You've validated your prompt works on at least one alternative provider (annual sanity check).

Cost: a couple of days a year of validation. Benefit: when a real switch becomes necessary, it's 2 weeks instead of 2 months.

## Multi-region single-provider

Often the *actual* answer to "we need resilience." OpenAI and Anthropic both offer multiple regions. Routing across regions of the same provider gets you most of the resilience benefit without the cross-provider tax.

## When this rule doesn't apply

- **You're a model-routing product.** Then multi-provider IS your product. The gateway is your differentiator.
- **You're at enterprise scale with vendor-diversification policies.** Multi-provider may be required by procurement.
- **Your evals show a clear quality-per-task split.** If Claude is meaningfully better on writing and GPT on code, routing by task type is a real win.

## How to apply it

When someone proposes adding a second provider, ask:

1. **What specific pain are we solving?** Name a date and a dollar figure.
2. **Did our last 3 incidents involve provider failures, or our own bugs?** Usually the latter.
3. **What's the ongoing cost of running two?** Engineer hours, gateway latency, prompt re-tuning.
4. **Can we get the same benefit from multi-region single-provider?** Often yes.

## Common mistakes

- **Cargo-culting multi-provider from a big-co architecture diagram.** They have a 50-person platform team. You have 5 engineers. Different math.
- **Building the routing logic before you need it.** Premature gateway adoption is just operational overhead.
- **Forgetting that "switching providers" requires re-tuning every prompt.** Models behave differently. A prompt that works on Claude may need 3 days of work to match on GPT.
- **Counting providers like trophies.** "We support 4 providers" is not an achievement. Each one is a maintenance burden.

:::note[Worked example: when single-provider was right, then wasn't]
A 15-person SaaS runs on OpenAI for two years. They debate adding Anthropic "for resilience" several times. They never have an outage that would have justified the work. They keep it single-provider.

In year 3, their costs hit $40k/month and they're growing fast. They run an eval on Claude Sonnet — it matches OpenAI's quality on their tasks and is 30% cheaper. They migrate the workhorse features, keep OpenAI for the reasoning features that Claude is worse at. They adopt a gateway (Portkey) because they now have two providers and want unified observability.

Total time: 6 weeks of engineering. Saves $12k/month. The gateway tax (latency + cost) is real but small relative to the savings.

The lesson: single-provider was right for 2 years. Multi-provider became right when the cost math flipped. The team made the right call at each step by waiting for a real reason — not by hedging from day one.
:::

<Quiz id="single-vs-multi-provider-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the default provider strategy for most teams?"
  options={[
    { text: "One provider, with a thin internal client so you are prepared to switch" },
    { text: "Two providers from day one, for resilience" },
    { text: "Three providers behind a gateway" },
    { text: "Whatever each engineer prefers per feature" }
  ]}
  correct={0}
  explanation="One provider means one SDK, prompts tuned once, one dashboard — and outages are rare enough that paying a daily tax to prevent them isn't worth it. The recommended hedge is 'prepared to switch, not actively running both': a thin client, prompts in code, and an annual sanity check, costing a couple of days a year."
/>

<Question
  prompt="Which of these is a GOOD reason to add a second provider?"
  options={[
    { text: "What if they raise prices someday?" },
    { text: "It feels prudent to not be locked in" },
    { text: "A specific capability lives only on another provider and a feature needs it" },
    { text: "What if their model quietly gets worse?" }
  ]}
  correct={2}
  explanation="The real reasons are: repeated harmful outages, pricing that breaks unit economics, a capability gap, or a customer/regulator mandate. The hypotheticals are listed as bad reasons because they unfold slowly enough to react — price changes show up at renewal, quality drift shows up in evals."
/>

<Question
  prompt="What does the page suggest as the actual answer to 'we need resilience' for many teams?"
  options={[
    { text: "Build your own gateway" },
    { text: "Multi-region routing within a single provider" },
    { text: "Add a third provider as backup" },
    { text: "Self-host an open model as fallback" }
  ]}
  correct={1}
  explanation="Routing across regions of the same provider captures most of the resilience benefit without the cross-provider tax: no gateway hop latency, no new critical dependency, no re-tuning every prompt for a second model family. The gateway only pays for itself once you genuinely route across 2+ providers."
/>

</Quiz>

---

→ Next: [Sync vs async](./08-sync-vs-async.md).
