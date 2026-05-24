---
id: solo-planning
title: Planning a Solo AI Project
sidebar_position: 4
sidebar_label: 3. Planning
description: The pre-mortem, the one-pager spec, and the 20-row eval CSV — all before any code. An afternoon, not a month.
---

# Planning a Solo AI Project

> **In one line:** Spend one afternoon writing a one-pager, a pre-mortem, and 20 eval rows in a CSV. That's the entire planning phase for a solo AI project.

:::tip[In plain English]
Planning for solo AI work is not a Notion workspace, a roadmap, or a backlog. It's three artifacts: a one-page README of what you're building, a list of the five most likely ways it'll fail, and a CSV of 20 inputs you'd judge the output on. If you can produce all three in an afternoon, you're ready to code. If you can't, the idea isn't crisp enough yet.
:::

## The three artifacts

### Artifact 1: The one-pager

A `README.md` you write *before* writing code. Six sections, one paragraph each.

```markdown
# [Project name]

**What it does (1 sentence):** Paste a contract → get a plain-English summary with risk callouts.

**Who it's for (1 sentence):** Freelancers reviewing client agreements who can't afford a lawyer.

**Why now (1 sentence):** Claude Sonnet 4.5 finally summarizes long PDFs reliably and cheaply.

**The single prompt:** "You are a contract reviewer. Given the text below, produce: (1) a 3-sentence plain-English summary, (2) five risk callouts as a bulleted list, (3) two questions the user should ask the counterparty."

**Success looks like:** A real freelancer pastes a real contract, gets useful output, and tweets about it.

**Out of scope for v1:** Editing the contract. Multi-document comparison. Anything not pasting text in.
```

If any section is hard to write, you don't have a clear-enough idea yet. Iterate the one-pager before opening a code editor.

### Artifact 2: The pre-mortem

Imagine it's 12 weeks from now and the project is dead. Write down the top five reasons why. For a solo AI project, the recurring causes are:

1. **Scope crept.** "Just add edit suggestions" turned into a 6-week rewrite.
2. **Costs blew up.** A scraper hit the endpoint and you woke up to $400.
3. **Quality was bad.** Prompts hallucinated key details and you didn't catch it.
4. **No distribution.** It worked great, you tweeted once, nobody cared, you got bored.
5. **Model deprecated.** The model you built on got sunset and the swap broke quality.

For each, write the one specific guardrail you'll put in place from day one. The guardrails almost always look like: a feature you *didn't* build, a cap you *did* set, an eval row you *did* write.

### Artifact 3: The 20-row eval CSV

This is the artifact most solo builders skip and most regret skipping. Before writing the prompt, write a `eval.csv`:

```csv
id,input,expected_must_contain,expected_must_not_contain,notes
1,"<short NDA text>","mutual confidentiality, 2-year term","legal advice","baseline case"
2,"<one-sided contract text>","one-sided, recommends pushback","fair, balanced","spot bias"
3,"<empty text>","please provide a contract","summary","empty-input handling"
...
20,"<adversarial prompt-injection text>","ignored injection","followed injection instructions","security"
```

Twenty rows. Hand-curated. A few baseline cases, a few edge cases, a few adversarial cases. This is your entire eval system at v0. You'll run prompts against it from a Python script and eyeball pass/fail. See [development](./06-development.md) for the loop.

## The "should I build this" filter

Before committing the weekend, run four questions:

1. **Would I personally use it this week?** Solo projects need a primary user; you're the only guaranteed one.
2. **Can I name one real person (not "users" generally) who'd open it on Monday?** If no, distribution is going to bite.
3. **Can I ship v0 in 16 hours of focused work?** If no, slice further.
4. **Will I still find this interesting in 3 months?** Solo projects need sustained interest from one person — you.

Any "no" is fine — but three "no"s is the universe telling you to pick a different idea.

:::note[Worked example: running the filter]
**Idea:** "AI that reads my git diffs and writes the PR description."

1. *Would I use it this week?* Yes, I open 5 PRs a week.
2. *One real person?* Yes, myself plus two coworkers who'd try it.
3. *Ship v0 in 16 hours?* Yes — one prompt, takes `git diff` from stdin, returns markdown.
4. *Interesting in 3 months?* Yes, every PR I open reminds me of it.

Four yeses → build it.

**Idea:** "AI personal CFO that reads my bank transactions, predicts cashflow, and rebalances my budget."

1. Yes.
2. Yes, me.
3. *Ship v0 in 16 hours?* No — Plaid integration alone is two weekends and bank-data security is real.
4. Yes.

One hard no → slice it. "AI that categorizes a pasted CSV of transactions" is the 16-hour version. Ship that.
:::

:::info[Highlight: evals before prompts, prompts before code]
The right order is **evals → prompts → code**, not code → prompts → evals. Most solo AI bugs at launch are quality bugs that the builder *would* have caught if they'd written eval rows first. The 20 rows take an hour. Skipping them costs days of "why did it say that?" debugging during launch week.
:::

## The artifact checklist

By end of planning afternoon, you should have:

- [ ] `README.md` with 6 sections, max 200 words.
- [ ] `PRE_MORTEM.md` with 5 failure modes and 5 guardrails.
- [ ] `eval.csv` with 20 rows.
- [ ] 4-question filter passed (or honestly failed).
- [ ] One-line "what it does" sentence that fits in a tweet.

That's it. Now start coding.

## Common mistakes

:::caution[Where people commonly trip up]
- **Planning the v3 instead of the v0.** The pre-mortem keeps you in v0 scope. The fix is: any feature not on the README is out of v1. Write it down on a `v2.md` file and move on.
- **Skipping the eval CSV "because the prompt is obvious."** The prompt is never obvious. The fix is to spend the hour on 20 rows — you'll edit the prompt three times during eval-writing, before any code runs.
- **Treating the one-pager as a marketing doc.** The one-pager is for *you* deciding whether to build, not for users deciding whether to try. The fix is to keep it terse and private until the product exists.
- **Asking an LLM to write the one-pager.** It produces a confident, generic, useless document. The fix is to draft it yourself in plain words; the friction of writing it is the value.
- **Letting planning bleed into a week.** A solo AI project planning phase that takes a week is a sign you're avoiding the actual build. The fix is a hard time-box: one afternoon, all three artifacts, or the idea isn't crisp enough.
:::

## Page checkpoint

Self-check:

- Do you have a one-sentence "what it does" answer? (Less than 20 words.)
- Could you read your `eval.csv` to a friend and have them say "yeah, that's what success looks like"?
- Did you write down the failure mode you're most worried about — and the specific guardrail for it?

## What's next

→ Continue to [Stack Selection](./04-stack-selection.md) where we'll lock in the concrete TypeScript or Python stack you'll spend the rest of the weekend on.
