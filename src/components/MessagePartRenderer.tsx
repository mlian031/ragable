import * as React from 'react';
import { Message } from '@ai-sdk/react';

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CodeBlock } from '@/components/code-block';
import { MemoizedMarkdown } from '@/components/memoized-markdown';
import { SearchResult, type Source as AppSource } from '@/components/SearchResult';

// Re-define necessary types locally or import if shared
type SdkSource = {
  url?: string;
  title?: string;
  snippet?: string;
};

/**
 * Props for the MessagePartRenderer component.
 */
interface MessagePartRendererProps {
  message: Message;
}

/**
 * Renders the different parts of a message, including text and tool invocations.
 * Handles loading states and result display for known tools.
 */
export const MessagePartRenderer: React.FC<MessagePartRendererProps> = ({
  message,
}) => {
  // Render simple string content if parts array doesn't exist (fallback)
  if (typeof message.content === 'string' && !message.parts && message.content) {
    return (
      <MemoizedMarkdown
        key={`${message.id}-text-fallback`}
        id={`${message.id}-text-fallback`}
        content={message.content}
      />
    );
  }

  // Render parts if they exist
  if (!message.parts || message.parts.length === 0) {
    return null; // Nothing to render if no parts and no string content
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">
      {message.parts.map((part, index: number) => {
        switch (part.type) {
          case 'text':
            return (
              <MemoizedMarkdown
                key={`${message.id}-text-${index}`}
                id={`${message.id}-text-${index}`}
                content={part.text ?? ''} // Ensure content is string
              />
            );

          case 'tool-invocation': {
            const toolInvocation = part.toolInvocation;
            const toolCallId = toolInvocation.toolCallId;
            const toolName = toolInvocation.toolName;
            const hasResult = 'result' in toolInvocation;

            // --- Tool: webSearch ---
            if (toolName === 'webSearch') {
              if (!hasResult) {
                // Loading state
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-loading`}
                    className="my-2"
                  >
                    <Badge
                      variant="outline"
                      className="items-center text-xs font-normal"
                    >
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                      Searching...
                    </Badge>
                  </div>
                );
              }
              // Result state
              const searchResult = toolInvocation.result as
                | {
                    status: string;
                    summary: string;
                    context: string;
                    sources: SdkSource[];
                  }
                | undefined;

              if (searchResult?.status === 'error') {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-error`}
                    className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                  >
                    Error during search:{' '}
                    {searchResult.summary || 'Unknown error'}
                  </div>
                );
              }

              const searchContext =
                searchResult?.context || 'No search context available.';
              const searchSourcesRaw = searchResult?.sources || [];
              const adaptedSources: AppSource[] = searchSourcesRaw.map(
                (sdkSource: SdkSource, idx: number) => ({
                  id: sdkSource.url || `tool-source-${toolCallId}-${idx}`,
                  title: sdkSource.title || 'Untitled Source',
                  url: sdkSource.url || '#',
                  snippet: sdkSource.snippet || undefined,
                }),
              );
              return (
                <Accordion
                  key={`${message.id}-tool-${toolCallId}`}
                  type="single"
                  collapsible
                  className="my-2 w-full rounded-md bg-muted/30"
                >
                  <AccordionItem value="sources" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm text-muted-foreground hover:no-underline">
                      Show Search Results ({adaptedSources.length} sources)
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-0 pb-4">
                      <SearchResult
                        answer={searchContext}
                        sources={adaptedSources}
                        className="pt-0"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            // --- Tool: displayCode ---
            if (toolName === 'displayCode') {
              if (!hasResult) {
                // Loading state
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-loading`}
                    className="my-2"
                  >
                    <Badge
                      variant="outline"
                      className="items-center text-xs font-normal"
                    >
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                      Generating code...
                    </Badge>
                  </div>
                );
              }
              // Result state
              const codeResult = toolInvocation.result as
                | {
                    status: string;
                    summary: string;
                    language: string;
                    code: string;
                    filename?: string;
                  }
                | undefined;

              if (codeResult?.status === 'error') {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-error`}
                    className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                  >
                    Error generating code:{' '}
                    {codeResult.summary || 'Unknown error'}
                  </div>
                );
              }

              const language = codeResult?.language;
              const code = codeResult?.code;
              const filename = codeResult?.filename;

              if (!language || !code) {
                console.error('Invalid data for CodeBlock:', codeResult);
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-invalid`}
                    className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                  >
                    Error: Received invalid data structure for code block.
                  </div>
                );
              }

              return (
                <div
                  key={`${message.id}-tool-${toolCallId}-result`}
                  className="my-2"
                >
                  <CodeBlock
                    language={language}
                    code={code}
                    filename={filename}
                  />
                </div>
              );
            }

            // --- Tool: chem-visualizer (Placeholder) ---
            if (toolName === 'chem-visualizer') {
              if (!hasResult) {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-loading`}
                    className="my-2"
                  >
                    <Badge
                      variant="outline"
                      className="items-center text-xs font-normal"
                    >
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-purple-500"></span>
                      Visualizing chemistry...
                    </Badge>
                  </div>
                );
              }
              // Placeholder for result display
              return (
                <div
                  key={`${message.id}-tool-${toolCallId}-result`}
                  className="mt-2 rounded bg-muted p-2 text-sm text-muted-foreground"
                >
                  <div className="font-mono text-xs">
                    Tool result from{' '}
                    <span className="font-semibold">{toolName}</span> (Display
                    TBD)
                  </div>
                </div>
              );
            }

            // --- Tool: plot-function (Placeholder) ---
            if (toolName === 'plot-function') {
              if (!hasResult) {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-loading`}
                    className="my-2"
                  >
                    <Badge
                      variant="outline"
                      className="items-center text-xs font-normal"
                    >
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-orange-500"></span>
                      Plotting function...
                    </Badge>
                  </div>
                );
              }
              // Placeholder for result display
              return (
                <div
                  key={`${message.id}-tool-${toolCallId}-result`}
                  className="mt-2 rounded bg-muted p-2 text-sm text-muted-foreground"
                >
                  <div className="font-mono text-xs">
                    Tool result from{' '}
                    <span className="font-semibold">{toolName}</span> (Display
                    TBD)
                  </div>
                </div>
              );
            }

            // --- Tool: double-check (Placeholder) ---
            if (toolName === 'double-check') {
              if (!hasResult) {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-loading`}
                    className="my-2"
                  >
                    <Badge
                      variant="outline"
                      className="items-center text-xs font-normal"
                    >
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-yellow-500"></span>
                      Double checking...
                    </Badge>
                  </div>
                );
              }
              // Placeholder for result display
              return (
                <div
                  key={`${message.id}-tool-${toolCallId}-result`}
                  className="mt-2 rounded bg-muted p-2 text-sm text-muted-foreground"
                >
                  <div className="font-mono text-xs">
                    Tool result from{' '}
                    <span className="font-semibold">{toolName}</span> (Display
                    TBD)
                  </div>
                </div>
              );
            }

            // --- Fallback for Unknown Tools ---
            if (!hasResult) {
              return (
                <div
                  key={`${message.id}-tool-${toolCallId}-loading`}
                  className="mt-2 rounded bg-muted p-2 text-sm text-muted-foreground"
                >
                  Calling tool: <span className="font-mono">{toolName}</span>...
                </div>
              );
            }
            // Generic result display for unknown tools
            return (
              <div
                key={`${message.id}-tool-${toolCallId}-result`}
                className="mt-2 rounded bg-muted p-2 text-sm text-muted-foreground"
              >
                <div className="font-mono text-xs">
                  Tool result from{' '}
                  <span className="font-semibold">{toolName}</span>
                </div>
                {/* Optionally stringify the result for debugging:
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(toolInvocation.result, null, 2)}
                </pre> */}
              </div>
            );
          } // End case 'tool-invocation'

          default:
            // Render unknown part types as placeholder or null
            console.warn('Unknown message part type:', part.type);
            // return (
            //   <div
            //     key={`${message.id}-part-${index}-unknown`}
            //     className="my-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground"
            //   >
            //     Unsupported message part type: {part.type}
            //   </div>
            // );
        }
      })}
    </div>
  );
};
