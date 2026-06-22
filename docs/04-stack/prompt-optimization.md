---
id: prompt-optimization
title: Programmatic prompt optimization (DSPy, GEPA)
sidebar_position: 2.5
description: Stop hand-tuning prompt strings — program your LLM pipeline as signatures and modules, then let an optimizer (DSPy teleprompters, GEPA) search for the best prompts and few-shot examples against a metric.
---

# Programmatic prompt optimization

> **In one line:** Instead of hand-editing prompt strings, you express your pipeline as a *program* plus a *metric*, and an optimizer automatically searches for the prompts and few-shot examples that maximize that metric on your data.

:::tip[In plain English]
Hand-tuning prompts is like turning a radio dial by ear — you nudge a word, eyeball a few outputs, and hope it's better. It works for one prompt, but it doesn't scale and it isn't measurable. Programmatic optimization flips this around: you write down *what good looks like* as a score, hand the optimizer 20-100 examples, and let it do the dial-turning for you — systematically, and with a number to prove it improved. You debug a program, not a brittle string.
:::

## The shift: from artisanal strings to optimized programs

For years, "prompt engineering" meant [crafting strings by hand](../01-foundations/prompting-craft.md) — wording, ordering, hand-picking few-shot examples. That craft still matters, but in 2026 the center of gravity has moved to **programmatic + automatic optimization**. The idea: you declare the *structure* of your LLM pipeline and a *metric* for success, then an optimizer searches the space of prompts (instructions, few-shot demonstrations) to maximize that metric.

This is the natural sibling of [prompt management](./prompt-management.md). Management versions and ships prompts; optimization *generates* the good ones in the first place. Both are part of the broader 2026 framing called **context engineering** — less artisanal wording, more programming, measuring, and optimizing.

You need exactly two things to optimize:

1. **A metric** — a function that scores an output. Often **exact-match** for closed tasks, or an [LLM-as-judge](../13-evaluation/06-llm-as-judge.md) for open-ended ones. Without a metric there is literally nothing to optimize toward.
2. **A set of examples** — even **20-100 labeled examples** is enough for modern optimizers.

## DSPy: program your prompts, then compile them

**DSPy** is a framework where you stop writing raw prompt strings. Instead you write **signatures** — a typed input→output spec like `question -> answer` — and compose **modules** such as `ChainOfThought` (think step by step) or `ReAct` (reason + call tools). Then an **optimizer** (historically called a "teleprompter") **compiles** the program: it generates and selects instructions and few-shot demonstrations that maximize your metric. The current line is **DSPy 3.x**, with tight Databricks integration.

The payoff: you debug and improve a *program*, not a fragile string. Swap models, change a module, or re-compile against new data without rewriting prose by hand.

```python
import dspy

# 1. Point DSPy at a model.
dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-4-6"))

# 2. Define a SIGNATURE — a typed input -> output spec.
#    No prompt string; just declare the contract.
class AnswerQuestion(dspy.Signature):
    """Answer a trivia question with a short, factual answer."""
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="a few words, no explanation")

# 3. Pick a MODULE — ChainOfThought wraps the signature with reasoning.
program = dspy.ChainOfThought(AnswerQuestion)

# 4. Define a METRIC — what "good" means. Here, exact match.
def exact_match(example, prediction, trace=None) -> bool:
    return example.answer.lower() == prediction.answer.lower()

# 5. Hand over a small TRAINING SET (20-100 examples is enough).
trainset = [
    dspy.Example(question="Capital of France?", answer="Paris").with_inputs("question"),
    dspy.Example(question="Largest planet?",   answer="Jupiter").with_inputs("question"),
    # ... ~20-100 more
]

# 6. COMPILE: the optimizer searches instructions + few-shot demos
#    to maximize the metric on your data.
optimizer = dspy.MIPROv2(metric=exact_match, auto="light")
optimized_program = optimizer.compile(program, trainset=trainset)

# The result is a program with tuned prompts baked in — call it like any function.
print(optimized_program(question="Tallest mountain on Earth?").answer)
```

Nothing in that code is a hand-written prompt. You declared structure (`AnswerQuestion`, `ChainOfThought`) and a score (`exact_match`), and `compile` produced the actual instructions and examples for you.

## GEPA: reflective, evolutionary optimization

**GEPA (Genetic-Pareto)** is a 2026 prompt optimizer from the paper *"GEPA: Reflective Prompt Evolution Can Outperform RL,"* accepted to **ICLR 2026 as an oral**. Instead of blindly searching, GEPA uses an LLM to **reflect on failures in natural language** — "this answer was wrong because it ignored the date constraint" — and *evolve* the prompt accordingly. It keeps a **Pareto front** of candidate prompts (trading off different objectives) rather than collapsing to a single winner too early.

The authors **report** that GEPA:

- beats the older **MIPROv2** optimizer by **~13%**,
- can beat the reinforcement-learning method **GRPO** by **~20%** while using **~35× fewer rollouts**, and
- works with as few as **~20-100 labeled examples**.

> Treat those as the authors' *reported* results on their benchmarks, not a measurement made here.

GEPA ships **inside DSPy** as `dspy.GEPA` and also as a **standalone package**, so you can drop it in wherever you'd use another optimizer:

```python
# Swap the optimizer line — the rest of the program is unchanged.
optimizer = dspy.GEPA(
    metric=exact_match,        # same metric as before
    auto="light",              # budget for the reflective search
    reflection_lm=dspy.LM("anthropic/claude-opus-4-8"),  # LM that reflects on failures
)
optimized_program = optimizer.compile(program, trainset=trainset)
```

For open-ended tasks where exact-match is meaningless, the metric becomes an [LLM-as-judge](../13-evaluation/06-llm-as-judge.md); when you're optimizing a multi-step agent, the metric is an [agent evaluation](../13-evaluation/095-agent-evaluation.md) score over the whole trajectory.

## Why it matters

Hand-tuned prompts are unmeasured, unportable, and don't survive a model swap — re-tune everything when you move from one model to the next. Programmatic optimization turns prompt quality into an *engineering* problem: it's reproducible (re-run the optimizer), measurable (the metric is the score), and portable (recompile for a new model overnight). With reflective optimizers like GEPA reportedly matching or beating reinforcement learning at a fraction of the cost — and prompt-optimization features increasingly built directly into eval platforms — there's little reason left to tune long-lived prompts purely by hand. The artisanal wording becomes the optimizer's *starting point*, not your weekend.

:::caution[Common pitfalls]
- **No metric, no optimization.** If you can't score an output, there is nothing to optimize toward — defining the metric is the real work, not running `compile`.
- **A weak or gameable metric.** Optimizers will exploit a loose metric ruthlessly; if exact-match rewards verbosity or your LLM-judge is biased, you'll optimize for the wrong thing.
- **Too few or unrepresentative examples.** ~20-100 is enough *if* they reflect production; a tiny, skewed set just overfits the optimizer to your demo.
- **No held-out validation set.** Reporting the score on the same data you optimized on is leakage — keep a separate slice to confirm the gain is real.
- **Re-optimizing on every code change.** Optimization runs cost tokens and time; compile when the task, data, or model changes — not on every commit.
- **Treating reported benchmark numbers as guarantees.** GEPA's "~13% / ~20% / ~35× fewer rollouts" are *reported* results on specific tasks; your mileage depends on your metric and data.
:::

<Quiz id="prompt-optimization-quiz" title="Check yourself: programmatic prompt optimization" sampleSize={3}>
  <Question
    prompt="In DSPy, what is a 'signature'?"
    options={[
      { text: "A cryptographic hash that versions a prompt string" },
      { text: "A typed input→output spec (e.g. question -> answer) you declare instead of writing a raw prompt string" },
      { text: "The few-shot examples the optimizer selects during compilation" },
      { text: "An API key that authenticates calls to the model provider" }
    ]}
    correct={1}
    explanation="A DSPy signature declares the contract — typed inputs and outputs like `question -> answer` — and modules like ChainOfThought wrap it. You declare structure; the optimizer (teleprompter) generates the actual instructions and few-shot demonstrations when you compile."
  />
  <Question
    prompt="What two things must you provide before any optimizer (DSPy or GEPA) can improve your prompts?"
    options={[
      { text: "A fine-tuned base model and a GPU cluster" },
      { text: "A vector database and an embedding model" },
      { text: "A metric that scores outputs, and a set of examples (even ~20-100)" },
      { text: "A registry of versioned prompt strings and an A/B testing harness" }
    ]}
    correct={2}
    explanation="Optimization needs a metric (exact-match, or an LLM-as-judge for open-ended tasks) to define 'good,' and a set of labeled examples to optimize against. Modern optimizers work with as few as ~20-100 examples. Without a metric there's nothing to optimize toward."
  />
  <Question
    prompt="How does GEPA differ from a brute-force prompt search, per its 2026 paper?"
    options={[
      { text: "It uses an LLM to reflect on failures in natural language and evolve prompts, keeping a Pareto front of candidates" },
      { text: "It fine-tunes the model's weights with reinforcement learning instead of changing prompts" },
      { text: "It eliminates the need for any metric by inferring quality automatically" },
      { text: "It only works as a standalone tool and cannot be used inside DSPy" }
    ]}
    correct={0}
    explanation="GEPA (Genetic-Pareto) reflects on failures in natural language to evolve prompts and keeps a Pareto front rather than collapsing early. Authors report it beats MIPROv2 by ~13% and can beat the RL method GRPO by ~20% with ~35× fewer rollouts. It ships both inside DSPy (dspy.GEPA) and standalone — and it still needs a metric."
  />
</Quiz>

---

→ Next: [RAG frameworks](./rag-frameworks.md)
