import { StaticPromptComponent, PromptComponent } from '@/prompt/framework/PromptFramework';

const TOOL_FUNCTIONS_PROMPT = `
<functions>
<function>{"name": "web_search", "description": "Search the web for recent or unknown information to ground your answers."}</function>
<function>{"name": "displayCode", "description": "Render code snippets in a formatted, syntax-highlighted block."}</function>
<function>{"name": "displayMolecule", "description": "Visualize a chemical molecule from a SMILES string."}</function>
<function>{"name": "displayPlot", "description": "Generate and display a 2D plot of one or more mathematical functions."}</function>
</functions>
`;

export const toolFunctionDescriptionsComponent: PromptComponent = new StaticPromptComponent(
  'tool_functions',
  TOOL_FUNCTIONS_PROMPT,
  'functions',
  2
);
