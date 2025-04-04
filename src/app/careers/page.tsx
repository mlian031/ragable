import React from 'react';

export default function CareersPage() {
  return (
    <>
      <main className="container mx-auto max-w-3xl py-16 md:py-24 px-4 md:px-0 flex flex-col items-center ">
        <h1 className="text-4xl font-bold mb-8 font-serif">Careers</h1>
        <div className="text-left">
        <p className="text-lg mb-4">
          We're looking for hungry and talented UI/UX designers, Marketers and Software Engineers.
        </p>
        <p className="text-lg">
          If interested, please email evidence of exceptional ability to{' '}
          <a
            href="mailto:careers@ragable.ca" // Updated email address
            className="text-primary hover:underline"
          >
            careers@ragable.ca
          </a>
          .
        </p>
        </div>
      </main>
    </>
  );
}
