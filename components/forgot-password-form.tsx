"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import Particles from "@/components/backgrounds/Particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requestPasswordReset } from "@/lib/auth-api";

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <Card className="z-10 min-h-[520px] overflow-hidden p-0">
        <CardContent className="grid h-full p-0 md:grid-cols-2">
          <div className="flex h-full p-6 md:p-8">
            <div className="flex min-h-0 flex-1 flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="font-bold text-xl">Reset your password</h1>
                <p className="text-base text-muted-foreground">
                  Enter your email to receive a reset link
                </p>
              </div>
              {error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm shadow-sm">
                  {error}
                </div>
              ) : null}

              {sent ? (
                <div className="grid gap-3">
                  <div className="rounded-lg border border-border bg-card p-4 text-sm shadow-sm">
                    If an account exists for {email}, you’ll receive a reset
                    email shortly.
                  </div>
                  <Button asChild type="button" variant="default">
                    <a href="/login">Back to login</a>
                  </Button>
                </div>
              ) : (
                <form className="flex min-h-0 flex-1 flex-col gap-3" onSubmit={onSubmit}>
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
                  <Button
                    className="h-11 w-full"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </form>
              )}
              <div className="flex-1" />
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
      <div className="mt-4 text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        Remembered it? <a href="/login">Log in</a>
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
