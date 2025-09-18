"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useAuthStore } from "./auth/auth-store";

function initialsFromName(name?: string, email?: string) {
  const source = name || email || "?";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

const COPY_FEEDBACK_MS = 1500;

function DevTokenViewer({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const segments = token.split(".");
  const segmentsCount = segments.length;
  const JWS_SEGMENTS = 3;
  const JWE_SEGMENTS = 5;
  let tokenKind = "Unknown";
  if (segmentsCount === JWS_SEGMENTS) {
    tokenKind = "JWS (signed)";
  } else if (segmentsCount === JWE_SEGMENTS) {
    tokenKind = "JWE (encrypted)";
  }
  let headerAlg = "";
  let headerEnc = "";
  if (segments[0]) {
    try {
      const base64 = segments[0].replace(/-/g, "+").replace(/_/g, "/");
      const json = atob(base64);
      const headerJson = JSON.parse(json) as { alg?: string; enc?: string };
      headerAlg = headerJson.alg || "";
      headerEnc = headerJson.enc || "";
    } catch {
      // ignore header parse failures
    }
  }
  const headerParts: string[] = [];
  if (headerAlg.length > 0) {
    headerParts.push(`alg: ${headerAlg}`);
  }
  if (headerEnc.length > 0) {
    headerParts.push(`enc: ${headerEnc}`);
  }
  const headerDetail = headerParts.length > 0 ? `, ${headerParts.join(", ")}` : "";
  return (
    <>
      <DropdownMenuLabel>
        Access Token (dev only) — {tokenKind}
        {headerDetail}
      </DropdownMenuLabel>
      <div className="px-2 pb-2">
        <div className="flex items-center gap-2">
          <Input className="font-mono text-xs" readOnly value={token} />
          <Button
            onClick={() => {
              navigator.clipboard
                .writeText(token)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
                })
                .catch(() => {
                  setCopied(false);
                });
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </>
  );
}

export function UserProfile({
  showDashboardLink = false,
}: {
  showDashboardLink?: boolean;
}) {
  const { user: sdkUser, isAuthenticated, isLoading } = useAuth0();
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const displayUser = (isAuthenticated ? sdkUser : storeUser) as
    | { name?: string; email?: string; picture?: string }
    | undefined;
  const isClientAuthenticated = Boolean(
    isAuthenticated || storeToken || storeUser
  );
  const canShowToken = process.env.NODE_ENV !== "production";

  const avatarFallback = useMemo(
    () => initialsFromName(displayUser?.name, displayUser?.email),
    [displayUser?.name, displayUser?.email]
  );

  const isLikelyGoogleDefault = Boolean(
    displayUser?.picture?.includes("googleusercontent.com")
  );
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
              <span className="truncate font-medium text-sm">
                {displayUser?.name || "Account"}
              </span>
              <span className="truncate text-fd-muted-foreground text-xs">
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
