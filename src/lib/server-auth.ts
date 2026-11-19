import type { User } from "@supabase/supabase-js";
import { getAdminClient } from "@/src/lib/supabase-admin";

/** Resolve the signed-in user from an `Authorization: Bearer <access_token>` header. */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
