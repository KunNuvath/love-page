"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { apiGetReactions, apiSendReaction, apiGetGuestbookEntries, apiAddGuestbookEntry, GuestbookEntry, ReactionCounts } from "./api";

export interface FloatingParticle {
  id: string;
  emoji: string;
  x: number; // percentage 10-90%
  size: number;
  rotation: number;
  senderName?: string;
}

export function useRealtimeLovePage(slug: string) {
  const [viewerCount, setViewerCount] = useState<number>(1);
  const [reactions, setReactions] = useState<ReactionCounts>({
    heart: 0,
    sparkle: 0,
    kiss: 0,
    fire: 0,
    cupcake: 0,
    star: 0,
  });
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Helper to spawn a floating particle
  const spawnParticle = useCallback((emoji: string, senderName?: string) => {
    const id = `particle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newParticle: FloatingParticle = {
      id,
      emoji,
      x: 15 + Math.random() * 70, // 15% to 85% width
      size: 24 + Math.random() * 18,
      rotation: -25 + Math.random() * 50,
      senderName,
    };

    setParticles((prev) => [...prev.slice(-25), newParticle]);

    // Auto remove particle after animation ends
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 3200);
  }, []);

  // Fetch initial reactions & guestbook
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function loadInitialData() {
      try {
        const [rx, gb] = await Promise.all([
          apiGetReactions(slug).catch(() => ({ heart: 12, sparkle: 8, kiss: 5, fire: 4, cupcake: 3, star: 7 })),
          apiGetGuestbookEntries(slug).catch(() => []),
        ]);
        if (isMounted) {
          if (rx) setReactions(rx);
          if (gb) setGuestbook(gb);
        }
      } catch (err) {
        console.warn("Error loading initial realtime data:", err);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Set up Supabase Realtime Channel & BroadcastChannel fallback
  useEffect(() => {
    if (!slug) return;

    // Cross-tab browser broadcast channel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(`love_page_channel_${slug}`);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === "reaction") {
            setReactions((prev) => ({
              ...prev,
              [payload.emoji]: (prev[payload.emoji] || 0) + 1,
            }));
            spawnParticle(payload.emojiSymbol || "💖", payload.senderName);
          } else if (type === "guestbook") {
            setGuestbook((prev) => [payload, ...prev.filter((e) => e.id !== payload.id)]);
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    // Connect to Supabase Realtime
    const channelName = `love-page:${slug}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: `viewer_${Math.random().toString(36).slice(2, 8)}` },
      },
    });

    channel
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        const emoji = payload?.emoji || "heart";
        const emojiMap: Record<string, string> = {
          heart: "💖",
          sparkle: "✨",
          kiss: "💋",
          fire: "🔥",
          cupcake: "🧁",
          star: "⭐",
        };
        setReactions((prev) => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) + 1,
        }));
        spawnParticle(emojiMap[emoji] || payload?.emojiSymbol || "💖", payload?.senderName);
      })
      .on("broadcast", { event: "new_guestbook_entry" }, ({ payload }) => {
        if (payload) {
          setGuestbook((prev) => [payload, ...prev.filter((e) => e.id !== payload.id)]);
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewerCount(Math.max(1, count));
      })
      .on("presence", { event: "join" }, () => {
        setViewerCount((prev) => prev + 1);
      })
      .on("presence", { event: "leave" }, () => {
        setViewerCount((prev) => Math.max(1, prev - 1));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [slug, spawnParticle]);

  // Send a reaction
  const triggerReaction = useCallback(
    async (emojiKey: string, emojiSymbol: string, senderName = "You") => {
      // 1. Optimistic UI updates
      setReactions((prev) => ({
        ...prev,
        [emojiKey]: (prev[emojiKey] || 0) + 1,
      }));
      spawnParticle(emojiSymbol, senderName);

      // 2. Local cross-tab broadcast
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "reaction",
          payload: { emoji: emojiKey, emojiSymbol, senderName },
        });
      }

      // 3. API & Supabase broadcast
      try {
        await apiSendReaction(slug, emojiKey, senderName);
      } catch (err) {
        console.warn("Failed to persist reaction:", err);
      }
    },
    [slug, spawnParticle]
  );

  // Add a guestbook comment
  const postGuestbookNote = useCallback(
    async (author: string, message: string, emoji = "💌") => {
      const optimisticEntry: GuestbookEntry = {
        id: `local_${Date.now()}`,
        page_slug: slug,
        author_name: author || "Someone Sweet",
        message,
        emoji,
        created_at: new Date().toISOString(),
      };

      setGuestbook((prev) => [optimisticEntry, ...prev]);
      spawnParticle(emoji, author);

      // Broadcast cross-tab
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "guestbook",
          payload: optimisticEntry,
        });
      }

      try {
        const saved = await apiAddGuestbookEntry(slug, author, message, emoji);
        if (saved?.id) {
          setGuestbook((prev) => [saved, ...prev.filter((e) => e.id !== optimisticEntry.id)]);
        }
      } catch (err) {
        console.warn("Failed to save guestbook note to API:", err);
      }
    },
    [slug, spawnParticle]
  );

  return {
    viewerCount,
    reactions,
    particles,
    guestbook,
    isConnected,
    triggerReaction,
    postGuestbookNote,
  };
}
