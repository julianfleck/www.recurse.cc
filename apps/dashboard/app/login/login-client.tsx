"use client";

import { Particles } from "@recurse/ui/components";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/components/auth/auth-store";
import { LoginForm } from "@/components/auth/login-form";

export function LoginPageClient() {
  const { isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeToken = useAuthStore((s) => s.accessToken);
  const storeUser = useAuthStore((s) => s.user);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subtle particles - lighter for dark mode to be visible, darker for light mode
  const particleColor = mounted && resolvedTheme === "dark"
    ? "#aaaaaa" // Light gray for dark backgrounds - subtle but visible
    : "#666666"; // Darker gray for light backgrounds

  // Check if user is already authenticated
  const isAlreadyAuthenticated =
    isAuthenticated || Boolean(storeToken || storeUser);

  useEffect(() => {
    // Wait for Auth0 to finish loading before checking auth state
    if (auth0Loading) {
      return;
    }

    // If user is already authenticated, redirect them
    if (isAlreadyAuthenticated) {
      // Check for returnTo query param (from external apps like docs/www)
      const returnTo = searchParams.get("returnTo");
      let redirectTarget = "/";

      if (returnTo) {
        try {
          const decoded = decodeURIComponent(returnTo);
          // If returnTo is a full URL (from another origin), redirect there
          if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
            window.location.href = decoded;
            return;
          }
          // Otherwise, use as relative path
          redirectTarget = decoded;
        } catch {
          // Invalid returnTo, fall back to default
        }
      }

      // Redirect to target location
      router.replace(redirectTarget);
    }
  }, [isAlreadyAuthenticated, auth0Loading, searchParams, router]);

  // Show loading while checking auth state
  if (auth0Loading || isAlreadyAuthenticated) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-background/50 p-6 md:p-10">
        <Particles
          className="fixed inset-0"
          isViewportSized={true}
          particleColor={particleColor}
          particleCount={40}
          particleSize={2}
          zIndex={-1}
        />
        <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
          <div className="text-center">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-background/50 p-6 md:p-10">
      <Particles
        className="fixed inset-0"
        isViewportSized={true}
        particleColor={particleColor}
        particleCount={40}
        particleSize={2}
        zIndex={-1}
      />
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
