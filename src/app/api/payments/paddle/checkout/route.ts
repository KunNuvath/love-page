import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { PREMIUM_TEMPLATES } from "@/src/lib/premium";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";
  const priceId =
    (templateId === "love-flipbook" && process.env.NEXT_PUBLIC_PADDLE_FLIPBOOK_PRICE_ID) ||
    (templateId === "love-story" && process.env.NEXT_PUBLIC_PADDLE_LOVE_STORY_PRICE_ID) ||
    (templateId === "family-album" && process.env.NEXT_PUBLIC_PADDLE_ALBUM_PRICE_ID) ||
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ||
    "";
  const environment =
    (process.env.NEXT_PUBLIC_PADDLE_ENV ||
      (clientToken.startsWith("test_") ? "sandbox" : "production")) === "sandbox"
      ? "sandbox"
      : "production";

  if (!clientToken || !priceId) {
    return NextResponse.json(
      {
        error:
          "Paddle is not configured yet. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_PRICE_ID to your environment variables.",
      },
      { status: 503 }
    );
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const successUrl = `${origin.replace(/\/$/, "")}${template.href}?paid=1`;

  return NextResponse.json({
    clientToken,
    environment,
    priceId,
    customerEmail: user.email || undefined,
    customData: {
      user_id: user.id,
      template_id: templateId,
    },
    successUrl,
  });
}
