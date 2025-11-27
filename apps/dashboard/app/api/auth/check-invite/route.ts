import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { code } = (await request.json()) as { code?: string };

		const invite = process.env.DASHBOARD_INVITE_CODE;
		if (!invite) {
			return NextResponse.json(
				{ error: "Invitation code is not configured" },
				{ status: 500 },
			);
		}

		if (!code) {
			return NextResponse.json(
				{ error: "Missing invitation code" },
				{ status: 400 },
			);
		}

		if (code !== invite) {
			return NextResponse.json(
				{ error: "Invalid invitation code" },
				{ status: 401 },
			);
		}

		return NextResponse.json({ valid: true });
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}


