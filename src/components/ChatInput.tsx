'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  SendHorizontal,
  Mic,
  ImagePlus,
  Sparkles,
  Paperclip,
  Maximize2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { getAllChatModes, getChatModeById, type ChatMode } from '@/config/chat-modes'; // Import mode config

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    // Pass generic data object, expecting activeModes array
    options?: { data?: { activeModes?: string[] } }
  ) => void;
  isLoading: boolean;
  placeholder?: string;
  // New props for dynamic modes
  activeModes: Set<string>;
  toggleChatMode: (modeId: string) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  placeholder = 'Ask about anything...',
  activeModes, // Destructure new prop
  toggleChatMode, // Destructure new prop
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Focus input field on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleFullscreenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsFullscreenOpen(false);
    // Pass activeModes array in fullscreen submit
    handleSubmit(e, { data: { activeModes: Array.from(activeModes) } });
  };

  // Get available modes and details of active ones
  const availableModes = getAllChatModes();
  const currentActiveModesDetails = Array.from(activeModes)
    .map(getChatModeById)
    .filter((mode): mode is ChatMode => mode !== undefined); // Type guard

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/40 py-4">
        <div className="container max-w-4xl mx-auto px-4">
          <form
            // Pass activeModes array in main submit
            onSubmit={(e) => handleSubmit(e, { data: { activeModes: Array.from(activeModes) } })}
            className="relative"
          >
            <div className={cn(
              "rounded-xl border bg-background transition-all duration-300 shadow-sm",
              isFocused ? "ring-2 ring-primary/20 border-primary/30" : "border-border/60"
            )}>
              {/* Dynamic Indicator Pills */}
              {currentActiveModesDetails.length > 0 && (
                <div className="px-3 pt-2 flex flex-wrap gap-1"> {/* Use flex-wrap for multiple badges */}
                  {currentActiveModesDetails.map((mode) => (
                    <Badge
                      key={mode.id}
                      variant="outline"
                      className="py-1 px-2 text-xs font-normal bg-background border-primary/50 text-primary flex items-center"
                    >
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 shrink-0"></span>
                      {mode.label}
                    </Badge>
                  ))}
                </div>
              )}
              {/* Added conditional top padding/border if badges are shown */}
              <div className={cn("flex items-center px-2 md:px-3", currentActiveModesDetails.length > 0 && "pt-2 mt-2 border-t border-border/30")}>
                {/* Dynamic Mode Toggles */}
                {availableModes.map((mode) => {
                  const Icon = mode.icon; // Get the icon component
                  return (
                    <Toggle
                      key={mode.id}
                      size="sm"
                      pressed={activeModes.has(mode.id)}
                      onPressedChange={() => toggleChatMode(mode.id)}
                      disabled={isLoading}
                      aria-label={`Toggle ${mode.label}`}
                      className="h-9 w-9 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent hover:text-accent-foreground data-[state=on]:hover:bg-primary/90 shrink-0"
                    >
                      <Icon className="h-4 w-4" />
                    </Toggle>
                  );
                })}

                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-5 h-12 rounded-none text-sm bg-transparent"
                    value={input}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  
                  {isLoading && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
                      {/* Apply gradient background to the dots */}
                      <div className="flex space-x-1 items-center">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 via-blue-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0"
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
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                    disabled={isLoading}
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                    disabled={isLoading}
                    aria-label="Add image"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                    disabled={isLoading}
                    aria-label="Voice input"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    type="submit" 
                    size="icon"
                    variant="default"
                    disabled={isLoading || !input.trim()}
                    className={cn(
                      "h-9 w-9 rounded-full shrink-0 transition-all duration-200 ml-1",
                      !input.trim() && "opacity-70"
                    )}
                    aria-label="Send message"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-border/30 px-3 py-1.5 flex items-center">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-xs text-muted-foreground">
                    AI can make mistakes. Consider checking important information.
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose your message</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFullscreenSubmit} className="space-y-4">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[200px] p-4 resize-none"
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button" 
                variant="outline"
                onClick={() => setIsFullscreenOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || !input.trim()}
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
