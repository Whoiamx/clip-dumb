import { createClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/config";

/**
 * Fetch wrapper that attaches the Supabase access token to requests.
 * Usage: `await apiFetch("/api/analyze-frames", { method: "POST", body: ... })`
 */
export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init?.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
