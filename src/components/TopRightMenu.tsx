"use client"; // Needs to be a client component for SignOutButton interaction later

import React, { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 backdrop:blur-lg bg-background/80 rounded-lg p-1 sm:p-2 border">
      {/* Hamburger toggle button, visible only on mobile */}
      <button
        className="sm:hidden p-2 rounded border"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {/* Simple hamburger icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menu items */}
      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } sm:flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 mt-2 sm:mt-0`}
      >
        <div className="px-1">
          <Link href="/settings" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs w-full sm:w-auto justify-start sm:justify-center"
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
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs w-full sm:w-auto justify-start sm:justify-center"
            >
              <span>Chat</span>
            </Button>
          </Link>
        </div>
        <div className="px-1">
          <SimpleThemeToggle />
        </div>
        {user ? (
          <>
            <Badge variant="secondary" className="px-2 py-1 text-xs w-full sm:w-auto">
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
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs w-full sm:w-auto justify-start sm:justify-center"
            >
              <LogIn className="h-3 w-3" />
              <span>Sign In</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
