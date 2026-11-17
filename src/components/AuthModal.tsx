"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { validateEmailFormat } from "@/src/lib/email-validation";

export default function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    authModalOptions,
    closeAuthModal,
    signInWithEmail,
    signInWithGoogle,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"form" | "verify">("form");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"resend" | "supabase">("resend");
  const [otpSentAt, setOtpSentAt] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with options when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalOptions.defaultMode) {
        setMode(authModalOptions.defaultMode);
      }
      setStep("form");
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpDigits(["", "", "", "", "", ""]);
    }
  }, [isAuthModalOpen, authModalOptions.defaultMode]);

  // Cooldown countdown timer for Resend Code button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Complete verification helper (signs in and closes modal)
  const completeVerifiedSignup = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      localStorage.removeItem("lovepage_pending_signup");
    } catch {}

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg("Email verified! Signing you in...");

    const { error } = await signInWithEmail(normalizedEmail, password);
    if (error) {
      setErrorMsg(error.message || "Email verified! Please sign in with your password.");
      setStep("form");
      setMode("signin");
      setIsLoading(false);
      return;
    }

    setSuccessMsg("Account verified & created! Welcome 💖");
    setTimeout(() => {
      setIsLoading(false);
      closeAuthModal();
      if (authModalOptions.onSuccess) {
        authModalOptions.onSuccess();
      }
    }, 650);
  }, [email, password, signInWithEmail, closeAuthModal, authModalOptions]);

  // Poll every 3s while on "verify" step in case user clicked confirmation link in Gmail
  useEffect(() => {
    if (!isAuthModalOpen || step !== "verify" || !email || !password) return;

    // Also check if user became authenticated in this tab via magic link
    if (user && user.email?.toLowerCase() === email.trim().toLowerCase()) {
      completeVerifiedSignup();
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "check-link",
            email: email.trim().toLowerCase(),
            password,
            name: name.trim(),
            otpSentAt,
          }),
        });
        const data = await res.json();
        if (res.ok && data.verified) {
          clearInterval(interval);
          completeVerifiedSignup();
        }
      } catch {
        // Ignore polling network errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthModalOpen, step, email, password, name, otpSentAt, user, completeVerifiedSignup]);

  // Reset errors when switching modes
  const handleSwitchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setStep("form");
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpDigits(["", "", "", "", "", ""]);
  };

  if (!isAuthModalOpen) return null;

  // Send OTP Code to user's email
  const requestVerificationCode = async (isResend = false) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateEmailFormat(email);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // Save pending signup locally in case user clicks confirmation link in Gmail
      try {
        localStorage.setItem(
          "lovepage_pending_signup",
          JSON.stringify({
            email: validation.normalizedEmail,
            password,
            name: name.trim(),
            timestamp: Date.now(),
          })
        );
      } catch {}

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: validation.normalizedEmail,
          name: name.trim(),
          isResend,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to send verification code. Please try again.");
        setIsLoading(false);
        return;
      }

      setVerificationToken(data.token || "");
      setDeliveryMethod(data.delivery || "resend");
      setOtpSentAt(data.otpSentAt || Date.now());
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("verify");
      setSuccessMsg(
        data.message ||
          `Verification code sent to ${validation.normalizedEmail}! Check your Gmail inbox.`
      );
      setIsLoading(false);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to send verification code.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateEmailFormat(email);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      await requestVerificationCode(false);
      return;
    }

    // Sign In flow
    setIsLoading(true);
    try {
      const { error } = await signInWithEmail(validation.normalizedEmail, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Incorrect email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMsg(
            "Your email address is not verified yet. Please create your account and enter the verification code sent to your email."
          );
        } else if (
          error.message.includes("provider is not enabled") ||
          error.message.includes("Unsupported provider")
        ) {
          setErrorMsg(
            "Email provider is not enabled in your Supabase project. Go to Supabase Dashboard → Authentication → Providers → Email and toggle it ON."
          );
        } else {
          setErrorMsg(error.message || "Failed to sign in. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success sign in
      setSuccessMsg("Welcome back!");
      setTimeout(() => {
        closeAuthModal();
        if (authModalOptions.onSuccess) {
          authModalOptions.onSuccess();
        }
      }, 600);
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  // Handle verifying the 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const code = otpDigits.join("").trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMsg("Please enter the complete 6-digit verification code from your email.");
      return;
    }

    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Try verifying via our HMAC token first (works for Resend 6-digit codes)
      if (verificationToken) {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify-code",
            email: normalizedEmail,
            password,
            name: name.trim(),
            code,
            token: verificationToken,
          }),
        });

        const data = await res.json();
        if (res.ok && data.verified) {
          await completeVerifiedSignup();
          return;
        }

        // If delivery was Resend only, report the error directly
        if (deliveryMethod === "resend") {
          setErrorMsg(data.error || "Invalid verification code. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // 2. If delivery was via Supabase Auth OTP, verify against Supabase GoTrue
      const otpTypes: Array<"email" | "signup" | "magiclink"> = [
        "email",
        "signup",
        "magiclink",
      ];
      let supabaseVerified = false;

      for (const otpType of otpTypes) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: code,
          type: otpType,
        });
        if (!error && (data.user || data.session)) {
          supabaseVerified = true;
          break;
        }
      }

      if (!supabaseVerified) {
        setErrorMsg(
          "Invalid or expired verification code. Please check your email inbox or click Resend Code."
        );
        setIsLoading(false);
        return;
      }

      // Finalize password & metadata on server
      const finalizeRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finalize-supabase",
          email: normalizedEmail,
          password,
          name: name.trim(),
        }),
      });

      if (!finalizeRes.ok) {
        const errData = await finalizeRes.json().catch(() => ({}));
        setErrorMsg(errData.error || "Could not finalize account creation.");
        setIsLoading(false);
        return;
      }

      await completeVerifiedSignup();
    } catch (err: any) {
      setErrorMsg(err?.message || "Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  // OTP 6-box digit change handler
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = ["", "", "", "", "", ""];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        if (
          error.message.includes("provider is not enabled") ||
          error.message.includes("Unsupported provider")
        ) {
          setErrorMsg(
            "Google provider is not yet enabled in your Supabase Dashboard. Follow the 2-step setup below to enable it."
          );
        } else {
          setErrorMsg(error.message || "Could not sign in with Google.");
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not sign in with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-5 sm:p-8 shadow-2xl border text-center transition-all bg-[#faf6ee] text-[#362e2b] border-[#e4d6c4] max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Airmail Stamp in Corner */}
        <div className="absolute top-4 left-4 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-[10px] font-bold tracking-wider uppercase pointer-events-none">
          <Heart className="h-3 w-3 fill-[#cf493e]" />
          <span>LovePage Account</span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#8c786a] hover:text-[#2d221e] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── STEP 2: EMAIL VERIFICATION SCREEN ── */}
        {step === "verify" ? (
          <div className="mt-2 sm:mt-1">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-[#cf493e] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(207,73,62,0.35)]">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h3 className="font-handwriting text-3xl font-bold text-[#2d221e] mb-1">
              Verify Your Email
            </h3>
            <p className="text-xs text-[#7d6b60] max-w-xs mx-auto leading-relaxed mb-3">
              To confirm your account is real, please enter the 6-digit verification code sent to:
            </p>

            {/* Target Email Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d8c8b4] text-xs font-semibold text-[#2d221e] mb-4 shadow-2xs">
              <Mail className="h-3.5 w-3.5 text-[#cf493e]" />
              <span>{email.trim().toLowerCase()}</span>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-[#cf493e] hover:underline font-bold ml-1 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Alerts / Feedback */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* 6-Digit Input Boxes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#635349] mb-2">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl bg-white border-2 border-[#d8c8b4] text-[#2d221e] focus:outline-none focus:border-[#cf493e] focus:ring-2 focus:ring-[#cf493e]/25 transition-all shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              {deliveryMethod === "supabase" && (
                <div className="p-2.5 rounded-xl bg-[#f3ece2] border border-[#e2d4c3] text-[11px] text-[#6e5d52] leading-relaxed text-left">
                  💡 <strong>Tip:</strong> Check your Gmail inbox (and Spam folder). You can either enter the 6-digit code above, or click the confirmation link inside the email — this window will automatically detect it!
                </div>
              )}

              {/* Verify Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otpDigits.join("").length < 6}
                className="w-full py-3 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(207,73,62,0.35)] transition-all cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify &amp; Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend Code & Back Controls */}
            <div className="mt-5 pt-4 border-t border-[#ebd8c7] flex items-center justify-between text-xs text-[#8c786a]">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#6e5d52] hover:text-[#2d221e] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={() => requestVerificationCode(true)}
                className="inline-flex items-center gap-1 font-bold text-[#cf493e] hover:underline disabled:text-[#b09f93] disabled:no-underline cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend Code"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ── STEP 1: SIGN IN / CREATE ACCOUNT FORM ── */
          <>
            {/* Header Icon & Titles */}
            <div className="mt-2 sm:mt-1 mb-5">
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-[#cf493e] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(207,73,62,0.35)]">
                <Sparkles className="h-6 w-6" />
              </div>

              <h3 className="font-handwriting text-3xl font-bold text-[#2d221e] mb-1">
                {authModalOptions.title ||
                  (mode === "signin" ? "Welcome Back" : "Create Your Account")}
              </h3>
              <p className="text-xs text-[#7d6b60] max-w-xs mx-auto leading-relaxed">
                {authModalOptions.subtitle ||
                  (mode === "signin"
                    ? "Sign in to save your love keepsake and get your shareable link."
                    : "Use your real email (like Gmail) — we'll send a verification code to confirm your account.")}
              </p>
            </div>

            {/* Tabs: Sign In / Create Account */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/5 rounded-2xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSwitchMode("signin")}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-[#2d221e] shadow-xs font-bold"
                    : "text-[#8c786a] hover:text-[#2d221e]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode("signup")}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#2d221e] shadow-xs font-bold"
                    : "text-[#8c786a] hover:text-[#2d221e]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Alerts / Feedback */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#635349] mb-1"
                  >
                    Your Name{" "}
                    <span className="text-[#a89587] font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89587]" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-[#2d221e] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#635349] mb-1"
                >
                  Email Address <span className="text-[#cf493e]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89587]" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-[#2d221e] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
                  />
                </div>
                {mode === "signup" && (
                  <p className="mt-1 text-[10px] text-[#8c786a]">
                    Must be a real email address — a 6-digit verification code will be sent here.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#635349] mb-1"
                >
                  Password <span className="text-[#cf493e]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89587]" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-[#2d221e] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89587] hover:text-[#2d221e] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#635349] mb-1"
                  >
                    Confirm Password <span className="text-[#cf493e]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a89587]" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-[#2d221e] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(207,73,62,0.35)] transition-all cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {mode === "signin"
                        ? "Signing In..."
                        : "Sending Verification Code..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin"
                        ? "Sign In & Continue"
                        : "Send Verification Code"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ebd8c7]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#9c897c]">
                <span className="bg-[#faf6ee] px-2 font-bold">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-[#f6eee7] border border-[#d8c8b4] text-[#4a3a32] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-2xs hover:border-[#cf493e]/40"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer switch prompt */}
            <p className="mt-4 pt-3 border-t border-[#ebd8c7] text-xs text-[#8c786a]">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signup")}
                    className="font-bold text-[#cf493e] hover:underline cursor-pointer"
                  >
                    Create one free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signin")}
                    className="font-bold text-[#cf493e] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
