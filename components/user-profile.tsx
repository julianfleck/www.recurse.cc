"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "./auth/auth-store";

function initialsFromName(name?: string, email?: string) {
  const source = name || email || "?";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserProfile({ showDashboardLink = false }: { showDashboardLink?: boolean }) {
  const { user: sdkUser, isAuthenticated, isLoading } = useAuth0();
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const displayUser = (isAuthenticated ? sdkUser : storeUser) as
    | { name?: string; email?: string; picture?: string }
    | undefined;
  const isClientAuthenticated = Boolean(isAuthenticated || storeToken || storeUser);

  const avatarFallback = useMemo(
    () => initialsFromName(displayUser?.name, displayUser?.email),
    [displayUser?.name, displayUser?.email]
  );

  const isLikelyGoogleDefault = Boolean(displayUser?.picture?.includes("googleusercontent.com"));
  const showImage = Boolean(displayUser?.picture && !isLikelyGoogleDefault);

  if (isLoading || !isClientAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full" size="icon" variant="ghost">
          <Avatar className="size-7">
            {showImage ? (
              <AvatarImage alt={displayUser?.name ?? "User"} src={displayUser?.picture} />
            ) : null}
            <AvatarFallback className="bg-accent text-accent-foreground">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
            {showImage ? (
              <AvatarImage alt={displayUser?.name ?? "User"} src={displayUser?.picture} />
            ) : null}
              <AvatarFallback className="bg-accent text-accent-foreground">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-sm">{displayUser?.name || "Account"}</span>
              <span className="truncate text-fd-muted-foreground text-xs">
                {displayUser?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showDashboardLink ? (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
        ) : null}
        {showDashboardLink ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout">Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
