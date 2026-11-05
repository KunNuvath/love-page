"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  Bug,
  Sparkles,
  Heart,
  Copy,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function ContactFeedbackSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<"feedback" | "bug" | "feature" | "general">("feedback");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);

  const SUPPORT_EMAIL = "support@lovepage.site";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setHasCopiedEmail(true);
    setTimeout(() => setHasCopiedEmail(false), 2500);
  };

  const getMailtoUrl = () => {
    const subjectPrefix = {
      feedback: "💡 Feedback",
      bug: "🐛 Bug Report",
      feature: "✨ Feature Request",
      general: "💌 Hello",
    }[category];

    const subject = encodeURIComponent(`[${subjectPrefix}] LovePage Contact from ${name || "User"}`);
    const body = encodeURIComponent(
      `Hi LovePage Support,\n\n${message || "(Write your message here)"}\n\n---\nFrom: ${name || "Anonymous"}\nEmail: ${email || "Not specified"}`
    );

    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !message.trim()) {
      setErrorMessage("Please enter both your email address and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });

      if (!res.ok) {
        throw new Error("Unable to send at this moment. Please try again or email directly.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit. You can also email us directly!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#fbf5f0] border-t border-[#ebd9c7] relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#cf493e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#e8a628]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
            <Mail className="h-3.5 w-3.5" />
            <span>Get In Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d221e] tracking-tight mb-3">
            Feedback & Support
          </h2>
          <p className="text-[#68584f] text-sm max-w-lg mx-auto">
            Have an idea to make LovePage better, found a bug, or just want to say hi?
            We read and reply to every message.
          </p>

          {/* Quick Email Pill */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-[#8c786a]">Official address:</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#debfa8] shadow-2xs text-xs font-mono text-[#5c473d]">
              <span className="font-semibold text-[#cf493e]">{SUPPORT_EMAIL}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="ml-1 p-1 hover:bg-[#f6eee7] rounded text-[#8c786a] hover:text-[#2d221e] transition-colors cursor-pointer"
                title="Copy email address"
              >
                {hasCopiedEmail ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {hasCopiedEmail && (
              <span className="text-[11px] font-semibold text-emerald-600 animate-fade-in">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* The Card Box with Scrapbook/Airmail Aesthetic */}
        <div className="scrapbook-paper rounded-2xl border border-[#d8c8b4] p-4 xs:p-6 sm:p-10 shadow-[0_15px_40px_rgba(140,70,60,0.08)] relative">
          {/* Vintage Stamp / Decor in top right */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 hidden sm:flex flex-col items-center justify-center w-16 h-20 border-2 border-dashed border-[#cf493e]/50 rounded-sm bg-[#faf3ed] rotate-3 text-center p-1 pointer-events-none opacity-80">
            <Heart className="h-4 w-4 text-[#cf493e] mb-1 fill-[#cf493e]/30" />
            <span className="text-[9px] font-mono tracking-tighter text-[#9c897c] uppercase leading-none">
              Air Mail
            </span>
            <span className="text-[8px] font-mono font-bold text-[#cf493e] mt-1">
              LOVEPAGE
            </span>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="py-10 text-center animate-fade-up">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2d221e] tracking-tight mb-2">
                Thank You for Your Note!
              </h3>
              <p className="text-[#68584f] text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
                We received your message and will review it right away. If you provided an email,
                we will get back to you directly from <strong className="text-[#cf493e] font-mono">{SUPPORT_EMAIL}</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getMailtoUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#faf3ed] text-[#4a3a32] border border-[#d8c8b4] text-xs font-semibold shadow-2xs transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#cf493e]" />
                  <span>Also open in my Email App</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            /* The Active Contact Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-bold text-[#4a3b32] uppercase tracking-wider mb-2">
                  What is this about?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "feedback", label: "Feedback", icon: Sparkles },
                    { id: "bug", label: "Report Bug", icon: Bug },
                    { id: "feature", label: "New Idea", icon: MessageSquare },
                    { id: "general", label: "General", icon: Heart },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = category === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCategory(tab.id as any)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#cf493e] text-white border-[#cf493e] shadow-xs scale-102"
                            : "bg-white/80 hover:bg-white text-[#5c4a3e] border-[#debfa8]"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-[#cf493e]"}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email inputs in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-[#4a3b32] uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-[#9c897c] font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/95 border border-[#d8c8b4] text-[#2d221e] text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-[#4a3b32] uppercase tracking-wider mb-1.5">
                    Your Email <span className="text-[#cf493e]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/95 border border-[#d8c8b4] text-[#2d221e] text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a]"
                  />
                </div>
              </div>

              {/* Message Box */}
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-[#4a3b32] uppercase tracking-wider mb-1.5">
                  Message / Details <span className="text-[#cf493e]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === "bug"
                      ? "Tell us what happened and what device or browser you're using..."
                      : category === "feature"
                      ? "Describe what new feature or song/template you would love to see..."
                      : "Share your thoughts, suggestions, or notes with us..."
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/95 border border-[#d8c8b4] text-[#2d221e] text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/30 focus:border-[#cf493e] transition-all placeholder:text-[#ab988a] resize-none"
                />
              </div>

              {/* Error message alert if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href={getMailtoUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8c786a] hover:text-[#cf493e] transition-colors inline-flex items-center gap-1 order-2 sm:order-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Or send via email app</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] disabled:opacity-60 text-white font-bold text-sm shadow-[0_6px_20px_rgba(207,73,62,0.35)] hover:scale-102 active:scale-98 transition-all cursor-pointer order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
