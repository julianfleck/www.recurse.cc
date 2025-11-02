"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@recurse/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@recurse/ui/components/dropdown-menu";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuthStore } from "@recurse/auth";
import { getDashboardUrl } from "@/lib/utils";

function initialsFromName(name?: string, email?: string) {
  const source = name || email || "?";
  if (source.length >= 2) {
    return source.slice(0, 2).toUpperCase();
  }
  return "??";
}

export function UserProfile() {
  const { user: sdkUser, isAuthenticated, isLoading } = useAuth0();
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const pathname = usePathname();
  const dashboardUrl = getDashboardUrl();
  
  // Use SDK user if authenticated, otherwise fall back to store user
  const displayUser = (isAuthenticated ? sdkUser : storeUser) as
    | { name?: string; email?: string; picture?: string }
    | undefined;
  const isClientAuthenticated = Boolean(
    isAuthenticated || storeToken || storeUser
  );
  
  const avatarFallback = initialsFromName(displayUser?.name, displayUser?.email);
  const showImage = Boolean(displayUser?.picture);
  
  // Include current location as returnTo so user comes back here after login
  const returnTo = typeof window !== "undefined" 
    ? encodeURIComponent(`${window.location.origin}${pathname}`)
    : "";
  const loginUrl = `${dashboardUrl}/login${returnTo ? `?returnTo=${returnTo}` : ""}`;
  const signupUrl = `${dashboardUrl}/signup${returnTo ? `?returnTo=${returnTo}` : ""}`;
  
  // Show loading state
  if (isLoading) {
    return (
      <Avatar className="size-8">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }
  
  // If authenticated, show user info with logout option
  if (isClientAuthenticated && displayUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Avatar className="size-8">
              {showImage && displayUser.picture ? (
                <AvatarImage src={displayUser.picture} alt={displayUser.name || displayUser.email || "User"} />
              ) : null}
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              {displayUser.name && (
                <p className="text-sm font-medium leading-none">{displayUser.name}</p>
              )}
              {displayUser.email && (
                <p className="text-xs leading-none text-muted-foreground">{displayUser.email}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link 
              href={`${dashboardUrl}/logout${returnTo ? `?returnTo=${returnTo}` : ""}`} 
              className="flex items-center gap-2"
            >
              <LogOut className="size-4" />
              Log Out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Not authenticated: show placeholder with login/signup options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="size-8">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={loginUrl} className="flex items-center gap-2">
            <LogIn className="size-4" />
            Log In
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={signupUrl} className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Sign Up
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
