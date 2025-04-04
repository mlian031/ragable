import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ChatMode } from '@/config/chat-modes'; // Import ChatMode type
import {
  FlaskConical,
  LineChart,
  CheckCheck,
  Globe,
  Terminal,
  Quote,
} from 'lucide-react';

interface ChatModeTogglesProps {
  availableModes: ChatMode[];
  activeModes: Set<string>;
  toggleChatMode: (modeId: string) => void;
}

export function ChatModeToggles({
  availableModes,
  activeModes,
  toggleChatMode,
}: ChatModeTogglesProps) {
  return (
    <div className={cn(
      "px-3 py-2 flex flex-wrap items-center gap-2",
      "border-t border-border/30" // Always has border-t now based on original logic
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
        else if (mode.id === 'ACADEMIC_WRITING') IconComponent = Quote;

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
      {/* Add Cmd+Enter note */}
      <p className="text-xs text-muted-foreground lowercase mt-1 w-full font-mono">
        Press<span className='text-primary'>{' '}cmd/ctrl + Enter{' '}</span>to send a message and <span className='text-primary'>{' '}Enter{' '}</span> to add a new line.
      </p>
    </div>
  );
}
