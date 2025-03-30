'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  SendHorizontal,
  Mic,
  Paperclip,
  Maximize2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getAllChatModes } from '@/config/chat-modes'; // Import mode config utils
import { type Message } from '@ai-sdk/react'; // Import Message type
import { useFileHandling, readFileAsDataURL } from '@/hooks/useFileHandling'; // Import the hook and helper
import { FileAttachmentDisplay } from './FileAttachmentDisplay'; // Import new component
import { ChatModeBadges } from './ChatModeBadges'; // Import new component
import { ChatModeToggles } from './ChatModeToggles'; // Import new component
import { FullscreenInputModal } from './FullscreenInputModal'; // Import new component

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    // Pass generic data object, expecting activeModes and potentially files
    options?: { data?: { activeModes?: string[]; files?: Array<{ name: string; mimeType: string; data: string }>; localAttachments?: Array<{ name: string; mimeType: string }> } } // Added localAttachments to options type
  ) => void;
  isLoading: boolean;
  placeholder?: string;
  // New props for dynamic modes
  activeModes: Set<string>;
  toggleChatMode: (modeId: string) => void;
  setMessages: (messages: Message[] | ((currentMessages: Message[]) => Message[])) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit: originalHandleSubmit, // Rename original prop
  isLoading,
  placeholder = 'Ask about anything...',
  activeModes,
  toggleChatMode,
  setMessages, // Keep setMessages if needed by originalHandleSubmit or other logic
}: ChatInputProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for fullscreen modal

  // Use the file handling hook
  const {
    selectedFiles,
    setSelectedFiles,
    handleFileSelection,
    handleRemoveFile,
    totalSelectedSizeMB,
    maxFiles,
    maxTotalSizeMB,
    allowedMimeTypes,
  } = useFileHandling();

  // Focus input field on mount or when modal closes
  useEffect(() => {
    if (inputRef.current && !isModalOpen) {
      inputRef.current.focus();
    }
  }, [isModalOpen]); // Re-run if modal state changes

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  // Wrapper for handleSubmit to include files
  const handleSubmitWithFiles = useCallback(async (
    e: React.FormEvent<HTMLFormElement>,
    options?: { data?: Record<string, any> } // Keep original options structure
  ) => {
    e.preventDefault();

    const fileDataArray: Array<{ name: string; mimeType: string; data: string }> = [];
    const attachmentInfoArray: Array<{ name: string; mimeType: string }> = [];

    if (selectedFiles.length > 0) {
      try {
        const readPromises = selectedFiles.map(readFileAsDataURL); // Use helper from hook
        const base64Strings = await Promise.all(readPromises);
        selectedFiles.forEach((file, index) => {
          fileDataArray.push({
            name: file.name,
            mimeType: file.type,
            data: base64Strings[index],
          });
          attachmentInfoArray.push({
            name: file.name,
            mimeType: file.type,
          });
        });
      } catch (error) {
        console.error("Error reading files:", error);
        toast({
          title: "Error reading files",
          description: "Could not process attached files. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const finalData = {
      ...options?.data,
      activeModes: Array.from(activeModes),
      ...(fileDataArray.length > 0 && { files: fileDataArray }),
      ...(attachmentInfoArray.length > 0 && { localAttachments: attachmentInfoArray }),
    };

    originalHandleSubmit(e, { data: finalData });

    // Clear files using the hook's setter
    setSelectedFiles([]);
    if (isModalOpen) {
      setIsModalOpen(false); // Close modal if open
    }
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit';
      inputRef.current.style.overflowY = 'hidden';
    }
  }, [selectedFiles, activeModes, originalHandleSubmit, toast, isModalOpen, setSelectedFiles, inputRef]); // Updated dependencies

  // Get available modes
  const availableModes = getAllChatModes();

  // Determine if submit button should be disabled (uses selectedFiles from hook)
  const isSubmitDisabled = isLoading || (!input.trim() && selectedFiles.length === 0);

  // Handle keydown for Cmd/Ctrl+Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault(); // Prevent newline
      if (!isSubmitDisabled && formRef.current) {
        // Trigger form submission
        formRef.current.requestSubmit();
      }
    }
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection} // Use handler from hook
        multiple
        accept={allowedMimeTypes.join(',')} // Use types from hook
        className="hidden"
        aria-hidden="true"
      />

      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl py-4">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Use the wrapper handleSubmit for the main form, add ref */}
          <form ref={formRef} onSubmit={handleSubmitWithFiles} className="relative">
            <div className={cn(
              "rounded-xl border bg-background transition-all duration-300 shadow-sm flex flex-col", // Added flex flex-col
              isFocused ? "ring-2 ring-primary/20 border-primary/30" : "border-border/60",
            )}>
              {/* Top Section: Badges and Input */}
              <div className="flex flex-col">
                {/* Use ChatModeBadges component */}
                <ChatModeBadges activeModes={activeModes} />

                {/* Input Row */}
                <div className={cn(
                  "flex items-center px-2 md:px-3",
                  activeModes.size > 0 && "pt-2 mt-2 border-t border-border/30" // Add border if badges shown
                )}>
                  {/* Use flex items-end gap-2 for the main row, add w-full */}
                  <div className="flex items-end gap-2 w-full">
                    {/* Textarea wrapper: Use grow, remove min-w-full */}
                    <div className="grow">
                    <Textarea
                      ref={inputRef}
                      rows={1} // Start with a single row
                      className="w-full border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-3 min-h-[48px] rounded-none text-sm bg-transparent resize-none overflow-y-hidden" // Keep w-full here for inner element
                      value={input}
                      placeholder={placeholder}
                      onKeyDown={handleKeyDown} // Add keydown handler
                      onChange={(e) => {
                        handleInputChange(e);
                        // Auto-resize logic
                        e.target.style.height = 'inherit'; // Reset height
                        e.target.style.height = `${e.target.scrollHeight}px`; // Set to scroll height
                        // Prevent excessive growth (optional, adjust max-height as needed)
                        e.target.style.overflowY = e.target.scrollHeight > 200 ? 'auto' : 'hidden'; // Show scrollbar if very tall
                      }}
                      disabled={isLoading}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                    </div>
                   <div className="flex-none text-right">
                   <div className="flex flex-row gap-1 items-center pb-[7px]">
                      {isLoading && (
                        <div className="flex space-x-1 items-center mr-1">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                        disabled={isLoading}
                        onClick={() => setIsModalOpen(true)} // Open modal
                        aria-label="Fullscreen mode"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                        disabled={isLoading || selectedFiles.length >= maxFiles} // Use maxFiles from hook
                        onClick={triggerFileInput}
                        aria-label="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      {/* Removed ImagePlus button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                        disabled={isLoading}
                        aria-label="Voice input"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="submit"
                        size="icon"
                        variant="default"
                        disabled={isSubmitDisabled}
                        className={cn(
                          "h-8 w-8 rounded-full shrink-0 transition-all duration-200 ml-1",
                          isSubmitDisabled && "opacity-70"
                        )}
                        aria-label="Send message"
                      >
                        <SendHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                   </div>
                  </div>
                </div>
              </div>

              {/* Use FileAttachmentDisplay component */}
              <FileAttachmentDisplay
                selectedFiles={selectedFiles}
                handleRemoveFile={handleRemoveFile}
                maxFiles={maxFiles}
                maxTotalSizeMB={maxTotalSizeMB}
                totalSelectedSizeMB={totalSelectedSizeMB}
              />

              {/* Use ChatModeToggles component */}
              <ChatModeToggles
                availableModes={availableModes}
                activeModes={activeModes}
                toggleChatMode={toggleChatMode}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Use FullscreenInputModal component */}
      <FullscreenInputModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWithFiles} // Pass the main submit handler
        isLoading={isLoading}
        isSubmitDisabled={isSubmitDisabled}
        placeholder={placeholder}
        selectedFiles={selectedFiles}
        handleRemoveFile={handleRemoveFile}
        maxFiles={maxFiles}
        maxTotalSizeMB={maxTotalSizeMB}
        totalSelectedSizeMB={totalSelectedSizeMB}
      />
    </>
  );
}
