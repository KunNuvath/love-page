import { NextResponse } from "next/server";
import { getAlbumCover, sanitizeAlbum, type StoredAlbum } from "@/src/lib/album";
import { loadAlbum, tokensMatch } from "@/src/lib/album-server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { extractPhotoUrls, updateTrackedLovePage } from "@/src/lib/db-tracking";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const user = await getUserFromRequest(request).catch(() => null);
  const loaded = await loadAlbum(params.slug);
  if (!loaded) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }

  let body: { editToken?: string; data?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const token = typeof body.editToken === "string" ? body.editToken : "";
  if (!tokensMatch(token, loaded.editTokenHash)) {
    return NextResponse.json(
      { error: "Invalid or missing owner edit token." },
      { status: 403 }
    );
  }

  const data = sanitizeAlbum(body.data ?? body);
  const stored: StoredAlbum = {
    ...data,
    editTokenHash: loaded.editTokenHash,
  };

  const title = data.texts["p1-title"] || "Our Family";
  const coverUrl = getAlbumCover(data);
  const photoUrls = extractPhotoUrls(data.photos);

  const { error } = await updateTrackedLovePage({
    slug: loaded.page.slug,
    title,
    message: JSON.stringify(stored),
    image_url: coverUrl,
    photo_urls: photoUrls,
    user_id: user?.id || null,
    user_email: user?.email || null,
  });

  if (error) {
    console.error("album update failed:", error);
    return NextResponse.json({ error: "Could not update album." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    slug: loaded.page.slug,
    publicUrl: `/album/${loaded.page.slug}`,
  });
}
