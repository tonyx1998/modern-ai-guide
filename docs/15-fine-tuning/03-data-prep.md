---
id: ft-data
title: "Data preparation: the dataset IS the product"
sidebar_position: 3
description: Chat/JSONL formats, why quality beats quantity, how many examples you need, sourcing, cleaning, the train/validation split, and synthetic data.
---

# Data preparation: the dataset IS the product

> **In one line:** A fine-tune is *only as good as its dataset* — the model becomes a mirror of the examples you feed it, so 90% of fine-tuning success is data work, and almost every failed fine-tune is a data failure wearing a training-hyperparameter costume.

:::tip[In plain English]
Fine-tuning is teaching by example: you show the model hundreds of "here's the input, here's the perfect response" pairs, and it learns to imitate. So if your examples are inconsistent, the model learns to be inconsistent. If half your examples format dates one way and half another, you've literally trained confusion in. Treat the dataset like the actual product you're shipping — because the model *is* the dataset, compressed.
:::

## The format: chat messages as JSONL

The industry-standard format for fine-tuning a chat model is **JSONL** — one JSON object per line, each object a full conversation. This is what OpenAI, Together, Fireworks, and the Hugging Face ecosystem all expect (with tiny variations).

```json
{"messages": [{"role": "system", "content": "You are a support agent for Acme. Be concise and never promise refunds."}, {"role": "user", "content": "My order hasn't arrived and it's been two weeks."}, {"role": "assistant", "content": "I'm sorry for the delay. I've located order #—— and re-shipped it with express delivery at no charge. You'll get tracking within the hour."}]}
{"messages": [{"role": "system", "content": "You are a support agent for Acme. Be concise and never promise refunds."}, {"role": "user", "content": "How do I change my email?"}, {"role": "assistant", "content": "Go to Settings → Account → Email, enter the new address, and confirm via the link we send. The change takes effect immediately."}]}
```

Key points:

- **One conversation per line.** Each line is independent training data.
- **The `assistant` turn is what the model learns to produce.** During training, the loss is computed (almost always) *only* on the assistant tokens — the model isn't penalized for the user's words, it's penalized for not predicting the ideal *response*. (More on loss in [SFT](./04-sft.md).)
- **Keep the system prompt consistent** across examples if you want consistent behaviour. If you vary it, the model learns to condition on it — sometimes useful, often just noise.
- **Multi-turn conversations** are fine — include the whole exchange; the model learns from each assistant turn.

For non-chat ("completion"/text) fine-tunes you'd use `{"prompt": "...", "completion": "..."}`, but chat format is the default in 2026 and what you should use unless you have a specific reason not to.

## Quality beats quantity — by a lot

The most counterintuitive, most important rule: **a small clean dataset crushes a large messy one.** The landmark result here is the "LIMA" finding — roughly *a thousand carefully curated examples* produced a better-behaved model than tens of thousands of scraped ones. The model is a fast learner; it will faithfully learn your mistakes too.

```text
500 hand-checked, consistent examples   >>>   50,000 scraped, inconsistent ones
```

What "quality" concretely means:

- **Every assistant response is one you'd be proud to ship.** No "I think maybe...", no almost-right answers, no responses that violate your own rules.
- **Consistency.** Same format, same tone, same way of handling edge cases across the whole set. Inconsistency is the #1 silent killer.
- **Coverage of the real distribution.** Include the easy cases *and* the gnarly edge cases you actually see in production, in roughly realistic proportions.
- **No leakage of bad patterns.** If 5% of examples have the model apologizing unnecessarily, you've trained an over-apologizer.

## How many examples do I actually need?

There's no universal number, but practical 2026 guidance:

| Goal | Examples (ballpark) |
| --- | --- |
| Format/structure consistency | 50–200 can already move the needle |
| Tone / voice | 200–1,000 |
| A genuinely new skill or task | 1,000–10,000+ |
| Distillation onto a small model | 1,000–50,000 (cheap to generate) |

Start small. Train on 200, evaluate, and only scale the dataset if the eval says more data will help. Doubling a *clean* dataset is worth more than 10×-ing a dirty one.

## Sourcing the data

Where good examples come from, best to worst:

1. **Real production logs you can edit.** The gold standard — actual inputs your system saw, with responses corrected by a human to be ideal. Real distribution, real edge cases.
2. **Subject-matter experts writing examples.** Slow but high quality for specialized domains.
3. **A frontier model generating examples (synthetic).** Fast and cheap; see below.
4. **Public datasets.** Convenient but rarely match your exact distribution; good for general capabilities, weak for your specific task.

## Cleaning: the unglamorous 80%

Before any line goes into training:

```python
import json

def is_valid(ex: dict) -> bool:
    msgs = ex.get("messages", [])
    if len(msgs) < 2:
        return False
    if msgs[-1]["role"] != "assistant":          # must end on the answer
        return False
    for m in msgs:
        content = m["content"].strip()
        if not content:                            # no empty turns
            return False
        if len(content) > 8000:                    # drop pathological outliers
            return False
    return True

seen, clean = set(), []
with open("raw.jsonl") as f:
    for line in f:
        try:
            ex = json.loads(line)
        except json.JSONDecodeError:
            continue                               # drop malformed lines
        key = json.dumps(ex["messages"], sort_keys=True)
        if key in seen:                            # de-duplicate
            continue
        seen.add(key)
        if is_valid(ex):
            clean.append(ex)

print(f"kept {len(clean)} examples")
```

The checklist that catches most disasters:

- **De-duplicate.** Near-duplicates inflate the count and over-weight some patterns.
- **Validate JSON / format.** One malformed line can crash a training job hours in.
- **Drop PII / secrets** you don't want baked into weights forever. (See [safety](/docs/patterns).)
- **Eyeball a random sample of 50.** Actually read them. You will find problems no script catches.
- **Check label consistency** — are two near-identical inputs getting contradictory ideal answers? Fix it.

## Train/validation split — never skip this

Split your data so you can detect overfitting. The validation set is examples the model **never trains on**, used only to measure honest performance.

```python
import random
random.seed(42)                  # reproducible split
random.shuffle(clean)

n_val = max(20, int(0.1 * len(clean)))   # ~10%, at least 20
val, train = clean[:n_val], clean[n_val:]

for name, rows in [("train.jsonl", train), ("val.jsonl", val)]:
    with open(name, "w") as f:
        for r in rows:
            f.write(json.dumps(r) + "\n")
print(f"train={len(train)}  val={len(val)}")
```

Why it matters: training loss always goes down (the model can memorize). **Validation** loss tells you whether it's *learning the task* or just *memorizing your examples*. When training loss keeps dropping but validation loss starts rising, you're overfitting — stop. (See [SFT](./04-sft.md).)

Keep a *third*, separate **held-out eval set** that you never look at during iteration, for the final "did it work" verdict — that lives in the [evaluation chapter](/docs/evaluation).

## Synthetic data: generating examples with a frontier model

When you don't have enough real examples, you can have a strong model generate them. This is cheap, fast, and surprisingly effective — *if* you control quality.

```python
from openai import OpenAI
client = OpenAI()

SEED_TOPICS = ["refund request", "shipping delay", "password reset",
               "billing dispute", "feature question"]

def make_example(topic: str) -> dict:
    r = client.chat.completions.create(
        model="gpt-4.1",                 # the strong "teacher"
        messages=[
            {"role": "system", "content":
             "Generate ONE realistic Acme support exchange about the given topic. "
             "Return JSON: {\"user\": str, \"assistant\": str}. "
             "The assistant must be concise and never promise refunds."},
            {"role": "user", "content": f"Topic: {topic}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.9,                 # variety across examples
    )
    import json
    ex = json.loads(r.choices[0].message.content)
    return {"messages": [
        {"role": "system", "content": "You are a support agent for Acme. Be concise and never promise refunds."},
        {"role": "user", "content": ex["user"]},
        {"role": "assistant", "content": ex["assistant"]},
    ]}
```

Rules for synthetic data that doesn't backfire:

- **Seed for diversity.** Loop over many topics/personas; high temperature. Otherwise you get 500 near-identical examples.
- **Filter the output.** Run a second model (or rules) to reject low-quality or rule-violating generations *before* they enter the set.
- **Don't train a model to imitate its own mistakes.** If the teacher is weak, the student inherits the weakness. Use the strongest teacher you can afford — this is the bridge to [distillation](./07-distillation.md).
- **Mix in real data** when you have it; pure synthetic can drift from the real distribution.

## Common pitfalls

:::caution[Where people trip up]
- **Treating data as an afterthought and tuning hyperparameters instead.** It's almost always the data. Read your examples.
- **Inconsistent labels/format.** Two similar inputs with contradictory ideal answers teach the model to be random. Pick one convention and enforce it.
- **No validation split.** You can't see overfitting without it, so you'll happily ship a model that memorized 300 examples and generalizes to nothing.
- **Massive but dirty.** Scraping 100k noisy examples feels productive and produces a worse model than 500 clean ones.
- **Synthetic data with no diversity or no filtering.** You either get repetitive examples or you bake the teacher's errors into the student.
- **Leaving PII/secrets in.** Once it's in the weights, you can't grep it out. Redact before training.
:::

<Quiz id="ft-data-quick-check" variant="micro" title="Quick check">

<Question
  prompt="You can ship either 500 hand-checked, consistent examples or 50,000 scraped, inconsistent ones. Which does this page say wins, and why?"
  options={[
    { text: "The 500 clean examples — the model is a mirror of its data and faithfully learns your mistakes, so a small curated set beats a large messy one (the LIMA finding)" },
    { text: "The 50,000 — more data always wins; noise averages out during training" },
    { text: "Neither — you need at least 100,000 examples for any fine-tune to work" },
    { text: "The 50,000, but only if you train for fewer epochs" }
  ]}
  correct={0}
  explanation="Quality beats quantity by a lot: inconsistent examples literally train inconsistency in, while ~a thousand curated examples produced better behaviour than tens of thousands of scraped ones. 'Noise averages out' is the tempting big-data intuition — but the model learns the noise as faithfully as the signal."
/>

<Question
  prompt="In chat-format training data, half your examples format dates one way and half another. What will the fine-tuned model do?"
  options={[
    { text: "Learn the more common format and ignore the rarer one" },
    { text: "Refuse to output dates due to the conflict" },
    { text: "Behave inconsistently — you trained the confusion in, since two conventions for similar inputs teach the model to be random" },
    { text: "Average the two formats into a hybrid" }
  ]}
  correct={2}
  explanation="The model imitates whatever distribution you show it; contradictory conventions on similar inputs make the output a coin flip. 'It learns the majority' is tempting because models do follow frequency, but at 50/50 there is no majority — inconsistency is named the #1 silent killer, and the fix is picking one convention and enforcing it across the set."
/>

<Question
  prompt="A team trains without a validation split. Training loss drops beautifully and they ship. What risk did they take, per this page?"
  options={[
    { text: "None — falling training loss is the definition of a successful run" },
    { text: "The job may have crashed silently without a validation file" },
    { text: "The model may train slower without validation batches" },
    { text: "They can't tell learning from memorizing — training loss always falls, and only validation loss reveals whether the model generalizes" }
  ]}
  correct={3}
  explanation="Training loss can hit zero by pure memorization, so it tells you nothing about behaviour on new inputs; the validation set — examples never trained on — is the only honest signal. 'Falling loss = success' is the exact trap: you'll happily ship a model that memorized 300 examples and generalizes to nothing."
/>

</Quiz>

---

→ Next: [Supervised fine-tuning (SFT) from scratch](./04-sft.md)
