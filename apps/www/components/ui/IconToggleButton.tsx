import { Button } from "@recurse/ui/components";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

interface IconToggleButtonProps {
	icon1: IconComponent;
	icon2: IconComponent;
	isIcon2Showing?: boolean;
	onClick?: () => void;
	className?: string;
	icon1ClassName?: string;
	icon2ClassName?: string;
	tooltip?: React.ReactNode;
	tooltipSide?: "top" | "right" | "bottom" | "left";
	buttonProps?: React.ComponentProps<typeof Button>;
}

export function IconToggleButton({
	icon1: Icon1,
	icon2: Icon2,
	isIcon2Showing = false,
	onClick,
	className,
	icon1ClassName,
	icon2ClassName,
	tooltip,
	tooltipSide = "bottom",
	buttonProps,
}: IconToggleButtonProps) {
	return (
		<Button
			className={cn(
				"group/toggle",
				"group relative overflow-hidden",
				className,
			)}
			onClick={onClick}
			size="icon"
			tooltip={tooltip}
			variant="outline"
			{...buttonProps}
			tooltipSide={buttonProps?.tooltipSide ?? tooltipSide}
		>
			<div className="relative flex h-5 w-5 items-center justify-center transition-all duration-200 ease-out">
				<Icon1
					className={cn(
						"absolute h-[20px] w-[20px] transition-all delay-50 duration-200 ease-out",
						isIcon2Showing
							? "group-hover/toggle:-translate-y-6 translate-y-0 opacity-100 group-hover/toggle:opacity-0"
							: "-translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100",
						icon1ClassName,
					)}
				/>
				<Icon2
					className={cn(
						"absolute h-[20px] w-[20px] transition-all delay-50 duration-200 ease-out",
						isIcon2Showing
							? "translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100"
							: "translate-y-0 opacity-100 group-hover/toggle:translate-y-6 group-hover/toggle:opacity-0",
						icon2ClassName,
					)}
				/>
			</div>
			{buttonProps?.children}
		</Button>
	);
}
