import {
  BASE_ROLE_PROMPT,
  BEHAVIORAL_GUIDELINES,
  TOOL_USAGE_POLICIES,
  FORMATTING_RULES,
  NEGATIVE_CONSTRAINTS,
  FEW_SHOT_EXAMPLES,
  MARKDOWN_EXAMPLES,
} from '@/prompts/prompt-templates';
import { StaticPromptComponent, PromptComponent } from '@/prompt/framework/PromptFramework';
import { toolFunctionDescriptionsComponent } from './toolFunctionDescriptions';

export const defaultPromptComponents: PromptComponent[] = [
  toolFunctionDescriptionsComponent,
  new StaticPromptComponent('role', BASE_ROLE_PROMPT, 'role', 10),
  new StaticPromptComponent('behavioral', BEHAVIORAL_GUIDELINES, 'behavioral_guidelines', 20),
  new StaticPromptComponent('tool_usage', TOOL_USAGE_POLICIES, 'tool_calling', 30),
  new StaticPromptComponent('formatting', FORMATTING_RULES, 'formatting', 40),
  new StaticPromptComponent('prohibited', NEGATIVE_CONSTRAINTS, 'prohibited', 50),
  new StaticPromptComponent('examples', FEW_SHOT_EXAMPLES, 'examples', 60),
  new StaticPromptComponent('markdown_examples', MARKDOWN_EXAMPLES, 'markdown_examples', 70),
];
