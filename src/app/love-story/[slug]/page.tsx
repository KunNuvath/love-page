import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadLoveStory } from "@/src/lib/love-story-server";
import { tokensMatch } from "@/src/lib/album-server";
import LoveStoryBook from "@/src/components/love-story/LoveStoryBook";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams?: { edit?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadLoveStory(params.slug);
  if (!loaded) return { title: "Love Story Not Found" };
  return {
    title: `${loaded.page.title} — Love Story | LovePage`,
    description: "A 12-page vintage 3D scrapbook flipbook made for you.",
    openGraph: {
      title: `${loaded.page.title} — Love Story`,
      description: "A 12-page vintage 3D scrapbook flipbook made for you.",
      images: loaded.page.image_url ? [loaded.page.image_url] : [],
    },
  };
}

export default async function LoveStoryPublicPage({ params, searchParams }: Props) {
  const loaded = await loadLoveStory(params.slug);
  if (!loaded) notFound();

  const rawToken = typeof searchParams?.edit === "string" ? searchParams.edit : "";
  const isOwnerEdit =
    Boolean(rawToken) && tokensMatch(rawToken, loaded.editTokenHash);

  return (
    <LoveStoryBook
      readOnly={!isOwnerEdit}
      initialData={loaded.data}
      initialSlug={loaded.page.slug}
      initialEditToken={isOwnerEdit ? rawToken : undefined}
    />
  );
}
