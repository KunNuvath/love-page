import crypto from "crypto";
import { NextResponse } from "next/server";
import { unlockPaddleTemplateForUser } from "@/src/lib/paddle-unlock";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";

export const dynamic = "force-dynamic";

function verifyPaddleSignature(rawBody: string, header: string, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(";").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`, "utf8")
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const sigBuf = Buffer.from(h1, "utf8");
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET || "";
  if (!secret) {
    console.error("PADDLE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get("paddle-signature") || "";

  if (!verifyPaddleSignature(rawBody, sigHeader, secret)) {
    return NextResponse.json({ error: "Invalid Paddle signature" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload?.event_type;
  const data = payload?.data || {};
  const custom = data?.custom_data || {};

  if (
    eventType === "transaction.completed" ||
    eventType === "transaction.paid" ||
    eventType === "subscription.activated"
  ) {
    const userId = typeof custom.user_id === "string" ? custom.user_id : null;
    const templateId =
      typeof custom.template_id === "string" && custom.template_id
        ? custom.template_id
        : ADVENTURE_TEMPLATE_ID;

    if (userId) {
      try {
        await unlockPaddleTemplateForUser({
          userId,
          templateId,
          transactionId: data.id,
          total: data.details?.totals?.total,
          currency: data.currency_code,
        });
      } catch (err) {
        console.error("Paddle webhook unlock error:", err);
        return NextResponse.json({ error: "Failed to fulfill order" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
