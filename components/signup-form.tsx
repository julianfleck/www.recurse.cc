"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { z } from "zod";
import Particles from "@/components/backgrounds/Particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;
const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

const signupSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { loginWithRedirect } = useAuth0();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateForm() {
    const parsed = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const iss of parsed.error.issues) {
        const key = iss.path[0] as string;
        if (key) {
          errs[key] = iss.message;
        }
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Delegate signup to Universal Login with signup hint
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
          login_hint: email,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocialSignup(connection: string) {
    await loginWithRedirect({
      authorizationParams: { connection, screen_hint: "signup" },
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="z-10 overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <h1 className="font-bold text-xl">Create your account</h1>
                <p className="text-base text-muted-foreground">
                  Sign up for your recurse.cc account
                </p>
              </div>
              {error ? (
                <div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
                  {error}
                </div>
              ) : null}
              <form className="grid gap-3" onSubmit={handleSignup}>
                <label className="text-sm" htmlFor="name">
                  Name (optional)
                </label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-hidden ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  type="text"
                  value={name}
                />
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
                {fieldErrors.email ? (
                  <div className="text-red-600 text-xs">
                    {fieldErrors.email}
                  </div>
                ) : null}
                <label className="text-sm" htmlFor="password">
                  Password
                </label>
                <input
                  autoComplete="new-password"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-hidden ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  value={password}
                />
                {fieldErrors.password ? (
                  <div className="text-red-600 text-xs">
                    {fieldErrors.password}
                  </div>
                ) : null}
                <label className="text-sm" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  autoComplete="new-password"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-hidden ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="confirmPassword"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
                {fieldErrors.confirmPassword ? (
                  <div className="text-red-600 text-xs">
                    {fieldErrors.confirmPassword}
                  </div>
                ) : null}
                <Button
                  className="w-full"
                  disabled={submitting}
                  type="submit"
                  variant="outline"
                >
                  {submitting ? "Creating account..." : "Sign up"}
                </Button>
              </form>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="w-full"
                  onClick={() => handleSocialSignup("google-oauth2")}
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
                  <span className="sr-only">Sign up with Google</span>
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleSocialSignup("github")}
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
                  <span className="sr-only">Sign up with GitHub</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a className="underline underline-offset-4" href="/login">
                  Log in
                </a>
              </div>
            </div>
          </div>
          <div className="relative hidden overflow-hidden bg-accent md:block">
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
        By signing up, you agree to our <a href="/terms">Terms of Service</a>{" "}
        and <a href="/privacy">Privacy Policy</a>.
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
