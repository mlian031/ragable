import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { FileAttachmentDisplay } from '@/components/FileAttachmentDisplay'; // Import the new component
import { SendHorizontal } from 'lucide-react';

interface FullscreenInputModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void; // Simplified handleSubmit for the modal form
  isLoading: boolean;
  isSubmitDisabled: boolean;
  placeholder?: string;
  // File related props
  selectedFiles: File[];
  handleRemoveFile: (index: number) => void;
  maxFiles: number;
  maxTotalSizeMB: number;
  totalSelectedSizeMB: string;
  disabled?: boolean; // Add disabled prop
}

export function FullscreenInputModal({
  isOpen,
  onOpenChange,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isSubmitDisabled,
  placeholder,
  selectedFiles,
  handleRemoveFile,
  maxFiles,
  maxTotalSizeMB,
  totalSelectedSizeMB,
  disabled = false, // Destructure disabled prop
}: FullscreenInputModalProps) {
  const [activeTab, setActiveTab] = useState('write');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compose your message</DialogTitle>
        </DialogHeader>
        {/* Form now wraps Tabs and Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-4 overflow-hidden">
          <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow overflow-hidden">
            <TabsList className="mb-2 self-start shrink-0">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Write Tab */}
            <TabsContent value="write" className="flex-grow flex flex-col outline-none overflow-hidden space-y-2">
              {/* File Attachments Display */}
              <FileAttachmentDisplay
                selectedFiles={selectedFiles}
                handleRemoveFile={handleRemoveFile}
                maxFiles={maxFiles}
                maxTotalSizeMB={maxTotalSizeMB}
                totalSelectedSizeMB={totalSelectedSizeMB}
              />
              {/* Textarea */}
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isLoading || disabled} // Apply disabled prop
                // Adjusted styling: flex-grow for height, added border/rounded
                className="flex-grow resize-none p-4 border rounded-md focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus // Keep autoFocus here
                rows={10}
              />
              {/* Character Count */}
              <p className="text-xs text-muted-foreground text-right pr-1 shrink-0">
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
              onClick={() => onOpenChange(false)} // Close the dialog on cancel
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
  );
}
