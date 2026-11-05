"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  Layers,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Camera,
  Wand2,
  HelpCircle,
  Calendar,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import BrandLogo from "@/src/components/BrandLogo";
import { useAuth } from "@/src/context/AuthContext";

interface NavbarProps {
  onLaunchTemplate?: () => void;
}

export default function Navbar({ onLaunchTemplate }: NavbarProps) {
  const { user, openAuthModal, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Monitor scroll for subtle shadow increase
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLaunchClick = () => {
    setIsMobileMenuOpen(false);
    if (onLaunchTemplate) {
      onLaunchTemplate();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full glass-nav transition-shadow duration-300 ${
        isScrolled ? "shadow-xs" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* ── Brand Logo ─────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-102"
        >
          <BrandLogo size="lg" className="group-hover:rotate-6 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="font-handwriting text-2xl sm:text-3xl font-bold tracking-tight text-[#2d2420]">
              LovePage
            </span>
            <span className="text-[10px] uppercase font-typewriter tracking-widest px-1.5 py-0.5 rounded bg-[#cf493e]/10 text-[#cf493e] font-bold hidden xs:inline-block">
              Keepsake
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation (Clean, Curated & Uncluttered) ─── */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#68584f]">
          <Link
            href="/templates"
            className="hover:text-[#cf493e] transition-colors flex items-center gap-1.5 py-1 group"
          >
            <Layers className="h-3.5 w-3.5 text-[#cf493e] group-hover:scale-110 transition-transform" />
            <span>Templates</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#cf493e]/10 text-[#cf493e]">
              2
            </span>
          </Link>

          <a
            href="#features"
            className="hover:text-[#cf493e] transition-colors py-1"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="hover:text-[#cf493e] transition-colors py-1"
          >
            How It Works
          </a>

          <a
            href="#occasions"
            className="hover:text-[#cf493e] transition-colors py-1 text-[#8c786a] hover:text-[#cf493e]"
          >
            Occasions
          </a>
        </nav>

        {/* ── Action CTAs (Desktop & Mobile) ────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Desktop Secondary Studio Link */}
          <a
            href="#studio"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#6e584d] hover:text-[#3d332a] hover:bg-white/80 transition-all border border-transparent hover:border-[#e2d0be]"
          >
            <Wand2 className="h-3.5 w-3.5 text-[#cf493e]" />
            <span>Quick Studio</span>
          </a>

          {/* User Profile Pill or Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#4a3a32] border border-[#debfa8] text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                aria-label="User menu"
              >
                <div className="h-5 w-5 rounded-full bg-[#cf493e] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-xs hidden xs:inline">
                  {user.user_metadata?.name || user.email?.split("@")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-[#8c786a] shrink-0" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#ebd8c7] shadow-xl p-2 z-50 text-left animate-fade-down">
                  <div className="px-3 py-2 border-b border-[#f3e7dc] mb-1">
                    <p className="text-[11px] font-bold text-[#2d221e] truncate">
                      {user.user_metadata?.name || "Member"}
                    </p>
                    <p className="text-[10px] text-[#8c786a] font-mono truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#5c4a3e] hover:text-[#cf493e] border border-[#debfa8] text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <UserIcon className="h-3.5 w-3.5 text-[#cf493e] shrink-0" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}

          {/* Primary Action Button */}
          {onLaunchTemplate ? (
            <button
              type="button"
              onClick={handleLaunchClick}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#cf493e] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_16px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_6px_20px_rgba(207,73,62,0.45)] hover:scale-102 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Launch Template</span>
              <span className="sm:hidden font-bold">Create</span>
            </button>
          ) : (
            <Link
              href="/templates"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#cf493e] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_16px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_6px_20px_rgba(207,73,62,0.45)] hover:scale-102 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Launch Template</span>
              <span className="sm:hidden font-bold">Templates</span>
            </Link>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 rounded-xl text-[#5c4b41] hover:text-[#2d221e] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer shrink-0"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform rotate-90 duration-200" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer / Dropdown ───────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#ebdcd0] bg-[#fbf5f0]/98 backdrop-blur-xl px-4 py-5 shadow-xl animate-fade-down max-h-[85dvh] overflow-y-auto pb-safe">
          {/* Templates Quick Cards */}
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9b8577] mb-2 px-1">
              Choose a Template Style
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/scrapbook"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col p-2.5 rounded-xl bg-white border border-[#e8dccf] hover:border-[#cf493e]/40 shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2d221e] mb-0.5">
                  <Camera className="h-3.5 w-3.5 text-[#cf493e]" />
                  <span>Polaroid</span>
                </div>
                <span className="text-[10px] text-[#8c786a] leading-tight">
                  Vol. 01 • Vintage craft
                </span>
              </Link>

              <Link
                href="/book"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col p-2.5 rounded-xl bg-white border border-emerald-600/30 hover:border-emerald-600/60 shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2d221e] mb-0.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Little Book</span>
                </div>
                <span className="text-[10px] text-[#8c786a] leading-tight">
                  Vol. 02 • Spiral desk
                </span>
              </Link>
            </div>
          </div>

          {/* Clean Navigation Links List */}
          <div className="space-y-1 mb-5">
            <Link
              href="/templates"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#5a483e] hover:bg-[#ebdcd0]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#cf493e]" />
                <span>Explore All Templates</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#a89587]" />
            </Link>

            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5a483e] hover:bg-[#ebdcd0]/40 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#d97706]" />
              <span>Features & Highlights</span>
            </a>

            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5a483e] hover:bg-[#ebdcd0]/40 transition-colors"
            >
              <Heart className="h-4 w-4 text-[#cf493e]" />
              <span>How It Works</span>
            </a>

            <a
              href="#occasions"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5a483e] hover:bg-[#ebdcd0]/40 transition-colors"
            >
              <Calendar className="h-4 w-4 text-[#8b5cf6]" />
              <span>Romantic Occasions</span>
            </a>

            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5a483e] hover:bg-[#ebdcd0]/40 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-[#6b7280]" />
              <span>FAQ & Answers</span>
            </a>
          </div>

          {/* User Account State in Mobile Drawer */}
          <div className="mb-4 pt-3 border-t border-[#ebdcd0]">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e8dccf]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2d221e] truncate">
                      {user.user_metadata?.name || "Member"}
                    </p>
                    <p className="text-[10px] text-[#8c786a] font-mono truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#faf4ed] text-[#4a3a32] border border-[#debfa8] text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <UserIcon className="h-4 w-4 text-[#cf493e]" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          {/* Mobile Launch Template Full-Width Button */}
          {onLaunchTemplate ? (
            <button
              type="button"
              onClick={handleLaunchClick}
              className="w-full py-3 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Template</span>
            </button>
          ) : (
            <Link
              href="/templates"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>View Full Template Pages</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
