"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalOptions,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with options when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalOptions.defaultMode) {
        setMode(authModalOptions.defaultMode);
      }
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, authModalOptions.defaultMode]);

  // Reset errors when switching modes
  const handleSwitchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(trimmedEmail, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrorMsg("Incorrect email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMsg("Please confirm your email address before signing in.");
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
      } else {
        // Sign up
        const { error, session, user } = await signUpWithEmail(trimmedEmail, password, name);
        if (error) {
          if (error.message.includes("User already registered")) {
            setErrorMsg("An account with this email already exists. Try signing in.");
          } else if (
            error.message.includes("provider is not enabled") ||
            error.message.includes("Unsupported provider")
          ) {
            setErrorMsg(
              "Email provider is not enabled in your Supabase project. Go to Supabase Dashboard → Authentication → Providers → Email and toggle it ON."
            );
          } else {
            setErrorMsg(error.message || "Failed to create account. Please try again.");
          }
          setIsLoading(false);
          return;
        }

        // Check if session was granted immediately (email confirmation disabled in Supabase)
        if (session || user?.email_confirmed_at) {
          setSuccessMsg("Account created successfully!");
          setTimeout(() => {
            closeAuthModal();
            if (authModalOptions.onSuccess) {
              authModalOptions.onSuccess();
            }
          }, 700);
        } else {
          // Email confirmation is required by Supabase project
          setSuccessMsg(
            "Account created! We sent a verification link to your email. Please check your inbox to confirm."
          );
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border text-center transition-all bg-[#faf6ee] text-[#362e2b] border-[#e4d6c4] overflow-hidden"
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
                : "Create a free account to save memories and share them anytime.")}
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
                Your Name <span className="text-[#a89587] font-normal">(optional)</span>
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
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-[#2d221e] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
              />
            </div>
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
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                <span>{mode === "signin" ? "Signing In..." : "Creating Account..."}</span>
              </>
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In & Continue" : "Create Account & Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <p className="mt-5 pt-3 border-t border-[#ebd8c7] text-xs text-[#8c786a]">
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
      </div>
    </div>
  );
}

