import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
	title: string;
	description: string;
	icon?: LucideIcon;
	children?: ReactNode;
	className?: string;
	iconStrokeWidth?: number;
}

export function FeatureCard({
	title,
	description,
	icon: Icon,
	children,
	className,
	iconStrokeWidth = 1.5,
}: FeatureCardProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{Icon && (
				<div className="flex items-center justify-start">
					<div className="rounded-md border border-accent/20 bg-accent/10 p-2">
						<Icon
							className="h-6 w-6 text-accent"
							strokeWidth={iconStrokeWidth}
						/>
					</div>
				</div>
			)}

			<div className="space-y-3">
				<h3 className="font-semibold text-foreground text-xl">{title}</h3>
				<p className="text-muted-foreground leading-relaxed">{description}</p>
			</div>

			{children && <div className="pt-2">{children}</div>}
		</div>
	);
}
