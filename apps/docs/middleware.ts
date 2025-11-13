import { NextResponse } from "next/server";

// Note: SPA auth is client-side; avoid gating in middleware.
// Keep middleware as a no-op to prevent redirect loops.
export default function middleware() {
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*"],
};
