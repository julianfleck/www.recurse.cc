import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  // Server components can't use hooks; this is a client-only guard via middleware.
  // Keep page simple and let Auth0 redirect callback send users to /dashboard.
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-muted p-6 md:p-10">
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
