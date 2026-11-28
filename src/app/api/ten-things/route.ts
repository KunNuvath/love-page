import { NextResponse } from "next/server";
import {
  getTenThingsCover,
  sanitizeTenThings,
  type StoredTenThings,
} from "@/src/lib/ten-things";
import {
  generateEditToken,
  generateShortSlug,
  hashToken,
} from "@/src/lib/album-server";
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

  const data = sanitizeTenThings(raw);
  const editToken = generateEditToken();
  const stored: StoredTenThings = {
    ...data,
    editTokenHash: hashToken(editToken),
  };

  const slug = generateShortSlug(8);
  const title = "10 Things I Love About You";
  const coverUrl = getTenThingsCover(data);
  const photoUrls = extractPhotoUrls(data.photos);

  const { data: page, error } = await insertTrackedLovePage({
    slug,
    title,
    message: JSON.stringify(stored),
    image_url: coverUrl,
    template_type: "ten-things",
    user_id: user?.id || null,
    user_email: user?.email || null,
    photo_urls: photoUrls,
  });

  if (error || !page) {
    console.error("ten-things insert failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save flipbook." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    slug: page.slug,
    editToken,
    publicUrl: `/ten-things/${page.slug}`,
    editUrl: `/ten-things/${page.slug}?edit=${editToken}`,
  });
}
