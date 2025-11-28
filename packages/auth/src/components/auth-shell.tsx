"use client";

import { Logo, Particles } from "@recurse/ui/components";
import { GlowCard } from "@recurse/ui/components/glow-card";
import { cn } from "@recurse/ui/lib/utils";

type AuthShellProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  stepProgress?: React.ReactNode;
  subline?: React.ReactNode;
  className?: string;
};

export function AuthShell({
  header,
  children,
  footer,
  stepProgress,
  subline,
  className,
}: AuthShellProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <GlowCard
        enableGlow={true}
        glowIntensity={0.15}
        glowRadius="300px"
        glowBlur={80}
        className="h-[550px] overflow-visible rounded-xl border border-border p-0 shadow-xl"
      >
        {/* Grid: 50/50 split */}
        <div className="grid h-full grid-cols-1 overflow-visible md:grid-cols-2">
          {/* Left: Form */}
          <div className="flex h-full flex-col overflow-visible p-6 md:p-8">
            <div className="shrink-0">{header}</div>
            {stepProgress ? <div className="shrink-0 py-3">{stepProgress}</div> : null}
            <div className="flex min-h-0 flex-1 flex-col overflow-visible py-4">{children}</div>
            <div className="shrink-0">{footer}</div>
          </div>

          {/* Right: Visual (hidden on mobile) */}
          <div className="relative hidden border-l border-border bg-chart-1/10 md:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <Logo size={100} className="opacity-70" />
            </div>
            <Particles
              className="absolute inset-0"
              isViewportSized={false}
              particleColor="currentColor"
              particleCount={20}
              particleSize={2}
              zIndex={0}
            />
          </div>
        </div>
      </GlowCard>

      {/* Subline */}
      {subline ? (
        <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
          {subline}
        </div>
      ) : null}
    </div>
  );
}
