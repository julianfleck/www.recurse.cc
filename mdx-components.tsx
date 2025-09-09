import { APIPage } from "fumadocs-openapi/ui";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { openapi } from "@/lib/openapi";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		APIPage: (props) => (
			<div className="fd-openapi">
				<APIPage {...openapi.getAPIPageProps(props)} />
			</div>
		),
		img: (props) => <ImageZoom {...(props as any)} />,
		...components,
	};
}
