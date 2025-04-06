"use client";

import React from "react";
import { TriangleAlert, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ContextUsageInfoProps {
  percent: number;
}

export const ContextUsageInfo: React.FC<ContextUsageInfoProps> = ({ percent }) => {
  return (
    <div className="mb-2 space-y-2">
      <TooltipProvider delayDuration={100}>
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              Context is the amount of conversation history the AI can consider for its responses. If it gets too high, responses may become less accurate.
            </TooltipContent>
          </Tooltip>
          Chat Context Usage: {percent.toFixed(1)}%
        </div>
      </TooltipProvider>

      {percent > 80 && (
        <Alert variant="default" className="mb-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Chat Context Limit Approaching</AlertTitle>
          <AlertDescription>
            <span>
            Your conversation is getting quite long. To ensure the best AI responses, consider starting a{" "}
            <button
              onClick={() => { window.location.href = '/chat'; }}
              className="font-semibold underline text-primary hover:opacity-80 transition"
            >
              new chat
            </button>.
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
