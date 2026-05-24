---
id: decisions-checkpoint
title: Chapter 9 checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test of the decision rules from chapter 9. Do you remember the defaults and the conditions that flip them?
---

# Chapter 9 checkpoint

You've reached the end of the AI decisions chapter. These rules are the most-leveraged ideas in the whole guide — if you internalize even half of them, you'll avoid most of the failures that derail AI features.

Run this self-test. For each question, decide your answer *before* checking the rule it references. The goal isn't to memorize; it's to notice the questions you'd answer wrong, then re-read those specific pages.

## Self-test

### Foundational mindset

1. **A new "best model" just dropped and is #1 on LMArena. Should you swap?**
   - *Rule reference: [Pick boring models](./01-boring-models.md). The answer is: only if your own evals on your tasks show it's meaningfully better, and the swap cost is justified.*

2. **You're about to fine-tune a model. What's the cheapest rung you should have already tried?**
   - *Rule reference: [The reversibility ladder](./02-reversibility.md). The answer involves rungs 1–7 (prompts, few-shot, RAG, better RAG, decomposition).*

3. **You're a 5-person team. Should you adopt LangGraph + Pinecone + Braintrust + self-hosted Llama?**
   - *Rule reference: [Team-size heuristic](./03-team-size-heuristic.md). The answer is no — pick one tool you genuinely need.*

### Architecture forks

4. **A team reports "the model is bad at our task." What's your first move?**
   - *Rule reference: [Prompt vs RAG vs fine-tune](./prompt-vs-rag-vs-finetune.md). Walk the ladder from prompting up; don't jump to fine-tuning.*

5. **Someone proposes a multi-agent system. What's the question that has to be answered first?**
   - *Rule reference: [Agent vs chain](./agent-vs-chain.md). "What's the chain version?" If you can draw it, ship the chain.*

6. **Your AI feature is at low scale. Should you self-host?**
   - *Rule reference: [Closed vs open-weight model](./closed-vs-open.md) + [On-prem vs cloud](./09-on-prem-vs-cloud.md). Default to closed/hosted until residency, scale, or customization forces otherwise.*

7. **An engineer pitches "let's build our own gateway." What's the reasonable response?**
   - *Rule reference: [Build vs buy](./build-vs-buy.md). Buy (Portkey, OpenRouter) or use OSS (LiteLLM). Building a gateway is undifferentiated work.*

8. **A PM wants an AI feature for fraud detection on structured transaction data. Is AI the right tool?**
   - *Rule reference: [When not to use AI](./when-not-to-use.md). Probably not — gradient-boosted models on structured data usually beat LLMs at tabular tasks.*

### Engineering investment

9. **You're shipping the first production AI feature. How much of your AI eng time should go to evals?**
   - *Rule reference: [Eval investment](./04-eval-investment.md). Roughly 25% in early production; ramping to 40% as it matures.*

10. **A PM says "let's wait on AI until things stabilize." What's the cost they're not pricing?**
    - *Rule reference: [Cost of inaction](./05-cost-of-inaction.md). The cost of inaction is real and compounding — usually larger than the cost of a careful rollout.*

11. **Your AI feature is at 60% quality, plateaued for 3 months despite prompt tweaks. Rebuild or keep iterating?**
    - *Rule reference: [When to rebuild](./06-when-to-rebuild.md). If the eval is structurally plateaued, rebuild — but expect 3x your estimate.*

12. **You're on one provider. When should you add a second?**
    - *Rule reference: [Single vs multi-provider](./07-single-vs-multi-provider.md). When you've felt real pain (outage, cost wall, capability gap), not preemptively.*

13. **Your agent takes 90 seconds. It's in a sync chat box. Right pattern?**
    - *Rule reference: [Sync vs async](./08-sync-vs-async.md). No — async with progress events or a "we'll notify you" pattern.*

14. **You're at $25k/month on closed APIs. Time to self-host?**
    - *Rule reference: [On-prem vs cloud](./09-on-prem-vs-cloud.md). Probably not yet — the operational cost of self-hosting usually exceeds savings below ~$30–50k/month.*

15. **Should you adopt LangChain on day one of a new project?**
    - *Rule reference: [Framework vs raw SDK](./10-framework-vs-raw-sdk.md). No — build the raw v0 first; adopt a framework when you've felt the specific pain it solves.*

16. **Your model "doesn't sound like your brand." Fine-tune?**
    - *Rule reference: [Prompt engineering vs fine-tuning](./11-prompt-engineering-vs-fine-tuning.md). Few-shot examples first. Fine-tuning is the last resort.*

### Risk, planning, people

17. **What's the worst-plausible failure of the AI feature you're about to ship — and what guardrail prevents it?**
    - *Rule reference: [What would hurt](./12-what-would-hurt.md). If you can't name the worst plausible failure in 5 categories, you haven't done the pre-mortem.*

18. **Should you adopt Sierra / Cognition / Crew on day one?**
    - *Rule reference: [When to buy an agent platform](./13-when-to-buy-agent-platform.md). Build a raw agent loop first. Adopt a platform when you've felt the specific pain.*

19. **You're hiring an "AI engineer." What's the role actually?**
    - *Rule reference: [Hiring constraint](./14-hiring-constraint.md). 90% of the time it's a senior product engineer with eval discipline — not an ML PhD.*

### Putting it together

20. **Name the 7 lines on the 1-page AI feature checklist.**
    - *Rule reference: [The 1-page checklist](./15-checklist.md). Model, RAG, agent/chain, eval bar, kill switch, cost cap, owner.*

21. **When is it OK to override the rules in this chapter?**
    - *Rule reference: [When to override](./16-overriding.md). When you have a specific reason + evidence + articulation + stakeholder buy-in + awareness of the risk. Not "I have intuition."*

## How to use the results

If you answered any of these *without* the matching rule's gist in mind, go back to that page and re-read it. The point of this chapter isn't memorization — it's the next time you face the decision in real work, the rule fires automatically.

## The meta-rules

If you remember nothing else:

- **Boring beats exciting.** Especially in AI, where "exciting" is yesterday's launch.
- **Cheap-to-reverse beats committal.** Walk the ladder up, not down.
- **Simple beats complex.** Chains before agents. Prompts before fine-tunes. Buy before build.
- **Evals beat vibes.** No measurement = no shipping decision.
- **Kill switch beats faith.** Every production AI feature must be turn-off-able in seconds.
- **Restraint beats ambition.** The single biggest predictor of AI engineering success is refusing complexity until the simple version has provably failed.

## What's next

→ Continue to [Chapter 10: Production Patterns](/docs/patterns) — the patterns that turn a "works on my laptop" AI feature into one that runs reliably at scale.
