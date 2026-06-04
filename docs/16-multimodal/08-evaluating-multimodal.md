---
id: mm-evals
title: Evaluating multimodal
sidebar_position: 8
description: Measuring non-text outputs — image and audio quality, perceptual metrics, human evaluation, judge models for images, and evaluating voice latency and accuracy.
---

# Evaluating multimodal

> **In one line:** You can't `==` a generated image or a synthesized voice, so multimodal evaluation replaces exact-match with three graded tools — perceptual metrics, judge models, and humans — plus hard operational numbers like WER and turn latency that you *can* measure exactly.

:::tip[In plain English]
With text you can sometimes check an answer against a known-correct string. You can't do that with a picture or a voice clip — there's no single "right" image of a sunset, and two transcripts can both be fine. So instead of a yes/no check you grade. You have three kinds of graders: a **math formula** that scores how close two things look or sound (perceptual metrics), an **AI judge** that looks at the output and rates it against a rubric (great for scale), and a **human** (the gold standard, slow and pricey). And for the parts that *are* exact — how many words the transcriber got wrong, how long the voice agent took to answer — you measure them precisely and gate on them. This page is the multimodal extension of the whole [evaluation chapter](/docs/evaluation); reread that first if "eval suite" is new.
:::

## Why exact-match dies here

Generation is one-to-many: many outputs are equally valid. So you measure along **quality dimensions** instead of correctness:

- **Images**: prompt-adherence (did it draw what I asked?), aesthetic quality, artifact-freeness (no extra fingers/garbled text), and *consistency* (does the avatar look like the same person across generations?).
- **Audio/voice**: intelligibility, naturalness/prosody, correct pronunciation, and — for agents — whether it actually accomplished the task.
- **Always keep a real test set.** A fixed bank of prompts/inputs you run on every change, so you can compare versions instead of eyeballing one cherry-picked sample. That discipline is the entire point of the [evaluation chapter](/docs/evaluation), and it applies unchanged here.

## Perceptual metrics

These are formulas that score similarity the way humans roughly perceive it — useful as cheap, automatic regression signals.

- **Images (generation quality):** **FID** (Fréchet Inception Distance) compares the *distribution* of generated images to real ones — lower is better; it's a population metric, not a per-image score. **CLIPScore** measures prompt-adherence: cosine similarity between the image embedding and the prompt embedding in a CLIP space (from the retrieval page) — higher means the image matches the words.
- **Image similarity (editing/reconstruction):** **LPIPS** (learned perceptual similarity, lower = more similar) tracks perceived change far better than raw pixel diffs; **SSIM/PSNR** are older structural/pixel metrics, fine for "did this region stay unchanged?"
- **Audio:** **PESQ/STOI** estimate perceived speech quality/intelligibility; **MOS** (Mean Opinion Score, 1–5) is the canonical human rating, and "MOS predictors" approximate it automatically.

```python
# CLIPScore sketch: how well does the image match its prompt?
def clip_score(image, prompt, clip):
    iv = clip.embed_image(image)     # normalized
    tv = clip.embed_text(prompt)     # normalized
    return float((iv * tv).sum())    # cosine; higher = better adherence
```

Use perceptual metrics as **fast, automatic guardrails in CI** — they catch big regressions cheaply — but never as the sole judge of quality. They correlate with human perception only loosely; a high CLIPScore image can still have six fingers.

## Judge models for images

The scalable middle ground (the image analogue of LLM-as-judge from the [evaluation chapter](/docs/evaluation)): use a strong **VLM as a grader**. Give it the prompt, the image, and a rubric; get back scored dimensions + reasons. This scales to thousands of evals at a fraction of human cost.

```python
class ImageScore(BaseModel):
    prompt_adherence: int   # 1–5: does it depict what was asked?
    artifacts: int          # 1–5: 5 = clean, 1 = mangled hands/text
    aesthetics: int         # 1–5
    reasoning: str

resp = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": [
        {"type": "text", "text":
            f"Score this image for the prompt: '{prompt}'. "
            "Rate prompt_adherence, artifacts, aesthetics 1–5 with reasons."},
        {"type": "image_url", "image_url": {"url": data_url("out.png")}},
    ]}],
    response_format=ImageScore,
)
```

The same biases that plague text judges apply: position bias in pairwise comparisons, leniency, and self-preference. **Pairwise** ("is A or B better?") is more reliable than absolute 1–5 scores. And the non-negotiable step: **calibrate the judge against human ratings** on a sample — if the judge and humans agree on a labeled set, you can trust it to scale; if not, fix the rubric before relying on it.

## Human evaluation

Still the gold standard for subjective quality, and irreplaceable for the things metrics and judges miss (cultural appropriateness, brand fit, "does this voice feel trustworthy?").

- **Pairwise / side-by-side** ("A or B?") gives far more reliable human data than asking for absolute scores.
- **Clear rubrics + multiple raters**, then measure **inter-annotator agreement** — if humans don't agree with each other, your rubric is broken (or the dimension is genuinely subjective). This mirrors the [human-eval discipline](/docs/evaluation) exactly.
- **MOS panels** for TTS: several listeners rate naturalness 1–5; the average is your score.
- Use humans where it's cheapest-per-insight: **calibrate your judge/metrics on a human-labeled sample**, then let the automated graders scale. Pure human eval of every generation doesn't scale; calibrated automation does.

## Evaluating voice & audio: the exact numbers

Voice agents have *operational* metrics you can measure precisely and should gate on — these are where evaluation gets concrete:

- **WER (Word Error Rate)** for STT: `(substitutions + insertions + deletions) / reference_words`. Track it per slice — accents, noise, telephony, jargon — because aggregate WER hides the failures that matter.
- **Turn latency** for voice agents (from the [realtime voice page](./05-realtime-voice.md)): measure end-of-user-speech → first-agent-audio, and report the **p50 and p95**, not just the average — the slow tail is what users feel. Break it down per stage (VAD / STT / LLM TTFT / TTS) so you know *which* component to fix.
- **Task success rate**: did the agent actually book the appointment / resolve the ticket? The end-to-end metric that matters more than any component score.
- **Interruption handling**: barge-in latency (how fast it stops talking) and false-endpoint rate (how often it cut the user off).

```python
def wer(reference: str, hypothesis: str) -> float:
    r, h = reference.split(), hypothesis.split()
    # Levenshtein edit distance over words / len(reference).
    d = [[0] * (len(h) + 1) for _ in range(len(r) + 1)]
    for i in range(len(r) + 1): d[i][0] = i
    for j in range(len(h) + 1): d[0][j] = j
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            cost = 0 if r[i-1] == h[j-1] else 1
            d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + cost)
    return d[len(r)][len(h)] / max(len(r), 1)
```

Put these in CI exactly like text evals: a fixed audio test set, WER and latency thresholds that **block the deploy** if a change regresses them. That's the discipline from [evals in CI/CD](/docs/evaluation) applied to voice.

## Common pitfalls

:::caution[Where people trip up]
- **Trusting one perceptual number.** A great CLIPScore or low FID can still ship mangled hands. Use metrics as cheap guardrails, not verdicts.
- **Uncalibrated judge models.** A VLM judge you never checked against humans is a vibe with extra steps. Calibrate on a labeled sample first.
- **Absolute scores over pairwise.** Both judges and humans are far more consistent at "A vs B" than at "rate this 1–5." Prefer pairwise.
- **Reporting average latency only.** Users feel the p95 tail. Report p50 *and* p95, and break latency down per pipeline stage.
- **Aggregate WER hiding slice failures.** 6% overall can be 25% on accented or telephony audio. Always slice.
- **No fixed test set.** Eyeballing one fresh sample per change is the shrug this whole chapter exists to kill. Keep a versioned bank and run it every time.
- **Measuring components but not task success.** Perfect WER and snappy latency still fail if the agent doesn't actually complete the job. Track end-to-end success.
:::

---

→ Next: [Chapter checkpoint](./99-checkpoint.md)
