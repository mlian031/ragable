import * as React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '@ai-sdk/react';

import { Badge } from '@/components/ui/badge';
import { cn, truncateFileName } from '@/lib/utils';

// Removed AttachmentInfo type definition

/**
 * Props for the AttachmentBadges component.
 */
interface AttachmentBadgesProps {
  message: Message;
}

/**
 * Renders badges for attachments associated with a user message.
 * Reads attachment information from the standard `message.experimental_attachments` property.
 */
export const AttachmentBadges: React.FC<AttachmentBadgesProps> = ({
  message,
}) => {
  // Read attachments from the standard experimental_attachments property
  const attachments = message.experimental_attachments;

  if (
    message.role !== 'user' || // Only show badges on user messages for files they sent
    !attachments ||
    !Array.isArray(attachments) ||
    attachments.length === 0
  ) {
    return null; // Only render for user messages with valid attachments array
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {/* Map over the standard attachments array */}
      {attachments.map((att, index) => {
        // Determine if it's an image or other file based on contentType
        const isImage = att.contentType?.startsWith('image/');
        const isPdf = att.contentType === 'application/pdf';
        // Define badge colors based on type
        const badgeColor = isImage
          ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300'
          : isPdf
            ? 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/50 dark:border-orange-700 dark:text-orange-300' // PDF color
            : 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300'; // Default file color
        const Icon = isImage ? ImageIcon : FileText; // Keep using FileText for non-images for now

        // Use attachment name if available, otherwise provide a fallback
        const displayName = att.name || `attachment-${index + 1}`;

        return (
          <Badge
            key={`${message.id}-exp-att-${index}`} // Update key prefix
            variant="outline" // Use outline and apply custom colors via className
            className={cn(
              'items-center py-1 px-2 text-xs font-normal', // Base styles
              badgeColor, // Type-specific colors
            )}
          >
            <Icon className="mr-1.5 h-3 w-3 flex-shrink-0" />
            <span
              title={displayName} // Use displayName for title
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {/* Use the imported truncateFileName helper */}
              {truncateFileName(displayName, 15)} {/* Increased length slightly */}
            </span>
          </Badge>
        );
      })}
    </div>
  );
};
