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
    <div className={cn("flex h-[600px] flex-col", className)}>
      <GlowCard
        enableGlow={true}
        glowIntensity={0.2}
        glowRadius="420px"
        className="flex flex-1 overflow-hidden border border-border p-0 shadow-xl"
      >
        <div className="flex flex-1 md:grid md:grid-cols-2">
          <div className="flex h-full w-full flex-col p-6 md:p-8">
            <div className="shrink-0">{header}</div>
            {stepProgress ? <div className="py-3 md:py-4">{stepProgress}</div> : null}
            <div className="flex min-h-0 flex-1 flex-col py-4">{children}</div>
            <div className="shrink-0">{footer}</div>
          </div>
          <AuthSideVisual />
        </div>
      </GlowCard>
      {subline ? (
        <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
          {subline}
        </div>
      ) : null}
    </div>
  );
}

export function AuthSideVisual() {
  return (
    <div className="relative hidden h-full overflow-hidden border-l bg-chart-1/20 bg-blend-multiply md:block text-foreground">
      <div className="absolute inset-0 flex items-center justify-center">
        <Logo size={120} className="drop-shadow-lg" />
      </div>
      <Particles
        className="absolute inset-0"
        isViewportSized={false}
        particleColor="currentColor"
        particleCount={20}
        particleSize={2}
        zIndex={1}
      />
    </div>
  );
}
