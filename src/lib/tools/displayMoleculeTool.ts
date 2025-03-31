import { tool } from 'ai';
import { z } from 'zod';

/**
 * Defines the arguments expected by the displayMolecule tool's execute function.
 */
export type DisplayMoleculeArgs = {
  smiles: string;
  substructure?: string;
  width?: number;
  height?: number;
  legend?: string;
  options?: Record<string, unknown>; // Use unknown instead of any
};

/**
 * Defines the structured result returned by the displayMolecule tool.
 * Mirrors the input arguments plus a status and summary.
 */
export type DisplayMoleculeResult = {
  status: 'success';
  summary: string;
} & DisplayMoleculeArgs;

/**
 * Display Molecule Tool
 *
 * Used by the AI to request the display of a 2D molecule rendering in the UI.
 * Returns a structured result containing the original molecule details and a success status.
 * The actual rendering is handled by a frontend component.
 */
export const displayMoleculeTool = tool({
  description: 'Displays a 2D rendering of a chemical structure from a SMILES string in the chat.',
  parameters: z.object({
    smiles: z
      .string()
      .describe('The SMILES string representing the molecule.'),
    substructure: z
      .string()
      .optional()
      .describe('Optional SMARTS string to highlight a substructure within the molecule.'),
    width: z
      .number()
      .optional()
      .default(300)
      .describe('Width of the SVG image in pixels.'),
    height: z
      .number()
      .optional()
      .default(250)
      .describe('Height of the SVG image in pixels.'),
    legend: z
      .string()
      .optional()
      .describe('Optional label or legend displayed below the molecule.'),
    options: z
      .record(z.unknown()) // Use unknown instead of any
      .optional()
      .describe('Additional RDKit MolDrawOptions (e.g., { addAtomIndices: true }). See RDKit.js documentation for available options.'),
  }),
  execute: async (args: DisplayMoleculeArgs): Promise<DisplayMoleculeResult> => {
    console.log('[Tool] Executing displayMolecule with args:', args);
    // This tool primarily signals the frontend to render the molecule.
    // The execute function confirms receipt of the arguments.
    return {
      status: 'success',
      summary: `Molecule data received for SMILES: ${args.smiles}. Rendering handled by frontend.`,
      ...args, // Include all original arguments
    };
    // Note: Error handling for invalid SMILES or RDKit issues should occur
    // in the frontend component that performs the actual rendering.
  },
});
