import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadTenThings } from "@/src/lib/ten-things-server";
import { tokensMatch } from "@/src/lib/album-server";
import TenThingsBook from "@/src/components/ten-things/TenThingsBook";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
  searchParams?: { edit?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadTenThings(params.slug);
  if (!loaded) return { title: "10 Things Flipbook Not Found" };
  return {
    title: `${loaded.page.title} — 10 Things I Love About You | LovePage`,
    description: "A handmade 10 Things I Love About You 3D flipbook made just for you.",
    openGraph: {
      title: `${loaded.page.title} — 10 Things I Love About You`,
      description: "A handmade 10 Things I Love About You 3D flipbook made just for you.",
      images: loaded.page.image_url ? [loaded.page.image_url] : [],
    },
  };
}

export default async function TenThingsPublicPage({ params, searchParams }: Props) {
  const loaded = await loadTenThings(params.slug);
  if (!loaded) notFound();

  const rawToken = typeof searchParams?.edit === "string" ? searchParams.edit : "";
  const isOwnerEdit =
    Boolean(rawToken) && tokensMatch(rawToken, loaded.editTokenHash);

  return (
    <TenThingsBook
      readOnly={!isOwnerEdit}
      initialData={loaded.data}
      initialSlug={loaded.page.slug}
      initialEditToken={isOwnerEdit ? rawToken : undefined}
    />
  );
}
