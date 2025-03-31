"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-normal mb-6 tracking-wide">
            An agentic co-pilot for you to take <span className="font-serif italic font-thin tracking-tighter">agency</span> of your learning
          </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Let's take you from passive understanding to <span className="bg-gradient-to-r from-red-700 to-purple-600 text-transparent bg-clip-text">active mastery</span>.
            </p>
            
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* TODO: Update link/text later if needed */}
            <Link
              href="/"
              className="px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 text-center"
            >
              Get Ragable Free
            </Link>
          </div>
          {/* TODO: Update trusted by text later if needed */}
          <p className="text-sm text-gray-500 mt-6">Built for students, by students.</p>

          {/* University logos are already updated */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
            <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
              <Image
              src="/university-logos/uoftoronto.png"
              alt="Partner Logo"
              width={100}
              height={40}
              className="h-11 w-auto object-contain"
              />
            </div>
            <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
              <Image
              src="/university-logos/uottawa.png"
              alt="Partner Logo"
              width={100}
              height={40}
              className="h-10 w-auto object-contain"
              />
            </div>
            <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
              <Image
              src="/university-logos/uvirginiatech.png"
              alt="Partner Logo"
              width={100}
              height={40}
              className="h-8 w-auto object-contain"
              />
            </div>
            <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
              <Image
              src="/university-logos/uwaterloo.png"
              alt="Partner Logo"
              width={100}
              height={40}
              className="h-10 w-auto object-contain"
              />
            </div>
            </div>
        </div>

        {/* Add relative positioning to the container */}
        <div className="mt-16 max-w-5xl mx-auto relative">
          {/* Existing Image */}
          <Image
            src="/abstracts/grainient-1-hero-cropped.png"
            alt="Ragable application screenshot"
            width={1080}
            height={600}
            className="w-full rounded-2xl shadow-lg" // Keep existing styles
            priority
          />

          {/* Video Overlay */}
          <video
            src="https://storage.googleapis.com/ragable-static-assets/cursorful-video-1743453394997.mp4"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10/12 rounded-2xl shadow-lg z-10" // Position, size, style
            autoPlay
            loop
            muted
            disablePictureInPicture
            playsInline // Important for mobile playback
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
