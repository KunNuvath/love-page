import { NextResponse } from "next/server";
import { getAlbumCover, sanitizeAlbum, type StoredAlbum } from "@/src/lib/album";
import { generateEditToken, generateShortSlug, hashToken } from "@/src/lib/album-server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { extractPhotoUrls, insertTrackedLovePage } from "@/src/lib/db-tracking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request).catch(() => null);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = sanitizeAlbum(raw);
  const editToken = generateEditToken();
  const stored: StoredAlbum = {
    ...data,
    editTokenHash: hashToken(editToken),
  };

  const slug = generateShortSlug(8);
  const title = data.texts["p1-title"] || "Our Family";
  const coverUrl = getAlbumCover(data);
  const photoUrls = extractPhotoUrls(data.photos);

  const { data: page, error } = await insertTrackedLovePage({
    slug,
    title,
    message: JSON.stringify(stored),
    image_url: coverUrl,
    template_type: "family-album",
    user_id: user?.id || null,
    user_email: user?.email || null,
    photo_urls: photoUrls,
  });

  if (error || !page) {
    console.error("album insert failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save album." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    slug: page.slug,
    editToken,
    publicUrl: `/album/${page.slug}`,
    editUrl: `/album/${page.slug}?edit=${editToken}`,
  });
}
