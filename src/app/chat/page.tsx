'use client';

import * as React from 'react';
import { useChat, type Message } from '@ai-sdk/react';
import {
  Copy,
  Cpu,
  Edit,
  FileText,
  Image as ImageIcon,
  RotateCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { AttachmentBadges } from '@/components/AttachmentBadges'; // Import the new component
import { ChatInput } from '@/components/ChatInput';
import { ChatMessageActions } from '@/components/ChatMessageActions';
import { CodeBlock } from '@/components/code-block'; // Keep for potential direct use? (Maybe remove later if only in MessagePartRenderer)
import { MemoizedMarkdown } from '@/components/memoized-markdown'; // Keep for potential direct use? (Maybe remove later if only in MessagePartRenderer)
import { MessagePartRenderer } from '@/components/MessagePartRenderer';
import { SearchResult, type Source as AppSource } from '@/components/SearchResult'; // Keep for potential direct use? (Maybe remove later if only in MessagePartRenderer)
import { cn, truncateFileName } from '@/lib/utils';

// --- Type Definitions ---

// Removed SdkSource as it's handled in MessagePartRenderer

/** Represents attachment information stored locally or passed from ChatInput. */
type LocalAttachmentInfo = {
  name: string;
  mimeType: string;
};

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
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editedContent, setEditedContent] = React.useState<string>('');
  const [activeModes, setActiveModes] = React.useState<Set<string>>(new Set());
  // State to hold attachments temporarily before adding to the message
  const [pendingAttachments, setPendingAttachments] = React.useState<LocalAttachmentInfo[] | null>(null);

  // --- AI SDK Chat Hook ---
  const {
    messages: rawMessages, // Renamed to avoid conflict with processed messages
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    reload,
  } = useChat({
    api: '/api/chat',
    // maxSteps: 2, // Example: Allow multiple tool calls if needed
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

  /** Callback for ChatInput to pass attachments before submission */
  const handleBeforeSubmit = React.useCallback((attachments: LocalAttachmentInfo[]) => {
    setPendingAttachments(attachments);
  }, []); // No dependencies, just sets state

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

  /** Wraps the original handleSubmit to include active modes and handle local attachments. */
  const handleSubmitWrapper = React.useCallback(
    (
      e: React.FormEvent<HTMLFormElement>,
      options?: {
        data?: Record<string, any> & {
          localAttachments?: LocalAttachmentInfo[];
        };
      },
    ) => {
      const activeModeIds = Array.from(activeModes);
      // Files are now handled by the ChatInput component and passed in options.data.files
      // We just need to ensure activeModes is included.

      // Prepare data for the actual backend submission
      const backendData = {
        ...options?.data, // Include any data from ChatInput (like files)
        activeModes: activeModeIds, // Add active modes
      };
      // localAttachments is no longer passed from ChatInput in the data object

      console.log('Submitting with data:', backendData); // Debug log

      originalHandleSubmit(e, {
        data: backendData,
      });
    },
    [activeModes, originalHandleSubmit], // Dependencies
  );

  // --- Effects ---

  /** Scrolls to the bottom of the chat list when messages change. */
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]); // Dependency on the number of messages

  // Effect to add pending attachments to the last user message
  React.useEffect(() => {
    if (pendingAttachments && messages.length > 0) {
      const lastMessageIndex = messages.length - 1;
      const lastMessage = messages[lastMessageIndex];

      // Check if it's a user message and doesn't already have attachments property
      if (lastMessage.role === 'user' && !(lastMessage as any).attachments) {
        const updatedMessage = {
          ...lastMessage,
          attachments: pendingAttachments, // Add the attachments
        };

        // Update the messages array
        setMessages((currentMessages) => [
          ...currentMessages.slice(0, lastMessageIndex),
          updatedMessage,
        ]);

        // Clear pending attachments
        setPendingAttachments(null);
      }
    }
  }, [messages, pendingAttachments, setMessages]); // Dependencies

  // --- Render Logic ---

  return (
    <TooltipProvider delayDuration={100}>
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
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
              <h1 className="text-4xl">Welcome!</h1>
              <p className="font-mono lowercase">What can I help you learn?</p>
            </div>
          )}
          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmitWrapper}
          isLoading={isLoading}
          activeModes={activeModes}
          toggleChatMode={handleToggleChatMode} // Use renamed handler
          setMessages={setMessages} // Pass setMessages down
          onBeforeSubmit={handleBeforeSubmit} // Pass the callback
        />
      </div>
    </TooltipProvider>
  );
}
