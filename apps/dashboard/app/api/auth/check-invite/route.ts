import { NextResponse } from "next/server";
import inviteStore from "@/invites.json";

type InviteEntry = {
	email: string;
	token: string;
	createdAt: string;
	note?: string;
};

type InviteFile = {
	invites: InviteEntry[];
};

export async function POST(request: Request) {
	try {
		const { code } = (await request.json()) as { code?: string };

		const store = inviteStore as InviteFile;
		const invites = Array.isArray(store.invites) ? store.invites : [];

		if (invites.length === 0) {
			return NextResponse.json(
				{ error: "Invitation codes are not configured" },
				{ status: 500 },
			);
		}

		if (!code) {
			return NextResponse.json(
				{ error: "Missing invitation code" },
				{ status: 400 },
			);
		}

		const trimmed = code.trim();
		const isValid = invites.some((entry) => entry.token === trimmed);

		if (!isValid) {
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


