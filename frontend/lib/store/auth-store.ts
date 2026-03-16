import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface User {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

function mapUser(supabaseUser: { email?: string; user_metadata?: Record<string, unknown> }): User {
  const meta = supabaseUser.user_metadata ?? {};
  const email = supabaseUser.email ?? "";
  const name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    email.split("@")[0] ||
    "User";
  const avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || null;

  return { name, email, avatarUrl };
}

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  initialize: async () => {
    unsubscribe?.();

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      set({ user: mapUser(user), isLoggedIn: true, isLoading: false });
    } else {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: mapUser(session.user), isLoggedIn: true });
      } else {
        set({ user: null, isLoggedIn: false });
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
