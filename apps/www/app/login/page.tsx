import { redirect } from "next/navigation";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getDashboardUrl(): string {
	return process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";
}

export default async function LoginRedirectPage({ searchParams }: PageProps) {
	const params = (searchParams ? await searchParams : {}) ?? {};
	const base = getDashboardUrl();
	const returnToParam = params.returnTo;
	const returnTo = Array.isArray(returnToParam)
		? returnToParam[0]
		: returnToParam;

	const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";

	redirect(`${base}/login${query}`);
}



