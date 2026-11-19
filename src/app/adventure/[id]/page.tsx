import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LovePage } from "@/src/lib/supabase";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { sanitizeAdventure } from "@/src/lib/adventure";
import AdventureScrapbook from "@/src/components/adventure/AdventureScrapbook";

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
    title: `${page.title} — Our Little Adventure`,
    description: "A handmade travel-journal scrapbook created on LovePage.",
    openGraph: {
      title: `${page.title} — Our Little Adventure`,
      description: "A handmade travel-journal scrapbook created on LovePage.",
      images: page.image_url ? [page.image_url] : [],
    },
  };
}

export default async function AdventureViewerPage({ params }: Props) {
  const page = await getPageBySlug(params.id);
  if (!page) notFound();

  let raw: unknown = null;
  try {
    raw = JSON.parse(page.message);
  } catch {
    raw = null;
  }

  const data = sanitizeAdventure(raw);
  return <AdventureScrapbook readOnly initialData={data} initialId={page.slug} />;
}
