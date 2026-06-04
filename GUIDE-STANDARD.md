# Guide Standard

The canonical frame for every learning guide in this collection (`swe-interview-guide`,
`modern-ai-engineer-guide`, `modern-web-dev-guide`, and any future guide). It is
**platform-agnostic**: it governs *content, structure, pedagogy, and terminology*, not the
tech stack. A guide may ship as a single-file HTML app or a Docusaurus site and still
conform — see [Per-stack implementation notes](#per-stack-implementation-notes).

This file lives, identical, in each guide's repo. Edit it in one place, then sync the copies.

---

## 1. North Star

> **A complete beginner enters at lesson one and leaves job-ready, reading top to bottom, in order, without ever needing another source.**

Three non-negotiables fall out of that sentence:

1. **Assume zero prior knowledge.** The reader knows nothing about the domain (and may not
   know how to program at all). Earn every concept from first principles.
2. **Linear and self-contained.** The guide is read front-to-back. Every page stands on its
   own using only what earlier pages taught. No reader-path branching, no "you should
   already know X," no "go read this elsewhere to continue."
3. **All the way to competence.** The arc doesn't stop at theory or at the interview — it
   ends where the reader can *do the job*.

If a change makes the guide less true to that sentence, it's wrong.

---

## 2. Audience & the zero-knowledge rule

- Write for a motivated beginner with **no domain background**. When in doubt, over-explain.
- **Define every term the first time it appears**, inline, in plain English — including the
  ones experts forget are jargon (acronyms, symbols, tool names).
- **No forward references to untaught concepts.** If lesson 12 needs an idea, either it was
  taught earlier or lesson 12 teaches it before using it.
- Every guide opens with a **basics on-ramp phase** that assumes the reader has never touched
  the domain (e.g. "Programming basics" before any interview pattern; a "Before you start /
  prerequisites" phase before any advanced material). Prerequisites from *other* domains are
  either taught briefly or cross-linked to the guide that owns them — never assumed.

---

## 3. Structure: phases, order, and gating

- **Named phases (a.k.a. Parts/chapters)** group lessons into a clear arc: *basics →
  fundamentals → core skills → advanced/specialization → the real job → synthesis/close-out.*
- **One linear order.** Lessons form a single chain; each declares the lesson before it as its
  prerequisite. Order is the source of truth — derive lesson numbers from position, never
  hand-maintain them.
- **Quiz-gated progression.** A lesson unlocks only when the previous one's quiz is passed. No
  self-reported "mark complete" for graded lessons (intro/overview pages may be ungated).
- A guide ends with a **capstone assessment** ("final boss": a longer mixed quiz with a higher
  pass bar) that certifies the whole arc.

---

## 4. The canonical lesson skeleton

Every teaching lesson follows this shape, in this order:

1. **Eyebrow** — `Lesson N · <Phase>` (number derived from order).
2. **One `<h1>` title** — concrete and specific, not a bare noun.
3. **Plain-English on-ramp** — a short "here's the whole idea in everyday words" opener for
   someone who has never seen this before (the "Walk me through it" block). Comes *before* any
   jargon, code, or formalism.
4. **Define the terms** — the vocabulary this lesson introduces, each defined inline on first
   use (a dedicated "terms, defined once" block is fine for dense lessons).
5. **Body sections** (`<h2>` sub-headings) — teach the concept with **at least one fully
   worked example whose steps/output are traced**. Demonstrate every claim; don't assert
   "this is O(n)" or "this is faster" without showing why.
6. **Why it matters** — when and why a practitioner reaches for this.
7. **Common pitfalls** — the mistakes beginners actually make, and the fix.
8. **Interactive practice** — where the domain allows it (see §6), an on-page exercise.
9. **Checkpoint quiz** — see §7.
10. **Cross-links** — "→ Going deeper" to the in-guide companion lesson(s), both directions
    (on-ramp ↔ advanced). See §8.

Not every lesson needs all ten, but the order is fixed: on-ramp before formalism, worked
examples before the quiz, definitions before use. Keep **exactly one `<h1>` per lesson**;
sub-sections are `<h2>`/`<h3>`.

---

## 5. Self-containment policy

- **All learning happens on the page.** A reader never has to leave the guide to understand
  the material.
- "Going deeper" links point to **another lesson inside the guide**, not outward.
- **External links appear only inside an explicitly optional "Go deeper (optional):" aside**,
  and only for things a guide genuinely can't reproduce (interactive labs, canonical books,
  a library's own reference). Never put a required step behind an external link.
- Beginner practice courses are the one acceptable external recommendation — and only in an
  optional section, never as a substitute for teaching the concept here.

---

## 6. Interactivity standard

Passive reading is the floor; the bar is **practice in the page**.

- **Runnable, auto-graded exercises** wherever the domain executes in a browser sandbox
  (e.g. JS/algorithm challenges in a Web Worker; a real query engine via WASM). Provide
  starter code, run-against-tests, a hint, a reveal-able solution, reset, and a persisted
  "solved" state. Sandbox execution (timeout to kill infinite loops; no backend).
- **Visualizations** for anything spatial or step-wise (algorithms, data structures,
  protocols) — step-through, not just a static diagram.
- **Practice is ungated; the quiz gates.** Auto-graded code is great for practice but fragile
  as a gate — keep the MCQ quiz as the unlock mechanism.
- If a topic genuinely can't be made interactive (pure infra/theory), a **traced worked
  example** is the substitute — never nothing.

---

## 7. Quizzes

- **≥ 3 multiple-choice questions** per teaching lesson.
- A clear **pass threshold** (default: 2 of 3, or ~67% for longer quizzes), **retake anytime**.
- Every option set has plausible distractors, and **every question has an explanation that
  teaches** — the reader learns from getting it wrong, not just from the score.
- Track best score; surface mastery (e.g. stars). Capstone quiz has a higher bar.

---

## 8. Cross-linking & companions

- For every major topic, pair a **beginner on-ramp** with a **deeper/advanced companion** and
  link them **both ways**.
- The interview/skills layer cross-links to the "real job" layer and vice versa (e.g. an
  algorithms lesson → its production-reality companion).
- Prefer in-guide links; when two guides overlap (e.g. an AI guide needing web basics),
  cross-link to the guide that owns the topic rather than re-teaching or assuming it.

---

## 9. Glossary

- Maintain a single **glossary** of every domain term the guide uses, in plain-English
  one-liners.
- **Keep it in sync**: when a lesson introduces a new term, it goes in the glossary. A term in
  the glossary should be defined inline at its first lesson too (glossary is a backstop, not
  the primary teaching).

---

## 10. Visuals

- Diagrams earn their place — use them for anything a sentence explains worse than a picture.
- **Author visuals as self-contained SVG (static file) referenced by a normal image tag**,
  not inline framework/JSX components (avoids MDX/JSX breakage and keeps them portable).
- Text/ASCII diagrams are acceptable for simple flows and inside code blocks.
- Consistent visual language across a guide (same palette, type, spacing as the guide's theme).

---

## 11. Durability

- **De-pin volatile facts.** Model names, version numbers, prices, vendor specifics, and
  "latest X" go in a small number of **clearly dated** pages/sections, not sprinkled through
  evergreen lessons. An evergreen lesson teaches the concept; the dated page carries the
  today-specific numbers.

---

## 12. Tone & quality bar

- Practical and senior, but **never assumes** — gentle with beginners, concrete with examples.
- Optimize prose for the reader who will *change/apply* this, not for the author. Clear names,
  short sentences, one idea at a time.
- Show, don't assert: every "this is faster / safer / better" comes with a demonstration.
- Accessibility: semantic structure, one `<h1>`, meaningful headings, sufficient contrast,
  keyboard-operable interactive widgets.

---

## 13. Definition of done

**Per lesson:**
- [ ] Plain-English on-ramp before any jargon
- [ ] Every new term defined inline on first use
- [ ] No forward reference to an untaught concept
- [ ] ≥ 1 fully worked/traced example; every claim demonstrated
- [ ] "Why it matters" + "common pitfalls" present
- [ ] Interactive practice (or a traced example if interactivity isn't possible)
- [ ] ≥ 3-question quiz, each with a teaching explanation
- [ ] Cross-links to companion lesson(s), both directions
- [ ] Exactly one `<h1>`; sub-sections `<h2>`/`<h3>`
- [ ] New terms added to the glossary
- [ ] External links (if any) confined to an optional "Go deeper" aside

**Per guide:**
- [ ] Opens with a zero-knowledge basics on-ramp phase
- [ ] Single linear order; lesson numbers derived from position
- [ ] Quiz-gated progression + capstone assessment
- [ ] Self-contained (no required external steps)
- [ ] Glossary complete and in sync
- [ ] Volatile facts isolated to dated pages
- [ ] Builds clean; no broken internal links; interactive widgets verified in a real browser

---

## Per-stack implementation notes

**Single-file HTML app** (e.g. `swe-interview-guide`)
- Lessons are objects in one array; content is an HTML template string; order in the array is
  the source of truth (derive eyebrow numbers programmatically from position).
- Interactive widgets via a small handler registry keyed off a `data-*` attribute; run code in
  a Web Worker; persist progress/solved/skin to `localStorage`.
- When editing programmatically, preserve embedded widgets/tabs/quizzes verbatim and verify in
  a real browser (no broken widgets, console clean).

**Docusaurus site** (e.g. `modern-ai-engineer-guide`, `modern-web-dev-guide`)
- One Markdown/MDX doc per lesson; order/numbering live in `sidebars.ts` + page text — never
  rename directories (URLs strip numeric prefixes; renames break links).
- Quiz/interactive components are MDX components registered globally; visuals are static SVGs
  referenced by Markdown image syntax (not inline JSX).
- Keep prefixed vs folder-relative link ids straight; run the build and fix broken-link
  warnings before shipping.

---

*Standard v1 — derived from the swe-interview-guide build-out (zero-CS on-ramp, the
on-ramp+companion pattern, in-page interactive practice, self-containment, and the
maximal-depth lesson skeleton). Update here, then sync to every guide repo.*
