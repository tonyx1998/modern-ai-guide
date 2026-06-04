---
id: multimodal-checkpoint
title: Chapter 8 Checkpoint
sidebar_position: 99
sidebar_label: Checkpoint
description: Mandatory checkpoint quiz for Chapter 8 — Multimodal & Voice AI. 12 questions, 5 shown at random. Pass to unlock the next chapter.
---

# Chapter 8 Checkpoint

You've covered the modalities beyond text — seeing, generating images, hearing, speaking in real time, video, multimodal retrieval, and how to measure outputs you can't `==`. This quiz checks that the load-bearing ideas stuck: image-token cost, OCR-free extraction, the diffusion mental model, the voice latency budget, frame sampling, shared embedding spaces, and judge-vs-human evaluation.

There are **12 questions in the bank** — each visit picks 5 at random, so retaking gives you different ones. If you miss one, the result card tells you exactly which page to revisit.

You must pass (≥ 60%) to unlock the Next button and Chapter 9 in the sidebar.

<Quiz id="multimodal-checkpoint" title="Multimodal & Voice AI checkpoint" sampleSize={5}>

<Question
  prompt="Your invoice-extraction vision pipeline is suddenly costing 4× what you budgeted. The only change: users started uploading photos at full phone-camera resolution instead of downscaled scans. What's the root cause, and the cheapest fix?"
  options={[
    { text: "The model got more expensive; switch providers" },
    { text: "Image cost scales with pixel area (more patches = more image tokens), so full-res photos cost far more — downscale to the smallest size your text is still readable at, often free accuracy plus a big cost cut" },
    { text: "Cost scales with the longest side only; just crop one edge" },
    { text: "You must send PDFs, never images, to control cost" }
  ]}
  correct={1}
  explanation="A VLM patchifies the image; patches scale with area, so doubling resolution roughly quadruples image tokens and cost. Downscaling to the smallest size at which text survives is the cheapest optimization and usually costs no accuracy because the model downsamples internally anyway."
  revisit={{ to: "/docs/multimodal/mm-vision", label: "Image tokens & resizing" }}
/>

<Question
  prompt="You're extracting structured data from scanned invoices with a VLM and structured output. The model keeps inventing a value for fields that are sometimes genuinely absent. What's the fix the vision page recommends?"
  options={[
    { text: "Raise the temperature so it's more creative" },
    { text: "Make every field required so the schema is stricter" },
    { text: "Allow null for genuinely-missing fields and tell the model to use null rather than guess; add a confidence/needs_review flag to route low-confidence extractions to a human" },
    { text: "Remove the schema and parse free text with regex" }
  ]}
  correct={2}
  explanation="A required field the model can't find forces a hallucination to satisfy the schema. Allowing null (and instructing the model to use it) plus a confidence flag that routes uncertain extractions to human review is what turns a demo into a shippable pipeline."
  revisit={{ to: "/docs/multimodal/mm-vision", label: "OCR-free extraction into a schema" }}
/>

<Question
  prompt="A teammate insists image generation 'paints from a blank canvas like a human artist.' How does the chapter actually describe how diffusion models work?"
  options={[
    { text: "They start from pure random noise and iteratively denoise toward an image, guided by the text prompt at every step — text-to-image, editing, and inpainting are all variants of this guided denoising" },
    { text: "They retrieve the closest matching image from a database and recolor it" },
    { text: "They generate pixels left-to-right, top-to-bottom, one at a time" },
    { text: "They render a 3D scene and photograph it" }
  ]}
  correct={0}
  explanation="Diffusion is trained to predict and remove noise; generation starts from random noise and denoises step by step, steered by the prompt. Editing and inpainting are the same process started from your image (with regions re-noised) rather than from pure noise."
  revisit={{ to: "/docs/multimodal/mm-image-gen", label: "Diffusion intuition" }}
/>

<Question
  prompt="You want to change only the sky in a product photo while leaving everything else pixel-perfect. Which technique is that, and what extra input does it need?"
  options={[
    { text: "Text-to-image — just describe the new sky" },
    { text: "Inpainting — you supply a mask marking which pixels to regenerate; the model changes only the masked region and leaves the rest untouched" },
    { text: "Outpainting — it extends the photo beyond its borders" },
    { text: "Super-resolution — it upscales the existing pixels" }
  ]}
  correct={1}
  explanation="Inpainting regenerates only the masked area and preserves the rest exactly. Outpainting extends beyond the original frame; super-resolution upscales; plain text-to-image starts from noise and wouldn't preserve your photo."
  revisit={{ to: "/docs/multimodal/mm-image-gen", label: "Editing & inpainting" }}
/>

<Question
  prompt="You're transcribing recorded sales calls overnight for an archive — no human is waiting on the result. Should you build a streaming pipeline or batch?"
  options={[
    { text: "Streaming — it's always more modern and accurate" },
    { text: "Batch — when no human is waiting, batch is simpler, cheaper per minute, and more accurate because the model sees full context; streaming is extra complexity you only pay for when latency is the product" },
    { text: "Streaming — batch can't produce timestamps" },
    { text: "It makes no difference which you pick" }
  ]}
  correct={1}
  explanation="Batch sends the whole file once and gets the full result; it's the cheapest, simplest, most accurate option when latency is irrelevant. Streaming (chunks over a WebSocket with interim results) is strictly more complexity, justified only when a human is waiting live."
  revisit={{ to: "/docs/multimodal/mm-audio", label: "Batch vs streaming" }}
/>

<Question
  prompt="On a noisy support call, your transcript labels 'who said what' incorrectly whenever two people talk over each other. Which capability is this, and what does the chapter say to expect?"
  options={[
    { text: "It's WER; expect it to be zero with a good model" },
    { text: "It's diarization (speaker separation) — a separate capability from transcription that struggles on overlapping speech and noisy audio, so budget for post-processing and don't promise perfect speaker labels" },
    { text: "It's SSML; turn it off to fix the labels" },
    { text: "It's voice cloning; it should be disabled" }
  ]}
  correct={1}
  explanation="Diarization assigns speaker labels and is distinct from transcribing words. Overlapping speech (crosstalk) is the hardest case for it; the chapter says to expect imperfect labels on noisy calls and plan to clean them up."
  revisit={{ to: "/docs/multimodal/mm-audio", label: "Diarization" }}
/>

<Question
  prompt="Your cascaded voice agent feels laggy. You've been optimizing to minimize the LLM's total token count. What does the realtime-voice page say you should optimize for instead?"
  options={[
    { text: "Total tokens — fewer tokens always feels faster" },
    { text: "Time-to-first-sound: users judge responsiveness by when the agent STARTS talking, so stream and pipeline every stage (STT partials → LLM token stream → TTS speaks the first sentence while the rest is still generating) and optimize LLM time-to-first-token" },
    { text: "Audio bitrate — higher bitrate reduces perceived latency" },
    { text: "Number of tools — fewer tools is always faster" }
  ]}
  correct={1}
  explanation="The perceived metric is turn latency to first audio, with a human budget around 800 ms. Streaming/pipelining and minimizing time-to-first-token (not total tokens) is the biggest win; speaking the first sentence early hides the rest of the generation."
  revisit={{ to: "/docs/multimodal/mm-voice", label: "The latency budget" }}
/>

<Question
  prompt="Users complain your voice agent 'won't let me interrupt it' — it keeps talking over them. Which capability is missing, and how is it implemented?"
  options={[
    { text: "Diarization — add speaker labels to the output" },
    { text: "Barge-in — run VAD on the input even while the agent is speaking, and the instant user speech is detected, immediately stop TTS playback and cancel the in-flight reply, then listen" },
    { text: "SSML — wrap replies in <break> tags" },
    { text: "Higher guidance scale on the TTS model" }
  ]}
  correct={1}
  explanation="Barge-in lets the user interrupt. You detect user speech during playback (VAD running on input while output plays) and immediately cancel TTS and the in-flight LLM/TTS work to listen. Echo cancellation keeps the agent from hearing itself."
  revisit={{ to: "/docs/multimodal/mm-voice", label: "Turn-taking & barge-in" }}
/>

<Question
  prompt="You need to summarize a 10-minute product demo video with a non-video LLM. Sending all frames at 30 fps would be 18,000 images. What's the chapter's recommended approach?"
  options={[
    { text: "Send every frame — accuracy depends on completeness" },
    { text: "Sample frames at the lowest fps that captures the information (e.g. 0.2–1 fps), dedup with keyframe/scene detection, and always include the audio transcript for names/numbers/dialogue the pixels can't convey" },
    { text: "Send only the first and last frame" },
    { text: "Convert the video to a single panorama image" }
  ]}
  correct={1}
  explanation="Frames map straight to image tokens and cost, so sample at the lowest fps that captures the content, use keyframe detection to cut further, and add the cheap transcript to carry audio-borne information that frames miss. Use native video models when temporal fidelity matters more than cost control."
  revisit={{ to: "/docs/multimodal/mm-video", label: "Sampling frames" }}
/>

<Question
  prompt="You want a text query like 'red sneakers in the rain' to retrieve matching photos from your catalog. What makes cross-modal search like this possible?"
  options={[
    { text: "OCR reads the text written on each photo" },
    { text: "A CLIP-style multimodal embedding model maps images and text into one shared vector space (via contrastive training on image–caption pairs), so a text query vector can be compared directly by cosine similarity to image vectors" },
    { text: "Each image is captioned and only the captions are searched" },
    { text: "The vector database automatically translates between modalities" }
  ]}
  correct={1}
  explanation="Contrastive training (CLIP and successors) pulls matching image and text vectors close in one shared space, so cross-modal nearest-neighbor search works directly. The query and corpus must come from the SAME multimodal model/version, or the vectors aren't comparable."
  revisit={{ to: "/docs/multimodal/mm-rag", label: "Shared embedding space" }}
/>

<Question
  prompt="You're building RAG over visually-rich financial PDFs where many answers live inside charts and tables. Your current pipeline OCRs everything to plain text and misses those answers. What does the multimodal-retrieval page recommend?"
  options={[
    { text: "Increase the OCR resolution until tables become text" },
    { text: "Add visual document retrieval (ColPali/ColQwen-style) that embeds rendered page images directly to preserve layout/tables/figures, ideally as a hybrid that indexes both text chunks and page images and fuses the results" },
    { text: "Drop RAG and paste whole PDFs into the prompt" },
    { text: "Embed images and text with two different models and compare them" }
  ]}
  correct={1}
  explanation="Flattening visually-rich docs to text destroys layout meaning. Visual document retrieval embeds page images directly to preserve charts/tables; the shipping pattern is a hybrid that indexes both text and page images and fuses them, then lets a VLM read the top pages and cite."
  revisit={{ to: "/docs/multimodal/mm-rag", label: "Retrieving over PDFs & diagrams" }}
/>

<Question
  prompt="You want an automatic, scalable quality score for thousands of generated images and you're tempted to rely solely on CLIPScore. What's the chapter's caution, and the more reliable approach?"
  options={[
    { text: "CLIPScore alone is sufficient and correlates perfectly with humans" },
    { text: "Perceptual metrics like CLIPScore/FID are cheap CI guardrails but correlate only loosely with human perception (a high-CLIPScore image can still have mangled hands); use a VLM judge with a rubric — preferably pairwise — and calibrate it against human ratings before trusting it at scale" },
    { text: "Skip metrics and judges; only full human evaluation of every image is valid" },
    { text: "Use FID per individual image as the verdict" }
  ]}
  correct={1}
  explanation="Perceptual metrics are fast guardrails but loose proxies for quality. A VLM-as-judge (pairwise beats absolute scores) scales human-like grading, but must be calibrated against a human-labeled sample first; FID is a distribution metric, not a per-image score."
  revisit={{ to: "/docs/multimodal/mm-evals", label: "Judge models & metrics" }}
/>

</Quiz>

---

## What's next

→ Continue to [Chapter 9: Solo / Indie AI](/docs/solo) — you now know the disciplines and specializations; next, see how it all assembles into real workflows at every team scale.
