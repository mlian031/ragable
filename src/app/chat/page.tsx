'use client';

import { useChat, type Message } from '@ai-sdk/react'; // Base import
import { MemoizedMarkdown } from '@/components/memoized-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState, useCallback } from 'react'; // React hooks - Added useCallback
import { SearchResult, type Source as AppSource } from '@/components/SearchResult';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Copy, RotateCw, Cpu } from 'lucide-react'; // Icons - Added Cpu
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import { ChatInput } from '@/components/ChatInput';
import { CodeBlock } from '@/components/code-block'; // Import CodeBlock component
import { Badge } from '@/components/ui/badge'; // Import Badge component

// Helper function to extract text from a message
function getMessageText(message: Message): string {
  if (!message.parts) return '';
  const textPart = message.parts.find(part => part.type === 'text');
  if (textPart && 'text' in textPart) {
    return textPart.text;
  }
  return '';
}

// Define types for tool results and sources within the component scope
type SearchResultData = {
  context?: string;
  sources?: Array<{ url?: string; title?: string; snippet?: string }>;
};
type SdkSource = {
  url?: string;
  title?: string;
  snippet?: string;
};

// Type for the result of the displayCode tool
type CodeBlockData = {
  language: string;
  filename?: string;
  code?: string;
  tabs?: Array<{
    name: string;
    code: string;
    language?: string;
  }>;
};

export default function Chat() {
  const { toast } = useToast();
  // State to store token usage per message ID
  const [tokenUsage, setTokenUsage] = useState<Map<string, number>>(new Map());

  const { messages: rawMessages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages, reload } = useChat({
    api: '/api/chat',
    // Add maxSteps if needed, e.g., maxSteps: 2,
    onFinish: (message, options) => {
      console.log("Stream finished. Final assistant message:", message);
      // Store token usage when the stream for an assistant message finishes
      if (message.role === 'assistant' && options?.usage?.totalTokens) {
        console.log(`Storing token usage for message ${message.id}: ${options.usage.totalTokens}`);
        setTokenUsage(prev => new Map(prev).set(message.id, options.usage.totalTokens));
      } else if (message.role === 'assistant') {
        console.warn(`Token usage data not available for message ${message.id}`);
      }
    },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set());

  const toggleChatMode = (modeId: string) => {
    setActiveModes(prevModes => {
      const newModes = new Set(prevModes);
      if (newModes.has(modeId)) {
        newModes.delete(modeId);
      } else {
        newModes.add(modeId);
      }
      return newModes;
    });
  };

  function handleEditStart(index: number) {
    if (messages[index]?.role === 'user') {
      setEditingIndex(index);
      setEditedContent(getMessageText(messages[index]));
    }
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditedContent('');
  }

  async function handleSaveEdit() {
    if (editingIndex === null || !editedContent.trim()) return;
    const editedMessage = {
      ...messages[editingIndex],
      parts: [{ type: 'text' as const, text: editedContent.trim() }]
    };
    const newMessages = [...messages.slice(0, editingIndex), editedMessage];
    setMessages(newMessages);
    setEditingIndex(null);
    setEditedContent('');
    reload();
  }

  function handleCopy(message: Message) {
    const textToCopy = getMessageText(message);
    if (!textToCopy) {
      toast({ title: "Nothing to copy", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({ title: "Copied to clipboard", duration: 2000 });
    }).catch(err => {
      toast({ title: "Copy failed", description: "Could not copy message to clipboard.", variant: "destructive" });
    });
  }

  function handleRegenerate(assistantMessageIndex: number) {
    if (isLoading) return;
    const userMessageIndex = assistantMessageIndex - 1;
    if (userMessageIndex >= 0 && messages[userMessageIndex]?.role === 'user') {
      const messagesToKeep = messages.slice(0, assistantMessageIndex);
      setMessages(messagesToKeep);
      reload();
    } else {
      toast({ title: "Regeneration failed", description: "Could not find the corresponding user message to regenerate from.", variant: "destructive" });
    }
  }

  const handleSubmitWrapper = useCallback((
    e: React.FormEvent<HTMLFormElement>,
    options?: { data?: Record<string, any> }
  ) => {
    const activeModeIds = Array.from(activeModes);
    originalHandleSubmit(e, {
      data: { ...options?.data, activeModes: activeModeIds }
    });
  }, [activeModes, input, originalHandleSubmit]); // Added useCallback dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rawMessages.length]); // <-- Dependency changed to length

  const messages: Message[] = rawMessages;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12 min-h-screen">
        <div className="flex-grow overflow-y-auto mb-4 pb-24 w-full">
          {messages.length > 0 ? (
            messages.map((m: Message, messageIndex: number) => (
              <div key={m.id} className="flex flex-col py-4 relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                  {m.role === 'user' ? (
                    <>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditStart(messageIndex)} title="Edit message" disabled={isLoading}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(m)} title="Copy message">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(m)} title="Copy message">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRegenerate(messageIndex)} title="Regenerate response" disabled={isLoading}>
                        <RotateCw className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <span>{m.role === 'user' ? 'You' : 'AI Assistant'}</span>
                </div>
                <div className="pl-0">
                  {editingIndex === messageIndex ? (
                    <div className="space-y-2 py-2">
                      <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full text-sm" rows={3} autoFocus />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                        <Button size="sm" onClick={handleSaveEdit} disabled={isLoading || !editedContent.trim()}>Save & Submit</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {(() => {
                        // Check if this message contains a displayCode tool invocation
                        const hasDisplayCodeTool = m.parts?.some(part => part.type === 'tool-invocation' && part.toolInvocation.toolName === 'displayCode');

                        return m.parts?.map((part, index: number) => {
                          switch (part.type) {
                            case 'text':
                              return <MemoizedMarkdown key={`${m.id}-text-${index}`} id={`${m.id}-text-${index}`} content={part.text} />;
                            case 'tool-invocation':
                              const toolInvocation = part.toolInvocation;
                              const toolCallId = toolInvocation.toolCallId;
                            const toolName = toolInvocation.toolName;

                            // Handle webSearch
                            if (toolName === 'webSearch') {
                              if (!('result' in toolInvocation)) {
                                // Updated webSearch loading indicator
                                return (
                                  <div key={`${m.id}-tool-${toolCallId}-loading`} className="my-2">
                                    <Badge variant="outline" className="text-xs font-normal items-center">
                                      <span className="mr-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                      Searching...
                                    </Badge>
                                  </div>
                                );
                              }
                              // --- Updated to handle structured result ---
                              const searchResult = toolInvocation.result as { status: string, summary: string, context: string, sources: SdkSource[] } | undefined;

                              // Handle potential error status from tool
                              if (searchResult?.status === 'error') {
                                return (
                                   <div key={`${m.id}-tool-${toolCallId}-error`} className="my-2 p-2 bg-destructive/20 rounded text-sm text-destructive-foreground">
                                     Error during search: {searchResult.summary || 'Unknown error'}
                                   </div>
                                 );
                              }

                              // Proceed if status is success (or structure is old/unexpected)
                              const searchContext = searchResult?.context || "No search context available.";
                              const searchSourcesRaw = searchResult?.sources || [];
                              const adaptedSources: AppSource[] = searchSourcesRaw.map((sdkSource: SdkSource, idx: number) => ({
                                id: sdkSource.url || `tool-source-${toolCallId}-${idx}`, // Use URL as ID if available
                                title: sdkSource.title || 'Untitled Source',
                                url: sdkSource.url || '#',
                                snippet: sdkSource.snippet || undefined,
                              }));
                              return (
                                <Accordion key={`${m.id}-tool-${toolCallId}`} type="single" collapsible className="w-full bg-muted/30 rounded-md">
                                  <AccordionItem value="sources" className="border-none">
                                    <AccordionTrigger className="text-sm hover:no-underline py-3 px-4 text-muted-foreground">
                                      Show Search Results ({adaptedSources.length} sources)
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-0 pb-4 px-4">
                                      <SearchResult answer={searchContext} sources={adaptedSources} className="pt-0" />
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              );
                            }

                            // Handle displayCode tool
                            if (toolName === 'displayCode') {
                              if (!('result' in toolInvocation)) {
                                // Added displayCode loading indicator
                                return (
                                  <div key={`${m.id}-tool-${toolCallId}-loading`} className="my-2">
                                    <Badge variant="outline" className="text-xs font-normal items-center">
                                      <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                      Generating code...
                                    </Badge>
                                  </div>
                                );
                              }
                              // --- Updated to handle structured result ---
                              const codeResult = toolInvocation.result as { status: string, summary: string, language: string, code: string, filename?: string } | undefined;

                              // Handle potential error status (though displayCode doesn't explicitly return errors currently)
                              if (codeResult?.status === 'error') {
                                 return (
                                   <div key={`${m.id}-tool-${toolCallId}-error`} className="my-2 p-2 bg-destructive/20 rounded text-sm text-destructive-foreground">
                                     Error generating code: {codeResult.summary || 'Unknown error'}
                                   </div>
                                 );
                              }

                              // Extract data from the structured result
                              const language = codeResult?.language;
                              const code = codeResult?.code;
                              const filename = codeResult?.filename;

                              // Basic validation
                              if (!language || !code) {
                                console.error("Invalid data for CodeBlock:", codeResult);
                                return (
                                  <div key={`${m.id}-tool-${toolCallId}-invalid`} className="my-2 p-2 bg-destructive/20 rounded text-sm text-destructive-foreground">
                                    Error: Received invalid data structure for code block.
                                  </div>
                                );
                              }

                              return (
                                <div key={`${m.id}-tool-${toolCallId}-result`} className="my-2"> {/* Add margin */}
                                  <CodeBlock
                                    language={language}
                                    code={code}
                                    filename={filename}
                                  />
                                </div>
                              );
                            }

                            // Handle Other Tools (Generic Placeholder)
                            if (!('result' in toolInvocation)) {
                              return (
                                <div key={`${m.id}-tool-${toolCallId}`} className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground">
                                  Calling tool: <span className="font-mono">{toolName}</span>...
                                </div>
                              );
                            }
                            return (
                              <div key={`${m.id}-tool-${toolCallId}`} className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground">
                                <div className="font-mono text-xs">Tool result from <span className="font-semibold">{toolName}</span></div>
                              </div>
                            );
                            default:
                              return null;
                          }
                        });
                      })()}
                    </div>
                  )}
                  {/* Render token usage badge for assistant messages */}
                  {m.role === 'assistant' && tokenUsage.has(m.id) && (
                    <div className="mt-2 flex justify-end">
                      <Badge variant="outline" className="text-xs font-normal font-mono">
                        <Cpu className="mr-1 h-3 w-3" />
                        {/* Color-coded dot based on token usage */}
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          tokenUsage.get(m.id)! < 1000 
                            ? 'bg-green-500' 
                            : tokenUsage.get(m.id)! < 10000 
                              ? 'bg-yellow-500' 
                              : 'bg-blue-500'
                        }`} />
                        <span className="font-semibold text-xs lowercase">Token Usage:</span> {tokenUsage.get(m.id)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Start chatting below!</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmitWrapper}
          isLoading={isLoading}
          activeModes={activeModes}
          toggleChatMode={toggleChatMode}
        />
      </div>
    </TooltipProvider>
  );
}
