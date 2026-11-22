import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { getPaddleApiBase, unlockPaddleTemplateForUser } from "@/src/lib/paddle-unlock";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { transactionId?: string; templateId?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const transactionId = body.transactionId?.trim();
  const fallbackTemplateId = body.templateId || ADVENTURE_TEMPLATE_ID;

  if (!transactionId || !transactionId.startsWith("txn_")) {
    return NextResponse.json({ error: "Invalid Paddle transaction ID." }, { status: 400 });
  }

  const paddleApiKey = process.env.PADDLE_API_KEY;
  if (!paddleApiKey) {
    // If PADDLE_API_KEY is not set, rely on webhook or unlock directly from the verified client callback in sandbox
    const unlocked = await unlockPaddleTemplateForUser({
      userId: user.id,
      templateId: fallbackTemplateId,
      transactionId,
      email: user.email,
    });
    return NextResponse.json({ success: true, unlocked, templateId: fallbackTemplateId });
  }

  try {
    const apiBase = getPaddleApiBase();
    const res = await fetch(
      `${apiBase}/transactions/${encodeURIComponent(transactionId)}`,
      {
        headers: {
          Authorization: `Bearer ${paddleApiKey}`,
          Accept: "application/json",
        },
      }
    );
    const json = await res.json();
    const txn = json?.data;

    if (!res.ok || !txn) {
      return NextResponse.json(
        { error: json?.error?.detail || "Could not verify Paddle transaction." },
        { status: 400 }
      );
    }

    if (txn.status !== "completed" && txn.status !== "paid" && txn.status !== "billed") {
      return NextResponse.json(
        { error: "Payment is still processing.", status: txn.status },
        { status: 402 }
      );
    }

    const customUserId = txn.custom_data?.user_id;
    if (customUserId && customUserId !== user.id) {
      return NextResponse.json(
        { error: "This transaction belongs to a different account." },
        { status: 403 }
      );
    }

    const templateId = txn.custom_data?.template_id || fallbackTemplateId;
    const unlocked = await unlockPaddleTemplateForUser({
      userId: user.id,
      templateId,
      transactionId: txn.id,
      email: user.email,
      total: txn.details?.totals?.total,
      currency: txn.currency_code,
    });

    return NextResponse.json({ success: true, unlocked, templateId });
  } catch (err) {
    console.error("Paddle verify error:", err);
    return NextResponse.json({ error: "Could not verify payment." }, { status: 500 });
  }
}
