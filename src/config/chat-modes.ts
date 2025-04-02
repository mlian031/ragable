import { Globe, LucideIcon, Code2, FlaskConical, LineChart, CheckCheck, Quote } from 'lucide-react'; // Added Quote icon
import { ACADEMIC_WRITING_PROMPT } from '@/prompts/academic-writing-prompt'; // Import the new prompt

export interface ChatMode {
  id: string; // Unique identifier
  label: string; // Text for the indicator badge
  commonLabel: string; // Common label for the toggle button
  icon: LucideIcon; // Icon for the toggle button
  systemPrompt?: string; // Optional system prompt to prepend
  // Add other potential behavior flags here later if needed
}

// Define the available chat modes
export const CHAT_MODES: Record<string, ChatMode> = {
  FORCE_SEARCH: {
    id: 'FORCE_SEARCH',
    label: 'Web Search Enabled',
    commonLabel: 'Web Search',
    icon: Globe,
    systemPrompt: `You MUST use the search tool to answer this query. Do not rely on your existing knowledge. Provide comprehensive results based *only* on the search information provided.`,
  },
  CODE_GENERATION: {
    id: 'CODE_GENERATION',
    label: 'Code Generation Enabled',
    commonLabel: 'Code Generation',
    icon: Code2,
    systemPrompt: `The user REQUIRES you to use the displayCode tool for a technical example of what they were talking about. Prioritize generating clear, functional code snippets using the displayCode tool.`,
  },
  CHEM_VISUALIZER: {
    id: 'CHEM_VISUALIZER',
    label: 'Chemistry Visualizer Enabled',
    commonLabel: 'Chemistry Visualizer',
    icon: FlaskConical,
    systemPrompt: `When discussing specific chemical compounds or structures, first determine the corresponding SMILES string if it's not already provided. Then, you MUST use the displayMolecule tool with the SMILES string to provide a visual representation.`,
  },
  PLOT_FUNCTION: {
    id: 'PLOT_FUNCTION',
    label: 'Plotting Enabled',
    commonLabel: 'Plotting',
    icon: LineChart,
    systemPrompt: `Politely inform the user that this tool is not available in this environment. However, you can provide the python code to generate the plot using the displayCode tool. Make sure to include all necessary libraries and functions for the user to run it successfully.`,
    // No system prompt needed for now
  },
  DOUBLE_CHECK: {
    id: 'DOUBLE_CHECK',
    label: 'Double Check Enabled',
    commonLabel: 'Double Check',
    icon: CheckCheck,
    systemPrompt: `Politely inform the user this tool is not available in this environment.`
    // No system prompt needed for now
  },
  ACADEMIC_WRITING: { // Added new mode
    id: 'ACADEMIC_WRITING',
    label: 'Academic Writing Assistant Enabled',
    commonLabel: 'Academic Writing',
    icon: Quote,
    systemPrompt: ACADEMIC_WRITING_PROMPT,
  },
  // Example for future:
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
