import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import type { LovePage } from "@/src/lib/supabase";
import { getAdminClient } from "@/src/lib/supabase-admin";

export function lovePageCacheTag(slug: string): string {
  return `love-page:${slug}`;
}

/**
 * Fetch a love_pages row by slug through Next.js Data Cache (120s TTL) so viral
 * share links don't hit Supabase on every single view.
 */
export async function getCachedLovePageBySlug(slug: string): Promise<LovePage | null> {
  const cached = unstable_cache(
    async (): Promise<LovePage | null> => {
      const admin = getAdminClient();
      const { data, error } = await admin
        .from("love_pages")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error || !data) return null;
      return data as LovePage;
    },
    ["love-page-by-slug", slug],
    {
      revalidate: 120,
      tags: [lovePageCacheTag(slug)],
    }
  );

  return cached();
}

/** Immediately bust the cached love page and its public route after an owner edit. */
export function invalidateLovePageCache(slug: string, extraPaths: string[] = []): void {
  try {
    revalidateTag(lovePageCacheTag(slug));
    revalidatePath(`/p/${slug}`);
    for (const p of extraPaths) {
      revalidatePath(p);
    }
  } catch (err) {
    console.warn("invalidateLovePageCache skipped:", err);
  }
}
