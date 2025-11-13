import { Logo } from "@recurse/ui/components/logo";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { ReactNode } from "react";
import { HealthStatus } from "../components/status-components";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<>
					<Logo className="mr-1.5 inline-block" size={20} />
					recurse.cc
				</>
			),
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
