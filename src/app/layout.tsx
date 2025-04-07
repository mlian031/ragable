import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css"; // Import KaTeX CSS
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Placeholder URL - Replace with actual production URL when available
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragable.ca';
const imageUrl = 'https://storage.googleapis.com/ragable-static/grainient-2.png'; // Using the provided image URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ragable - AI Chat with Sources, Graphing, Chemistry & Code", // Updated title
    template: `%s | Ragable`,
  },
  // Updated description
  description: "A modern AI chat interface with source citations, graphing capabilities, chemistry visualizations, code generation, and academic writing assistance.",
  // Updated keywords
  keywords: [
    "AI chat", "chat interface", "source citations", "references", "RAG",
    "retrieval augmented generation", "AI assistant", "verifiable AI", "trustworthy AI",
    "graphing", "data visualization", "chemistry", "molecule visualization",
    "code generation", "programming help", "academic writing", "research assistant"
  ],
  authors: [{ name: "Ragable Team", url: siteUrl }], // Example author
  icons: {
    icon: "/favicon.ico",
    // apple: "/apple-touch-icon.png", // Optional: Add apple touch icon if you have one
  },
  // manifest: "/manifest.json", // Optional: Add manifest path if it exists
  openGraph: {
    // Updated title
    title: "Ragable - Agentic Co-pilot for Learning",
    // Updated description
    description: "Ragable enables you to learn and master with confidence. A modern AI chat interface with source citations, graphing capabilities, chemistry visualizations, code generation, and academic writing assistance.",
    url: siteUrl,
    siteName: "Ragable",
    images: [
      {
        url: imageUrl, // Using the provided image URL
        width: 1200, // Assuming standard OG image dimensions
        height: 630, // Assuming standard OG image dimensions
        alt: 'Ragable AI Chat Interface showcasing multiple capabilities', // Updated alt text
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    // Updated title
    title: "Ragable - AI Chat with Sources, Graphing, Chemistry & Code",
    // Updated description
    description: "Ragable enables you to learn and master with confidence. A modern AI chat interface with source citations, graphing capabilities, chemistry visualizations, code generation, and academic writing assistance.",
    // creator: '@yourtwitterhandle', // Optional: Add Twitter handle
    images: [imageUrl], // Using the provided image URL
  },
  robots: { // Control search engine crawling
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
