"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-normal mb-6 tracking-wide">
            An agentic co-pilot for you to take{" "}
            <span className="font-serif italic font-thin tracking-tighter">
              agency
            </span>{" "}
            of your learning
          </h1>
          <p className="text-lg md:text-xl dark:text-gray-100 text-gray-600 mb-8">
            Let&apos;s take you from passive understanding to{" "}
            <span className="bg-gradient-to-r dark:from-teal-200 dark:to-purple-300 from-red-700 to-purple-600 text-transparent bg-clip-text">
              active mastery
            </span>
            .
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* TODO: Update link/text later if needed */}
            <Button
              variant="default"
              className="text-xl font-medium p-6 hover:opacity-80"
              style={{
                background: "url('https://storage.googleapis.com/ragable-static/grainient-2.png')",
                backgroundSize: "cover",
                backgroundPosition: "bottom",
              }}
            >
              <Link href="/chat" className="dark:text-white">
                Get started
              </Link>
            </Button>
          </div>
          {/* TODO: Update trusted by text later if needed */}
          <p className="text-sm text-gray-500 dark:text-white mt-6">
            Built for students, by students.
          </p>

          {/* University logos are already updated */}
          <div className="flex flex-row justify-center items-center gap-8 mt-8 p-6 rounded-xl dark:bg-white dark:backdrop-blur-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
             <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
               <Image
                 src="https://storage.googleapis.com/ragable-static/uoftoronto.png"
                 alt="Partner Logo"
                 width={100}
                height={40}
                className="h-12 w-auto object-contain"
              />
            </div>
             <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
               <Image
                 src="https://storage.googleapis.com/ragable-static/uottawa.png"
                 alt="Partner Logo"
                 width={100}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
             <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
               <Image
                 src="https://storage.googleapis.com/ragable-static/uvirginiatech.png"
                 alt="Partner Logo"
                 width={100}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
             <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
               <Image
                 src="https://storage.googleapis.com/ragable-static/uwaterloo.png"
                 alt="Partner Logo"
                 width={100}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
             <div className="transition-all duration-300 filter grayscale hover:grayscale-0">
               <Image
                 src="https://storage.googleapis.com/ragable-static/uqueens.png"
                 alt="Partner Logo"
                 width={100}
                height={40}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Add relative positioning to the container */}
        <div className="mt-16 max-w-5xl mx-auto relative">
          {/* Existing Image */}
          <Image
            src={"https://storage.googleapis.com/ragable-static/grainient-1-hero-cropped.png"}
            alt="Ragable application screenshot"
            width={1080}
            height={600}
            className="w-full rounded-2xl shadow-lg" // Keep existing styles
            priority
          />

          {/* Video Overlay */}
          <video
            src="https://storage.googleapis.com/ragable-static/hero-video.mp4"
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
