"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function CTASection() {
  return (
    <>
    <div className="py-12"></div>
    <section className="relative overflow-hidden py-24 md:py-32">
     <Image
       src="https://storage.googleapis.com/ragable-static/grainient-2.png"
       alt="Gradient Background"
       fill
        className="absolute inset-0 object-cover opacity-100 rounded-2xl"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Removed mx-auto, adjusted max-width, standard padding */}
      <div className="container text-left max-w-2xl relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        {/* Ensured font weight and color match */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-5 text-white py-4">Get started for free</h2>
        {/* Ensured text color and margin match */}
        <p className="text-lg text-white mb-10">Take agency over your learning and get started right now. No card required.</p>
        <Button variant="default"
         className="text-xl font-medium p-6 dark:border-2"
         style={{
           background: "url('https://storage.googleapis.com/ragable-static/grainient-2.png')",
           backgroundSize: "cover",
           backgroundPosition: "center",
          }} // Ensured button style matches
        >
        <Link
          href="/login"
          // Ensured text color and font weight match
          className="dark:text-white text-lg font-medium hover:opacity-80 inline-flex items-center gap-2"
        >
          Get Ragable free <span>→</span>
        </Link>
        </Button>
      </div>
    </section>
    <div className="py-12"></div>
    </>
  );
}
