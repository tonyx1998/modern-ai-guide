---
id: programming-basics
title: "Before you start: the programming you need"
sidebar_label: "Programming on-ramp"
sidebar_position: 1.5
description: The five programming ideas every page of this guide assumes — variables, functions, HTTP, JSON, and the terminal — each in plain English, plus where to go if you've never written code.
---

# Before you start: the programming you need

> **In one line:** This guide teaches AI engineering from zero *AI* knowledge — but it does assume a little *programming* knowledge. This page lists exactly what, teaches each idea in plain English, and points you to a full course if you've never coded at all.

:::tip[In plain English]
Good news: the programming bar for AI engineering is low. You will not write algorithms or build compilers. You'll write short scripts that send text to an API and handle what comes back. If you can read the five ideas below and they make sense, you're ready for the whole guide. If they're brand new, spend a week with a beginner programming course first — it pays off immediately.
:::

## The five ideas

### 1. Variables and functions

A **variable** is a named box that holds a value. A **function** is a named, reusable block of code that takes inputs and returns an output.

```python
price_per_token = 0.000003          # a variable

def cost(tokens):                   # a function
    return tokens * price_per_token

print(cost(1000))                   # 0.003
```

Trace it: `cost(1000)` runs the function body with `tokens = 1000`, multiplies `1000 × 0.000003`, and returns `0.003`. That's the level of code this guide uses — short, readable, traceable.

### 2. HTTP requests

Every LLM call in this guide is an **HTTP request** — the same mechanism your browser uses to load a page. Your code sends a *request* to a URL (an **API endpoint**), the provider's server does work, and sends back a *response*.

```python
import requests

r = requests.post(                       # POST = "here's data, do something"
    "https://api.example.com/v1/chat",   # the endpoint
    json={"message": "Hello"},           # the request body
)
print(r.json())                          # the response, parsed
```

You'll see the words **request**, **response**, **endpoint**, and **POST** constantly. They mean exactly this.

### 3. JSON

**JSON** (JavaScript Object Notation) is the universal text format for structured data — every LLM API speaks it. It's just nested keys and values:

```json
{
  "model": "some-model-name",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "max_tokens": 100
}
```

Curly braces `{}` hold key–value pairs; square brackets `[]` hold lists; strings are quoted. If you can read that block, you can read every API example in this guide.

### 4. API keys and environment variables

An **API key** is a secret password that tells the provider who's calling (and whom to bill). You never paste it into code — you put it in an **environment variable** (a named value your operating system holds for your programs):

```bash
export OPENAI_API_KEY="sk-..."   # set it in the terminal
```

```python
import os
key = os.environ["OPENAI_API_KEY"]   # read it in code
```

Why it matters: keys committed to code get scraped by bots within minutes and your account gets drained. Environment variables keep secrets out of code.

### 5. The terminal

The **terminal** (command line) is the text interface where you run programs. The handful of commands this guide uses:

```bash
cd my-project        # move into a folder
python script.py     # run a Python file
npm install openai   # install a package (Node.js)
pip install openai   # install a package (Python)
```

[Stage 0 of the roadmap](/docs/roadmap/part-1-from-zero/stage-0-setup) walks through setting all of this up from a blank machine, step by step.

## Why it matters

Every later page assumes these five ideas without re-explaining them. "Send the conversation as JSON over HTTP with your API key" should parse instantly by the time you reach [Messages](./messages.md) — if it does, nothing else in this guide will block on programming knowledge.

## Common pitfalls

:::caution[Where newcomers trip]
- **Skipping this check.** If "parse the JSON response" sounds foreign, later pages will feel harder than they are. The fix costs a week now, not months later.
- **Pasting API keys into code.** The classic first-week mistake. Use environment variables from day one.
- **Confusing Python and JavaScript examples.** This guide shows both. You only need *one* — pick Python if unsure, and mentally skip the other.
- **Thinking you need more than this.** You don't need data structures, algorithms, or math to start. (When you eventually want the math, the optional [math primer](./math-primer.md) is the appendix for it.)
:::

## Never coded at all?

Take one beginner course first, then come back — this guide will read easily afterwards.

:::note[Go deeper (optional)]
- Our companion **modern web dev guide** (sibling guide in this collection) owns programming-from-zero and teaches it the same way this guide teaches AI.
- Any "Intro to Python" course that gets you writing functions and running files from the terminal is enough.
:::

<Quiz id="programming-basics-quick-check" variant="micro" title="Quick check">

<Question
  prompt="You hardcode your API key directly into a script and push it to a public GitHub repo. According to this page, what is the realistic consequence?"
  options={[
    { text: "Nothing, as long as the repo is small and obscure" },
    { text: "The provider automatically rotates the key for you" },
    { text: "Bots scrape the key within minutes and your account can get drained" },
    { text: "The key stops working because it left your machine" }
  ]}
  correct={2}
  explanation="Automated bots constantly scan public repos for credential patterns, so a committed key is typically found and abused within minutes — that is why secrets belong in environment variables, not code. Providers do not auto-rotate leaked keys for you, and obscurity is no protection against automated scanning."
/>

<Question
  prompt="In a JSON request body, what do curly braces and square brackets each hold?"
  options={[
    { text: "Curly braces hold key-value pairs; square brackets hold lists" },
    { text: "Curly braces hold lists; square brackets hold key-value pairs" },
    { text: "Both hold lists; the difference is only stylistic" },
    { text: "Curly braces mark comments; square brackets mark required fields" }
  ]}
  correct={0}
  explanation="JSON has exactly two container shapes: objects (curly braces, holding key-value pairs) and arrays (square brackets, holding ordered lists). Mixing them up is a common early stumble because both appear nested together in API payloads, like a messages list inside a request object."
/>

<Question
  prompt="A friend wants to start this guide but worries they first need data structures, algorithms, and college math. What does this page say?"
  options={[
    { text: "They are right — AI engineering is math-heavy from day one" },
    { text: "They need the algorithms but can skip the math" },
    { text: "They should learn both Python and JavaScript first, since the guide shows both" },
    { text: "They need neither — the five basics here are enough, and the math primer is optional" }
  ]}
  correct={3}
  explanation="The programming bar is deliberately low: variables, functions, HTTP, JSON, API keys, and the terminal cover everything the guide assumes. You write short scripts that call APIs, not algorithms. The guide shows Python and JavaScript but you only need one — and the math primer exists as an optional appendix, not a prerequisite."
/>

</Quiz>

---

→ Next: [Tokens](./tokens.md) — the unit every LLM reads, writes, and bills by.
