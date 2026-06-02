---
id: career-defend-portfolio-drill
title: The "defend your portfolio" drill
sidebar_position: 7.5
description: A 7-day repeatable drill to make any portfolio project interview-defensible. Run once per project. Eliminates "the AI handled that part" answers.
---

# The "defend your portfolio" drill

> **In one line:** A 7-day, ~10-hour drill that you run per portfolio project so that, at the end, you can survive 30 minutes of interviewer-level technical questioning without stalling — and specifically without resorting to "the AI generated that part."

:::tip[In plain English]
Portfolio projects shipped with AI assistance are a hiring-manager paradox. They want to see ambitious work, they assume you used AI to ship it, but they also want to know *you* can defend every decision. The trap candidates fall into is shipping fast with AI, never going back to deeply understand, then folding under the first technical follow-up. This drill is the rehearsal layer that converts a fast-shipped project into a defensible one.
:::

## When to run this drill

- **Before applying** for AI engineer / forward-deployed engineer roles where this project is your lead artifact.
- **Per project, not just once.** Each project has its own architectural depth.
- **After every meaningful architecture change.** A rewrite resets the defense clock.

Three portfolio projects, three drills = a defense surface that holds up across the typical 4-round AI engineering loop.

## The rules

- **🚫 No AI** for the no-AI marked exercises. Close Claude / Cursor / Copilot. Notebook + brain only.
- **Compare-to-reality** exercises: do the no-AI version FIRST, then look at the code/docs. The gap is the signal.
- **Write everything down.** Don't just think it. Interviews test spoken / written answers, not internal monologue.

## The week at a glance

| Day | Focus | Time |
|---|---|---|
| 1 | Architecture diagram from blank page | 90 min |
| 2 | Defend every technology choice | 90 min |
| 3 | Implement critical pieces from memory | 2 hr |
| 4 | The AI-engineering deep dive | 90 min |
| 5 | Failure mode analysis | 90 min |
| 6 | 10 killer interview questions, out loud | 90 min |
| 7 | 30-minute deep-dive talk, recorded | 90 min |

Total: ~10 hours over 7 days. Time-boxed so it doesn't bleed.

## Day 1 — Architecture diagram from blank page

**🚫 No AI. No codebase open. Notebook only.**

Open a blank page. Draw the entire system. Every box, every arrow, every protocol.

Standard elements to label for any project:

- Client (browser / mobile / CLI — what runs on the user device).
- Server / API surface (what runs server-side).
- The LLM / model provider (which endpoints, what auth).
- Data stores (Postgres? Vector DB? KV cache? S3?).
- Auth (how the user proves who they are; how server proves who *it* is to provider).
- Rate limiting & cost protection (where, what data store).
- External integrations (webhooks, third-party APIs).

Label every data flow with the **protocol** (HTTPS / WebSocket / WebRTC / SSE / gRPC) and what data it carries.

For AI features specifically, additionally label:

- Where the system prompt lives and how it's assembled.
- Where retrieval happens (if RAG).
- Where evals run.
- Where traces are stored.

**After 60 min**: open the codebase, compare. The gaps between your drawing and reality are your learning targets for the week.

**After 90 min**: stop. Write down 3 things you didn't understand.

## Day 2 — Defend every technology choice

For each major choice in your stack, write a 3–4 sentence defense in your own words. Then look up what a senior engineer would say and compare.

**🚫 No AI for the first pass.** Look up references after to fill gaps.

A starter set of questions, adapt per project:

1. **Why this framework (Next.js / FastAPI / SvelteKit / …) over the alternative?** What does it give you that you actually use?
2. **Why this LLM provider?** What's the cost model, the latency profile, the failure mode?
3. **Why this protocol** for the data layer (REST / WebSocket / WebRTC / gRPC)? What would break if you switched?
4. **Why this data store?** What's the schema's gotcha? What does it not handle well?
5. **Why this auth pattern?** What attacks does it defend against? What does it fail against?
6. **Why this rate limit shape** (per-IP / per-user / per-session)? What does it not catch?
7. **Why these specific cost protections?** Where would a hostile user blow up your bill?
8. **Why this prompt management approach** (in-code / versioned / DB)? When do you change a prompt?
9. **Why this eval shape** (or lack of one)?
10. **Why this deployment platform?** What scales, what doesn't, what costs jump first?

**Bar to clear:** for any of these in an interview, you can give a 60–90 second answer that includes (a) the alternative considered, (b) why you picked yours, (c) what the tradeoff is. *"The AI suggested it"* is a failing answer.

## Day 3 — Implement critical pieces from memory

**🚫 No AI. No Stack Overflow. No docs. 30 min per task.**

Pick the three most defining technical pieces of your project — the things that make it *this project* and not a generic CRUD app. Common archetypes:

- **For a RAG project:** chunking pipeline, hybrid search query construction, citation enforcement check.
- **For an agent project:** the agent loop, tool definitions, the verification / give-up condition.
- **For a voice project:** WebRTC handshake, VAD turn-taking, interruption handling.
- **For a coding agent:** repo retrieval, diff application, test-loop verification.
- **For a multi-tenant app:** auth flow, rate limiter, row-level RAG security.

Constraints on each: pseudo-code is fine, but be **specific**. Algorithm, data structures, what's wrong with the obvious approach, how you handle the edge case.

If you can't do them from memory, you don't understand them well enough to interview.

## Day 4 — The AI-engineering deep dive

This is where AI-specific projects get tested hardest. Write a 1-page doc covering:

1. **System prompt strategy.** What's in your system prompt? Why each section? What happens if you remove each one?
2. **Output reliability.** How do you stop the model from going off-script? Structured output? Validation? What testing did you do?
3. **Retrieval quality** (if RAG): chunking strategy, embedding model choice, hybrid search, reranking, citation enforcement.
4. **Eval strategy.** What's your test set? How big? How do you grade — deterministic / LLM-as-judge / human? What metrics?
5. **Failure modes specific to your AI feature.** Jailbreaks you've seen. Non-English input. Hostile user. User better than the system.

**Bar to clear:** an interviewer asks *"walk me through how you make sure the AI doesn't [the bad thing your project most needs to avoid]"* and you give a real answer with specifics from your prompt and code — not *"I told it not to."*

## Day 5 — Failure mode analysis

For each scenario, write 3–4 sentences on (a) what actually happens in your current system, (b) what the user sees, (c) what you'd do better at scale.

**🚫 No AI for the first pass.** Look at code only to verify after.

Universal failure modes (apply to any AI project):

1. LLM provider returns 429 (rate limited).
2. LLM provider has 30s of latency (model degradation).
3. LLM provider goes down entirely for 1 hour.
4. User submits adversarial input (prompt injection, jailbreak).
5. User submits 10× the typical input size.
6. Internet drops mid-request.
7. Your DB / cache is down.
8. A bug in your code crashes the request handler.
9. A user opens many tabs / makes many parallel requests.
10. Cost spike — a single user generates 100× normal usage.
11. Eval set regresses silently on a model update.
12. A successful prompt-injection attack does the worst thing it could.

Add project-specific ones:

- Voice: connection drops, mic denied, network drops to 100kbps, interruption mishandled.
- Coding agent: edit corrupts a file, infinite tool-use loop.
- RAG: retrieval returns nothing, retrieval returns adversarial content.

**Bar to clear:** for any failure mode, you can describe the observable behavior, the root cause, and a mitigation. Bonus if you can describe how you'd detect it in production (what metric or alert).

## Day 6 — The 10 killer interview questions

Out loud. Recorded if possible. **🚫 No AI.** Each answer: 2–4 minutes. If you stall, that's a gap — note it and move on.

A starter set; replace specifics with your project's details:

1. **Walk me through what happens from the user's first action to the first response they see.** Be specific: HTTP calls, model calls, data flow, in order.
2. **Why this LLM / provider choice?** What attacks/scenarios does it defend against? What doesn't it?
3. **Walk me through your prompt strategy.** What's in the system prompt? How do you stop the model from doing the worst thing?
4. **Implement the core algorithm of your project in code right now.** (Pick your project's defining algorithm; sliding-window rate limit, chunking, agent loop, etc.)
5. **Where do you enforce the most important constraint** (cost cap / rate limit / scope boundary)? Client or server? What if the user bypasses the client?
6. **If you had to scale this to 10K concurrent users, what breaks first?** Walk through bottlenecks in order.
7. **How would you write evals for this?** Specific metrics, specific test setup.
8. **What would you change with $10K to spend and a month?** Show product judgment, not just engineering.
9. **What's the worst bug you've fixed?** Tells the interviewer how you debug.
10. **If a user reports "[plausible bug specific to your project]" — walk me through your debugging process step by step.**

## Day 7 — The 30-minute deep-dive talk

Record yourself giving a 30-minute presentation on the project as if to a panel of 3 senior engineers who will ask follow-ups.

**Structure:**

- **0–3 min:** Problem statement, who it's for, what makes it different from existing options.
- **3–10 min:** System architecture overview (use your Day 1 diagram).
- **10–18 min:** Key technical decisions — pick top 3, defend each in depth.
- **18–25 min:** A specific deep dive into one component (usually the most AI-distinctive part).
- **25–30 min:** Failure modes, what you'd build next, what you'd change with more time and money.

**Then watch it back.** Note every place you:

- Stalled or said "uh."
- Hand-waved a technical detail.
- Said "the AI generated that."
- Couldn't explain the why.
- Got the terminology wrong.

Those are your remaining gaps. Spend the rest of the week filling them.

## Self-assessment rubric (end of week)

Rate yourself 1–5 on each without consulting AI:

- [ ] Draw the full system architecture from memory.
- [ ] Defend every major tech choice with real reasoning.
- [ ] Implement the project's core algorithms from memory.
- [ ] Explain the AI-engineering strategy in detail.
- [ ] Walk through 10+ failure modes.
- [ ] Give a 30-min talk without stalling.
- [ ] Answer all 10 killer questions out loud.

**Bar:** every item at 4+ before applying for roles where this is your lead portfolio piece. If anything is below 3, that's where the next week goes.

## How to handle "did you use AI to build this?"

When asked — and you will be asked — the answer is yes, honestly. Suggested frame:

> "I use AI tools heavily to ship faster. I treat them like a productive junior engineer — I read everything that gets committed, I own the architecture decisions, and I can defend every line. Happy to walk through any of it."

That lands well *when you can actually defend the lines*. The trap is folding under the first technical follow-up. This drill is what makes the frame defensible.

## What beginners get wrong

:::caution[Where this drill goes wrong]
- **Skipping the no-AI rule.** "I'll just look at the code real quick" defeats the purpose. The point is to find out what you actually carry in your head.
- **Doing it once, never again.** Each project needs its own pass. The drill doesn't transfer; the *defense* of project X doesn't help you defend project Y.
- **Treating it as a checklist instead of rehearsal.** Day 6 and Day 7 specifically test speaking the answers out loud under time pressure. Skipping them because "I know it" is the failure mode.
- **Watching the recording with friendly eyes.** Watch like a harsh interviewer. Where did you waffle? Where did you bluff?
- **Not writing down the gaps.** A gap you don't write down is one you'll re-hit in the interview.
:::

:::info[Highlight: this drill is the single highest-leverage interview prep for an AI engineer]
You can prep general algorithms, you can prep AI sysdesign, but the question that decides most loops is *"walk me through your project."* A candidate who has done this drill three times — on three projects — is a different person in interviews than one who hasn't. The shipped code is the artifact; the defense is the signal.
:::

---

→ Next: [Compensation](./07-compensation.md)
