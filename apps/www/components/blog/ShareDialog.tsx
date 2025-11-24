"use client";

import type React from "react";
import Link from "next/link";
import { Badge } from "@recurse/ui/components/badge";
import { CopyButton } from "@recurse/ui/components/copy-button";
import { Twitter, Linkedin, Rss, Share2 } from "lucide-react";

export type ShareIcon = "twitter" | "linkedin" | "substack";

export type ShareTarget = {
	label: string;
	href: string;
	icon: ShareIcon;
};

interface ShareDialogProps {
	shareTargets: ShareTarget[];
	canonicalUrl: string;
	title?: string;
}

const shareIconMap: Record<ShareIcon, (props: { className?: string }) => React.JSX.Element> = {
	twitter: (props) => <Twitter strokeWidth={1.5} {...props} />,
	linkedin: (props) => <Linkedin strokeWidth={1.5} {...props} />,
	substack: (props) => <Rss strokeWidth={1.5} {...props} />,
};

export function ShareDialog({ shareTargets, canonicalUrl, title }: ShareDialogProps) {
	return (
		<div className="space-y-3">
			{title ? <p className="text-sm font-semibold text-muted-foreground">{title}</p> : null}
			<div className="flex flex-wrap gap-2">
				{shareTargets.map(({ label, href, icon }) => (
					<Link key={label} href={href} target="_blank" rel="noreferrer">
						<Badge
							variant="secondary"
							className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
						>
							{shareIconMap[icon] ? (
								shareIconMap[icon]({ className: "h-3.5 w-3.5" })
							) : (
								<Share2 className="h-3.5 w-3.5" />
							)}
							{label}
						</Badge>
					</Link>
				))}
				<CopyButton
					text={canonicalUrl}
					variant="ghost"
					size="sm"
					className="h-7 rounded-full border border-border/60 bg-background px-3 text-xs text-muted-foreground hover:border-primary hover:text-primary"
				>
					Copy link
				</CopyButton>
			</div>
		</div>
	);
}

