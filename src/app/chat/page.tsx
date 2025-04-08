'use client';

import * as React from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
// Link import is not needed
import { useChat, type Message } from '@ai-sdk/react';
import { Cpu, TriangleAlert } from 'lucide-react'; // Removed unused: Copy, Edit, FileText, ImageIcon, RotateCw
import type { User } from '@supabase/supabase-js'; // Import User type
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components
// Removed unused: Accordion, AccordionContent, AccordionItem, AccordionTrigger
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { AttachmentBadges } from '@/components/AttachmentBadges'; // Import the new component
import { ChatInput } from '@/components/ChatInput';
import { ChatMessageActions } from '@/components/ChatMessageActions';
// Removed unused: CodeBlock
// Removed unused: MemoizedMarkdown
import { MessagePartRenderer } from '@/components/MessagePartRenderer';
// Removed unused: SearchResult, AppSource
import { cn } from '@/lib/utils'; // Removed unused: truncateFileName
import { TopRightMenu } from '@/components/TopRightMenu';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// --- Type Definitions ---

// Removed SdkSource as it's handled in MessagePartRenderer

// Removed LocalAttachmentInfo type definition

// Removed local MessageWithAttachments type definition
// type MessageWithAttachments = Message & { attachments?: LocalAttachmentInfo[] };


// --- Constants ---
// Removed MAX_CHAT_MESSAGES constant

// --- Helper Functions ---

/**
 * Extracts the primary text content from a message object.
 * @param message - The message object.
 * @returns The text content, or an empty string if none is found.
 */
function getMessageText(message: Message): string {
  if (!message.parts) {
    return typeof message.content === 'string' ? message.content : ''; // Fallback for simple string content
  }
  const textPart = message.parts.find((part) => part.type === 'text');
  // Ensure textPart is not null and has a 'text' property
  if (textPart && 'text' in textPart && typeof textPart.text === 'string') {
    return textPart.text;
  }
  return '';
}

// --- Chat Component ---

/**
 * The main chat interface component.
 * Handles message display, user input, editing, regeneration, and tool result rendering.
 */
export default function Chat() {
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // --- State ---
  const [tokenUsage, setTokenUsage] = React.useState<Map<string, number>>(
    new Map(),
  );
  const [contextUsagePercent, setContextUsagePercent] = useState<number>(0);

  const [inputText, setInputText] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const estimateTokens = (text: string) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set());
  // Removed pendingAttachments state
  // const [pendingAttachments, setPendingAttachments] = useState<LocalAttachmentInfo[] | null>(null);
  // State to hold the authenticated user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // State to track if the daily backend limit was hit
  const [isDailyLimitReached, setIsDailyLimitReached] = useState<boolean>(false);

  // --- AI SDK Chat Hook ---
  const {
    messages: rawMessages, // Renamed to avoid conflict with processed messages
    input,
    handleInputChange,
    handleSubmit, // Use handleSubmit directly from useChat
    isLoading,
    setMessages,
    reload,
    stop, // Add stop function
    status, // Add status property
  } = useChat({
    api: '/api/chat',
    // maxSteps: 2, // Example: Allow multiple tool calls if needed
    onError: (error) => {
      // Check if the error is an Error instance and its message indicates the limit was reached
      if (error instanceof Error && error.message.includes('Daily limit reached')) {
        console.log('Received limit reached error message, setting daily limit reached.');
        setIsDailyLimitReached(true); // Set the state to show the banner
      } else {
        // Log other unexpected errors
        console.error('Chat API Error (Unhandled):', error);
        // Optionally, show a generic error toast for other issues
        // toast({ title: 'An unexpected error occurred', description: error.message || 'Please try again.', variant: 'destructive' });
      }
    },
    onFinish: (message, options) => {
      console.log('Stream finished. Final assistant message:', message);
      // Store token usage when the stream for an assistant message finishes
      if (message.role === 'assistant' && options?.usage?.totalTokens) {
        console.log(
          `Storing token usage for message ${message.id}: ${options.usage.totalTokens}`,
        );
        setTokenUsage((prev) =>
          new Map(prev).set(message.id, options.usage.totalTokens!),
        );
      } else if (message.role === 'assistant') {
        console.warn(`Token usage data not available for message ${message.id}`);
      }
    },
  });

  // Use rawMessages directly as the source of truth
  const messages: Message[] = rawMessages;
  // Removed frontend message limit calculation
  // const currentMessageCount = messages.length;
  // const isMessageLimitReached = currentMessageCount >= MAX_CHAT_MESSAGES;

  // --- Event Handlers ---

  /** Toggles the active state of a chat mode. */
  const handleToggleChatMode = React.useCallback((modeId: string) => {
    setActiveModes((prevModes) => {
      const newModes = new Set(prevModes);
      if (newModes.has(modeId)) {
        newModes.delete(modeId);
      } else {
        newModes.add(modeId);
      }
      return newModes;
    });
  }, []); // Empty dependency array as it only depends on setActiveModes

  /** Starts editing a user message. */
  const handleEditStart = React.useCallback(
    (index: number) => {
      if (messages[index]?.role === 'user') {
        setEditingIndex(index);
        setEditedContent(getMessageText(messages[index]));
      }
    },
    [messages], // Depends on the messages array
  );

  /** Cancels the current message edit. */
  const handleCancelEdit = React.useCallback(() => {
    setEditingIndex(null);
    setEditedContent('');
  }, []); // No dependencies

  /** Saves the edited message and triggers a reload. */
  const handleSaveEdit = React.useCallback(async () => {
    if (editingIndex === null || !editedContent.trim()) return;

    const originalMessage = messages[editingIndex];
    if (!originalMessage) return; // Should not happen if editingIndex is valid

    // Create the edited message with only the text part
    const editedMessage: Message = {
      ...originalMessage, // Retain id, role, createdAt etc.
      content: editedContent.trim(), // Simple string content for user message edit
      parts: undefined, // Clear parts if they existed
      toolInvocations: undefined, // Clear tool invocations if they existed
      // toolResult: undefined, // Removed: Property 'toolResult' does not exist on type 'Message'.
    };

    // Create a new messages array up to the edited message
    const newMessages = [...messages.slice(0, editingIndex), editedMessage];

    // Update the local state and trigger reload
    setMessages(newMessages);
    setEditingIndex(null);
    setEditedContent('');
    reload(); // Reload will likely use the newMessages state
  }, [editingIndex, editedContent, messages, setMessages, reload]); // Dependencies

  /** Copies the text content of a message to the clipboard. */
  const handleCopy = React.useCallback(
    (message: Message) => {
      const textToCopy = getMessageText(message);
      if (!textToCopy) {
        toast({ title: 'Nothing to copy', variant: 'destructive' });
        return;
      }
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast({ title: 'Copied to clipboard', duration: 2000 });
        })
        .catch((err) => {
          console.error('Copy failed:', err);
          toast({
            title: 'Copy failed',
            description: 'Could not copy message to clipboard.',
            variant: 'destructive',
          });
        });
    },
    [toast], // Depends on toast
  );

  // Removed handleBeforeSubmit callback
  // const handleBeforeSubmit = React.useCallback((attachments: LocalAttachmentInfo[]) => {
  //   setPendingAttachments(attachments);
  // }, []);

  /** Regenerates the response for an assistant message. */
  const handleRegenerate = React.useCallback(
    (assistantMessageIndex: number) => {
      if (isLoading) return;
      const userMessageIndex = assistantMessageIndex - 1;
      // Check if the previous message exists and is a user message
      if (
        userMessageIndex >= 0 &&
        messages[userMessageIndex]?.role === 'user'
      ) {
        // Keep messages up to (but not including) the assistant message to regenerate
        const messagesToKeep = messages.slice(0, assistantMessageIndex);
        setMessages(messagesToKeep);
        reload(); // Reload will use the truncated message list
      } else {
        toast({
          title: 'Regeneration failed',
          description:
            'Could not find the corresponding user message to regenerate from.',
          variant: 'destructive',
        });
      }
    },
    [isLoading, messages, setMessages, reload, toast], // Dependencies
  );

  // Removed handleSubmitWrapper - ChatInput now handles options directly
  // const handleSubmitWrapper = React.useCallback( ... );

  // --- Effects ---

  /** Scrolls to the bottom of the chat list when messages change. */
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]); // Dependency on the number of messages

  /** Updates context window usage percentage */
  React.useEffect(() => {
    let totalTokens = 0;
    for (const m of messages) {
      if (m.role === 'assistant' && tokenUsage.has(m.id)) {
        totalTokens += tokenUsage.get(m.id)!;
      } else if (m.role === 'user') {
        totalTokens += estimateTokens(getMessageText(m));
      }
    }

    // Add estimated tokens for current input text
    totalTokens += estimateTokens(inputText);

    const percent = Math.min(100, (totalTokens / 500_000) * 100);
    setContextUsagePercent(percent);
  }, [messages, tokenUsage, inputText, attachedFiles]);

  // Removed effect for pendingAttachments
  // React.useEffect(() => { ... }, [messages, pendingAttachments, setMessages]);

  // --- User Authentication ---
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        // Optionally handle the error, e.g., show a toast
      } else {
        setCurrentUser(user);
      }
    };

    fetchUser();
  }, [supabase]); // Dependency on supabase client instance

  // --- Render Logic ---

  return (
    <TooltipProvider delayDuration={100}>
      {/* Pass the currentUser state to TopRightMenu */}
      <TopRightMenu user={currentUser} />
      <div className="flex min-h-screen flex-col max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Chat Messages Area */}
        <div className="flex-grow overflow-y-auto mb-4 pb-24 w-full">
          {messages.length > 0 ? (
            messages.map((m, messageIndex) => (
              <div key={m.id} className="relative flex flex-col py-4 group">
                {/* Use ChatMessageActions Component */}
                <ChatMessageActions
                  message={m}
                  messageIndex={messageIndex}
                  isLoading={isLoading}
                  onEdit={handleEditStart}
                  onCopy={handleCopy}
                  onRegenerate={handleRegenerate}
                />

                {/* Role Indicator */}
                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{m.role === 'user' ? 'You' : 'AI Assistant'}</span>
                </div>

                {/* Message Content Area */}
                <div className="pl-0">
                  {editingIndex === messageIndex ? (
                    // --- Editing View ---
                    <div className="space-y-2 py-2">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full text-sm"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={isLoading || !editedContent.trim()}
                        >
                          Save & Submit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // --- Display View ---
                    <>
                      {/* Use MessagePartRenderer to handle parts and fallback */}
                      <MessagePartRenderer message={m} />

                      {/* Use AttachmentBadges component */}
                      <AttachmentBadges message={m} />
                    </> // End Display View Fragment
                  )}

                  {/* Render Token Usage Badge (Assistant Messages Only) */}
                  {m.role === 'assistant' && tokenUsage.has(m.id) && (
                    <div className="mt-2 flex justify-end">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-normal"
                      >
                        <Cpu className="mr-1 h-3 w-3" />
                        {/* Color-coded dot based on token usage */}
                        <span
                          className={cn(
                            'mr-1 inline-block h-2 w-2 rounded-full',
                            tokenUsage.get(m.id)! < 1000
                              ? 'bg-green-500'
                              : tokenUsage.get(m.id)! < 10000
                                ? 'bg-yellow-500'
                                : 'bg-blue-500',
                          )}
                        />
                        <span className="text-xs font-semibold lowercase">
                          Token Usage:
                        </span>{' '}
                        {tokenUsage.get(m.id)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div> // End Message Wrapper
            ))
          ) : (
            // --- Empty Chat View ---
            <div className="flex h-full flex-col items-center justify-center px-4 text-center space-y-6">
              <h1 className="text-xl md:text-2xl font-normal tracking-wide *:text-gray-400 dark:text-gray-100">
                Hi {currentUser?.user_metadata?.full_name || 'there'}!
              </h1>
              <p className="text-sm tracking-widest md:text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-100">
                What do you want to learn today?
              </p>
            </div>
          )}
          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Daily Limit Reached Alert */}
        {isDailyLimitReached && (
          <Alert variant="default" className="mb-4">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Daily Message Limit Reached</AlertTitle>
            <AlertDescription>
              <span>
              You have used all your messages for today on the free plan. Please
              try again tomorrow or consider <Link href="/pricing" className='font-semibold underline text-black'>upgrading your plan</Link>.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Chat Input Area */}
        {/* Disable input if daily limit is reached */}
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit} // Pass handleSubmit directly
          isLoading={isLoading}
          activeModes={activeModes}
          toggleChatMode={handleToggleChatMode} // Use renamed handler
          stop={stop} // Pass stop function
          status={status} // Pass status
          disabled={isDailyLimitReached || contextUsagePercent > 90} // Disable input if daily limit hit or context > 90%
          contextUsagePercent={contextUsagePercent}
          onInputAndFilesChange={(inputText, files) => {
            setInputText(inputText);
            setAttachedFiles(files);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
