'use client';

import { useChat, type Message } from '@ai-sdk/react';
import { MemoizedMarkdown } from '@/components/memoized-markdown';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Added Textarea
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react'; // Added useState
import { SearchResult, type Source as AppSource } from '@/components/SearchResult';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon, BotIcon, SearchIcon, Copy, Edit, RefreshCw, Check } from "lucide-react"; // Added icons
import { useToast } from "@/components/ui/use-toast"; // Added for copy feedback
// Import Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Chat() {
  const { toast } = useToast(); // Initialize toast
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, reload } = useChat({ // Added setMessages and reload
    api: '/api/chat',
    maxSteps: 5, // Consider if maxSteps affects regeneration
    onFinish: (message: Message) => {
      console.log("Stream finished. Final assistant message:", message);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // State for editing message index
  const [editedContent, setEditedContent] = useState<string>(''); // State for edited content

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12 min-h-screen">
      <div className="flex-grow overflow-y-auto mb-4 pb-24 w-full">
        {messages.length > 0 ? (
          messages.map((m: Message, messageIndex: number) => ( // Added messageIndex
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
                      onClick={() => handleCopy(m)}
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </>
                ) : ( // Assistant message
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(m)}
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRegenerate(messageIndex)} // Pass messageIndex
                      title="Regenerate response"
                      disabled={isLoading} // Disable if already loading
                    >
                      {/* Consider adding a loading state specific to regeneration? */}
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>

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
                {/* Conditional Rendering: Edit Mode vs Display Mode */}
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
                            // Add w-full here to make the text container take full available width
                            <div className='py-2 w-full' key={`${m.id}-text-${index}`}>
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
                )}
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

  // --- Helper Functions ---

  // Function to extract text content from a message
  function getMessageText(message: Message): string {
    return message.parts
      ?.filter(part => part.type === 'text')
      .map(part => part.text)
      .join('') ?? ''; // Fallback to empty string if no text parts
  }

  // Function to handle copying message content
  function handleCopy(message: Message) {
    const textToCopy = getMessageText(message);
    if (!textToCopy) {
      toast({ title: "Nothing to copy", variant: "destructive" });
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        // description: "Message content copied.",
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

  // Function to handle regenerating an assistant response
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

  // --- Edit Functions ---

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

  // Function to save the edited message and trigger reload
  function handleSaveEdit() {
    if (editingIndex === null || !editedContent.trim()) return;

    const updatedMessages = messages.map((msg, index) => {
      if (index === editingIndex) {
        // Update the content of the user message
        // Explicitly type 'text' using 'as const' to satisfy the Message type
        return { ...msg, parts: [{ type: 'text' as const, text: editedContent }] };
      }
      return msg;
    });

    // Keep only messages up to and including the edited one
    const messagesToResubmit = updatedMessages.slice(0, editingIndex + 1);

    setMessages(messagesToResubmit);
    setEditingIndex(null);
    setEditedContent('');
    // Reload the chat with the updated history
    reload();
  }

}
