---
id: solo-deployment
title: Deployment
sidebar_position: 10
sidebar_label: 9. Deployment
description: Vercel for Stack A, Modal for Stack B. Preview deploys, environment promotion, and how to keep production API keys out of preview env.
---

# Deployment

> **In one line:** Push to `main` deploys to prod; push to any other branch deploys to a preview URL. That's the entire pipeline.

:::tip[In plain English]
"Deployment" in 2026 means giving your hosting provider a GitHub repo and letting them auto-build on every push. You will not write a Dockerfile, you will not set up CI, you will not configure a load balancer. The only real decisions are: which branch is production, and which env vars exist in which environment.
:::

## The deploy pipeline

### Stack A (Vercel)

1. Push to a `main` branch → Vercel builds and deploys to your production domain.
2. Push to any other branch (or open a PR) → Vercel deploys to a unique preview URL (`my-app-git-feature-x.vercel.app`).
3. Merge the PR → production updates.

That's it. No build minutes to manage, no manual promote step. Free tier covers a real solo project.

### Stack B (Modal)

1. `modal deploy main.py` → live function endpoint, versioned.
2. Use `modal deploy main.py --env dev` for a separate dev environment.
3. Cron, queues, and GPU jobs all defined in `@app.function()` decorators in the same file.

Modal doesn't have "preview deploys" the same way Vercel does, but `--env` flags get you the same separation.

## Environment variables, per environment

This is where most solo deployments go wrong. **Different environments need different keys.** In Vercel's project settings → Environment Variables, you'll see three columns:

| Variable                 | Development         | Preview              | Production           |
|--------------------------|---------------------|----------------------|----------------------|
| `ANTHROPIC_API_KEY`      | dev key (low cap)   | dev key (low cap)    | prod key (real cap)  |
| `STRIPE_SECRET_KEY`      | `sk_test_...`       | `sk_test_...`        | `sk_live_...`        |
| `STRIPE_WEBHOOK_SECRET`  | test webhook        | test webhook         | live webhook         |
| `NEXT_PUBLIC_SUPABASE_URL` | dev project       | dev project          | prod project         |
| `RESEND_API_KEY`         | test domain         | test domain          | real domain          |

Rule: **anything that costs money or sends email** must be a test key outside of Production. Preview URLs are shareable; if a stranger clicks one and it triggers a real Stripe charge or a real email, you've got a problem.

## The production-data-in-preview question

A real choice: should preview deploys point at the production DB or a dev DB?

| Option              | Pro                                      | Con                                       |
|---------------------|-------------------------------------------|--------------------------------------------|
| Preview → prod DB   | Test with real data; no fixtures needed   | A bad migration in preview wrecks prod     |
| Preview → dev DB    | Safe to break                              | Dev DB diverges from prod over time        |
| Preview → branch DB | Best of both; one DB branch per PR        | Requires Neon / Supabase branching, more setup |

For solo v0: **preview → dev DB**. Once you're charging real customers, **preview → branch DB** via Supabase Branching or Neon Branching. Never preview → prod.

## The custom domain (5-minute job)

1. Buy a domain (Namecheap, Cloudflare, Porkbun). $12/year is fine.
2. In Vercel project → Settings → Domains → Add. Paste the domain.
3. Vercel tells you to add one or two DNS records at your registrar. Copy-paste.
4. Wait 1–60 minutes for DNS propagation. TLS provisions automatically.

If you bought the domain through Cloudflare and Vercel: configure DNS *only* at one of them. The "both think they're authoritative" failure mode is the most common source of "my domain works for me but not for my friend."

## The 60-second rollback

When production breaks, you want a fast rollback before you debug. Vercel UI → Deployments tab → find a previous successful deploy → "Promote to Production." Live in 30 seconds.

Modal: `modal app rollback my-app` to the previous version.

Pin a sticky note (or a Notes.app entry) with the exact words "When prod is on fire: Vercel → Deployments → Promote" so you don't waste minutes finding it under stress.

## Cron and background jobs

A common solo-AI need: nightly batch jobs (re-embed, refresh cache, send a daily email).

- **Stack A:** Use Vercel Cron Jobs (configure in `vercel.json`). Free tier covers a few jobs at hourly or daily frequency. Calls a route handler — same security model as any other route.
- **Stack B:** Modal has cron built in:

```python
@app.function(schedule=modal.Cron("0 8 * * *"))
def daily_digest():
    ...
```

If you outgrow either, Render and Fly.io both have cron. Don't reach for Airflow.

## File storage

Three legit options for solo AI:

- **Supabase Storage** — already in your stack if you're on Supabase. Simple, integrated, fine for under 1GB.
- **Cloudflare R2** — S3-compatible, free egress, $0.015/GB stored. The right answer for files larger than a few MB or anything user-uploaded at volume.
- **Direct in Postgres `bytea`** — fine for tiny stuff (\&lt;1MB), don't scale past that.

For the typical solo AI tool (text-in, text-out), you won't need file storage at v0.

:::note[Worked example: the most common solo deploy incident]
You merge a PR. The preview env has `STRIPE_SECRET_KEY` and `RESEND_API_KEY` set to production values by accident (you forgot to set test keys when adding the variable). A teammate or beta tester opens the preview URL and triggers a flow that charges a real card and sends an email to a real prod user.

The structural fix isn't "be more careful." It's: when adding any secret to Vercel, **always** add it as three separate values for Dev / Preview / Production, and double-check that Preview is the test version before clicking save. Better yet, name your test-tier secrets clearly: `STRIPE_SECRET_KEY=sk_test_...` and visibly different from `sk_live_...` in the dashboard.
:::

:::info[Highlight: deploy on day one, not launch day]
The most common solo-deploy disaster is the "I'll deploy when I'm ready" deploy. Five interacting bugs hit at once: env vars missing, build script breaks on the Linux runner, domain DNS not propagated, webhook URL wrong. **Deploy an empty project on day one.** Push frequent small changes. By launch, deploys are boring.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **One set of env vars used for all environments.** Live Stripe key fires from a preview URL; live email goes from a feature branch. The fix is per-environment scoping in Vercel/Modal, and naming conventions that make `test` vs `live` visually distinct.
- **Pointing preview deploys at the prod DB.** A migration test deletes a prod column. The fix is preview → dev DB at minimum, branch DB once you have customers.
- **Locking the deploy behind a manual promote step.** Solo speed depends on push-to-deploy. The fix is to let `main` auto-deploy to prod; preview branches catch issues before merge.
- **Never testing the rollback.** First time you try it is at 11pm under pressure. The fix is to do one practice rollback the week you ship — promote yesterday's deploy, verify it works, promote today's back.
- **Skipping a custom domain "until later."** `something.vercel.app` is impossible to share verbally and embarrassing on a launch tweet. The fix is to buy the $12 domain on day one.
:::

## Page checkpoint

Self-check:

- Is `main` set to auto-deploy to production?
- Are test keys (Stripe, email, sometimes LLM) used in Development and Preview, with live keys only in Production?
- Have you done a practice rollback at least once?

<Quiz id="solo-deployment-quick-check" variant="micro" title="Quick check">

<Question
  prompt="What is the rule for which environment variables get live keys versus test keys?"
  options={[
    { text: "Use live keys everywhere so preview behaves exactly like production" },
    { text: "Use test keys everywhere, including production, until launch day" },
    { text: "Only the Stripe key needs an environment split; everything else can be shared" },
    { text: "Anything that costs money or sends email gets a test key everywhere except Production" }
  ]}
  correct={3}
  explanation="Preview URLs are shareable, so a stranger clicking one must never trigger a real charge or a real email — Stripe, email, and often LLM keys are test-tier in Development and Preview, live only in Production. 'Live keys everywhere for realism' is the tempting option, and it is exactly the setup behind the page's most-common-incident story."
/>

<Question
  prompt="Which database should preview deploys point at for a solo v0?"
  options={[
    { text: "A dev DB — never the production DB, since a bad migration in preview would wreck prod" },
    { text: "The production DB, so previews test against real data" },
    { text: "An in-memory SQLite database recreated on each deploy" },
    { text: "No database at all until launch" }
  ]}
  correct={0}
  explanation="The recommendation is preview to dev DB at v0, graduating to per-PR branch databases (Supabase or Neon branching) once real customers exist — and never preview to prod. Pointing at prod is tempting because real data removes fixture work, but the page weighs that against the risk of a preview migration destroying production data."
/>

<Question
  prompt="What does the page say you should do about rollbacks BEFORE production ever breaks?"
  options={[
    { text: "Write a custom rollback script with database snapshots" },
    { text: "Nothing — Vercel rolls back automatically when errors spike" },
    { text: "Do one practice rollback the week you ship, so the first real one is not performed at 11pm under pressure" },
    { text: "Disable auto-deploy so bad code can never reach production" }
  ]}
  correct={2}
  explanation="Rollback on Vercel is just promoting a previous deploy — about 60 seconds — but the page insists you rehearse it once and even keep a note of the exact steps, because stress makes you slow at unfamiliar UI. The auto-rollback option is plausible-sounding, but no such automatic behavior is described; the rollback is a deliberate manual action."
/>

</Quiz>

## What's next

→ Continue to [Observability](./10-observability.md) where we'll set up Langfuse and a cost dashboard so problems show up before users notice them.
