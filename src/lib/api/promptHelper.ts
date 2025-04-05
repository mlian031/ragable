import { getChatModeById } from '@/config/chat-modes';
import {
  BASE_ROLE_PROMPT,
  BEHAVIORAL_GUIDELINES,
  TOOL_USAGE_POLICIES,
  FORMATTING_RULES,
  NEGATIVE_CONSTRAINTS,
  FEW_SHOT_EXAMPLES,
} from '@/prompts/prompt-templates';

/**
 * Constructs the final system prompt string based on active chat modes and layered modular instructions.
 *
 * @param {string[]} activeModeIds - An array of IDs for the currently active chat modes.
 * @returns {string} The combined system prompt string.
 */
export function buildSystemPrompt(activeModeIds: string[]): string {
  const modeSystemPrompts = (activeModeIds ?? [])
    .map((id) => getChatModeById(id))
    .filter((mode): mode is NonNullable<typeof mode> => !!mode?.systemPrompt)
    .map((mode) => mode.systemPrompt!);

  const finalPromptParts = [
    ...modeSystemPrompts,
    BASE_ROLE_PROMPT,
    BEHAVIORAL_GUIDELINES,
    TOOL_USAGE_POLICIES,
    FORMATTING_RULES,
    NEGATIVE_CONSTRAINTS,
    FEW_SHOT_EXAMPLES,
  ];

  return finalPromptParts.join('\n\n');
}
