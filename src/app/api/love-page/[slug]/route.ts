import { NextResponse } from "next/server";
import { getLovePageBySlug, updateLovePage, supabase } from "@/src/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const page = await getLovePageBySlug(slug);
    if (!page) {
      return NextResponse.json({ error: "Love page not found" }, { status: 404 });
    }

    let parsedConfig: Record<string, any> | null = null;
    try {
      parsedConfig = JSON.parse(page.message);
    } catch {
      parsedConfig = null;
    }

    return NextResponse.json({
      success: true,
      page,
      config: parsedConfig,
    });
  } catch (error: any) {
    console.error("API GET /api/love-page/[slug] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch love page" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();

    const existingPage = await getLovePageBySlug(slug);
    if (!existingPage) {
      return NextResponse.json({ error: "Love page not found" }, { status: 404 });
    }

    let updatedMessage = body.message;
    if (body.config) {
      let existingConfig = {};
      try {
        existingConfig = JSON.parse(existingPage.message);
      } catch {}
      const mergedConfig = {
        ...existingConfig,
        ...body.config,
      };
      updatedMessage = JSON.stringify(mergedConfig);
    }

    const updated = await updateLovePage(existingPage.id, {
      title: body.title ?? existingPage.title,
      message: updatedMessage ?? existingPage.message,
      image_url: body.image_url !== undefined ? body.image_url : existingPage.image_url,
    });

    return NextResponse.json({
      success: true,
      page: updated,
    });
  } catch (error: any) {
    console.error("API PATCH /api/love-page/[slug] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update love page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { error } = await supabase.from("love_pages").delete().eq("slug", slug);
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete" }, { status: 500 });
  }
}
