import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type IconToggleButtonProps = {
	icon1: React.ComponentType<{ className?: string; strokeWidth?: number }>;
	icon2: React.ComponentType<{ className?: string; strokeWidth?: number }>;
	isIcon2Showing?: boolean;
	onClick?: () => void;
	className?: string;
	buttonProps?: React.ComponentProps<typeof Button>;
	tooltip?: React.ReactNode;
	icon1ClassName?: string;
	icon2ClassName?: string;
};

export function IconToggleButton({
	icon1: Icon1,
	icon2: Icon2,
	isIcon2Showing = false,
	onClick,
	className,
	buttonProps,
	tooltip,
	icon1ClassName,
	icon2ClassName,
}: IconToggleButtonProps) {
	const size = buttonProps?.size || "icon";
	const content = (
		<Button
			className={cn(
				"group/toggle",
				"group relative overflow-hidden",
				className,
			)}
			onClick={onClick}
			size={size}
			variant="outline"
			{...buttonProps}
		>
			<div
				className={cn(
					"relative flex items-center justify-center transition-all duration-600 ease-out",
					size === "icon-sm" ? "h-5 w-5" : "h-6 w-6",
				)}
			>
				<Icon1
					className={cn(
						"absolute transition-all delay-50 duration-200 ease-out",
						size === "icon-sm" ? "h-[12px] w-[12px]" : "h-[14px] w-[14px]",
						icon1ClassName,
						isIcon2Showing
							? "group-hover/toggle:-translate-y-6 translate-y-0 opacity-100 group-hover/toggle:opacity-0"
							: "-translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100",
					)}
					strokeWidth={1.5}
				/>
				<Icon2
					className={cn(
						"absolute transition-all delay-50 duration-200 ease-out",
						size === "icon-sm" ? "h-[14px] w-[14px]" : "h-[16px] w-[16px]",
						icon2ClassName,
						isIcon2Showing
							? "translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100"
							: "translate-y-0 opacity-100 group-hover/toggle:translate-y-6 group-hover/toggle:opacity-0",
					)}
					strokeWidth={1.5}
				/>
			</div>
			{buttonProps?.children}
		</Button>
	);

	if (!tooltip) {
		return content;
	}
	return (
		<Tooltip>
			<TooltipTrigger asChild>{content}</TooltipTrigger>
			<TooltipContent sideOffset={6}>{tooltip}</TooltipContent>
		</Tooltip>
	);
}
