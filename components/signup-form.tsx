"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import Particles from "@/components/backgrounds/Particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;
const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

const emailSchema = z.string().email("Enter a valid email");

const STEPS = [
  { id: 1, label: "Email", description: "Enter your email address" },
  { id: 2, label: "Password", description: "Create your password" },
  { id: 3, label: "Confirm", description: "Verify your account" },
] as const;

interface StepProgressProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  className?: string;
}

function StepProgress({
  currentStep,
  onStepClick,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {STEPS.map((step, index) => {
          const isActive = step.id <= currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id < currentStep;

          return (
            <Tooltip key={step.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative flex-1 cursor-pointer transition-all duration-300 ease-in-out",
                    isActive ? "bg-primary" : "bg-muted",
                    isCurrent && "shadow-lg"
                  )}
                  onClick={() => isClickable && onStepClick(step.id)}
                >
                  {/* Step indicator dot */}
                  <div className="-top-1 -translate-x-1/2 absolute left-1/2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 transition-all duration-300",
                        isActive
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30 bg-background",
                        isCurrent && "ring-2 ring-primary/30"
                      )}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{step.label}</div>
                  <div className="text-muted-foreground text-xs">
                    {step.description}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

interface StepContentProps {
  step: number;
  children: React.ReactNode;
  direction: number; // 1 for forward, -1 for backward
}

function StepContent({ step, children, direction }: StepContentProps) {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence custom={direction} mode="wait">
      <motion.div
        animate="center"
        className="w-full"
        custom={direction}
        exit="exit"
        initial="enter"
        key={step}
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export function SignupForm({ className }: { className?: string }) {
  const { loginWithRedirect } = useAuth0();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [resending, setResending] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  // restore persisted state on mount (email and step only; passwords are not persisted)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedEmail = localStorage.getItem("signup_email");
    if (savedEmail) setEmail(savedEmail);
    const savedName = localStorage.getItem("signup_name");
    if (savedName) setName(savedName);
    const savedStep = localStorage.getItem("signup_step");
    if (savedStep) {
      const stepNum = Number(savedStep);
      if (stepNum === 2 || stepNum === 3) setCurrentStep(stepNum as 2 | 3);
    }
  }, []);
  // Persist form state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("signup_email", email);
  }, [email]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("signup_name", name);
  }, [name]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("signup_step", String(currentStep));
  }, [currentStep]);

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

  function validateNameAndEmail() {
    const nameParsed = z
      .string()
      .min(1, "Full name is required")
      .safeParse(name);
    const emailParsed = emailSchema.safeParse(email);

    const errs: Record<string, string> = {};

    if (!nameParsed.success) {
      errs.name =
        nameParsed.error.issues[0]?.message ?? "Full name is required";
    }

    if (!emailParsed.success) {
      errs.email = emailParsed.error.issues[0]?.message ?? "Invalid email";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return false;
    }

    setFieldErrors({});
    return true;
  }

  function goToStep(target: 1 | 2 | 3) {
    if (target < currentStep) {
      setDirection(-1); // backward
      setCurrentStep(target);
    } else if (target > currentStep) {
      setDirection(1); // forward
      setCurrentStep(target);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Create user via server to avoid CORS issues
      const createRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createJson?.error || "Signup failed");
      }
      // Trigger verification email
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Clear persisted state so future visits start fresh, but keep email in-memory for resending
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("signup_email");
          localStorage.removeItem("signup_name");
          localStorage.removeItem("signup_step");
        }
      } catch {}
      setName("");
      setPassword("");
      setConfirmPassword("");
      setFieldErrors({});
      setDirection(1);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  // Note: Legacy embedded Auth0 signup/login helper removed (unused and error-prone)

  async function handleSocialSignup(connection: string) {
    await loginWithRedirect({
      authorizationParams: { connection, screen_hint: "signup" },
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="z-10 overflow-hidden p-0 min-h-[520px]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Progress Indicator */}
              <StepProgress
                className="mb-8"
                currentStep={currentStep}
                onStepClick={goToStep}
              />
              <div className="flex flex-col gap-2">
                <h1 className="font-bold text-xl">Create your account</h1>
                <p className="text-base text-muted-foreground">
                  Sign up for your recurse.cc account
                </p>
              </div>
              {error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}
              {/* Step content */}
              {currentStep === 1 && (
                <StepContent direction={direction} step={1}>
                  <div className="grid h-40 content-start gap-3">
                    <label className="text-sm" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      autoComplete="name"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm outline-hidden ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      type="text"
                      value={name}
                    />
                    {fieldErrors.name ? (
                      <div className="text-destructive text-xs">
                        {fieldErrors.name}
                      </div>
                    ) : null}
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
                    {fieldErrors.email ? (
                      <div className="text-destructive text-xs">
                        {fieldErrors.email}
                      </div>
                    ) : null}
                    <div className="mt-auto flex justify-end">
                      <Button
                        className="h-11 w-full bg-primary shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                        onClick={() => {
                          if (validateNameAndEmail()) goToStep(2);
                        }}
                        type="button"
                      >
                        Continue
                        <ChevronRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {currentStep === 2 && (
                <StepContent direction={direction} step={2}>
                  <div className="grid h-40 content-start gap-3">
                    <form className="grid gap-3" onSubmit={handleSignup}>
                      <label className="text-sm" htmlFor="password">
                        Password
                      </label>
                      <input
                        autoComplete="new-password"
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm outline-hidden ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        type="password"
                        value={password}
                      />
                      {fieldErrors.password ? (
                        <div className="text-destructive text-xs">
                          {fieldErrors.password}
                        </div>
                      ) : null}
                      <label className="text-sm" htmlFor="confirmPassword">
                        Confirm Password
                      </label>
                      <input
                        autoComplete="new-password"
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm outline-hidden ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="confirmPassword"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        type="password"
                        value={confirmPassword}
                      />
                      {fieldErrors.confirmPassword ? (
                        <div className="text-destructive text-xs">
                          {fieldErrors.confirmPassword}
                        </div>
                      ) : null}
                      <div className="mt-auto flex gap-3">
                        <Button
                          className="h-11 flex-1 transition-all duration-200 hover:bg-muted"
                          onClick={() => goToStep(1)}
                          type="button"
                          variant="outline"
                        >
                          <ChevronLeft className="mr-2 size-4" />
                          Back
                        </Button>
                        <Button
                          className="h-11 flex-1 bg-primary shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                          disabled={submitting}
                          type="submit"
                        >
                          {submitting ? "Creating…" : "Sign up"}
                          <ChevronRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </StepContent>
              )}

              {currentStep === 3 && (
                <StepContent direction={direction} step={3}>
                  <div className="grid h-40 content-start gap-4">
                    <div className="rounded-lg border border-border bg-card p-4 text-sm shadow-sm">
                      Thanks! We've sent you a verification email. Please check your email and click the verification
                      link to finish setting up your account.
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <Button
                        disabled={resending}
                        onClick={async () => {
                          setResending(true);
                          try {
                            await fetch("/api/auth/resend-verification", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email }),
                            });
                          } finally {
                            setResending(false);
                          }
                        }}
                        type="button"
                        variant="outline"
                      >
                        {resending ? "Resending…" : "Resend verification email"}
                      </Button>
                      <Button asChild type="button" variant="default">
                        <a href="/login">Go to login</a>
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}
              {/* Social auth section */}
              <div className="mt-8">
                <div
                  aria-hidden={currentStep !== 1}
                  className={cn(
                    "relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t",
                    currentStep !== 1 &&
                      "pointer-events-none select-none opacity-0"
                  )}
                >
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div
                  aria-hidden={currentStep !== 1}
                  className={cn(
                    "mt-4 grid grid-cols-2 gap-4",
                    currentStep !== 1 &&
                      "pointer-events-none select-none opacity-0"
                  )}
                >
                  <Button
                    className="w-full"
                    disabled={currentStep !== 1}
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
                    disabled={currentStep !== 1}
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
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a className="underline underline-offset-4" href="/login">
                  Log in
                </a>
              </div>
            </div>
          </div>
          <div className="relative hidden overflow-hidden border-l bg-chart-1/20 bg-blend-multiply md:block">
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
