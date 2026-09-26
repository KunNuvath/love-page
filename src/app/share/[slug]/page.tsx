import { getLovePageBySlug } from "@/src/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareView from "./ShareView";
import LittleBookShareView from "./LittleBookShareView";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getLovePageBySlug(params.slug);
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

export default async function SharePage({ params }: Props) {
  const page = await getLovePageBySlug(params.slug);
  if (!page) notFound();

  // The full config is stored as JSON in the message field
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
