---
id: mm-world-models
title: World models & embodied AI
sidebar_position: 8.5
description: A literacy tour of the frontier where AI moves beyond text and screens — world models that simulate "what happens if I do X," and embodied VLA models that turn a camera frame plus an instruction into a robot action.
---

# World models & embodied AI

> **In one line:** A *world model* learns the dynamics of an environment so it can simulate "what happens if I do X" — and *embodied AI* bolts that onto a body, mapping camera input plus a language instruction straight to actions; both are early, fast-moving, and worth reading rather than betting a roadmap on.

:::tip[In plain English]
Most models you've met describe the world: they label a picture or answer a question. A **world model** instead runs a little simulator in its head — give it the current situation and a possible action, and it predicts what happens next. That's the difference between a tour guide and a flight simulator. Once you have that simulator, an agent can *imagine* the consequences of moves before committing, and you can train it on imagined rollouts instead of expensive real-world tries. **Embodied AI** is the same idea wearing a robot: a camera and a spoken instruction go in, a motor command comes out.
:::

## What a world model actually is

A **world model** learns the *dynamics* of an environment: given a state and an action, predict the next state. Formally it approximates a transition function `predict(state, action) -> next_state`. The payoff is two-fold:

- **Planning.** An agent can roll the simulator forward over candidate actions and pick the one with the best predicted outcome — "what happens if I do X" — without touching the real environment.
- **Training in imagination.** You can train an agent on rollouts generated *by the world model itself*, which is far cheaper and safer than millions of real trials.

This is the conceptual cousin of the planning you saw in [reasoning models](../01-foundations/reasoning-models.md): there the model reasons over tokens before answering; here it reasons over predicted future *states* before acting.

## Two camps (an unresolved debate)

The field is split on *what space* a world model should predict in. Present this as a live, undecided argument — not a solved problem.

- **Generative / pixel-space models** predict future *frames* (essentially video). If the model can render a plausible next image given your action, the claim goes, it has learned the world. Examples: DeepMind **Genie** (generates interactive playable worlds; a public prototype appeared in early 2026), **World Labs** (Fei-Fei Li's company, ~$1B funding, product "Marble"), and NVIDIA **Cosmos**.
- **Latent / abstract-prediction models** predict in a *learned abstract space* rather than reconstructing every pixel. This is the **JEPA** (Joint-Embedding Predictive Architecture) line associated with Yann LeCun — e.g. Meta's **V-JEPA**. The thesis: predicting every pixel wastes capacity on irrelevant detail (exact leaf textures, sensor noise) and is the wrong objective. LeCun left Meta in 2026 to start a company (AMI Labs) centered on this bet.

The headline open question — **"are video-generation models actually world models?"** — sits right on this fault line. The generative camp says a good enough video predictor *is* a world model; the JEPA camp says pixel reconstruction optimizes the wrong thing. There is no settled winner as of this writing, and this whole section is fast-moving — treat names, funding, and products as a snapshot, not a leaderboard.

## Embodied AI: from pixels to motors

**Embodied AI** puts a model in a physical (or simulated) body. The current workhorse is the **VLA (vision-language-action) model**: it maps camera input *plus* a language instruction directly to robot actions, end to end, without a hand-written planner in between.

Fast-moving 2026 examples — read these as **demos and early products, not mass-market shipping**:

- **Figure** — the Figure 03 humanoid, driven by their "Helix" VLA.
- **1X** — the Neo home robot; note that early units reportedly lean heavily on **teleoperation** (a human operator) rather than full autonomy.
- **Google Gemini Robotics On-Device** — a VLA aimed at running locally on the robot.
- **NVIDIA Isaac GR00T** — foundation models for humanoid robots.

A recurring training trick is **sim-to-real**: train the policy in a fast, cheap simulator, then transfer it to a physical robot. The core difficulty is the **reality gap** — simulators never perfectly match real friction, lighting, and sensor noise, so a policy that's flawless in sim can flail in the real world.

## Traced walkthrough: a VLA turning a frame into an action

No runnable code here — this is a frontier literacy lesson — so let's trace one step of a VLA's perceive → decide → act → observe loop. Instruction: *"pick up the red mug."*

1. **Perceive.** A camera frame arrives (say 640×480 RGB) plus the instruction text. The vision encoder turns the frame into visual tokens (this is the same kind of encoder from the [vision page](./02-vision.md)); the instruction is tokenized into language tokens.
2. **Fuse.** Visual and language tokens go into a shared transformer. Grounding happens here: the model associates the words "red mug" with the region of the image where the red mug is.
3. **Decide.** The model outputs an **action token** (or a short chunk of them) — not English, but a representation of a motor command: e.g. an end-effector target like *move gripper to (x, y, z), rotate, close gripper*. Conceptually:

   ```text
   (camera_frame, "pick up the red mug")
        → encode → fuse → decode
        → action: move_to(0.42, -0.15, 0.30); grip(close)
   ```
4. **Act.** A low-level controller executes that command on the arm.
5. **Observe.** A new camera frame comes back; the loop repeats at high frequency. The gripper is closer, the model re-predicts the next chunk, and so on until the mug is lifted.

The thing to notice: it's the *same* perceive → decide → act → observe loop you already know from screen-based agents — only the "act" step drives motors instead of clicking buttons, and "observe" is a fresh camera frame instead of a DOM.

## Why it matters

For an AI engineer, the significance is less "go build a robot" and more **a paradigm expanding under your feet**. The agent loop you've been using — perceive context, decide, call a tool, observe the result — is the *same loop* whether the "tools" are a browser and an API or a gripper and a camera. World models add the ability to *simulate* before acting, which is exactly the planning capability agents have been missing. So the frontier is widening from acting on screens to acting in physical and simulated environments, and the mental model transfers cleanly. The honest caveat: this is early. Humanoid autonomy is often partly teleoperated at launch, glossy demos are not shipped products, and timelines are genuinely uncertain. Treat this as literacy and watching — something to track and reason about — not a production checklist you're behind on.

:::caution[Common pitfalls]
- **Over-hyping timelines.** "Robots everywhere next year" has been said for many years. The perceive-act loop generalizing is real; the *deployment* timeline is uncertain — hedge hard on dates.
- **Conflating a demo with a shipping product.** A cinematic humanoid clip may be partly teleoperated, cherry-picked, or a controlled-environment one-off. Ask what's autonomous, what's repeatable, and what's for sale.
- **Assuming "video generator" = "world model."** Whether pixel-prediction yields true dynamics is an open debate (generative vs. JEPA), not a settled fact. Don't pick a winner reflexively.
- **Ignoring the reality gap.** Sim-to-real is the hard part; a policy that's perfect in simulation can fail on real friction, lighting, and sensor noise.
- **Forgetting the safety stakes change.** A hallucinating chatbot writes bad text; a mispredicting embodied agent moves a physical arm. The cost of being wrong is no longer just a refund.
- **Treating this as a build checklist.** It's frontier literacy. Read it to reason about the space and place small bets — not to feel behind because you haven't shipped a robot.
:::

<Quiz id="world-models-quiz" title="Check yourself: world models & embodied AI" sampleSize={3}>
  <Question
    prompt="What distinguishes a *world model* from an ordinary model that describes the world?"
    options={[
      { text: "It generates higher-resolution images than a standard diffusion model" },
      { text: "It learns the environment's dynamics — given a state and an action, it predicts the next state — so it can simulate 'what happens if I do X'" },
      { text: "It only works on text inputs and cannot process camera frames" },
      { text: "It guarantees a robot will never make a mistake in the real world" }
    ]}
    correct={1}
    explanation="A world model approximates the transition function: state + action → next state. That predictive simulation is what enables planning and training agents in imagination — the key difference from a model that merely describes or labels."
  />
  <Question
    prompt="The debate 'are video-generation models actually world models?' pits which two camps against each other?"
    options={[
      { text: "Supervised vs. unsupervised learning" },
      { text: "Open-source vs. closed-source model providers" },
      { text: "Generative/pixel-space prediction vs. latent/abstract-space prediction (the JEPA line)" },
      { text: "Cloud robots vs. on-device robots" }
    ]}
    correct={2}
    explanation="One camp says predicting future pixels/frames yields a world model; the JEPA camp argues pixel reconstruction is the wrong objective and prediction should happen in a learned abstract space. It's an unresolved debate — there's no declared winner."
  />
  <Question
    prompt="A VLA (vision-language-action) model receives a camera frame and the instruction 'pick up the red mug.' What does it output?"
    options={[
      { text: "A representation of a robot action (e.g. a motor/end-effector command), produced end to end from the frame plus instruction" },
      { text: "A long English essay explaining what a mug is" },
      { text: "A FID score measuring image quality" },
      { text: "Nothing until a human hand-writes a planner for the task" }
    ]}
    correct={0}
    explanation="A VLA maps vision + language directly to actions, end to end. It emits action tokens that a low-level controller executes — then a new frame comes back and the perceive → decide → act → observe loop repeats."
  />
</Quiz>

---

→ Next: [Chapter checkpoint](./99-checkpoint.md)
