---
id: multimodal-overview
title: 8. Multimodal & Voice AI — Overview
sidebar_position: 1
sidebar_label: Multimodal intro
description: Building AI systems that see, hear, speak, and generate — vision extraction, image generation, speech, realtime voice agents, video, multimodal retrieval, and how to evaluate non-text outputs.
---

# Part 8: Multimodal & Voice AI

*Text is where most engineers start. The money, the magic, and most of the hard bugs live everywhere else: pixels, audio, and the half-second of latency before a voice agent answers.*

> **In one line:** A modern AI engineer doesn't just send text to a model — they pipe images, documents, speech, and video through it, and stream audio back fast enough to hold a conversation; this chapter teaches all of that from first principles.

:::tip[In plain English]
So far you've been mailing letters: you type words, the model types words back. **Multimodal** AI is when the model can also *look at a photo*, *read a scanned invoice*, *listen to a phone call*, *speak out loud*, and *draw a picture*. It's the same kind of model underneath, but now the "letters" can be pixels and sound waves. The tricky part isn't the model — it's the plumbing around it: pictures are huge and expensive, audio has to arrive in tiny chunks if you want a real-time conversation, and you can't grade a generated image with a simple `==`. This chapter teaches you to build each of these and, crucially, to measure whether they're any good.
:::

## What this chapter covers

By the end you can build a vision extraction pipeline, generate and edit images, transcribe and synthesize speech, ship a real-time voice agent, handle video, retrieve over images and PDFs, and evaluate outputs that aren't text.

- [Vision: models that see](./02-vision.md) — image understanding, OCR-free document extraction into a schema, how image tokens and cost work, resizing, and when dedicated OCR still wins.
- [Image generation](./03-image-generation.md) — diffusion intuition, text-to-image, editing/inpainting, the 2026 model landscape, product patterns (avatars, asset pipelines), and safety/watermarking.
- [Audio & speech](./04-audio-speech.md) — speech-to-text (transcription, diarization, word timestamps), text-to-speech (voices, SSML), audio understanding, and batch vs streaming.
- [Realtime voice agents](./05-realtime-voice.md) — the cascaded pipeline (VAD → STT → LLM → TTS) vs speech-native models, the latency budget, turn-taking and barge-in, and telephony.
- [Video](./06-video.md) — video understanding via frame sampling vs native video, video generation in 2026, and the cost realities that decide which approach you pick.
- [Multimodal retrieval](./07-multimodal-rag.md) — multimodal embeddings (CLIP-style), image and audio search, and retrieving over screenshots, PDFs, and diagrams.
- [Evaluating multimodal](./08-evaluating-multimodal.md) — perceptual metrics, judge models for images, human eval, and measuring voice latency and accuracy.
- [Checkpoint](./99-checkpoint.md) — a 12-question quiz; pass to unlock Chapter 9.

## How to read this chapter

Read pages 2–5 in order the first time — vision and audio are the two raw input modalities, and the voice page assembles audio + LLM into a live agent that ties the chapter together. Pages 6–8 are more standalone: skip to [video](./06-video.md), [multimodal retrieval](./07-multimodal-rag.md), or [evaluation](./08-evaluating-multimodal.md) as your project needs them. Every page is self-contained, but it builds on the [foundations chapter's multimodal inputs page](/docs/foundations/multimodal-inputs) (how a model "sees" at all) and the [embeddings page](/docs/foundations/embeddings) (which the retrieval page leans on). The [patterns chapter's multimodal patterns page](/docs/patterns/pattern-multimodal-patterns) is a good production-shaped companion.

---

→ Start with [Vision: models that see](./02-vision.md).
