---
id: evaluation-checkpoint
title: Chapter 5 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Mandatory checkpoint quiz for Chapter 5 — Evaluation & Measurement. 12 questions, 5 shown at random. Pass to unlock the next chapter.
---

# Chapter 5 Checkpoint

You've learned to turn "it looks good to me" into a number you can trust: why evals are the whole game, the types and the pyramid, how to build datasets and pick metrics, how to build and calibrate an LLM-judge, when humans are required, how to gate CI on regressions, and how to evaluate in production with a data flywheel. This quiz checks that it stuck.

There are **12 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page to revisit.

You must pass (≥ 60%) to unlock the Next button and Chapter 6 in the sidebar.

<Quiz id="evaluation-checkpoint" title="Evaluation & Measurement checkpoint" sampleSize={5}>

<Question
  prompt="An engineer tweaks a prompt, runs two examples in the playground, decides 'yeah, better,' and ships. A week later users hit broken cases the engineer never re-checked. The chapter names the core flaw in this approach. What is it?"
  options={[
    { text: "The playground was too slow, so the engineer rushed" },
    { text: "Vibe-checking doesn't scale — you only look at the cases you remember, can't compare versions fairly, and silent regressions ship on everything you didn't eyeball" },
    { text: "Two examples is fine; the real problem was not using a flagship model" },
    { text: "The engineer should have checked a public benchmark like MMLU instead" }
  ]}
  correct={1}
  explanation="The 'why evals' page is explicit: a playground look is a feeling, not a measurement. It only covers what you remember to check, can't be compared apples-to-apples, and lets regressions ship invisibly. Public benchmarks don't fix this — they don't know your task. The fix is an eval-driven loop where every change gets a number."
  revisit={{ to: "/docs/evaluation/eval-why", label: "Why vibes don't scale" }}
/>

<Question
  prompt="A RAG support bot is hallucinating. Before touching the generation prompt, the chapter says to run which kind of eval to localize the bug?"
  options={[
    { text: "A component eval of the retriever alone — measure whether the right document is even in the top-k, because most 'hallucination' is actually bad retrieval" },
    { text: "An end-to-end eval only — the whole system is what matters" },
    { text: "An online eval — wait for users to thumbs-down" },
    { text: "A public benchmark to see if the base model hallucinates" }
  ]}
  correct={0}
  explanation="The eval-types page stresses component evals: test the retriever separately from the generator. If recall@k is low, the right context isn't there and no prompt can fix it. End-to-end evals tell you quality dropped but not which layer; component evals point at the broken one."
  revisit={{ to: "/docs/evaluation/eval-types", label: "Component evals localize failures" }}
/>

<Question
  prompt="A team builds an eval suite where the only tests are slow, expensive, end-to-end LLM-judged scenarios, run once a week. The chapter calls this an anti-pattern. What's the name and the fix?"
  options={[
    { text: "It's the gold standard — end-to-end is the only real test" },
    { text: "It's 'reference-free overload' — switch every test to exact match" },
    { text: "It's an inverted pyramid — push checks down to fast, cheap unit and component evals run on every commit, and keep the expensive end-to-end ones few" },
    { text: "It's fine as long as you also run a public benchmark" }
  ]}
  correct={2}
  explanation="The eval pyramid wants many fast unit/component evals at the base, fewer end-to-end ones in the middle, and online evals on top. The inverted pyramid (only slow expensive evals, run rarely) gives slow, coarse, late feedback that people skip — and it can't localize failures."
  revisit={{ to: "/docs/evaluation/eval-types", label: "The eval pyramid" }}
/>

<Question
  prompt="A new eval set scores +2% overall on v2 vs v1, so the team ships it. The chapter would call this dangerous. Why?"
  options={[
    { text: "Because 2% is always within noise, so no change should ever ship" },
    { text: "Because an aggregate gain can hide a slice disaster — v2 might be +6% on easy cases and −14% on your hardest, highest-value slice, which the overall number conceals" },
    { text: "Because you should gate on cost, not quality" },
    { text: "Because v1 should always be kept regardless of scores" }
  ]}
  correct={1}
  explanation="The datasets page shows exactly this: a +2% overall can mask a large regression on the slice that matters most. Always gate on overall AND per-slice; never ship on the aggregate alone. Tag every case with slice labels at creation so this analysis is free."
  revisit={{ to: "/docs/evaluation/eval-datasets", label: "Why a single number lies" }}
/>

<Question
  prompt="Someone proposes building the eval set entirely from LLM-generated synthetic cases to save time. The chapter's verdict?"
  options={[
    { text: "Ideal — synthetic data is unbiased and infinitely scalable" },
    { text: "Use synthetic to EXPAND thin slices, but anchor on real production logs and expert-written cases — an all-synthetic set tests what the generator imagined, not what users actually send, and still needs human review" },
    { text: "Never use synthetic data under any circumstances" },
    { text: "Synthetic is fine if you skip human review to move faster" }
  ]}
  correct={1}
  explanation="The datasets page ranks sources: production logs (highest value) and domain experts first; synthetic to bulk up coverage but always human-reviewed; public datasets only as a smoke test. An all-synthetic set tests the generator's imagination, not real usage."
  revisit={{ to: "/docs/evaluation/eval-datasets", label: "Where cases come from" }}
/>

<Question
  prompt="You're extracting a set of entities from documents. A model returns lots of entities, catching all the right ones but also many wrong ones. Which metric profile describes it, and which single number balances the trade-off?"
  options={[
    { text: "High precision, low recall — balanced by accuracy" },
    { text: "High recall, low precision — balanced by F1, the harmonic mean of precision and recall" },
    { text: "High accuracy — balanced by exact match" },
    { text: "High BLEU — balanced by ROUGE" }
  ]}
  correct={1}
  explanation="Catching all the right ones = high recall; also returning many wrong ones = low precision. F1 is the harmonic mean, which stays low unless BOTH precision and recall are high, so you can't game it by maxing one. The harmonic mean is used precisely because it's dragged down by the smaller value."
  revisit={{ to: "/docs/evaluation/eval-metrics", label: "Precision, recall, F1" }}
/>

<Question
  prompt="A team grades summaries with ROUGE and BLEU and is puzzled that a clearly excellent paraphrase scored low while a worse near-copy scored high. The chapter explains why. What's the issue?"
  options={[
    { text: "ROUGE and BLEU are surface n-gram-overlap metrics — they count shared words, so a correct paraphrase with different vocabulary scores low; prefer embedding similarity or an LLM-judge for meaning" },
    { text: "ROUGE and BLEU measure meaning perfectly; the paraphrase must actually be wrong" },
    { text: "The team should have used exact match" },
    { text: "ROUGE and BLEU only work on classification tasks" }
  ]}
  correct={0}
  explanation="The metrics page is explicit: ROUGE and BLEU are surface overlap metrics that miss paraphrase and reward copying. In 2026 most teams use embedding similarity (captures meaning) or an LLM-judge (captures correctness) for generative tasks. Know ROUGE/BLEU for papers and legacy pipelines, but don't reach for them first."
  revisit={{ to: "/docs/evaluation/eval-metrics", label: "Similarity metrics and their blind spots" }}
/>

<Question
  prompt="You're comparing prompt v1 vs prompt v2 with an LLM-judge and want a trustworthy result. Which setup does the chapter recommend?"
  options={[
    { text: "Pointwise scoring with the same model that generated the answers, shown once" },
    { text: "Pairwise judging (which is better, A or B?) run in BOTH orders, counting a win only if the judge picks the same answer regardless of position — and using a different model family as judge" },
    { text: "Ask the judge for just the number, no reasoning, to save tokens" },
    { text: "Whichever answer is longer wins, since detail signals quality" }
  ]}
  correct={1}
  explanation="The LLM-as-judge page: models are more reliable at relative (pairwise) judgments than absolute scores. Defend against position bias by running both orders and only counting a consistent win. Use a different model family to avoid self-preference, and ask for reasoning before the score for accuracy. Verbosity bias means longer ≠ better."
  revisit={{ to: "/docs/evaluation/eval-llm-as-judge", label: "Pairwise and judge biases" }}
/>

<Question
  prompt="An engineer wants to validate that their LLM-judge is trustworthy, so they have a SECOND LLM grade the judge's grades. The chapter says this is broken. Why?"
  options={[
    { text: "It's too expensive to run two models" },
    { text: "It's circular — you can't validate an automated grader with another automated grader; the anchor must be a sample of HUMAN grades, then measure agreement (e.g., Cohen's kappa)" },
    { text: "It's fine; two LLMs always agree" },
    { text: "The second LLM should be the same model as the first" }
  ]}
  correct={1}
  explanation="Calibration requires human ground truth. The human-eval and judge pages both stress: validate a judge by having humans grade ~30-50 cases and measuring agreement (kappa, correlation). Validating an LLM with an LLM is circular — an uncalibrated judge is 'a vibe with extra steps.'"
  revisit={{ to: "/docs/evaluation/eval-human", label: "Humans are the calibration anchor" }}
/>

<Question
  prompt="Three annotators grade the same 50 cases and their Cohen's kappa is 0.25 (fair, near chance). The chapter says fix what FIRST?"
  options={[
    { text: "Hire stricter annotators" },
    { text: "The annotation guideline / task definition — low inter-annotator agreement means the task is ambiguous, and no grader (human OR LLM) can score an ambiguous task consistently; it also caps the quality of any LLM-judge you build" },
    { text: "Switch to a flagship LLM-judge and ignore the humans" },
    { text: "Use raw percent agreement instead of kappa to get a nicer number" }
  ]}
  correct={1}
  explanation="The human-eval page: low IAA is a task-definition problem, not a people problem. Fix the guideline (concrete scale, anchored examples, edge-case rules) first. Crucially, IAA caps achievable automated-eval quality — if humans only agree at 0.25, there's no consistent target for a judge to hit. And use kappa, not raw % (which looks great on imbalanced labels even when graders guess)."
  revisit={{ to: "/docs/evaluation/eval-human", label: "Inter-annotator agreement" }}
/>

<Question
  prompt="A team pins their eval and production config to the model alias 'gpt-5' (latest snapshot). One day scores drop with zero code changes on their side. The chapter warned about this. What's the lesson?"
  options={[
    { text: "Scores never change without a code change, so this is impossible" },
    { text: "Floating model aliases are a silent-regression trap — a provider's behind-the-scenes update changes behavior with no commit on your side; always pin the dated snapshot and treat a version bump as a change that must pass the gate" },
    { text: "Just lower the absolute threshold until it passes again" },
    { text: "Aliases are best practice; dated snapshots are deprecated" }
  ]}
  correct={1}
  explanation="The CI/CD page calls floating aliases a silent-regression trap: pinning to 'gpt-5' lets a provider update change your behavior and scores with no record. Pin the dated snapshot (e.g. gpt-5.1-2026-03-15) and record set/prompt/model/params/SHA on every run so any score is reproducible and a regression traces to an exact change."
  revisit={{ to: "/docs/evaluation/eval-cicd", label: "Pin model versions" }}
/>

<Question
  prompt="What's the single rule the chapter says CI eval gates must follow, beyond just checking the overall score?"
  options={[
    { text: "Gate on cost per run only" },
    { text: "Gate on overall AND per-slice deltas (block if any important slice drops more than a tolerance vs the baseline), and set the tolerance relative to the set's run-to-run noise so the gate doesn't flap" },
    { text: "Always require 100% on every case or block the merge" },
    { text: "Gate only on the nightly full run, never on PRs" }
  ]}
  correct={1}
  explanation="The CI/CD page: gate on overall AND per-slice, never overall alone, because an aggregate gain hides slice regressions. Use both an absolute floor and a relative no-regression bar, and tune the tolerance to your set's noise — too tight and the gate flaps and gets ignored; too loose and real regressions slip through."
  revisit={{ to: "/docs/evaluation/eval-cicd", label: "Regression gating rules" }}
/>

<Question
  prompt="In production you can't compute reference-based metrics (no gold answer for a live query). The chapter says your most reliable, high-volume quality proxy is which?"
  options={[
    { text: "Explicit thumbs up/down only — every user rates every answer" },
    { text: "Implicit signals that cover ALL traffic — regeneration rate, heavy user edits, abandonment, schema/parse failures, escalation rate — since explicit ratings come from a tiny, biased sample" },
    { text: "A public benchmark run nightly against production" },
    { text: "The offline eval score, which equals production quality" }
  ]}
  correct={1}
  explanation="The production-evals page: only a tiny, biased slice of users click thumbs-down. Implicit signals (regeneration, edit-distance, abandonment, schema failures, escalation) cover every interaction and are the more reliable production quality proxy. Use explicit ratings as a sanity check, and watch leading indicators that move before sampled scores do."
  revisit={{ to: "/docs/evaluation/eval-production", label: "Real-time quality signals" }}
/>

<Question
  prompt="A production response is found to be wrong. The chapter describes the 'data flywheel.' What is the key step that makes the product compound rather than rot?"
  options={[
    { text: "Apologize to the user and move on" },
    { text: "A human writes the correct expected behavior for that input and adds it as a frozen regression case to the golden set, so CI now gates every future change on it and the same bug can never silently return" },
    { text: "Lower the eval threshold so the failure passes" },
    { text: "Retrain the model from scratch on that one example" }
  ]}
  correct={1}
  explanation="The production-evals page: the flywheel turns each detected failure into a frozen regression case in the offline golden set. Every future change is then gated on it in CI, so that class of bug can't recur. This is what makes a product compound — each shipped failure permanently makes the eval suite smarter."
  revisit={{ to: "/docs/evaluation/eval-production", label: "The data flywheel" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 6: Responsible & Safe AI](/docs/safety) — once you can measure quality, you can measure safety; that's the next discipline.
