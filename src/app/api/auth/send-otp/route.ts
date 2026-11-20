import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { supabase } from "@/src/lib/supabase";
import { validateEmailFormat } from "@/src/lib/email-validation";
import {
  generateSixDigitCode,
  createOtpVerificationToken,
  verifyDomainHasMxRecords,
} from "@/src/lib/otp-token";

export const dynamic = "force-dynamic";

function buildVerificationEmailHtml(name: string, code: string, email: string): string {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px 20px; color: #2d221e;">
      <div style="background: #faf6ee; border: 1px solid #e4d6c4; border-radius: 20px; padding: 32px 24px; text-align: center; box-shadow: 0 8px 24px rgba(45, 34, 30, 0.06);">
        <div style="display: inline-block; background: #cf493e; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 18px;">
          ♥ LovePage Verification
        </div>
        <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #2d221e;">Verify Your Email Address</h1>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #6e5d52; line-height: 1.6;">
          ${greeting} enter the 6-digit verification code below to confirm that <strong>${email}</strong> is your real email address and complete your LovePage account setup:
        </p>
        <div style="background: #ffffff; border: 2px dashed #cf493e; border-radius: 14px; padding: 18px 24px; margin: 0 auto 24px auto; max-width: 280px;">
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #cf493e; text-align: center;">
            ${code}
          </div>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #8c786a;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        <p style="margin: 0; font-size: 11px; color: #a89587;">
          If you didn't request this account on LovePage, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name = "", isResend = false, forGoogleOAuth = false } = body;

    // 1. Validate email format, block disposable/fake domains, catch typos
    const validation = validateEmailFormat(email);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid email address." },
        { status: 400 }
      );
    }

    const { normalizedEmail, domain } = validation;
    const displayName = (name || "").trim();

    // 2. Verify domain has valid DNS MX mail servers
    const hasMx = await verifyDomainHasMxRecords(domain);
    if (!hasMx) {
      return NextResponse.json(
        {
          error: `The domain "@${domain}" cannot receive emails. Please enter a real email address (such as @gmail.com).`,
        },
        { status: 400 }
      );
    }

    // 3. Check if an already-verified account exists for this email
    const adminClient = getAdminClient();
    try {
      const { data: usersData } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (existingUser && !isResend && !forGoogleOAuth) {
        const isPendingVerification =
          existingUser.user_metadata?.pending_otp_verification === true;

        if (!isPendingVerification) {
          return NextResponse.json(
            {
              error:
                "An account with this email already exists. Please sign in instead.",
            },
            { status: 400 }
          );
        }
      }
    } catch (listErr) {
      console.warn("Could not list users during OTP pre-check:", listErr);
    }

    // 4. Generate 6-digit verification code & stateless HMAC token
    const code = generateSixDigitCode();
    const { token } = createOtpVerificationToken(normalizedEmail, code);
    const otpSentAt = Date.now();

    // 5. Channel A: Try sending the 6-digit code via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = buildVerificationEmailHtml(displayName, code, normalizedEmail);
      const subject = `${code} is your LovePage verification code`;

      // Try custom domain first if configured, then fallback to onboarding@resend.dev
      const senders = [
        process.env.RESEND_FROM_EMAIL || "LovePage <support@lovepage.site>",
        "LovePage <onboarding@resend.dev>",
      ];

      for (const sender of senders) {
        try {
          const { data, error } = await resend.emails.send({
            from: sender,
            to: [normalizedEmail],
            subject,
            html,
          });

          if (!error && data?.id) {
            return NextResponse.json({
              success: true,
              delivery: "resend",
              token,
              otpSentAt,
              message: `We sent a 6-digit verification code to ${normalizedEmail}. Please check your inbox (and spam folder).`,
            });
          }
        } catch {
          // Try next sender or fallback to Supabase Auth mailer
        }
      }
    }

    // 6. Channel B: Fallback to Supabase Auth's built-in OTP email sender
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        data: {
          name: displayName,
          display_name: displayName,
          pending_otp_verification: true,
          otp_sent_at: otpSentAt,
        },
      },
    });

    if (otpError) {
      console.error("Supabase signInWithOtp error:", otpError);
      if (
        otpError.message.toLowerCase().includes("rate limit") ||
        otpError.message.toLowerCase().includes("security purposes")
      ) {
        return NextResponse.json(
          {
            error:
              "Please wait 60 seconds before requesting another verification email, or check your inbox/spam folder for the one just sent.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            otpError.message ||
            "Could not send verification email. Please verify your email address is valid.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      delivery: "supabase",
      token,
      otpSentAt,
      message: `We sent a verification email to ${normalizedEmail}. Enter the code from the email (or click the confirmation link in your Gmail) to activate your account!`,
    });
  } catch (error: any) {
    console.error("API /api/auth/send-otp error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send verification code." },
      { status: 500 }
    );
  }
}
