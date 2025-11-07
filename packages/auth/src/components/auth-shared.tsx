"use client";

import { Button } from "@recurse/ui/components";

export function AuthDivider({
  label = "Or continue with",
}: {
  label?: string;
}) {
  return (
    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
      <span className="relative z-10 bg-card px-2 text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

type SocialButtonsProps = {
  onGoogle?: () => void | Promise<void>;
  onGithub?: () => void | Promise<void>;
  disabled?: boolean;
};

export function SocialButtons({
  onGoogle,
  onGithub,
  disabled,
}: SocialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        className="w-full"
        disabled={disabled}
        onClick={onGoogle}
        type="button"
        variant="outline"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <title>Google logo</title>
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Continue with Google</span>
      </Button>
      <Button
        className="w-full"
        disabled={disabled}
        onClick={onGithub}
        type="button"
        variant="outline"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <title>GitHub logo</title>
          <path
            d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.1-.76.08-.75.08-.75 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.32 3.52 1 .11-.78.42-1.32.76-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0 0 12 .5z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Continue with GitHub</span>
      </Button>
    </div>
  );
}
