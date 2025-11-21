import Link from "next/link";
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
		<footer className="border-border border-t bg-background px-0.5col py-12">
			<Grid8Col className="gap-y-4">
				{/* Sitemap Section - 4 columns, each taking 2 grid columns */}
				{footerSections.map((section) => (
					<GridCell key={section.title} colSpan={4} mdColSpan={4} lgColSpan={2}>
						<div>
							<h3 className="mb-3 font-medium text-foreground">
								{section.title}
							</h3>
							<ul className="space-y-2">
								{section.links.map((link) => (
									<li key={link.name}>
										<Link
											className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
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
					<div className="flex flex-col items-start justify-between gap-4 border-border border-t pt-8 sm:flex-row sm:items-center">
						<ApiStatus />

						<div className="flex items-center gap-6">
							{/* <Link
								className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
								href="https://github.com/recurse-cc"
								rel="noopener noreferrer"
								target="_blank"
							>
								GitHub
							</Link> */}
							<Link
								className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
								href="https://j0lian.substack.com/"
								rel="noopener noreferrer"
								target="_blank"
							>
								Substack
							</Link>
							<Link
								className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
								href="https://twitter.com/recurse_cc"
								rel="noopener noreferrer"
								target="_blank"
							>
								Twitter
							</Link>
						</div>
					</div>
				</GridCell>
			</Grid8Col>
		</footer>
	);
}
