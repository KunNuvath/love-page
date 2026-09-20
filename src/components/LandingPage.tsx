"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TemplateChooserModal from "@/src/components/TemplateChooserModal";
import {
  Heart,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Music,
  Camera,
  Share2,
  Lock,
  Gift,
  CheckCircle2,
  ChevronDown,
  Compass,
  Smile,
  Send,
  Wand2,
  BookOpen,
  Volume2,
  Calendar,
  Layers,
  HelpCircle,
  Stars,
  Coffee,
  Check,
  Flame,
} from "lucide-react";

// Occasion Presets with pre-filled messages & song suggestions
const OCCASIONS = [
  {
    id: "anniversary",
    badge: "🥂 Anniversary",
    title: "To My Forever Partner",
    subtitle: "Celebrating another year of laughter, growth, and endless love.",
    recipient: "Lina",
    sender: "Miguel",
    songTitle: "Miguel - Sure Thing",
    songSrc: "/music/miguel-sure-thing.mp3",
    message:
      "Every single day with you feels like a gift I didn't know I needed.\nThank you for your laugh, your patience, and the way you make\nordinary moments feel extraordinary. Happy Anniversary, my love!",
    color: "from-rose-500/10 to-amber-500/10",
    borderColor: "border-rose-300",
    accent: "#cf493e",
  },
  {
    id: "valentine",
    badge: "💌 Valentine's Day",
    title: "You Have My Whole Heart",
    subtitle: "A sweet romantic digital letter to make them blush.",
    recipient: "Sophia",
    sender: "Ethan",
    songTitle: "Taylor Swift - Lover",
    songSrc: "/music/miguel-sure-thing.mp3",
    message:
      "Out of all the places in the world, beside you is my favorite.\nYou bring so much warmth, comfort, and joy into my life.\nHappy Valentine's Day to my favorite person!",
    color: "from-pink-500/10 to-rose-500/10",
    borderColor: "border-pink-300",
    accent: "#e05263",
  },
  {
    id: "long-distance",
    badge: "✈️ Long Distance Love",
    title: "Miles Apart, Always In Heart",
    subtitle: "Bridging the distance with memories until the next hug.",
    recipient: "Maya",
    sender: "Leo",
    songTitle: "Stephen Sanchez - Until I Found You",
    songSrc: "/music/miguel-sure-thing.mp3",
    message:
      "Distance means so little when someone means so much.\nCounting down every second until I get to hold your hand again.\nNever forget how deeply you are loved across every mile.",
    color: "from-sky-500/10 to-indigo-500/10",
    borderColor: "border-sky-300",
    accent: "#3b82f6",
  },
  {
    id: "birthday",
    badge: "🎂 Birthday Wishbook",
    title: "Happy Birthday, Sweetheart",
    subtitle: "Honoring the birth of the most amazing person in your universe.",
    recipient: "Elena",
    sender: "Carlos",
    songTitle: "Bruno Mars - Just The Way You Are",
    songSrc: "/music/miguel-sure-thing.mp3",
    message:
      "Wishing the happiest of birthdays to the sweetest soul I know.\nMay this year bring you all the magic and happiness you constantly give to others.\nI'm so lucky to celebrate you today and always!",
    color: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-300",
    accent: "#d97706",
  },
  {
    id: "proposal",
    badge: "💍 Forever & Always",
    title: "The Beginning of Forever",
    subtitle: "A heartfelt storybook commemorating your unforgettable journey.",
    recipient: "Olivia",
    sender: "James",
    songTitle: "Ed Sheeran - Perfect",
    songSrc: "/music/miguel-sure-thing.mp3",
    message:
      "From our very first conversation to this moment, you have been my dream come true.\nI can't wait to build a lifetime of beautiful memories together.\nHere's to our forever.",
    color: "from-purple-500/10 to-rose-500/10",
    borderColor: "border-purple-300",
    accent: "#8b5cf6",
  },
];

// Floating Background Hearts for Landing
function FloatingHeartParticles() {
  const [hearts] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: 5 + i * 9.5 + (i % 2 === 0 ? 2 : -2),
      duration: 12 + (i % 5) * 3,
      delay: (i % 4) * 2.5,
      size: 14 + (i % 3) * 8,
      opacity: 0.15 + (i % 3) * 0.08,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {hearts.map((h) => (
        <Heart
          key={h.id}
          className="floating-heart fill-[#cf493e] text-[#cf493e]"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  // Template Chooser Modal State
  const [isChooserOpen, setIsChooserOpen] = useState(false);

  // Quick Personalization Studio State
  const [partnerName, setPartnerName] = useState("Lina");
  const [yourName, setYourName] = useState("Miguel");
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [customTopic, setCustomTopic] = useState("To the love of my life");
  const [customMessage, setCustomMessage] = useState(
    "Every day with you feels like a gift I didn't know I needed.\nThank you for your laugh, your patience, and the way you make\nordinary moments feel extraordinary. I love you more than words can say."
  );
  const [selectedSong, setSelectedSong] = useState("Miguel - Sure Thing");

  // Interactive Mini Preview audio simulation state
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Handle Occasion Selection in Studio
  const handleSelectOccasion = (occ: (typeof OCCASIONS)[0]) => {
    setSelectedOccasion(occ);
    setCustomTopic(occ.title);
    setCustomMessage(occ.message);
    setSelectedSong(occ.songTitle);
  };

  // Launch Template with customized parameters
  const handleLaunchCustomScrapbook = () => {
    const params = new URLSearchParams({
      to: partnerName.trim() || "My Love",
      from: yourName.trim() || "With Love",
      topic: customTopic.trim() || "To My Love",
      msg: customMessage.trim(),
      songTitle: selectedSong,
      songSrc: selectedOccasion.songSrc,
    });
    router.push(`/scrapbook?${params.toString()}`);
  };

  // Launch a specific preset directly
  const handleLaunchPreset = (occ: (typeof OCCASIONS)[0]) => {
    const params = new URLSearchParams({
      to: partnerName.trim() || occ.recipient,
      from: yourName.trim() || occ.sender,
      topic: occ.title,
      msg: occ.message,
      songTitle: occ.songTitle,
      songSrc: occ.songSrc,
    });
    router.push(`/scrapbook?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-[#f7ebe6] text-[#362e2b] selection:bg-[#cf493e]/20 font-sans overflow-x-hidden">
      <FloatingHeartParticles />

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-102"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#cf493e] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(207,73,62,0.35)] group-hover:rotate-6 transition-transform">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-handwriting text-2xl sm:text-3xl font-bold tracking-tight text-[#2d2420]">
                  LovePage
                </span>
                <span className="text-[10px] uppercase font-typewriter tracking-widest px-1.5 py-0.5 rounded bg-[#cf493e]/10 text-[#cf493e] font-bold">
                  Keepsake
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#68584f]">
            <Link
              href="/templates"
              className="hover:text-[#cf493e] transition-colors flex items-center gap-1"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Templates</span>
            </Link>
            <a
              href="#features"
              className="hover:text-[#cf493e] transition-colors"
            >
              Features
            </a>
            <a
              href="#occasions"
              className="hover:text-[#cf493e] transition-colors"
            >
              Occasions
            </a>
            <a
              href="#studio"
              className="hover:text-[#cf493e] transition-colors"
            >
              Quick Builder
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#cf493e] transition-colors"
            >
              How It Works
            </a>
            <a href="#faq" className="hover:text-[#cf493e] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="#studio"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold text-[#6e584d] hover:text-[#3d332a] hover:bg-white/80 transition-all border border-transparent hover:border-[#e2d0be]"
            >
              <Wand2 className="h-3.5 w-3.5 text-[#cf493e]" />
              <span>Personalize</span>
            </a>

            <button
              type="button"
              onClick={() => setIsChooserOpen(true)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#cf493e] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_16px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_6px_20px_rgba(207,73,62,0.45)] hover:scale-103 active:scale-97 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Template</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-80 glow-romantic -z-10 blur-3xl pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#e8d7c5] shadow-xs mb-6 sm:mb-8 animate-fade-up">
          <Heart className="h-3.5 w-3.5 fill-[#cf493e] text-[#cf493e] animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#5a483e]">
            The Sweetest Digital Keepsakes • 2 Templates Available
          </span>
          <span className="text-xs">✨</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#2d221e] max-w-4xl leading-[1.12] mb-6">
          Turn Your Cherished Moments Into A{" "}
          <span className="font-handwriting font-bold text-5xl sm:text-7xl md:text-8xl text-[#cf493e] inline-block -rotate-1 relative mx-1">
            Timeless Love Story
            <svg
              className="absolute -bottom-2 left-0 w-full text-[#cf493e]/40 h-3"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <path
                d="M0,15 Q50,0 100,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[#6b584d] max-w-2xl leading-relaxed mb-8 sm:mb-10">
          Create a personalized romantic keepsake: choose between our <strong>Retro Polaroid Scrapbook</strong> or the brand new <strong>Spiral Bound Little Book</strong> with 18 photo frames on a craft cutting mat.
        </p>

        {/* Dual Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-14 sm:mb-20">
          <button
            type="button"
            onClick={() => setIsChooserOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#cf493e] text-white font-bold text-base shadow-[0_8px_24px_rgba(207,73,62,0.38)] hover:bg-[#b83b31] hover:shadow-[0_10px_28px_rgba(207,73,62,0.48)] hover:scale-102 active:scale-98 transition-all group cursor-pointer"
          >
            <Sparkles className="h-5 w-5 fill-white group-hover:scale-110 transition-transform" />
            <span>Choose & Launch Template</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/90 text-[#3d332a] font-semibold text-base border border-[#d8c7b4] shadow-sm hover:bg-white hover:border-[#cf493e]/50 hover:shadow-md hover:scale-102 active:scale-98 transition-all"
          >
            <Wand2 className="h-4 w-4 text-[#cf493e]" />
            <span>Quick Personalize & Preview</span>
          </a>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            HERO VISUAL SHOWCASE (Interactive Scrapbook Teaser Card)
        ───────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl relative group">
          {/* Decorative Corner Washi Tapes */}
          <div className="absolute -top-3.5 left-10 w-28 h-7 washi-tape-green -rotate-3 z-20 pointer-events-none hidden sm:block" />
          <div className="absolute -top-3 right-10 w-28 h-7 washi-tape-mauve rotate-6 z-20 pointer-events-none hidden sm:block" />

          {/* Main Showcase Scrapbook Paper Container */}
          <div className="scrapbook-paper rounded-xl p-5 sm:p-8 md:p-10 border border-[#d8c8b4] shadow-[0_20px_50px_rgba(140,70,60,0.18)] text-left relative overflow-hidden transition-all duration-300">
            {/* Header Stamp & Curated By */}
            <div className="flex items-start justify-between border-b border-dashed border-[#cbbeaa] pb-5 mb-6">
              <div>
                <span className="font-handwriting text-2xl sm:text-3xl text-[#36322d]">
                  Curated for {partnerName}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-typewriter text-[10px] sm:text-xs font-bold tracking-widest px-2 py-0.5 highlighter-badge text-[#2c475d] rounded">
                    VOL. 01 / ORIGINAL
                  </span>
                  <span className="text-xs text-[#7d6c5e]">
                    • by {yourName}
                  </span>
                </div>
              </div>

              {/* MEMORIES Stamp */}
              <div className="inline-block -rotate-6 px-3 py-1 stamp-memories">
                <span className="font-typewriter text-xs font-bold tracking-widest block">
                  MEMORIES
                </span>
              </div>
            </div>

            {/* 3 Interactive Polaroid Teaser Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 my-6">
              {/* Polaroid 1 */}
              <div className="polaroid-card p-2.5 pb-4 rounded-[3px] -rotate-1 group/card hover:rotate-0 transition-transform">
                <div className="aspect-[4/3.5] bg-linear-to-br from-rose-100 to-amber-100 rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-4 text-center border border-[#e4dcce] relative">
                  <Camera className="h-7 w-7 text-[#cf493e]/70 mb-1 group-hover/card:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[#7d675b]">
                    Our First Date
                  </span>
                  <span className="text-[10px] text-[#a8988d]">
                    Paris, Autumn
                  </span>
                </div>
                <p className="mt-2 text-center font-handwriting text-lg text-[#332b27]">
                  Us • Forever
                </p>
              </div>

              {/* Polaroid 2 (Center) */}
              <div className="polaroid-card p-2.5 pb-4 rounded-[3px] rotate-2 group/card hover:rotate-0 transition-transform">
                <div className="aspect-[4/3.5] bg-linear-to-br from-pink-100 to-rose-200 rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-4 text-center border border-[#e4dcce] relative">
                  <Heart className="h-7 w-7 fill-[#cf493e]/80 text-[#cf493e] mb-1 group-hover/card:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[#7d675b]">
                    Sweet Moments
                  </span>
                  <span className="text-[10px] text-[#a8988d]">
                    Sunset Walk
                  </span>
                </div>
                <p className="mt-2 text-center font-handwriting text-lg text-[#332b27]">
                  My Safe Place
                </p>
              </div>

              {/* Polaroid 3 */}
              <div className="polaroid-card p-2.5 pb-4 rounded-[3px] -rotate-2 group/card hover:rotate-0 transition-transform">
                <div className="aspect-[4/3.5] bg-linear-to-br from-amber-100 to-yellow-100 rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-4 text-center border border-[#e4dcce] relative">
                  <Coffee className="h-7 w-7 text-amber-700/70 mb-1 group-hover/card:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[#7d675b]">
                    Laughs & Coffee
                  </span>
                  <span className="text-[10px] text-[#a8988d]">Sunday 10 AM</span>
                </div>
                <p className="mt-2 text-center font-handwriting text-lg text-[#332b27]">
                  Endless Laughs
                </p>
              </div>
            </div>

            {/* Teaser Love Letter Snippet */}
            <div className="my-5 p-4 sm:p-5 rounded-lg bg-[#fffdfa]/90 border border-dashed border-[#d8c8b4]">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="h-4 w-4 fill-[#cf493e] text-[#cf493e]" />
                <span className="font-handwriting text-xl text-[#36322d]">
                  {customTopic}, {partnerName}
                </span>
              </div>
              <p className="font-handwriting text-base sm:text-lg text-[#554a41] line-clamp-2 leading-relaxed">
                {customMessage}
              </p>
              <div className="text-right mt-1">
                <span className="font-handwriting text-base text-[#cf493e]">
                  — with all my love, {yourName}
                </span>
              </div>
            </div>

            {/* Interactive Music Player Bar Preview */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white/95 border border-[#e4d6c4] shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                  className="h-10 w-10 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-md hover:bg-[#b83b31] transition-transform active:scale-95 cursor-pointer"
                  title={isDemoPlaying ? "Pause preview" : "Play preview"}
                >
                  {isDemoPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white translate-x-0.5" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Music className="h-3 w-3 text-[#cf493e]" />
                    <span className="font-typewriter text-xs font-bold uppercase text-[#3d332a]">
                      {selectedSong}
                    </span>
                  </div>
                  <span className="font-handwriting text-xs text-[#7e6d5e]">
                    {isDemoPlaying ? "Playing sample melody 🎶" : "Click to preview sound vibes"}
                  </span>
                </div>
              </div>

              {/* Animated Sound Wave Bars */}
              <div className="flex items-center gap-1.5 h-6 px-3">
                <div
                  className={`w-1 rounded-full bg-[#cf493e] ${
                    isDemoPlaying ? "animate-wave-1" : "h-2 opacity-50"
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-[#cf493e] ${
                    isDemoPlaying ? "animate-wave-2" : "h-3 opacity-50"
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-[#cf493e] ${
                    isDemoPlaying ? "animate-wave-3" : "h-1.5 opacity-50"
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-[#cf493e] ${
                    isDemoPlaying ? "animate-wave-4" : "h-3.5 opacity-50"
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-[#cf493e] ${
                    isDemoPlaying ? "animate-wave-2" : "h-2 opacity-50"
                  }`}
                />
              </div>

              {/* Jump into template button */}
              <Link
                href="/scrapbook"
                className="text-xs font-semibold text-[#cf493e] hover:text-[#a83329] flex items-center gap-1 group/btn"
              >
                <span>View Full Screen</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE "QUICK BUILDER & PREVIEW STUDIO"
      ───────────────────────────────────────────────────────────── */}
      <section
        id="studio"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-white/70 border-y border-[#eddcca] relative"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
              <Wand2 className="h-3.5 w-3.5" />
              <span>Instant Personalization</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d221e] tracking-tight mb-4">
              Customize Your Love Page in Seconds
            </h2>
            <p className="text-[#68584f] text-sm sm:text-base leading-relaxed">
              Type your partner's name, choose an occasion or custom message, and
              test drive your page immediately.
            </p>
          </div>

          {/* Builder Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 bg-[#faf7f2] p-6 sm:p-8 rounded-2xl border border-[#e5d7c6] shadow-xs space-y-6">
              {/* Partner Names Inputs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a685e] mb-2">
                  1. Who is this special page for?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-xs text-[#8c776b] mb-1">
                      Recipient / Partner&apos;s Name
                    </span>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Lina"
                      className="w-full px-4 py-2.5 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 shadow-xs"
                    />
                  </div>

                  <div>
                    <span className="block text-xs text-[#8c776b] mb-1">
                      Your Name / Sender
                    </span>
                    <input
                      type="text"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                      placeholder="e.g. Miguel"
                      className="w-full px-4 py-2.5 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Occasion Presets Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a685e] mb-2">
                  2. Choose an Occasion or Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {OCCASIONS.map((occ) => {
                    const isSelected = selectedOccasion.id === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => handleSelectOccasion(occ)}
                        className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all text-xs font-medium cursor-pointer ${
                          isSelected
                            ? "bg-[#cf493e] text-white border-[#cf493e] shadow-md scale-102"
                            : "bg-white text-[#4a3f38] border-[#e0d0bf] hover:bg-[#fff9f4] hover:border-[#cf493e]/40"
                        }`}
                      >
                        <span className="block font-bold">{occ.badge}</span>
                        <span
                          className={`text-[11px] line-clamp-1 mt-0.5 ${
                            isSelected ? "text-white/80" : "text-[#8a766a]"
                          }`}
                        >
                          {occ.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Love Letter Topic & Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a685e] mb-2">
                  3. Letter Heading & Love Message
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. To the love of my life"
                    className="w-full px-4 py-2 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] font-handwriting text-xl focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40"
                  />

                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Write your personal romantic words..."
                    className="w-full px-4 py-2.5 rounded-lg border border-[#d8c8b4] bg-white text-[#443831] font-handwriting text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 resize-y"
                  />
                </div>
              </div>

              {/* Song Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a685e] mb-2">
                  4. Background Love Song
                </label>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-[#cf493e]" />
                  <input
                    type="text"
                    value={selectedSong}
                    onChange={(e) => setSelectedSong(e.target.value)}
                    placeholder="Song Title (e.g. Miguel - Sure Thing)"
                    className="flex-1 px-4 py-2 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] text-xs font-typewriter uppercase focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40"
                  />
                </div>
              </div>

              {/* Launch CTA */}
              <button
                type="button"
                onClick={handleLaunchCustomScrapbook}
                className="w-full py-4 rounded-xl bg-[#cf493e] text-white font-bold text-base tracking-wide shadow-[0_6px_20px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_8px_25px_rgba(207,73,62,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="h-5 w-5" />
                <span>Launch My Custom Scrapbook →</span>
              </button>
            </div>

            {/* Right Column: Live Interactive Preview Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full scrapbook-paper p-6 sm:p-7 rounded-xl border border-[#d8c8b4] shadow-lg sticky top-28">
                {/* Washi tape sticker */}
                <div className="w-24 h-6 washi-tape-green mx-auto -mt-9 mb-4 -rotate-2" />

                <div className="flex items-center justify-between border-b border-dashed border-[#cbbeaa] pb-3 mb-4">
                  <span className="font-handwriting text-2xl text-[#36322d]">
                    Curated for {partnerName || "Lina"}
                  </span>
                  <div className="px-2 py-0.5 stamp-memories text-[10px] font-bold font-typewriter">
                    VOL. 01
                  </div>
                </div>

                {/* 2 Mini Polaroids Sample */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="polaroid-card p-2 rounded-[2px] -rotate-2">
                    <div className="aspect-[4/3.5] bg-rose-100 rounded flex items-center justify-center">
                      <Camera className="h-5 w-5 text-[#cf493e]" />
                    </div>
                    <p className="mt-1 text-center font-handwriting text-sm text-[#332b27]">
                      Us
                    </p>
                  </div>
                  <div className="polaroid-card p-2 rounded-[2px] rotate-2">
                    <div className="aspect-[4/3.5] bg-amber-100 rounded flex items-center justify-center">
                      <Heart className="h-5 w-5 fill-[#cf493e] text-[#cf493e]" />
                    </div>
                    <p className="mt-1 text-center font-handwriting text-sm text-[#332b27]">
                      Forever
                    </p>
                  </div>
                </div>

                {/* Letter Box */}
                <div className="p-4 rounded bg-[#fffefc] border border-dashed border-[#d8c8b4] mb-4">
                  <h4 className="font-handwriting text-lg text-[#332b27] mb-1">
                    {customTopic || "To My Love"}, {partnerName || "Lina"}
                  </h4>
                  <p className="font-handwriting text-sm text-[#5a4d44] line-clamp-4 leading-relaxed whitespace-pre-line">
                    {customMessage || "I love you with all my heart."}
                  </p>
                  <p className="font-handwriting text-sm text-right text-[#cf493e] mt-2">
                    — {yourName || "Miguel"}
                  </p>
                </div>

                {/* Music preview */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#e4d6c4] text-xs">
                  <div className="flex items-center gap-2">
                    <Music className="h-3.5 w-3.5 text-[#cf493e]" />
                    <span className="font-typewriter uppercase text-[11px] font-bold line-clamp-1">
                      {selectedSong}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8e7d70]">Ready 🎵</span>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleLaunchCustomScrapbook}
                    className="text-xs font-bold text-[#cf493e] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Click to open full page with this data</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CURATED OCCASIONS & PRESETS SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="occasions"
        className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
            <Gift className="h-3.5 w-3.5" />
            <span>Ready-Made Themes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d221e] tracking-tight mb-4">
            Perfect for Every Romantic Moment
          </h2>
          <p className="text-[#68584f] text-sm sm:text-base leading-relaxed">
            Choose from curated romantic milestones. Click any theme to
            instantly preview and make it yours.
          </p>
        </div>

        {/* Occasions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {OCCASIONS.map((occ) => (
            <div
              key={occ.id}
              className="glass-panel p-6 sm:p-7 rounded-2xl border border-[#e5d7c7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-[#332b27] border border-[#e2d2c1] shadow-2xs">
                    {occ.badge}
                  </span>
                  <Heart className="h-4 w-4 text-[#cf493e] group-hover:scale-125 transition-transform" />
                </div>

                <h3 className="text-xl font-bold text-[#2d221e] mb-2">
                  {occ.title}
                </h3>
                <p className="text-xs text-[#7d6c60] mb-4">{occ.subtitle}</p>

                {/* Love Note Preview */}
                <div className="p-4 rounded-xl bg-white/80 border border-dashed border-[#d8c8b4] mb-4">
                  <p className="font-handwriting text-base text-[#4a3f37] line-clamp-3 leading-relaxed">
                    &ldquo;{occ.message}&rdquo;
                  </p>
                </div>

                {/* Song info */}
                <div className="flex items-center gap-2 text-xs text-[#6e5e52] font-typewriter mb-6">
                  <Music className="h-3.5 w-3.5 text-[#cf493e]" />
                  <span className="uppercase text-[11px]">{occ.songTitle}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleLaunchPreset(occ)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#cf493e] text-[#cf493e] hover:text-white font-semibold text-xs border border-[#cf493e]/40 hover:border-transparent shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Launch This Preset</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Create Custom Card */}
          <div className="p-6 sm:p-7 rounded-2xl border-2 border-dashed border-[#cf493e]/40 bg-[#cf493e]/5 flex flex-col items-center justify-center text-center hover:bg-[#cf493e]/10 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#cf493e] text-white flex items-center justify-center mb-3 shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d221e] mb-1">
              Have A Unique Story?
            </h3>
            <p className="text-xs text-[#6e5e52] mb-4 max-w-xs">
              Choose from our curated templates: classic polaroids or spiral journal.
            </p>
            <button
              type="button"
              onClick={() => setIsChooserOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#cf493e] text-white text-xs font-bold hover:bg-[#b83b31] transition-all cursor-pointer shadow-md"
            >
              Explore All Templates
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CORE FEATURES SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f5e6e0] border-t border-[#ebd9c7]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
              <Layers className="h-3.5 w-3.5" />
              <span>Thoughtfully Crafted</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d221e] tracking-tight mb-4">
              Everything to Make Their Heart Melt
            </h2>
            <p className="text-[#68584f] text-sm sm:text-base leading-relaxed">
              Designed to combine retro analog scrapbook nostalgia with smooth,
              interactive modern web features.
            </p>
          </div>

          {/* 6 Feature Highlights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#e4d4c3] shadow-xs hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-[#cf493e]/15 text-[#cf493e] flex items-center justify-center mb-4">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2d221e] mb-2">
                Vintage Polaroid Wall
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                6 rotatable polaroid frames with 1-click photo uploads, zoom
                lightboxes, and customizable handwritten captions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#e4d4c3] shadow-xs hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center mb-4">
                <Music className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2d221e] mb-2">
                Melody of Your Journey
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                Integrated audio player with progress bar and repeat mode. Set
                your couple song to play as they browse your memories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#e4d4c3] shadow-xs hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2d221e] mb-2">
                Handwritten Love Letters
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                Dedicated romantic letter section styled with authentic cursive
                calligraphy typography and personalized sign-off.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#e4d4c3] shadow-xs hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-emerald-600/15 text-emerald-700 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2d221e] mb-2">
                Authentic Scrapbook Texture
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                Crafted with realistic washi tapes, pressed rose stickers,
                vintage &ldquo;MEMORIES&rdquo; ink stamps, and floating heart particles.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#e4d4c3] shadow-xs hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2d221e] mb-2">
                1-Click Sharing Link
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                Generate a personalized share URL instantly. Send it via iMessage,
                WhatsApp, or email and watch their reaction.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#e4d4c3] shadow-xs hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2d221e] mb-2">
                100% Free & Private
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                No subscription, no accounts required. Free to host forever on
                Vercel or Netlify with full privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. HOW IT WORKS (3 Simple Steps)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Effortless Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d221e] tracking-tight mb-4">
            How It Works in 3 Easy Steps
          </h2>
          <p className="text-[#68584f] text-sm sm:text-base leading-relaxed">
            Create a memory page in under two minutes with zero coding required.
          </p>
        </div>

        {/* Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative bg-white/80 p-6 sm:p-8 rounded-2xl border border-[#e2d2c1] shadow-xs flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-[#cf493e] text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md">
              1
            </div>
            <h3 className="text-lg font-bold text-[#2d221e] mb-2">
              Add Your Words & Snaps
            </h3>
            <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
              Enter your partner&apos;s name and write your heartfelt letter. Upload 6
              meaningful photos into the polaroid frames.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white/80 p-6 sm:p-8 rounded-2xl border border-[#e2d2c1] shadow-xs flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-[#cf493e] text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md">
              2
            </div>
            <h3 className="text-lg font-bold text-[#2d221e] mb-2">
              Pick Your Song
            </h3>
            <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
              Select the melody that played on your first dance, favorite road trip,
              or special anniversary.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white/80 p-6 sm:p-8 rounded-2xl border border-[#e2d2c1] shadow-xs flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-[#cf493e] text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md">
              3
            </div>
            <h3 className="text-lg font-bold text-[#2d221e] mb-2">
              Send & Surprise
            </h3>
            <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
              Copy your personalized link and text it to them, or deploy it
              forever to your own web domain for free.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ ACCORDION SECTION
      ───────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f5e6e0] border-t border-[#ebd9c7]"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d221e] tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-[#68584f] text-sm">
              Everything you need to know about customizing and sharing your love page.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {[
              {
                q: "Is LovePage completely free to use and host?",
                a: "Yes! LovePage is 100% free and open-source. You can customize the page directly in your browser, copy a shareable link, or deploy the repository to Vercel/Netlify with one click on their free hobby tiers.",
              },
              {
                q: "How do I add my own photos and music file?",
                a: "You can click on any polaroid card in the scrapbook template to upload photos straight from your device, or drop your image files into the public/photos folder and MP3 files into the public/music folder in the code.",
              },
              {
                q: "Will my custom changes stay saved?",
                a: "Yes! When you customize the template using the 'Edit Page' sidebar and click 'Save Changes', your preferences are stored locally in your browser. Additionally, generating a share link embeds your text and song in the URL.",
              },
              {
                q: "Does this look good on mobile phones?",
                a: "Absolutely! The entire scrapbook layout, polaroid grid, and audio player are fully responsive and look stunning on iPhones, Android phones, tablets, and desktop displays.",
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white/90 rounded-xl border border-[#e2d2c1] overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#332a26] hover:text-[#cf493e] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#8a766a] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#cf493e]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#68574c] leading-relaxed border-t border-[#f0e3d5] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. ROMANTIC FINAL CALL TO ACTION (CTA BANNER)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-linear-to-b from-[#f7ebe6] to-[#eddcca] text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="h-16 w-16 rounded-full bg-[#cf493e] text-white flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(207,73,62,0.4)] animate-pulse-heart">
            <Heart className="h-8 w-8 fill-white" />
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#2d221e] tracking-tight mb-5">
            Ready to Make Your Person Smile?
          </h2>

          <p className="text-base sm:text-xl text-[#68584f] max-w-xl mx-auto leading-relaxed mb-8">
            Create an unforgettable romantic gesture in minutes. Open the
            template and start curating your memories today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setIsChooserOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#cf493e] text-white font-bold text-base shadow-[0_8px_25px_rgba(207,73,62,0.45)] hover:bg-[#b83b31] hover:scale-103 active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              <span>Choose & Launch Template Now</span>
            </button>

            <a
              href="#studio"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/90 text-[#3d332a] font-semibold text-sm border border-[#d8c7b4] hover:bg-white transition-all"
            >
              Customize First
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e2d0bf] bg-[#faf3ed] py-10 px-4 sm:px-6 text-center text-xs text-[#7e6d60]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#cf493e] flex items-center justify-center text-white">
              <Heart className="h-3 w-3 fill-white" />
            </div>
            <span className="font-handwriting text-xl text-[#362e2b] font-bold">
              LovePage Scrapbook & Little Book
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/templates"
              className="hover:text-[#cf493e] transition-colors font-semibold text-[#cf493e]"
            >
              All Templates
            </Link>
            <Link
              href="/book"
              className="hover:text-[#cf493e] transition-colors"
            >
              Little Book (Spiral)
            </Link>
            <Link
              href="/scrapbook"
              className="hover:text-[#cf493e] transition-colors"
            >
              Polaroid Scrapbook
            </Link>
            <a href="#studio" className="hover:text-[#cf493e] transition-colors">
              Quick Builder
            </a>
            <a href="#faq" className="hover:text-[#cf493e] transition-colors">
              FAQ
            </a>
          </div>

          <p className="font-typewriter text-[11px] text-[#9c897c]">
            Crafted with love by Vath • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Template Chooser Modal Dialog */}
      <TemplateChooserModal
        isOpen={isChooserOpen}
        onClose={() => setIsChooserOpen(false)}
      />
    </div>
  );
}

