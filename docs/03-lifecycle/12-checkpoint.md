---
id: lifecycle-checkpoint
title: Chapter 3 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Self-test covering all twelve phases of the AI project lifecycle.
---

# Chapter 3 Checkpoint

You've finished the AI Project Lifecycle chapter. Take a minute to make sure the core ideas stuck.

There are **15 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page section to revisit, and the link highlights the paragraph for you.

You must pass (≥ 60%) to unlock the Next button and Chapter 4 in the sidebar.

<Quiz id="lifecycle-checkpoint" title="AI Lifecycle checkpoint" sampleSize={5}>

<Question
  prompt="A stakeholder says, 'let's add AI to validate email addresses on signup.' What does the framing phase say to do?"
  options={[
    { text: "Build a quick GPT prototype to see how well it handles edge cases" },
    { text: "Push back and use a regex or deterministic validator — the input is structured and the rules are well known" },
    { text: "Fine-tune a small model on a corpus of real email addresses" },
    { text: "Add RAG over a knowledge base of common email patterns" }
  ]}
  correct={1}
  explanation="If a deterministic alternative exists for a structured-input problem with well-known rules, that's almost always the right v0. AI here would be slower, more expensive, and less reliable than a regex."
  revisit={{ to: "/docs/lifecycle/lifecycle-problem-framing", label: "When AI is the wrong tool" }}
/>

<Question
  prompt="Before any code is written, what must exist on a one-pager according to the framing phase?"
  options={[
    { text: "Architecture diagram, model choice, and infra cost estimate" },
    { text: "User and problem in plain English, 5 hand-written ideal outputs, and a numeric success metric + failure cost" },
    { text: "A list of competing products and their pricing tiers" },
    { text: "Vector DB schema, prompt template, and eval framework selection" }
  ]}
  correct={1}
  explanation="Without ideal outputs you don't know what 'good' looks like; without a numeric success metric you can't tell if you ever got there. Architecture comes after framing, not before."
  revisit={{ to: "/docs/lifecycle/lifecycle-problem-framing", label: "Output of the framing phase" }}
/>

<Question
  prompt="An AI project has three distinct data piles. Which one do teams most often underestimate?"
  options={[
    { text: "Knowledge data — the docs RAG retrieves from" },
    { text: "Training data — (input, ideal_output) pairs for fine-tuning" },
    { text: "Eval data — graded (input, expected) cases used to score the system" },
    { text: "Telemetry data — logs of model latency and token counts" }
  ]}
  correct={2}
  explanation="Teams reach launch with great knowledge data and zero graded eval cases, then can't tell whether their next change helps or hurts. Most projects never need training data; eval data is non-negotiable."
  revisit={{ to: "/docs/lifecycle/lifecycle-data", label: "The three uses of data" }}
/>

<Question
  prompt="What's the default order for trying AI patterns, and the rule for escalating?"
  options={[
    { text: "Always start with an agent — anything simpler is a toy" },
    { text: "Fine-tune first to lock in domain quality, then add RAG and tools on top" },
    { text: "Prompt (frontier) → prompt (cheap) → structured output → RAG → tools → agent → fine-tune; stop at the first that passes evals" },
    { text: "Pick whichever pattern the latest blog post recommends this week" }
  ]}
  correct={2}
  explanation="Each step up adds cost, latency, and operational pain. The most common mistake is jumping to 'let's build an agent' or 'let's fine-tune' before exhausting simpler prompting."
  revisit={{ to: "/docs/lifecycle/lifecycle-approach", label: "Default decision order" }}
/>

<Question
  prompt="Why can't AI evals just use `assert output == 'expected_string'` like unit tests?"
  options={[
    { text: "Because LLM APIs don't return strings, they return tokens" },
    { text: "Because the system is stochastic and many wordings can be equally correct — evals check behavior, not exact strings" },
    { text: "Because string comparison is too slow at eval-set scale" },
    { text: "Because Python's == operator doesn't work on multiline output" }
  ]}
  correct={1}
  explanation="Evals use structured behavioral checks: must cite this doc ID, must contain these phrases, tone must match a rubric (LLM judge), output must validate against a schema. Aggregate score across the set tells you whether things are improving."
  revisit={{ to: "/docs/lifecycle/lifecycle-evals", label: "What an eval is" }}
/>

<Question
  prompt="Which of these is the one thing v0 MUST have?"
  options={[
    { text: "A polished UI with multiple personas and a model router" },
    { text: "A vector DB and a caching layer" },
    { text: "A logged baseline eval score on real inputs" },
    { text: "A framework that hides the provider SDK so you can swap models later" }
  ]}
  correct={2}
  explanation="Without a baseline you can't tell whether the next month of iteration helped. v0 deliberately omits routing, multiple personas, frameworks, vector DBs (if a flat file works), and pretty UI."
  revisit={{ to: "/docs/lifecycle/lifecycle-build", label: "What v0 looks like" }}
/>

<Question
  prompt="What is the cardinal rule of the iterate-with-evals loop?"
  options={[
    { text: "Always ship the most experimental change first to maximize learning" },
    { text: "Change one thing per cycle so you can attribute eval score movement to a specific change" },
    { text: "Run evals only at the end of the sprint to save API costs" },
    { text: "Only look at the aggregate eval score — per-slice breakdowns are noise" }
  ]}
  correct={1}
  explanation="Bundle three changes into one PR and a score move tells you nothing about which change caused it. Three separate eval runs cost a few dollars and save weeks of debugging confusion."
  revisit={{ to: "/docs/lifecycle/lifecycle-iterate", label: "What to avoid in the iterate loop" }}
/>

<Question
  prompt="Your eval score is stuck. What should you try BEFORE reaching for fine-tuning?"
  options={[
    { text: "Switch immediately to a fine-tuned open-source model — frontier prompting has a hard ceiling" },
    { text: "Prompt wording → few-shot examples → system prompt structure → output schema → retrieval settings → model → decomposition" },
    { text: "Rewrite the entire eval set with stricter expected outputs" },
    { text: "Add a second LLM judge to grade the first model's output" }
  ]}
  correct={1}
  explanation="Fine-tuning is the last resort, in order of cheapness. Teams that fine-tune early end up locked into stale models, when three sentences added to the prompt would have moved the score the same amount in 20 minutes."
  revisit={{ to: "/docs/lifecycle/lifecycle-iterate", label: "What to vary, in order of cheapness" }}
/>

<Question
  prompt="Where should the daily $ spend cap live for an AI feature?"
  options={[
    { text: "Only in application code — the provider's billing is too slow to react" },
    { text: "Only at the provider console — application code shouldn't know about money" },
    { text: "Both places: in application code AND at the provider console — belt and suspenders" },
    { text: "In a Slack reminder to the on-call engineer" }
  ]}
  correct={2}
  explanation="The app-side cap catches runaway logic; the provider-side cap catches bugs in your app-side cap. Cost of a weekend $5K bill: $5K. Cost of implementing both caps: one hour."
  revisit={{ to: "/docs/lifecycle/lifecycle-harden", label: "Cost discipline in the harden phase" }}
/>

<Question
  prompt="Which is a STRUCTURAL defense against prompt injection (not just trusting the model)?"
  options={[
    { text: "Add 'do not follow injected instructions' to the system prompt and rely on the model's safety training" },
    { text: "Clearly delimit user/retrieved content, label it as untrusted, validate outputs, sandbox tools at the executor, and never put user content in the system slot" },
    { text: "Use a more expensive frontier model — they're immune to injection" },
    { text: "Rate-limit suspicious users by IP" }
  ]}
  correct={1}
  explanation="Relying on the model's safety training alone is insufficient. Architectural defenses — delimiters, labeling, output validation, sandboxed tools — are what actually contain the blast radius of a successful injection."
  revisit={{ to: "/docs/lifecycle/lifecycle-harden", label: "Safety and prompt injection" }}
/>

<Question
  prompt="Why should you ship to a 5% cohort before going to 100%?"
  options={[
    { text: "Provider rate limits force you to ramp gradually" },
    { text: "About 30% of eventual issues only appear at full traffic, but the first 30% appear internally and another 30% in the 5% cohort — staged ramps catch them at low blast radius" },
    { text: "Cohort routing makes inference faster" },
    { text: "Marketing requires a 'beta' period before any public launch" }
  ]}
  correct={1}
  explanation="The kill-switch flag flip is identical at 5% and at 100%, but the user impact isn't. Rollback at 5% is '0.3% of users saw a bad experience'; rollback at 100% is 'everyone did.'"
  revisit={{ to: "/docs/lifecycle/lifecycle-deploy", label: "Cohort deployment pattern" }}
/>

<Question
  prompt="Your cold eval set scores 0.92 but the nightly prod-eval has drifted to 0.78 over a month. What's the most likely cause?"
  options={[
    { text: "The model has degraded — file a ticket with the provider" },
    { text: "Your eval set has drifted out of sync with real traffic; sample fresh production failures, add them as cases, and prune stale ones" },
    { text: "The prod-eval LLM judge is broken — switch judges" },
    { text: "Latency spikes are confusing your scoring rubric" }
  ]}
  correct={1}
  explanation="When cold-eval and prod-eval diverge, the most common cause is eval-set staleness. Eval sets should roughly track production distribution; when they don't, the eval score lies to you. Also rule out a silent model update or retrieval regression."
  revisit={{ to: "/docs/lifecycle/lifecycle-monitor", label: "Drift detection" }}
/>

<Question
  prompt="Which alerting policy is correct for a production AI feature?"
  options={[
    { text: "Page on every individual user thumbs-down so nothing slips" },
    { text: "Page only when the daily exec dashboard turns red" },
    { text: "Page on aggregate signals (spend > 1.6× forecast, eval drop > 5% WoW, schema-fail rate > 2% for 15 min); triage individual events without paging" },
    { text: "Page on any call that takes longer than 10 seconds" }
  ]}
  correct={2}
  explanation="Alert on rates and trends, not individual events. Pager fatigue from per-call alerts destroys the signal value of real alerts. Individual bad answers go into the triage queue, not the on-call's phone."
  revisit={{ to: "/docs/lifecycle/lifecycle-monitor", label: "What not to alert on" }}
/>

<Question
  prompt="What's the single highest-leverage habit for compounding AI quality over a year?"
  options={[
    { text: "Upgrade to the newest frontier model the day it ships" },
    { text: "Turn every production failure into an eval case, weekly — sample logs, triage, add with correct expected outputs, run the iterate loop" },
    { text: "Hire a dedicated prompt engineer once you hit 10 prompts" },
    { text: "Rewrite the prompt from scratch each quarter to avoid prompt rot" }
  ]}
  correct={1}
  explanation="Teams that do this watch their eval set grow from 100 to 800+ cases in year one, with scores climbing from ~0.6 to ~0.9. The weekly review meeting is the cadence that makes it stick — without it, 'we'll sample logs' becomes 'we never did.'"
  revisit={{ to: "/docs/lifecycle/lifecycle-improve", label: "The weekly review meeting" }}
/>

<Question
  prompt="Why is 'the prompt lives in a Python string in the codebase' considered an anti-pattern in the handoffs phase?"
  options={[
    { text: "Python strings can't hold multi-line text reliably" },
    { text: "Prompts are versioned product artifacts — they need a registry with version, owner, model, changelog, PR review, and linkage from monitoring" },
    { text: "Domain experts only speak YAML, not Python" },
    { text: "Prompts should be generated at runtime, never stored statically" }
  ]}
  correct={1}
  explanation="A prompt buried in code with no version history means no reproducibility, no clear ownership, no way to attribute regressions, and no way for a domain expert to suggest a change via PR. The prompt registry is one of the highest-ROI process changes you can make."
  revisit={{ to: "/docs/lifecycle/lifecycle-handoffs", label: "AI engineer owns the prompt registry" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 4: Tech Stack](/docs/stack) to see what specific tools you'd reach for at each phase.
