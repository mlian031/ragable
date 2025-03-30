import { CoreMessage, generateText, smoothStream, streamText, tool } from 'ai';
import { z } from 'zod';
// Import necessary models (grounded flash for tool, non-grounded pro for main chat)
import { geminiFlashModel, gemini25ProModel } from '@/lib/vertex';
// Import the URL resolution utility and the Source type
import { resolveSourceUrls, type Source } from '@/lib/utils';
// Removed direct prompt import, will use config
import { getChatModeById } from '@/config/chat-modes'; // Import mode config helper


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
    // Return structured result
    execute: async ({ query }: { query: string }): Promise<{ status: string, summary: string, context: string, sources: Source[] } | { status: string, summary: string, context: string, sources: Source[] }> => {
      console.log(`Executing webSearch tool for query: "${query}"`);
      try {
        // Use generateText with the grounded Flash model for retrieval
        const retrievalResult = await generateText({
          model: geminiFlashModel, // Grounded Flash model
          prompt: `Perform a web search to answer the following query: "${query}". Provide a concise summary based *only* on the search results.`,
          // You might add safety settings or other parameters here if needed
        });

        const context = retrievalResult.text;
        // Cast sources to our Source type, assuming the structure matches (url, title, etc.)
        const initialSources: Source[] = (retrievalResult.sources as Source[]) ?? [];

        // Resolve redirect URLs using the utility function
        console.log(`Resolving URLs for ${initialSources.length} sources...`);
        const finalSources = await resolveSourceUrls(initialSources);
        console.log(`Finished resolving URLs.`);


        // Return structured success result
        return {
          status: 'success',
          summary: `Web search for "${query}" completed.`,
          context,
          sources: finalSources
        };

      } catch (error) {
        console.error(`Error during webSearch execution for query "${query}":`, error);
        // Return structured error result
        return {
          status: 'error',
          summary: `Error searching for "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          context: `Sorry, I encountered an error while searching for "${query}".`,
          sources: []
        };
      }
    },
  }),
  displayCode: tool({
    description: `Displays a code snippet. Use this tool whenever you generate code as part of your response. Provide the programming language, the code itself, and optionally a filename.`,
    parameters: z.object({
      language: z.string().describe('The programming language of the code (e.g., "typescript", "python", "html").'),
      filename: z.string().optional().describe('An optional filename or label for the code block.'), // Made optional
      code: z.string().describe('The code snippet to display.'),
    }),
    // Return structured result
    execute: async (args: { language: string, code: string, filename?: string }) => {
      console.log("Executing displayCode tool with args:", args);
      // Return structured success result
      return {
        status: 'success',
        summary: `Code block generated (${args.language}${args.filename ? `: ${args.filename}` : ''}).`,
        ...args // Include original args (language, code, filename)
      };
      // Note: No specific error handling added here, assuming validation prevents most errors.
    },
  }),
};

export async function POST(req: Request) {
  try {
    // Read messages and optional data (now expecting activeModes array)
    const { messages, data }: { messages: CoreMessage[]; data?: { activeModes?: string[] } } = await req.json();

    const receivedActiveModeIds = data?.activeModes ?? [];
    console.log("API received active modes:", receivedActiveModeIds); // For debugging

    // Prepare system prompts based on active modes
    const systemPrompts: CoreMessage[] = receivedActiveModeIds
      .map(id => getChatModeById(id)) // Get mode config by ID
      .filter(mode => mode?.systemPrompt) // Filter modes that have a system prompt
      .map(mode => ({ role: 'system' as const, content: mode!.systemPrompt! })); // Create system messages

    // Prepare the final messages array
    const messagesToSend: CoreMessage[] = [
      ...systemPrompts, // Prepend all active system prompts
      ...messages,     // Include the original messages
    ];

    if (systemPrompts.length > 0) {
      console.log(`Prepended ${systemPrompts.length} system prompts based on active modes.`);
    }

    // Use streamText with the non-grounded Pro model and provide the tools
    // Add system prompt guidance for handling structured tool results
    const toolHandlingGuidance = `When you receive tool results with 'status: success', briefly acknowledge the tool's completion based on its 'summary', then use the provided data (context, sources, code, etc.) to formulate your final response to the user's original query. Do not call the same tool again if you have already received a success status for it in this turn. If a tool result has 'status: error', inform the user about the error based on the 'summary'.`;

    // Combine existing system prompts with the new guidance
    const finalSystemPrompt = [
        ...systemPrompts.map(p => p.content),
        "Avoid writing code directly in your response text. Instead, always use the displayCode tool.", // Keep existing instruction
        toolHandlingGuidance // Add new guidance
    ].join('\n\n');

    console.log("Final system prompt:", finalSystemPrompt); // For debugging


    const result = await streamText({
      model: gemini25ProModel, // Use the non-grounded Pro model for generation
      messages: messagesToSend, // Use the potentially modified messages array
      system: finalSystemPrompt, // Use combined system prompt
      temperature: 0.7,
      tools: tools, // Provide all defined tools
      maxSteps: 2, // Allow multiple steps for tool execution + final response
      experimental_transform: smoothStream({
        delayInMs: 30,
        chunking: 'word'
      }),
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
