---
id: decisions-checkpoint
title: Chapter 13 checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test of the decision rules from chapter 13. Do you remember the defaults and the conditions that flip them?
---

# Chapter 13 checkpoint

You've reached the end of the AI decisions chapter. These rules are the most-leveraged ideas in the whole guide — if you internalize even half of them, you'll avoid most of the failures that derail AI features.

There are **14 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card links directly to the page that explains the rule.

You must pass (≥ 60%) to unlock the Next button and Chapter 14 in the sidebar.

<Quiz id="decisions-checkpoint" title="AI decisions checkpoint" sampleSize={5}>

<Question
  prompt="A brand-new SOTA model just hit #1 on LMArena and crushes the model you ship today on three public benchmarks. Per the chapter, what should you do?"
  options={[
    { text: "Swap immediately — being on the newest model is a competitive moat" },
    { text: "Run your own eval suite on your own tasks; only swap if it's meaningfully better there AND the swap cost is justified. Most-deployed and known-good usually beats newest" },
    { text: "Swap for new users, keep old users on the previous model" },
    { text: "Wait six months no matter what the evals say" }
  ]}
  correct={1}
  explanation="Public benchmarks rarely match your task distribution, and 'newest' models bring undocumented regressions, pricing changes, and rate-limit chaos. The boring-models rule: pick the most-deployed model that passes your evals, and only swap when your evals — not someone else's leaderboard — say it's worth the cost."
  revisit={{ to: "/docs/decisions/boring-models", label: "Pick boring models" }}
/>

<Question
  prompt="A team's AI feature is underperforming. An engineer pitches: 'Let's fine-tune Llama on our domain data — that'll fix it.' Per the reversibility ladder, what's the right response?"
  options={[
    { text: "Approve — fine-tuning is the standard fix for domain quality" },
    { text: "Walk up the cheap-to-reverse rungs first: better prompt, few-shot examples, RAG, better RAG, task decomposition. Fine-tune only after those provably plateau" },
    { text: "Skip straight to self-hosting so you control the whole stack" },
    { text: "Switch vector DBs first since that's also a structural change" }
  ]}
  correct={1}
  explanation="The ladder is prompt > few-shot > RAG > better RAG > decomposition > model swap > fine-tune > self-host, ranked by reversibility. Fine-tuning locks you to a model version, a dataset, and a pipeline; you should arrive there only after the cheaper rungs have demonstrably failed."
  revisit={{ to: "/docs/decisions/reversibility", label: "The reversibility ladder" }}
/>

<Question
  prompt="You're a 5-person startup picking AI infrastructure. An engineer proposes LangGraph + Pinecone + Braintrust + self-hosted Llama + a custom eval harness. Per the team-size heuristic:"
  options={[
    { text: "Approve — modern AI work needs the full stack" },
    { text: "Reject — at 5 people you can support roughly one piece of novel infrastructure. Pick the one you genuinely need (likely a managed vector store OR evals — not both plus self-hosting plus a framework)" },
    { text: "Approve but hire two more engineers to operate it" },
    { text: "Approve only the self-hosted Llama part" }
  ]}
  correct={1}
  explanation="The bands are explicit: a 1-person team should use one hosted API and nothing else; a 5-person team can carry one piece of novel infra; 50 people earn a real platform. Adopting 500-person tooling at 5 people guarantees most of your time goes to babysitting infra instead of shipping the product."
  revisit={{ to: "/docs/decisions/team-size-heuristic", label: "Team-size heuristic" }}
/>

<Question
  prompt="You're shipping your first production AI feature next month. How much of your AI engineering time should be going into evals — datasets, graders, regression suites?"
  options={[
    { text: "0% — evals are a post-launch luxury" },
    { text: "Roughly 10% pre-launch, ~25% in early production, ramping to ~40% as the feature matures and the stakes rise" },
    { text: "100% — block the launch until evals are perfect" },
    { text: "5% forever — the model provider does the evals for you" }
  ]}
  correct={1}
  explanation="The chapter's investment curve: ~10% early, ~25% mid-production, ~40% mature. Under-investing shows up as 'we don't know if the new prompt is better,' 'we ship and pray,' and an inability to swap models safely. Evals are the only thing that turns AI from vibes into engineering."
  revisit={{ to: "/docs/decisions/eval-investment", label: "How much to invest in evals" }}
/>

<Question
  prompt="A PM says: 'Let's wait six months on the AI rollout — let the space stabilize first.' What cost are they failing to price?"
  options={[
    { text: "None — waiting is always free and conservative" },
    { text: "The cost of inaction: competitors compounding their evals and prompt library, users defaulting to a competitor's experience, your team falling behind on operational know-how. It's usually larger than the cost of a careful rollout now" },
    { text: "Only the licensing cost of unused API credits" },
    { text: "Just the salary of the AI engineer sitting idle" }
  ]}
  correct={1}
  explanation="'Not yet' is itself a decision with a price tag, and the price is asymmetric — the upside of getting AI right compounds while the downside of a small, reversible rollout is bounded. The chapter's frame: write down the cost of inaction in dollars and weeks, then compare it to the cost of a careful rollout."
  revisit={{ to: "/docs/decisions/cost-of-inaction", label: "Cost of inaction" }}
/>

<Question
  prompt="Your AI feature has been stuck at ~60% quality for three months despite weekly prompt tweaks. Do you rebuild or keep iterating?"
  options={[
    { text: "Always keep iterating — prompts are cheap" },
    { text: "If the eval is structurally plateaued (not noise, not one bad slice), rebuild — different architecture, different decomposition, possibly different model. Expect ~3x your estimate, and budget for it" },
    { text: "Always rebuild — three months is too long" },
    { text: "Switch the team and try again with the same architecture" }
  ]}
  correct={1}
  explanation="A real plateau means the architecture is the ceiling — more prompt tweaks just permute the same surface. The rebuild rule: confirm the plateau in evals (not vibes), redesign the structure, and triple your estimate. The opposite mistake — rebuilding on the first dip — destroys working systems."
  revisit={{ to: "/docs/decisions/when-to-rebuild", label: "When to rebuild" }}
/>

<Question
  prompt="You ship on a single provider. Cost is fine, latency is fine, no outages yet. An engineer wants to add a second provider 'for resilience.' Per the chapter:"
  options={[
    { text: "Add it now — multi-provider is a best practice" },
    { text: "Don't add it yet. The gateway and abstraction tax is real. Add a second provider when you've felt actual pain — a real outage, a hard cost wall, or a capability gap — not preemptively" },
    { text: "Add it only if the CEO insists" },
    { text: "Build your own gateway from scratch this quarter just in case" }
  ]}
  correct={1}
  explanation="Multi-provider sounds free but isn't: every prompt has to work on N models, evals run N times, debugging gets harder, and you usually end up with a lowest-common-denominator integration. The right trigger is felt pain — outage, cost wall, capability gap — at which point you adopt a thin gateway (Portkey, OpenRouter, LiteLLM)."
  revisit={{ to: "/docs/decisions/single-vs-multi-provider", label: "Single vs multi-provider" }}
/>

<Question
  prompt="Your agent takes 90 seconds end-to-end to research and answer. The PM wants it in a sync chat-style UI with a spinner. Per the chapter:"
  options={[
    { text: "Ship it in the sync UI — spinners are fine" },
    { text: "Flip to async: stream progress events, show partial reasoning, or use a 'we'll notify you when it's ready' pattern. Sync UIs work to about 5–10 seconds; past that, users tab away and timeouts compound" },
    { text: "Reduce the agent's quality until it fits in 5 seconds" },
    { text: "Make the spinner more interesting" }
  ]}
  correct={1}
  explanation="The sync/async fork is dictated by latency, not aesthetic preference. Past ~10 seconds, sync UIs feel broken; past ~30 seconds, network and edge timeouts start killing requests. Async patterns — progress streams, background jobs, notifications — are the right shape for any non-trivial agent."
  revisit={{ to: "/docs/decisions/sync-vs-async", label: "Sync vs async" }}
/>

<Question
  prompt="You're at $25k/month on closed APIs and rising. An engineer pitches self-hosting Llama on your own GPUs to cut the bill. Per the on-prem vs cloud rule:"
  options={[
    { text: "Self-host immediately — $25k/month is huge" },
    { text: "Probably not yet. Self-hosting carries real operational cost — GPU ops, autoscaling, on-call, evals across versions. Hosted APIs usually win below ~$30–50k/month unless residency, scale, or customization forces the swap" },
    { text: "Self-host on consumer GPUs in the office" },
    { text: "Self-host but only on weekends" }
  ]}
  correct={1}
  explanation="The naive view is 'API bill minus GPU bill = savings.' The honest view adds engineer salaries, on-call rotation, model-version management, and the eval cost of running everything against a new stack. The break-even is usually higher than people expect — typically $30–50k/month, plus a real reason (residency, latency, capability) beyond cost."
  revisit={{ to: "/docs/decisions/on-prem-vs-cloud", label: "On-prem vs cloud" }}
/>

<Question
  prompt="An engineer wants to start a new AI project with LangChain on day one 'so we don't have to rewrite later.' Per the framework-vs-raw-SDK rule:"
  options={[
    { text: "Approve — frameworks save time from day one" },
    { text: "Push back: build the raw v0 against the provider SDK first. Adopt a framework only when you've felt the specific pain it solves (retries, structured outputs, multi-model routing). Early framework adoption hides what's actually happening and locks in abstractions you don't need" },
    { text: "Counter-propose writing a custom framework instead" },
    { text: "Use three frameworks at once for flexibility" }
  ]}
  correct={1}
  explanation="Frameworks are answers to questions you haven't asked yet. Without the raw v0 you can't tell whether LangChain's abstractions help or just add a layer. The rule: raw SDK first, framework only when the pain is concrete and named — and even then, the smallest framework that solves it."
  revisit={{ to: "/docs/decisions/framework-vs-raw-sdk", label: "Framework vs raw SDK" }}
/>

<Question
  prompt="Your model 'doesn't sound like your brand voice.' A team member proposes fine-tuning on 5,000 marketing samples. Per the prompt-engineering vs fine-tuning escalation:"
  options={[
    { text: "Fine-tune — that's exactly what fine-tuning is for" },
    { text: "Try the cheaper rungs first: a system prompt that defines the voice with examples, few-shot exemplars, a style guide injected at inference. Fine-tuning is the last resort once those provably plateau" },
    { text: "Switch to a smaller model and hope it sounds more on-brand" },
    { text: "Hire a copywriter to rewrite every response" }
  ]}
  correct={1}
  explanation="Voice/style is almost always solvable with prompting plus few-shot examples — and prompts are reversible in seconds while fine-tunes are reversible in weeks. The escalation order: prompt > few-shot > better few-shot > distillation/fine-tune. Skipping straight to fine-tuning trades a 10-minute fix for a 6-week project."
  revisit={{ to: "/docs/decisions/prompt-engineering-vs-fine-tuning", label: "Prompt engineering vs fine-tuning" }}
/>

<Question
  prompt="You're about to ship an AI customer-support agent that can issue refunds up to $500. What's the chapter's pre-mortem prescription?"
  options={[
    { text: "Ship it — agents need real authority to be useful" },
    { text: "Name the worst plausible failures across categories (prompt injection, hallucinated policy, mass refund abuse, PII leak, brand-damaging output); for each, define the guardrail (per-user caps, allowlist of actions, kill switch, human review threshold) before shipping" },
    { text: "Ship it and add guardrails after the first incident" },
    { text: "Restrict refunds to $5 forever" }
  ]}
  correct={1}
  explanation="The 'what would hurt' exercise forces you to enumerate failures across attack, accuracy, abuse, privacy, and brand categories before launch — and pair each with a specific guardrail. The two non-negotiables for any production AI feature: a kill switch you can hit in seconds and a cap on blast radius if it goes wrong."
  revisit={{ to: "/docs/decisions/what-would-hurt", label: "What would hurt — the pre-mortem" }}
/>

<Question
  prompt="A vendor pitches their agent platform (Sierra / Crew / Cognition-style): 'Skip the runtime work, ship in a week.' You haven't built any agent yet. Per the chapter:"
  options={[
    { text: "Buy it — runtime work is undifferentiated" },
    { text: "Build a raw agent loop first — tool calls, retries, state, evals — so you understand the shape of the problem. Adopt a platform once you've felt the specific pain (multi-tenant orchestration, long-running state, compliance) it removes" },
    { text: "Buy two platforms and A/B test them" },
    { text: "Buy the cheapest one regardless of fit" }
  ]}
  correct={1}
  explanation="Adopting a platform before building the raw loop means you can't evaluate whether the platform actually fits your needs — you're paying for abstractions over a problem you don't yet understand. The same rule as frameworks: feel the pain first, then buy the smallest thing that solves it."
  revisit={{ to: "/docs/decisions/when-to-buy-agent-platform", label: "When to buy an agent platform" }}
/>

<Question
  prompt="A PM wants an 'AI feature' for fraud detection on structured transaction data — thousands of rows with labeled outcomes. Per the 'when not to use AI' rule:"
  options={[
    { text: "Definitely use an LLM — AI is the modern default" },
    { text: "Probably don't reach for an LLM. Gradient-boosted trees (XGBoost / LightGBM) on labeled tabular data usually beat LLMs on cost, latency, and accuracy. Reserve LLMs for unstructured text, reasoning, or generation tasks" },
    { text: "Use an LLM to label the data, then ignore the labels" },
    { text: "Use AI for the UI but not the detection" }
  ]}
  correct={1}
  explanation="LLMs are extraordinary on unstructured language and weak/expensive on structured tabular prediction with labels. The honest answer for fraud on transactions is gradient-boosted trees plus rules — boring, cheap, fast, and more accurate. 'Use AI everywhere' is the 2026 version of 'use blockchain everywhere.'"
  revisit={{ to: "/docs/decisions/when-not-to-use-ai", label: "When not to use AI" }}
/>

</Quiz>

---

## The meta-rules

If you remember nothing else:

- **Boring beats exciting.** Especially in AI, where "exciting" is yesterday's launch.
- **Cheap-to-reverse beats committal.** Walk the ladder up, not down.
- **Simple beats complex.** Chains before agents. Prompts before fine-tunes. Buy before build.
- **Evals beat vibes.** No measurement = no shipping decision.
- **Kill switch beats faith.** Every production AI feature must be turn-off-able in seconds.
- **Restraint beats ambition.** The single biggest predictor of AI engineering success is refusing complexity until the simple version has provably failed.

## What's next

→ Continue to [Chapter 14: Production Patterns](/docs/patterns) — the patterns that turn a "works on my laptop" AI feature into one that runs reliably at scale.
