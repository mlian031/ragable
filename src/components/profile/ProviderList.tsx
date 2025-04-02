'use client';

import React, { useState } from 'react';
import { type UserIdentity } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // Use client-side Supabase
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog components
import { deleteUserAccount } from '@/app/auth/actions'; // Import the server action

interface ProviderListProps {
  initialIdentities: UserIdentity[] | undefined;
  userEmail: string | undefined;
  configuredProviders: string[]; // e.g., ['discord', 'google']
}

export function ProviderList({
  initialIdentities = [], // Default to empty array
  userEmail,
  configuredProviders,
}: ProviderListProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false); // State for deletion loading

  const connectedProviders = initialIdentities.map(
    (identity) => identity.provider
  );
  const availableProviders = configuredProviders.filter(
    (provider) => !connectedProviders.includes(provider)
  );

  const handleConnect = async (provider: string) => {
    setIsLoading((prev) => ({ ...prev, [provider]: true }));
    const supabase = createClient(); // Get client-side instance
    const { error } = await supabase.auth.linkIdentity({
      provider: provider as any, // Cast needed as Supabase types might be specific
      options: {
        // Redirect back to the profile page after linking
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      console.error(`Error linking ${provider}:`, error);
      toast({
        title: 'Connection Error',
        description: `Failed to connect ${provider}. ${error.message}`,
        variant: 'destructive',
      });
      setIsLoading((prev) => ({ ...prev, [provider]: false }));
    }
    // No need to set loading to false on success, as the page will redirect/reload
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteUserAccount();
    if (result?.error) {
      toast({
        title: 'Deletion Error',
        description: result.error,
        variant: 'destructive',
      });
      setIsDeleting(false); // Re-enable button on error
    }
    // On success, the server action redirects, so no need to setIsDeleting(false)
  };

  // Helper to capitalize provider names for display
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      {/* Email Display */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={userEmail || ''} disabled />
      </div>

      <Separator />

      {/* Connected Accounts */}
      <div>
        <h3 className="text-lg font-medium mb-3">Connected Accounts</h3>
        {connectedProviders.length > 0 ? (
          <ul className="space-y-2">
            {connectedProviders.map((provider) => (
              <li
                key={provider}
                className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
              >
                <span className="font-medium capitalize">{capitalize(provider)}</span>
                <Badge variant="secondary">Connected</Badge>
                {/* TODO: Add Unlink button later if needed */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No external accounts are linked.
          </p>
        )}
      </div>

      {/* Available Connections */}
      {availableProviders.length > 0 && (
        <div>
          <Separator className="my-4" />
          <h3 className="text-lg font-medium mb-3">Available Connections</h3>
          <ul className="space-y-2">
            {availableProviders.map((provider) => (
              <li
                key={provider}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <span className="font-medium capitalize">{capitalize(provider)}</span>
                <Button
                  onClick={() => handleConnect(provider)}
                  disabled={isLoading[provider]}
                  size="sm"
                  variant="outline"
                >
                  {isLoading[provider] ? 'Connecting...' : 'Connect'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Separator className="my-6" />

      {/* Delete Account Section */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-destructive">
          Danger Zone
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs text-muted-foreground mt-2">
          Permanently remove your account and all associated data.
        </p>
      </div>
    </div>
  );
}
