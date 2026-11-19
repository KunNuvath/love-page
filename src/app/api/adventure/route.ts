import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { SLOT_ORDER, sanitizeAdventure } from "@/src/lib/adventure";

export const dynamic = "force-dynamic";

function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Save an "Our Little Adventure" scrapbook to love_pages and return its public /adventure/[id] URL. */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const data = sanitizeAdventure(raw);
  const coverPhoto = SLOT_ORDER.map((s) => data.photos[s]).find(Boolean) || null;

  const admin = getAdminClient();
  const slug = generateSlug();
  const { data: page, error } = await admin
    .from("love_pages")
    .insert({
      slug,
      title: data.title,
      message: JSON.stringify(data),
      image_url: coverPhoto,
    })
    .select()
    .single();

  if (error || !page) {
    console.error("adventure save failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save your scrapbook." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    page,
    id: page.slug,
    slug: page.slug,
    shareUrl: `/adventure/${page.slug}`,
  });
}
