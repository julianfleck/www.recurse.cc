import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-muted p-6 md:p-10">
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  );
}


