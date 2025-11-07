"use client";

import { Particles } from "@recurse/ui/components/backgrounds";
import { SignupForm } from "@/components/auth/signup-form";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use lighter color for dark mode, darker for light mode
  // Very subtle particles that are barely visible
  const particleColor = mounted && resolvedTheme === "dark" 
    ? "#b3b3b3" // Medium gray for dark backgrounds - very subtle
    : "#666666"; // Darker gray for light backgrounds

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      {/* Particles background */}
      <Particles
        className="fixed inset-0"
        isViewportSized={true}
        particleColor={particleColor}
        particleCount={40}
        particleSize={3}
        zIndex={1}
      />
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  );
}
