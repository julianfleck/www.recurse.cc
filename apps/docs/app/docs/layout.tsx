import { DocsLayout } from "@/components/layout/docs";
import { LargeSearchToggle } from "@/components/search/toggle";
import { docsOptions } from "@/lib/layout.shared";
import { docsSource } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
	const options = docsOptions();
	return (
		<DocsLayout
			{...options}
			// Use documentation search provider in docs section
			searchToggle={{
				enabled: true,
				components: {
					sm: (
						<LargeSearchToggle
							customText="Search Documentation"
							enableHotkey={false}
							placeholder="Search documentation..."
							providerKey="documentation"
						/>
					),
					lg: (
						<LargeSearchToggle
							customText="Search Documentation"
							enableHotkey
							placeholder="Search documentation..."
							providerKey="documentation"
						/>
					),
				},
			}}
			tree={docsSource.pageTree}
		>
			{children}
		</DocsLayout>
	);
}
