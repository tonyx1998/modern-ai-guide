---
id: fine-tuning-checkpoint
title: Chapter 7 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Mandatory checkpoint quiz for Chapter 7 — Fine-tuning & Customization. 12 questions, 5 shown at random. Pass to unlock the next chapter.
---

# Chapter 7 Checkpoint

You've finished the fine-tuning chapter. Make sure the core ideas stuck — when to fine-tune at all, building the dataset, SFT, LoRA/QLoRA, preference tuning, distillation, evaluation, and serving.

There are **12 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page to revisit.

You must pass (≥ 60%) to unlock the Next button and Chapter 8 in the sidebar.

<Quiz id="fine-tuning-checkpoint" title="Fine-tuning & Customization checkpoint" sampleSize={5}>

<Question
  prompt="Your support bot keeps giving wrong answers about your current refund policy, which changed last week. What should you reach for?"
  options={[
    { text: "RAG — retrieve the current policy document at query time; fine-tuning bakes in facts that go stale and invents details it didn't memorize" },
    { text: "Fine-tune the model on examples of the new policy" },
    { text: "Preference tuning with chosen/rejected policy answers" },
    { text: "Distill a small model that knows the policy" }
  ]}
  correct={0}
  explanation="Fine-tuning teaches behaviour and format, not reliable, fresh facts. Knowledge that changes — policies, prices, inventory — belongs in RAG, which you can re-index instantly. A fine-tune on the new policy would sound authoritative and still hallucinate, and it'd be wrong again the next time the policy changes."
  revisit={{ to: "/docs/fine-tuning/ft-when", label: "When to fine-tune (and when not)" }}
/>

<Question
  prompt="You have 50,000 scraped, inconsistent examples and a colleague has 500 hand-checked, consistent ones. For a quality fine-tune, which dataset wins?"
  options={[
    { text: "The 50,000 — more data always helps a model generalize" },
    { text: "The 500 clean ones — quality beats quantity; the model faithfully learns your inconsistencies too, so a small consistent set produces a better-behaved model" },
    { text: "Neither matters; hyperparameters decide the outcome" },
    { text: "Combine both raw — volume plus variety is best" }
  ]}
  correct={1}
  explanation="The model is the dataset, compressed. It learns your mistakes and inconsistencies just as faithfully as your good examples. A small, consistent, hand-checked set reliably beats a large noisy one (the classic 'a thousand good examples' finding). Most failed fine-tunes are data failures."
  revisit={{ to: "/docs/fine-tuning/ft-data", label: "The dataset IS the product" }}
/>

<Question
  prompt="During training your training loss keeps dropping but your validation loss starts rising. What's happening and what do you do?"
  options={[
    { text: "Everything's fine — keep training until training loss is near zero" },
    { text: "Overfitting — the model is memorizing the training set; stop training (early-stop) at the validation-loss minimum, or use fewer epochs / more data" },
    { text: "The learning rate is too low; raise it sharply" },
    { text: "The validation set is broken; delete it and trust training loss" }
  ]}
  correct={1}
  explanation="Training loss always falls (the model can memorize). When validation loss turns upward while training loss keeps dropping, the model is memorizing rather than generalizing — the definition of overfitting. Fix with early stopping, fewer epochs, lower LR, or more/cleaner data."
  revisit={{ to: "/docs/fine-tuning/ft-sft", label: "SFT: overfitting" }}
/>

<Question
  prompt="In supervised fine-tuning of a chat model, which tokens is the loss computed on?"
  options={[
    { text: "Every token in the conversation, including the user's messages" },
    { text: "Only the assistant (completion) tokens — you want the model to learn to RESPOND well, not to generate the user's questions" },
    { text: "Only the system prompt tokens" },
    { text: "A random 50% sample of all tokens" }
  ]}
  correct={1}
  explanation="Loss is masked to the assistant turns ('completion-only' training). You penalize the model for not predicting the ideal RESPONSE, not for failing to predict the user's words. That's why your assistant responses must be the part that's perfect — and why frameworks like TRL handle the masking for you."
  revisit={{ to: "/docs/fine-tuning/ft-sft", label: "SFT: loss masking" }}
/>

<Question
  prompt="What is the central mechanism that makes LoRA so cheap to train?"
  options={[
    { text: "It deletes most of the model's layers before training" },
    { text: "It trains the whole model but in 4-bit precision" },
    { text: "It caches the model's outputs so it never has to recompute them" },
    { text: "It freezes the full weight matrix W and learns a tiny low-rank update ΔW = B·A (with rank r ≪ dimensions), so you train under ~1% of the parameters" }
  ]}
  correct={3}
  explanation="LoRA bets that the needed change is low-rank: it freezes W and learns two skinny matrices A (r×k) and B (d×r) whose product approximates the update. With r=16 on a 4096×4096 matrix that's ~0.8% of the parameters — which is why adapters are megabytes and fit on one GPU."
  revisit={{ to: "/docs/fine-tuning/ft-lora", label: "LoRA: low-rank adapters" }}
/>

<Question
  prompt="You want to fine-tune a 70B model but only have a single (large) GPU. What's the standard approach?"
  options={[
    { text: "Full fine-tuning in bf16 — it's the only way to get quality" },
    { text: "QLoRA — load the frozen base in 4-bit (cutting its memory ~4×) and train small LoRA adapters in 16-bit on top, which fits a 70B model on one big GPU" },
    { text: "Train on CPU to avoid the memory limit" },
    { text: "Reduce the dataset to 10 examples so it fits" }
  ]}
  correct={1}
  explanation="QLoRA = quantized 4-bit frozen base + LoRA adapters. The base is frozen, so low precision is fine; the trainable part is already tiny. A 70B model drops from ~140 GB (bf16) to ~35 GB in 4-bit — trainable on one high-memory GPU, with only a small quality cost."
  revisit={{ to: "/docs/fine-tuning/ft-lora", label: "QLoRA & memory math" }}
/>

<Question
  prompt="In the LoRA alpha/rank convention, what does raising alpha (relative to rank) do?"
  options={[
    { text: "It increases the number of trainable parameters" },
    { text: "Nothing — alpha is purely cosmetic" },
    { text: "It scales the adapter's contribution by α/r, so a higher alpha makes the adapter's effect stronger (a common convention is α = 2r)" },
    { text: "It quantizes the base model to fewer bits" }
  ]}
  correct={2}
  explanation="The adapter output is scaled by α/r before being added to the frozen weights, so alpha controls how strongly the adapter influences the model — not how many parameters it has. A common starting point is α = 2r (e.g. r=16, α=32); tune only if evals disappoint."
  revisit={{ to: "/docs/fine-tuning/ft-lora", label: "Rank & alpha" }}
/>

<Question
  prompt="You want to align a model's tone and helpfulness — qualities you can compare but can't easily author a single 'perfect' answer for. Which technique fits, and what's the practical default?"
  options={[
    { text: "More SFT — just write more ideal examples" },
    { text: "Preference tuning on chosen/rejected pairs; the practical 2026 default is DPO (and its successors), which skips the separate reward model and RL loop that RLHF/PPO require" },
    { text: "RAG over a tone style guide" },
    { text: "Quantization to change the model's personality" }
  ]}
  correct={1}
  explanation="When you can compare two outputs but not author the one perfect answer, you use preference tuning on chosen/rejected pairs. RLHF (reward model + PPO) is the original, fiddly recipe; DPO optimizes preferences directly with no separate reward model and no RL loop, so it's the stable, low-pain default. Always start from an SFT model."
  revisit={{ to: "/docs/fine-tuning/ft-preference", label: "Preference tuning: RLHF & DPO" }}
/>

<Question
  prompt="What does the RLHF pipeline use a reward model for?"
  options={[
    { text: "To generate the final responses shown to users" },
    { text: "To output a scalar 'goodness' score for responses, which PPO then optimizes the policy model to maximize (with a KL penalty keeping it near the SFT model)" },
    { text: "To store the training data" },
    { text: "To quantize the policy model to 4-bit" }
  ]}
  correct={1}
  explanation="RLHF trains a reward model on preference pairs so it scores how 'good' a response is, then uses PPO to nudge the policy toward higher-scoring outputs — with a KL penalty preventing it from drifting into degenerate, reward-hacking territory. DPO's insight is you can skip the reward model and RL entirely."
  revisit={{ to: "/docs/fine-tuning/ft-preference", label: "RLHF: reward model + PPO" }}
/>

<Question
  prompt="You have a great prompt that works on an expensive frontier model with a 2,000-token system prompt, but it costs too much at scale. What's the highest-ROI fine-tuning move?"
  options={[
    { text: "Distillation — use the frontier model as a 'teacher' to generate input→ideal-output pairs, then fine-tune a small cheap 'student' that bakes in the behaviour and needs almost no prompt" },
    { text: "Fine-tune the frontier model itself to make it cheaper" },
    { text: "Preference-tune the frontier model on cost" },
    { text: "Add more few-shot examples to the prompt" }
  ]}
  correct={0}
  explanation="Distillation transfers a narrow skill from a big teacher into a small student: the teacher labels a dataset, you SFT the student on it. The student can be 10–50× cheaper and far faster, with the behaviour baked in so it needs almost no prompt. It only matches the teacher on the trained distribution — which is exactly what you want for one narrow job."
  revisit={{ to: "/docs/fine-tuning/ft-distillation", label: "Distillation: teacher → student" }}
/>

<Question
  prompt="Your fine-tune scores 82% on your target task. What single comparison turns that number into a real result, and what else must you check?"
  options={[
    { text: "Nothing — 82% is clearly good enough to ship" },
    { text: "Compare against the BASE model on the same held-out set (e.g. 82% vs 61%), AND run a regression suite to catch catastrophic forgetting on off-task abilities and safety" },
    { text: "Compare against the training loss curve" },
    { text: "Re-run the fine-tune with a different random seed and average" }
  ]}
  correct={1}
  explanation="A score with no baseline is meaningless — always compare fine-tuned vs base on the same held-out set the model never trained on. And fine-tuning hard on one task can degrade others (catastrophic forgetting) and erode safety, so run a regression/capability suite too. A model better at the target but broken elsewhere is a regression you shouldn't ship."
  revisit={{ to: "/docs/fine-tuning/ft-evaluating", label: "Evaluating fine-tunes" }}
/>

<Question
  prompt="You need to serve 50 different per-customer fine-tunes built on the same base model, on a tight GPU budget. What's the efficient pattern?"
  options={[
    { text: "Load 50 full copies of the model, one per customer" },
    { text: "Merge all 50 adapters into one model and prompt it to pick a customer" },
    { text: "Round-robin: redeploy the server with a different model every hour" },
    { text: "Multi-adapter LoRA serving — load the shared base ONCE and hot-swap the tiny per-customer LoRA adapter per request (e.g. vLLM --enable-lora), so 50 tunes run on a handful of GPUs" }
  ]}
  correct={3}
  explanation="A LoRA adapter is a tiny overlay on a frozen base. Load the expensive base once and attach many MB-sized adapters, routing each request to the right one by name. That's one base + 50 adapters on a few GPUs instead of 50 full copies — and it's how hosted platforms serve fine-tunes cheaply under the hood."
  revisit={{ to: "/docs/fine-tuning/ft-serving", label: "Serving: multi-adapter LoRA" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 8: Multimodal & Voice AI](/docs/multimodal) — beyond text: building with vision, images, audio, and realtime voice.
