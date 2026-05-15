// authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {LoginResponse} from "@/frontend/repository/auth/dto"

type User = LoginResponse["user"];

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "auth-storage", // key di localStorage
      partialize: (state) => ({ accessToken: state.accessToken }), // simpan token saja, bukan user
    }
  )
);