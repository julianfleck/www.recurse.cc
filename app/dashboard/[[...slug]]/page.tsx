import { getPage, getPages } from "@/lib/source";
import { notFound } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{ slug?: string[] }>;
}) {
	const { slug } = await params;
	const page = getPage(slug || [], "dashboard");

	if (!page) notFound();

	return <page.Renderer />;
}

export async function generateStaticParams() {
	return getPages("dashboard").map((page) => ({
		slug: page.slugs,
	}));
}
