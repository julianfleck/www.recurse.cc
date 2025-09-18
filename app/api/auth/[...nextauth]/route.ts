// This file is kept for backward compatibility but Auth0 is now handled via embedded login
// The Google OAuth callback is handled in app/auth/google/route.ts

export async function GET() {
  return Response.redirect("/login");
}

export async function POST() {
  return Response.redirect("/login");
}
