import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				source: "/docs/:slug*.mdx",
				destination: "/llms.mdx/:slug*",
			},
			// Note: API proxy is handled by /app/api/proxy/[...path]/route.ts
			// This properly handles redirects and CORS
		];
	},
};

export default withMDX(config);
