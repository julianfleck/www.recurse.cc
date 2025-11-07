"use client";

import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ImageProps } from "fumadocs-core/framework";
import Zoom from "react-medium-image-zoom";
import { cn } from "../lib/cn";
import "../styles/image-zoom.css";

export type ThemeImageProps = Omit<ImageProps, "src" | "alt"> & {
  /**
   * Image source for light mode, or base filename if using auto-resolve
   */
  light?: string;
  /**
   * Image source for dark mode, or base filename if using auto-resolve
   */
  dark?: string;
  /**
   * Base filename (without path). Automatically resolves to:
   * - /images/light/{src} for light mode
   * - /images/dark/{src} for dark mode
   * 
   * If provided, `light` and `dark` props are ignored.
   */
  src?: string;
  /**
   * Alt text for the image
   */
  alt: string;
  /**
   * Optional: Fallback image if theme is not resolved yet
   */
  fallback?: string;
  /**
   * Optional: Width of the image (for Next.js Image optimization)
   */
  width?: number;
  /**
   * Optional: Height of the image (for Next.js Image optimization)
   */
  height?: number;
  /**
   * Optional: Custom className for styling the image container
   */
  className?: string;
};

/**
 * Theme-aware image component that displays different images
 * based on the current theme (light/dark).
 * 
 * Usage in MDX (auto-resolve from light/dark directories):
 * ```mdx
 * <ThemeImage 
 *   src="screenshot.png"
 *   alt="Screenshot"
 * />
 * ```
 * 
 * This will automatically use:
 * - /images/light/screenshot.png for light mode
 * - /images/dark/screenshot.png for dark mode
 * 
 * Usage with explicit paths:
 * ```mdx
 * <ThemeImage 
 *   light="/images/custom-light.png" 
 *   dark="/images/custom-dark.png"
 *   alt="Screenshot"
 * />
 * ```
 */
export function ThemeImage({
  light,
  dark,
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
    // If src is provided, use auto-resolve pattern
    if (src) {
      if (!mounted) {
        // During SSR or before mount, use fallback or default to dark
        if (fallback) return fallback;
        return `/images/dark/${src}`;
      }
      const basePath = resolvedTheme === "dark" ? "/images/dark" : "/images/light";
      return `${basePath}/${src}`;
    }

    // Otherwise use explicit light/dark paths
    if (!mounted) {
      // During SSR or before mount, use fallback or light as default
      return fallback ?? light ?? "";
    }
    
    // After mount, use theme-specific image
    return resolvedTheme === "dark" ? (dark ?? "") : (light ?? "");
  })();

  // Extract className from props if present and merge with explicit className
  const { className: propsClassName, ...restProps } = props as any;
  const mergedClassName = cn(className, propsClassName);

  // If width and height are provided, use ImageZoom with Next.js Image optimization
  // Otherwise, use a regular img tag wrapped in Zoom for public folder images
  if (props.width && props.height) {
    return (
      <ImageZoom
        src={imageSrc}
        alt={alt}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
        className={mergedClassName}
        {...restProps}
      />
    );
  }

  // For public folder images without dimensions, use regular img tag with zoom
  // Split classes: container gets margin/spacing, image gets shadow/border/rounded/sizing
  // Shadow classes go on image using filter: drop-shadow() which works better for images
  const hasShadow = mergedClassName?.includes("shadow-");
  
  const containerClasses = mergedClassName
    ? mergedClassName
        .split(" ")
        .filter(
          (cls) =>
            !cls.includes("shadow-") &&
            !cls.includes("size-") &&
            !cls.includes("w-") &&
            !cls.includes("h-") &&
            !cls.includes("max-w-") &&
            !cls.includes("max-h-") &&
            !cls.includes("min-w-") &&
            !cls.includes("min-h-") &&
            !cls.includes("border") &&
            !cls.includes("rounded") &&
            (cls.includes("m-") ||
            cls.includes("p-") ||
            cls.includes("mx-") ||
            cls.includes("my-") ||
            cls.includes("mt-") ||
            cls.includes("mb-") ||
            cls.includes("ml-") ||
            cls.includes("mr-") ||
            cls.includes("px-") ||
            cls.includes("py-") ||
            cls.includes("pt-") ||
            cls.includes("pb-") ||
            cls.includes("pl-") ||
            cls.includes("pr-"))
        )
        .join(" ")
    : "";

  // Image gets shadow, border, rounded, and sizing classes
  const imageClasses = mergedClassName
    ? mergedClassName
        .split(" ")
        .filter(
          (cls) =>
            cls.includes("shadow-") ||
            cls.includes("border") ||
            cls.includes("rounded") ||
            cls.includes("size-") ||
            cls.includes("w-") ||
            cls.includes("h-") ||
            cls.includes("max-w-") ||
            cls.includes("max-h-") ||
            cls.includes("min-w-") ||
            cls.includes("min-h-")
        )
        .join(" ")
    : "";

  return (
    <div 
      className={containerClasses || undefined} 
      style={{ display: "inline-block", lineHeight: 0, overflow: "visible" }}
    >
      <Zoom wrapElement="span" zoomMargin={20}>
        <img
          src={imageSrc}
          alt={alt}
          className={imageClasses || undefined}
          style={{ 
            maxWidth: "100%", 
            height: "auto", 
            display: "block", 
            verticalAlign: "top",
            margin: 0,
            padding: 0,
            // Apply shadow using filter for better image shadow support
            ...(hasShadow ? { 
              filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))" 
            } : {})
          }}
          {...restProps}
        />
      </Zoom>
    </div>
  );
}

