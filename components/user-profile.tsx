"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/lib/api";
import { useAuthStore } from "./auth/auth-store";

// Constants
const AUTH_INIT_DELAY_MS = 1000; // 1 second delay for auth initialization

type UserProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  role: string;
  is_active: boolean;
  primary_identity_id: string;
  username: string;
  profile_picture_url: string | null;
  display_name: string;
  custom_api_rate_limit: number | null;
  custom_auth_rate_limit: number | null;
  custom_max_documents: number | null;
  custom_max_storage_mb: number | null;
  custom_max_daily_query_requests: number | null;
  custom_max_daily_add_requests: number | null;
  current_document_count: number;
  current_storage_mb: number;
  daily_query_request_count: number;
  daily_add_request_count: number;
  daily_reset_date: string;
  last_api_request: string | null;
  api_request_count_window: number;
  last_auth_request: string | null;
  auth_request_count_window: number;
};

function initialsFromName(name?: string, email?: string) {
  const source = name || email || "?";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}


export function UserProfile({
  showDashboardLink = false,
}: {
  showDashboardLink?: boolean;
}) {
  const { user: sdkUser, isAuthenticated, isLoading } = useAuth0();
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const displayUser = (isAuthenticated ? sdkUser : storeUser) as
    | { name?: string; email?: string; picture?: string }
    | undefined;
  const isClientAuthenticated = Boolean(
    isAuthenticated || storeToken || storeUser
  );

  const avatarFallback = useMemo(
    () => initialsFromName(displayUser?.name, displayUser?.email),
    [displayUser?.name, displayUser?.email]
  );

  const isLikelyGoogleDefault = Boolean(
    displayUser?.picture?.includes("googleusercontent.com")
  );
  const showImage = Boolean(displayUser?.picture && !isLikelyGoogleDefault);

  const fetchUserProfile = useCallback(async () => {
    if (!isClientAuthenticated) {
      return;
    }

    try {
      const response = await apiService.get<UserProfile>("/users/me");
      setUserProfile(response.data);
    } catch {
      // Silently handle profile fetch errors
    }
  }, [isClientAuthenticated]);

  useEffect(() => {
    if (isClientAuthenticated && !isLoading) {
      // Add a small delay to allow auth to initialize
      const timer = setTimeout(() => {
        fetchUserProfile();
      }, AUTH_INIT_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [isClientAuthenticated, isLoading, fetchUserProfile]);

  if (isLoading || !isClientAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full" size="icon" variant="ghost">
          <Avatar className="size-7">
            {showImage ? (
              <AvatarImage
                alt={displayUser?.name ?? "User"}
                src={displayUser?.picture}
              />
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
                  <AvatarImage
                    alt={displayUser?.name ?? "User"}
                    src={displayUser?.picture}
                  />
                ) : null}
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                {userProfile?.role && userProfile.role !== "user" && (
                  <div className="mb-1">
                    <Badge
                      variant="secondary"
                      className="capitalize text-xs px-1.5 py-0.5"
                    >
                      {userProfile.role}
                    </Badge>
                  </div>
                )}
                <span className="font-medium text-sm truncate">
                  {userProfile?.display_name || displayUser?.name || "Account"}
                </span>
                <span className="text-fd-muted-foreground text-xs truncate">
                  {displayUser?.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        {showDashboardLink ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {/* {canShowToken && storeToken ? (
          <DevTokenViewer token={storeToken} />
          ) : null} */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/logout">Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
