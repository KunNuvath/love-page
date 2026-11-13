import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const adminClient = getAdminClient();
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { data: page, error } = await adminClient
      .from("love_pages")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !page) {
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
  const adminClient = getAdminClient();
  try {
    const { slug } = params;
    const body = await request.json();

    // Fetch existing page
    const { data: existingPage, error: fetchError } = await adminClient
      .from("love_pages")
      .select("*")
      .eq("slug", slug)
      .single();

    if (fetchError || !existingPage) {
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

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await adminClient
      .from("love_pages")
      .update({
        title: body.title ?? existingPage.title,
        message: updatedMessage ?? existingPage.message,
        image_url: body.image_url !== undefined ? body.image_url : existingPage.image_url,
        updated_at: now,
      })
      .eq("id", existingPage.id)
      .select()
      .single();

    if (updateError) {
      console.error("PATCH update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update love page" },
        { status: 500 }
      );
    }

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
  const adminClient = getAdminClient();
  try {
    const { slug } = params;
    const { error } = await adminClient.from("love_pages").delete().eq("slug", slug);
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete" }, { status: 500 });
  }
}
