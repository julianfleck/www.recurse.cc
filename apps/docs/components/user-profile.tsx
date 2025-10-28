"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@recurse/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@recurse/ui/components/dropdown-menu";
import { LogIn, UserPlus } from "lucide-react";

export function UserProfile() {
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
          <Link href="https://dashboard.recurse.cc/login" className="flex items-center gap-2">
            <LogIn className="size-4" />
            Log In
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="https://dashboard.recurse.cc/signup" className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Sign Up
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
