import { tool } from 'ai';
import { z } from 'zod';

// Schema for a single function definition within the data array
const functionSchema = z.object({
  fn: z.string().describe('The mathematical function expression (e.g., "x^2", "sin(x)").'),
  range: z.array(z.number())
    .length(2, { message: "Range must have exactly two numbers [min, max]." })
    .refine(range => range[0] < range[1], {
      message: "Range minimum must be less than maximum (range[0] < range[1])."
    })
    .optional()
    .describe('Optional evaluation range [min, max] for this function. Must have min < max.'),
  closed: z.boolean().optional().describe('Optional. If true, closes the path to the x-axis (for area plots/integrals).'),
  color: z.string().optional().describe('Optional CSS color string for this function plot.'),
  graphType: z.enum(['interval', 'polyline', 'scatter']).default('interval').optional().describe('How to render the function (default: "interval").'),
});

// Main tool parameters schema
const displayPlotParametersSchema = z.object({
  title: z.string().optional().describe('Optional title for the plot.'),
  data: z.array(functionSchema).min(1, { message: "At least one function definition is required in the 'data' array." }).describe('An array of one or more function objects to plot.'),
  // Optional: Re-add grid/xAxis/yAxis here if desired
});

/**
 * Defines the arguments expected by the displayPlot tool's execute function.
 * Inferred from the Zod schema.
 */
export type DisplayPlotArgs = z.infer<typeof displayPlotParametersSchema>;

/**
 * Defines the structured result returned by the displayPlot tool.
 * Includes the original arguments plus a status and summary.
 */
export type DisplayPlotResult = {
  status: 'success';
  summary: string;
} & DisplayPlotArgs;

/**
 * Display Plot Tool
 *
 * Used by the AI to request the rendering of a 2D function plot in the UI.
 * Takes an array of function definitions and an optional title.
 * Returns a structured result containing the original plot details and a success status.
 */
export const displayPlotTool = tool({
  description: `Renders a 2D plot of one or more mathematical functions using the function-plot library. Provide an array of function objects in the 'data' field, each with at least a 'fn' property. Optionally include 'range', 'closed', 'color', or 'graphType' for each function, and a top-level 'title'.`,
  parameters: displayPlotParametersSchema,
  execute: async (args: DisplayPlotArgs): Promise<DisplayPlotResult> => {
    console.log('[Tool] Executing displayPlot with args:', args);
    // Correct summary for multiple functions
    const summary = `Plot ready for display${args.title ? `: "${args.title}"` : ''} with ${args.data.length} function(s).`;

    // Return structured success result, including original args
    return {
      status: 'success',
      summary: summary,
      ...args, // Include data, title
    };
    // Note: Zod handles validation. The tool itself just structures the data for the UI.
  },
});
