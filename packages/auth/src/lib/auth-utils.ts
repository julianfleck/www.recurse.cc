export function isOnAuthPage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return ["/login", "/signup", "/forgot-password"].includes(
    window.location.pathname,
  );
}

/**
 * Decode the payload of a JWT token.
 * Returns null if the token is not a valid JWT or the payload can't be parsed.
 */
export function decodeJwtPayload<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(token: string): TPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1]
      // Replace URL-safe base64 chars
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    // Add padding if necessary
    const padded =
      base64 + "===".slice(0, (4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as TPayload;
  } catch {
    return null;
  }
}

/**
 * Basic JWT expiration check using the `exp` claim (in seconds since epoch).
 * Returns true when the token is expired or about to expire within `skewSeconds`.
 */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  if (!payload?.exp) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds + skewSeconds;
}

type TokenRefresher = () => Promise<string | undefined>;

let tokenRefresher: TokenRefresher | null = null;
let refreshInFlight: Promise<string | undefined> | null = null;

/**
 * Register a shared token refresher that knows how to obtain a fresh access token.
 *
 * Apps should call this from within their Auth0/AuthInit setup, wiring it to
 * `getAccessTokenSilently` (or any other refresh mechanism) and updating the auth store.
 */
export function registerTokenRefresher(refresher: TokenRefresher): void {
  tokenRefresher = refresher;
}

/**
 * Ensure we have a valid access token.
 *
 * - If the current token is missing, we'll try the registered refresher.
 * - If the current token looks expired (based on `exp`), we'll call the refresher,
 *   de-duplicating concurrent refreshes via a shared in-flight promise.
 * - If there's no refresher, we just return the current token and let callers
 *   handle authentication errors.
 */
export async function ensureValidAccessToken(
  currentToken?: string,
): Promise<string | undefined> {
  // No token at all – nothing we can validate; let the refresher try.
  if (!currentToken) {
    if (!tokenRefresher) {
      return undefined;
    }
    return tokenRefresher();
  }

  // If we don't have a refresher registered, just return what we have.
  if (!tokenRefresher) {
    return currentToken;
  }

  // If the token still looks valid, reuse it.
  if (!isJwtExpired(currentToken)) {
    return currentToken;
  }

  // Token appears expired – coordinate a single refresh across callers.
  if (!refreshInFlight) {
    refreshInFlight = tokenRefresher().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

