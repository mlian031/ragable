"use client"; // Needs to be a client component for SignOutButton interaction later

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LogIn, User as UserIcon } from "lucide-react";
import { type User } from "@supabase/supabase-js"; // Import User type
import { Button } from "./ui/button"; // Import Button for Sign In link
import { SignOutButton } from "./SignOutButton"; // Import the SignOutButton
import { SimpleThemeToggle } from "./simple-theme-toggle"; // Import SimpleThemeToggle

// Define props for the component
interface TopRightMenuProps {
  user: User | null;
}

export function TopRightMenu({ user }: TopRightMenuProps) {
  // Accept user prop
  return (
    <div className="fixed top-4 right-4 z-50 backdrop:blur-lg bg-background/80 rounded-lg">
      {" "}
      {/* Added z-index */}
      <div className="flex flex-row items-center space-x-2 backdrop-blur-lg bg-background/80 rounded-lg p-2 border">
        {" "}
        {/* Adjusted styling */}
        <div className="px-1">
          <Link href="/settings" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
            >
              <span>Settings</span>
            </Button>
          </Link>
        </div>
        <div className="px-1">
          <Link href="/chat" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
            >
              <span>Chat</span>
            </Button>
          </Link>
        </div>
        <div className="px-1"> {/* Wrap the toggle */}
          <SimpleThemeToggle />
        </div>
        {user ? (
          <>
            {/* Display user email or placeholder */}
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              <Link
                href="/profile"
                className="flex items-center space-x-1"
                passHref
              >
                <UserIcon className="h-3 w-3" />
                <span className="hover:underline underline-offset-2">
                  {user.email || "Account"}
                </span>
              </Link>
            </Badge>
            {/* Use the actual SignOutButton component */}
            <SignOutButton />
          </>
        ) : (
          // Show Sign In link if not logged in
          <Link href="/login" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
            >
              <LogIn className="h-3 w-3" />
              <span>Sign In</span>
            </Button>
          </Link>
        )}
        {/* Optional: Keep other links like Settings if needed */}
        {/* <div className="px-1"> ... Settings Link ... </div> */}
      </div>
    </div>
  );
}
