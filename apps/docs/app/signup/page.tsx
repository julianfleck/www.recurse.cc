import { redirect } from "next/navigation";
import { getDashboardUrl } from "@/lib/utils";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupRedirectPage({ searchParams }: PageProps) {
	const params = (searchParams ? await searchParams : {}) ?? {};
	const dashboardUrl = getDashboardUrl();
	const returnToParam = params.returnTo;
	const returnTo = Array.isArray(returnToParam)
		? returnToParam[0]
		: returnToParam;

	const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";

	redirect(`${dashboardUrl}/signup${query}`);
}

