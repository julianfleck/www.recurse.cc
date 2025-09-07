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
		];
	},
};

export default withMDX(config);
