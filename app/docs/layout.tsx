import { DocsLayout } from "@/components/layout/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
	return (
		<DocsLayout {...baseOptions()} tree={source.pageTree} tabMode="navbar">
			{children}
		</DocsLayout>
	);
}
