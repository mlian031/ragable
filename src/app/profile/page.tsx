import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopRightMenu } from '@/components/TopRightMenu';
import { ProviderList } from '@/components/profile/ProviderList';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should technically be handled by middleware, but added as a safeguard
    return redirect('/login');
  }

  const { data: identitiesData } =
    await supabase.auth.getUserIdentities();

  const identities = identitiesData?.identities;

  return (
    <div className="min-h-svh flex flex-col items-center">
      {/* Left content column */}
      <div className="flex flex-col gap-6 p-6 md:p-10 animate-fade-in transition-opacity duration-700">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
             <Image
               src="https://storage.googleapis.com/ragable-static/grainient-2.png"
               alt="Logo"
               className="h-6 w-6 rounded-md"
                width={24}
                height={24}
              />
            </div>
            Ragable Inc.
          </Link>
        </div>
        
        <div className="flex-1 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3">Your Profile</h1>
            <p className="text-muted-foreground text-base">
              Manage your account settings and connected services
            </p>
            <Separator className="mt-4" />
          </div>
          
          <Card className="w-full transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
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
                configuredProviders={['discord', 'google']}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* TopRightMenu for navigation - positioned absolutely */}
      <div className="absolute top-4 right-4 z-50">
        <TopRightMenu user={user} />
      </div>
    </div>
  );
}
