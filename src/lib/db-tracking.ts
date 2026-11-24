import { getAdminClient } from "@/src/lib/supabase-admin";

export type TemplateType =
  | "polaroid-scrapbook"
  | "little-book"
  | "adventure-scrapbook"
  | "family-album"
  | "love-flipbook"
  | "love-story";

/** Extract all non-empty HTTP/data photo URLs from any of the 5 template configs. */
export function extractPhotoUrls(input: unknown): string[] {
  const urls = new Set<string>();
  const visit = (val: unknown) => {
    if (!val) return;
    if (typeof val === "string") {
      if (
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/photos/")
      ) {
        // Ignore audio/music URLs
        if (!/\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(val)) {
          urls.add(val);
        }
      }
      return;
    }
    if (Array.isArray(val)) {
      for (const item of val) visit(item);
      return;
    }
    if (typeof val === "object") {
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (k === "song" || k === "src" && typeof v === "string" && /\.(mp3|wav|m4a|ogg|aac)/i.test(v)) {
          continue;
        }
        visit(v);
      }
    }
  };
  visit(input);
  return Array.from(urls);
}

/**
 * Insert a row into `love_pages` with owner, template_type, and photo_urls tracking.
 * Gracefully falls back to the legacy columns if the tracking SQL migration hasn't been run yet.
 */
export async function insertTrackedLovePage(params: {
  slug: string;
  title: string;
  message: string;
  image_url: string | null;
  template_type: TemplateType;
  user_id?: string | null;
  user_email?: string | null;
  photo_urls?: string[];
}) {
  const admin = getAdminClient();
  const photos = Array.isArray(params.photo_urls) ? params.photo_urls : [];

  const fullRow = {
    slug: params.slug,
    title: params.title,
    message: params.message,
    image_url: params.image_url,
    template_type: params.template_type,
    user_id: params.user_id || null,
    user_email: params.user_email || null,
    photo_urls: photos,
    photo_count: photos.length,
  };

  const first = await admin
    .from("love_pages")
    .insert(fullRow)
    .select("*")
    .single();

  if (!first.error) {
    return first;
  }

  // Fallback if new columns haven't been added via supabase_tracking_schema.sql yet
  if (
    first.error.message?.includes("column") ||
    first.error.code === "42703" ||
    first.error.code === "PGRST204"
  ) {
    return admin
      .from("love_pages")
      .insert({
        slug: params.slug,
        title: params.title,
        message: params.message,
        image_url: params.image_url,
      })
      .select("*")
      .single();
  }

  return first;
}

/**
 * Update a row in `love_pages` along with updated photo_urls/photo_count.
 * Gracefully falls back if new columns aren't created yet.
 */
export async function updateTrackedLovePage(params: {
  slug: string;
  title: string;
  message: string;
  image_url: string | null;
  photo_urls?: string[];
  user_id?: string | null;
  user_email?: string | null;
}) {
  const admin = getAdminClient();
  const photos = Array.isArray(params.photo_urls) ? params.photo_urls : [];

  const fullPatch: Record<string, unknown> = {
    title: params.title,
    message: params.message,
    image_url: params.image_url,
    photo_urls: photos,
    photo_count: photos.length,
    updated_at: new Date().toISOString(),
  };
  if (params.user_id) fullPatch.user_id = params.user_id;
  if (params.user_email) fullPatch.user_email = params.user_email;

  const first = await admin
    .from("love_pages")
    .update(fullPatch)
    .eq("slug", params.slug);

  if (!first.error) return first;

  if (
    first.error.message?.includes("column") ||
    first.error.code === "42703" ||
    first.error.code === "PGRST204"
  ) {
    return admin
      .from("love_pages")
      .update({
        title: params.title,
        message: params.message,
        image_url: params.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", params.slug);
  }

  return first;
}

/** Record an uploaded photo/media file in `user_uploads` (non-blocking, best-effort). */
export async function recordUserUpload(params: {
  user_id?: string | null;
  user_email?: string | null;
  template_type?: string | null;
  slot_name?: string | null;
  file_url: string;
  storage_path?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
}) {
  try {
    const admin = getAdminClient();
    await admin.from("user_uploads").insert({
      user_id: params.user_id || null,
      user_email: params.user_email || null,
      template_type: params.template_type || "unknown",
      slot_name: params.slot_name || null,
      file_url: params.file_url,
      storage_path: params.storage_path || null,
      mime_type: params.mime_type || null,
      file_size: params.file_size ?? null,
    });
  } catch (err) {
    console.warn("recordUserUpload skipped:", err);
  }
}

/** Record a Paddle payment or VIP unlock in `payments` (non-blocking, best-effort). */
export async function recordPayment(params: {
  user_id?: string | null;
  user_email?: string | null;
  template_id: string;
  provider: "paddle" | "vip_code";
  transaction_id?: string | null;
  amount: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = getAdminClient();
    await admin.from("payments").upsert(
      {
        user_id: params.user_id || null,
        user_email: params.user_email || null,
        template_id: params.template_id,
        provider: params.provider,
        transaction_id:
          params.transaction_id ||
          `${params.provider}_${params.user_id || "anon"}_${Date.now()}`,
        amount: params.amount,
        currency: (params.currency || "USD").toUpperCase(),
        status: params.status || "completed",
        metadata: params.metadata || {},
      },
      { onConflict: "transaction_id" }
    );
  } catch (err) {
    console.warn("recordPayment skipped:", err);
  }
}
