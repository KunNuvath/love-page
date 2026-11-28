import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadAnniversary } from "@/src/lib/anniversary-server";
import { tokensMatch } from "@/src/lib/album-server";
import AnniversaryFlipbook from "@/src/components/anniversary/AnniversaryFlipbook";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams?: { edit?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadAnniversary(params.slug);
  if (!loaded) return { title: "Anniversary Flipbook Not Found" };
  return {
    title: `${loaded.page.title} — Velvet Flipbook | LovePage`,
    description: "A wine-velvet 3D anniversary scrapbook flipbook made for you.",
    openGraph: {
      title: `${loaded.page.title} — Velvet Flipbook`,
      description: "A wine-velvet 3D anniversary scrapbook flipbook made for you.",
      images: loaded.page.image_url ? [loaded.page.image_url] : [],
    },
  };
}

export default async function AnniversaryPublicPage({ params, searchParams }: Props) {
  const loaded = await loadAnniversary(params.slug);
  if (!loaded) notFound();

  const rawToken = typeof searchParams?.edit === "string" ? searchParams.edit : "";
  const isOwnerEdit =
    Boolean(rawToken) && tokensMatch(rawToken, loaded.editTokenHash);

  return (
    <AnniversaryFlipbook
      readOnly={!isOwnerEdit}
      initialData={loaded.data}
      initialSlug={loaded.page.slug}
      initialEditToken={isOwnerEdit ? rawToken : undefined}
    />
  );
}
