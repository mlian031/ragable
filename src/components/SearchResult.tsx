'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, Copy, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { MemoizedMarkdown } from '@/components/memoized-markdown';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils'; // Import cn utility
import { Separator } from '@/components/ui/separator'; // Import Separator

// Define the structure for a source
export interface Source {
  id: string;
  title: string;
  url: string;
  snippet?: string; // Optional snippet from the source
}

// Define props for the SearchResult component
export interface SearchResultProps {
  answer: string; // This is the context/summary from the search tool
  sources: Source[];
  initialCitationFormat?: 'MLA' | 'APA' | 'Chicago';
  className?: string; // Add className prop
}

// Placeholder function for formatting citations
const formatCitation = (source: Source, format: string): string => {
  const accessedDate = new Date().toLocaleDateString();
  // Basic check for valid URL before trying to parse hostname
  let hostname = 'source domain';
  try {
    // Ensure URL has a protocol for the URL constructor
    const fullUrl = source.url.startsWith('http') ? source.url : `https://${source.url}`;
    hostname = new URL(fullUrl).hostname;
  } catch (_) {
    console.warn(`Invalid URL encountered: ${source.url}`);
    // Keep default hostname or use the original URL if parsing fails
    hostname = source.url;
  }

  switch (format) {
    case 'MLA':
      return `"${source.title}". ${hostname}. ${accessedDate}, ${source.url}.`;
    case 'APA':
      return `${source.title}. (${new Date().getFullYear()}). Retrieved ${accessedDate}, from ${source.url}`;
    case 'Chicago':
      return `${source.title}, accessed ${accessedDate}, ${source.url}.`;
    default:
      return `${source.title} - ${source.url}`;
  }
};

export function SearchResult({
  answer,
  sources,
  initialCitationFormat = 'MLA',
  className, // Destructure className
}: SearchResultProps) {
  const { toast } = useToast();
  const [citationFormat, setCitationFormat] = useState<string>(initialCitationFormat);
  const [copiedId, setCopiedId] = useState<string | null>(null); // Track which citation was copied

  const handleCopyCitation = (citation: string, sourceId: string) => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(sourceId); // Set the ID of the copied citation
      toast({
        title: "Citation copied",
        description: "The citation has been copied to your clipboard.",
        duration: 2000,
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy citation: ', err);
      toast({
        title: "Failed to copy",
        description: "There was an error copying to clipboard.",
        variant: "destructive",
      });
    });
  };

  // Function to safely open links
  const handleOpenLink = (url: string) => {
    // Basic check if URL seems valid before opening
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn(`Attempted to open invalid URL: ${url}`);
      toast({
        title: "Invalid Link",
        description: "Cannot open the source link.",
        variant: "destructive",
      });
    }
  };

  // Apply className to the root div, add flex and gap
  return (
    <div className={cn("flex flex-col gap-6 max-w-4xl", className)}>

      {/* Display Answer/Context if available */}
      {answer && answer !== "Processing..." && (
        <div>
          {/* Context/Answer styling */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <MemoizedMarkdown id="search-result-answer" content={answer} />
          </div>
        </div>
      )}

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <div>
          {/* Header with Source Count and Format Selector */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">
              Sources ({sources.length})
            </h4>
            <div className="flex items-center gap-2">
              {/* Format Selector Dropdown */}
              <Select value={citationFormat} onValueChange={setCitationFormat}>
                <SelectTrigger className="h-7 text-xs w-auto py-1 px-2" aria-label="Citation Format">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MLA" className="text-xs">MLA</SelectItem>
                  <SelectItem value="APA" className="text-xs">APA</SelectItem>
                  <SelectItem value="Chicago" className="text-xs">Chicago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List of Sources */}
          <div className="space-y-4">
            {sources.map((source, index) => {
              const citation = formatCitation(source, citationFormat);
              const isCopied = copiedId === source.id; // Check if this specific citation is copied

              return (
                <div key={source.id || index}>
                  {/* Separator between sources */}
                  {index > 0 && <Separator className="my-4" />}

                  {/* Source Title/Link */}
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground pt-0.5">{index + 1}.</span>
                    <div className="flex-1 min-w-0"> {/* Ensure flex item can shrink */}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
                        title={`Visit source: ${source.title}`}
                      >
                        {source.title}
                        <ExternalLink className="h-3.5 w-3.5 inline shrink-0 opacity-60" />
                      </a>
                      {/* Apply break-all to URL */}
                      <div className="text-xs text-muted-foreground/80 break-all mt-1" title={source.url}>
                        {source.url}
                      </div>
                    </div>
                  </div>

                  {/* Snippet (if exists) */}
                  {source.snippet && (
                    <div className="mt-2 ml-5 pl-2 border-l">
                      <blockquote className="text-xs italic text-muted-foreground">
                        "{source.snippet}"
                      </blockquote>
                    </div>
                  )}

                  {/* Citation Block */}
                  <div className="mt-2 ml-5 relative bg-muted/40 p-2.5 rounded text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-muted-foreground uppercase tracking-wider font-medium text-[10px]">
                        {citationFormat} Citation
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyCitation(citation, source.id)}
                        aria-label="Copy citation"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    {/* Apply break-words to citation */}
                    <p className="text-muted-foreground/90 break-words pr-6">{citation}</p>
                  </div>

                  
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
