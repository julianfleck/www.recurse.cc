import { getPage, getPages } from "@/lib/source";
import { notFound } from "next/navigation";

export default async function Page() {
	const page = getPage(["overview"], "dashboard");

	if (!page) notFound();

	return <page.Renderer />;
}

export async function generateStaticParams() {
	return getPages("dashboard").map((page) => ({
		slug: page.slugs,
	}));
}
