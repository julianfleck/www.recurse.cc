"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "./auth-store";

export function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const isClientAuthenticated = Boolean(storeToken || storeUser);

  useEffect(() => {
    if (isLoading) return;
    const unauthenticated = !(isAuthenticated || isClientAuthenticated);
    if (unauthenticated) router.replace("/login");
  }, [isAuthenticated, isClientAuthenticated, isLoading, router]);

  return null;
}
