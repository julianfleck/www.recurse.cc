"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AuthDivider, SocialButtons } from "./auth-shared";
import { AuthShell } from "./auth-shell";

const MIN_PASSWORD_LENGTH = 8;
const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

const emailSchema = z.string().email("Enter a valid email");

const STEP_EMAIL = 1;
const STEP_PASSWORD = 2;
const STEP_CONFIRM = 3;

const STEPS = [
  { id: STEP_EMAIL, label: "Email", description: "Enter your email address" },
  { id: STEP_PASSWORD, label: "Password", description: "Create your password" },
  { id: STEP_CONFIRM, label: "Confirm", description: "Verify your account" },
] as const;

type StepProgressProps = {
  currentStep: typeof STEP_EMAIL | typeof STEP_PASSWORD | typeof STEP_CONFIRM;
  onStepClick: (
    step: typeof STEP_EMAIL | typeof STEP_PASSWORD | typeof STEP_CONFIRM
  ) => void;
  className?: string;
};

function StepProgress({
  currentStep,
  onStepClick,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="mt-4 flex h-1 w-full gap-1">
        {STEPS.map((step, _index) => {
          const isActive = step.id <= currentStep;
          const isClickable = step.id < currentStep;

          return (
            <Tooltip key={step.id}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "flex-1 rounded-full transition-all duration-300 ease-in-out",
                    isActive ? "bg-primary" : "bg-muted",
                    isClickable && "cursor-pointer hover:bg-primary/80",
                    !isClickable && "cursor-default"
                  )}
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.id)}
                  type="button"
                />
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

type StepContentProps = {
  step: number;
  children: React.ReactNode;
  direction: number; // 1 for forward, -1 for backward
};

function StepContent({
  step,
  children,
  direction: animationDirection,
}: StepContentProps) {
  const ANIMATION_OFFSET = 300;
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? ANIMATION_OFFSET : -ANIMATION_OFFSET,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? ANIMATION_OFFSET : -ANIMATION_OFFSET,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence custom={animationDirection} mode="wait">
      <motion.div
        animate="center"
        className="w-full"
        custom={animationDirection}
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
  const [currentStep, setCurrentStep] = useState<
    typeof STEP_EMAIL | typeof STEP_PASSWORD | typeof STEP_CONFIRM
  >(STEP_EMAIL);
  const [resending, setResending] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  // restore persisted state on mount (email and step only; passwords are not persisted)
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const savedEmail = localStorage.getItem("signup_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
    const savedName = localStorage.getItem("signup_name");
    if (savedName) {
      setName(savedName);
    }
    const savedStep = localStorage.getItem("signup_step");
    if (savedStep) {
      const stepNum = Number(savedStep);
      if (stepNum === STEP_PASSWORD || stepNum === STEP_CONFIRM) {
        setCurrentStep(stepNum as typeof STEP_PASSWORD | typeof STEP_CONFIRM);
      }
    }
  }, []);
  // Persist form state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem("signup_email", email);
  }, [email]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem("signup_name", name);
  }, [name]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
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

  function goToStep(
    target: typeof STEP_EMAIL | typeof STEP_PASSWORD | typeof STEP_CONFIRM
  ) {
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
      } catch {
        // ignore localStorage failures
      }
      setName("");
      setPassword("");
      setConfirmPassword("");
      setFieldErrors({});
      setDirection(1);
      setCurrentStep(STEP_CONFIRM);
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
    <AuthShell
      className={cn("flex flex-col gap-6", className)}
      footer={
        <>
          {/* Step-specific buttons */}
          {currentStep === STEP_EMAIL && (
            <Button
              className="h-11 w-full bg-primary shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
              icon={<ArrowRight className="size-4" />}
              iconSide="right"
              onClick={() => {
                if (validateNameAndEmail()) {
                  goToStep(STEP_PASSWORD);
                }
              }}
              showIconOnHover={true}
              type="button"
            >
              Continue
            </Button>
          )}

          {currentStep === STEP_PASSWORD && (
            <div className="flex gap-3">
              <Button
                className="h-11 flex-1 transition-all duration-200 hover:bg-muted"
                icon={<ArrowLeft className="size-4" />}
                iconSide="left"
                onClick={() => goToStep(STEP_EMAIL)}
                showIconOnHover={true}
                type="button"
                variant="outline"
              >
                Back
              </Button>
              <Button
                className="h-11 flex-1 bg-primary shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                disabled={submitting}
                form="signup-form"
                icon={<ArrowRight className="size-4" />}
                iconSide="right"
                showIconOnHover={true}
                type="submit"
              >
                {submitting ? "Creating…" : "Sign up"}
              </Button>
            </div>
          )}

          {currentStep === STEP_CONFIRM && (
            <div className="flex flex-col gap-3">
              <Button
                disabled={resending}
                icon={<ChevronRight className="size-4" />}
                iconSide="right"
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
                showIconOnHover={true}
                type="button"
                variant="outline"
              >
                {resending ? "Resending…" : "Resend verification email"}
              </Button>
              <Button asChild type="button" variant="default">
                <a href="/login">Go to login</a>
              </Button>
            </div>
          )}

          {/* Social auth section - only show on first step */}
          {currentStep === STEP_EMAIL && (
            <div className="mt-8">
              <AuthDivider />
              <div className="mt-4">
                <SocialButtons
                  onGithub={() => handleSocialSignup("github")}
                  onGoogle={() => handleSocialSignup("google-oauth2")}
                />
              </div>
            </div>
          )}
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <a className="underline underline-offset-4" href="/login">
              Log in
            </a>
          </div>
        </>
      }
      header={
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-xl">Create your account</h1>
          <p className="text-base text-muted-foreground">
            Sign up for your recurse.cc account
          </p>
        </div>
      }
      subline={
        <>
          By signing up, you agree to our <a href="/terms">Terms of Service</a>{" "}
          and <a href="/privacy">Privacy Policy</a>.
        </>
      }
    >
      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {/* Step content */}
      {currentStep === STEP_EMAIL && (
        <StepContent direction={direction} step={1}>
          <div className="grid gap-3">
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
              <div className="text-destructive text-xs">{fieldErrors.name}</div>
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
          </div>
        </StepContent>
      )}

      {currentStep === STEP_PASSWORD && (
        <StepContent direction={direction} step={2}>
          <form className="grid gap-3" id="signup-form" onSubmit={handleSignup}>
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
          </form>
        </StepContent>
      )}

      {currentStep === STEP_CONFIRM && (
        <StepContent direction={direction} step={3}>
          <div className="rounded-lg border border-border bg-card p-4 text-sm shadow-sm">
            Thanks! We&apos;ve sent you a verification email. Please check your
            email and click the verification link to finish setting up your
            account.
          </div>
        </StepContent>
      )}

      {/* Step Progress */}
      <StepProgress currentStep={currentStep} onStepClick={goToStep} />
    </AuthShell>
  );
}
