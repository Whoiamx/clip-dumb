import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/config";

interface Subscription {
  plan: string;
  status: string;
}

interface User {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  authProvider: "email" | "google";
  subscription: Subscription | null;
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

  return { name, email, avatarUrl, authProvider: provider, subscription: null };
}

let unsubscribe: (() => void) | null = null;

async function fetchUserData(token: string): Promise<{ role: "user" | "admin"; subscription: Subscription | null }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        role: data.role === "admin" ? "admin" : "user",
        subscription: data.subscription ?? null,
      };
    }
  } catch {}
  return { role: "user", subscription: null };
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
      const userData = session?.access_token
        ? await fetchUserData(session.access_token)
        : { role: "user" as const, subscription: null };
      const mapped = mapUser(user);
      set({
        user: { ...mapped, role: userData.role, subscription: userData.subscription },
        isLoggedIn: true,
        isLoading: false,
        isAdmin: userData.role === "admin",
      });
    } else {
      set({ user: null, isLoggedIn: false, isLoading: false, isAdmin: false });
    }

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = session.access_token
          ? await fetchUserData(session.access_token)
          : { role: "user" as const, subscription: null };
        const mapped = mapUser(session.user);
        set({
          user: { ...mapped, role: userData.role, subscription: userData.subscription },
          isLoggedIn: true,
          isAdmin: userData.role === "admin",
        });
      } else {
        set({ user: null, isLoggedIn: false, isAdmin: false });
      }
    });

    unsubscribe = () => authSubscription.unsubscribe();
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  },
}));
