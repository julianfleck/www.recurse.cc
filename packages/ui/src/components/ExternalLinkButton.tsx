"use client";

import { LinkButton } from "./link-button";

interface ExternalLinkButtonProps {
	variant?: "default" | "subtle" | "outline" | "ghost";
	showArrow?: boolean;
	children: React.ReactNode;
}

/**
 * @deprecated Use LinkButton instead. This component is kept for backward compatibility.
 * ExternalLinkButton was hardcoded to /docs/introduction. Use LinkButton with getDocsUrl() for flexibility.
 * Example: <LinkButton href={`${getDocsUrl()}/introduction`} variant="subtle">Docs</LinkButton>
 */
export function ExternalLinkButton({
	variant = "subtle",
	showArrow = false,
	children,
}: ExternalLinkButtonProps) {
	// Use LinkButton internally - redirects to /docs/introduction which will forward to docs app
	// Note: showArrow is ignored as LinkButton handles icons automatically
	return (
		<LinkButton href="/docs/introduction" variant={variant}>
			{children}
		</LinkButton>
	);
}
