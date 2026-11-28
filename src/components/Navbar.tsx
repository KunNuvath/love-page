"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Menu,
  X,
  ArrowRight,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Crown,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

interface NavbarProps {
  onLaunchTemplate?: () => void;
}

const MOBILE_TEMPLATES = [
  { name: "Polaroid Scrapbook", vol: "Vol. 01", href: "/scrapbook", price: "Free", premium: false },
  { name: "Our Little Book", vol: "Vol. 02", href: "/book", price: "Free", premium: false },
  { name: "Our Little Adventure", vol: "Vol. 03", href: "/adventure", price: "$4.99", premium: true },
  { name: "Scrapbook Album (9p)", vol: "Vol. 04", href: "/album", price: "$4.99", premium: true },
  { name: "Love Story (12p)", vol: "Vol. 06", href: "/love-story", price: "$5.99", premium: true },
  { name: "10 Things I Love About You", vol: "Vol. 08", href: "/ten-things", price: "$6.00", premium: true },
  { name: "1 Year With You (Velvet)", vol: "Vol. 07", href: "/anniversary", price: "$7.99", premium: true },
  { name: "Love Flipbook (16p)", vol: "Vol. 05", href: "/flipbook", price: "$9.99", premium: true },
];

export default function Navbar({ onLaunchTemplate }: NavbarProps) {
  const { user, openAuthModal, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setConfirmingSignOut(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
        setConfirmingSignOut(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setConfirmingSignOut(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLaunchClick = () => {
    setIsMobileMenuOpen(false);
    onLaunchTemplate?.();
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-[#faf4ea]/92 backdrop-blur-xl border-b border-[#dfd0bc] shadow-[0_4px_20px_-8px_rgba(43,31,26,0.12)]"
          : "bg-[#faf4ea]/78 backdrop-blur-md border-b border-[#e8dccb]/70"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* ── Left: Clean Text-Only Wordmark (Paddle-style) ───── */}
        <Link
          href="/"
          className="inline-flex items-baseline shrink-0 select-none group"
          aria-label="LovePage Home"
        >
          <span className="text-[22px] sm:text-2xl font-black tracking-[-0.045em] text-[#2b1f1a] leading-none group-hover:text-[#4a0f17] transition-colors">
            lovepage
          </span>
          <span className="text-[24px] sm:text-[26px] font-black text-[#cf493e] leading-none">
            .
          </span>
        </Link>

        {/* ── Center: Clean Editorial Navigation ───────────────── */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-full bg-white/60 border border-[#e5d7c4]/80"
        >
          <Link
            href="/templates"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-[#3d2f27] hover:text-[#4a0f17] hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <span>Templates</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#4a0f17]/10 text-[#4a0f17] leading-none">
              8
            </span>
          </Link>

          <a
            href="#collection"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#624f43] hover:text-[#2b1f1a] hover:bg-white transition-colors"
          >
            Pricing
          </a>

          <a
            href="#how-it-works"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#624f43] hover:text-[#2b1f1a] hover:bg-white transition-colors"
          >
            How It Works
          </a>

          <a
            href="/#faq"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#624f43] hover:text-[#2b1f1a] hover:bg-white transition-colors"
          >
            FAQ
          </a>

          <a
            href="/#contact"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#624f43] hover:text-[#2b1f1a] hover:bg-white transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* ── Right: Account + Single Primary CTA ──────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen((prev) => !prev);
                  setConfirmingSignOut(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/85 hover:bg-white text-[#3d2f27] border border-[#dfd0bc] text-xs font-semibold transition-all cursor-pointer active:scale-95"
                aria-label="Account menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="h-5 w-5 rounded-full bg-[#4a0f17] text-[#f2e7d0] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.user_metadata?.name?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <span className="max-w-[90px] truncate hidden sm:inline">
                  {user.user_metadata?.name || user.email?.split("@")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-[#7d6a5d] shrink-0" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#fbf8f3] border border-[#e3d4c0] shadow-xl p-2 z-50 text-left animate-fade-down">
                  <div className="px-3 py-2 border-b border-[#ede1d2] mb-1">
                    <p className="text-xs font-bold text-[#2b1f1a] truncate">
                      {user.user_metadata?.name || "Member"}
                    </p>
                    <p className="text-[11px] text-[#7d6a5d] font-mono truncate">
                      {user.email}
                    </p>
                  </div>
                  {confirmingSignOut ? (
                    <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-[11px] text-red-700 font-semibold mb-2">
                        Sign out of your account?
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            setConfirmingSignOut(false);
                            setIsUserMenuOpen(false);
                            await signOut();
                          }}
                          className="flex-1 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Sign out
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingSignOut(false)}
                          className="flex-1 py-1 rounded-lg bg-white border border-[#e5d5c5] text-[#5c4a3e] text-[11px] font-semibold hover:bg-[#faf4ed] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingSignOut(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold text-[#5a483e] hover:text-[#2b1f1a] hover:bg-white/80 transition-colors cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5 text-[#7d6a5d]" />
              <span>Sign In</span>
            </button>
          )}

          {onLaunchTemplate ? (
            <button
              type="button"
              onClick={handleLaunchClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4a0f17] hover:bg-[#5f1520] text-[#f4ecdc] text-xs sm:text-[13px] font-semibold tracking-wide border border-[#c9a24a]/45 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#e5c678] shrink-0" />
              <span>Create Page</span>
            </button>
          ) : (
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4a0f17] hover:bg-[#5f1520] text-[#f4ecdc] text-xs sm:text-[13px] font-semibold tracking-wide border border-[#c9a24a]/45 shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#e5c678] shrink-0" />
              <span>Templates</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 rounded-full text-[#3d2f27] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Clean Mobile Navigation Drawer ─────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#e4d5c0] bg-[#faf4ea]/98 backdrop-blur-xl px-4 py-4 shadow-xl animate-fade-down max-h-[82dvh] overflow-y-auto pb-safe">
          {/* Primary Section Links */}
          <div className="flex flex-col gap-0.5 mb-4">
            <Link
              href="/templates"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#2b1f1a] hover:bg-white/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#4a0f17]" />
                <span>All Templates &amp; Pricing</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#4a0f17]/10 text-[#4a0f17]">
                8
              </span>
            </Link>
            <a
              href="#studio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-[#5a483e] hover:bg-white/80 transition-colors"
            >
              Quick Personalize Studio
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-[#5a483e] hover:bg-white/80 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-[#5a483e] hover:bg-white/80 transition-colors"
            >
              FAQ
            </a>
            <a
              href="/#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-[#5a483e] hover:bg-white/80 transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Compact, Uniform Template Catalogue */}
          <div className="pt-3 border-t border-[#e6d7c3] mb-4">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8c786a]">
              Templates
            </div>
            <div className="divide-y divide-[#ede1d2] rounded-2xl bg-white/80 border border-[#e6d7c3] overflow-hidden">
              {MOBILE_TEMPLATES.map((tpl) => (
                <Link
                  key={tpl.href}
                  href={tpl.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#faf4ea] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-[#9a8576] shrink-0">
                      {tpl.vol}
                    </span>
                    <span className="text-xs font-semibold text-[#2b1f1a] truncate">
                      {tpl.name}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      tpl.premium
                        ? "bg-[#4a0f17]/10 text-[#4a0f17]"
                        : "bg-emerald-700/10 text-emerald-800"
                    }`}
                  >
                    {tpl.premium && <Crown className="h-2.5 w-2.5 text-[#c9a24a]" />}
                    <span>{tpl.price}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account & Primary CTA */}
          <div className="pt-3 border-t border-[#e6d7c3] space-y-2.5">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/80 border border-[#e6d7c3]">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2b1f1a] truncate">
                    {user.user_metadata?.name || "Member"}
                  </p>
                  <p className="text-[10px] text-[#7d6a5d] font-mono truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#faf4ea] text-[#3d2f27] border border-[#dfd0bc] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-[#4a0f17]" />
                <span>Sign In / Create Account</span>
              </button>
            )}

            {onLaunchTemplate ? (
              <button
                type="button"
                onClick={handleLaunchClick}
                className="w-full py-3 rounded-xl bg-[#4a0f17] hover:bg-[#5f1520] text-[#f4ecdc] font-semibold text-xs flex items-center justify-center gap-2 border border-[#c9a24a]/45 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#e5c678]" />
                <span>Choose &amp; Create a Love Page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                href="/templates"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#4a0f17] hover:bg-[#5f1520] text-[#f4ecdc] font-semibold text-xs flex items-center justify-center gap-2 border border-[#c9a24a]/45 shadow-sm transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#e5c678]" />
                <span>Explore All Templates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
