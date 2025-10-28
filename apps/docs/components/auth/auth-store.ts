"use client";
import { create } from "zustand";

type User = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

type AuthState = {
  accessToken?: string;
  provider?: string;
  user?: User;
  setAuth: (token?: string, provider?: string, user?: User) => void;
  clear: () => void;
};

function loadPersisted(): Partial<AuthState> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem("auth_store");
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  provider: undefined,
  user: undefined,
  setAuth: (accessToken, provider, user) => {
    const next = { accessToken, provider, user } as AuthState;
    set(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "auth_store",
          JSON.stringify({ accessToken, provider, user })
        );
      } catch (_e) {
        // ignore storage failures
      }
    }
  },
  clear: () => {
    set({ accessToken: undefined, provider: undefined, user: undefined });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("auth_store");
      } catch (_e) {
        // ignore storage failures
      }
    }
  },
  ...loadPersisted(),
}));

type LoginState = {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
};

export const useLoginStore = create<LoginState>((set) => ({
  email: "",
  password: "",
  isLoading: false,
  error: null,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clear: () => set({ email: "", password: "", isLoading: false, error: null }),
}));

// --- New: centralize Auth0 connection names and helpers
export const AUTH0_CONNECTIONS = {
  google: "google-oauth2",
  github: "github",
  email: "email",
} as const;

export type SocialProvider = keyof typeof AUTH0_CONNECTIONS;

export function resolveConnection(provider: SocialProvider): string {
  return AUTH0_CONNECTIONS[provider];
}
