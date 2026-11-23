import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { PREMIUM_TEMPLATES, getUnlockedTemplates } from "@/src/lib/premium";
import { recordPayment } from "@/src/lib/db-tracking";

export const dynamic = "force-dynamic";

const DEFAULT_VIP_CODES = ["DEMO", "LOVEPAGEVIP", "VATH2026", "ADVENTURE2026", "PREMIUM2026"];

function isValidCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;

  const configured = (process.env.PREMIUM_UNLOCK_CODES || "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  if (configured.includes(normalized) || DEFAULT_VIP_CODES.includes(normalized)) {
    return true;
  }
  return false;
}

export async function POST(request: Request) {
  let body: { templateId?: string; code?: string; method?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const templateId = body.templateId || "adventure-scrapbook";
  if (!PREMIUM_TEMPLATES[templateId]) {
    return NextResponse.json({ error: "Unknown template." }, { status: 400 });
  }

  // Validate pass code if method === "code"
  if (body.method === "code" && !isValidCode(body.code || "")) {
    return NextResponse.json({ error: "That unlock code isn't valid." }, { status: 403 });
  }

  const user = await getUserFromRequest(request);
  if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const unlocked = Array.from(new Set([...getUnlockedTemplates(user), templateId]));
      const admin = getAdminClient();
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, unlocked_templates: unlocked },
        user_metadata: { ...user.user_metadata, is_premium: true, unlocked_templates: unlocked },
      });
      await recordPayment({
        user_id: user.id,
        user_email: user.email || null,
        template_id: templateId,
        provider: "vip_code",
        transaction_id: `vip_${user.id}_${templateId}_${Date.now()}`,
        amount: 0,
        currency: "USD",
        status: "completed",
        metadata: { code: (body.code || "").trim().toUpperCase() },
      });
      return NextResponse.json({ success: true, unlocked });
    } catch (err) {
      console.warn("Could not persist unlock to Supabase admin metadata:", err);
    }
  }

  return NextResponse.json({ success: true, unlocked: [templateId] });
}
