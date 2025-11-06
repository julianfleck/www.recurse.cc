"use client";

import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ImageProps } from "fumadocs-core/framework";
import Zoom from "react-medium-image-zoom";
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

  // If width and height are provided, use ImageZoom with Next.js Image optimization
  // Otherwise, use a regular img tag wrapped in Zoom for public folder images
  if (props.width && props.height) {
    return (
      <ImageZoom
        src={imageSrc}
        alt={alt}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
        className={className}
        {...props}
      />
    );
  }

  // For public folder images without dimensions, use regular img tag with zoom
  return (
    <Zoom wrapElement="span" zoomMargin={20}>
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{ maxWidth: "100%", height: "auto" }}
        {...(props as any)}
      />
    </Zoom>
  );
}

