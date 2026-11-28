import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LovePage } from "@/src/lib/supabase";
import { getCachedLovePageBySlug } from "@/src/lib/page-cache";
import { sanitizeAdventure } from "@/src/lib/adventure";
import { sanitizeAlbum } from "@/src/lib/album";
import { sanitizeFlipbook } from "@/src/lib/flipbook";
import { sanitizeLoveStory } from "@/src/lib/love-story";
import { sanitizeAnniversary } from "@/src/lib/anniversary";
import { sanitizeTenThings } from "@/src/lib/ten-things";
import AdventureScrapbook from "@/src/components/adventure/AdventureScrapbook";
import ScrapbookAlbum from "@/src/components/album/ScrapbookAlbum";
import LoveFlipbook from "@/src/components/flipbook/LoveFlipbook";
import LoveStoryBook from "@/src/components/love-story/LoveStoryBook";
import AnniversaryFlipbook from "@/src/components/anniversary/AnniversaryFlipbook";
import TenThingsBook from "@/src/components/ten-things/TenThingsBook";
import ShareView from "@/src/app/share/[slug]/ShareView";
import LittleBookShareView from "@/src/app/share/[slug]/LittleBookShareView";

// ─── WHY THIS LINE IS HERE ────────────────────────────────────────────────────
// On-demand ISR: render any runtime /p/<id> URL on first visit, then cache at
// Vercel's CDN edge for 120s so viral share links don't hammer Supabase.
export const revalidate = 120;
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  params: { id: string };
}

/** Cached server-side fetch so repeated views hit Next.js Data Cache instead of Supabase. */
async function getPageBySlug(slug: string): Promise<LovePage | null> {
  return getCachedLovePageBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.id);
  if (!page) return { title: "Love Page Not Found" };
  return {
    title: `${page.title} 💖`,
    description: "A heartfelt love page created just for you.",
    openGraph: {
      title: `${page.title} 💖`,
      description: "A heartfelt love page created just for you.",
      images: page.image_url ? [page.image_url] : [],
    },
  };
}

export default async function PublicPage({ params }: Props) {
  const page = await getPageBySlug(params.id);
  if (!page) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any> | null = null;
  try {
    config = JSON.parse(page.message);
  } catch {
    config = null;
  }

  if (config?.type === "ten-things") {
    return (
      <TenThingsBook
        readOnly
        initialData={sanitizeTenThings(config)}
        initialSlug={page.slug}
      />
    );
  }

  if (config?.type === "anniversary-velvet") {
    return (
      <AnniversaryFlipbook
        readOnly
        initialData={sanitizeAnniversary(config)}
        initialSlug={page.slug}
      />
    );
  }

  if (config?.type === "love-story") {
    return (
      <LoveStoryBook
        readOnly
        initialData={sanitizeLoveStory(config)}
        initialSlug={page.slug}
      />
    );
  }

  if (config?.type === "love-flipbook") {
    return (
      <LoveFlipbook
        readOnly
        initialData={sanitizeFlipbook(config)}
        initialSlug={page.slug}
      />
    );
  }

  if (config?.type === "family-album") {
    return (
      <ScrapbookAlbum
        readOnly
        initialData={sanitizeAlbum(config)}
        initialSlug={page.slug}
      />
    );
  }

  if (config?.type === "adventure-scrapbook") {
    return (
      <AdventureScrapbook
        readOnly
        initialData={sanitizeAdventure(config)}
        initialId={page.slug}
      />
    );
  }

  if (config?.type === "little-book") {
    return <LittleBookShareView page={page} config={config} />;
  }

  return <ShareView page={page} config={config} />;
}
