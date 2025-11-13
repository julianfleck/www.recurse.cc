"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconToggleButton } from "@/components/ui/IconToggleButton";

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Don't render anything until mounted to prevent hydration mismatch
	if (!mounted) {
		return null;
	}

	const isDarkMode = resolvedTheme === "dark";

	const toggleTheme = () => {
		setTheme(isDarkMode ? "light" : "dark");
	};

	return (
		<IconToggleButton
			buttonProps={{
				variant: "ghost",
				size: "icon",
				className: "h-8 w-8",
				children: <span className="sr-only">Toggle theme</span>,
			}}
			className={className}
			icon1={Moon}
			icon2={Sun}
			isIcon2Showing={isDarkMode}
			onClick={toggleTheme}
			tooltip={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
		/>
	);
}
