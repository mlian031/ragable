"use client";

import { useState } from "react";
import Link from "next/link";

type FaqItemProps = {
  question: string;
  answer: string | React.ReactNode;
};

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`mt-2 text-gray-600 dark:text-gray-200 transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {answer}
      </div>
    </div>
  );
}

export default function FaqSection() {
  const faqs: FaqItemProps[] = [
    {
      question: "What is Ragable?",
      answer: "Ragable is an AI-powered study tool that helps you learn faster and more effectively. It allows you to upload your study materials and instantly get comprehensive explanations, summaries, and answers to your questions about the content. Ragable uses advanced AI to understand your documents and provide personalized learning assistance.",
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, we offer a generous free tier with base features for everyone. You can get started with Ragable for free by signing up on our website. If you need more advanced features, we offer a paid plan with additional capabilities.",
    },
    {
      question: "How does Ragable differ from other study tools?",
      answer: "We don't like meaningless features. We want to get you studying fast. So we leverage state-of-the-art AI with an intuitive user interface to make studying faster and more effective, providing clear, accurate, and actionable explanations in milliseconds.",
    },
    {
      question: "What file types does Ragable support?",
      answer: "Ragable supports PDFs, images, and even handwritten or poorly formatted documents.",
    },
    {
      question: "Is my data secure with Ragable?",
      answer: "Ragable takes data security seriously with enterprise-grade security measures, and we ensure our users' data is protected with SOC2 Type II compliance.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/faq" className="text-primary font-medium hover:underline">
            More FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
