import { Suspense } from "react";
import { LoginPageClient } from "./login-client";

export default function LoginPage() {
	// Server components can't use hooks; delegate to client component
	// Client component will check for existing auth and auto-redirect if needed
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoginPageClient />
		</Suspense>
	);
}
