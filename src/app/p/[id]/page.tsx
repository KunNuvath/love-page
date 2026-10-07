import { getLovePageBySlug } from "@/src/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareView from "@/src/app/share/[slug]/ShareView";
import LittleBookShareView from "@/src/app/share/[slug]/LittleBookShareView";

// ─── WHY THIS LINE IS HERE ────────────────────────────────────────────────────
// Every /p/<id> URL is created at runtime by a real user — there are zero pages
// at build time.  Without this, Vercel pre-renders nothing and returns 404 for
// every link.  "force-dynamic" means: render fresh on every request.
export const dynamic = "force-dynamic";
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getLovePageBySlug(params.id);
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
  const page = await getLovePageBySlug(params.id);
  if (!page) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any> | null = null;
  try {
    config = JSON.parse(page.message);
  } catch {
    config = null;
  }

  if (config?.type === "little-book") {
    return <LittleBookShareView page={page} config={config} />;
  }

  return <ShareView page={page} config={config} />;
}
