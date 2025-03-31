"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Get started for free.</h2>
        <p className="text-lg text-gray-600 mb-8">Take charge of your own learning. No card required.</p>
        <Link
          href="/login"
          className="px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 inline-block"
        >
          Get Ragable free
        </Link>
      </div>
    </section>
  );
}
