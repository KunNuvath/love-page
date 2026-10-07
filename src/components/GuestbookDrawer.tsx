"use client";

import React, { useState } from "react";
import { X, Send, Heart, Sparkles, MessageCircle, Clock } from "lucide-react";
import { GuestbookEntry } from "@/src/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entries: GuestbookEntry[];
  onAddNote: (author: string, message: string, emoji: string) => Promise<void>;
  theme?: "light" | "cutting-mat";
}

const EMOJI_OPTIONS = ["💌", "💖", "🌸", "🧁", "🎀", "✨", "🧸", "🕊️", "🌹", "🍓"];

const STICKY_COLORS = [
  "bg-[#fff9d6] border-[#f2e29f] text-[#4a3b1d]",
  "bg-[#ffebee] border-[#f8bbd0] text-[#4e222a]",
  "bg-[#e8f5e9] border-[#c8e6c9] text-[#1b4324]",
  "bg-[#e1f5fe] border-[#b3e5fc] text-[#153e54]",
  "bg-[#f3e5f5] border-[#e1bee7] text-[#3e1b4b]",
];

export default function GuestbookDrawer({
  isOpen,
  onClose,
  entries,
  onAddNote,
  theme = "light",
}: Props) {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💌");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote(author.trim() || "Secret Admirer", message.trim(), selectedEmoji);
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === "cutting-mat";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in Panel */}
      <div
        className={`relative z-10 w-full max-w-md h-full flex flex-col shadow-2xl transition-transform duration-300 ${
          isDark
            ? "bg-[#1f493b] text-white border-l border-white/20"
            : "bg-[#faf6ee] text-[#362e2b] border-l border-[#e4d6c4]"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Heart className="h-4 w-4 fill-white" />
            </div>
            <div>
              <h3 className="font-handwriting text-2xl font-bold leading-tight">
                Love Notes & Wishes
              </h3>
              <p className="text-xs opacity-75">
                Leave a sweet memory or note in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12 px-4 opacity-75">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="font-handwriting text-xl">No notes yet...</p>
              <p className="text-xs mt-1">Be the first to leave a heartfelt message!</p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const colorClass = STICKY_COLORS[idx % STICKY_COLORS.length];
              const rotation = idx % 2 === 0 ? "-rotate-1" : "rotate-1";
              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border shadow-sm transition-transform hover:scale-[1.02] ${colorClass} ${rotation}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{entry.emoji}</span>
                      <span className="font-bold text-sm font-sans">
                        {entry.author_name}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-60 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(entry.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="font-handwriting text-lg leading-snug whitespace-pre-wrap">
                    {entry.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Post Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-black/10 bg-black/5 flex flex-col gap-2.5"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Your Name (e.g. Maya)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white/80 border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-neutral-800"
              maxLength={40}
            />
            {/* Emoji Selector */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {EMOJI_OPTIONS.slice(0, 5).map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setSelectedEmoji(em)}
                  className={`p-1 rounded-md text-sm transition-transform ${
                    selectedEmoji === em ? "bg-rose-400/30 scale-125 ring-1 ring-rose-500" : "hover:scale-110"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              placeholder="Write a sweet love note, wish, or memory..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              required
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-neutral-800 resize-none font-sans"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="absolute bottom-2.5 right-2 px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
            >
              <Send className="h-3 w-3" />
              <span>{isSubmitting ? "Sending..." : "Post"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
