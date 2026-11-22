import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import {
  getFlipbookCover,
  sanitizeFlipbook,
  type StoredFlipbook,
} from "@/src/lib/flipbook";
import {
  generateEditToken,
  generateShortSlug,
  hashToken,
} from "@/src/lib/album-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = sanitizeFlipbook(raw);
  const editToken = generateEditToken();
  const stored: StoredFlipbook = {
    ...data,
    editTokenHash: hashToken(editToken),
  };

  const slug = generateShortSlug(8);
  const title = data.texts["p3-title"] || data.texts["p1-title"] || "Love Flipbook";
  const coverUrl = getFlipbookCover(data);

  const admin = getAdminClient();
  const { data: page, error } = await admin
    .from("love_pages")
    .insert({
      slug,
      title,
      message: JSON.stringify(stored),
      image_url: coverUrl,
    })
    .select("slug")
    .single();

  if (error || !page) {
    console.error("flipbook insert failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save flipbook." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    slug: page.slug,
    editToken,
    publicUrl: `/flipbook/${page.slug}`,
    editUrl: `/flipbook/${page.slug}?edit=${editToken}`,
  });
}
