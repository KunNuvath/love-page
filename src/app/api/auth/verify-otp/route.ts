import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { verifyOtpToken } from "@/src/lib/otp-token";

export const dynamic = "force-dynamic";

async function activateAndSetPassword(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = getAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const displayName = (name || "").trim();

  const { data: usersData, error: listError } =
    await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (listError) {
    return { success: false, error: listError.message };
  }

  const existingUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );

  if (existingUser) {
    const { error: updateError } =
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: {
          ...existingUser.user_metadata,
          name: displayName || existingUser.user_metadata?.name || "",
          display_name:
            displayName || existingUser.user_metadata?.display_name || "",
          pending_otp_verification: false,
          email_verified: true,
        },
      });

    if (updateError) {
      return { success: false, error: updateError.message };
    }
    return { success: true };
  }

  // Create brand new confirmed user
  const { error: createError } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: displayName,
      display_name: displayName,
      pending_otp_verification: false,
      email_verified: true,
    },
  });

  if (createError) {
    return { success: false, error: createError.message };
  }

  return { success: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = "verify-code",
      email,
      password,
      name = "",
      code = "",
      token = "",
      otpSentAt = 0,
    } = body;

    if (!email || (!password && action !== "verify-google-otp")) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Action 0: Verify 6-digit OTP for Google OAuth sign-in
    if (action === "verify-google-otp") {
      if (!code || !token) {
        return NextResponse.json(
          { error: "Please enter the 6-digit verification code." },
          { status: 400 }
        );
      }

      const check = verifyOtpToken(normalizedEmail, code, token);
      if (!check.valid) {
        return NextResponse.json(
          { error: check.reason || "Invalid verification code." },
          { status: 400 }
        );
      }

      try {
        const adminClient = getAdminClient();
        const { data: usersData } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        const existingUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );
        if (existingUser) {
          await adminClient.auth.admin.updateUserById(existingUser.id, {
            email_confirm: true,
            user_metadata: {
              ...existingUser.user_metadata,
              google_otp_verified: true,
              email_verified: true,
            },
          });
        }
      } catch (err) {
        console.warn("Could not update Google OTP metadata:", err);
      }

      return NextResponse.json({
        success: true,
        verified: true,
      });
    }

    // Action 1: Verify 6-digit HMAC code
    if (action === "verify-code") {
      if (!code || !token) {
        return NextResponse.json(
          { error: "Please enter the 6-digit verification code." },
          { status: 400 }
        );
      }

      const check = verifyOtpToken(normalizedEmail, code, token);
      if (!check.valid) {
        return NextResponse.json(
          { error: check.reason || "Invalid verification code." },
          { status: 400 }
        );
      }

      const activation = await activateAndSetPassword(
        normalizedEmail,
        password,
        name
      );
      if (!activation.success) {
        return NextResponse.json(
          { error: activation.error || "Failed to activate account." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
      });
    }

    // Action 2: Finalize after Supabase client-side verifyOtp succeeded
    if (action === "finalize-supabase") {
      const activation = await activateAndSetPassword(
        normalizedEmail,
        password,
        name
      );
      if (!activation.success) {
        return NextResponse.json(
          { error: activation.error || "Failed to finalize account." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
      });
    }

    // Action 3: Poll whether user clicked the verification link in their Gmail
    if (action === "check-link") {
      const adminClient = getAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      const user = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (!user || !user.last_sign_in_at) {
        return NextResponse.json({ success: true, verified: false });
      }

      const lastSignInMs = new Date(user.last_sign_in_at).getTime();
      // Check if user redeemed the magic link after the OTP was sent (with 15s clock-skew grace)
      if (otpSentAt && lastSignInMs >= otpSentAt - 15000) {
        const activation = await activateAndSetPassword(
          normalizedEmail,
          password,
          name
        );
        if (activation.success) {
          return NextResponse.json({ success: true, verified: true });
        }
      }

      return NextResponse.json({ success: true, verified: false });
    }

    return NextResponse.json(
      { error: "Unsupported verification action." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("API /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { error: error?.message || "Verification failed." },
      { status: 500 }
    );
  }
}
