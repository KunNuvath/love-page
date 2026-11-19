import { getAdminClient } from "@/src/lib/supabase-admin";
import { getUnlockedTemplates } from "@/src/lib/premium";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";

export async function unlockTemplateForUser(params: {
  userId: string;
  templateId?: string;
  sessionId?: string;
  email?: string | null;
  amountTotal?: number | null;
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
    const orderKey = params.sessionId || `order_${Date.now()}`;
    const receipt = JSON.stringify(
      {
        provider: "stripe",
        sessionId: params.sessionId || null,
        userId: params.userId,
        email: params.email || userRes.user.email || null,
        templateId,
        amountTotal: params.amountTotal ?? 499,
        currency: params.currency || "usd",
        paidAt: new Date().toISOString(),
      },
      null,
      2
    );
    await admin.storage
      .from("love-media")
      .upload(`orders/stripe_${orderKey}.json`, new Blob([receipt], { type: "application/json" }), {
        upsert: true,
      });
  } catch {}

  return unlocked;
}
