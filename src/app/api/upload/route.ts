import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

const BUCKET = "love-page-images";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filename, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
          if (data?.publicUrl) {
            return NextResponse.json({ success: true, url: data.publicUrl, filename });
          }
        }
      } catch (err) {
        console.warn("Supabase storage upload failed, falling back to base64:", err);
      }

      // Base64 fallback if bucket is not provisioned
      const base64 = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ success: true, url: base64, filename, fallback: true });
    }

    // JSON body with base64
    const body = await request.json();
    const { base64, filename = "photo.jpg" } = body;

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
        const cloudFilename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(cloudFilename, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (!uploadError) {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(cloudFilename);
            if (data?.publicUrl) {
              return NextResponse.json({ success: true, url: data.publicUrl, filename: cloudFilename });
            }
          }
        } catch (err) {
          console.warn("Storage upload failed, keeping base64 payload:", err);
        }
      }
    }

    // Return the base64 URL directly
    return NextResponse.json({ success: true, url: base64, filename });
  } catch (error: any) {
    console.error("API /api/upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload processing failed" },
      { status: 500 }
    );
  }
}
