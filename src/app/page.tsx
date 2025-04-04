import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import FaqSection from "@/components/landing/FAQ";
import * as Icons from "lucide-react";
import CtaSection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import BenchmarkChart from "@/components/landing/BenchmarkChart"; // Import the new chart component
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export type FeatureData = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  features: {
    icon: keyof typeof Icons; // Use the specific Lucide icon key type
    title: string;
    description: string;
  }[];
  imagePosition?: "left" | "right";
  className?: string;
};

// Redefine feature sections for Ragable v2
const featureSections: FeatureData[] = [ // Removed export keyword
  {
    title: "Unparalleled AI Assistance",
    subtitle: "Powered by Gemini 2.5 Pro Augmented With Multimodal Tools",
   description: "Experience the cutting edge of AI. Ragable leverages Google's Gemini 2.5 Pro, augmented with a vast resource base and specialized tools, to provide accurate, context-aware assistance for all your academic needs.",
   imageUrl: "https://storage.googleapis.com/ragable-static/grainient-3.png", // Placeholder
   imagePosition: "right",
   className: "",
    features: [
      {
        icon: "BrainCircuit",
        title: "SOTA Language Model",
        description: "Utilizing Gemini 2.5 Pro for superior reasoning, understanding, and generation across text, images, and more."
      },
      {
        icon: "DatabaseZap",
        title: "Retrieval-Augmented Generation (RAG)",
        description: "Index and intelligently search across all your uploaded course documents for precise answers."
      },
      {
        icon: "ShieldCheck",
        title: "AI Verification Score",
        description: "Ensure confidence in AI responses with built-in verification checks against source material, with additional line-by-line reasoning to verify the accuracy of the response."
      }
    ]
  },
  {
    title: "Advanced Study & Research Tools",
   subtitle: "Visualize, Analyze, Cite, and Write Efficiently",
   description: "Go beyond simple chat. Ragable offers specialized tools designed to accelerate your learning and research process, from complex visualizations to polished academic writing.",
   imageUrl: "https://storage.googleapis.com/ragable-static/grainient-2.png", // Placeholder
   imagePosition: "left",
   className: "bg-gray-50 dark:bg-gray-900",
    features: [
       {
        icon: "FlaskConical",
        title: "Chemical Structure Visualization",
        description: "Render and interact with chemical structures directly within the chat interface."
      },
      {
        icon: "AreaChart",
        title: "Function & Surface Plotting",
        description: "Visualize mathematical functions and surfaces to better understand complex concepts."
      },
      {
        icon: "Globe",
        title: "Web Search Integration",
        description: "Access up-to-date information from the web using integrated Google Search."
      },
      {
        icon: "Quote",
        title: "MLA, APA, Chicago Citations",
        description: "Generate accurate citations in multiple formats based on your sources."
      },
       {
        icon: "Code",
        title: "Code Display",
        description: "View code snippets with proper syntax highlighting for clarity."
      },
      {
        icon: "PenTool",
        title: "Academic Writing Assistant",
        description: "Get tailored help with undergraduate writing, including quote integration and thesis development."
      }
    ]
  },
  {
    title: "Streamlined Course Management",
   subtitle: "Organize, Prepare, and Learn Smarter",
   description: "Centralize your course materials and leverage AI to create personalized study aids. Spend less time organizing and more time learning.",
   imageUrl: "https://storage.googleapis.com/ragable-static/grainient-1.png", // Placeholder
   imagePosition: "right",
   className: "",
    features: [
      {
        icon: "UploadCloud",
        title: "Document Upload & Course Spaces",
        description: "Upload PDFs, images, and more. Organize documents into dedicated spaces for each course."
      },
      {
        icon: "FolderInput", // Added Google Drive feature
        title: "Google Drive Integration",
        description: "Organize course files in Drive, then one-click import folders as Course Spaces for streamlined content generation."
      },
      {
        icon: "FileText",
        title: "One-Click Exam Generation (Coming Soon)",
        description: "Instantly create print-ready practice exams with solutions and optional LaTeX source code."
      },
      {
        icon: "GraduationCap",
        title: "LMS Synchronization (Coming Soon)",
        description: "Keep your course materials automatically updated by syncing with your Learning Management System."
      },
       {
        icon: "Video",
        title: "AI Lecture Video Generation (Coming Soon)",
        description: "Generate animated lecture videos using Manim based on your course content."
      }
    ]
  }
];


export default async function LandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/chat");
  }

  return (
    <>
      <div className="px-6">
      <Header />
      </div>
      <main className="px-6 sm:px-4 lg:px-12">
        <HeroSection />
        {featureSections.map((section) => (
          <FeatureSection
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
            description={section.description}
            imageUrl={section.imageUrl}
            imageAlt={`${section.title} illustration`}
            features={section.features}
            imagePosition={section.imagePosition}
            className={section.className}
          />
        ))}
        <BenchmarkChart />
        {/* <FeaturesGrid/> */}
        <FaqSection />
        <CtaSection />
         {/* Add the chart component */}
      </main>
      <Footer />
    </>
  );
}
