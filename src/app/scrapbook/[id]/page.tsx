import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LovePage } from "@/src/lib/supabase";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { sanitizeAdventure } from "@/src/lib/adventure";
import AdventureScrapbook from "@/src/components/adventure/AdventureScrapbook";
import ShareView from "@/src/app/share/[slug]/ShareView";
import LittleBookShareView from "@/src/app/share/[slug]/LittleBookShareView";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getPageBySlug(slug: string): Promise<LovePage | null> {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("love_pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as LovePage;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.id);
  if (!page) return { title: "Scrapbook Not Found" };
  return {
    title: `${page.title} 💖`,
    description: "A handmade scrapbook keepsake created just for you.",
    openGraph: {
      title: `${page.title} 💖`,
      description: "A handmade scrapbook keepsake created just for you.",
      images: page.image_url ? [page.image_url] : [],
    },
  };
}

export default async function ScrapbookViewerPage({ params }: Props) {
  const page = await getPageBySlug(params.id);
  if (!page) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any> | null = null;
  try {
    config = JSON.parse(page.message);
  } catch {
    config = null;
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
