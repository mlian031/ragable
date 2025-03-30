import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Image, X } from 'lucide-react';
import { truncateFileName } from '@/lib/utils'; // Assuming truncateFileName is in utils

interface FileAttachmentDisplayProps {
  selectedFiles: File[];
  handleRemoveFile: (index: number) => void;
  maxFiles: number;
  maxTotalSizeMB: number;
  totalSelectedSizeMB: string; // Expecting formatted string
}

export function FileAttachmentDisplay({
  selectedFiles,
  handleRemoveFile,
  maxFiles,
  maxTotalSizeMB,
  totalSelectedSizeMB,
}: FileAttachmentDisplayProps) {
  if (selectedFiles.length === 0) {
    return null; // Don't render anything if no files are selected
  }

  return (
    <div className="border-t border-border/30 px-3 py-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          Attachments ({selectedFiles.length}/{maxFiles})
        </span>
        <span className="text-xs text-muted-foreground">
          Total: {totalSelectedSizeMB}MB / {maxTotalSizeMB}MB
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
              <Image className="h-3 w-3 mr-1.5 text-muted-foreground shrink-0" />
            ) : (
              <FileText className="h-3 w-3 mr-1.5 text-muted-foreground shrink-0" />
            )}
            {/* Apply truncation here */}
            <span className="max-w-[100px] truncate" title={file.name}>
              {truncateFileName(file.name, 10)} {/* Use maxLength 10 */}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0"
              onClick={() => handleRemoveFile(index)}
              aria-label={`Remove ${file.name}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
