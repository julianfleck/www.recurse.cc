"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { loginWithPassword } from "@/lib/auth-api";
import { cn } from "@/lib/utils";
import { AuthDivider, SocialButtons } from "./auth-shared";
import { AuthShell } from "./auth-shell";
import { useAuthStore } from "./auth-store";
import { useSocialLogin } from "./use-social-login";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { loginWithGoogle, loginWithGithub } = useSocialLogin();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken, userInfo } = await loginWithPassword(
        email,
        password
      );
      const typedUser = userInfo as {
        sub: string;
        name?: string;
        email?: string;
        picture?: string;
      };
      setAuth(accessToken, "auth0", typedUser);
      setEmail("");
      setPassword("");
      // Allow store propagation before navigating
      const STORE_PROPAGATION_DELAY_MS = 50;
      setTimeout(() => {
        router.push("/");
      }, STORE_PROPAGATION_DELAY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      className={cn("flex flex-col gap-6", className)}
      footer={
        <>
          <Button
            className="h-11 w-full"
            disabled={submitting}
            form="login-form"
            icon={<ArrowRight className="size-4" />}
            iconSide="right"
            showIconOnHover={true}
            type="submit"
            variant="default"
          >
            {submitting ? "Logging in..." : "Login"}
          </Button>
          {!submitting && (
            <>
              <div className="mt-8">
                <AuthDivider />
              </div>
              <div className="mt-4">
                <SocialButtons
                  onGithub={loginWithGithub}
                  onGoogle={loginWithGoogle}
                />
              </div>
              <div className="mt-6 text-center text-sm">
                Don&apos;t have an account?{" "}
                <a className="underline underline-offset-4" href="/signup">
                  Sign up
                </a>
              </div>
            </>
          )}
        </>
      }
      header={
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-xl">Welcome back</h1>
          <p className="text-base text-muted-foreground">
            Login to your recurse.cc account
          </p>
        </div>
      }
      subline={
        <>
          By clicking continue, you agree to our{" "}
          <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </>
      }
      {...props}
    >
      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
          {error}
        </div>
      ) : null}

      {submitting ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Spinner size={32} />
          <p className="text-muted-foreground text-sm">Signing you in...</p>
        </div>
      ) : (
        <form
          className="grid gap-3"
          id="login-form"
          onSubmit={handleEmailLogin}
        >
          <label className="text-sm" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm outline-hidden ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
          <div className="grid gap-2">
            <div className="flex items-center">
              <label className="text-sm" htmlFor="password">
                Password
              </label>
              <a
                className="ml-auto text-xs underline-offset-2 hover:underline"
                href="/forgot-password"
              >
                Forgot your password?
              </a>
            </div>
            <input
              autoComplete="current-password"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm outline-hidden ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
        </form>
      )}
    </AuthShell>
  );
}
