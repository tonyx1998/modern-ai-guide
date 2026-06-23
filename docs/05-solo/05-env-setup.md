---
id: solo-env-setup
title: Environment Setup
sidebar_position: 6
sidebar_label: 5. Env setup
description: The seven free-tier accounts to open on day one, the dotfiles, the env vars, and the secret hygiene that prevents the $400 Friday-night bill.
---

# Environment Setup

> **In one line:** Open seven accounts, put seven secrets in `.env.local`, deploy an empty project, and call it day one done.

:::tip[In plain English]
"Environment setup" for solo AI is mostly account creation and secret management. The actual code is trivial. The mistakes are all in *which* key ended up in *which* file, and whether spend caps were set before the first prompt was sent. This page is the checklist that prevents the standard week-one disasters.
:::

*This page assumes basic web-dev and deployment knowledge (env vars, git, deploying to a host like Vercel). If those are new, the companion modern web dev guide covers them from the ground up.*

:::note[Prerequisites]
Most of this page is **[API keys and environment variables](/docs/foundations/programming-basics#4-api-keys-and-environment-variables)** and **[terminal](/docs/foundations/programming-basics#5-the-terminal)** work. New to those? → [Programming on-ramp](/docs/foundations/programming-basics).
:::

## The day-one account checklist

Open all seven before writing any code. Most take 60 seconds.

1. **Anthropic console** (or OpenAI platform). Get an API key. **Set a monthly spend cap immediately** — $20 is plenty for solo v0.
2. **Vercel** (if Stack A). Connect your GitHub. Use the free Hobby tier.
3. **Modal** (if Stack B). `pip install modal && modal token new`. $30 free credits.
4. **Supabase**. Create a project (auto-provisions Postgres + auth). Free tier handles real volumes.
5. **GitHub**. New private repo. Solo projects can be private forever, or made public at launch.
6. **Stripe**. Create an account. Stay in test mode until you actually have a paying customer. You don't need to activate live mode in week one.
7. **Langfuse cloud free tier**. Get a public + secret key for tracing.

Optional but nearly always worth it:

- **Cloudflare** account if you'll use R2 for file uploads.
- **Resend** for transactional email when you add auth (free tier covers it).
- **A domain registrar** (Namecheap, Cloudflare). Even a $12 domain matters for shareability.

## The single `.env.local` file

Use one file. Don't split secrets across the codebase. For a Stack A project:

```bash
# .env.local — gitignored, never committed

# Model
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENAI_API_KEY=sk-...

# Database + auth
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, very dangerous

# Payments (test mode for now)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Observability
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com

# App config
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
```

For Stack B (Python), the same keys live in a `.env` file loaded by `python-dotenv`, plus your Modal secrets are set with `modal secret create` so they're injected at runtime — never committed even to `.env`.

## The secret hygiene rules

These are not optional; every veteran solo builder has at least one war story about each.

- **`NEXT_PUBLIC_*` (Next.js) or `VITE_*` (Vite) keys are shipped to the browser.** Never put a model API key behind one of those prefixes. The user can hit View Source and find it.
- **Use a server-only key** for any LLM call. Route all model calls through your backend; never call OpenAI/Anthropic directly from client-side JS.
- **Two separate accounts for "real" and "test" if you can.** A scrappy alternative: prefix all dev-env values with `TEST_` and have your code refuse to start if `NODE_ENV !== "production"` and any `TEST_`-less key is present.
- **Rotate immediately if a key touches a public repo, a screenshot, or a Loom recording.** It's faster than denying it leaked.
- **`.gitignore` is not enough.** Use `git-secrets` or `trufflehog` as a pre-commit hook so a typo doesn't slip a key in.

## Spend caps — set them now, not after

In each provider's dashboard, set a hard monthly cap:

- Anthropic / OpenAI: $20–$50 cap. Real ceiling, not "warning."
- Supabase: stays on free tier; just enable email alerts on overage.
- Vercel: Hobby tier is free; you'll see the bandwidth/build-minute caps before you'd be billed.
- Modal: set a "max monthly spend" in the dashboard.

The first month of a solo project should cost under $10. If it's heading higher, something is wrong — almost always an unauthenticated endpoint being abused or an agent loop without a kill switch. See [pitfalls](./14-pitfalls.md).

## The hour-zero deploy

Before you write any feature code, **deploy an empty app to production.** This sounds silly. It's the single highest-ROI thing you'll do this weekend.

For Stack A:

```bash
npx create-next-app@latest my-ai-thing --typescript --tailwind --app
cd my-ai-thing
git init && git add . && git commit -m "init"
gh repo create my-ai-thing --private --source=. --push
# go to vercel.com, "Import Project", select the repo, deploy
# you now have a URL
```

For Stack B:

```python
# main.py
import modal
app = modal.App("my-ai-thing")

@app.function()
@modal.fastapi_endpoint()
def hello():
    return {"ok": True}

# modal deploy main.py — now you have a URL
```

You have a live URL with nothing on it. Now add the env vars to the host (Vercel project settings → Environment Variables, or `modal secret create`). Verify the empty deploy still works.

Why bother? Because deploying nothing first proves the *whole pipeline* works in isolation. If you defer this to "right before launch," you'll hit five deploy errors at once and won't know which to debug first.

:::note[Try it yourself]
Time-box this whole page to 90 minutes:
- 0–30 min: Open the seven accounts. Set spend caps.
- 30–60 min: Generate keys, fill `.env.local`, get them into the host as well.
- 60–90 min: Empty deploy to production. Verify the URL loads.

If you take longer, the friction is in the secret hygiene, not the building. Stop, re-read this page, fix that.
:::

:::info[Highlight: spend caps are non-negotiable]
The single most common "I quit doing AI side projects" moment is a $200–$2,000 bill from an unauthenticated, uncapped endpoint that got scraped or agent-loop-runaway'd. **The cap is a hard ceiling, not a warning.** Set it before the first prompt. You'd rather your app return 429s than your bank statement scare you.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Skipping the spend cap "just for tonight."** Every cautionary tale starts with "I'll set the cap later." The fix is: cap first, code second. Anthropic and OpenAI dashboards both make it one click.
- **Putting the LLM API key in a `NEXT_PUBLIC_*` var.** It works in dev and then strangers find it on launch day. The fix is to never let the model SDK be imported in client components — keep it in `app/api/*` routes only.
- **Reusing one Stripe key for test and prod.** You'll charge a real card during dev. The fix is `sk_test_` for everything not in Vercel's Production environment, and `sk_live_` only in Production env vars.
- **Committing `.env.local`.** Even private repos leak via forks, contractors, or screen recordings. The fix is `.gitignore` + a pre-commit hook + rotating any key that's ever been near git history.
- **Skipping the empty deploy.** "I'll deploy when I'm ready" turns into five interacting bugs at launch. The fix is: empty deploy in hour zero, every change auto-deploys on push, you never have a "first big deploy" moment.
:::

## Page checkpoint

Self-check:

- Are spend caps set on Anthropic/OpenAI? (Hard caps, not warnings.)
- Is your `.env.local` populated and gitignored?
- Did you deploy an empty app to production *before* writing features?

<Quiz id="solo-env-setup-quick-check" variant="micro" title="Quick check">

<Question
  prompt="When should you set a spend cap on your LLM provider account, and what kind of cap should it be?"
  options={[
    { text: "After your first real bill arrives, as a soft warning email" },
    { text: "Once you have paying users, as a warning threshold" },
    { text: "Before the first prompt is ever sent, as a hard ceiling rather than a warning" },
    { text: "Only when you add an agent loop to the product" }
  ]}
  correct={2}
  explanation="The page calls spend caps non-negotiable: set a hard monthly cap (around $20 for v0) before any code runs, because the most common quit-moment is a surprise bill from an uncapped endpoint. A warning threshold is the tempting half-measure — the page explicitly says you want a real ceiling, since 429 errors are better than a scary bank statement."
/>

<Question
  prompt="Why must you never put a model API key in a NEXT_PUBLIC_* environment variable?"
  options={[
    { text: "Variables with that prefix are shipped to the browser, so anyone can find the key via View Source" },
    { text: "Next.js refuses to load variables with that prefix at build time" },
    { text: "The prefix makes the variable unavailable to API routes" },
    { text: "Anthropic and OpenAI reject keys stored under that name" }
  ]}
  correct={0}
  explanation="NEXT_PUBLIC_ (and VITE_) prefixes mark variables for client-side bundling, which means the key becomes publicly readable — so all model calls must go through your backend with a server-only key. The build-time option is tempting because it sounds like a framework rule, but the danger is the opposite: the variable loads fine and silently leaks."
/>

<Question
  prompt="What is the point of deploying an empty app to production in hour zero, before writing any feature code?"
  options={[
    { text: "It reserves your project name on the hosting platform" },
    { text: "It proves the whole deploy pipeline works in isolation, so you never face five interacting deploy errors at once later" },
    { text: "It warms up the CDN cache for launch day" },
    { text: "Hosting providers require an initial deploy to activate env vars" }
  ]}
  correct={1}
  explanation="The page calls the empty deploy the highest-ROI step of the weekend: deferring deployment to right before launch means hitting several deploy errors simultaneously with no idea which to debug first. The env-var option is a plausible distractor because you do add env vars right after the empty deploy — but that's part of the verification, not a platform requirement."
/>

</Quiz>

## What's next

→ Continue to [The Development Loop](./06-development.md) where we'll set up the prompt → eval → commit rhythm that's the actual day-to-day of solo AI work.
