"use client";

import { CommandGroup, CommandItem } from "@recurse/ui/components/command";
import { Code2, FileText, HelpCircle, Home, Zap } from "lucide-react";
import navContent from "@/content/en/navigation.json" with { type: "json" };

const iconMap: Record<string, typeof Home> = {
	home: Home,
	features: Zap,
	details: FileText,
	faq: HelpCircle,
	technology: Code2,
};

function getRootPages() {
	const pages = [
		{ key: "home", label: navContent.home, href: "/" },
		{ key: "features", label: navContent.features, href: "/features" },
		{ key: "details", label: navContent.details, href: "/details" },
		{ key: "faq", label: navContent.faq, href: "/faq" },
		{ key: "technology", label: navContent.technology, href: "/technology" },
	];

	return pages.filter((page) => page.label); // Only include pages with labels
}

export function WebsiteSuggestions({ onSelect }: { onSelect?: () => void }) {
	const suggestions = getRootPages();

	if (suggestions.length === 0) {
		return null;
	}

	const handleSelect = (href: string) => {
		if (href) {
			window.location.href = href;
			onSelect?.();
		}
	};

	return (
		<CommandGroup heading="Suggestions">
			{suggestions.map((suggestion) => {
				const Icon = iconMap[suggestion.key] || FileText;
				return (
					<CommandItem
						key={suggestion.href}
						onSelect={() => handleSelect(suggestion.href)}
						value={suggestion.label}
					>
						<Icon className="h-4 w-4 text-muted-foreground" />
						<span>{suggestion.label}</span>
					</CommandItem>
				);
			})}
		</CommandGroup>
	);
}
