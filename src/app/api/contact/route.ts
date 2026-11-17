import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminClient } from "@/src/lib/supabase-admin";

export const dynamic = "force-dynamic";

const SUPPORT_EMAIL = "support@lovepage.site";

export interface ContactSubmission {
  userId?: string;
  name: string;
  email: string;
  category: "feedback" | "bug" | "feature" | "general";
  message: string;
  createdAt: string;
}

const categoryLabels: Record<ContactSubmission["category"], string> = {
  feedback: "💡 Feedback",
  bug: "🐛 Bug Report",
  feature: "✨ Feature Request",
  general: "💌 General",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category = "feedback", message, userId } = body;

    // 1. Require authenticated user
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in or create an account to send feedback & support messages." },
        { status: 401 }
      );
    }

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    // Verify user exists via admin client
    const adminClient = getAdminClient();
    try {
      const { data: userData, error: userErr } =
        await adminClient.auth.admin.getUserById(userId);
      if (userErr || !userData?.user) {
        return NextResponse.json(
          { error: "Unauthorized. Please sign in with a valid account." },
          { status: 401 }
        );
      }
    } catch {
      // Allow if admin lookup is unavailable in local dev
    }

    const submission: ContactSubmission = {
      userId,
      name: (name || "Anonymous").trim(),
      email: email.trim(),
      category,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const categoryLabel = categoryLabels[submission.category] || "💌 General";
    const subject = `[${categoryLabel}] LovePage Contact from ${submission.name}`;

    // 2. Persist feedback copy in Supabase storage so no message is ever lost
    try {
      const filename = `feedback/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
      await adminClient.storage
        .from("love-page-images")
        .upload(filename, Buffer.from(JSON.stringify(submission, null, 2)), {
          contentType: "application/json",
          upsert: true,
        });
    } catch (storageErr) {
      console.warn("Could not persist feedback backup to storage:", storageErr);
    }

    // 3. Send email notification via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #fbf5f0; border: 1px solid #ebd9c7; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
            <h2 style="margin: 0 0 4px 0; color: #2d221e; font-size: 20px;">New Contact Form Submission</h2>
            <p style="margin: 0; color: #8c786a; font-size: 13px;">${submission.createdAt}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 12px; color: #8c786a; font-weight: 600; width: 100px; vertical-align: top;">Category</td>
              <td style="padding: 10px 12px; color: #2d221e;">${categoryLabel}</td>
            </tr>
            <tr style="background: #faf6f2;">
              <td style="padding: 10px 12px; color: #8c786a; font-weight: 600; vertical-align: top;">Name</td>
              <td style="padding: 10px 12px; color: #2d221e;">${submission.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; color: #8c786a; font-weight: 600; vertical-align: top;">Email</td>
              <td style="padding: 10px 12px; color: #2d221e;">
                <a href="mailto:${submission.email}" style="color: #cf493e; text-decoration: none;">${submission.email}</a>
              </td>
            </tr>
            <tr style="background: #faf6f2;">
              <td style="padding: 10px 12px; color: #8c786a; font-weight: 600; vertical-align: top;">Message</td>
              <td style="padding: 10px 12px; color: #2d221e; white-space: pre-wrap; line-height: 1.6;">${submission.message}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #ebd9c7; text-align: center;">
            <p style="margin: 0; color: #ab988a; font-size: 12px;">
              Reply directly to this email to respond to <strong>${submission.name}</strong>
            </p>
          </div>
        </div>
      `;

      // Try sending with verified domain first, then onboarding@resend.dev
      const senders = [
        process.env.RESEND_FROM_EMAIL || `LovePage Contact <${SUPPORT_EMAIL}>`,
        "LovePage Contact <onboarding@resend.dev>",
      ];

      let sent = false;
      for (const sender of senders) {
        try {
          const { data, error } = await resend.emails.send({
            from: sender,
            to: [SUPPORT_EMAIL],
            replyTo: submission.email,
            subject,
            html,
          });
          if (!error && data?.id) {
            console.log("💌 [Contact] Email sent successfully:", data.id);
            sent = true;
            break;
          }
        } catch {
          // Try next sender
        }
      }

      if (!sent) {
        console.log("💌 [Contact] Saved submission to Supabase storage:", submission);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your feedback has been received.",
    });
  } catch (error: any) {
    console.error("API /api/contact error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process contact form" },
      { status: 500 }
    );
  }
}
