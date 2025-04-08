import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopRightMenu } from '@/components/TopRightMenu';
import { 
  CircleUser, 
  BarChart3,
  CreditCard,
  ArrowRight, 
  CheckCircle2,
  Clock,
  AlertCircle,
  InfinityIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Plan limits
type PlanType = 'free' | 'pro' | 'team';

const PLAN_LIMITS = {
  free: {
    messages: 10,
    storage: 10, // MB
    courses: 3,
    aiVerification: 10,
    examGeneration: 10
  },
  pro: {
    messages: Infinity,
    storage: 5120, // 5GB in MB
    courses: 20,
    aiVerification: Infinity,
    examGeneration: Infinity
  },
  team: {
    messages: Infinity,
    storage: 20480, // 20GB in MB
    courses: 100,
    aiVerification: Infinity,
    examGeneration: Infinity
  }
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, daily_message_count, last_message_reset_at')
    .eq('id', user.id)
    .single();

  const userPlan = (profile?.plan_id as PlanType) || 'free';
  const planLimits = PLAN_LIMITS[userPlan];

  const messageUsage = profile ? Math.min(100, (profile.daily_message_count / planLimits.messages) * 100) : 0;

  const lastReset = profile?.last_message_reset_at 
    ? new Date(profile.last_message_reset_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div className="min-h-svh flex flex-col items-center">
      <div className="flex flex-col gap-6 p-6 md:p-10 max-w-5xl w-full animate-fade-in transition-opacity duration-700">
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-3">Settings</h1>
          <p className="text-muted-foreground text-base">
            Manage your account settings and monitor your usage
          </p>
          <Separator className="mt-4" />
        </div>

        <div className="flex flex-col gap-6">
          {/* Usage Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Current Plan</CardTitle>
                <Badge className="capitalize font-medium bg-primary/10 text-primary hover:bg-primary/20">
                  {userPlan}
                </Badge>
              </div>
              <CardDescription>
                Your current subscription and usage limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Daily Messages
                  </div>
                  <span className="text-muted-foreground flex flex-row items-center">
                    {planLimits.messages === Infinity ? <InfinityIcon className='h-4'/> : profile?.daily_message_count || 0} / {planLimits.messages === Infinity ? 'Unlimited' : planLimits.messages}
                  </span>
                </div>
                <Progress value={messageUsage} className="h-2 transition-all duration-700" />
                <p className="text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline-block mr-1" />
                  Last reset: {lastReset}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full mt-2 transition-transform duration-300 hover:scale-105 hover:shadow-lg" 
                style={{
                  background: 'url(https://storage.googleapis.com/ragable-static/grainient-2.png) no-repeat center center',
                }}
              >
                <Link href="/pricing" className='dark:text-gray-100 hover:dark:text-gray-300'>
                  Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Billing Section */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your billing details and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4 flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium capitalize">{userPlan} Plan</span>
                    <span className="text-sm text-muted-foreground">Current billing period</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">
                    Active
                  </Badge>
                </div>
                <Separator />
                <div className="text-sm border rounded-md px-4 py-3 flex items-start space-x-3 bg-background">
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p>Sorry, we know this is inconvenient but if you want to upgrade, please join our Discord and ping our team.</p>
                    <Button variant="link" className="h-auto p-0 text-primary" asChild>
                      <Link href="https://discord.gg/yourlink" target="_blank">
                        Join our Discord →
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {userPlan === 'free' ? (
                    <p className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Free plan - No payment method required
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Next billing date: April 15, 2024
                      </p>
                      <p className="mt-2 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Payment method: •••• 4242
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update payment method
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View billing history
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Manage your account settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/profile">
                  <CircleUser className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <TopRightMenu user={user} />
      </div>
    </div>
  );
}
