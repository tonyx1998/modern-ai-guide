---
id: solo-development
title: The Development Loop
sidebar_position: 7
sidebar_label: 6. Development
description: Prompt iteration in a Jupyter/REPL, the 20-row eval script, and the edit-prompt → re-run-eval → commit rhythm that defines solo AI work.
---

# The Development Loop

> **In one line:** Open Jupyter (or a REPL), iterate the prompt against your 20-row eval CSV, commit each meaningful change. That's the entire day-to-day.

:::tip[In plain English]
A solo AI project is not a normal "code → run → test" loop. Most of the work is *prompt iteration*. The right environment is a notebook or REPL where you can re-run the same prompt against the same 20 rows in two seconds, eyeball pass/fail, edit the prompt, repeat. Get this rhythm right and everything else flows from it.
:::

## The four-file v0 codebase

A solo AI project, at v0, is usually four files:

```
.
├── prompts/
│   └── main.md          # The system prompt, in plain markdown
├── eval.csv             # 20 hand-picked test rows from planning
├── eval.py              # Runs the prompt against eval.csv, prints results
└── app/api/route.ts     # (or main.py) — the production endpoint
```

That's it. No `src/prompts/v3/system/`, no Pydantic prompt classes, no abstract base prompts.

## The eval script (Python, ~40 lines)

```python
# eval.py
import csv, os
from anthropic import Anthropic

client = Anthropic()
MODEL = "claude-sonnet-4-5"
SYSTEM = open("prompts/main.md").read()

def run(user_input: str) -> str:
    msg = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM,
        messages=[{"role": "user", "content": user_input}],
    )
    return msg.content[0].text

def check(output: str, must_contain: str, must_not_contain: str) -> bool:
    if must_contain and must_contain.lower() not in output.lower():
        return False
    if must_not_contain and must_not_contain.lower() in output.lower():
        return False
    return True

if __name__ == "__main__":
    passed = failed = 0
    with open("eval.csv") as f:
        for row in csv.DictReader(f):
            out = run(row["input"])
            ok = check(out, row["expected_must_contain"], row["expected_must_not_contain"])
            print(f"[{'PASS' if ok else 'FAIL'}] #{row['id']}  {row['notes']}")
            if not ok:
                print(f"  output: {out[:200]}...")
            passed += int(ok); failed += int(not ok)
    print(f"\n{passed} passed, {failed} failed")
```

Run with `python eval.py`. Total time per run: maybe 30 seconds for 20 rows. Cost: a couple cents. **This is your entire eval system at v0.** It will carry you well into real users.

## The TypeScript equivalent

Same idea, ~50 lines, using the Vercel AI SDK:

```typescript
// eval.ts
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import fs from "node:fs";
import { parse } from "csv-parse/sync";

const SYSTEM = fs.readFileSync("prompts/main.md", "utf8");
const rows = parse(fs.readFileSync("eval.csv"), { columns: true });

let passed = 0, failed = 0;
for (const r of rows) {
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    system: SYSTEM,
    prompt: r.input,
    maxTokens: 1024,
  });

  const must = (r.expected_must_contain ?? "").toLowerCase();
  const mustNot = (r.expected_must_not_contain ?? "").toLowerCase();
  const ok =
    (!must || text.toLowerCase().includes(must)) &&
    (!mustNot || !text.toLowerCase().includes(mustNot));

  console.log(`[${ok ? "PASS" : "FAIL"}] #${r.id}  ${r.notes}`);
  if (!ok) console.log(`  output: ${text.slice(0, 200)}...`);
  ok ? passed++ : failed++;
}
console.log(`\n${passed} passed, ${failed} failed`);
```

`pnpm tsx eval.ts`. Same vibes.

## The inner loop

The cadence is:

1. **Open the prompt** in `prompts/main.md`. Edit it.
2. **Run `python eval.py`** (or `tsx eval.ts`). 30 seconds.
3. **Look at failures.** Don't fix them all — pick the one that matters most.
4. **Edit the prompt** to address it. Re-run.
5. **When all 20 pass (or you accept the trade-off)**, `git commit -m "prompt: handle empty input"`.
6. **Push.** Vercel/Modal auto-deploys. Try the live URL.

Total cycle: 2–5 minutes. You should be doing 10–20 of these per session.

:::note[The Jupyter variant]
For the messiest prompt iteration phase, a Jupyter notebook lets you keep the prompt and a few sample inputs in a cell and re-run individual cases without paying for all 20 every time. The workflow is the same — you just trade `python eval.py` for "Shift+Enter, look, edit, repeat."

Keep the notebook in `notebooks/scratch.ipynb`, gitignore the outputs (`.ipynb` outputs balloon diffs), and graduate findings into `eval.csv` rows when they're worth keeping.
:::

## Prompts in files, not in code

Keep prompts in `.md` files in `prompts/`, not as multi-line strings in your route handler. Three reasons:

- **You'll iterate them more** when they're in their own file. Editor doesn't fight you with TS escaping.
- **Diffs are readable.** A `git diff` on a prompt change is plain English.
- **You can ship updates without redeploying** if you read the file at runtime (or check in changes per deploy).

A typical layout:

```
prompts/
├── main.md           # the system prompt
├── style-guide.md    # voice/tone, included in main via {{include}}
└── examples.md       # few-shot examples
```

A simple loader concatenates them in your code.

## Production endpoint, one route

For Stack A, the production endpoint is a single route handler that streams the response:

```typescript
// app/api/generate/route.ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import fs from "node:fs";

const SYSTEM = fs.readFileSync("prompts/main.md", "utf8");

export async function POST(req: Request) {
  const { input } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: SYSTEM,
    prompt: input,
    maxTokens: 1024,
  });

  return result.toTextStreamResponse();
}
```

That's the whole backend. Add auth and rate-limit middleware next ([auth page](./07-auth.md)), but the LLM-call layer is this.

## When to add real evals (LLM-as-judge)

For solo v0: don't. String matching catches 80% of regressions, and the eyeball-the-failures step catches the rest.

When you've shipped, have users, and notice quality drift you can't catch with substring matches, *then* add LLM-as-judge for one or two of your most important rows:

```python
def llm_judge(output: str, criteria: str) -> bool:
    prompt = f"Does the following output satisfy this criterion?\n\nCriterion: {criteria}\n\nOutput:\n{output}\n\nAnswer ONLY 'yes' or 'no'."
    msg = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=10,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip().lower().startswith("y")
```

Add a `judge_criteria` column to `eval.csv` for the rows that need it. Don't run it on every row — judge calls double your eval cost.

:::info[Highlight: the prompt is the codebase]
At solo scale, **the prompt is the code**. Bugs are usually prompt bugs. Refactors are usually prompt refactors. Code review is usually prompt review. Treat `prompts/main.md` with the same care as your most important source file — small commits, clear messages, do not let a four-paragraph rewrite land as one "improvements" commit.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Editing the production prompt directly via the dashboard / runtime.** You'll lose history and not be able to bisect a regression. The fix is to always edit `prompts/main.md`, commit, deploy.
- **Running the eval against the production endpoint.** It's slow, it costs more (one HTTP hop per call), and it conflates eval bugs with API bugs. The fix is to import the prompt and call the model directly from `eval.py`.
- **Mutating `eval.csv` to make the bar move.** When a row fails, the temptation is to soften the expected substring. The fix is to fix the prompt or accept the failure as documented limitation — don't move the goalpost.
- **Skipping streaming "for now."** A non-streaming chat UI feels broken at modern user expectations; users hit "stop" or refresh. The fix is `streamText` from day one — the Vercel AI SDK makes it cheaper than the non-streaming version.
- **Not pinning the model string.** "I'll just use whatever's latest" → quality moves under you. The fix is a literal `claude-sonnet-4-5` (or whichever exact version) in code. Upgrade deliberately, re-run evals, commit the bump.
:::

## Page checkpoint

Self-check:

- Do you have `prompts/main.md`, `eval.csv`, `eval.py` (or `.ts`), and one production route — and nothing else in your v0 codebase?
- Can you go from "prompt edit" → "deployed change" in under 5 minutes?
- Is your model string pinned to an exact version?

## What's next

→ Continue to [Auth](./07-auth.md) where we'll lock the endpoint down before strangers find it.
