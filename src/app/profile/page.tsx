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
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left content column */}
      <div className="flex flex-col gap-6 p-6 md:p-10">
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
        
        <div className="flex-1 max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and connected services
            </p>
            <Separator className="mt-4" />
          </div>
          
          <Card className="w-full">
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
      
      {/* Right background column */}
      <div className="bg-muted relative hidden lg:block">
       <Image
         src="https://storage.googleapis.com/ragable-static/grainient-2.png"
         alt="Abstract background"
         className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
          priority
        />
        
        {/* Overlay with a quote or message */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="bg-background/80 backdrop-blur-sm p-8 rounded-xl max-w-md">
            <h2 className="text-xl font-medium mb-4">Your AI learning partner</h2>
            <p className="text-muted-foreground">
              Manage your account settings here. Connect with third-party services to enhance your experience and tailor Ragable to your needs.
            </p>
          </div>
        </div>
      </div>
      
      {/* TopRightMenu for navigation - positioned absolutely */}
      <div className="absolute top-4 right-4 z-50">
        <TopRightMenu user={user} />
      </div>
    </div>
  );
}
