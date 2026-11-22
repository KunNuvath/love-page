import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadFlipbook } from "@/src/lib/flipbook-server";
import { tokensMatch } from "@/src/lib/album-server";
import LoveFlipbook from "@/src/components/flipbook/LoveFlipbook";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams?: { edit?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadFlipbook(params.slug);
  if (!loaded) return { title: "Love Flipbook Not Found" };
  return {
    title: `${loaded.page.title} — Love Flipbook | LovePage`,
    description: "A 16-page leather-bound vintage love flipbook made for you.",
    openGraph: {
      title: `${loaded.page.title} — Love Flipbook`,
      description: "A 16-page leather-bound vintage love flipbook made for you.",
      images: loaded.page.image_url ? [loaded.page.image_url] : [],
    },
  };
}

export default async function FlipbookPublicPage({ params, searchParams }: Props) {
  const loaded = await loadFlipbook(params.slug);
  if (!loaded) notFound();

  const rawToken = typeof searchParams?.edit === "string" ? searchParams.edit : "";
  const isOwnerEdit =
    Boolean(rawToken) && tokensMatch(rawToken, loaded.editTokenHash);

  return (
    <LoveFlipbook
      readOnly={!isOwnerEdit}
      initialData={loaded.data}
      initialSlug={loaded.page.slug}
      initialEditToken={isOwnerEdit ? rawToken : undefined}
    />
  );
}
