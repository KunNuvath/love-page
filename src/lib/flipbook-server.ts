import type { LovePage } from "@/src/lib/supabase";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { sanitizeFlipbook, type FlipbookData } from "@/src/lib/flipbook";

export interface LoadedFlipbook {
  page: LovePage;
  data: FlipbookData;
  editTokenHash: string;
}

export async function loadFlipbook(slug: string): Promise<LoadedFlipbook | null> {
  if (!/^[a-z0-9]{4,16}$/.test(slug)) return null;
  const admin = getAdminClient();
  const { data: page, error } = await admin
    .from("love_pages")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !page) return null;

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse((page as LovePage).message);
  } catch {
    return null;
  }
  if (!parsed || parsed.type !== "love-flipbook") return null;

  return {
    page: page as LovePage,
    data: sanitizeFlipbook(parsed),
    editTokenHash: typeof parsed.editTokenHash === "string" ? parsed.editTokenHash : "",
  };
}
