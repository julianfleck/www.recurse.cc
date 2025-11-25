"use client";

import { GlowCard } from "@recurse/ui/components/glow-card";
import { Logo } from "@recurse/ui/components/logo";
import Particles from "@/components/backgrounds/Particles";
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
			<GlowCard
				glowIntensity={0.08}
				glowBlur={80}
				className="z-10 flex flex-1 gap-0 overflow-hidden border border-border bg-card p-0"
			>
				<div className="flex h-full w-full flex-col p-6 md:grid md:grid-cols-2 md:p-0">
					<div className="flex h-full w-full flex-col p-0 md:p-8">
						<div className="flex-shrink-0">{header}</div>
						<div className="flex min-h-0 flex-1 flex-col py-6 px-6 md:px-0">{children}</div>
						<div className="flex-shrink-0 px-6 md:px-0">{footer}</div>
					</div>
					<AuthSideVisual />
				</div>
			</GlowCard>
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
		<div className="relative hidden h-full overflow-hidden border-l bg-chart-1/20 text-foreground bg-blend-multiply md:block">
			<div className="absolute inset-0 flex items-center justify-center">
				<Logo className="drop-shadow-lg" size={120} />
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
