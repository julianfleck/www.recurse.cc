import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { ReactNode } from "react";
import { HealthStatus } from "../components/status-components";
import { getWwwUrl } from "./utils";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  // Get www URL for navigation links
  // In production: https://www.recurse.cc
  // In development: http://localhost:3002 (www port)
  // We can't use getWwwUrl() here because this runs on the server
  // The URL will be resolved client-side in the Link component if needed
  const wwwUrl = process.env.NEXT_PUBLIC_WWW_URL || 
    (process.env.NODE_ENV === "production" ? "https://www.recurse.cc" : "http://localhost:3002");
  
  return {
    nav: {
      title: (
        <>
          <svg
            aria-label="Logo"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx={12} cy={12} fill="currentColor" r={12} />
          </svg>
          recurse.cc
        </>
      ),
      // Link to marketing website (www) - full URL for cross-subdomain navigation
      url: wwwUrl,
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [],
  };
}

/**
 * Docs-specific layout configurations
 */
export function docsOptions(): BaseLayoutProps & {
  sidebar?: { footer?: ReactNode };
} {
  return {
    ...baseOptions(),
    sidebar: {
      footer: <HealthStatus />,
    },
  };
}
