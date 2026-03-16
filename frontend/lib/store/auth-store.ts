import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/config";

interface User {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  authProvider: "email" | "google";
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

function mapUser(supabaseUser: {
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): User {
  const meta = supabaseUser.user_metadata ?? {};
  const appMeta = supabaseUser.app_metadata ?? {};
  const email = supabaseUser.email ?? "";
  const name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    email.split("@")[0] ||
    "User";
  const avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || null;
  const provider = appMeta.provider === "google" ? "google" : "email";

  return { name, email, avatarUrl, authProvider: provider };
}

let unsubscribe: (() => void) | null = null;

async function fetchRole(token: string): Promise<"user" | "admin"> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.role === "admin" ? "admin" : "user";
    }
  } catch {}
  return "user";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isAdmin: false,

  initialize: async () => {
    unsubscribe?.();

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.access_token
        ? await fetchRole(session.access_token)
        : "user";
      const mapped = mapUser(user);
      set({
        user: { ...mapped, role },
        isLoggedIn: true,
        isLoading: false,
        isAdmin: role === "admin",
      });
    } else {
      set({ user: null, isLoggedIn: false, isLoading: false, isAdmin: false });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = session.access_token
          ? await fetchRole(session.access_token)
          : "user";
        const mapped = mapUser(session.user);
        set({
          user: { ...mapped, role },
          isLoggedIn: true,
          isAdmin: role === "admin",
        });
      } else {
        set({ user: null, isLoggedIn: false, isAdmin: false });
      }
    });

    unsubscribe = () => subscription.unsubscribe();
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  },
}));
