"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/auth-api";

import { AuthShell } from "./auth-shell";

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
    <AuthShell
      className={className}
      footer={
        sent ? (
          <Button asChild type="button" variant="default">
            <a href="/login">Back to login</a>
          </Button>
        ) : (
          <Button
            className="h-11 w-full"
            disabled={submitting}
            form="reset-form"
            type="submit"
          >
            {submitting ? "Sending…" : "Send reset link"}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        )
      }
      header={
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-xl">Reset your password</h1>
          <p className="text-base text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>
      }
      subline={
        <>
          Remembered it? <a href="/login">Log in</a>
        </>
      }
    >
      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm shadow-sm">
          {error}
        </div>
      ) : null}

      {sent ? (
        <div className="rounded-lg border border-border bg-card p-4 text-sm shadow-sm">
          If an account exists for {email}, you&apos;ll receive a reset email
          shortly.
        </div>
      ) : (
        <form className="grid gap-3" id="reset-form" onSubmit={onSubmit}>
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
        </form>
      )}
    </AuthShell>
  );
}
