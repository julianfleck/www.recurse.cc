import Link from "next/link";
import { IconStack, IconBrandTwitter } from "@tabler/icons-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@recurse/ui/components";
import { ApiStatus } from "./ApiStatus";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";

export function Footer() {
	const footerSections = [
		{
			title: "Getting Started",
			links: [
				{ name: "Introduction", href: "https://docs.recurse.cc" },
				{ name: "Quickstart", href: "https://docs.recurse.cc/getting-started/quickstart" },
				{ name: "Beta Access", href: "https://docs.recurse.cc/getting-started/beta" },
				{ name: "API vs Proxy", href: "https://docs.recurse.cc/getting-started/api-vs-proxy" },
			],
		},
		{
			title: "Resources",
			links: [
				{ name: "FAQ", href: "/faq" },
				{ name: "Features", href: "/features" },
				{ name: "Technology", href: "/about" },
				{ name: "API Reference", href: "https://docs.recurse.cc/api-documentation" },
				{ name: "Changelog", href: "/changelog" },
			],
		},
		// 		{
		// 	title: "Concepts",
		// 	links: [
		// 		{ name: "Frames", href: "https://docs.recurse.cc/concepts/frames" },
		// 		{ name: "Adaptive Schemas", href: "https://docs.recurse.cc/concepts/adaptive-schemas" },
		// 		{ name: "Temporal Versioning", href: "https://docs.recurse.cc/concepts/temporal-versioning" },
		// 		{ name: "Source Subscriptions", href: "https://docs.recurse.cc/concepts/subscriptions" },
		// 		{ name: "Context Streams", href: "https://docs.recurse.cc/concepts/streams" },
		// 		{ name: "RAGE", href: "https://docs.recurse.cc/concepts/rage" },
		// 	],
		// },
		{
			title: "Guides",
			links: [
				{ name: "Dashboard", href: "https://docs.recurse.cc/guides/using-the-ui" },
				{ name: "API vs Proxy", href: "https://docs.recurse.cc/guides/api-vs-proxy" },
				{ name: "API", href: "https://docs.recurse.cc/guides/using-the-api" },
				{ name: "Proxy", href: "https://docs.recurse.cc/getting-started/using-the-proxy" },
			],
		},
		{
			title: "Legal",
			links: [
				{ name: "Privacy Policy", href: "/legal#privacy-policy" },
				{ name: "Impressum", href: "/legal#impressum" },
				{ name: "Legal", href: "/legal" },
			],
		},
	];

	return (
		<footer className="border-border border-t bg-background py-12">
			<Grid8Col className="gap-y-4">
				{/* Sitemap Section - 4 columns, each taking 2 grid columns */}
				{footerSections.map((section) => (
					<GridCell key={section.title} colSpan={4} mdColSpan={4} lgColSpan={2} className="pb-8">
						<div className="pl-6 border-l border-border">
							<h3 className="pl-2 mb-4 font-medium text-foreground text-base">
								{section.title}
							</h3>
							<ul className="space-y-2.5">
								{section.links.map((link) => (
									<li key={link.name}>
										<Link
											className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground hover:bg-muted/40 border border-transparent hover:border-muted px-1.5 py-1 rounded-sm"
											href={link.href}
										>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</GridCell>
				))}

				{/* Bottom Section - Full width with border */}
				<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
					<div className="flex flex-col items-start justify-between px-6 gap-4 border-border border-t pt-8 sm:flex-row sm:items-center">

						<div className="flex items-center gap-2">
							{/* <Link
								className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
								href="https://github.com/recurse-cc"
								rel="noopener noreferrer"
								target="_blank"
								>
								GitHub
								</Link> */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										className="text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted/40 border border-muted/80 hover:border-muted p-1.5 rounded-sm"
										href="https://j0lian.substack.com/"
										rel="noopener noreferrer"
										target="_blank"
										aria-label="Substack"
									>
										<IconStack className="size-5" />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="top">
									Substack
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										className="text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted/40 border border-muted/80 hover:border-muted p-1.5 rounded-sm"
										href="https://twitter.com/recurse_cc"
										rel="noopener noreferrer"
										target="_blank"
										aria-label="Twitter"
									>
										<IconBrandTwitter className="size-5" />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="top">
									Twitter
								</TooltipContent>
							</Tooltip>
						</div>
						<ApiStatus />
					</div>
				</GridCell>
			</Grid8Col>
		</footer>
	);
}
