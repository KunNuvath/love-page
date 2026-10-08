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
} from "lucide-react";

interface NavbarProps {
  onLaunchTemplate?: () => void;
}

export default function Navbar({ onLaunchTemplate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#cf493e] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(207,73,62,0.35)] group-hover:rotate-6 transition-transform shrink-0">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-white" />
          </div>
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Secondary Studio Link */}
          <a
            href="#studio"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#6e584d] hover:text-[#3d332a] hover:bg-white/80 transition-all border border-transparent hover:border-[#e2d0be]"
          >
            <Wand2 className="h-3.5 w-3.5 text-[#cf493e]" />
            <span>Quick Studio</span>
          </a>

          {/* Primary Action Button */}
          {onLaunchTemplate ? (
            <button
              type="button"
              onClick={handleLaunchClick}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#cf493e] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_16px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_6px_20px_rgba(207,73,62,0.45)] hover:scale-102 active:scale-97 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Launch Template</span>
              <span className="sm:hidden font-bold">Launch Template</span>
            </button>
          ) : (
            <Link
              href="/templates"
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#cf493e] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_16px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_6px_20px_rgba(207,73,62,0.45)] hover:scale-102 active:scale-97 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            className="md:hidden p-2 rounded-xl text-[#5c4b41] hover:text-[#2d221e] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer"
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
        <div className="md:hidden border-t border-[#ebdcd0] bg-[#fbf5f0]/98 backdrop-blur-xl px-4 py-5 shadow-xl animate-fade-down">
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
