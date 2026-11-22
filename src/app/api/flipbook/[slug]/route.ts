import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import {
  getFlipbookCover,
  sanitizeFlipbook,
  type StoredFlipbook,
} from "@/src/lib/flipbook";
import { loadFlipbook } from "@/src/lib/flipbook-server";
import { tokensMatch } from "@/src/lib/album-server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const loaded = await loadFlipbook(params.slug);
  if (!loaded) {
    return NextResponse.json({ error: "Flipbook not found." }, { status: 404 });
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

  const data = sanitizeFlipbook(body.data ?? body);
  const stored: StoredFlipbook = {
    ...data,
    editTokenHash: loaded.editTokenHash,
  };

  const title = data.texts["p3-title"] || data.texts["p1-title"] || "Love Flipbook";
  const coverUrl = getFlipbookCover(data);

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
    console.error("flipbook update failed:", error);
    return NextResponse.json({ error: "Could not update flipbook." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    slug: loaded.page.slug,
    publicUrl: `/flipbook/${loaded.page.slug}`,
  });
}
