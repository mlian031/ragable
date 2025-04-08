import { Globe, LucideIcon, Code2, FlaskConical, LineChart, Quote } from 'lucide-react';
import { ACADEMIC_WRITING_PROMPT } from '@/prompts/academic-writing-prompt';
import { StaticPromptComponent, PromptComponent } from '@/prompt/framework/PromptFramework';

export interface ChatMode {
  id: string;
  label: string;
  commonLabel: string;
  icon: LucideIcon;
  promptComponents?: PromptComponent[]; // Optional prompt components for this mode
  // Add other potential behavior flags here later if needed
}

export const CHAT_MODES: Record<string, ChatMode> = {
  FORCE_SEARCH: {
    id: 'FORCE_SEARCH',
    label: 'Web Search Enabled',
    commonLabel: 'Web Search',
    icon: Globe,
    promptComponents: [
      new StaticPromptComponent(
        'force_search',
        `
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
        'tool_calling',
        5
      ),
    ],
  },
  CODE_GENERATION: {
    id: 'CODE_GENERATION',
    label: 'Code Generation Enabled',
    commonLabel: 'Code Generation',
    icon: Code2,
    promptComponents: [
      new StaticPromptComponent(
        'code_generation',
        `
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
        'tool_calling',
        5
      ),
    ],
  },
  CHEM_VISUALIZER: {
    id: 'CHEM_VISUALIZER',
    label: 'Chemistry Visualizer Enabled',
    commonLabel: 'Chemistry Visualizer',
    icon: FlaskConical,
    promptComponents: [
      new StaticPromptComponent(
        'chem_visualizer',
        `
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
        'tool_calling',
        5
      ),
    ],
  },
  PLOT_FUNCTION: {
    id: 'PLOT_FUNCTION',
    label: 'Plotting Enabled',
    commonLabel: 'Plotting',
    icon: LineChart,
    promptComponents: [
      new StaticPromptComponent(
        'plot_function',
        `
# Plotting Mode Instructions
1. **You MUST use the displayPlot tool** for all plots.
2. Do **NOT** write plots directly in your response text.
3. Run the displayPlot tool **before** composing your explanation.
4. Prioritize generating clear, functional plots.
5. Explain the plot **after** the tool output if needed.
# Prohibited
- Do NOT include raw plot blocks outside the tool.
- Do NOT generate explanations before running the tool.
- Do NOT fabricate plots.
`,
        'tool_calling',
        5
      ),
    ],
  },
  ACADEMIC_WRITING: {
    id: 'ACADEMIC_WRITING',
    label: 'Academic Writing Assistant Enabled',
    commonLabel: 'Academic Writing',
    icon: Quote,
    promptComponents: [
      new StaticPromptComponent(
        'academic_writing',
        ACADEMIC_WRITING_PROMPT,
        'behavioral_guidelines',
        5
      ),
    ],
  },
};

export const getChatModeById = (id: string): ChatMode | undefined => {
  return CHAT_MODES[id];
};

export const getAllChatModes = (): ChatMode[] => {
  return Object.values(CHAT_MODES);
};
