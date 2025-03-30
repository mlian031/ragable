import { tool } from 'ai';
import { z } from 'zod';

/**
 * Defines the arguments expected by the displayCode tool's execute function.
 */
export type DisplayCodeArgs = {
  language: string;
  code: string;
  filename?: string;
};

/**
 * Defines the structured result returned by the displayCode tool.
 * In this case, success is assumed if execution completes, and the result
 * mirrors the input arguments plus a status and summary.
 */
export type DisplayCodeResult = {
  status: 'success';
  summary: string;
} & DisplayCodeArgs; // Includes language, code, filename

/**
 * Display Code Tool
 *
 * Used by the AI to request the display of a code snippet in the UI.
 * Returns a structured result containing the original code details and a success status.
 */
export const displayCodeTool = tool({
  description: `Displays a code snippet. Use this tool whenever you generate code as part of your response. Provide the programming language, the code itself, and optionally a filename.`,
  parameters: z.object({
    language: z
      .string()
      .describe(
        'The programming language of the code (e.g., "typescript", "python", "html").',
      ),
    filename: z
      .string()
      .optional()
      .describe('An optional filename or label for the code block.'),
    code: z.string().describe('The code snippet to display.'),
  }),
  execute: async (args: DisplayCodeArgs): Promise<DisplayCodeResult> => {
    console.log('[Tool] Executing displayCode with args:', args);
    // Return structured success result, including original args
    return {
      status: 'success',
      summary: `Code block ready for display (${args.language}${
        args.filename ? `: ${args.filename}` : ''
      }).`,
      ...args, // Include language, code, filename
    };
    // Note: No specific error handling added here, assuming Zod validation
    // catches parameter issues before execution. The tool itself just passes data.
  },
});
