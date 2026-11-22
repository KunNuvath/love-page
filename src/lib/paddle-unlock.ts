import { getAdminClient } from "@/src/lib/supabase-admin";
import { getUnlockedTemplates } from "@/src/lib/premium";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";

export function getPaddleApiBase(): string {
  const env = (
    process.env.NEXT_PUBLIC_PADDLE_ENV ||
    process.env.PADDLE_ENV ||
    (process.env.PADDLE_API_KEY?.includes("sdbx") ? "sandbox" : "production")
  ).toLowerCase();
  return env === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
}

export async function unlockPaddleTemplateForUser(params: {
  userId: string;
  templateId?: string;
  transactionId?: string;
  email?: string | null;
  total?: string | number | null;
  currency?: string | null;
}) {
  const templateId = params.templateId || ADVENTURE_TEMPLATE_ID;
  const admin = getAdminClient();

  const { data: userRes, error: fetchErr } = await admin.auth.admin.getUserById(params.userId);
  if (fetchErr || !userRes?.user) {
    throw fetchErr || new Error("User not found");
  }

  const existing = getUnlockedTemplates(userRes.user);
  const unlocked = Array.from(new Set([...existing, templateId]));

  const { error: updateErr } = await admin.auth.admin.updateUserById(params.userId, {
    app_metadata: {
      ...userRes.user.app_metadata,
      unlocked_templates: unlocked,
    },
    user_metadata: {
      ...userRes.user.user_metadata,
      is_premium: true,
      unlocked_templates: unlocked,
    },
  });

  if (updateErr) throw updateErr;

  // Best-effort receipt backup in Supabase Storage
  try {
    const orderKey = params.transactionId || `order_${Date.now()}`;
    const receipt = JSON.stringify(
      {
        provider: "paddle",
        transactionId: params.transactionId || null,
        userId: params.userId,
        email: params.email || userRes.user.email || null,
        templateId,
        total: params.total ?? "4.99",
        currency: params.currency || "USD",
        paidAt: new Date().toISOString(),
      },
      null,
      2
    );
    await admin.storage
      .from("love-media")
      .upload(`orders/paddle_${orderKey}.json`, new Blob([receipt], { type: "application/json" }), {
        upsert: true,
      });
  } catch {}

  return unlocked;
}
