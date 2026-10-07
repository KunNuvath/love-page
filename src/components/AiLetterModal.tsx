"use client";

import React, { useState } from "react";
import { X, Sparkles, Wand2, Copy, Check, Heart, RefreshCw } from "lucide-react";
import { apiGenerateAiLetter } from "@/src/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string, title?: string) => void;
  defaultRecipient?: string;
  defaultSender?: string;
}

export default function AiLetterModal({
  isOpen,
  onClose,
  onInsert,
  defaultRecipient = "",
  defaultSender = "",
}: Props) {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [sender, setSender] = useState(defaultSender);
  const [tone, setTone] = useState<"romantic" | "playful" | "poetic" | "nostalgic">("romantic");
  const [type, setType] = useState<"letter" | "caption" | "poem" | "vows">("letter");
  const [memories, setMemories] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await apiGenerateAiLetter({
        recipientName: recipient || "My Love",
        senderName: sender || "Yours",
        tone,
        type,
        memories,
      });
      setGeneratedText(result.text);
      if (result.title) setGeneratedTitle(result.title);
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertClick = () => {
    onInsert(generatedText, generatedTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#faf6ee] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e4d6c4] text-[#362e2b] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-[#cf493e] text-white flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2d221e]">
              AI Romantic Writer
            </h2>
            <p className="text-xs text-[#7e6d5e]">
              Generate poetic letters, vows, captions & sweet notes in seconds
            </p>
          </div>
        </div>

        {/* Format & Tone Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d4e] block mb-1.5">
              What do you want to create?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "letter", label: "Love Letter" },
                { id: "caption", label: "Photo Caption" },
                { id: "poem", label: "Romantic Poem" },
                { id: "vows", label: "Couple Vows" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                    type === t.id
                      ? "bg-[#cf493e] text-white border-[#cf493e] shadow-xs"
                      : "bg-white/80 text-[#5a483e] border-[#e2d5c5] hover:bg-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d4e] block mb-1.5">
              Romantic Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "romantic", label: "💖 Deep Romance" },
                { id: "playful", label: "🍓 Playful & Cute" },
                { id: "poetic", label: "✨ Poetic & Lyrical" },
                { id: "nostalgic", label: "🎞️ Sweet Memories" },
              ].map((tn) => (
                <button
                  key={tn.id}
                  type="button"
                  onClick={() => setTone(tn.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    tone === tn.id
                      ? "bg-[#2f6b58] text-white border-[#2f6b58] shadow-xs"
                      : "bg-white/80 text-[#5a483e] border-[#e2d5c5] hover:bg-white"
                  }`}
                >
                  {tn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#5a483e] block mb-1">
                To (Recipient Name)
              </label>
              <input
                type="text"
                placeholder="e.g. Lina"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#d8cbba] focus:ring-2 focus:ring-[#cf493e] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5a483e] block mb-1">
                From (Your Name)
              </label>
              <input
                type="text"
                placeholder="e.g. Miguel"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#d8cbba] focus:ring-2 focus:ring-[#cf493e] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Custom Memory Prompt */}
          <div>
            <label className="text-xs font-semibold text-[#5a483e] block mb-1">
              Key Memory / Inside Joke / Special Moment (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Our rainy coffee date in Paris, or when we burned cookies"
              value={memories}
              onChange={(e) => setMemories(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#d8cbba] focus:ring-2 focus:ring-[#cf493e] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-[#cf493e] hover:bg-[#b83b31] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60 mb-6"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Weaving Words of Love...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Generate Beautiful {type === "letter" ? "Letter" : type}</span>
            </>
          )}
        </button>

        {/* Result Area */}
        {generatedText && (
          <div className="p-5 rounded-2xl bg-white border border-[#ded1c0] shadow-inner space-y-3">
            {generatedTitle && (
              <h4 className="font-handwriting text-2xl font-bold text-[#cf493e]">
                {generatedTitle}
              </h4>
            )}
            <p className="font-handwriting text-lg sm:text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
              {generatedText}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0e6d8]">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
              <button
                type="button"
                onClick={handleInsertClick}
                className="px-4 py-1.5 rounded-xl bg-[#2f6b58] hover:bg-[#235344] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Heart className="h-3.5 w-3.5 fill-white" />
                <span>Insert into Page</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
