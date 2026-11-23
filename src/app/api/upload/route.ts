import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { recordUserUpload } from "@/src/lib/db-tracking";

export const dynamic = "force-dynamic";

const BUCKET = "love-page-images";

function sanitizePathSegment(val: string | null | undefined, fallback: string): string {
  const clean = (val || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return clean || fallback;
}

export async function POST(request: Request) {
  const adminClient = getAdminClient();
  const user = await getUserFromRequest(request).catch(() => null);

  try {
    const reqContentType = request.headers.get("content-type") || "";

    if (reqContentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const templateType = sanitizePathSegment(
        (formData.get("templateType") as string | null) || null,
        "general"
      );
      const slotName = (formData.get("slotName") as string | null) || null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const baseFilename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const storagePath = user
        ? `users/${user.id}/${templateType}/${baseFilename}`
        : `guest/${templateType}/${baseFilename}`;

      let mimeType = file.type;
      if (!mimeType) {
        if (["mp3", "wav", "m4a", "ogg", "aac"].includes(ext)) {
          mimeType = ext === "mp3" ? "audio/mpeg" : `audio/${ext}`;
        } else {
          mimeType = "image/jpeg";
        }
      }

      try {
        const { error: uploadError } = await adminClient.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data } = adminClient.storage.from(BUCKET).getPublicUrl(storagePath);
          if (data?.publicUrl) {
            await recordUserUpload({
              user_id: user?.id || null,
              user_email: user?.email || null,
              template_type: templateType,
              slot_name: slotName,
              file_url: data.publicUrl,
              storage_path: storagePath,
              mime_type: mimeType,
              file_size: buffer.length,
            });
            return NextResponse.json({
              success: true,
              url: data.publicUrl,
              filename: storagePath,
            });
          }
        } else {
          console.warn("Supabase storage upload error:", uploadError);
        }
      } catch (err) {
        console.warn("Supabase storage upload failed, falling back to base64:", err);
      }

      // Base64 fallback if bucket is not provisioned
      const base64 = `data:${mimeType || "image/jpeg"};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: base64,
        filename: baseFilename,
        fallback: true,
      });
    }

    // JSON body with base64
    const body = await request.json();
    const {
      base64,
      filename = "photo.jpg",
      templateType: rawTemplateType,
      slotName = null,
    } = body;
    const templateType = sanitizePathSegment(rawTemplateType, "general");

    if (!base64) {
      return NextResponse.json({ error: "No base64 data provided" }, { status: 400 });
    }

    if (base64.startsWith("data:image")) {
      const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const ext = mimeType.split("/")[1] || "jpg";
        const baseFilename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
        const storagePath = user
          ? `users/${user.id}/${templateType}/${baseFilename}`
          : `guest/${templateType}/${baseFilename}`;

        try {
          const { error: uploadError } = await adminClient.storage
            .from(BUCKET)
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (!uploadError) {
            const { data } = adminClient.storage.from(BUCKET).getPublicUrl(storagePath);
            if (data?.publicUrl) {
              await recordUserUpload({
                user_id: user?.id || null,
                user_email: user?.email || null,
                template_type: templateType,
                slot_name: slotName,
                file_url: data.publicUrl,
                storage_path: storagePath,
                mime_type: mimeType,
                file_size: buffer.length,
              });
              return NextResponse.json({
                success: true,
                url: data.publicUrl,
                filename: storagePath,
              });
            }
          } else {
            console.warn("Storage upload error (base64 path):", uploadError);
          }
        } catch (err) {
          console.warn("Storage upload failed, keeping base64 payload:", err);
        }
      }
    }

    return NextResponse.json({ success: true, url: base64, filename });
  } catch (error: unknown) {
    console.error("API /api/upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload processing failed" },
      { status: 500 }
    );
  }
}
