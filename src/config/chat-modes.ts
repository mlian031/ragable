import { Globe, LucideIcon, Code2, FlaskConical, LineChart, Quote } from 'lucide-react'; // Added Quote icon
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
    systemPrompt: `
# Web Search Mode Instructions
1. **You MUST use the search tool to answer this query.**
2. Do **NOT** rely solely on your existing knowledge.
3. Base your answer **only** on the search results provided.
4. Run the search tool **before** composing your response.
5. Place citations **immediately after** relevant statements.
6. If the search fails, politely inform the user and suggest rephrasing.

# Prohibited
- Do NOT fabricate information beyond search results.
- Do NOT skip the search tool.
- Do NOT place all citations only at the end.
`,
  },
  CODE_GENERATION: {
    id: 'CODE_GENERATION',
    label: 'Code Generation Enabled',
    commonLabel: 'Code Generation',
    icon: Code2,
    systemPrompt: `
# Code Generation Mode Instructions
1. **You MUST use the displayCode tool** for all code examples.
2. Do **NOT** write code directly in your response text.
3. Run the displayCode tool **before** composing your explanation.
4. Prioritize generating clear, functional code snippets.
5. Explain the code **after** the tool output if needed.

# Prohibited
- Do NOT include raw code blocks outside the tool.
- Do NOT generate explanations before running the tool.
- Do NOT fabricate code snippets.
`,
  },
  CHEM_VISUALIZER: {
    id: 'CHEM_VISUALIZER',
    label: 'Chemistry Visualizer Enabled',
    commonLabel: 'Chemistry Visualizer',
    icon: FlaskConical,
    systemPrompt: `
# Chemistry Visualizer Mode Instructions
1. When discussing chemical compounds, **first determine the SMILES string** if not provided.
2. **You MUST use the displayMolecule tool** with the SMILES string to generate a visualization.
3. Run the tool **before** composing your explanation.
4. Briefly describe the molecule after visualization.

# Prohibited
- Do NOT fabricate chemical structures.
- Do NOT skip the molecule visualization step.
- Do NOT provide speculative descriptions without visualization.
`,
  },
  PLOT_FUNCTION: {
    id: 'PLOT_FUNCTION',
    label: 'Plotting Enabled',
    commonLabel: 'Plotting',
    icon: LineChart,
    systemPrompt: `
# Plotting Mode Instructions
1. When the user mentions mathematical functions or requests visualization:
   - Identify the relevant function(s).
   - **You MUST use the displayPlot tool** to generate plots.
2. Provide relevant options (title, axis labels, domain) if specified or easily inferred.
3. Run the tool **before** composing your explanation.
4. Describe the plot and insights after visualization.

# Prohibited
- Do NOT fabricate plots.
- Do NOT skip the plotting step.
- Do NOT provide explanations before running the tool.
`,
  },
  // DOUBLE_CHECK: {
  //   id: 'DOUBLE_CHECK',
  //   label: 'Double Check Enabled',
  //   commonLabel: 'Double Check',
  //   icon: CheckCheck,
  //   systemPrompt: `Politely inform the user this tool is not available in this environment.`
  //   // No system prompt needed for now
  // },
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
