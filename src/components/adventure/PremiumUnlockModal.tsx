"use client";

import React, { useState } from "react";
import {
  Crown,
  CheckCircle2,
  KeyRound,
  X,
  ShieldCheck,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";
import styles from "./adventure.module.css";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  price?: string;
  templateId?: string;
  templateTitle?: string;
  bullets?: string[];
}

export default function PremiumUnlockModal({
  isOpen,
  onClose,
  onUnlocked,
  price = "$4.99",
  templateId = ADVENTURE_TEMPLATE_ID,
  templateTitle = "Our Little Adventure",
  bullets = [
    "6 shaped cutouts (Torn, Circle, Ticket, Film, Arch, Heart)",
    'Editable ransom-note title & "THE DAILY US" story',
    "Unlimited photo uploads & permanent share links",
  ],
}: PremiumUnlockModalProps) {
  const { user, session, openAuthModal } = useAuth();
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [passCode, setPassCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const ensurePaddleJs = (): Promise<void> => {
    if (typeof window !== "undefined" && window.Paddle) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]'
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Paddle.js")), {
          once: true,
        });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paddle.js"));
      document.head.appendChild(script);
    });
  };

  const startPaddleCheckout = async (accessToken?: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      let token = accessToken || session?.access_token;
      if (!token) {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token;
      }
      if (!token) {
        setErrorMsg("Please sign in first so we know which account to unlock.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/payments/paddle/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId }),
      });

      const cfg = await res.json();
      if (!res.ok || !cfg.clientToken || !cfg.priceId) {
        setErrorMsg(cfg.error || "Could not start Paddle checkout right now.");
        setIsProcessing(false);
        return;
      }

      await ensurePaddleJs();
      if (!window.Paddle) {
        setErrorMsg("Paddle checkout failed to initialize.");
        setIsProcessing(false);
        return;
      }

      if (cfg.environment === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }

      window.Paddle.Initialize({
        token: cfg.clientToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventCallback: async (event: any) => {
          if (event?.name === "checkout.completed") {
            const txnId = event?.data?.transaction_id;
            try {
              if (txnId) {
                await fetch("/api/payments/paddle/verify", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    transactionId: txnId,
                    templateId,
                  }),
                });
              }
              try {
                localStorage.setItem(`lovepage_unlocked_${templateId}`, "true");
                if (user?.id) {
                  localStorage.setItem(`lovepage_unlocked_${templateId}_${user.id}`, "true");
                }
              } catch {}
              await supabase.auth.refreshSession().catch(() => {});
              onUnlocked();
            } catch (err) {
              console.error("Failed to finalize Paddle unlock:", err);
            }
          }
        },
      });

      setIsProcessing(false);

      window.Paddle.Checkout.open({
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
        items: [{ priceId: cfg.priceId, quantity: 1 }],
        customer: cfg.customerEmail ? { email: cfg.customerEmail } : undefined,
        customData: cfg.customData,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not connect to Paddle. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePayClick = () => {
    setErrorMsg(null);
    if (!user) {
      openAuthModal({
        title: "Sign In Before Checkout",
        subtitle: "Sign in so your unlocked template is permanently linked to your account.",
        onSuccess: () => startPaddleCheckout(),
      });
      return;
    }
    startPaddleCheckout();
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!passCode.trim()) {
      setErrorMsg("Please enter your gift or VIP code.");
      return;
    }

    setIsProcessing(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/premium/unlock", {
        method: "POST",
        headers,
        body: JSON.stringify({
          templateId,
          method: "code",
          code: passCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "That unlock code isn't valid.");
        setIsProcessing(false);
        return;
      }

      try {
        localStorage.setItem(`lovepage_unlocked_${templateId}`, "true");
        if (user?.id) {
          localStorage.setItem(`lovepage_unlocked_${templateId}_${user.id}`, "true");
        }
      } catch {}

      await supabase.auth.refreshSession().catch(() => {});
      setIsProcessing(false);
      onUnlocked();
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not verify code.");
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unlock Premium Scrapbook"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-[#141d33]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#fbf6ea] text-[#1d2742] border-2 border-[#1d2742] shadow-[8px_8px_0_#1d2742] p-5 sm:p-7 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#1d2742]/10 text-[#1d2742] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7d56a] border-2 border-[#1d2742] text-[#1d2742] text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-[2px_2px_0_#1d2742]">
            <Crown className="h-3.5 w-3.5 text-[#e5533d] fill-[#e5533d]" />
            <span>Premium Template</span>
          </div>
          <h3 className={`${styles.hand} text-3xl sm:text-4xl font-bold text-[#1d2742]`}>
            Unlock &ldquo;{templateTitle}&rdquo;
          </h3>
          <p className={`${styles.type} text-xs text-[#1d2742]/75 mt-1`}>
            One-time payment • Lifetime access • Instant unlock
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-[#d3b088]/35 border-2 border-[#1d2742] mb-5 flex items-center justify-between gap-3">
          <ul className="text-xs text-[#1d2742] space-y-1.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#e5533d] shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="text-right shrink-0 pl-3 border-l-2 border-dashed border-[#1d2742]/30">
            <span className="block text-[10px] uppercase font-bold text-[#1d2742]/70">One-Time</span>
            <span className={`${styles.hand} text-3xl font-bold text-[#e5533d]`}>{price}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#e5533d]/15 border-2 border-[#e5533d] text-[#1d2742] text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Primary Paddle Overlay Checkout CTA */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handlePayClick}
          className="w-full py-3.5 px-4 rounded-xl bg-[#e5533d] hover:bg-[#cc442f] text-[#fbf6ea] font-bold text-sm sm:text-base border-2 border-[#1d2742] shadow-[4px_4px_0_#1d2742] flex items-center justify-center gap-2 transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-60"
        >
          {isProcessing && !showCodeBox ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opening Secure Checkout...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Pay {price} • Visa / Mastercard / PayPal</span>
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#1d2742]/75">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1d2742]" />
          <span>Secured by Paddle • Apple Pay, Cards &amp; PayPal Worldwide</span>
        </div>

        {/* Optional VIP / Gift Code Drawer */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-[#1d2742]/20 text-center">
          {!showCodeBox ? (
            <button
              type="button"
              onClick={() => {
                setShowCodeBox(true);
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d2742]/75 hover:text-[#e5533d] transition-colors cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Have a VIP or Gift Code?</span>
            </button>
          ) : (
            <form onSubmit={handleRedeemCode} className="space-y-2.5 text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d2742]">
                Redeem VIP / Gift Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code..."
                  value={passCode}
                  onChange={(e) => setPassCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border-2 border-[#1d2742] text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f7d56a]"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-[#f7d56a] hover:bg-[#efc74c] text-[#1d2742] font-bold text-xs border-2 border-[#1d2742] shadow-[2px_2px_0_#1d2742] cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? "..." : "Apply"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
