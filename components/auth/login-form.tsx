"use client";

import { useRouter } from "next/navigation";
// Auth0 provider is globally configured; no direct hook needed here
import { useState } from "react";
import Particles from "@/components/backgrounds/Particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loginWithPassword } from "@/lib/auth-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "./auth-store";
// no direct usage now; keep connections centralized in hook
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
        router.push("/dashboard");
      }, STORE_PROPAGATION_DELAY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="z-10 overflow-hidden p-0 min-h-[520px]">
        <CardContent className="grid h-full p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 flex h-full">
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex flex-col">
                <h1 className="font-bold text-xl">Welcome back</h1>
                <p className="text-base text-muted-foreground">
                  Login to your recurse.cc account
                </p>
              </div>
              {error ? (
                <div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
                  {error}
                </div>
              ) : null}
              <form className="flex min-h-0 flex-1 flex-col gap-3" onSubmit={handleEmailLogin}>
                <label className="text-sm" htmlFor="email">
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-hidden ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                      href="/forgot-password"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <input
                    autoComplete="current-password"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-hidden ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={submitting}
                  type="submit"
                  variant="outline"
                >
                  {submitting ? "Logging in..." : "Login"}
                </Button>
              </form>
              <div className="flex-1" />
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="w-full"
                  onClick={loginWithGoogle}
                  type="button"
                  variant="outline"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <title>Google logo</title>
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button
                  className="w-full"
                  onClick={loginWithGithub}
                  type="button"
                  variant="outline"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <title>GitHub logo</title>
                    <path
                      d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.1-.76.08-.75.08-.75 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.32 3.52 1 .11-.78.42-1.32.76-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0 0 12 .5z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with GitHub</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a className="underline underline-offset-4" href="/signup">
                  Sign up
                </a>
              </div>
            </div>
          </div>
          <div className="relative hidden h-full overflow-hidden border-l bg-chart-1/20 bg-blend-multiply md:block">
            <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
              recurse.cc
            </div>
            <Particles
              className="absolute inset-0"
              isViewportSized={false}
              particleColor="#000000"
              particleCount={20}
              particleSize={2}
              zIndex={1}
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </div>
      <Particles
        className="size-full opacity-60"
        isViewportSized={true}
        particleColor="#000000"
        particleCount={40}
        zIndex={-1}
      />
    </div>
  );
}


