import { redirect } from "next/navigation";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getDashboardUrl(): string {
	if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
		return process.env.NEXT_PUBLIC_DASHBOARD_URL;
	}
	if (process.env.NODE_ENV === "production") {
		return "https://dashboard.recurse.cc";
	}
	return "http://localhost:3001";
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



