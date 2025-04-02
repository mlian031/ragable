'use client'; // Required for useState and Tabs component

import { useState } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

// Define tier data structure
interface TierFeature {
  text: string;
  included: boolean;
}

interface Tier {
  name: string;
  price: string;
  billingText: string;
  featuresHeader: string;
  features: TierFeature[];
  cta: string;
  popular?: boolean;
  badgeText?: string; // For 'Popular' or other badges
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | null | undefined;
}

// --- REMOVED placeholder generateFeatures function ---

// Pricing data with specific features and limits
const monthlyTiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    billingText: 'USD per month',
    featuresHeader: 'Includes:',
    features: [ // List only Free tier specifics
      { text: 'Premium Model Access (10 messages/day)', included: true },
      { text: 'AI Verification (10 checks/day)', included: true },
      { text: 'All Core Tools (Chem Viz, Plotting, Search, Cite, Code, Writing)', included: true },
      { text: 'Document Upload (10MB total, 3 courses)', included: true },
      { text: 'Exam Generation (10/month) (Coming Soon)', included: true },
    ],
    cta: 'Choose Free',
    buttonVariant: 'outline',
  },
  {
    name: 'Pro',
    price: '$9.99',
    billingText: 'USD per month',
    featuresHeader: 'Everything in Free, plus:',
    features: [ // List only Pro additions/upgrades
      { text: 'Unlimited Messages', included: true },
      { text: 'Retrieval-Augmented Generation (RAG)', included: true },
      { text: 'AI Verification (Unlimited)', included: true },
      { text: 'Increased Storage & Courses (5GB total, 20 courses)', included: true },
      { text: 'Google Drive Integration: Organize course files in Drive, then one-click import folders as Course Spaces for streamlined content generation.', included: true },
      { text: 'Exam Generation (Unlimited) (Coming Soon)', included: true },
      { text: 'AI Lecture Video Generation (5/month) (Coming Soon)', included: true },
    ],
    cta: 'Choose Pro',
    popular: true,
    badgeText: 'Popular',
    buttonVariant: 'default',
  },
  {
    name: 'Team',
    price: '$24',
    billingText: 'USD per seat per month, min 3 seats',
    featuresHeader: 'Everything in Pro, plus:',
    features: [ // List only Team additions/upgrades
      { text: 'Increased Storage per Seat (20GB/seat)', included: true },
      { text: 'More Course Spaces (100/seat)', included: true },
      { text: 'Collaboration Features', included: true },
      { text: 'Admin Dashboard', included: true },
      { text: 'Higher Video Generation Limit (20/month) (Coming Soon)', included: true },
      { text: 'LMS Synchronization (Coming Soon)', included: true },
    ],
    cta: 'Choose Team',
    buttonVariant: 'outline',
  },
];

const yearlyTiers: Tier[] = [
  { // Yearly Free - Same features as Monthly Free
    name: 'Free',
    price: '$0',
    billingText: 'USD per year',
    featuresHeader: 'Includes:',
    features: [ // List only Free tier specifics (Same as monthly)
      { text: 'Premium Model Access (10 messages/day)', included: true },
      { text: 'AI Verification (10 checks/day)', included: true },
      { text: 'All Core Tools (Chem Viz, Plotting, Search, Cite, Code, Writing)', included: true },
      { text: 'Document Upload (10MB total, 3 courses)', included: true },
      { text: 'Exam Generation (10/month) (Coming Soon)', included: true },
      { text: 'Retrieval-Augmented Generation (RAG)', included: false },
    ],
    cta: 'Choose Free',
    buttonVariant: 'outline',
  },
  { // Yearly Pro - Same features as Monthly Pro, different price/billing text
    name: 'Pro',
    price: '$7.99', // Approx $9.99 * 12 * 0.8 / 12
    billingText: 'USD per month, billed yearly',
    featuresHeader: 'Everything in Free, plus:',
     features: [ // List only Pro additions/upgrades (Same as monthly)
      { text: 'Unlimited Messages', included: true },
      { text: 'Retrieval-Augmented Generation (RAG)', included: true },
      { text: 'Unlimited AI Verification', included: true },
      { text: 'Increased Storage & Courses (5GB total, 20 courses)', included: true },
      { text: 'Google Drive Integration: Organize course files in Drive, then one-click import folders as Course Spaces for streamlined content generation.', included: true },
      { text: 'Unlimited Exam Generation (Coming Soon)', included: true },
      { text: 'AI Lecture Video Generation (5/month) (Coming Soon)', included: true },
    ],
    cta: 'Choose Pro',
    popular: true,
    badgeText: 'Popular',
    buttonVariant: 'default',
  },
  { // Yearly Team - Same features as Monthly Team, different price/billing text
    name: 'Team',
    price: '$19.20', // Approx $24 * 12 * 0.8 / 12
    billingText: 'USD per seat per month, billed yearly, min 3 seats',
    featuresHeader: 'Everything in Pro, plus:',
    features: [ // List only Team additions/upgrades (Same as monthly)
      { text: 'Increased Storage per Seat (20GB/seat)', included: true },
      { text: 'More Course Spaces (100/seat)', included: true },
      { text: 'Collaboration Features', included: true },
      { text: 'Admin Dashboard', included: true },
      { text: 'Higher Video Generation Limit (20/month) (Coming Soon)', included: true },
      { text: 'LMS Synchronization (Coming Soon)', included: true },
    ],
    cta: 'Choose Team',
    buttonVariant: 'outline',
  },
];

const universityLogos = [
  { src: '/university-logos/uoftoronto.png', alt: 'University of Toronto Logo', width: 150, height: 40 },
  { src: '/university-logos/uottawa.png', alt: 'University of Ottawa Logo', width: 140, height: 40 },
  { src: '/university-logos/uvirginiatech.png', alt: 'Virginia Tech Logo', width: 160, height: 40 },
  { src: '/university-logos/uwaterloo.png', alt: 'University of Waterloo Logo', width: 150, height: 40 },
  { src: '/university-logos/uqueens.png', alt: 'Queen\'s University Logo', width: 150, height: 40 },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const currentTiers = billingCycle === 'monthly' ? monthlyTiers : yearlyTiers;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center text-center py-16 md:py-24">
          <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight lg:text-4xl xl:text-6xl max-w-3xl">
            Ignore the noise. Focus on what matters.
          </h1>
          </div>
          <p className="py-4 text-lg text-muted-foreground max-w-xl">
            Invest in your success with a paid plan. Unlimited access. Cancel anytime.
          </p>
        </section>

        {/* Social Proof Logos */}
        <section className="container mx-auto flex flex-col items-center text-center pb-16">
           <p className="text-sm text-muted-foreground mb-6">Trusted by students and researchers at:</p>
           <div className="flex flex-wrap justify-center items-center gap-x-8 space-x-8 gap-y-4 md:gap-x-12">
             {universityLogos.map((logo) => (
               <Image
                 key={logo.src}
                 src={logo.src}
                 alt={logo.alt}
                 width={logo.width}
                 height={logo.height}
                 className="object-contain"
                 unoptimized // If logos are static SVGs/PNGs and don't need Next optimization
               />
             ))}
           </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto flex flex-col items-center py-16 md:pb-24">
          {/* Billing Toggle */}
          <Tabs defaultValue="monthly" className="w-auto mb-10 p-4" onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger value="monthly">Pay monthly</TabsTrigger>
              <TabsTrigger value="yearly">Pay yearly <Badge variant="secondary" className="ml-2">Save 20%</Badge></TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Pricing Cards Grid */}
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3 w-full max-w-6xl">
            {currentTiers.map((tier) => (
              <Card key={tier.name} className={`flex flex-col rounded-lg border p-6 ${tier.popular ? 'border-primary' : ''}`}>
                <CardHeader className="p-0 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    {tier.badgeText && <Badge variant={tier.popular ? 'default' : 'secondary'}>{tier.badgeText}</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground h-10">{tier.billingText}</p> {/* Fixed height for alignment */}
                </CardHeader>
                <CardContent className="flex-1 p-0 mb-6">
                  <Button
                    className="w-full mb-6"
                    variant={tier.buttonVariant}
                    style={tier.name === 'Pro' ? {
                      backgroundImage: `url('/abstracts/grainient-1.png')`,
                      backgroundSize: 'cover', // Adjust as needed
                      backgroundPosition: 'center', // Adjust as needed
                      color: 'white', // Ensure text is visible
                      border: 'none', // Remove default border if needed
                    } : {}}
                  >
                    <Link href="/">
                      {tier.cta}
                    </Link>
                  </Button>
                  <p className="text-lg font-medium mb-3">{tier.featuresHeader}</p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className={`flex items-start ${!feature.included ? 'opacity-60' : ''}`}> {/* Dim excluded features */}
                        <span className={`mr-2 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`}>{feature.included ? '✓' : '✕'}</span> {/* Check or X */}
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {/* Footer can be used if needed later */}
                <CardFooter className="p-0 mt-auto">
                </CardFooter> 
              </Card>
            ))}

            {/*
            Enterprise Card (Separate)
             <Card className="flex flex-col rounded-lg border p-6 bg-muted/30 md:col-span-3 lg:col-span-1">
                <CardHeader className="p-0 mb-4">
                    <h3 className="text-lg font-semibold">Enterprise</h3>
                    <p className="text-sm text-muted-foreground mt-2">Custom solutions for large organizations and institutions.</p>
                </CardHeader>
                <CardContent className="flex-1 p-0 mb-6">
                   <p className="text-lg font-medium mb-3">Includes everything in Team, plus:</p>
                   <ul className="space-y-2 text text-muted-foreground">
                      <li className="flex items-start"><span className="mr-2 text-primary">✓</span><span>Everything in Team</span></li>
                      <li className="flex items-start"><span className="mr-2 text-primary">✓</span><span>Volume Discounts</span></li>
                      <li className="flex items-start"><span className="mr-2 text-primary">✓</span><span>Custom Integrations</span></li>
                      <li className="flex items-start"><span className="mr-2 text-primary">✓</span><span>Dedicated Support & SLA</span></li>
                      <li className="flex items-start"><span className="mr-2 text-primary">✓</span><span>Advanced Security Options (SAML/OIDC)</span></li>
                      <li className="flex items-start"><span className="mr-2 text-primary">✓</span><span>All &quot;Coming Soon&quot; features upon release</span></li>
                   </ul>
                </CardContent>
                <CardFooter className="p-0 mt-auto">
                   <Button className="w-full" variant="outline">Contact Sales</Button>
                </CardFooter>
             </Card> 
             */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
