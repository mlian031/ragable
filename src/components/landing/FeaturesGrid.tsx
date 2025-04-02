"use client";

import {
  Mic,
  Moon,
  Search,
  Languages,
  Network,
  Globe,
  type LucideIcon,
} from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200">
      <Icon className="h-8 w-8 text-primary mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

export default function FeaturesGrid() {
  const features: FeatureCardProps[] = [
    {
      icon: Mic,
      title: "Record",
      description: "Record and chat with lectures. Ask questions to clarify, find and summarize content.",
    },
    {
      icon: Moon,
      title: "Dark mode",
      description: "Choose between light and dark modes. An interface thats always easy on the eyes.",
    },
    {
      icon: Search,
      title: "Search with AI",
      description: "Find information across your entire library. Ask questions, get answers, find files instantly.",
    },
    {
      icon: Languages,
      title: "In every major language",
      description: "Select from 90+ languages including French, Spanish, Hindi, Chinese and many more.",
    },
    {
      icon: Network,
      title: "Graph view",
      description: "Automatically map your files into an interactive graph so you can find hidden patterns.",
    },
    {
      icon: Globe,
      title: "Webpage summaries",
      description: "Get the gist of any webpage with just one click using our Chrome extension.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-gray-900/50"> {/* Added subtle background */}
      <div className="container mx-auto px-4"> {/* Added horizontal padding */}
        <h2 className="text-3xl font-bold text-center mb-12">All the bells and whistles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
