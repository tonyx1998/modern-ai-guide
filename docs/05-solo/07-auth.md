---
id: solo-auth
title: Auth
sidebar_position: 8
sidebar_label: 7. Auth
description: Clerk or Supabase auth in twenty minutes. Why anonymous LLM endpoints get abused within hours, and how per-user rate limits actually work.
---

# Auth

> **In one line:** Add auth before your endpoint goes public. Anonymous + free + LLM is a Reddit thread waiting to happen.

:::tip[In plain English]
"I'll add auth later" is the most expensive sentence in solo AI. The exact moment you tweet your URL is the exact moment a scraper or a curious teenager finds the open endpoint. Within minutes, you're paying for someone else's "research." Auth + per-user rate limits is a 20-minute job and the only thing standing between you and a 3am SMS from your provider.
:::

> **→ Going deeper:** Auth and rate limits stop abuse of the endpoint; they don't stop abuse of the *model itself* (prompt injection, jailbreaks). Even a solo public LLM is worth one read of [Chapter 6: Responsible & Safe AI](/docs/safety), especially [Prompt injection](/docs/safety/safety-prompt-injection).

## Why auth comes before features

A free, anonymous, uncapped LLM endpoint will be discovered and abused. Concretely:

- It will be hit by other people's "free LLM" wrappers reselling your tokens.
- It will be hit by spammers using it to generate content at scale.
- It will be hit by curious devs benchmarking models on your dime.
- It will be hit by the same person hitting refresh 50,000 times in a single weekend, because there was no friction.

You don't need to *charge* users on day one. You just need to *identify* them so per-user limits work.

## The two default auth options

### Option 1: Clerk (fastest)

- Drop-in `<SignIn />` and `<UserButton />` components for Next.js.
- Email magic link, Google, GitHub all built in.
- Free tier: 10,000 MAU. You will not exceed this on a solo project.
- Adds ~20 minutes to your weekend.

### Option 2: Supabase Auth (one-product stack)

- Already in your stack if you picked Supabase for DB.
- Email magic link, OAuth providers all included.
- Free tier: 50,000 MAU.
- Slightly more wiring than Clerk; saves one vendor.

Either works. **Default to Clerk** if you want the absolute fastest path; **default to Supabase Auth** if you're already using Supabase for the DB and want one less dashboard.

## Clerk in five steps

```bash
pnpm add @clerk/nextjs
```

1. Add `<ClerkProvider>` around your app in `app/layout.tsx`.
2. Add a `middleware.ts` that protects routes:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/api/generate(.*)", "/app(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth.protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

3. Add env vars (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
4. Use `<SignInButton />` / `<SignedIn>` / `<SignedOut>` in your UI.
5. Read the user in your route:

```typescript
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("unauthorized", { status: 401 });
  // ... LLM call
}
```

That's it. Twenty minutes including reading the docs.

## Per-user rate limits

Auth alone doesn't stop abuse — a real user with a real account can still hit refresh 5,000 times. You need a **per-user rate limit**.

The simplest version, with Upstash Redis (free tier):

```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour per key
  analytics: true,
});
```

In your route:

```typescript
const { userId } = await auth();
if (!userId) return new Response("unauthorized", { status: 401 });

const { success, remaining, reset } = await ratelimit.limit(userId);
if (!success) {
  return new Response(
    JSON.stringify({ error: "rate_limited", reset }),
    { status: 429, headers: { "x-ratelimit-remaining": String(remaining) } }
  );
}
// ... LLM call
```

10 requests per hour is generous enough that real users won't notice and tight enough that an abuser can't drain you. Tune based on your cost-per-request.

## Free-tier strategy

The standard solo AI tier ladder:

| Tier        | Auth | Rate limit              | Cost to you per user/mo |
|-------------|------|-------------------------|--------------------------|
| Anonymous   | none | 1 req/day per IP        | < $0.01                  |
| Signed-in   | yes  | 10 req/hour, 50 req/day | $0.10–$0.50              |
| Paid        | yes  | 1,000 req/day           | $5–$10                   |
| Pro         | yes  | 10,000 req/day          | $20–$30                  |

You'll launch with just "Anonymous" and "Signed-in." Paid tiers come once you have real demand — see [payments](./08-payments.md).

## A second guardrail: a hard daily kill switch

In addition to per-user rate limits, set a **global daily request cap** in your code. If your app sends more than `N` requests in 24 hours, refuse to send the next one and email yourself.

```typescript
// lib/global-cap.ts (using Upstash)
const GLOBAL_DAILY_LIMIT = 5000;

export async function checkGlobalCap(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `global:${today}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 86400);
  return count <= GLOBAL_DAILY_LIMIT;
}
```

Paired with the provider-dashboard cap from [env setup](./05-env-setup.md), this is your two-layer defense. The provider cap is the absolute ceiling; this one is the polite "something's wrong, look at it" cap.

:::note[Worked example: an actual day-one abuse story]
A solo builder tweets a demo at 9pm. By 11pm, the X post has 2k views. By 2am, an `LLM wrapper` GitHub bot has discovered the open endpoint and forwarded 200,000 requests through it.

Cost without auth: ~$240 in one night.

Cost with auth + per-user rate limit + global daily cap: the bot has to make 200,000 accounts first. It won't. Cost: ~$2.

The difference is twenty minutes of work.
:::

:::info[Highlight: auth is the cheapest insurance you'll ever buy]
Twenty minutes of Clerk setup vs. an unrecoverable provider bill. The math is not subtle. Every "I'll add auth tomorrow" launch eventually becomes "I quietly took down the project." The fix is to never ship public without auth + per-user limits. Even for the demo.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **"I'll add auth tomorrow."** The endpoint is found tonight. The fix is auth before your URL is shared anywhere — even the friends-only link.
- **Per-IP rate limit only.** Trivial to bypass; one mobile carrier shares IPs across thousands of users. The fix is per-user limits (keyed on `userId`), with per-IP as a *backup* layer for unauthenticated routes.
- **Counting failed responses against the limit.** A user gets one error and burns their daily quota. The fix is to only increment the counter *after* a successful response.
- **No 429 UX in the frontend.** The user just sees "something broke." The fix is to render a clear "you've used 10/10 of today's free generations — sign up for more" message, with the upgrade path right there.
- **Rolling your own auth "to save $0."** Clerk and Supabase Auth are free at your scale. The fix is to use them; password resets, email verification, and OAuth flows are months of subtle security work you'd rather not own.
:::

## Page checkpoint

Self-check:

- Does every LLM-call route check `userId` before calling the model?
- Is there a per-user rate limit on the route, keyed on `userId`?
- Is there a global daily cap that emails you if breached?

## What's next

→ Continue to [Payments](./08-payments.md) where we'll add the "remove the limit" upgrade path so abuse turns into revenue.
