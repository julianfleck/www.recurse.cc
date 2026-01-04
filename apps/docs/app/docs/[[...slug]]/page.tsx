import { redirect } from "next/navigation";

type Props = {
	params: Promise<{
		slug?: string[];
	}>;
};

export default async function DocsRedirectPage({ params }: Props) {
	const resolvedParams = await params;
	const slug = resolvedParams.slug || [];

	// Build the redirect path by removing the /docs prefix
	// If slug is empty, redirect to root (which will then redirect to /introduction)
	const redirectPath = slug.length > 0 ? `/${slug.join("/")}` : "/";

	redirect(redirectPath);
}

