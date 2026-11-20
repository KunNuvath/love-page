"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";

interface AuthModalOptions {
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
  defaultMode?: "signin" | "signup";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null; session: Session | null; user: User | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  // Google OAuth 2-step OTP verification
  pendingGoogleEmail: string | null;
  pendingGoogleName: string;
  completeGoogleOtp: () => void;
  cancelGoogleOtp: () => Promise<void>;
  // Modal controls
  isAuthModalOpen: boolean;
  authModalOptions: AuthModalOptions;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GOOGLE_OTP_PENDING_KEY = "lovepage_google_otp_pending";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Holds the Google OAuth session until the user confirms the 6-digit OTP sent to their Gmail
  const pendingGoogleSessionRef = useRef<Session | null>(null);
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState<string | null>(null);
  const [pendingGoogleName, setPendingGoogleName] = useState<string>("");

  // Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions>({});

  const applyOrGateSession = useCallback((currentSession: Session | null) => {
    const isGoogleOtpPending =
      typeof window !== "undefined" &&
      localStorage.getItem(GOOGLE_OTP_PENDING_KEY) === "true";

    if (currentSession?.user?.email && isGoogleOtpPending) {
      pendingGoogleSessionRef.current = currentSession;
      setPendingGoogleEmail(currentSession.user.email);
      setPendingGoogleName(
        currentSession.user.user_metadata?.full_name ||
          currentSession.user.user_metadata?.name ||
          ""
      );
      setSession(null);
      setUser(null);
      setIsAuthModalOpen(true);
      return;
    }

    pendingGoogleSessionRef.current = null;
    setPendingGoogleEmail(null);
    setPendingGoogleName("");
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && mounted) {
          applyOrGateSession(data.session);
        }
      } catch (err) {
        console.warn("Error fetching Supabase session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      applyOrGateSession(currentSession);
      setLoading(false);

      // If the user clicked the verification link in their Gmail inbox for email signup,
      // finalize their pending signup password & display name automatically.
      if (currentSession?.user?.email && typeof window !== "undefined") {
        try {
          const rawPending = localStorage.getItem("lovepage_pending_signup");
          if (rawPending) {
            const pending = JSON.parse(rawPending);
            if (
              pending.email &&
              pending.password &&
              pending.email.toLowerCase() === currentSession.user.email.toLowerCase()
            ) {
              localStorage.removeItem("lovepage_pending_signup");
              await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "finalize-supabase",
                  email: pending.email,
                  password: pending.password,
                  name: pending.name || "",
                }),
              });
            }
          }
        } catch {
          // Ignore storage parse errors
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyOrGateSession]);

  const completeGoogleOtp = useCallback(() => {
    try {
      localStorage.removeItem(GOOGLE_OTP_PENDING_KEY);
    } catch {}
    const confirmedSession = pendingGoogleSessionRef.current;
    pendingGoogleSessionRef.current = null;
    setPendingGoogleEmail(null);
    setPendingGoogleName("");
    if (confirmedSession) {
      setSession(confirmedSession);
      setUser(confirmedSession.user);
    }
  }, []);

  const cancelGoogleOtp = useCallback(async () => {
    try {
      localStorage.removeItem(GOOGLE_OTP_PENDING_KEY);
    } catch {}
    pendingGoogleSessionRef.current = null;
    setPendingGoogleEmail(null);
    setPendingGoogleName("");
    setSession(null);
    setUser(null);
    await supabase.auth.signOut().catch(() => {});
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user?.user_metadata?.pending_otp_verification === true) {
        await supabase.auth.signOut();
        return {
          error: {
            name: "AuthApiError",
            message: "Email not confirmed. Please verify your email with the code sent to your inbox.",
            status: 400,
          } as AuthError,
        };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name?.trim() || "",
            display_name: name?.trim() || "",
          },
        },
      });

      if (error) {
        return { error, session: null, user: null };
      }

      return { error: null, session: data.session, user: data.user };
    } catch (err: any) {
      return { error: err, session: null, user: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const returnUrl = typeof window !== "undefined" ? window.location.href : "";
      try {
        localStorage.setItem(GOOGLE_OTP_PENDING_KEY, "true");
      } catch {}

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: returnUrl,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        try {
          localStorage.removeItem(GOOGLE_OTP_PENDING_KEY);
        } catch {}
      }
      return { error };
    } catch (err: any) {
      try {
        localStorage.removeItem(GOOGLE_OTP_PENDING_KEY);
      } catch {}
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      try {
        localStorage.removeItem(GOOGLE_OTP_PENDING_KEY);
      } catch {}
      pendingGoogleSessionRef.current = null;
      setPendingGoogleEmail(null);
      setPendingGoogleName("");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setAuthModalOptions(options || {});
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        pendingGoogleEmail,
        pendingGoogleName,
        completeGoogleOtp,
        cancelGoogleOtp,
        isAuthModalOpen,
        authModalOptions,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
