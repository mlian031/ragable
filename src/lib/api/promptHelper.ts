import { getChatModeById } from '@/config/chat-modes'; // Mode config helper
import { BASE_SYSTEM_PROMPT } from '@/prompts/base-system-prompt'; // Import the new base prompt

/**
 * Constructs the final system prompt string based on active chat modes and adds standard instructions.
 *
 * @param {string[]} activeModeIds - An array of IDs for the currently active chat modes.
 * @returns {string} The combined system prompt string.
 */
export function buildSystemPrompt(activeModeIds: string[]): string {
  // Get system prompts from active modes
  const modeSystemPrompts = (activeModeIds ?? [])
    .map((id) => getChatModeById(id)) // Get mode config by ID
    .filter((mode): mode is NonNullable<typeof mode> => !!mode?.systemPrompt) // Filter modes that have a system prompt
    .map((mode) => mode.systemPrompt!); // Extract the prompt string

  // Combine mode prompts (if any) with the base system prompt
  // Mode-specific prompts are placed first to give them priority
  const finalPromptParts = [...modeSystemPrompts, BASE_SYSTEM_PROMPT];

  const finalSystemPrompt = finalPromptParts.join('\n\n');

  // Optional: Log for debugging
  // console.log(
  //   `Generated system prompt including ${modeSystemPrompts.length} active mode(s). Final prompt:\n${finalSystemPrompt}`,
  // );

  return finalSystemPrompt;
}
