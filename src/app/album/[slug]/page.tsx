import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAlbumCover } from "@/src/lib/album";
import { loadAlbum, tokensMatch } from "@/src/lib/album-server";
import ScrapbookAlbum from "@/src/components/album/ScrapbookAlbum";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams?: { edit?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadAlbum(params.slug);
  if (!loaded) {
    return { title: "Scrapbook Album Not Found" };
  }

  const title = loaded.data.texts["p1-title"] || loaded.page.title || "Our Family Album";
  const subtitle =
    loaded.data.texts["p1-sub"] ||
    "A 9-page handmade photo album created on LovePage.";
  const cover = getAlbumCover(loaded.data) || loaded.page.image_url;

  return {
    title: `${title} — Scrapbook Album`,
    description: subtitle,
    openGraph: {
      title: `${title} — Scrapbook Album`,
      description: subtitle,
      type: "article",
      images: cover ? [{ url: cover }] : [],
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: `${title} — Scrapbook Album`,
      description: subtitle,
      images: cover ? [cover] : [],
    },
  };
}

export default async function AlbumPublicOrEditPage({
  params,
  searchParams,
}: Props) {
  const loaded = await loadAlbum(params.slug);
  if (!loaded) notFound();

  const candidateToken =
    typeof searchParams?.edit === "string" ? searchParams.edit : "";
  const isOwnerEdit =
    Boolean(candidateToken) && tokensMatch(candidateToken, loaded.editTokenHash);

  return (
    <ScrapbookAlbum
      readOnly={!isOwnerEdit}
      initialData={loaded.data}
      initialSlug={loaded.page.slug}
      initialEditToken={isOwnerEdit ? candidateToken : undefined}
    />
  );
}
