'use client';

import React, { useState } from 'react';
import { type UserIdentity, type Provider } from '@supabase/supabase-js';
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
} from '@/components/ui/alert-dialog';
import { deleteUserAccount } from '@/app/auth/actions';
import { CheckCircle2, AlertCircle } from 'lucide-react'; // Import icons

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
      provider: provider as Provider, // Use the specific Provider type
      options: {
        // Redirect back to the profile page after linking
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      console.error(`Error linking ${provider}:`, error);
      toast({
        title: 'Connection Error',
        description: `Failed to connect ${provider}. ${error?.message}`,
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

  // Helper to get provider icon
  const getProviderIcon = (provider: string) => {
    switch(provider.toLowerCase()) {
      case 'google':
        return <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg></>;
      case 'discord':
        return <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" className="h-5 w-5 mr-2">
        <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
      </svg></>;
      default:
        return null;
    }
  };

  // Helper to capitalize provider names for display
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      {/* Email Display */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <div className="relative">
          <Input 
            id="email" 
            type="email" 
            value={userEmail || ''} 
            disabled 
            className="bg-muted/30 pl-3 pr-24"
          />
          <Badge 
            variant="outline" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary/10 text-primary text-xs"
          >
            Primary
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This is your primary login email
        </p>
      </div>

      <Separator className="my-6" />

      {/* Connected Accounts */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
          Connected Accounts
        </h3>
        {connectedProviders.length > 0 ? (
          <ul className="space-y-3">
            {connectedProviders.map((provider) => (
              <li
                key={provider}
                className="flex items-center justify-between p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider)}
                  <span className="font-medium">{capitalize(provider)}</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  Connected
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg bg-muted/5 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            No external accounts are linked
          </div>
        )}
      </div>

      {/* Available Connections */}
      {availableProviders.length > 0 && (
        <div>
          <Separator className="my-6" />
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
            Available Connections
          </h3>
          <ul className="space-y-3">
            {availableProviders.map((provider) => (
              <li
                key={provider}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider)}
                  <span className="font-medium">{capitalize(provider)}</span>
                </div>
                <Button
                  onClick={() => handleConnect(provider)}
                  disabled={isLoading[provider]}
                  size="sm"
                  variant="outline"
                  className="font-medium"
                >
                  {isLoading[provider] ? 'Connecting...' : 'Connect'}
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Connect additional accounts to enable simpler sign-in
          </p>
        </div>
      )}

      <Separator className="my-8" />

      {/* Delete Account Section */}
      <div className="rounded-lg border border-destructive/20 p-5 bg-destructive/5">
        <h3 className="text-lg font-medium mb-3 text-destructive flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently remove your account and all associated data. This action cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting} className="w-full sm:w-auto">
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
      </div>
    </div>
  );
}
