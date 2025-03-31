import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Use Badge component
import { ArrowUpRight } from "lucide-react";

export function TopRightMenu() {

  return (
    <div className="absolute top-4 right-4 p-4">
      <div className="flex flex-row space-x-4 backdrop-blur-lg bg-white/30 rounded-lg p-2">
        <div className="px-2">
          <Badge variant="outline" className="px-4 flex flex-row">
            <Link href="/" className="hover:underline underline-offset-4">
              Back
            </Link>
            <ArrowUpRight />
          </Badge>
        </div>
        <div className="px-2">
          <Badge variant="outline" className="px-4 flex flex-row">
            <Link href="/about" className="hover:underline underline-offset-4">
              Settings
            </Link>
            <ArrowUpRight />
          </Badge>
        </div>
        <div className="px-2">
          <Badge variant="outline" className="px-4 flex flex-row">
            <Link href="/account" className="hover:underline underline-offset-4">
              Account
            </Link>
            <ArrowUpRight />
          </Badge>
        </div>
      </div>
    </div>
  );
}
