import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Blog | Recurse",
	description:
		"Mirrored essays and research notes from our Substack, rendered with the www layout and MDX pipeline.",
};

export const revalidate = 3600;

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

