import type React from "react";
import { cn } from "@/lib/utils";

interface ToggleAreaProps {
	children1: React.ReactNode;
	children2: React.ReactNode;
	isChildren2Showing?: boolean;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
}

export function ToggleArea({
	children1,
	children2,
	isChildren2Showing = false,
	onClick,
	className,
}: ToggleAreaProps) {
	return (
		<div
			className={cn(
				"group/toggle",
				"relative cursor-pointer overflow-hidden",
				className,
			)}
			onClick={onClick}
		>
			<div className="relative transition-all duration-200 ease-out">
				{/* Invisible placeholder to maintain height */}
				<div className="invisible">{children2}</div>

				{/* Visible animated content */}
				<div
					className={cn(
						"absolute inset-0 flex items-center justify-center transition-all delay-50 duration-200 ease-out",
						isChildren2Showing
							? "group-hover/toggle:-translate-y-6 translate-y-0 opacity-100 group-hover/toggle:opacity-0"
							: "-translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100",
					)}
				>
					{children1}
				</div>
				<div
					className={cn(
						"absolute inset-0 flex items-center justify-center transition-all delay-50 duration-200 ease-out",
						isChildren2Showing
							? "translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100"
							: "translate-y-0 opacity-100 group-hover/toggle:translate-y-6 group-hover/toggle:opacity-0",
					)}
				>
					{children2}
				</div>
			</div>
		</div>
	);
}
