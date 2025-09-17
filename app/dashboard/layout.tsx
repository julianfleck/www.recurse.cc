import { DocsLayout } from "@/components/layout/docs";
import { docsOptions } from "@/lib/layout.shared";
import { dashboardSource } from "@/lib/source";
import { Book, Brain } from "lucide-react";

export default function Layout({ children }: LayoutProps<"/dashboard">) {
	return (
		<DocsLayout
			{...docsOptions()}
			tree={dashboardSource.pageTree}
			sidebar={{
				tabs: [
					{
						title: "Documentation",
						url: "/docs",
						icon: <Book className="size-4" />,
					},
					{
						title: "Dashboard",
						url: "/dashboard",
						icon: <Brain className="size-4" />,
					},
				],
			}}
		>
			{children}
		</DocsLayout>
	);
}
