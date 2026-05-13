import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;

  setAccessToken: (token: string | null) => void;
  setUser: (user: { id: string; email: string } | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,   // in-memory, tidak persist
  user: null,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  logout: () => set({ accessToken: null, user: null }),
}));