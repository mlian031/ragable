"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SendHorizontal, Mic, Paperclip, Maximize2, X } from "lucide-react"; // Added X
import { useToast } from "@/components/ui/use-toast";
import { getAllChatModes } from "@/config/chat-modes"; // Import mode config utils
// Removed useFileHandling import
import { FileAttachmentDisplay } from "./FileAttachmentDisplay"; // Import new component
import { ChatModeBadges } from "./ChatModeBadges"; // Import new component
import { ChatModeToggles } from "./ChatModeToggles"; // Import new component
import { FullscreenInputModal } from "./FullscreenInputModal"; // Import new component
import { Badge } from "./ui/badge";

// Define LocalAttachmentInfo type - this will be used by the parent as well
type LocalAttachmentInfo = {
  name: string;
  mimeType: string;
};

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    // Align with useChat's experimental_attachments option
    options?: {
      data?: {
        activeModes?: string[];
      };
      experimental_attachments?: FileList; // Expect FileList here
    }
  ) => void;
  isLoading: boolean;
  placeholder?: string;
  // Removed onBeforeSubmit prop
  // onBeforeSubmit?: (attachments: LocalAttachmentInfo[]) => void;
  // New props for dynamic modes
  activeModes: Set<string>;
  toggleChatMode: (modeId: string) => void;
  // Removed unused setMessages prop
  // setMessages: (messages: Message[] | ((currentMessages: Message[]) => Message[])) => void;
  // Add stop and status props
  stop: () => void;
  status: "submitted" | "streaming" | "ready" | "error";
  // Removed unused message count props from interface
  // currentMessageCount: number;
  // maxChatMessages: number;
  // Add disabled prop
  disabled?: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit: originalHandleSubmit, // Rename original prop
  isLoading,
  placeholder = "Ask about anything...",
  activeModes,
  toggleChatMode,
  // Removed unused setMessages from destructuring
  // setMessages,
  // Removed onBeforeSubmit from destructuring
  // onBeforeSubmit,
  stop, // Destructure stop
  status, // Destructure status
  // Removed unused message count props from destructuring
  // currentMessageCount,
  // maxChatMessages,
  disabled = false, // Destructure disabled prop with default value
}: ChatInputProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Keep this ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for fullscreen modal
  const [selectedFileList, setSelectedFileList] = useState<FileList | undefined>(undefined); // State for FileList

  // Constants for validation (replace with values from old hook or config)
  const maxFiles = 5; // Example limit
  const maxTotalSizeMB = 50; // Example limit
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]; // Example types

  // Convert FileList to Array for easier handling in UI/validation
  const selectedFilesArray = selectedFileList ? Array.from(selectedFileList) : [];

  // Calculate total size
  const totalSelectedSizeMB = selectedFilesArray.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024;

  // Handler for file input change
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentFiles = selectedFileList ? Array.from(selectedFileList) : [];
    const newFiles = Array.from(files);
    let combinedFiles = [...currentFiles, ...newFiles];
    let validationError = false;

    // Validate total count
    if (combinedFiles.length > maxFiles) {
      toast({ title: "File Limit Reached", description: `You can only attach up to ${maxFiles} files.`, variant: "destructive" });
      combinedFiles = combinedFiles.slice(0, maxFiles); // Keep only allowed number
      validationError = true;
    }

    // Validate types and total size
    let currentTotalSize = 0;
    const validatedFiles = combinedFiles.filter(file => {
      if (!allowedMimeTypes.includes(file.type)) {
        toast({ title: "Unsupported File Type", description: `File type (${file.type}) for "${file.name}" is not allowed.`, variant: "destructive" });
        validationError = true;
        return false;
      }
      const fileSize = file.size;
      if (currentTotalSize + fileSize > maxTotalSizeMB * 1024 * 1024) {
        toast({ title: "Total Size Limit Exceeded", description: `Adding "${file.name}" would exceed the total size limit of ${maxTotalSizeMB}MB.`, variant: "destructive" });
        validationError = true;
        return false;
      }
      currentTotalSize += fileSize;
      return true;
    });

    // Update state using DataTransfer to create a new FileList
    const dataTransfer = new DataTransfer();
    validatedFiles.forEach(file => dataTransfer.items.add(file));
    setSelectedFileList(dataTransfer.files.length > 0 ? dataTransfer.files : undefined);

    // Clear the input value to allow re-selecting the same file if needed
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }

  }, [selectedFileList, maxFiles, maxTotalSizeMB, allowedMimeTypes, toast]);

  // Removed readFileAsDataURL helper

  // Handler to remove a file by index
  const handleRemoveFile = useCallback((indexToRemove: number) => {
    setSelectedFileList(prevFileList => {
      if (!prevFileList) return undefined;
      const currentFiles = Array.from(prevFileList);
      const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);

      if (updatedFiles.length === 0) return undefined;

      const dataTransfer = new DataTransfer();
      updatedFiles.forEach(file => dataTransfer.items.add(file));
      return dataTransfer.files;
    });
  }, []);


  // --- START: Clipboard Paste Handling ---
  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      let imagePasted = false; // Flag to check if an image was processed

      console.log(imagePasted)

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.kind === "file" && item.type.startsWith("image/")) {
          event.preventDefault(); // Prevent default paste only if an image is found
          imagePasted = true;
          const file = item.getAsFile();

          if (!file) {
            toast({
              title: "Paste Error",
              description: "Could not retrieve pasted image file.",
              variant: "destructive",
            });
            continue; // Skip to next item
          }

          // --- Validation (using component state/constants) ---
          if (!allowedMimeTypes.includes(file.type)) {
            toast({
              title: "Unsupported File Type",
              description: `Pasted image type (${file.type}) is not allowed.`,
              variant: "destructive",
            });
            continue;
          }

          const currentFilesCount = selectedFileList?.length ?? 0;
          if (currentFilesCount >= maxFiles) {
            toast({
              title: "File Limit Reached",
              description: `You can only attach up to ${maxFiles} files.`,
              variant: "destructive",
            });
            continue;
          }

          const fileSizeMB = file.size / 1024 / 1024;
          const currentTotalSizeMB = selectedFilesArray.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
          if (currentTotalSizeMB + fileSizeMB > maxTotalSizeMB) {
            toast({
              title: "Total Size Limit Exceeded",
              description: `Adding this image would exceed the total size limit of ${maxTotalSizeMB}MB.`,
              variant: "destructive",
            });
            continue;
          }
          // --- End Validation ---

          // Add the valid file to the FileList state
          setSelectedFileList(prevFileList => {
             const dataTransfer = new DataTransfer();
             if (prevFileList) {
               Array.from(prevFileList).forEach(f => dataTransfer.items.add(f));
             }
             dataTransfer.items.add(file);
             return dataTransfer.files;
          });


          toast({
            title: "Image Pasted",
            description: `"${file.name}" added as an attachment.`,
          });
        }
      }
      // If no image was pasted, allow default paste behavior for text, etc.
    },
    [
      selectedFileList, // Use FileList state
      setSelectedFileList,
      selectedFilesArray, // Use derived array for size calculation
      allowedMimeTypes,
      maxFiles,
      maxTotalSizeMB,
      toast,
    ] // Updated dependencies
  );
  // --- END: Clipboard Paste Handling ---

  // Focus input field on mount or when modal closes
  useEffect(() => {
    if (inputRef.current && !isModalOpen) {
      inputRef.current.focus();
    }
  }, [isModalOpen]); // Re-run if modal state changes

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Simplified handleSubmit wrapper to use experimental_attachments
  const handleSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // Prevent default form submission

      // Prepare options for the original handleSubmit
      const submitOptions: {
        data?: { activeModes?: string[] };
        experimental_attachments?: FileList;
      } = {
        // Pass active modes in the data payload if needed by the backend
        data: {
          activeModes: Array.from(activeModes),
        },
        // Pass the FileList directly using the experimental option
        experimental_attachments: selectedFileList,
      };

      // Call the original handleSubmit passed via props
      originalHandleSubmit(e, submitOptions);

      // Clear the selected files state
      setSelectedFileList(undefined);
      // Clear the file input visually
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (isModalOpen) {
        setIsModalOpen(false); // Close modal if open
      }
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "inherit";
        inputRef.current.style.overflowY = "hidden";
      }
    },
    [
      activeModes,
      selectedFileList, // Depend on FileList state
      originalHandleSubmit,
      isModalOpen,
      // Removed toast dependency as file reading errors are gone
    ] // Simplified dependencies
  );

  // Get available modes
  const availableModes = getAllChatModes();

  // Determine if submit button should be disabled
  const isSubmitDisabled =
    disabled ||
    isLoading ||
    (!input.trim() && selectedFilesArray.length === 0); // Use derived array

  // Handle keydown for Cmd/Ctrl+Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
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
        onChange={handleFileChange} // Use updated handler
        multiple
        accept={allowedMimeTypes.join(",")} // Use component constants
        className="hidden"
        aria-hidden="true"
      />

      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl py-4">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Use the simplified handleSubmit wrapper */}
          <form
            ref={formRef}
            onSubmit={handleSubmitWrapper}
            className="relative"
          >
            <div
              className={cn(
                "rounded-xl border bg-background transition-all duration-300 shadow-sm flex flex-col", // Added flex flex-col
                isFocused
                  ? "ring-2 ring-primary/20 border-primary/30"
                  : "border-border/60"
              )}
            >
              {/* Top Section: Badges and Input */}
              <div className="flex flex-col">
                {/* Use ChatModeBadges component */}
                <ChatModeBadges activeModes={activeModes} />

                {/* Input Row */}
                <div
                  className={cn(
                    "flex items-center px-2 md:px-3",
                    activeModes.size > 0 &&
                      "pt-2 mt-2 border-t border-border/30" // Add border if badges shown
                  )}
                >
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
                          e.target.style.height = "inherit"; // Reset height
                          e.target.style.height = `${e.target.scrollHeight}px`; // Set to scroll height
                          // Prevent excessive growth (optional, adjust max-height as needed)
                          e.target.style.overflowY =
                            e.target.scrollHeight > 200 ? "auto" : "hidden"; // Show scrollbar if very tall
                        }}
                        disabled={isLoading || disabled} // Apply disabled prop
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onPaste={handlePaste} // Add paste handler
                      />
                    </div>
                    <div className="flex-none text-right">
                      <div className="flex flex-row gap-1 items-center pb-[7px]">
                        {isLoading && (
                          <div className="flex space-x-1 items-center mr-1">
                            <div
                              className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        )}
                        {/* Add Stop Button */}
                        {(status === "submitted" || status === "streaming") && (
                          <div className="px-2">
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-1 lowercase font-mono"
                              onClick={stop}
                              aria-label="Stop Generating"
                            >
                              Stop
                            </Badge>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                          disabled={isLoading || disabled} // Apply disabled prop
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
                          disabled={
                            disabled || isLoading || selectedFilesArray.length >= maxFiles // Use derived array length
                          }
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
                          disabled={isLoading || disabled} // Apply disabled prop
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

              {/* TODO: Update FileAttachmentDisplay to accept File[] instead of FileList or adjust here */}
              <FileAttachmentDisplay
                selectedFiles={selectedFilesArray} // Pass the derived array
                handleRemoveFile={handleRemoveFile} // Pass remove handler
                maxFiles={maxFiles}
                maxTotalSizeMB={maxTotalSizeMB}
                totalSelectedSizeMB={totalSelectedSizeMB.toFixed(2)} // Pass calculated size
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
        handleSubmit={handleSubmitWrapper} // Pass the simplified wrapper
        isLoading={isLoading}
        isSubmitDisabled={isSubmitDisabled}
        placeholder={placeholder}
        // TODO: Update FullscreenInputModal props for file handling
        selectedFiles={selectedFilesArray} // Pass derived array
        handleRemoveFile={handleRemoveFile} // Pass remove handler
        maxFiles={maxFiles}
        maxTotalSizeMB={maxTotalSizeMB}
        totalSelectedSizeMB={totalSelectedSizeMB.toFixed(2)} // Pass calculated size
        disabled={disabled} // Pass disabled prop down
      />
    </>
  );
}
