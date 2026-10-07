import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f3d5cf] flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-white/80 backdrop-blur-sm border border-[#e4d6c4] rounded-3xl p-10 sm:p-14 shadow-xl max-w-md w-full">
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-[#cf493e] flex items-center justify-center shadow-md">
          <Heart className="h-8 w-8 fill-white text-white" />
        </div>
        <h1 className="font-handwriting text-4xl sm:text-5xl text-[#3d332a] mb-3">
          Page not found
        </h1>
        <p className="text-[#7e6d5e] text-sm sm:text-base leading-relaxed mb-8 font-sans">
          This love page doesn&apos;t exist — or the link may have a typo.
          <br />
          Check you copied the full link correctly.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#cf493e] text-white font-semibold text-sm hover:bg-[#b83b31] transition-all active:scale-95 shadow-md"
        >
          <Heart className="h-4 w-4 fill-white" />
          Create your own love page
        </Link>
      </div>
      <p className="mt-8 text-[11px] font-typewriter text-[#9b7267] opacity-70">
        LovePage Studio · Made with 💖
      </p>
    </main>
  );
}
