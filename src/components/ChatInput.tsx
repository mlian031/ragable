'use client';

import React, { useState, useEffect, useRef } from 'react'; // Ensure useState is imported
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added
import { MemoizedMarkdown } from "@/components/memoized-markdown"; // Added
import {
  SendHorizontal,
  Mic,
  ImagePlus,
  Paperclip,
  Maximize2,
  FlaskConical, // Added
  LineChart,    // Added
  CheckCheck,   // Added
  Globe,        // Added
  Code2,        // Added
  TerminalSquare,
  Terminal, // Added
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
  const [activeTab, setActiveTab] = useState('write'); // Added state for tabs

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
  // Filter modes for the icon toggles (only keep search and code gen)
  const iconToggleModes = availableModes.filter(mode =>
    mode.id === 'FORCE_SEARCH' || mode.id === 'CODE_GENERATION'
  );
  const currentActiveModesDetails = Array.from(activeModes)
    .map(getChatModeById)
    .filter((mode): mode is ChatMode => mode !== undefined); // Type guard

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl py-4">
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
                   {currentActiveModesDetails.map((mode) => {
                     // Determine dot color based on mode ID
                     let dotColorClass = 'bg-gray-500'; // Default
                     if (mode.id === 'FORCE_SEARCH') dotColorClass = 'bg-blue-500';
                     else if (mode.id === 'CODE_GENERATION') dotColorClass = 'bg-green-500';
                      // Use uppercase IDs for color assignment
                      else if (mode.id === 'CHEM_VISUALIZER') dotColorClass = 'bg-purple-500';
                      else if (mode.id === 'PLOT_FUNCTION') dotColorClass = 'bg-orange-500';
                      else if (mode.id === 'DOUBLE_CHECK') dotColorClass = 'bg-yellow-500';

                      return (
                        <Badge
                         key={mode.id}
                         variant="outline"
                         // Removed explicit text/border color, rely on default outline variant
                         className="py-1 px-2 text-xs font-normal bg-background flex items-center"
                       >
                         <span className={`inline-block w-2 h-2 ${dotColorClass} rounded-full mr-1.5 shrink-0`}></span>
                         {mode.label}
                       </Badge>
                     );
                   })}
                </div>
              )}
              {/* Added conditional top padding/border if badges are shown */}
              {/* REMOVED Icon Toggle Section */}
              <div className={cn("flex items-center px-2 md:px-3", currentActiveModesDetails.length > 0 && "pt-2 mt-2 border-t border-border/30")}>
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

              {/* Tool Toggle Badges - Now includes ALL modes */}
              <div className="border-t border-border/30 px-3 py-2 flex flex-wrap items-center gap-2">
                 <span className="text-xs text-muted-foreground mr-2">Enable Modes:</span>
                 {/* Web Search */}
                 <Badge
                   variant={activeModes.has('FORCE_SEARCH') ? "default" : "outline"}
                   className={cn(
                     "text-xs font-normal items-center cursor-pointer transition-colors",
                     !activeModes.has('FORCE_SEARCH') && "hover:text-primary hover:border-primary/50"
                   )}
                   onClick={() => toggleChatMode('FORCE_SEARCH')}
                 >
                   <Globe className="mr-1 h-3 w-3" />
                   Web Search
                 </Badge>
                 {/* Code Generation */}
                 <Badge
                   variant={activeModes.has('CODE_GENERATION') ? "default" : "outline"}
                   className={cn(
                     "text-xs font-normal items-center cursor-pointer transition-colors",
                     !activeModes.has('CODE_GENERATION') && "hover:text-primary hover:border-primary/50"
                   )}
                   onClick={() => toggleChatMode('CODE_GENERATION')}
                 >
                   <Terminal className="mr-1 h-3 w-3" />
                   Code Generation
                 </Badge>
                 {/* Chemistry Visualizer */}
                 <Badge
                   variant={activeModes.has('CHEM_VISUALIZER') ? "default" : "outline"}
                    className={cn(
                      "text-xs font-normal items-center cursor-pointer transition-colors",
                      !activeModes.has('CHEM_VISUALIZER') && "hover:text-primary hover:border-primary/50"
                    )}
                    onClick={() => toggleChatMode('CHEM_VISUALIZER')}
                  >
                    <FlaskConical className="mr-1 h-3 w-3" />
                    Chemistry
                 </Badge>
                  {/* Plot Function - Use uppercase ID */}
                  <Badge
                    variant={activeModes.has('PLOT_FUNCTION') ? "default" : "outline"}
                    className={cn(
                      "text-xs font-normal items-center cursor-pointer transition-colors",
                      !activeModes.has('PLOT_FUNCTION') && "hover:text-primary hover:border-primary/50"
                    )}
                    onClick={() => toggleChatMode('PLOT_FUNCTION')}
                  >
                    <LineChart className="mr-1 h-3 w-3" />
                    Plot
                 </Badge>
                  {/* Double Check - Use uppercase ID */}
                  <Badge
                    variant={activeModes.has('DOUBLE_CHECK') ? "default" : "outline"}
                    className={cn(
                      "text-xs font-normal items-center cursor-pointer transition-colors",
                      !activeModes.has('DOUBLE_CHECK') && "hover:text-primary hover:border-primary/50"
                    )}
                    onClick={() => toggleChatMode('DOUBLE_CHECK')}
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Double Check
                 </Badge>
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
        {/* Increased max-width and added height/flex for better fullscreen feel */}
        <DialogContent className="max-w-6xl sm:max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Compose your message</DialogTitle>
          </DialogHeader>
          {/* Form now wraps Tabs and Footer */}
          <form onSubmit={handleFullscreenSubmit} className="flex flex-col flex-grow space-y-4 overflow-hidden">
            <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow overflow-hidden">
              <TabsList className="mb-2 self-start shrink-0">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Write Tab */}
              <TabsContent value="write" className="flex-grow flex flex-col outline-none overflow-hidden">
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
