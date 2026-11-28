import { NextResponse } from "next/server";
import {
  getTenThingsCover,
  sanitizeTenThings,
  type StoredTenThings,
} from "@/src/lib/ten-things";
import { loadTenThings } from "@/src/lib/ten-things-server";
import { tokensMatch } from "@/src/lib/album-server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { extractPhotoUrls, updateTrackedLovePage } from "@/src/lib/db-tracking";
import { invalidateLovePageCache } from "@/src/lib/page-cache";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const user = await getUserFromRequest(request).catch(() => null);
  const loaded = await loadTenThings(params.slug);
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

  const data = sanitizeTenThings(body.data ?? body);
  const stored: StoredTenThings = {
    ...data,
    editTokenHash: loaded.editTokenHash,
  };

  const title = "10 Things I Love About You";
  const coverUrl = getTenThingsCover(data);
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
    console.error("ten-things update failed:", error);
    return NextResponse.json(
      { error: "Could not update flipbook." },
      { status: 500 }
    );
  }

  invalidateLovePageCache(loaded.page.slug, [`/ten-things/${loaded.page.slug}`]);

  return NextResponse.json({
    success: true,
    slug: loaded.page.slug,
    publicUrl: `/ten-things/${loaded.page.slug}`,
  });
}
