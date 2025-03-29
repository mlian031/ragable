'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen, ExternalLink, Info, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define a more specific type for grounding metadata if possible, based on expected structure
// This is a placeholder based on common Google grounding structures
type GroundingMetadata = {
  webSearchQueries?: string[];
  searchEntryPoint?: { renderedContent?: string; uri?: string; title?: string };
  groundingSupports?: Array<{
    segment?: { text?: string; startIndex?: number; endIndex?: number };
    groundingChunkIndices?: number[];
    confidenceScores?: number[];
    // Potentially other fields like uri, title depending on the API response
    uri?: string;
    title?: string;
  }>;
  // Add other potential fields if known
};

interface SourceDisplayProps {
  groundingMetadata: GroundingMetadata | undefined | null;
}

export function SourceDisplay({ groundingMetadata }: SourceDisplayProps) {
  const { toast } = useToast();
  const [citationStyle, setCitationStyle] = useState('mla'); // Default style: mla, apa, chicago
  const [copiedSourceIndex, setCopiedSourceIndex] = useState<number | null>(null);

  // Basic citation formatting - enhance with citation-js for accuracy
  const formatCitation = (source: any, style: string): string => {
    // Placeholder logic - extract relevant info and format
    const title = source?.title || source?.segment?.text || 'Untitled Source';
    const uri = source?.uri || source?.searchEntryPoint?.uri || '#';
    const accessDate = new Date().toLocaleDateString(); // Simple access date

    // Very basic formatting examples
    switch (style) {
      case 'apa':
        return `(${accessDate}). ${title}. Retrieved from ${uri}`;
      case 'chicago':
        return `"${title}." Accessed ${accessDate}. ${uri}.`;
      case 'mla':
      default:
        return `"${title}." Web. Accessed ${accessDate}. <${uri}>.`;
    }
  };

  const handleCopyCitation = (citation: string, index: number) => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedSourceIndex(index);
      toast({
        title: "Citation copied",
        description: "The citation has been copied to your clipboard.",
        duration: 2000,
      });
      
      setTimeout(() => setCopiedSourceIndex(null), 2000);
    }).catch(err => {
      console.error("Citation copying error:", err);
      toast({
        title: "Copy failed",
        description: "Unable to copy the citation to clipboard",
        variant: "destructive",
      });
    });
  };

  // Don't render if no metadata is provided
  if (!groundingMetadata) {
    return null;
  }

  // Show only queries if no support available
  if (!groundingMetadata.groundingSupports?.length) {
    if (groundingMetadata.webSearchQueries?.length) {
      return (
        <div className="mt-6 pt-4 border-t border-primary/5 animate-in fade-in duration-300">
          <div className="py-2">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-3 w-3 text-primary/70" />
              <span className="text-sm font-heading">Search Queries</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-1">
              {groundingMetadata.webSearchQueries.map((query, i) => (
                <span key={i} className="text-xs font-serif italic text-muted-foreground">
                  {i > 0 ? '; ' : ''}{query}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-primary/5 animate-in fade-in duration-300">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3 text-primary/70" />
            <span className="font-heading text-sm">References</span>
            <span className="text-xs text-muted-foreground font-serif italic ml-1">
              ({groundingMetadata.groundingSupports.length})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-serif">Style:</span>
            <Select value={citationStyle} onValueChange={setCitationStyle}>
              <SelectTrigger className="h-7 text-xs w-auto py-1 px-3 border-0 bg-muted/30 hover:bg-muted/50 focus:ring-0 font-serif">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent align="end" className="font-serif">
                <SelectItem value="mla" className="text-xs">MLA</SelectItem>
                <SelectItem value="apa" className="text-xs">APA</SelectItem>
                <SelectItem value="chicago" className="text-xs">Chicago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Display webSearchQueries if available */}
        {groundingMetadata.webSearchQueries && groundingMetadata.webSearchQueries.length > 0 && (
          <div className="mt-3 pl-5 pt-3 border-t border-dashed border-primary/5">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Search className="h-3 w-3 opacity-60" />
              <span className="font-serif italic">Search queries used:</span>
            </div>
            <p className="text-xs text-muted-foreground font-serif pl-5">
              {groundingMetadata.webSearchQueries.join('; ')}
            </p>
          </div>
        )}
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {groundingMetadata.groundingSupports?.map((support, index) => {
          const citation = formatCitation(support, citationStyle);
          const textPreview = support.segment?.text 
            ? support.segment.text.substring(0, 60) + (support.segment.text.length > 60 ? '...' : '')
            : 'View source details';
            
          return (
            <AccordionItem 
              value={`item-${index}`} 
              key={index} 
              className="border-0 mb-1"
            >
              <AccordionTrigger className="py-2 px-4 hover:no-underline hover:bg-muted/10 rounded-md text-xs font-normal">
                <div className="flex items-start gap-3 text-left">
                  <div className="text-xs text-muted-foreground font-serif pt-0.5 w-4 text-center">
                    {index + 1}.
                  </div>
                  <div>
                    <p className="font-normal line-clamp-1">
                      {support.title || textPreview}
                    </p>
                    {support.uri && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-xs mt-0.5 font-serif italic">
                        {support.uri}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pt-1 pb-4 px-4 text-xs">
                <div className="space-y-4 pl-7">
                  {support.segment?.text && (
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-serif mb-1 italic">
                        Referenced segment
                      </p>
                      <blockquote className="italic whitespace-pre-wrap text-muted-foreground pl-3 border-l border-primary/5 py-1 font-serif">
                        "{support.segment.text}"
                      </blockquote>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-serif italic">
                        {citationStyle} Citation
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 rounded-full hover:bg-primary/5"
                        onClick={() => handleCopyCitation(citation, index)}
                      >
                        {copiedSourceIndex === index ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-muted-foreground break-all leading-relaxed font-serif">
                      {citation}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}