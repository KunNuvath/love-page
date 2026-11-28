import type { LovePage } from "@/src/lib/supabase";
import { getCachedLovePageBySlug } from "@/src/lib/page-cache";
import { sanitizeAnniversary, type AnniversaryData } from "@/src/lib/anniversary";

export interface LoadedAnniversary {
  page: LovePage;
  data: AnniversaryData;
  editTokenHash: string;
}

export async function loadAnniversary(slug: string): Promise<LoadedAnniversary | null> {
  if (!/^[a-z0-9]{4,16}$/.test(slug)) return null;
  const page = await getCachedLovePageBySlug(slug);
  if (!page) return null;

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(page.message);
  } catch {
    return null;
  }
  if (!parsed || parsed.type !== "anniversary-velvet") return null;

  return {
    page,
    data: sanitizeAnniversary(parsed),
    editTokenHash: typeof parsed.editTokenHash === "string" ? parsed.editTokenHash : "",
  };
}
