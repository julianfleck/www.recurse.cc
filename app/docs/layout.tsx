import { DocsLayout } from "@/components/layout/docs";
import { docsOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
	return (
		<DocsLayout {...docsOptions()} tree={source.pageTree}>
			{children}
		</DocsLayout>
	);
}
