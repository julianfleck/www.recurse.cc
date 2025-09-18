"use client";

import Particles from "@/components/backgrounds/Particles";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  subline?: React.ReactNode;
  className?: string;
};

export function AuthShell({
  header,
  children,
  footer,
  subline,
  className,
}: AuthShellProps) {
  return (
    <div className={cn("flex h-[600px] flex-col gap-6", className)}>
      <Card className="z-10 flex flex-1 gap-0 overflow-hidden p-0 py-0">
        <CardContent className="flex h-full p-0 md:grid md:grid-cols-2">
          <div className="flex h-full w-full flex-col p-6 md:p-8">
            {/* Header Section */}
            <div className="flex-shrink-0">
              {header}
            </div>
            
            {/* Content Section - grows to fill space */}
            <div className="flex min-h-0 flex-1 flex-col py-6">
              {children}
            </div>
            
            {/* Footer Section */}
            <div className="flex-shrink-0">
              {footer}
            </div>
          </div>
          <AuthSideVisual />
        </CardContent>
      </Card>
      {subline ? (
        <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
          {subline}
        </div>
      ) : null}
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

export function AuthSideVisual() {
  return (
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
  );
}
