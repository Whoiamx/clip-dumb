import { create } from "zustand";

interface User {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const DEMO_USER: User = {
  name: "Demo User",
  email: "demo@clipdub.app",
  avatarUrl: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USER,
  isLoggedIn: true,
  login: () => set({ user: DEMO_USER, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
