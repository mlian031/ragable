import * as React from 'react';
import { Message } from '@ai-sdk/react';
import dynamic from 'next/dynamic'; // Import dynamic

import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/code-block';
import { MemoizedMarkdown } from '@/components/memoized-markdown';
// Remove direct import of MoleculeDisplay
// import MoleculeDisplay from '@/components/MoleculeDisplay';
import { type DisplayMoleculeArgs } from '@/lib/tools/displayMoleculeTool'; // Import args type
import { type DisplayPlotArgs } from '@/lib/tools/displayPlotTool'; // Import plot args type
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { FileText } from 'lucide-react'; // Import FileText
import SourcesDisplay from '@/components/SourcesDisplay'; // Static import to replace require()

// Import PlotDisplay
import { PlotDisplay } from '@/components/PlotDisplay';

// Dynamically import MoleculeDisplay with no SSR
const DynamicMoleculeDisplay = dynamic(
  () => import('@/components/MoleculeDisplay'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-[300px]" />, // Use Skeleton as placeholder
  }
);


interface SourcePart {
  type: 'source';
  source: {
    id: string;
    url: string;
    title: string;
    snippet?: string;
  };
}

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

  const sourceParts = message.parts.filter((p) => p.type === 'source') as SourcePart[];
  const otherParts = message.parts.filter((p) => p.type !== 'source');

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">
      {otherParts.map((part, index: number) => {
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

              const searchSourcesRaw = searchResult?.sources || [];
              const adaptedSources = searchSourcesRaw.map(
                (sdkSource: SdkSource, idx: number) => ({
                  id: sdkSource.url || `tool-source-${toolCallId}-${idx}`,
                  title: sdkSource.title || 'Untitled Source',
                  url: sdkSource.url || '#',
                  snippet: sdkSource.snippet || undefined,
                }),
              );
              const adaptedSourceParts = adaptedSources.map((s) => ({
                type: 'source',
                source: {
                  id: s.id,
                  url: s.url,
                  title: s.title,
                  snippet: s.snippet,
                },
              } as const));

              return (
                <div key={`${message.id}-tool-${toolCallId}`} className="my-4">
                  <SourcesDisplay sources={adaptedSourceParts} />
                </div>
              );
            }

            // --- Tool: displayMolecule ---
            if (toolName === 'displayMolecule') {
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
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-purple-500"></span>
                      Visualizing molecule...
                    </Badge>
                  </div>
                );
              }
              // Result state
              const moleculeResult = toolInvocation.result as ({ status: string; summary: string } & DisplayMoleculeArgs) | undefined;

              if (moleculeResult?.status === 'error') {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-error`}
                    className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                  >
                    Error visualizing molecule: {moleculeResult.summary || 'Unknown error'}
                  </div>
                );
              }

              const { smiles, substructure, width, height, legend, options } = moleculeResult || {};

              if (!smiles) {
                 console.error('Invalid data for MoleculeDisplay:', moleculeResult);
                 return (
                   <div
                     key={`${message.id}-tool-${toolCallId}-invalid`}
                     className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                   >
                     Error: Received invalid data structure for molecule display (missing SMILES).
                   </div>
                 );
              }

              return (
                 <div
                   key={`${message.id}-tool-${toolCallId}-result`}
                   className="my-2"
                 >
                   {/* Use the dynamically imported component */}
                   <DynamicMoleculeDisplay
                     smiles={smiles}
                     substructure={substructure}
                     width={width}
                     height={height}
                     legend={legend}
                     options={options}
                     // Add any specific className if needed, e.g., for margins
                   />
                 </div>
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

            // --- Tool: displayPlot ---
            if (toolName === 'displayPlot') {
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
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-cyan-500"></span> {/* Changed color */}
                      Generating plot...
                    </Badge>
                  </div>
                );
              }
              // Result state
              const plotResult = toolInvocation.result as ({ status: string; summary: string } & DisplayPlotArgs) | undefined;

              if (plotResult?.status === 'error') {
                return (
                  <div
                    key={`${message.id}-tool-${toolCallId}-error`}
                    className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                  >
                    Error generating plot: {plotResult.summary || 'Unknown error'}
                  </div>
                );
              }

              // Ensure args are valid before passing to component (check for 'data' array)
              if (!plotResult || !plotResult.data || !Array.isArray(plotResult.data) || plotResult.data.length === 0) {
                 console.error('Invalid data for PlotDisplay:', plotResult);
                 return (
                   <div
                     key={`${message.id}-tool-${toolCallId}-invalid`}
                     className="my-2 rounded bg-destructive/20 p-2 text-sm text-destructive-foreground"
                   >
                     Error: Received invalid data structure for plot display (missing or empty &apos;data&apos; array).
                   </div>
                 );
              }

              return (
                 <div
                   key={`${message.id}-tool-${toolCallId}-result`}
                   className="my-2" // Add margin or other styling as needed
                 >
                   <PlotDisplay args={plotResult} />
                 </div>
               );
            }


            // --- Tool: plot-function (Placeholder) --- - KEEPING THIS FOR NOW, MIGHT REMOVE LATER
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

          case 'file': {
            // Render a placeholder for file parts received from the AI
            // The actual file data might be in part.data (Buffer/Uint8Array) or part.url
            // depending on the model/provider. The filename isn't directly on the FilePart.
            // We'll just indicate the type for now.
            // const filename = part.filename || 'attached file'; // filename is not on FilePart type
            const mimeType = part.mimeType || 'unknown type';
            return (
              <div
                key={`${message.id}-file-${index}`}
                className="my-2 rounded bg-muted p-2 text-sm text-muted-foreground"
              >
                <div className="font-mono text-xs flex items-center gap-1">
                  <FileText className="h-3 w-3" /> {/* Use FileText icon */}
                  <span>AI referenced file:</span>
                  {/* Removed filename display as it's not available on FilePart */}
                  {/* <span className="font-semibold" title={filename}>{truncateFileName(filename, 20)}</span> */}
                  <span>({mimeType})</span>
                </div>
                {/* TODO: Add actual rendering logic here if needed, e.g., for images/PDFs using part.data or part.url */}
                {/* {part.mimeType?.startsWith('image/') && part.data && (
                  <img
                    src={`data:${part.mimeType};base64,${Buffer.from(part.data).toString('base64')}`}
                    alt={filename}
                    className="mt-1 max-w-full h-auto rounded"
                  />
                )} */}
              </div>
            );
          } // End case 'file'


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

      {sourceParts.length > 0 && (
        <div key={`${message.id}-sources`} className="my-4">
          <SourcesDisplay sources={sourceParts} />
        </div>
      )}
    </div>
  );
};
