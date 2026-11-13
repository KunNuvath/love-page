/**
 * Server-only Supabase admin client.
 * Uses the service_role key to bypass Row Level Security for server-side
 * operations (uploads, inserts, updates). Never import this in client components.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aspdaochkhzwciguyayg.supabase.co";

// Service role key — bypasses RLS on the server. Keep this server-side only.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Anon key fallback — used when service role key is not configured yet
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_jZdiPOyBH_9dJ6fkgOD8Zw_83NnzlkN";

/**
 * Returns a Supabase client that bypasses RLS.
 * Falls back to the anon key so the app still works if SUPABASE_SERVICE_ROLE_KEY
 * hasn't been added to the environment yet.
 */
export function getAdminClient() {
  const key = serviceRoleKey || anonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

