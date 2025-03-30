import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getChatModeById, type ChatMode } from '@/config/chat-modes'; // Import mode config

interface ChatModeBadgesProps {
  activeModes: Set<string>;
}

export function ChatModeBadges({ activeModes }: ChatModeBadgesProps) {
  const currentActiveModesDetails = Array.from(activeModes)
    .map(getChatModeById)
    .filter((mode): mode is ChatMode => mode !== undefined); // Type guard

  if (currentActiveModesDetails.length === 0) {
    return null; // Don't render if no modes are active
  }

  return (
    <div className="px-3 pt-2 flex flex-wrap gap-1">
      {currentActiveModesDetails.map((mode) => {
        // Determine dot color based on mode ID
        let dotColorClass = 'bg-gray-500'; // Default
        if (mode.id === 'FORCE_SEARCH') dotColorClass = 'bg-blue-500';
        else if (mode.id === 'CODE_GENERATION') dotColorClass = 'bg-green-500';
        else if (mode.id === 'CHEM_VISUALIZER') dotColorClass = 'bg-purple-500';
        else if (mode.id === 'PLOT_FUNCTION') dotColorClass = 'bg-orange-500';
        else if (mode.id === 'DOUBLE_CHECK') dotColorClass = 'bg-yellow-500';
        else if (mode.id === 'ACADEMIC_WRITING') dotColorClass = 'bg-teal-500';

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
  );
}
