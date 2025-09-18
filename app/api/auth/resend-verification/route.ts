import { NextResponse } from "next/server";

async function getMgmtToken(
  domain: string,
  clientId: string,
  clientSecret: string
) {
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json?.error_description || json?.error || "Failed to get management token"
    );
  return json.access_token as string;
}

export async function POST(request: Request) {
  try {
    const { email, user_id: providedUserId } = (await request.json()) as {
      email?: string;
      user_id?: string;
    };

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId =
      process.env.AUTH0_MGMT_CLIENT_ID ||
      process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const clientSecret =
      process.env.AUTH0_MGMT_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET;
    const spaClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    if (!(domain && clientId && clientSecret && spaClientId)) {
      return NextResponse.json(
        { error: "Auth0 configuration missing" },
        { status: 500 }
      );
    }

    const token = await getMgmtToken(domain, clientId, clientSecret);

    // Resolve user_id if only email provided
    let user_id = providedUserId;
    if (!user_id && email) {
      const lookup = await fetch(
        `https://${domain}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const users = (await lookup.json()) as Array<{ user_id: string }>;
      if (!(lookup.ok && Array.isArray(users)) || users.length === 0) {
        return NextResponse.json(
          { error: "User not found for email" },
          { status: 404 }
        );
      }
      user_id = users[0].user_id;
    }
    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user identifier" },
        { status: 400 }
      );
    }

    // Trigger verification email job
    const jobRes = await fetch(
      `https://${domain}/api/v2/jobs/verification-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id, client_id: spaClientId }),
      }
    );
    const jobJson = await jobRes.json();
    if (!jobRes.ok) {
      return NextResponse.json(
        {
          error:
            jobJson?.message ||
            jobJson?.error ||
            "Failed to enqueue verification",
        },
        { status: jobRes.status }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
