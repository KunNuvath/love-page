import Link from "next/link";
import { Heart, Sparkles, ArrowLeft, Layers } from "lucide-react";
import BrandLogo from "@/src/components/BrandLogo";

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen bg-[#f3d5cf] flex flex-col items-center justify-center px-4 sm:px-6 text-center selection:bg-[#cf493e]/20">
      <div className="bg-[#faf6ee] border border-[#e4d6c4] rounded-3xl p-8 sm:p-12 shadow-[0_15px_40px_rgba(140,70,60,0.12)] max-w-md w-full relative overflow-hidden">
        {/* Decorative corner stamp */}
        <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-[10px] font-bold tracking-wider uppercase pointer-events-none">
          <Heart className="h-3 w-3 fill-[#cf493e]" />
          <span>404 Lost Note</span>
        </div>

        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[#cf493e] flex items-center justify-center shadow-[0_6px_20px_rgba(207,73,62,0.35)]">
          <Heart className="h-8 w-8 fill-white text-white" />
        </div>

        <h1 className="font-handwriting text-4xl sm:text-5xl text-[#2d221e] font-bold mb-2">
          Page Not Found
        </h1>
        <p className="text-[#68584f] text-xs sm:text-sm leading-relaxed mb-6 font-sans">
          The page or memory you were looking for doesn&apos;t exist or might have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#f6eee7] text-[#4a3a32] border border-[#d8c8b4] text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#cf493e]" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#cf493e] text-white text-xs font-bold hover:bg-[#b83b31] shadow-[0_4px_16px_rgba(207,73,62,0.35)] transition-all active:scale-95"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Explore Templates</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 opacity-80">
        <BrandLogo size="sm" />
        <span className="text-xs font-mono text-[#8c6b61]">LovePage Studio · Made with 💖</span>
      </div>
    </main>
  );
}
