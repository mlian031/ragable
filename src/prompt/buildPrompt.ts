import { getChatModeById } from '@/config/chat-modes';
import { defaultPromptComponents } from '@/prompt/components/defaultComponents';
import { PromptBuilder } from '@/prompt/framework/PromptFramework';

/**
 * Constructs the final system prompt string based on active chat modes and modular components.
 *
 * @param {string[]} activeModeIds - An array of IDs for the currently active chat modes.
 * @returns {string} The combined system prompt string.
 */
export function buildSystemPrompt(activeModeIds: string[]): string {
  const modeComponents = (activeModeIds ?? [])
    .map((id) => getChatModeById(id))
    .filter((mode): mode is NonNullable<typeof mode> => !!mode)
    .flatMap((mode) => mode.promptComponents ?? []);

  const allComponents = [
    ...modeComponents,
    ...defaultPromptComponents,
  ];

  const builder = new PromptBuilder(allComponents);
  return builder.build();
}
