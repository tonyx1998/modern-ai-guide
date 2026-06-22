---
id: ft-rl
title: Reinforcement learning for LLMs
sidebar_position: 6.5
description: The modern post-training RL paradigm beyond DPO — RLHF recap, GRPO's group-relative trick, RLVR's verifiable rewards, and the agentic-RL frontier.
---

# Reinforcement learning for LLMs

> **In one line:** Where SFT copies worked examples and DPO ranks pairs, true RL lets the model *try* answers, *scores* each attempt, and pushes toward the ones that scored higher — which is how 2026 models learned to reason and act as agents.

:::tip[In plain English]
SFT is learning from a textbook's solved problems; you copy the steps. RL is learning from a coach: you attempt a problem your own way, the coach tells you how well it went, and you adjust to do more of what worked. The breakthrough of the last year is *what the coach can be* — not just a human's thumbs-up, but an **automatic checker** ("did the unit tests pass? did the math answer match?"). A free, un-gameable coach you can run millions of times is what unlocked reasoning and agentic models.
:::

## Where we left off: RLHF and DPO

The [previous lesson](./06-preference-tuning.md) covered the alignment side of RL. A one-paragraph recap so this page stands on its own:

- **RLHF** (Reinforcement Learning from Human Feedback): train a **reward model** on human preference comparisons, then use RL — classically **PPO** (Proximal Policy Optimization) — to push the policy toward higher-reward outputs. PPO needs a *separate critic/value network* to estimate how good a state is, which is half the cost and most of the instability.
- **DPO** (Direct Preference Optimization): skip the reward model and the RL loop entirely; optimize *directly* on chosen-vs-rejected pairs. Simpler and stable, but it's an **offline preference method**, not true on-policy RL — the model never generates fresh attempts and gets scored on them.

This lesson is about the on-policy methods that came *after* DPO and now dominate reasoning and agentic post-training.

## GRPO: RL without a critic

**GRPO** (Group Relative Policy Optimization), introduced by DeepSeek, is the dominant reasoning-RL algorithm of 2026. Its trick solves PPO's biggest cost.

PPO asks: "was this response better than the critic *predicted*?" — so it needs a critic network. GRPO replaces the critic with a dead-simple baseline: **sample a whole group of responses to the same prompt, and ask whether each one beat the group's own average.** No second network to train.

```python
# GRPO-style loop (one prompt) — illustrative pseudo-code
def grpo_step(prompt, policy, reward_fn, group_size=8):
    # 1) Sample a GROUP of responses from the current policy
    group = [policy.generate(prompt) for _ in range(group_size)]

    # 2) Score each one with a reward / verifier (see RLVR below)
    rewards = [reward_fn(prompt, r) for r in group]   # e.g. 1.0 if tests pass, else 0.0

    # 3) Advantage = how much better than the GROUP AVERAGE (this replaces PPO's critic)
    mean, std = avg(rewards), stdev(rewards) + 1e-6
    advantages = [(r - mean) / std for r in rewards]   # normalize within the group

    # 4) Push the policy UP on above-average responses, DOWN on below-average ones
    for response, adv in zip(group, advantages):
        for token in response:
            # increase token prob when adv > 0, decrease when adv < 0,
            # clipped so no single step moves the policy too far (the "P" in PPO)
            policy.update(token, direction=adv)
```

The intuition: if six of eight attempts at a math problem are wrong and two are right, the two right ones have positive advantage and get reinforced — *relative to this prompt's own difficulty*, no global value estimate required. That relative-within-the-group normalization is why it's cheaper and more stable at scale than PPO.

You'll meet **variants and successors** — **DAPO**, **GSPO**, **Dr. GRPO** — that tweak the clipping, normalization, or sequence-vs-token weighting. A notable common change: the **KL-penalty term** (the leash to the original model) is often **dropped** entirely for reasoning runs, because a verifiable reward is hard to hack, so you *want* the model free to roam toward correct reasoning.

## RLVR: let a verifier be the reward

The reward function above quietly did the heavy lifting. **RLVR** (RL with Verifiable Rewards) is the idea that the reward should come not from a *learned* reward model but from an **automatic verifier**:

- Math: does the final answer match the known solution?
- Code: do the unit tests pass?
- Proofs / formal logic: does the proof checker accept it?

This is why RLVR now dominates math, code, and reasoning post-training: the signal is **cheap** (run a script, not a labeling team) and **not gameable** (a verifier can't be sweet-talked the way a learned reward model can be reward-hacked). It pairs naturally with GRPO — the verifier *is* the `reward_fn`.

The catch is **the verifier problem**: for open-ended, subjective tasks — tone, helpfulness, "is this email tactful?" — there's no automatic checker. For those you fall back to learned reward models or preference methods (DPO-family). The practical split today:

- **Verifiable task** (math, code, tool-correctness) → RLVR + GRPO.
- **Subjective task** (tone, alignment, refusal feel) → preference tuning (DPO family); see [reasoning models](../01-foundations/reasoning-models.md) for how these stack.

## Agentic RL: the 2026 frontier

The fast-moving edge extends RL from single answers to whole **trajectories**: a multi-turn episode where the model plans, calls tools, reads results, and tries again. Instead of scoring one response, you reward **cumulative task success over the long horizon** — did the agent actually book the trip, fix the bug, close the ticket?

The hard part isn't the algorithm (still GRPO-flavored); it's **rollout throughput**. Generating a full multi-step trajectory with real tool calls is slow, and RL needs millions of them. The bottleneck is addressed with **async rollouts** — decoupling trajectory generation from the gradient update so GPUs aren't idling between turns.

## A note on the tooling

You don't implement the loop above by hand. **Unsloth** runs memory-efficient GRPO on a single GPU; **TRL**, **Axolotl**, and **verl** cover the broader spectrum up to multi-node agentic runs. The training shape mirrors SFT — point it at a prompt set plus a reward/verifier function — but the *data engineering* shifts from "write good examples" to "write a reward you trust."

## Why it matters

RL is what separates a model that *recites* reasoning from one that *discovers* it. SFT can teach a model to imitate chain-of-thought it has seen; RLVR lets it search over its own attempts and keep what actually solves the problem — which is how the reasoning and agentic gains of the last year happened.

But notice where you sit on the ladder. Most teams do **not** do RL. The default progression is **Prompt → RAG → SFT/LoRA → preference tuning**, and RL (RLVR/GRPO) is a **specialist final step** for when you have a *verifiable reward* and need to push reasoning or agentic behavior past what SFT delivers. The old rule still holds: **fine-tune for form, not facts** — RAG wins facts, and RL wins hard, checkable *skills*. And "RLHF is dead" is an overstatement: it survives, mostly as a DPO-family *preference* stage for alignment and tone, just rarely as PPO. See [when to fine-tune](./02-when-to-finetune.md) for where this falls in the overall decision.

:::caution[Common pitfalls]
- **Reaching for RL before you've earned it.** If you haven't exhausted prompting, RAG, and SFT, RL is premature — it's the most expensive, most fiddly rung on the ladder, not a shortcut.
- **No trustworthy verifier.** RLVR's whole advantage is an un-gameable reward. If your "verifier" is loose (regex on free text, a weak LLM judge), the model will find and exploit its gaps — you've reinvented reward hacking.
- **Treating it as a knowledge fix.** RL sharpens *skills the model can practice and have checked* (math, code, tool use). It will not inject facts — that's RAG's job.
- **Underestimating rollout cost.** Especially in agentic RL, generating trajectories — not the gradient step — is the bottleneck. Budget for async rollouts and serving throughput, not just GPUs for training.
- **Blindly dropping the KL leash.** Removing the KL penalty is common for strongly-verifiable reasoning runs, but on softer rewards it invites collapse and degenerate outputs. Match the leash to how gameable your reward is.
- **Chasing benchmark deltas you can't reproduce.** Reported GRPO/RLVR gains are real but setup-sensitive. Evaluate on *your* held-out tasks, not the reward signal you trained on.
:::

<Quiz id="rl-for-llms-quiz" title="Check yourself: RL for LLMs" sampleSize={3}>
  <Question
    prompt="What is GRPO's central trick that makes it cheaper and more stable than PPO?"
    options={[
      { text: "It trains a larger, more accurate reward model than PPO uses" },
      { text: "It samples a GROUP of responses per prompt and uses each one's advantage relative to the group average, removing the need for a separate critic/value network" },
      { text: "It replaces reinforcement learning with supervised fine-tuning on preference pairs" },
      { text: "It runs entirely offline on a fixed dataset, so no generation is needed" }
    ]}
    correct={1}
    explanation="PPO needs a separate critic to estimate how good a state is. GRPO sidesteps that: for each prompt it samples a group of responses and computes each response's advantage relative to the group's own average reward, so no critic network is required — cheaper and more stable at scale."
  />
  <Question
    prompt="What defines RLVR (RL with Verifiable Rewards), and what is its main open limitation?"
    options={[
      { text: "The reward comes from an automatic verifier (tests pass, math matches); the limitation is the 'verifier problem' — subjective tasks like tone have no automatic checker" },
      { text: "The reward comes from a human labeler in real time; the limitation is labeling cost" },
      { text: "It only works for image generation; the limitation is GPU memory" },
      { text: "It eliminates the policy model; the limitation is that it cannot generate text" }
    ]}
    correct={0}
    explanation="RLVR draws its reward from an automatic verifier rather than a learned reward model — cheap and not gameable, which is why it dominates math/code/reasoning post-training. The open challenge is the verifier problem: open-ended, subjective tasks (tone, helpfulness) have no automatic verifier, so you fall back to learned reward models or preference methods."
  />
  <Question
    prompt="A team has a customer-support model that's competent but slightly off in tone. They have no automatic way to check 'good tone.' What's the right tool?"
    options={[
      { text: "RLVR with GRPO — write a verifier for tone and run reasoning-style RL" },
      { text: "Agentic RL with async rollouts over multi-turn trajectories" },
      { text: "Preference tuning (a DPO-family stage), since tone is subjective and has no automatic verifier" },
      { text: "PPO from the raw base model with a dropped KL penalty" }
    ]}
    correct={2}
    explanation="Tone is exactly the subjective case where the verifier problem bites — there's no automatic checker, so RLVR/GRPO don't apply. This is where RLHF survives in 2026: a DPO-family preference stage for alignment and tone, run on top of an already-competent SFT model. RL with verifiable rewards is for checkable skills like math and code."
  />
</Quiz>

---

→ Next: [Distillation](./07-distillation.md)
