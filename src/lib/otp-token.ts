import crypto from "crypto";
import dns from "dns/promises";
import { TRUSTED_EMAIL_DOMAINS } from "@/src/lib/email-validation";

const SECRET_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.RESEND_API_KEY ||
  "lovepage-otp-hmac-secret-key-2026";

/**
 * Generates a random 6-digit numeric verification code (e.g. "482910").
 */
export function generateSixDigitCode(): string {
  const num = crypto.randomInt(100000, 1000000);
  return String(num);
}

/**
 * Creates a stateless HMAC-signed token encoding (email, code, expiresAt).
 * Works reliably across serverless function instances on Vercel.
 */
export function createOtpVerificationToken(
  email: string,
  code: string,
  ttlMs = 10 * 60 * 1000 // 10 minutes
): { token: string; expiresAt: number } {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + ttlMs;
  const payload = `${normalizedEmail}|${code.trim()}|${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");

  const token = Buffer.from(`${expiresAt}.${signature}`).toString("base64url");
  return { token, expiresAt };
}

/**
 * Verifies a 6-digit OTP code against the stateless HMAC token.
 */
export function verifyOtpToken(
  email: string,
  code: string,
  token: string
): { valid: boolean; reason?: string } {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [expiresAtStr, providedSignature] = decoded.split(".");
    const expiresAt = Number(expiresAtStr);

    if (!expiresAt || !providedSignature) {
      return { valid: false, reason: "Invalid verification token." };
    }

    if (Date.now() > expiresAt) {
      return {
        valid: false,
        reason: "Verification code has expired. Please request a new code.",
      };
    }

    const expectedPayload = `${normalizedEmail}|${cleanCode}|${expiresAt}`;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(expectedPayload)
      .digest("hex");

    const sigBufferA = Buffer.from(providedSignature, "hex");
    const sigBufferB = Buffer.from(expectedSignature, "hex");

    if (
      sigBufferA.length !== sigBufferB.length ||
      !crypto.timingSafeEqual(sigBufferA, sigBufferB)
    ) {
      return {
        valid: false,
        reason: "Invalid verification code. Please check the 6-digit code and try again.",
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid verification code." };
  }
}

/**
 * Verifies that the email domain has real DNS Mail Exchange (MX) servers
 * capable of receiving email, blocking random/made-up domains.
 */
export async function verifyDomainHasMxRecords(domain: string): Promise<boolean> {
  const cleanDomain = domain.trim().toLowerCase();

  // Fast-path for known major email providers
  if (TRUSTED_EMAIL_DOMAINS.has(cleanDomain)) {
    return true;
  }

  try {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 3500)
    );
    const mxRecords = await Promise.race([
      dns.resolveMx(cleanDomain),
      timeoutPromise,
    ]);

    if (mxRecords === null) {
      // DNS lookup timed out (e.g. restricted network environment) — don't false-reject
      return true;
    }

    return Array.isArray(mxRecords) && mxRecords.length > 0 && Boolean(mxRecords[0].exchange);
  } catch (err: any) {
    // ENOTFOUND / ENODATA / ESERVFAIL means the domain has no mail servers or does not exist
    if (
      err?.code === "ENOTFOUND" ||
      err?.code === "ENODATA" ||
      err?.code === "EBADNAME"
    ) {
      return false;
    }
    // For network errors, allow through to OTP stage where real email delivery will test it
    return true;
  }
}
