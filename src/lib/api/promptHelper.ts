import { CoreMessage } from 'ai';
import { getChatModeById } from '@/config/chat-modes'; // Mode config helper

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

  // Standard instructions
  const standardInstructions = [
    "Avoid writing code directly in your response text. Instead, always use the displayCode tool.",
    "When you receive tool results with 'status: success', briefly acknowledge the tool's completion based on its 'summary', then use the provided data (context, sources, code, etc.) to formulate your final response to the user's original query. Do not call the same tool again if you have already received a success status for it in this turn.",
    "If a tool result has 'status: error', inform the user about the error based on the 'summary'.",
  ];

  // Combine mode prompts and standard instructions
  const finalPromptParts = [...modeSystemPrompts, ...standardInstructions];

  const finalSystemPrompt = finalPromptParts.join('\n\n');

  if (modeSystemPrompts.length > 0) {
    console.log(
      `Generated system prompt including ${modeSystemPrompts.length} active mode(s).`,
    );
  } else {
    console.log('Generated system prompt with standard instructions only.');
  }
  // console.log("Final system prompt:", finalSystemPrompt); // Optional: Log for debugging

  return finalSystemPrompt;
}
