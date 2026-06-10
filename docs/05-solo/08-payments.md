---
id: solo-payments
title: Payments
sidebar_position: 9
sidebar_label: 8. Payments
description: Stripe Checkout, Polar, Lemon Squeezy. Usage-based pricing for AI tools. Pass-through vs marked-up. The minimal wiring.
---

# Payments

> **In one line:** Free with a generous cap → $10–$20/mo for "remove the cap." Stripe Checkout + a webhook is the entire backend.

:::tip[In plain English]
Solo AI products almost always converge on the same pricing shape: free tier with auth and a daily limit, paid tier that removes (or massively raises) the limit. You don't need usage-based metered billing on day one; a flat monthly fee with a generous quota beats it for simplicity, and your users will tell you when they need more.
:::

## The default pricing shape

For a solo AI tool in 2026:

| Tier         | Price       | Limit                       | Who buys                 |
|--------------|-------------|------------------------------|--------------------------|
| Free         | $0          | 10–50 requests / day         | Browsers, evaluators     |
| Indie        | $5–$15/mo   | 500–2,000 requests / day     | Hobbyists, power users   |
| Pro          | $20–$50/mo  | 10,000 / day, faster model   | Work-tool users          |
| Custom       | Talk to me  | Anything above               | The 1 customer that pays |

A single Stripe price ID per tier, monthly subscription. No annual at v0 (the discount isn't worth the support burden). No usage-based until the simple version is being out-grown by real customers.

## Why flat-rate beats usage-based at v0

- **Users hate surprise bills more than they hate higher prices.** $20/mo is easier to swallow than $0.003/request when they can't predict request count.
- **Stripe Checkout handles subscriptions natively** with one URL; metered billing requires you to call the API on every request to record usage.
- **Cost certainty for you, too.** A flat tier with a generous limit caps your per-user blast radius.

When to switch to usage-based: when you have one customer paying $500/mo on the Pro plan because they actually use it, *and* one customer paying $20/mo using it as much as the $500 customer. That asymmetry is the signal.

## The minimal Stripe wiring

Two endpoints. One for creating the Checkout session, one for the webhook.

### Step 1: create a Checkout session

```typescript
// app/api/checkout/route.ts
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const { tier } = await req.json(); // "indie" or "pro"
  const priceId = tier === "pro"
    ? process.env.STRIPE_PRICE_PRO!
    : process.env.STRIPE_PRICE_INDIE!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/app?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: { userId, tier },
  });

  return Response.json({ url: session.url });
}
```

### Step 2: handle the webhook

```typescript
// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: s.metadata!.userId,
      tier: s.metadata!.tier,
      stripe_customer_id: s.customer as string,
      stripe_subscription_id: s.subscription as string,
      status: "active",
    });
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    await supabaseAdmin.from("subscriptions")
      .update({ status: sub.status })
      .eq("stripe_subscription_id", sub.id);
  }

  return new Response("ok");
}
```

That's the entire backend. The `metadata: { userId, tier }` is what bridges Stripe's customer ID and your user — same trick as in any Stripe integration.

## Reading the user's tier

When checking rate limits or unlocking features, read the user's tier from your DB:

```typescript
const { data: sub } = await supabaseAdmin
  .from("subscriptions")
  .select("tier, status")
  .eq("user_id", userId)
  .single();

const tier = (sub?.status === "active" ? sub.tier : "free") ?? "free";
const dailyLimit = { free: 10, indie: 500, pro: 10000 }[tier];
```

Cache this (or join into your auth context) so you're not hitting the DB on every request.

## Pass-through vs marked-up

A perennial solo-AI question: do you mark up the LLM cost, or pass it through transparently?

**Pass-through** ("you pay $20/mo, that gets you $19 of Claude credits, we keep $1 for the wrapper"):

- Honest, defensible, often pitched in the FAQ.
- Works when your *interface* is the value, not the prompt engineering.
- Common pattern in 2026 chat-with-X products.

**Marked-up** ("$20/mo gets you our prompt + our UI + the model"):

- Standard SaaS pricing.
- Works when your prompt is doing real work (legal review, code review, summarization with QA).
- Don't itemize the cost — sell the outcome.

For most solo tools, mark up. Your prompt is the product. A user paying $15/mo for "summarize my meetings" doesn't care that the underlying API call cost $0.40 — they care that they saved an hour.

## Polar and Lemon Squeezy

If you have international customers, sales tax becomes a non-trivial problem. Two alternatives:

- **Polar.sh** — built for indie devs, handles VAT/sales-tax-as-merchant-of-record, GitHub integration, similar API surface to Stripe.
- **Lemon Squeezy** — same value prop; been around longer; now owned by Stripe but still operates as merchant-of-record.

Both add ~5% on top of Stripe's standard fee in exchange for absorbing the tax compliance. For a US-only beta, plain Stripe is fine. For a global launch, Polar or Lemon Squeezy saves you from learning EU VAT rules.

:::note[Worked example: tier + cost math]
You charge $15/mo for the Indie tier with a 1000-requests/day limit.

Assume average use: 30 requests/day (most users hit the tier ceiling rarely).
Cost per request: ~$0.01 (Claude Sonnet, modest input/output).
Cost per user per month: 30 × 30 × $0.01 = $9.

Gross margin: ($15 − $9) / $15 = 40%. Tight but workable.

If average use jumps to 200 req/day, margin flips negative. The fix: raise the price, lower the limit, OR move heavy users to Pro. Build the dashboard that shows you per-user request counts (see [observability](./10-observability.md)) so you can spot this before it bites.
:::

:::info[Highlight: don't ship a trial]
For a $10–$20/mo AI tool, a 14-day free trial creates more support burden than it earns subscribers. The free tier with a daily limit *is* the trial. Users who want more upgrade; users who don't, churn anyway. The fix is one less surface to maintain: free tier OR paid tier, no trial.
:::

## Common mistakes

:::caution[Where people commonly trip up]
- **Granting access on the success_url redirect.** Users bookmark `/app?upgraded=1` and "upgrade" for free. The fix is to grant access *only* in the webhook handler — the redirect is UX, not proof.
- **Forgetting `customer.subscription.deleted`.** Users cancel, but you keep treating them as Pro for months. The fix is to handle the full lifecycle from day one.
- **Not handling failed payments.** A card declines, Stripe retries, eventually marks the sub `past_due`. If you don't react, you've given them weeks of free Pro. The fix is to listen for `customer.subscription.updated` and downgrade on non-active statuses.
- **Per-request usage-based on a unit users don't understand.** "$0.001 per 1k tokens output" is incomprehensible to non-AI people. The fix is flat-rate with simple limits *or* "credits" (1 credit = 1 generation), priced as a pack.
- **Testing only with `4242 4242 4242 4242`.** Never sees a decline, never sees 3DS, never sees the redirect-then-webhook race. The fix is to also run `4000 0025 0000 3155` (3DS) and `4000 0000 0000 0341` (auth succeeds, charge fails later) before going live.
:::

## Page checkpoint

Self-check:

- Does the webhook (not the redirect) flip the user to a paid tier?
- Do you handle `customer.subscription.deleted` and `.updated` events?
- Do you know your gross margin per tier on a typical-user assumption?

<Quiz id="solo-payments-quick-check" variant="micro" title="Quick check">

<Question
  prompt="Where should you grant a user paid-tier access after a Stripe checkout?"
  options={[
    { text: "On the success_url redirect, since that proves payment completed" },
    { text: "In the webhook handler for checkout.session.completed — the redirect is UX, not proof" },
    { text: "In the frontend, by checking for the upgraded=1 query parameter" },
    { text: "By polling the Stripe API from the client every minute" }
  ]}
  correct={1}
  explanation="Only the signed webhook event proves payment happened; the success redirect is just navigation, and users can bookmark a URL like /app?upgraded=1 to fake an upgrade forever. The redirect option is tempting precisely because it FEELS like proof — Stripe did send the user there — but anyone can type that URL without paying."
/>

<Question
  prompt="Why does the page recommend flat-rate pricing over usage-based pricing at v0?"
  options={[
    { text: "Users hate surprise bills, Stripe Checkout handles flat subscriptions natively, and a capped tier limits your own per-user cost exposure" },
    { text: "Usage-based pricing is illegal for AI products in most jurisdictions" },
    { text: "Stripe does not support metered billing at all" },
    { text: "Flat-rate pricing always produces higher revenue per customer" }
  ]}
  correct={0}
  explanation="The three reasons given are predictability for users, one-URL simplicity for you, and cost certainty on both sides. The higher-revenue option is the tempting distractor — the page actually describes the opposite scenario as the switch signal: when a heavy $20/mo user consumes like a $500/mo one, usage-based starts earning MORE, which is when you migrate."
/>

<Question
  prompt="For most solo AI tools, should you mark up the LLM cost or pass it through transparently?"
  options={[
    { text: "Pass it through, because users always demand cost transparency" },
    { text: "Neither — keep the tool free until you reach 10,000 users" },
    { text: "Mark it up — your prompt is the product, and users pay for the outcome, not the API call underneath" },
    { text: "Itemize the API cost on every invoice so users can verify it" }
  ]}
  correct={2}
  explanation="The page says most solo tools should use standard SaaS markup: a user paying $15/mo to summarize meetings cares about the hour saved, not the $0.40 API cost. Pass-through is a real pattern, but it fits the narrower case where the interface itself is the value — and even then the page says don't itemize; sell the outcome."
/>

</Quiz>

## What's next

→ Continue to [Deployment](./09-deployment.md) where we'll lock in the `git push → live` pipeline and avoid the most common preview-env disaster.
