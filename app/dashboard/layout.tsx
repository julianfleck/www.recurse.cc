import { DocsLayout } from "@/components/layout/docs";
import { docsOptions } from "@/lib/layout.shared";
import { docsSource, dashboardSource } from "@/lib/source";

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
						icon: "book",
					},
					{
						title: "Dashboard",
						url: "/dashboard",
						icon: "brain",
					},
				],
			}}
		>
			{children}
		</DocsLayout>
	);
}
