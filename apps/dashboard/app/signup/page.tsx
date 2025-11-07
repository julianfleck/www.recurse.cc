"use client";

import { Particles } from "@recurse/ui/components";
import { SignupForm } from "@/components/auth/signup-form";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subtle particles - lighter for dark mode to be visible, darker for light mode
  const particleColor = mounted && resolvedTheme === "dark"
    ? "#aaaaaa" // Light gray for dark backgrounds - subtle but visible
    : "#666666"; // Darker gray for light backgrounds

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-background/50 p-6 md:p-10">
      {/* Particles background */}
      <Particles
        className="fixed inset-0"
        isViewportSized={true}
        particleColor={particleColor}
        particleCount={40}
        particleSize={2}
        zIndex={-1}
      />
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  );
}
