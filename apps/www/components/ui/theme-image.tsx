"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ThemeImageProps = {
	/**
	 * Base filename (without path). Automatically resolves to:
	 * - /images/light/{src} for light mode
	 * - /images/dark/{src} for dark mode
	 */
	src: string;
	/**
	 * Alt text for the image
	 */
	alt: string;
	/**
	 * Optional: Fallback image if theme is not resolved yet
	 */
	fallback?: string;
	/**
	 * Optional: Custom className for styling the image
	 */
	className?: string;
	/**
	 * Optional: Additional props for the img element
	 */
	[key: string]: unknown;
};

/**
 * Theme-aware image component that displays different images
 * based on the current theme (light/dark).
 *
 * Usage:
 * ```tsx
 * <ThemeImage
 *   src="recurse-ui-1.png"
 *   alt="UI Preview"
 *   className="w-full h-full object-cover"
 * />
 * ```
 *
 * This will automatically use:
 * - /images/light/recurse-ui-1.png for light mode
 * - /images/dark/recurse-ui-1.png for dark mode
 */
export function ThemeImage({
	src,
	alt,
	fallback,
	className,
	...props
}: ThemeImageProps) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch by waiting for mount
	useEffect(() => {
		setMounted(true);
	}, []);

	// Determine which image to show
	const imageSrc = (() => {
		if (!mounted) {
			// During SSR or before mount, use fallback or default to dark
			if (fallback) return fallback;
			return `/images/dark/${src}`;
		}
		const basePath =
			resolvedTheme === "dark" ? "/images/dark" : "/images/light";
		return `${basePath}/${src}`;
	})();

	return (
		<img
			src={imageSrc}
			alt={alt}
			className={cn(className)}
			{...props}
		/>
	);
}

