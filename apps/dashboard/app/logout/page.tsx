"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/components/auth/auth-store";

export default function LogoutPage() {
  const { logout, isLoading } = useAuth0();
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  useEffect(() => {
    // Clear client store first
    clear();
    // Then call Auth0 logout
    logout({
      logoutParams: {
        returnTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    // Fallback navigate in case SDK doesn't redirect
    const LOGOUT_REDIRECT_DELAY_MS = 150;
    const t = setTimeout(() => {
      router.replace("/login");
    }, LOGOUT_REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [logout, clear, router]);

  return isLoading ? null : null;
}
