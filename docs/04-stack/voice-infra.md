---
id: voice-infra
title: Voice infrastructure
sidebar_position: 19
description: OpenAI Realtime, Gemini Live, Vapi, Retell, ElevenLabs, Cartesia, Deepgram, LiveKit — building voice-native AI features.
---

# Voice infrastructure

> **In one line:** Voice AI shipped from "research demo" to "shipping product" between 2024 and 2026. The stack splits into end-to-end speech-to-speech models, STT/TTS components, and the real-time media plumbing underneath.

:::tip[In plain English]
Voice infrastructure is what turns "the model can talk" into "a phone call actually works." You need to capture the user's audio (microphone or telephony), transcribe it (or feed it straight into a speech-to-speech model), let an LLM decide what to say, synthesize speech, play it back, and *handle interruptions* — all in under a second of round-trip latency. Two architectures: end-to-end (one model does it all, simpler, less control) or pipeline (STT → LLM → TTS, more control, harder to tune).
:::

## The major options (2026)

| Tool | Layer | Strengths | Best for |
|------|-------|-----------|---------|
| **OpenAI Realtime API** | End-to-end speech | Low-latency conversation; tools mid-call | Simplest path to voice agent |
| **Gemini Live API** | End-to-end speech | Multimodal; video + voice | Google-stack, multimodal voice |
| **Claude voice (preview)** | End-to-end speech | Tool-use depth | Anthropic-stack voice agents |
| **Vapi** | Hosted voice agent | Telephony + agent orchestration | Phone-number products |
| **Retell** | Hosted voice agent | Latency; phone-first | Call-center replacement |
| **Bland** | Hosted voice agent | Cheap outbound calling | High-volume outbound |
| **ElevenLabs** | TTS | Best-in-class voice quality | Premium voice |
| **Cartesia** | TTS | Sub-100ms latency | Low-latency pipelines |
| **Inworld TTS** | TTS | Cheap, fast | Cost-sensitive |
| **OpenAI TTS** | TTS | Cheap, good defaults | General purpose |
| **Deepgram** | STT | Fast streaming STT | Real-time transcription |
| **AssemblyAI** | STT | Strong accuracy + analytics | Recording analytics |
| **Soniox** | STT | Multilingual streaming | Multilingual real-time |
| **OpenAI Whisper** | STT (OSS + hosted) | Multilingual, OSS | Self-host transcription |
| **LiveKit** | Real-time media | WebRTC + SIP + agent kit | DIY voice on web/mobile |
| **Daily** | Real-time media | WebRTC infra | Video + voice |
| **Twilio Voice** | Telephony | Phone numbers, SIP | Phone integration |
| **Pipecat** (Daily, OSS) | Voice orchestration | Glue between STT/LLM/TTS | DIY pipeline framework |

## Default pick for most teams

**OpenAI Realtime API for in-app voice; Vapi or Retell for phone-number products.** Both choices give you a working agent in an afternoon.

For DIY pipeline architectures (when you want a specific LLM, your own TTS, custom voice cloning, etc.): **LiveKit + Pipecat** is the 2026 reference combo. LiveKit handles the WebRTC; Pipecat orchestrates STT → LLM → TTS with proper turn-taking and interruption.

## When to deviate

- **Phone-number product** (replace an IVR, outbound sales caller): **Vapi**, **Retell**, or **Bland** — they include telephony.
- **In-app voice (web/mobile)**: **OpenAI Realtime** via WebRTC for simplicity, **LiveKit + Pipecat** for control.
- **Premium voice quality matters more than latency**: **ElevenLabs**.
- **Latency floor under 300ms round-trip**: **Cartesia TTS** + **Deepgram STT** + a fast LLM (Haiku, Flash) — or end-to-end Realtime.
- **Recording analytics** (transcribe, sentiment, summarize calls): **AssemblyAI**.
- **Multilingual streaming** (live translation, multilingual support agents): **Soniox** or **Deepgram Nova-3** + GPT-5.1.
- **You need video too**: **Gemini Live** end-to-end, or **Daily + LiveKit** for the media layer.

## The two architectures

**End-to-end speech-to-speech.** One API. Audio in → audio out. The model "hears" tone and "speaks" with prosody. Lowest latency, simplest code. Trade-off: you lose model choice (locked to whoever's speech model you use) and some tool-use control.

```python
# OpenAI Realtime via WebRTC, conceptually:
# 1. browser opens WebRTC connection to Realtime endpoint
# 2. server streams mic audio in; receives audio + tool calls out
# 3. tool calls execute server-side; results streamed back
```

**Pipeline (STT → LLM → TTS).** Three components glued together. You pick each one independently. Trade-off: latency adds up (STT 100ms + LLM TTFT 400ms + TTS first-byte 100ms = 600ms before the user hears anything), and you have to handle turn-taking and interruption yourself.

```python
# Pipecat-style — one framework manages the pipeline
from pipecat.pipeline.pipeline import Pipeline
from pipecat.services.deepgram import DeepgramSTTService
from pipecat.services.anthropic import AnthropicLLMService
from pipecat.services.cartesia import CartesiaTTSService

pipeline = Pipeline([
    DeepgramSTTService(api_key=...),
    AnthropicLLMService(model="claude-haiku-4-5"),
    CartesiaTTSService(voice_id="..."),
])
```

## What's actually hard about voice

- **Latency.** Anything over ~800ms round-trip feels broken. Streaming at every layer.
- **Turn-taking.** When does the AI start speaking? Silence detection (VAD) helps, but cross-talk happens.
- **Interruption handling.** User talks over the AI → AI must immediately stop generating AND stop playing the buffered audio.
- **Tool calling mid-conversation** without breaking flow. You can't pause audio for 4 seconds while a database query runs; play a "let me check that" filler.
- **Telephony integration.** SIP trunks, DTMF, hold music, call recording, compliance.
- **Background noise.** Voicemail prompts, music, partial words. The STT layer matters a lot.
- **Variable network conditions.** Mobile users on a bad LTE connection.

## Pricing & cost notes (May 2026)

| Component | Typical price |
|-----------|--------------|
| OpenAI Realtime | ~$0.06/min input audio + $0.24/min output audio |
| Gemini Live | ~$0.05–$0.30/min depending on tier |
| Vapi / Retell | ~$0.05–$0.20/min all-in (their margin on top of providers) |
| ElevenLabs TTS | ~$0.18/1k chars (premium) |
| Cartesia TTS | ~$0.025/1k chars |
| Deepgram STT | ~$0.0043/min (Nova-3) |
| LiveKit Cloud | ~$0.50/1000 participant-minutes |
| Twilio Voice | ~$0.013/min inbound + outbound |

Voice agents are typically **the most expensive feature per active user** in your stack — easily $0.10–$0.30 per minute of conversation, all-in. Budget accordingly and cap call lengths.

## Pitfalls

- **Building voice with synchronous HTTP.** Voice is streaming end-to-end. If any layer waits for "the whole response" before forwarding, your latency budget is gone.
- **No interruption handling.** The user starts speaking 3 words in; your AI keeps talking over them for 10 seconds. Always implement barge-in.
- **Tool calls that take longer than the silence threshold.** A 2-second DB query inside a voice agent creates an awkward gap. Play a filler ("one moment…") immediately.
- **Whisper for real-time.** Whisper is batch — great for recordings, wrong for live streams. Use Deepgram, AssemblyAI, or Soniox for live.
- **No call recording / transcript log.** When the user complains, you have nothing to debug. Always record (with consent + a compliant retention policy).
- **Ignoring jitter and packet loss.** A perfect demo on your office wifi falls apart on a 3G mobile connection. Test on a throttled network.
- **No spend cap per call.** A stuck voice agent in a loop can rack up 30 minutes. Cap call duration server-side.

---

→ Next: [Realtime voice — the engineering details](./realtime-voice-engineering.md)
