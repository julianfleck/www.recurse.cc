// Auth API helpers for Auth0

const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
const AUTH0_AUDIENCE = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
const AUTH0_DB_REALM =
  process.env.NEXT_PUBLIC_AUTH0_DB_CONNECTION ||
  "Username-Password-Authentication";

export type PasswordLoginResult = {
  accessToken: string;
  idToken?: string;
  tokenType: string;
  expiresIn?: number;
  userInfo: unknown;
};

export async function loginWithPassword(
  username: string,
  password: string
): Promise<PasswordLoginResult> {
  if (!AUTH0_DOMAIN) {
    throw new Error("Auth0 domain not configured");
  }
  if (!AUTH0_CLIENT_ID) {
    throw new Error("Auth0 clientId not configured");
  }

  const tokenRes = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      client_id: AUTH0_CLIENT_ID,
      ...(AUTH0_AUDIENCE ? { audience: AUTH0_AUDIENCE } : {}),
      username,
      password,
      realm: AUTH0_DB_REALM,
      scope: "openid profile email",
    }),
  });

  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    const message =
      tokenJson?.error_description || tokenJson?.error || "Login failed";
    throw new Error(message);
  }

  const accessToken = tokenJson.access_token as string;
  const idToken = tokenJson.id_token as string | undefined;
  const tokenType = tokenJson.token_type as string;
  const expiresIn = tokenJson.expires_in as number | undefined;

  const userRes = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const userInfo = await userRes.json();

  return { accessToken, idToken, tokenType, expiresIn, userInfo };
}

export type ApiJson = { error?: string } & Record<string, unknown>;

export async function signupUser(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<ApiJson> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiJson;
  if (!res.ok) {
    throw new Error(json.error || "Signup failed");
  }
  return json;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const res = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    let error = "Resend verification failed";
    try {
      const text = await res.text();
      const json = JSON.parse(text) as ApiJson;
      error = json.error || error;
    } catch {
      // non-JSON body, keep default error
    }
    throw new Error(error);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    let error = "Password reset request failed";
    const text = await res.text();
    try {
      const json = JSON.parse(text) as ApiJson;
      error = json.error || error;
    } catch {
      // non-JSON body, keep default error
    }
    throw new Error(error);
  }
}
