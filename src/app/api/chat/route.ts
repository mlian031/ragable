import { CoreMessage, generateText, streamText, tool } from 'ai';
import { z } from 'zod';
// Import necessary models (grounded flash for tool, non-grounded pro for main chat)
import { geminiFlashModel, gemini25ProModel } from '@/lib/vertex';
// Import the URL resolution utility
import { resolveSourceUrls } from '@/lib/utils';
// Define a type for the source objects, matching expected structure from AI SDK
// Note: This is duplicated in utils.ts, consider a shared types file later.
interface Source {
  url: string;
  title?: string;
  [key: string]: any; // Allow other properties
}


// Define the tools
const tools = {
  webSearch: tool({
    description: `Search the web for information based on a query.
Call this tool when the user asks for recent information, specific facts you don't know,
or when you need to verify information. Returns a concise summary of the findings
and a list of relevant sources.`,
    parameters: z.object({
      query: z.string().describe('The search query to use. Be specific and clear.'),
    }),
    // Adjust return type annotation for sources using the Source interface
    execute: async ({ query }: { query: string }): Promise<{ context: string, sources: Source[] }> => {
      console.log(`Executing webSearch tool for query: "${query}"`);
      try {
        // Use generateText with the grounded Flash model for retrieval
        const retrievalResult = await generateText({
          model: geminiFlashModel, // Grounded Flash model
          prompt: `Perform a web search to answer the following query: "${query}". Provide a concise summary based *only* on the search results.`,
          // You might add safety settings or other parameters here if needed
        });

        console.log("webSearch - Retrieval result:", JSON.stringify(retrievalResult, null, 2));

        const context = retrievalResult.text;
        // Cast sources to our Source type, assuming the structure matches (url, title, etc.)
        const initialSources: Source[] = (retrievalResult.sources as Source[]) ?? [];

        // Resolve redirect URLs using the utility function
        console.log(`Resolving URLs for ${initialSources.length} sources...`);
        const finalSources = await resolveSourceUrls(initialSources);
        console.log(`Finished resolving URLs.`);


        // Return context and the resolved sources for the main model to use
        return { context, sources: finalSources };

      } catch (error) {
        console.error(`Error during webSearch execution for query "${query}":`, error);
        // Return an error message or empty results if the search fails
        return {
          context: `Sorry, I encountered an error while searching for "${query}".`,
          sources: []
        };
      }
    },
  }),
  calculator: tool({
    description: 'Calculate the result of a mathematical expression.',
    parameters: z.object({
      expression: z.string().describe('The mathematical expression to evaluate.'),
    }),
    execute: async ({ expression }) => {
      try {
        const safeExpression = expression.replace(/[^-()\d/*+.]/g, '');
        const result = new Function(`return ${safeExpression}`)();
        if (typeof result !== 'number' || isNaN(result)) {
          throw new Error('Invalid calculation');
        }
        return { result };
      } catch (error) {
        console.error("Calculator error:", error);
        return { error: error instanceof Error ? error.message : 'Calculation failed' };
      }
    },
  }),
  defineWord: tool({
    description: 'Get the definition of a word.',
    parameters: z.object({
      word: z.string().describe('The word to define.'),
    }),
    execute: async ({ word }) => {
      const definitions: Record<string, string> = {
        'ephemeral': 'Lasting for a very short time.',
        'ubiquitous': 'Present, appearing, or found everywhere.',
        'serendipity': 'The occurrence and development of events by chance in a happy or beneficial way.',
      };
      const definition = definitions[word.toLowerCase()] || `Sorry, I don't have a definition for "${word}".`;
      return { definition };
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    // Use streamText with the non-grounded Pro model and provide the tools
    const result = await streamText({
      model: gemini25ProModel, // Use the non-grounded Pro model for generation
      messages,
      tools: tools, // Provide all defined tools
    });

    // Return the streaming response. The AI SDK automatically handles
    // streaming text, tool calls, and tool results.
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Error in chat API route:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
