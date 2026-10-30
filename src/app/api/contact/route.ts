import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface ContactSubmission {
  name: string;
  email: string;
  category: "feedback" | "bug" | "feature" | "general";
  message: string;
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category = "feedback", message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    const submission: ContactSubmission = {
      name: (name || "Anonymous").trim(),
      email: email.trim(),
      category,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("💌 [Contact Submission]", submission);

    return NextResponse.json({
      success: true,
      message: "Thank you! Your feedback has been received.",
      submission,
    });
  } catch (error: any) {
    console.error("API /api/contact error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process contact form" },
      { status: 500 }
    );
  }
}
