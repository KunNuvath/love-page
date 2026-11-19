import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { unlockTemplateForUser } from "@/src/lib/stripe-unlock";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";

export const dynamic = "force-dynamic";

/**
 * Verifies a completed Stripe Checkout Session on redirect (?stripe_session_id=cs_...)
 * and immediately unlocks the user's Supabase account.
 */
export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { sessionId?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const sessionId = body.sessionId?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid Stripe session ID." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
        },
      }
    );
    const session = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: session?.error?.message || "Could not verify Stripe session." },
        { status: 400 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment has not been completed yet.", paymentStatus: session.payment_status },
        { status: 402 }
      );
    }

    const sessionUserId = session.metadata?.user_id || session.client_reference_id;
    if (sessionUserId && sessionUserId !== user.id) {
      return NextResponse.json(
        { error: "This payment session belongs to a different account." },
        { status: 403 }
      );
    }

    const templateId = session.metadata?.template_id || ADVENTURE_TEMPLATE_ID;
    const unlocked = await unlockTemplateForUser({
      userId: user.id,
      templateId,
      sessionId: session.id,
      email: session.customer_details?.email || user.email,
      amountTotal: session.amount_total,
      currency: session.currency,
    });

    return NextResponse.json({ success: true, unlocked, templateId });
  } catch (err) {
    console.error("Stripe verify error:", err);
    return NextResponse.json({ error: "Could not verify payment." }, { status: 500 });
  }
}
