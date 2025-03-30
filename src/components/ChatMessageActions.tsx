import * as React from 'react';
import { Message } from '@ai-sdk/react';
import { Copy, Edit, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Props for the ChatMessageActions component.
 */
interface ChatMessageActionsProps {
  message: Message;
  messageIndex: number;
  isLoading: boolean;
  onEdit: (index: number) => void;
  onCopy: (message: Message) => void;
  onRegenerate: (index: number) => void;
}

/**
 * Renders the action buttons (Edit, Copy, Regenerate) for a chat message.
 * These buttons typically appear on hover.
 */
export const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({
  message,
  messageIndex,
  isLoading,
  onEdit,
  onCopy,
  onRegenerate,
}) => {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      {message.role === 'user' ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onEdit(messageIndex)}
            title="Edit message"
            disabled={isLoading}
          >
            <Edit className="h-3 w-3" />
            <span className="sr-only">Edit message</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onCopy(message)}
            title="Copy message"
          >
            <Copy className="h-3 w-3" />
            <span className="sr-only">Copy message</span>
          </Button>
        </>
      ) : (
        // Assistant message actions
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onCopy(message)}
            title="Copy message"
          >
            <Copy className="h-3 w-3" />
            <span className="sr-only">Copy message</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRegenerate(messageIndex)}
            title="Regenerate response"
            disabled={isLoading}
          >
            <RotateCw className="h-3 w-3" />
            <span className="sr-only">Regenerate response</span>
          </Button>
        </>
      )}
    </div>
  );
};
