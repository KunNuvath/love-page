import { NextResponse } from "next/server";
import { createLovePage, supabase } from "@/src/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, config, image_url, type = "polaroid-scrapbook" } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Pack the configuration into message payload if provided as structured object
    let messagePayload = message;
    if (config || type) {
      const fullConfig = {
        type,
        ...(typeof config === "object" ? config : {}),
        message: message ?? (config?.message || ""),
        title,
      };
      messagePayload = JSON.stringify(fullConfig);
    }

    const page = await createLovePage({
      title,
      message: messagePayload,
      image_url: image_url || null,
    });

    return NextResponse.json({
      success: true,
      page,
      slug: page.slug,
      shareUrl: `/share/${page.slug}`,
    });
  } catch (error: any) {
    console.error("API /api/love-page error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create love page" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const { data, error } = await supabase
      .from("love_pages")
      .select("id, slug, title, image_url, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ pages: [] });
    }

    return NextResponse.json({ pages: data || [] });
  } catch (error: any) {
    return NextResponse.json({ pages: [] });
  }
}
