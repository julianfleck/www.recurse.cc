"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { IconToggleButton } from "@/components/ui/IconToggleButton";

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const buttonRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// When returning to this tab, blur the theme toggle if the browser
	// auto-restored focus to it. This keeps the button from feeling
	// "sticky-focused" when switching tabs.
	useEffect(() => {
		if (typeof document === "undefined") return;

		const handleVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				buttonRef.current &&
				document.activeElement === buttonRef.current
			) {
				buttonRef.current.blur();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
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
			buttonRef={buttonRef}
			buttonProps={{
				variant: "outline",
				size: "icon",
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
