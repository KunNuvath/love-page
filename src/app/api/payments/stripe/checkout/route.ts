import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { PREMIUM_TEMPLATES } from "@/src/lib/premium";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server (missing STRIPE_SECRET_KEY)." },
      { status: 503 }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in before checkout so we can unlock your account." },
      { status: 401 }
    );
  }

  let body: { templateId?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const templateId = body.templateId || "adventure-scrapbook";
  const template = PREMIUM_TEMPLATES[templateId];
  if (!template) {
    return NextResponse.json({ error: "Unknown template." }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const cleanOrigin = origin.replace(/\/$/, "");

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("allow_promotion_codes", "true");
  form.set("success_url", `${cleanOrigin}${template.href}?stripe_session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${cleanOrigin}${template.href}?canceled=1`);
  form.set("client_reference_id", user.id);
  if (user.email) {
    form.set("customer_email", user.email);
  }
  form.set("invoice_creation[enabled]", "true");
  form.set("metadata[user_id]", user.id);
  form.set("metadata[template_id]", templateId);
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", "499");
  form.set("line_items[0][price_data][product_data][name]", `${template.name} — Premium Scrapbook`);
  form.set(
    "line_items[0][price_data][product_data][description]",
    "Lifetime access to Vol. 03 handmade torn-paper travel collage on lovepage.site"
  );
  form.set("line_items[0][quantity]", "1");

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || !stripeData.url) {
      console.error("Stripe Checkout Session error:", stripeData);
      return NextResponse.json(
        { error: stripeData?.error?.message || "Could not create Stripe Checkout session." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      checkoutUrl: stripeData.url,
      sessionId: stripeData.id,
    });
  } catch (err) {
    console.error("Stripe checkout request failed:", err);
    return NextResponse.json(
      { error: "Failed to connect to Stripe. Please try again." },
      { status: 502 }
    );
  }
}
