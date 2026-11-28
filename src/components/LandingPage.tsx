"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TemplateChooserModal from "@/src/components/TemplateChooserModal";
import Navbar from "@/src/components/Navbar";
import BrandLogo from "@/src/components/BrandLogo";
import ContactFeedbackSection from "@/src/components/ContactFeedbackSection";
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
  Mail,
  Crown,
} from "lucide-react";

interface HomeTemplateCard {
  id: string;
  vol: string;
  name: string;
  subtitle: string;
  href: string;
  tier: "free" | "premium";
  price: string;
  priceNote: string;
  photos: string;
  pages: string;
  highlights: string[];
  accentBg: string;
  accentText: string;
  cardBg: string;
  cardText: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  previewStyle:
    | "polaroid"
    | "spiral"
    | "adventure"
    | "album"
    | "flipbook"
    | "lovestory"
    | "anniversary";
}

const HOME_TEMPLATES: HomeTemplateCard[] = [
  {
    id: "polaroid-scrapbook",
    vol: "Vol. 01",
    name: "Retro Polaroid Scrapbook",
    subtitle: "Classic craft paper with 6 rotatable polaroids, handwritten love letter & couple song player.",
    href: "/scrapbook",
    tier: "free",
    price: "Free",
    priceNote: "100% Free Forever",
    photos: "6 Photos",
    pages: "Single Sheet",
    highlights: ["6 rotatable polaroid frames", "Background couple song player", "Cursive love letter & ink stamps"],
    accentBg: "bg-[#cf493e] hover:bg-[#b53a30]",
    accentText: "text-white",
    cardBg: "bg-[#fbf6ec]",
    cardText: "text-[#2d221e]",
    borderColor: "border-[#d8c3a8]",
    badgeBg: "bg-emerald-700/12",
    badgeText: "text-emerald-800",
    previewStyle: "polaroid",
  },
  {
    id: "little-book",
    vol: "Vol. 02",
    name: "Our Little Book",
    subtitle: "Cutting-mat desk spiral journal with 17-hole metal coil, 4 tab spreads & 6 washi tape patterns.",
    href: "/book",
    tier: "free",
    price: "Free",
    priceNote: "100% Free Forever",
    photos: "18 Photos",
    pages: "4 Spreads",
    highlights: ["18 interactive photo frames", "Cutting-mat desk & spiral coil", "Custom song & 30s trimmer"],
    accentBg: "bg-[#2f6b58] hover:bg-[#245445]",
    accentText: "text-white",
    cardBg: "bg-[#fbf6ec]",
    cardText: "text-[#2d221e]",
    borderColor: "border-[#2f6b58]/40",
    badgeBg: "bg-emerald-700/12",
    badgeText: "text-emerald-800",
    previewStyle: "spiral",
  },
  {
    id: "adventure-scrapbook",
    vol: "Vol. 03",
    name: "Our Little Adventure",
    subtitle: "Torn kraft-paper travel collage on deep navy with ransom-note letters & THE DAILY US newspaper.",
    href: "/adventure",
    tier: "premium",
    price: "$4.99",
    priceNote: "One-time unlock",
    photos: "6 Cutouts",
    pages: "Scroll Story",
    highlights: ["Torn, Circle, Ticket, Film, Arch & Heart", "Editable THE DAILY US newspaper", "Scroll-following heart journey path"],
    accentBg: "bg-[#f7d56a] hover:bg-[#ecc44b]",
    accentText: "text-[#1d2742]",
    cardBg: "bg-[#24395f]",
    cardText: "text-[#fbf6ea]",
    borderColor: "border-[#1d2742]",
    badgeBg: "bg-[#f7d56a]",
    badgeText: "text-[#1d2742]",
    previewStyle: "adventure",
  },
  {
    id: "family-album",
    vol: "Vol. 04",
    name: "Scrapbook Album",
    subtitle: "Soft 9-page 3D flip photo album with scalloped borders, clothesline pegs & FAMILY photo-letters.",
    href: "/album",
    tier: "premium",
    price: "$4.99",
    priceNote: "One-time unlock",
    photos: "30+ Photos",
    pages: "9 3D Pages",
    highlights: ["1s double-sided 3D page turns", "Clothesline pegs & photo-clipped letters", "Public link + secret owner edit URL"],
    accentBg: "bg-[#4a3f38] hover:bg-[#362d28]",
    accentText: "text-[#faf6ef]",
    cardBg: "bg-[#f9f3e7]",
    cardText: "text-[#4a3f38]",
    borderColor: "border-[#8aa67c]",
    badgeBg: "bg-[#8aa67c]",
    badgeText: "text-white",
    previewStyle: "album",
  },
  {
    id: "love-story",
    vol: "Vol. 06",
    name: "Love Story",
    subtitle: "12-page 9:16 portrait vintage flipbook on burgundy plaid, wine corduroy, film strip & parchment.",
    href: "/love-story",
    tier: "premium",
    price: "$5.99",
    priceNote: "One-time unlock",
    photos: "18 Photos",
    pages: "12 3D Pages",
    highlights: ["18 antique stickers (cassette, ticket, moon)", "Film strip, taped polaroids & playlist", "Mobile-first 9:16 portrait fit"],
    accentBg: "bg-[#c9a24a] hover:bg-[#d8b35b]",
    accentText: "text-[#2a070c]",
    cardBg: "bg-[#3a0c13]",
    cardText: "text-[#f2e7d0]",
    borderColor: "border-[#c9a24a]/70",
    badgeBg: "bg-[#c9a24a]",
    badgeText: "text-[#2a070c]",
    previewStyle: "lovestory",
  },
  {
    id: "anniversary-velvet",
    vol: "Vol. 07",
    name: "1 Year With You",
    subtitle: "Closed wine-velvet 3D flipbook on stone plaster with 8 bespoke spreads, lace heart, ring binder & star-map.",
    href: "/anniversary",
    tier: "premium",
    price: "$7.99",
    priceNote: "Velvet one-time",
    photos: "38 Photos",
    pages: "16 3D Pages",
    highlights: ["Closed velvet cover → 8 spreads → back", "Corduroy lace heart & metal ring binder", "Olive star-map & striped fabric finale"],
    accentBg: "bg-[#e5c678] hover:bg-[#edd38e]",
    accentText: "text-[#2a0a0f]",
    cardBg: "bg-[#54121b]",
    cardText: "text-[#f4ecdc]",
    borderColor: "border-[#e5c678]/75",
    badgeBg: "bg-[#e5c678]",
    badgeText: "text-[#2a0a0f]",
    previewStyle: "anniversary",
  },
  {
    id: "love-flipbook",
    vol: "Vol. 05",
    name: "Love Flipbook",
    subtitle: "Heirloom 16-page open leather-bound scrapbook with 8 spreads, lace borders & 9-polaroid wishlist.",
    href: "/flipbook",
    tier: "premium",
    price: "$9.99",
    priceNote: "Deluxe one-time",
    photos: "37 Photos",
    pages: "16 3D Pages",
    highlights: ["8 open 3D leather spreads & 37 slots", "B&W photobooth strip & heart cutouts", "Batch photo upload + secret edit link"],
    accentBg: "bg-[#e6c26a] hover:bg-[#d9b255]",
    accentText: "text-[#2a1209]",
    cardBg: "bg-[#2a1209]",
    cardText: "text-[#f4e9dc]",
    borderColor: "border-[#e6c26a]/70",
    badgeBg: "bg-[#e6c26a]",
    badgeText: "text-[#2a1209]",
    previewStyle: "flipbook",
  },
];

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
  const [templateFilter, setTemplateFilter] = useState<"all" | "free" | "premium">("all");

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
    <div className="relative min-h-screen vintage-grid-bg text-[#362e2b] selection:bg-[#cf493e]/20 font-sans overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 vintage-grain-overlay opacity-70 z-0" />
      <FloatingHeartParticles />

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <Navbar onLaunchTemplate={() => setIsChooserOpen(true)} />

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Vintage Editorial Keepsake)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-14 pb-12 sm:pb-20 px-4 xs:px-5 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center overflow-hidden z-10">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-80 glow-romantic -z-10 blur-3xl pointer-events-none" />

        {/* Top Vintage Stamp Badge */}
        <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#fbf6ec]/95 border border-[#d6bfa2] shadow-xs mb-5 sm:mb-7 animate-fade-up max-w-full">
          <Heart className="h-3.5 w-3.5 fill-[#cf493e] text-[#cf493e] animate-pulse shrink-0" />
          <span className="font-typewriter text-[11px] xs:text-xs sm:text-xs font-bold tracking-wider uppercase text-[#5a4236] truncate">
            Vintage Keepsake Studio • 7 Templates • Free – $9.99
          </span>
          <span className="text-xs shrink-0">✦</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl xs:text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#2b1f1a] max-w-4xl leading-[1.18] sm:leading-[1.1] mb-5 sm:mb-6 px-1">
          Craft A Vintage Digital{" "}
          <span className="font-handwriting font-bold text-3xl xs:text-4xl sm:text-7xl md:text-8xl text-[#cf493e] inline-block -rotate-1 relative mx-0.5 sm:mx-1">
            Love Scrapbook
            <svg
              className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full text-[#cf493e]/40 h-2.5 sm:h-3"
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
        <p className="text-xs xs:text-sm sm:text-lg text-[#624f43] max-w-2xl leading-relaxed mb-7 sm:mb-9 px-2">
          Seven handcrafted analog-inspired keepsakes — from <strong>2 Free Scrapbooks</strong> to our <strong>3D Page-Flipping Velvet &amp; Leather Flipbooks</strong> ($4.99–$9.99 one-time, no subscriptions).
        </p>

        {/* Dual Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto mb-10 sm:mb-16 max-w-sm sm:max-w-none px-1">
          <a
            href="#collection"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#4a0f17] text-[#f2e7d0] font-bold text-xs xs:text-sm sm:text-base border border-[#c9a24a]/60 shadow-[0_10px_24px_rgba(74,15,23,0.32)] hover:bg-[#5e141f] hover:scale-102 active:scale-95 transition-all group cursor-pointer"
          >
            <Layers className="h-4 w-4 text-[#c9a24a] shrink-0" />
            <span>Browse 7 Templates &amp; Pricing</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>

          <a
            href="#studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#fbf6ec] text-[#3d2e26] font-semibold text-xs xs:text-sm sm:text-base border border-[#d6bfa2] shadow-xs hover:bg-white hover:border-[#cf493e]/50 hover:shadow-md hover:scale-102 active:scale-95 transition-all"
          >
            <Wand2 className="h-4 w-4 text-[#cf493e] shrink-0" />
            <span>Quick Personalize Free</span>
          </a>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            HERO VISUAL SHOWCASE (Interactive Scrapbook Teaser Card)
        ───────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-[92vw] xs:max-w-[92vw] sm:max-w-4xl mx-auto relative group">
          {/* Decorative Corner Washi Tapes */}
          <div className="absolute -top-3.5 left-10 w-28 h-7 washi-tape-green -rotate-3 z-20 pointer-events-none hidden sm:block" />
          <div className="absolute -top-3 right-10 w-28 h-7 washi-tape-mauve rotate-6 z-20 pointer-events-none hidden sm:block" />

          {/* Main Showcase Scrapbook Paper Container */}
          <div className="scrapbook-paper rounded-xl p-4 xs:p-5 sm:p-8 md:p-10 border border-[#d8c8b4] shadow-[0_20px_50px_rgba(140,70,60,0.18)] text-left relative overflow-hidden transition-all duration-300">
            {/* Header Stamp & Curated By */}
            <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#cbbeaa] pb-4 sm:pb-5 mb-5 sm:mb-6">
              <div className="min-w-0">
                <span className="font-handwriting text-xl xs:text-2xl sm:text-3xl text-[#36322d] block truncate">
                  Curated for {partnerName}
                </span>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-typewriter text-[9px] xs:text-[10px] sm:text-xs font-bold tracking-widest px-2 py-0.5 highlighter-badge text-[#2c475d] rounded">
                    VOL. 01 / ORIGINAL
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#7d6c5e] truncate">
                    • by {yourName}
                  </span>
                </div>
              </div>

              {/* MEMORIES Stamp */}
              <div className="inline-block -rotate-6 px-2 sm:px-2.5 py-1 stamp-memories shrink-0">
                <span className="font-typewriter text-[9px] xs:text-xs font-bold tracking-widest block">
                  MEMORIES
                </span>
              </div>
            </div>

            {/* 3 Interactive Polaroid Teaser Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 my-4 sm:my-6 px-1 sm:px-0">
              {/* Polaroid 1 */}
              <div className="polaroid-card p-2.5 sm:p-2.5 pb-3.5 sm:pb-4 rounded-[3px] -rotate-1 group/card hover:rotate-0 transition-transform">
                <div className="aspect-[4/3.2] bg-gradient-to-br from-rose-100 to-amber-100 rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-[#e4dcce] relative">
                  <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-[#cf493e]/70 mb-1 group-hover/card:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[#7d675b]">
                    Our First Date
                  </span>
                  <span className="text-[10px] text-[#a8988d]">
                    Paris, Autumn
                  </span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-center font-handwriting text-base sm:text-lg text-[#332b27]">
                  Us • Forever
                </p>
              </div>

              {/* Polaroid 2 (Center) */}
              <div className="polaroid-card p-2.5 sm:p-2.5 pb-3.5 sm:pb-4 rounded-[3px] rotate-1 sm:rotate-2 group/card hover:rotate-0 transition-transform">
                <div className="aspect-[4/3.2] bg-gradient-to-br from-pink-100 to-rose-200 rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-[#e4dcce] relative">
                  <Heart className="h-6 w-6 sm:h-7 sm:w-7 fill-[#cf493e]/80 text-[#cf493e] mb-1 group-hover/card:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[#7d675b]">
                    Sweet Moments
                  </span>
                  <span className="text-[10px] text-[#a8988d]">
                    Sunset Walk
                  </span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-center font-handwriting text-base sm:text-lg text-[#332b27]">
                  My Safe Place
                </p>
              </div>

              {/* Polaroid 3 */}
              <div className="polaroid-card p-2.5 sm:p-2.5 pb-3.5 sm:pb-4 rounded-[3px] -rotate-1 sm:-rotate-2 group/card hover:rotate-0 transition-transform">
                <div className="aspect-[4/3.2] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-[#e4dcce] relative">
                  <Coffee className="h-6 w-6 sm:h-7 sm:w-7 text-amber-700/70 mb-1 group-hover/card:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[#7d675b]">
                    Laughs & Coffee
                  </span>
                  <span className="text-[10px] text-[#a8988d]">Sunday 10 AM</span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-center font-handwriting text-base sm:text-lg text-[#332b27]">
                  Endless Laughs
                </p>
              </div>
            </div>

            {/* Teaser Love Letter Snippet */}
            <div className="my-4 sm:my-5 p-3.5 sm:p-5 rounded-lg bg-[#fffdfa]/90 border border-dashed border-[#d8c8b4]">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="h-4 w-4 fill-[#cf493e] text-[#cf493e] shrink-0" />
                <span className="font-handwriting text-lg sm:text-xl text-[#36322d] truncate">
                  {customTopic}, {partnerName}
                </span>
              </div>
              <p className="font-handwriting text-sm sm:text-lg text-[#554a41] line-clamp-3 leading-relaxed">
                {customMessage}
              </p>
              <div className="text-right mt-1.5">
                <span className="font-handwriting text-sm sm:text-base text-[#cf493e]">
                  — with all my love, {yourName}
                </span>
              </div>
            </div>

            {/* Interactive Music Player Bar Preview */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-white/95 border border-[#e4d6c4] shadow-xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                  className="h-10 w-10 shrink-0 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-md hover:bg-[#b83b31] transition-transform active:scale-95 cursor-pointer"
                  title={isDemoPlaying ? "Pause preview" : "Play preview"}
                >
                  {isDemoPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white translate-x-0.5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Music className="h-3 w-3 text-[#cf493e] shrink-0" />
                    <span className="font-typewriter text-[11px] sm:text-xs font-bold uppercase text-[#3d332a] truncate">
                      {selectedSong}
                    </span>
                  </div>
                  <span className="font-handwriting text-xs text-[#7e6d5e] block truncate">
                    {isDemoPlaying ? "Playing sample melody 🎶" : "Click to preview sound vibes"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#f0e4d7]">
                {/* Animated Sound Wave Bars */}
                <div className="flex items-center gap-1 h-5 px-2">
                  <div className={`w-1 rounded-full bg-[#cf493e] ${isDemoPlaying ? "animate-wave-1" : "h-2 opacity-50"}`} />
                  <div className={`w-1 rounded-full bg-[#cf493e] ${isDemoPlaying ? "animate-wave-2" : "h-3 opacity-50"}`} />
                  <div className={`w-1 rounded-full bg-[#cf493e] ${isDemoPlaying ? "animate-wave-3" : "h-1.5 opacity-50"}`} />
                  <div className={`w-1 rounded-full bg-[#cf493e] ${isDemoPlaying ? "animate-wave-4" : "h-3.5 opacity-50"}`} />
                  <div className={`w-1 rounded-full bg-[#cf493e] ${isDemoPlaying ? "animate-wave-2" : "h-2 opacity-50"}`} />
                </div>

                {/* Jump into template button */}
                <Link
                  href="/scrapbook"
                  className="text-xs font-semibold text-[#cf493e] hover:text-[#a83329] flex items-center gap-1 group/btn shrink-0 py-1"
                >
                  <span>Full Screen</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2B. VINTAGE TEMPLATE COLLECTION & PRICING GRID (ALL 6 VOLUMES)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="collection"
        className="relative z-10 py-14 sm:py-22 px-4 sm:px-6 border-y border-[#dac6ad] bg-[#efe3d1]/85"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#4a0f17]/10 text-[#4a0f17] border border-[#4a0f17]/20 font-typewriter text-[11px] font-bold tracking-widest uppercase mb-3">
              <Crown className="h-3.5 w-3.5 text-[#c9a24a]" />
              <span>Catalogue &amp; One-Time Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2b1f1a] tracking-tight mb-3">
              7 Vintage Templates, Zero Subscriptions
            </h2>
            <p className="text-[#624f43] text-xs sm:text-base leading-relaxed">
              Start with our 2 free scrapbooks or unlock an heirloom 3D flipbook once and keep it forever. Preview any template live before you unlock.
            </p>

            {/* Filter Tabs */}
            <div className="mt-6 inline-flex items-center p-1.5 rounded-2xl bg-[#fbf6ec] border border-[#d6bfa2] shadow-xs gap-1 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setTemplateFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  templateFilter === "all"
                    ? "bg-[#2b1f1a] text-[#fbf6ec] shadow-xs"
                    : "text-[#624f43] hover:text-[#2b1f1a]"
                }`}
              >
                All Volumes (7)
              </button>
              <button
                type="button"
                onClick={() => setTemplateFilter("free")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  templateFilter === "free"
                    ? "bg-[#2f6b58] text-white shadow-xs"
                    : "text-[#624f43] hover:text-[#2f6b58]"
                }`}
              >
                Free (2)
              </button>
              <button
                type="button"
                onClick={() => setTemplateFilter("premium")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  templateFilter === "premium"
                    ? "bg-[#4a0f17] text-[#f2e7d0] shadow-xs"
                    : "text-[#4a0f17] hover:bg-[#4a0f17]/10"
                }`}
              >
                <Crown className="h-3.5 w-3.5 text-[#c9a24a] fill-[#c9a24a]" />
                <span>Premium • $4.99–$9.99 (5)</span>
              </button>
            </div>
          </div>

          {/* 3-Column Vintage Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {HOME_TEMPLATES.filter((t) =>
              templateFilter === "all" ? true : t.tier === templateFilter
            ).map((tpl) => {
              const isDark =
                tpl.previewStyle === "adventure" ||
                tpl.previewStyle === "lovestory" ||
                tpl.previewStyle === "anniversary" ||
                tpl.previewStyle === "flipbook";
              return (
                <div
                  key={tpl.id}
                  className={`rounded-2xl p-5 sm:p-6 border-2 ${tpl.cardBg} ${tpl.cardText} ${tpl.borderColor} shadow-[0_14px_32px_-12px_rgba(43,31,26,0.28)] hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden group`}
                >
                  <div>
                    {/* Top Vol + Vintage Price Stamp */}
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`font-typewriter text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tpl.badgeBg} ${tpl.badgeText}`}
                        >
                          {tpl.vol} • {tpl.pages}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-typewriter text-sm sm:text-base font-extrabold px-2.5 py-0.5 rounded-md border border-dashed ${
                            isDark
                              ? "border-[#e6c26a]/70 bg-black/25 text-[#f7d56a]"
                              : "border-[#cf493e]/50 bg-white/80 text-[#cf493e]"
                          }`}
                        >
                          {tpl.price}
                        </span>
                        <span
                          className={`block text-[10px] mt-0.5 ${
                            isDark ? "text-white/65" : "text-[#7a675a]"
                          }`}
                        >
                          {tpl.priceNote}
                        </span>
                      </div>
                    </div>

                    {/* Mini Aesthetic Preview Strip */}
                    <div
                      className={`h-24 rounded-xl mb-4 p-2.5 border relative overflow-hidden flex items-center justify-between gap-2 ${
                        tpl.previewStyle === "polaroid"
                          ? "bg-[#f6ede0] border-dashed border-[#cbbeaa]"
                          : tpl.previewStyle === "spiral"
                            ? "bg-[#2f6b58] border-[#1f4f40]"
                            : tpl.previewStyle === "adventure"
                              ? "bg-[#d3b088] border-[#1d2742]"
                              : tpl.previewStyle === "album"
                                ? "bg-[#efe6d8] border-[#8aa67c]/40"
                                : tpl.previewStyle === "lovestory"
                                  ? "bg-[#1a0508] border-[#c9a24a]/40"
                                  : "bg-[#1b0b06] border-[#e6c26a]/40"
                      }`}
                    >
                      {tpl.previewStyle === "polaroid" && (
                        <div className="grid grid-cols-3 gap-1.5 w-full">
                          <div className="bg-white p-1 rounded-xs shadow-2xs -rotate-2 text-center">
                            <div className="h-10 bg-rose-100 rounded-2xs mb-0.5" />
                            <span className="font-handwriting text-[10px] text-[#332b27]">First Date</span>
                          </div>
                          <div className="bg-white p-1 rounded-xs shadow-2xs rotate-2 text-center">
                            <div className="h-10 bg-amber-100 rounded-2xs mb-0.5" />
                            <span className="font-handwriting text-[10px] text-[#332b27]">Us</span>
                          </div>
                          <div className="bg-white p-1 rounded-xs shadow-2xs -rotate-1 text-center">
                            <div className="h-10 bg-pink-100 rounded-2xs mb-0.5" />
                            <span className="font-handwriting text-[10px] text-[#332b27]">Always</span>
                          </div>
                        </div>
                      )}

                      {tpl.previewStyle === "spiral" && (
                        <div className="flex items-center w-full h-full bg-[#fbfaf4] rounded-xs p-2 text-[10px] text-[#2d221e]">
                          <div className="flex-1 text-center border-r border-dashed border-neutral-300 pr-2">
                            <span className="font-bold">Hello, You</span>
                            <div className="h-7 bg-amber-100 rounded-2xs mt-1" />
                          </div>
                          <div className="flex-1 text-center pl-2">
                            <div className="h-7 bg-teal-100 rounded-2xs mb-1" />
                            <span className="font-bold text-[#cf493e]">18 Frames</span>
                          </div>
                        </div>
                      )}

                      {tpl.previewStyle === "adventure" && (
                        <div className="w-full flex flex-col justify-between h-full text-[#1d2742]">
                          <div className="flex items-center justify-center gap-1">
                            {["O", "U", "R", " ", "T", "R", "I", "P"].map((ch, idx) =>
                              ch === " " ? (
                                <span key={idx} className="w-1.5" />
                              ) : (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#fbf6ea] border border-[#1d2742] shadow-[1px_1px_0_#1d2742]"
                                >
                                  {ch}
                                </span>
                              )
                            )}
                          </div>
                          <div className="bg-[#f3ecda] border border-[#1d2742] px-2 py-1 text-[9px] font-mono font-bold flex justify-between">
                            <span>THE DAILY US</span>
                            <span className="text-[#e5533d]">♥ 6 Cutouts</span>
                          </div>
                        </div>
                      )}

                      {tpl.previewStyle === "album" && (
                        <div className="grid grid-cols-3 gap-1.5 w-full text-[9px] font-bold text-[#4a3f38] text-center">
                          <div className="bg-[#faf6ef] p-1.5 rounded-lg border border-[#4a3f38]/15">Polaroids</div>
                          <div className="bg-[#e9c46a] p-1.5 rounded-lg border border-[#4a3f38]/15">FAMILY</div>
                          <div className="bg-[#8aa67c] text-white p-1.5 rounded-lg border border-[#4a3f38]/15">9 Pages</div>
                        </div>
                      )}

                      {tpl.previewStyle === "lovestory" && (
                        <div className="grid grid-cols-3 gap-1.5 w-full h-full items-center text-[9px] font-typewriter text-center">
                          <div className="bg-[#4a0f17] border border-[#c9a24a]/50 rounded-md p-1.5 text-[#f2e7d0]">
                            Plaid Cover
                          </div>
                          <div className="bg-[#ecdfc2] rounded-md p-1.5 text-[#3b2a1d] font-bold">
                            Film Strip
                          </div>
                          <div className="bg-[#5b1119] border border-[#c9a24a]/50 rounded-md p-1.5 text-[#c9a24a]">
                            12 Pages
                          </div>
                        </div>
                      )}

                      {tpl.previewStyle === "anniversary" && (
                        <div className="grid grid-cols-3 gap-1.5 w-full h-full items-center text-[9px] font-typewriter text-center">
                          <div className="bg-[#36080f] border border-[#e5c678]/60 rounded-md p-1.5 text-[#f4ecdc]">
                            Velvet Cover
                          </div>
                          <div className="bg-[#6b161f] border border-[#e5c678]/40 rounded-md p-1.5 text-[#f4ecdc]">
                            Lace Heart
                          </div>
                          <div className="bg-[#4a5438] border border-[#e5c678]/40 rounded-md p-1.5 text-[#f6f4eb]">
                            Star Map
                          </div>
                        </div>
                      )}

                      {tpl.previewStyle === "flipbook" && (
                        <div className="grid grid-cols-2 gap-2 w-full h-full items-center text-[9px] font-bold">
                          <div className="bg-[#2a1209] border border-dashed border-[#e6c26a]/50 rounded-lg p-2 text-[#e6c26a]">
                            Leather &amp; Lace
                            <span className="block text-[8px] font-normal text-[#f4e9dc]/75">
                              Photobooth + Hearts
                            </span>
                          </div>
                          <div className="bg-[#f2ebd9] rounded-lg p-2 text-[#2a1209]">
                            37 Photos
                            <span className="block text-[8px] font-normal text-[#2a1209]/75">
                              16 Pages • 8 Spreads
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-xl font-extrabold tracking-tight">{tpl.name}</h3>
                      <span
                        className={`text-[10px] font-typewriter font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isDark
                            ? "bg-white/10 text-white/85"
                            : "bg-[#2b1f1a]/8 text-[#5c4a3e]"
                        }`}
                      >
                        {tpl.photos}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed mb-4 ${
                        isDark ? "text-white/75" : "text-[#68574c]"
                      }`}
                    >
                      {tpl.subtitle}
                    </p>

                    {/* Key Highlights */}
                    <ul
                      className={`space-y-1.5 text-xs mb-5 ${
                        isDark ? "text-white/90" : "text-[#4e3f36]"
                      }`}
                    >
                      {tpl.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isDark ? "text-[#e6c26a]" : "text-emerald-700"
                            }`}
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={tpl.href}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm ${tpl.accentBg} ${tpl.accentText}`}
                  >
                    <span>
                      {tpl.tier === "free"
                        ? `Create Free • ${tpl.vol}`
                        : `Preview & Unlock • ${tpl.price}`}
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Compact Pricing Summary Strip */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#fbf6ec] border border-dashed border-[#c8b295] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5a483e]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 font-typewriter">
              <span className="font-bold text-[#2b1f1a]">PRICING SUMMARY:</span>
              <span>Vol. 01 &amp; 02 — <strong>Free</strong></span>
              <span>•</span>
              <span>Vol. 03 &amp; 04 — <strong>$4.99</strong></span>
              <span>•</span>
              <span>Vol. 06 Love Story — <strong>$5.99</strong></span>
              <span>•</span>
              <span>Vol. 07 Velvet Book — <strong>$7.99</strong></span>
              <span>•</span>
              <span>Vol. 05 Love Flipbook — <strong>$9.99</strong></span>
            </div>
            <Link
              href="/templates"
              className="font-bold text-[#cf493e] hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Compare all details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 bg-[#faf7f2] p-4 sm:p-8 rounded-2xl border border-[#e5d7c6] shadow-xs space-y-5 sm:space-y-6">
              {/* Partner Names Inputs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a685e] mb-2">
                  1. Who is this special page for?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <span className="block text-xs text-[#8c776b] mb-1">
                      Recipient / Partner&apos;s Name
                    </span>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Lina"
                      className="w-full px-3.5 py-3 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 shadow-xs"
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
                      className="w-full px-3.5 py-3 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 shadow-xs"
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
                        className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all text-xs font-medium cursor-pointer active:scale-95 ${
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
                <div className="space-y-2.5 sm:space-y-3">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. To the love of my life"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] font-handwriting text-xl focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40"
                  />

                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Write your personal romantic words..."
                    className="w-full px-3.5 py-3 rounded-lg border border-[#d8c8b4] bg-white text-[#443831] font-handwriting text-base sm:text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 resize-y"
                  />
                </div>
              </div>

              {/* Song Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a685e] mb-2">
                  4. Background Love Song
                </label>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-[#cf493e] shrink-0" />
                  <input
                    type="text"
                    value={selectedSong}
                    onChange={(e) => setSelectedSong(e.target.value)}
                    placeholder="Song Title (e.g. Miguel - Sure Thing)"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#d8c8b4] bg-white text-[#332b27] text-xs font-typewriter uppercase focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40"
                  />
                </div>
              </div>

              {/* Launch CTA */}
              <button
                type="button"
                onClick={handleLaunchCustomScrapbook}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-[#cf493e] text-white font-bold text-sm sm:text-base tracking-wide shadow-[0_6px_20px_rgba(207,73,62,0.35)] hover:bg-[#b83b31] hover:shadow-[0_8px_25px_rgba(207,73,62,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="h-5 w-5 shrink-0" />
                <span>Launch My Custom Scrapbook →</span>
              </button>
            </div>

            {/* Right Column: Live Interactive Preview Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center w-full mt-2 lg:mt-0">
              <div className="w-full max-w-[92vw] xs:max-w-[92vw] sm:max-w-none mx-auto scrapbook-paper p-4 xs:p-5 sm:p-7 rounded-xl border border-[#d8c8b4] shadow-lg lg:sticky lg:top-28">
                {/* Washi tape sticker */}
                <div className="w-24 h-6 washi-tape-green mx-auto -mt-6 sm:-mt-9 mb-4 -rotate-2" />

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
              Explore all 6 handcrafted templates — from free polaroids &amp; spiral journals to 3D vintage flipbooks.
            </p>
            <Link
              href="/templates"
              className="px-5 py-2.5 rounded-full bg-[#cf493e] text-white text-xs font-bold hover:bg-[#b83b31] transition-all cursor-pointer shadow-md"
            >
              Explore All Templates
            </Link>
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
                Free + One-Time Premium
              </h3>
              <p className="text-xs sm:text-sm text-[#6b584d] leading-relaxed">
                Vol. 01 &amp; 02 are 100% free forever. Premium 3D books are a single one-time payment ($4.99–$9.99) with no subscriptions and a 14-day refund policy.
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
                q: "What is the pricing for LovePage templates?",
                a: "Vol. 01 (Polaroid Scrapbook) and Vol. 02 (Our Little Book) are 100% free to customize and share. Our Premium one-time templates are: Vol. 03 (Our Little Adventure) $4.99, Vol. 04 (9-Page Scrapbook Album) $4.99, Vol. 06 (12-Page Love Story) $5.99, Vol. 07 (1 Year With You Velvet Flipbook) $7.99, and Vol. 05 (16-Page Leather Love Flipbook) $9.99 USD — all one-time payments with lifetime access and a 14-day refund policy.",
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
          8. CONTACT & FEEDBACK FORM (Directly below FAQ)
      ───────────────────────────────────────────────────────────── */}
      <ContactFeedbackSection />

      {/* ─────────────────────────────────────────────────────────────
          9. ROMANTIC FINAL CALL TO ACTION (CTA BANNER)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#f7ebe6] to-[#eddcca] text-center">
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
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            <BrandLogo size="sm" />
            <span className="font-handwriting text-xl text-[#362e2b] font-bold">
              LovePage Scrapbook & Little Book
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <Link
              href="/templates"
              className="hover:text-[#cf493e] transition-colors font-semibold text-[#cf493e]"
            >
              All 6 Templates &amp; Pricing
            </Link>
            <Link
              href="/love-story"
              className="hover:text-[#cf493e] transition-colors"
            >
              Love Story ($5.99)
            </Link>
            <Link
              href="/flipbook"
              className="hover:text-[#cf493e] transition-colors"
            >
              Love Flipbook ($9.99)
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#cf493e] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#cf493e] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund"
              className="hover:text-[#cf493e] transition-colors"
            >
              Refund Policy
            </Link>
          </div>

          <p className="font-typewriter text-[11px] text-[#9c897c]">
            Crafted with love by Vath • © {new Date().getFullYear()} LovePage
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

