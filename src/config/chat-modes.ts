import { Globe, LucideIcon } from 'lucide-react';

export interface ChatMode {
  id: string; // Unique identifier
  label: string; // Text for the indicator badge
  icon: LucideIcon; // Icon for the toggle button
  systemPrompt?: string; // Optional system prompt to prepend
  // Add other potential behavior flags here later if needed
}

// Define the available chat modes
export const CHAT_MODES: Record<string, ChatMode> = {
  FORCE_SEARCH: {
    id: 'FORCE_SEARCH',
    label: 'Web Search Enabled',
    icon: Globe,
    systemPrompt: `You MUST use the search tool to answer this query. Do not rely on your existing knowledge. Provide comprehensive results based *only* on the search information provided.`,
  },
  // Add other modes here in the future, e.g.:
  // CALCULATOR_MODE: {
  //   id: 'CALCULATOR_MODE',
  //   label: 'Calculator Mode Active',
  //   icon: Calculator, // Assuming Calculator icon exists
  //   // Might not need a system prompt, could use a different flag
  // },
};

// Helper to get a mode by ID
export const getChatModeById = (id: string): ChatMode | undefined => {
  return CHAT_MODES[id];
};

// Helper to get all defined modes as an array
export const getAllChatModes = (): ChatMode[] => {
  return Object.values(CHAT_MODES);
};
