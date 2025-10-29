"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, UserPlus } from "lucide-react";
import { getDashboardUrl } from "@/lib/utils";

export function UserProfile() {
  const pathname = usePathname();
  const dashboardUrl = getDashboardUrl();
  
  // Include current location as returnTo so user comes back here after login
  const returnTo = typeof window !== "undefined" 
    ? encodeURIComponent(`${window.location.origin}${pathname}`)
    : "";
  const loginUrl = `${dashboardUrl}/login${returnTo ? `?returnTo=${returnTo}` : ""}`;
  const signupUrl = `${dashboardUrl}/signup${returnTo ? `?returnTo=${returnTo}` : ""}`;
  
  // For docs site, always show placeholder with login/signup options
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
