import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { email, password, name, inviteCode } = (await request.json()) as {
			email?: string;
			password?: string;
			name?: string;
			inviteCode?: string;
		};
		if (!(email && password)) {
			return NextResponse.json(
				{ error: "Missing email or password" },
				{ status: 400 },
			);
		}

		const invite = process.env.DASHBOARD_INVITE_CODE;
		if (!invite) {
			return NextResponse.json(
				{ error: "Invitation code is not configured" },
				{ status: 500 },
			);
		}
		if (inviteCode !== invite) {
			return NextResponse.json(
				{ error: "Invalid or missing invitation code" },
				{ status: 401 },
			);
		}

		const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
		const mgmtAudience = `https://${domain}/api/v2/`;
		const clientId =
			process.env.AUTH0_MGMT_CLIENT_ID ||
			process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
		const clientSecret =
			process.env.AUTH0_MGMT_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET;
		const connection =
			process.env.NEXT_PUBLIC_AUTH0_DB_CONNECTION ||
			"Username-Password-Authentication";

		if (!(domain && clientId && clientSecret)) {
			return NextResponse.json(
				{ error: "Auth0 management configuration missing" },
				{ status: 500 },
			);
		}

		// Get Management API token
		const tokenRes = await fetch(`https://${domain}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "client_credentials",
				client_id: clientId,
				client_secret: clientSecret,
				audience: mgmtAudience,
			}),
		});
		const tokenJson = await tokenRes.json();
		if (!tokenRes.ok) {
			return NextResponse.json(
				{
					error:
						tokenJson?.error_description ||
						tokenJson?.error ||
						"Failed to get management token",
				},
				{ status: 500 },
			);
		}

		// Create user via Management API
		const createRes = await fetch(`https://${domain}/api/v2/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${tokenJson.access_token}`,
			},
			body: JSON.stringify({
				email,
				password,
				connection,
				name,
				verify_email: true,
			}),
		});
		const createJson = await createRes.json();
		if (!createRes.ok) {
			return NextResponse.json(
				{ error: createJson?.message || createJson?.error || "Signup failed" },
				{ status: createRes.status },
			);
		}

		return NextResponse.json({
			success: true,
			user_id: createJson?.user_id,
			email,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
