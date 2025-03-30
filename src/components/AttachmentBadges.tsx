import * as React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '@ai-sdk/react';

import { Badge } from '@/components/ui/badge';
import { cn, truncateFileName } from '@/lib/utils';

/**
 * Represents attachment information, typically derived from message data.
 */
type AttachmentInfo = {
  name: string;
  mimeType: string;
};

/**
 * Props for the AttachmentBadges component.
 */
interface AttachmentBadgesProps {
  message: Message;
}

/**
 * Renders badges for attachments associated with a user message.
 * Currently relies on experimental_customData, which might change in future SDK versions.
 */
export const AttachmentBadges: React.FC<AttachmentBadgesProps> = ({
  message,
}) => {
  // Read attachments from the custom 'attachments' property added in chat/page.tsx
  const attachments = (message as any).attachments as
    | AttachmentInfo[]
    | undefined;

  if (
    message.role !== 'user' ||
    !attachments ||
    !Array.isArray(attachments) ||
    attachments.length === 0
  ) {
    return null; // Only render for user messages with valid attachments array
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((att, index) => {
        const isImage = att.mimeType.startsWith('image/');
        // Define badge colors based on type
        const badgeColor = isImage
          ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300'
          : 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300';
        const Icon = isImage ? ImageIcon : FileText;

        return (
          <Badge
            key={`${message.id}-att-${index}`}
            variant="outline" // Use outline and apply custom colors via className
            className={cn(
              'items-center py-1 px-2 text-xs font-normal', // Base styles
              badgeColor, // Type-specific colors
            )}
          >
            <Icon className="mr-1.5 h-3 w-3 flex-shrink-0" />
            <span
              title={att.name}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {/* Use the imported truncateFileName helper */}
              {truncateFileName(att.name, 15)} {/* Increased length slightly */}
            </span>
          </Badge>
        );
      })}
    </div>
  );
};
