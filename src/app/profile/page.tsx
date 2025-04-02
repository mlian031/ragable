import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Removed Badge, AlertCircle, Alert, AlertDescription, AlertTitle imports
import { TopRightMenu } from '@/components/TopRightMenu';
import { ProviderList } from '@/components/profile/ProviderList'; // Import the new client component

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should technically be handled by middleware, but added as a safeguard
    return redirect('/login');
  }

  const { data: identitiesData, error: identitiesError } =
    await supabase.auth.getUserIdentities();

  const identities = identitiesData?.identities;

  return (
    <div className="flex justify-center items-start pt-16 min-h-screen">
      <div className="mb-4">
      <TopRightMenu user={user} />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage the external accounts linked to your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderList
            initialIdentities={identities}
            userEmail={user?.email}
            configuredProviders={['discord', 'google']} // Pass configured providers
          />
        </CardContent>
      </Card>
    </div>
  );
}
