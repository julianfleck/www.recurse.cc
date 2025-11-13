// Google OAuth callback is now handled by Auth0
// This route is kept for backward compatibility but redirects to login

import { NextResponse } from "next/server";

export function GET() {
	return NextResponse.redirect("/login");
}
