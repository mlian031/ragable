import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function FaqPage() {
  const faqs = [
    {
      question: "What is Ragable?",
      answer:
        "Ragable is an AI-powered study tool that helps you learn faster and more effectively. It allows you to upload your study materials and instantly get comprehensive explanations, summaries, and answers to your questions about the content. Ragable uses advanced AI to understand your documents and provide personalized learning assistance.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes, we offer a generous free tier with base features for everyone. You can get started with Ragable for free by signing up on our website. If you need more advanced features, we offer a paid plan with additional capabilities.",
    },
    {
      question: "How does Ragable differ from other study tools?",
      answer:
        "We don't like meaningless features. We want to get you studying fast. So we leverage state-of-the-art AI with an intuitive user interface to make studying faster and more effective, providing clear, accurate, and actionable explanations in milliseconds.",
    },
    {
      question: "What file types does Ragable support?",
      answer:
        "Ragable supports PDFs, images, and even handwritten or poorly formatted documents.",
    },
    {
      question: "Is my data secure with Ragable?",
      answer:
        "Ragable takes data security seriously with enterprise-grade security measures, and we ensure our users' data is protected with SOC2 Type II compliance.",
    },
    {
      question: "What features will be added in the future?",
      answer: (
        <>
          We are constantly working on improving Ragable and adding new features
          based on user feedback. To stay updated on our roadmap and planned
          features, please join our Discord community!{" "}
          <a
            href="https://discord.gg/bzTEStMhER"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Join Discord
          </a>
        </>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl py-16 md:py-24 px-4 md:px-0">
        <h1 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h1>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </>
  );
}
