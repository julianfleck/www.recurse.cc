import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "@/components/layout/page";

export default function Page() {
	return (
		<DocsPage breadcrumb={{ enabled: false }} footer={{ enabled: false }}>
			<DocsTitle>Usage</DocsTitle>
			<DocsDescription>Monitor your API usage and limits.</DocsDescription>
			<DocsBody>
				<p>
					This is a shell page. Replace with the actual Usage UI when ready.
				</p>
			</DocsBody>
		</DocsPage>
	);
}
