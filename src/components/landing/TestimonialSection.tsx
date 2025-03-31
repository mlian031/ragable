"use client";

type TestimonialProps = {
  quote: string;
  name: string;
  title: string;
};

function TestimonialCard({ quote, name, title }: TestimonialProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <p className="text-gray-700 mb-4">"{quote}"</p>
      <div className="mt-2">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  // Updated testimonials array
  const testimonials: TestimonialProps[] = [
    {
      quote: "Ragable completely changed how I study for algorithms and data structures. It creates practice problems that match the exact style and difficulty of my professor's examples, then walks through each solution in a way that clicked for me. I finally understand the 'why' behind complex algorithms, not just memorizing steps.",
      name: "Computer Science student",
      title: "University of Waterloo",
    },
    {
      quote: "I used to waste hours making practice materials. Ragable creates questions just like my professor's samples in seconds, but with step-by-step solutions that actually prepare me for the exam. Now I walk into tests confident, not worried.",
      name: "Cybersecurity and Networking Student",
      title: "Virginia Tech",
    },
    {
      quote: "As a math major, I struggled with proofs until I found Ragable. It generates practice problems that mirror my professor's examples perfectly, but with detailed step-by-step reasoning that transformed my mathematical thinking. Now I approach complex proofs with confidence instead of confusion.",
      name: "Mathematics and Economics Student",
      title: "University of Ottawa",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What people are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={`${testimonial.name}-${testimonial.title}`}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
