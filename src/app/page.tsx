'use client';

import { useChat, type Message } from '@ai-sdk/react';
import { ToolInvocation } from 'ai';
import { MemoizedMarkdown } from '@/components/memoized-markdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import { SearchResult, type Source as AppSource } from '@/components/SearchResult';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon, BotIcon, SearchIcon } from "lucide-react";
// Import Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Chat() {

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    onFinish: (message: Message) => {
      console.log("Stream finished. Final assistant message:", message);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    // Main container: Removed max-width and mx-auto, kept padding
    <div className="flex flex-col w-full px-4 py-8 md:px-6 md:py-12 min-h-screen">

      {/* Chat Messages Area: Increased bottom padding, added max-width and mx-auto HERE */}
      {/* This keeps the chat content itself centered, similar to before, but allows */}
      {/* potential future elements outside this div to be full width. */}
      {/* OR remove max-w/mx-auto here too if you want messages truly edge-to-edge (minus padding) */}
      <div className="flex-grow overflow-y-auto mb-4 pb-24 space-y-8 max-w-4xl mx-auto">
        {messages.length > 0 ? (
          messages.map((m: Message) => (
            // Each message turn container
            // Each message turn container
            <div key={m.id} className="flex flex-col">
              {/* Role Indicator Row: Larger avatar, more gap, bolder role text */}
              <div className="flex items-center gap-4 mb-3"> {/* Increased gap and mb */}
                <Avatar className="h-9 w-9 border"> {/* Larger Avatar */}
                  <AvatarFallback className={m.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-muted'}>
                    {/* Slightly larger icons */}
                    {m.role === 'user' ? <UserIcon size={18} /> : <BotIcon size={18} />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium capitalize text-foreground"> {/* Bolder, standard foreground */}
                  {m.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>

              {/* Message Content Area (below indicator): Adjusted indentation */}
              <div className="pl-13"> {/* Indent content based on h-9 avatar + gap-4 = 13 */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {/* Iterate through message parts */}
                  {m.parts?.map((part, index: number) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div className='py-2' key={`${m.id}-text-${index}`}>
                            <MemoizedMarkdown key={`${m.id}-text-${index}`} id={`${m.id}-text-${index}`} content={part.text} />
                          </div>
                        );

                      case 'tool-invocation':
                        const toolInvocation = part.toolInvocation;
                        const toolCallId = toolInvocation.toolCallId;
                        const toolName = toolInvocation.toolName;
                        const args = JSON.stringify(toolInvocation.args, null, 2);

                        // Handle webSearch Tool Display
                        if (toolName === 'webSearch') {
                          if (!('result' in toolInvocation)) {
                            return (
                              <div key={`${m.id}-tool-${toolCallId}`} className="mt-2 flex items-center gap-2 p-3 bg-muted rounded text-sm text-muted-foreground">
                                <SearchIcon className="h-4 w-4 animate-spin" />
                                Searching the web for: <span className="font-mono text-xs">{toolInvocation.args.query}</span>...
                              </div>
                            );
                          }

                          const searchResultData = toolInvocation.result as any;
                          const searchContext = searchResultData?.context || "No summary available.";
                          const searchSourcesRaw = searchResultData?.sources || [];
                          const adaptedSources: AppSource[] = searchSourcesRaw.map((sdkSource: any, idx: number) => ({
                            id: sdkSource.url || `tool-source-${toolCallId}-${idx}`,
                            title: sdkSource.title || 'Untitled Source',
                            url: sdkSource.url || '#',
                            snippet: sdkSource.snippet || undefined,
                          }));

                          // Render SearchResult inside a styled Accordion
                          return (
                            <Accordion key={`${m.id}-tool-${toolCallId}`} type="single" collapsible className="max-w-4xl py-4">
                              {/* Removed border and bg from item, added padding to trigger */}
                              <AccordionItem value="search-results" className="border-none">
                                <AccordionTrigger className="text-sm hover:no-underline py-2 px-2 rounded hover:bg-muted/50 text-muted-foreground">
                                  Show Search Results ({adaptedSources.length} sources)
                                </AccordionTrigger>
                                {/* Added padding and top border to content */}
                                <AccordionContent className="pt-4 pb-2 border-t mt-2">
                                  <SearchResult
                                    answer={searchContext}
                                    sources={adaptedSources}
                                    // Pass className to remove internal padding if needed by AccordionContent
                                    className="pt-0"
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          );
                        }

                        // Handle Other Tools
                        if (!('result' in toolInvocation)) {
                          return (
                            <div key={`${m.id}-tool-${toolCallId}`} className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground">
                              Calling tool: <span className="font-mono">{toolName}</span>...
                            </div>
                          );
                        }
                        const result = JSON.stringify(toolInvocation.result, null, 2);
                        return (
                          <div key={`${m.id}-tool-${toolCallId}`} className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm">
                            <details>
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                Tool <span className="font-mono">{toolName}</span> result:
                              </summary>
                              {/* Allow horizontal scroll only for the pre block if needed */}
                              <div className="mt-1 overflow-x-auto">
                                <pre className="font-mono text-xs whitespace-pre-wrap">{result}</pre>
                              </div>
                            </details>
                          </div>
                        );

                      case 'source': // Should not appear here with tool approach
                        return null;
                      default:
                        console.warn("Unknown message part type:", part.type, part);
                        return null;
                    }
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Placeholder when no messages exist
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Start chatting below!
          </div>
        )}
        {/* Element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form: Sticky, background blur, increased padding */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t">
        {/* Increased padding */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 md:p-6 max-w-4xl mx-auto">
          <Input
            className="flex-grow h-10" // Slightly larger input
            value={input}
            placeholder="Ask about anything..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Thinking...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
