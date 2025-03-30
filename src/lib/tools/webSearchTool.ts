import { generateText, tool } from 'ai';
import { z } from 'zod';
import { geminiFlashModel } from '@/lib/vertex'; // Grounded model for search
import { resolveSourceUrls, type Source } from '@/lib/utils'; // URL resolver and Source type

/**
 * Defines the structured result returned by the webSearch tool upon success.
 */
export type WebSearchResultSuccess = {
  status: 'success';
  summary: string;
  context: string;
  sources: Source[];
};

/**
 * Defines the structured result returned by the webSearch tool upon error.
 */
export type WebSearchResultError = {
  status: 'error';
  summary: string;
  context: string;
  sources: []; // Empty array for errors
};

/**
 * Defines the possible structured results returned by the webSearch tool's execute function.
 */
export type WebSearchResult = WebSearchResultSuccess | WebSearchResultError;

/**
 * Web Search Tool
 *
 * Searches the web for information using a grounded model and resolves source URLs.
 * Returns a structured result indicating success or failure, along with context and sources.
 */
export const webSearchTool = tool({
  description: `Search the web for information based on a query.
Call this tool when the user asks for recent information, specific facts you don't know,
or when you need to verify information. Returns a concise summary of the findings
and a list of relevant sources.`,
  parameters: z.object({
    query: z
      .string()
      .describe('The search query to use. Be specific and clear.'),
  }),
  execute: async ({
    query,
  }: {
    query: string;
  }): Promise<WebSearchResult> => {
    console.log(`[Tool] Executing webSearch for query: "${query}"`);
    try {
      // Use generateText with the grounded Flash model for retrieval
      const retrievalResult = await generateText({
        model: geminiFlashModel, // Grounded Flash model
        prompt: `Perform a web search to answer the following query: "${query}". Provide a concise summary based *only* on the search results.`,
        // Add safety settings or other parameters here if needed
      });

      const context = retrievalResult.text;
      // Cast sources to our Source type, assuming the structure matches (url, title, etc.)
      // Provide an empty array fallback if sources are null/undefined.
      const initialSources: Source[] =
        (retrievalResult.sources as Source[]) ?? [];

      // Resolve redirect URLs using the utility function
      console.log(
        `[Tool] Resolving URLs for ${initialSources.length} sources...`,
      );
      const finalSources = await resolveSourceUrls(initialSources);
      console.log(`[Tool] Finished resolving URLs.`);

      // Return structured success result
      return {
        status: 'success',
        summary: `Web search for "${query}" completed successfully.`,
        context,
        sources: finalSources,
      };
    } catch (error) {
      console.error(
        `[Tool] Error during webSearch execution for query "${query}":`,
        error,
      );
      // Return structured error result
      return {
        status: 'error',
        summary: `Error searching for "${query}": ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        context: `Sorry, I encountered an error while searching for "${query}". Please try again or rephrase your request.`,
        sources: [],
      };
    }
  },
});
