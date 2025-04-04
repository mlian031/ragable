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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    // Redirect to login if not authenticated
    return redirect('/login');
  }

  // Fetch user profile with usage data
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, daily_message_count, last_message_reset_at')
    .eq('id', user.id)
    .single();

  // Default to free plan if not found
  const userPlan = (profile?.plan_id as PlanType) || 'free';
  const planLimits = PLAN_LIMITS[userPlan];
  
  // Calculate usage percentages
  const messageUsage = profile ? Math.min(100, (profile.daily_message_count / planLimits.messages) * 100) : 0;
 
  
  // Format last reset time
  const lastReset = profile?.last_message_reset_at 
    ? new Date(profile.last_message_reset_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and monitor your usage
            </p>
            <Separator className="mt-4" />
          </div>
          
          <Tabs defaultValue="usage" className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage">
              {/* Current Plan */}
              <Card className="mb-6">
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
                  {/* Daily Messages */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Daily Messages
                      </div>
                      <span className="text-muted-foreground">
                        {profile?.daily_message_count || 0} / {planLimits.messages === Infinity ? 'Unlimited' : planLimits.messages}
                      </span>
                    </div>
                    <Progress value={messageUsage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline-block mr-1" />
                      Last reset: {lastReset}
                    </p>
                  </div>
                  
               
                </CardContent>
                 <CardFooter>
                   <Button asChild className="w-full mt-2" 
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
            </TabsContent>
            
            <TabsContent value="billing">
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
            </TabsContent>
            
            <TabsContent value="preferences">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right background column */}
      <div className="bg-muted relative hidden lg:block">
       <Image
         src="https://storage.googleapis.com/ragable-static/grainient-3.png"
         alt="Abstract background"
         className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
        />
        
        {/* Overlay with a quote or message */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="bg-background/80 backdrop-blur-sm p-8 rounded-xl max-w-md">
            <h2 className="text-xl font-medium mb-4">Monitor Your Usage</h2>
            <p className="text-muted-foreground">
              Keep track of your resource consumption and subscription details. Upgrade your plan anytime to unlock more features and higher usage limits.
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
