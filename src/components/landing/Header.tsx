"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <header className="py-4 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="tracking-widest font-medium text-xl"> {/* Added dark:text */}
            Ragable Inc.
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-medium" // Added dark:text/hover
          >
            Resources
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium" // Added dark:text/hover
          >
            Pricing
          </Link>
          <Link
            href="/"
            className="text-sm font-medium" // Added dark:text/hover
          >
            Contact Sales
          </Link>
          <Link
            href={user ? "/profile" : "/signup"}
            className="dark:bg-neutral-800 dark:border-2 text-white dark:text-white block text-sm font-medium px-4 py-2 bg-primary rounded-md hover:bg-primary/90"
          >
            {user ? "Dashboard" : "Sign up for free"}
          </Link>
          <ThemeToggle /> {/* Add ThemeToggle here */}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="" // Added dark:text for SVG stroke
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-6 px-6 space-y-4 flex flex-col">
          <Link
            href="/"
            className="text-sm font-medium"
          >
            Resources
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/"
            className="block text-sm font-medium "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact Sales
          </Link>
          <Link
            href={user ? "/profile" : "/signup"}
            className="dark:bg-neutral-800 dark:border-2 text-white dark:text-white block text-sm font-medium px-4 py-2 bg-primary rounded-md hover:bg-primary/90 w-full text-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {user ? "Dashboard" : "Start using Ragable free"}
          </Link>
          <div className="pt-4"> {/* Add some spacing */}
            <ThemeToggle /> {/* Add ThemeToggle here */}
          </div>
        </div>
      )}
    </header>
  );
}
