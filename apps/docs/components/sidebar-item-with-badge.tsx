"use client";

import { Badge } from "@recurse/ui/components/badge";
import type { PageTree } from "fumadocs-core/server";
import { SidebarItem } from "./sidebar";

type ItemWithBadge = PageTree.Item & {
	data?: {
		badge?: string;
	};
};

export function SidebarItemWithBadge({ item }: { item: PageTree.Item }) {
	// Extract badge from frontmatter metadata if present
	const badge = (item as ItemWithBadge).data?.badge as string | undefined;

	return (
		<SidebarItem
			external={item.external}
			href={item.url}
			icon={item.icon}
			className="flex items-center justify-between gap-2"
		>
			<span className="flex-1">{item.name}</span>
			{badge && (
				<Badge
					variant="info"
					appearance="light"
					size="xs"
					className="ms-auto shrink-0"
				>
					{badge}
				</Badge>
			)}
		</SidebarItem>
	);
}

