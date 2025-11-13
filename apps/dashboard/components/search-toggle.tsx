"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
// Deprecated: replaced by components/search/toggle.tsx with providers
import { buttonVariants } from "./ui/button";

interface SearchToggleProps
	extends Omit<React.ComponentProps<"button">, "color"> {
	hideIfDisabled?: boolean;
	size?: "icon-sm" | "sm" | "default" | "lg";
	variant?:
		| "ghost"
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "link";
}

export function SearchToggle({
	hideIfDisabled,
	size = "icon-sm",
	variant = "ghost",
	...props
}: SearchToggleProps) {
	const [_open, setOpen] = useState(false);

	return (
		<>
			<button
				aria-label="Open Search"
				className={cn(
					buttonVariants({
						size,
						variant,
					}),
					props.className,
				)}
				data-search=""
				onClick={() => {
					setOpen(true);
				}}
				type="button"
			>
				<Search />
			</button>
			{/* Deprecated */}
		</>
	);
}

export function LargeSearchToggle({
	hideIfDisabled,
	customText,
	...props
}: React.ComponentProps<"button"> & {
	hideIfDisabled?: boolean;
	customText?: string;
}) {
	const [_open, setOpen] = useState(false);

	// Global keyboard shortcut for search
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only trigger if "/" is pressed and not typing in an input/textarea
			const target = event.target as HTMLElement;
			const isInput =
				target.tagName === "INPUT" || target.tagName === "TEXTAREA";
			if (event.key === "/" && !isInput && !target.isContentEditable) {
				event.preventDefault();
				setOpen(true);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<>
			<button
				data-search-full=""
				type="button"
				{...props}
				className={cn(
					buttonVariants({
						variant: "outline",
						size: "sm",
					}),
					"inline-flex items-center gap-2 bg-fd-secondary/50 px-3 py-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
					props.className,
				)}
				onClick={() => {
					setOpen(true);
				}}
			>
				<Search />
				{customText || "Search Knowledge Base"}
				<div className="ms-auto inline-flex gap-0.5">
					<kbd className="rounded-md border bg-fd-background px-1.5">/</kbd>
				</div>
			</button>
			{/* Deprecated */}
		</>
	);
}
