import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const connection =
      process.env.NEXT_PUBLIC_AUTH0_DB_CONNECTION ||
      "Username-Password-Authentication";

    if (!(domain && clientId)) {
      return NextResponse.json(
        { error: "Auth0 not configured" },
        { status: 500 }
      );
    }

    // Auth0 DB change password endpoint
    const resp = await fetch(
      `https://${domain}/dbconnections/change_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          email,
          connection,
        }),
      }
    );

    // Auth0 returns 200 even on some errors, so we don't parse message
    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: text || "Failed to request password reset" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (_e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
