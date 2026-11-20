import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { getAlbumCover, sanitizeAlbum, type StoredAlbum } from "@/src/lib/album";
import { loadAlbum, tokensMatch } from "@/src/lib/album-server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

  const admin = getAdminClient();
  const { error } = await admin
    .from("love_pages")
    .update({
      title,
      message: JSON.stringify(stored),
      image_url: coverUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", loaded.page.slug);

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
