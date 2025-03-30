'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn, truncateFileName } from '@/lib/utils'; // Import truncateFileName
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added
import { MemoizedMarkdown } from "@/components/memoized-markdown"; // Added
import {
  SendHorizontal,
  Mic,
  // ImagePlus, // Removed as Paperclip handles both
  Paperclip,
  Maximize2,
  FlaskConical, // Added
  LineChart,    // Added
  CheckCheck,   // Added
  Globe,        // Added
  Terminal, // Added
  X, // Added for removing files
  FileText, // Added for PDF icon
  Image, // Added for Image icon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Added for validation errors
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
// import { Toggle } from '@/components/ui/toggle'; // Removed unused import
import { Badge } from '@/components/ui/badge';
import { getAllChatModes, getChatModeById, type ChatMode } from '@/config/chat-modes'; // Import mode config
import { type Message } from '@ai-sdk/react'; // Import Message type

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
  setMessages: (messages: Message[] | ((currentMessages: Message[]) => Message[])) => void; // Added setMessages prop
}

// Constants for validation
const MAX_FILES = 10;
const MAX_TOTAL_SIZE_MB = 20;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Be more specific than image/*

// Helper to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Removed local truncateFileName, imported from utils

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit: originalHandleSubmit, // Rename original prop
  isLoading,
  placeholder = 'Ask about anything...',
  activeModes,
  toggleChatMode,
  setMessages,
}: ChatInputProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null); // Changed from HTMLInputElement
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // State for selected files

  // Focus input field on mount or when fullscreen closes
  useEffect(() => {
    if (inputRef.current && !isFullscreenOpen) {
      inputRef.current.focus();
    }
  }, [isFullscreenOpen]); // Re-run if fullscreen state changes

  // --- File Handling Logic ---

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (!newFiles.length) return;

    let currentTotalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const filesToAdd: File[] = [];
    let validationError = false;

    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `You can attach a maximum of ${MAX_FILES} files.`,
        variant: "destructive",
      });
      validationError = true;
    } else {
      for (const file of newFiles) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          toast({
            title: "Unsupported file type",
            description: `File "${file.name}" (${file.type}) is not supported. Please upload PDFs or images.`,
            variant: "destructive",
          });
          validationError = true;
          continue; // Skip this file
        }

        if (currentTotalSize + file.size > MAX_TOTAL_SIZE_BYTES) {
          toast({
            title: "Size limit exceeded",
            description: `Adding "${file.name}" would exceed the ${MAX_TOTAL_SIZE_MB}MB total size limit.`,
            variant: "destructive",
          });
          validationError = true;
          // Don't break, allow checking other files, but mark error
        } else if (selectedFiles.length + filesToAdd.length < MAX_FILES) {
          // Only add if within count limit and size limit *so far*
          filesToAdd.push(file);
          currentTotalSize += file.size;
        } else {
           // This case should technically be caught by the initial count check, but good failsafe
           console.warn("File count limit reached during iteration, skipping:", file.name);
           validationError = true;
        }
      }
    }

    if (filesToAdd.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...filesToAdd]);
    }

    // Clear the input value to allow selecting the same file again if removed
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // --- End File Handling Logic ---


  // Wrapper for handleSubmit to include files
  const handleSubmitWithFiles = useCallback(async (
    e: React.FormEvent<HTMLFormElement>,
    options?: { data?: Record<string, any> } // Keep original options structure
  ) => {
    e.preventDefault(); // Prevent default form submission

    const fileDataArray: Array<{ name: string; mimeType: string; data: string }> = [];
    const attachmentInfoArray: Array<{ name: string; mimeType: string }> = []; // For local display

    if (selectedFiles.length > 0) {
      // Show loading state or indicator if needed
      try {
        const readPromises = selectedFiles.map(readFileAsDataURL);
        const base64Strings = await Promise.all(readPromises);
        selectedFiles.forEach((file, index) => {
          fileDataArray.push({
            name: file.name, // Keep original name for backend
            mimeType: file.type,
            data: base64Strings[index],
          });
          // Also store info for local display
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
        return; // Stop submission if file reading fails
      }
    }

    // Prepare final data object for backend
    const finalData = {
      ...options?.data, // Include any existing data from options
      activeModes: Array.from(activeModes), // Always include active modes
      ...(fileDataArray.length > 0 && { files: fileDataArray }), // Conditionally add files array
      // Pass attachment info for local display back to page.tsx
      ...(attachmentInfoArray.length > 0 && { localAttachments: attachmentInfoArray }),
    };

    // Call the original handleSubmit passed as a prop (sends to backend)
    originalHandleSubmit(e, { data: finalData });

    // Clear files and input after successful submission attempt
    setSelectedFiles([]);
    // Note: Input clearing is handled by the useChat hook, no need to clear here
    if (isFullscreenOpen) {
      setIsFullscreenOpen(false); // Close fullscreen if open
    }

  }, [selectedFiles, activeModes, originalHandleSubmit, toast, isFullscreenOpen, input, setMessages]); // Keep setMessages dependency


  // Get available modes and details of active ones
  const availableModes = getAllChatModes();
  const currentActiveModesDetails = Array.from(activeModes)
    .map(getChatModeById)
    .filter((mode): mode is ChatMode => mode !== undefined); // Type guard

  // Calculate total size of selected files for display
  const totalSelectedSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSelectedSizeMB = (totalSelectedSize / (1024 * 1024)).toFixed(2);

  // Determine if submit button should be disabled
  const isSubmitDisabled = isLoading || (!input.trim() && selectedFiles.length === 0);

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection}
        multiple
        accept={ALLOWED_MIME_TYPES.join(',')}
        className="hidden"
        aria-hidden="true"
      />

      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl py-4">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Use the wrapper handleSubmit for the main form */}
          <form onSubmit={handleSubmitWithFiles} className="relative">
            <div className={cn(
              "rounded-xl border bg-background transition-all duration-300 shadow-sm flex flex-col", // Added flex flex-col
              isFocused ? "ring-2 ring-primary/20 border-primary/30" : "border-border/60",
            )}>
              {/* Top Section: Badges and Input */}
              <div className="flex flex-col">
                {/* Dynamic Indicator Pills */}
                {currentActiveModesDetails.length > 0 && (
                  <div className="px-3 pt-2 flex flex-wrap gap-1">
                    {currentActiveModesDetails.map((mode) => {
                      // Determine dot color based on mode ID
                      let dotColorClass = 'bg-gray-500'; // Default
                      if (mode.id === 'FORCE_SEARCH') dotColorClass = 'bg-blue-500';
                      else if (mode.id === 'CODE_GENERATION') dotColorClass = 'bg-green-500';
                      else if (mode.id === 'CHEM_VISUALIZER') dotColorClass = 'bg-purple-500';
                      else if (mode.id === 'PLOT_FUNCTION') dotColorClass = 'bg-orange-500';
                      else if (mode.id === 'DOUBLE_CHECK') dotColorClass = 'bg-yellow-500';

                      return (
                        <Badge
                          key={mode.id}
                          variant="outline"
                          className="py-1 px-2 text-xs font-normal bg-background flex items-center"
                        >
                          <span className={`inline-block w-2 h-2 ${dotColorClass} rounded-full mr-1.5 shrink-0`}></span>
                          {mode.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {/* Input Row */}
                <div className={cn(
                  "flex items-center px-2 md:px-3",
                  currentActiveModesDetails.length > 0 && "pt-2 mt-2 border-t border-border/30" // Add border if badges shown
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
                        onClick={() => setIsFullscreenOpen(true)}
                        aria-label="Fullscreen mode"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                        disabled={isLoading || selectedFiles.length >= MAX_FILES} // Disable if max files reached
                        onClick={triggerFileInput} // Trigger hidden input
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

              {/* Selected Files Display Area */}
              {selectedFiles.length > 0 && (
                <div className="border-t border-border/30 px-3 py-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Attachments ({selectedFiles.length}/{MAX_FILES})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Total: {totalSelectedSizeMB}MB / {MAX_TOTAL_SIZE_MB}MB
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                    {selectedFiles.map((file, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="py-1 pl-2 pr-1 text-xs font-normal items-center group"
                      >
                        {file.type.startsWith('image/') ? (
                          <Image className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-3 w-3 mr-1.5 text-muted-foreground" />
                        )}
                        {/* Apply truncation here */}
                        <span className="max-w-[100px] truncate" title={file.name}>{truncateFileName(file.name, 10)}</span> {/* Use maxLength 10 */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => handleRemoveFile(index)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool Toggle Badges */}
              <div className={cn(
                "px-3 py-2 flex flex-wrap items-center gap-2",
                // Add border-t only if files are NOT shown OR files ARE shown
                selectedFiles.length > 0 ? "border-t border-border/30" : "border-t border-border/30" // Always has border-t now
              )}>
                 <span className="text-xs text-muted-foreground mr-2">Enable Modes:</span>
                 {/* Render badges for all available modes */}
                 {availableModes.map((mode) => {
                    let IconComponent: React.ElementType = Terminal; // Default icon
                    if (mode.id === 'FORCE_SEARCH') IconComponent = Globe;
                    else if (mode.id === 'CODE_GENERATION') IconComponent = Terminal;
                    else if (mode.id === 'CHEM_VISUALIZER') IconComponent = FlaskConical;
                    else if (mode.id === 'PLOT_FUNCTION') IconComponent = LineChart;
                    else if (mode.id === 'DOUBLE_CHECK') IconComponent = CheckCheck;

                    return (
                      <Badge
                        key={mode.id}
                        variant={activeModes.has(mode.id) ? "default" : "outline"}
                        className={cn(
                          "text-xs font-normal items-center cursor-pointer transition-colors py-1",
                          !activeModes.has(mode.id) && "hover:text-primary hover:border-primary/50"
                        )}
                        onClick={() => toggleChatMode(mode.id)}
                      >
                        <IconComponent className="mr-1 h-3 w-3" />
                        {mode.commonLabel} {/* Use common label from config */}
                      </Badge>
                    );
                 })}
                 <p className="text-xs text-muted-foreground/80 mt-1.5 w-full">
                   Note: If multiple tools are enabled, the AI might not use all of them unless specifically requested to.
                 </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-6xl sm:max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Compose your message</DialogTitle>
          </DialogHeader>
          {/* Form now wraps Tabs and Footer - Use the wrapper submit handler */}
          <form onSubmit={handleSubmitWithFiles} className="flex flex-col flex-grow space-y-4 overflow-hidden">
            <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow overflow-hidden">
              <TabsList className="mb-2 self-start shrink-0">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Write Tab */}
              <TabsContent value="write" className="flex-grow flex flex-col outline-none overflow-hidden">
                 {/* Added area for file previews in fullscreen */}
                 {selectedFiles.length > 0 && (
                  <div className="border-b border-border/30 px-3 py-2 mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Attachments ({selectedFiles.length}/{MAX_FILES})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Total: {totalSelectedSizeMB}MB / {MAX_TOTAL_SIZE_MB}MB
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                      {selectedFiles.map((file, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="py-1 pl-2 pr-1 text-xs font-normal items-center group"
                        >
                          {file.type.startsWith('image/') ? (
                            <Image className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          )}
                         {/* Apply truncation here */}
                        <span className="max-w-[100px] truncate" title={file.name}>{truncateFileName(file.name, 10)}</span> {/* Use maxLength 10 */}
                        <Button
                          type="button"
                          variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => handleRemoveFile(index)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  disabled={isLoading}
                  // Adjusted styling: flex-grow for height, added border/rounded
                  className="flex-grow resize-none p-4 border rounded-md focus-visible:ring-1 focus-visible:ring-ring"
                  autoFocus // Keep autoFocus here
                  rows={10}
                />
                {/* Character Count */}
                <p className="text-xs text-muted-foreground text-right mt-1 pr-1 shrink-0">
                  {input.length} / 4000 {/* Example limit */}
                </p>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="flex-grow outline-none overflow-auto">
                 {/* Added styling wrapper: prose for markdown styles, border, padding, overflow */}
                 <div className="prose dark:prose-invert p-4 border rounded-md min-h-[200px]">
                   <MemoizedMarkdown content={input || "Nothing to preview..."} id="fullscreen-preview" />
                 </div>
              </TabsContent>
            </Tabs>

            {/* Footer moved outside Tabs but inside Form */}
            <DialogFooter className="shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFullscreenOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitDisabled} // Use calculated disabled state
                className="gap-2"
              >
                <SendHorizontal className="h-4 w-4" />
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
