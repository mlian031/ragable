'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // Client-side client
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh the current route to update server components like layout
    // Optionally, redirect to home or auth page:
    // router.push('/');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
    >
      <LogOut className="h-3 w-3" />
      <span>Sign Out</span>
    </Button>
  );
}
