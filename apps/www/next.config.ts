import path from "node:path";
import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const rootSourcePath = path.resolve(__dirname, "./.source/index.ts");

const nextConfig: NextConfig = {
	turbopack: {
		resolveAlias: {
			"@/.source": rootSourcePath,
		},
	},
	webpack(config) {
		config.resolve.alias = {
			...(config.resolve.alias ?? {}),
			"@/.source": rootSourcePath,
		};
		return config;
	},
};

const withMDX = createMDX();

export default withMDX(nextConfig);
