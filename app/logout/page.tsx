"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export default function LogoutPage() {
  const { logout, isLoading } = useAuth0();

  useEffect(() => {
    logout({
      logoutParams: {
        returnTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
  }, [logout]);

  return isLoading ? null : null;
}


