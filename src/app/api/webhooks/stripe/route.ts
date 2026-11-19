import crypto from "crypto";
import { NextResponse } from "next/server";
import { unlockTemplateForUser } from "@/src/lib/stripe-unlock";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";

export const dynamic = "force-dynamic";

function verifyStripeSignature(rawBody: string, header: string, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  // Reject events older than 5 minutes to prevent replay attacks
  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(ageSec) || ageSec > 300) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const sigBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature") || "";

  if (!verifyStripeSignature(rawBody, sigHeader, secret)) {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    if (session?.payment_status === "paid") {
      const userId = session.metadata?.user_id || session.client_reference_id;
      const templateId = session.metadata?.template_id || ADVENTURE_TEMPLATE_ID;
      if (userId) {
        try {
          await unlockTemplateForUser({
            userId,
            templateId,
            sessionId: session.id,
            email: session.customer_details?.email || session.customer_email,
            amountTotal: session.amount_total,
            currency: session.currency,
          });
        } catch (err) {
          console.error("Stripe webhook unlock error:", err);
          return NextResponse.json({ error: "Failed to fulfill order" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
