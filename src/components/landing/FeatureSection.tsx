"use client";

import Image from "next/image";
import React from "react";
import * as Icons from "lucide-react"; // Import all icons

type FeatureCardProps = {
  icon: keyof typeof Icons; // Expect a string key matching a Lucide icon name
  title: string;
  description: string;
  id?: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const IconComponent = Icons[icon] as React.ComponentType<{ className?: string }>; // Get component dynamically

  if (!IconComponent) {
    // Handle case where icon name is invalid (optional: render placeholder or null)
    return null; 
  }

  return (
    <div className="flex flex-col items-start">
      <div className="mb-4 p-2 bg-primary/10 rounded-md text-primary">
        <IconComponent className="w-6 h-6" /> {/* Render the dynamic Icon component */}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

type FeatureSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  features: FeatureCardProps[];
  imagePosition?: "left" | "right";
  className?: string;
};

export default function FeatureSection({
  title,
  subtitle,
  description,
  imageUrl,
  imageAlt = "Feature illustration",
  features,
  imagePosition = "right",
  className = "",
}: FeatureSectionProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Content */}
          <div className={`w-full md:w-1/2 ${imagePosition === "left" ? "md:order-2" : "md:order-1"}`}>
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
              <h3 className="text-xl font-medium mb-4 text-gray-700">{subtitle}</h3>
              <p className="text-gray-600 mb-8">{description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature) => (
                  <FeatureCard
                    key={`${feature.title}-${feature.icon}`}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className={`w-full md:w-1/2 ${imagePosition === "left" ? "md:order-1" : "md:order-2"}`}>
              {/* Add relative positioning here */}
              <div className="rounded-lg overflow-hidden relative"> 
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  width={600}
                  height={400}
                  className="w-full rounded-lg"
                />
                {/* Conditionally add the overlay image */}
                {imageUrl === "/abstracts/grainient-3.png" && (
                  <Image
                    src="/abstracts/database-graphic.png"
                    alt="Database overlay"
                    layout="fill" // Use layout="fill" for absolute positioning
                    objectFit="contain" // Or "cover" depending on desired effect
                    className="absolute inset-0 mix-blend-soft-light opacity-100" // Adjust blend mode and opacity as needed
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}