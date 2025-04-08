'use client';

import React, { useState } from 'react';
import { Copy, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { formatCitation } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

/**
 * Type for AI SDK 4.2 SourcePart.
 * Extend or adjust as needed based on actual SDK typings.
 */
export interface SourcePart {
  type: 'source';
  source: {
    id?: string;
    url: string;
    title?: string;
    snippet?: string;
    publishedDate?: string;
    authors?: string[]; // Explicitly typed to fix TS errors
    [key: string]: unknown; // Allow extra fields, fix lint error
  };
}

/**
 * Props for SourcesDisplay component.
 */
interface SourcesDisplayProps {
  sources: SourcePart[];
}

/**
 * Horizontally scrollable, card-based source display with citation support.
 * Inspired by scira, but with citation toggle.
 */
export const SourcesDisplay: React.FC<SourcesDisplayProps> = ({ sources }) => {
  const { toast } = useToast();
  const [citationStyle, setCitationStyle] = useState<'mla' | 'apa' | 'chicago'>('mla');
  const [copiedSourceId, setCopiedSourceId] = useState<string | null>(null);

  const handleCopyCitation = (citation: string, sourceId: string) => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedSourceId(sourceId);
      toast({
        title: 'Citation copied',
        description: 'The citation has been copied to your clipboard.',
        duration: 2000,
      });
      setTimeout(() => setCopiedSourceId(null), 2000);
    }).catch(err => {
      console.error('Citation copying error:', err);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy the citation to clipboard',
        variant: 'destructive',
      });
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-lg border border-border/30 bg-background/50">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-muted">
              <BookOpen className="h-4 w-4 text-primary/70" />
            </div>
            <span className="font-heading text-sm">Sources Found</span>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-xs bg-muted"
          >
            {sources.length} Results
          </Badge>
        </div>

        {/* Citation style selector */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20">
          <Label htmlFor="citation-style" className="text-xs text-muted-foreground">
            Citation Style:
          </Label>
          <Select
            value={citationStyle}
            onValueChange={(value) => setCitationStyle(value as 'mla' | 'apa' | 'chicago')}
          >
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mla">MLA</SelectItem>
              <SelectItem value="apa">APA</SelectItem>
              <SelectItem value="chicago">Chicago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Query badges row - placeholder, since query info may not be available */}
        <div className="flex overflow-x-auto gap-1.5 px-4 py-2 no-scrollbar">
          {/* Example static badges, replace with dynamic if query info is available */}
          {/* <Badge variant="secondary" className="px-2.5 py-1 text-xs rounded-full bg-muted flex-shrink-0">Query 1</Badge> */}
        </div>

        <div className="flex overflow-x-auto px-6 gap-3 pb-4 no-scrollbar snap-x snap-mandatory">
          {sources.map((part, idx) => {
            const src = part.source;
            const sourceId = src.id || src.url || `source-${idx}`;
            const citation = formatCitation(src, citationStyle);

            return (
              <div
                key={sourceId}
                className="flex-shrink-0 w-64 rounded-lg border border-border/50 bg-background px-4 snap-start"
              >
                <div className="flex items-center gap-2 pt-6 px-2">
                  <div className="relative w-6 h-6 rounded bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(src.url)}`}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm truncate"
                    >
                      {new URL(src.url).hostname.replace('www.', '').toLowerCase()}
                    </a>
                </div>

                {src.snippet && (
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{src.snippet}</p>
                )}

                {src.publishedDate && (
                  <div className="pt-1 border-t border-border/50 mt-2">
                    <time className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {new Date(src.publishedDate).toLocaleDateString()}
                    </time>
                  </div>
                )}

                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value={`citation-${sourceId}`} className="border-0">
                    <AccordionTrigger className="py-1 px-2 rounded hover:no-underline hover:bg-muted/10 text-xs font-normal">
                      Show Citation
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2 text-xs font-sans">
                      <div className="flex justify-between items-start mb-1">
                        <span className="uppercase tracking-wider text-muted-foreground/70 italic text-[10px]">{citationStyle} Citation</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 rounded-full hover:bg-primary/5"
                          onClick={() => handleCopyCitation(citation, sourceId)}
                        >
                          {copiedSourceId === sourceId ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground break-all leading-relaxed">{citation}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SourcesDisplay;
