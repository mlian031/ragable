'use client';

import { useChat, type Message } from '@ai-sdk/react'; // Removed ChatRequestOptions import
import { MemoizedMarkdown } from '@/components/memoized-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { SearchResult, type Source as AppSource } from '@/components/SearchResult';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Copy, RotateCw, Globe } from 'lucide-react'; // Added Globe icon
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'; // Import Tooltip components
import { ChatInput } from '@/components/ChatInput'; // Import our new component
import type { ChatMode } from '@/config/chat-modes'; // Import ChatMode type

// Helper function to extract text from a message
function getMessageText(message: Message): string {
  if (!message.parts) return '';

  // Find the first text part
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

// Removed DisplayMessage interface

export default function Chat() {
  const { toast } = useToast(); // Initialize toast
  // Rename original handleSubmit to avoid naming conflict
  const { messages: rawMessages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages, reload } = useChat({
    api: '/api/chat',
    maxSteps: 5, // Consider if maxSteps affects regeneration
    onFinish: (message: Message) => {
      console.log("Stream finished. Final assistant message:", message);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // State for editing message index
  const [editedContent, setEditedContent] = useState<string>(''); // State for edited content
  // State for active chat modes (using a Set for efficient add/remove/check)
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set());

  // Function to toggle a chat mode
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

  // Function to start editing a user message
  function handleEditStart(index: number) {
    if (messages[index]?.role === 'user') {
      setEditingIndex(index);
      setEditedContent(getMessageText(messages[index]));
    }
  }

  // Function to cancel editing
  function handleCancelEdit() {
    setEditingIndex(null);
    setEditedContent('');
  }

  // Function to save edit and regenerate response
  async function handleSaveEdit() {
    if (editingIndex === null || !editedContent.trim()) return;

    // Get the edited message and all messages before it
    const editedMessage = {
      ...messages[editingIndex],
      parts: [{ type: 'text' as const, text: editedContent.trim() }] // Ensure type is 'text'
    };

    // Create new messages array with edited message and all messages before edit
    const newMessages = [
      ...messages.slice(0, editingIndex),
      editedMessage
    ];

    // Update messages to edited state
    setMessages(newMessages);

    // Reset editing state
    setEditingIndex(null);
    setEditedContent('');

    // Reload with edited messages (will regenerate responses) - CORRECTED
    reload();
  }

  // Function to handle copying message content - ADDED
  function handleCopy(message: Message) {
    const textToCopy = getMessageText(message);
    if (!textToCopy) {
      toast({ title: "Nothing to copy", variant: "destructive" });
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
    }).catch(err => {
      console.error("Copying error:", err);
      toast({
        title: "Copy failed",
        description: "Could not copy message to clipboard.",
        variant: "destructive",
      });
    });
  }

  // Removed handleDeleteMessage function

  // Function to handle regenerating an assistant response - ADDED
  function handleRegenerate(assistantMessageIndex: number) {
    if (isLoading) return; // Prevent multiple regenerations

    const userMessageIndex = assistantMessageIndex - 1;

    // Check if there is a preceding message and it's from the user
    if (userMessageIndex >= 0 && messages[userMessageIndex]?.role === 'user') {
      console.log(`Regenerating response after message index ${userMessageIndex}`);
      // Remove the assistant message and any subsequent messages from the state
      const messagesToKeep = messages.slice(0, assistantMessageIndex);
      setMessages(messagesToKeep);
      // Now call reload, which should use the updated (truncated) messages state
      reload();
    } else {
      console.error("Cannot regenerate: Preceding user message not found or index out of bounds for assistant message index:", assistantMessageIndex);
      toast({
        title: "Regeneration failed",
        description: "Could not find the corresponding user message to regenerate from.",
        variant: "destructive",
      });
    }
  }

  // Wrapper for handleSubmit to pass activeModes
  const handleSubmitWrapper = (
    e: React.FormEvent<HTMLFormElement>,
    // The options object from ChatInput might be different now,
    // but we primarily care about passing our activeModes state.
    // We'll adjust ChatInput's onSubmit to pass the modes correctly later.
    options?: { data?: Record<string, any> } // Keep options flexible for now
  ) => {
    // Convert Set to Array for JSON serialization
    const activeModeIds = Array.from(activeModes);
    console.log("Submitting with active modes:", activeModeIds); // For debugging

    // Call original handleSubmit, passing activeModeIds in the data payload
    originalHandleSubmit(e, {
      data: {
        ...options?.data, // Preserve any other data if needed
        activeModes: activeModeIds, // Pass the array of active mode IDs
      }
    });

    // No longer need to modify messages here for the indicator
  };


  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rawMessages]); // Depend on rawMessages

  // No need to cast messages anymore
  const messages: Message[] = rawMessages;

  return (
    // Wrap with TooltipProvider
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12 min-h-screen">
        <div className="flex-grow overflow-y-auto mb-4 pb-24 w-full">
          {messages.length > 0 ? (
            // Use standard Message type
            messages.map((m: Message, messageIndex: number) => (
              // Add relative positioning for the button container
              <div key={m.id} className="flex flex-col py-4 relative group"> {/* Added relative and group */}
                {/* Action Buttons Container (Top Right, appears on group hover) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                {m.role === 'user' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditStart(messageIndex)} // Call handleEditStart
                      title="Edit message"
                      disabled={isLoading} // Disable if loading
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(m)} // Corrected to handleCopy
                      title="Copy message" // Corrected title
                      // No need to disable copy while loading
                    >
                      <Copy className="h-3 w-3" /> {/* Corrected icon */}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(m)} // Corrected to handleCopy
                      title="Copy message" // Corrected title
                      // No need to disable copy while loading
                    >
                      <Copy className="h-3 w-3" /> {/* Corrected icon */}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRegenerate(messageIndex)} // Regenerate response - CORRECTED
                      title="Regenerate response"
                      disabled={isLoading} // Disable if loading
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>

              {/* Display role as a badge - Removed the indicator logic here */}
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <span>{m.role === 'user' ? 'You' : 'AI Assistant'}</span>
              </div>

              {/* Display message content or edit form */}
              <div className="pl-0">
                {editingIndex === messageIndex ? (
                  // --- Edit Mode ---
                  <div className="space-y-2 py-2">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full text-sm"
                      rows={3}
                      autoFocus // Focus the textarea when editing starts
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={isLoading || !editedContent.trim()}>Save & Submit</Button>
                    </div>
                  </div>
                ) : (
                  // --- Display Mode ---
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {/* Iterate through message parts */}
                    {m.parts?.map((part, index: number) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <MemoizedMarkdown key={`${m.id}-text-${index}`} id={`${m.id}-text-${index}`} content={part.text} />
                          );
                        case 'tool-invocation':
                          const toolInvocation = part.toolInvocation;
                          const toolCallId = toolInvocation.toolCallId;
                          const toolName = toolInvocation.toolName;

                          // Handle webSearch
                          if (toolName === 'webSearch') {
                            if (!('result' in toolInvocation)) {
                              return (
                                // Apply gradient text to the searching indicator
                                <div key={`${m.id}-tool-${toolCallId}`} className="my-2 p-2 bg-muted rounded text-sm">
                                  <span className="font-medium bg-gradient-to-r from-purple-500 via-blue-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                                    Searching for information...
                                  </span>
                                </div>
                              );
                            }

                            // Process search results for display
                            // Use the defined types instead of 'any'
                            const searchResultData = toolInvocation.result as SearchResultData | undefined;
                            const searchContext = searchResultData?.context || "No search context available.";
                            const searchSourcesRaw = searchResultData?.sources || [];

                            // Adapt sources for the component
                            // Use the defined type instead of 'any'
                            const adaptedSources: AppSource[] = searchSourcesRaw.map((sdkSource: SdkSource, idx: number) => ({
                              id: sdkSource.url || `tool-source-${toolCallId}-${idx}`,
                              title: sdkSource.title || 'Untitled Source',
                              url: sdkSource.url || '#',
                              snippet: sdkSource.snippet || undefined,
                            }));

                            return (
                              // Add background and rounded corners to Accordion, remove margin top
                              <Accordion key={`${m.id}-tool-${toolCallId}`} type="single" collapsible className="w-full bg-muted/30 rounded-md">
                                {/* Remove border from AccordionItem */}
                                <AccordionItem value="sources" className="border-none">
                                  {/* Adjust padding on Trigger */}
                                  <AccordionTrigger className="text-sm hover:no-underline py-3 px-4 text-muted-foreground">
                                    Show Search Results ({adaptedSources.length} sources)
                                  </AccordionTrigger>
                                  {/* Remove top border and adjust padding on Content */}
                                  <AccordionContent className="pt-0 pb-4 px-4">
                                    <SearchResult
                                      answer={searchContext} // Pass context here if needed by SearchResult, otherwise remove
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

                          // Display tool result collapsed by default
                          return (
                            <div key={`${m.id}-tool-${toolCallId}`} className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground">
                              <div className="font-mono text-xs">
                                Tool result from <span className="font-semibold">{toolName}</span>
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Start chatting below!
          </div>
        )}
        {/* Element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Replace the old input form with our new ChatInput component */}
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWrapper} // Use the wrapper
        isLoading={isLoading}
        // Pass activeModes Set and toggle function
        activeModes={activeModes}
        toggleChatMode={toggleChatMode}
      />
      </div>
    </TooltipProvider>
  );
}
