import type { LovePage } from "@/src/lib/supabase";
import { getCachedLovePageBySlug } from "@/src/lib/page-cache";
import { sanitizeTenThings, type TenThingsData } from "@/src/lib/ten-things";

export interface LoadedTenThings {
  page: LovePage;
  data: TenThingsData;
  editTokenHash: string;
}

export async function loadTenThings(slug: string): Promise<LoadedTenThings | null> {
  if (!/^[a-z0-9]{4,16}$/.test(slug)) return null;
  const page = await getCachedLovePageBySlug(slug);
  if (!page) return null;

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(page.message);
  } catch {
    return null;
  }
  if (!parsed || parsed.type !== "ten-things") return null;

  return {
    page,
    data: sanitizeTenThings(parsed),
    editTokenHash: typeof parsed.editTokenHash === "string" ? parsed.editTokenHash : "",
  };
}
