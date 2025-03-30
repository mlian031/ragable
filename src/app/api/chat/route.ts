import { CoreMessage, FilePart, generateText, smoothStream, streamText, tool, TextPart } from 'ai'; // Added FilePart, TextPart
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

// Define the type for the expected file data from the frontend
type ReceivedFileData = {
  name: string;
  mimeType: string;
  data: string; // Base64 data URL string
};

export async function POST(req: Request) {
  try {
    // Read messages and optional data (now expecting activeModes and files arrays)
    const { messages, data }: { messages: CoreMessage[]; data?: { activeModes?: string[]; files?: ReceivedFileData[] } } = await req.json();

    const receivedActiveModeIds = data?.activeModes ?? [];
    const receivedFiles = data?.files ?? [];
    console.log("API received active modes:", receivedActiveModeIds);
    console.log(`API received ${receivedFiles.length} files.`); // For debugging

    // Prepare system prompts based on active modes
    const systemPrompts: CoreMessage[] = receivedActiveModeIds
      .map(id => getChatModeById(id)) // Get mode config by ID
      .filter(mode => mode?.systemPrompt) // Filter modes that have a system prompt
      .map(mode => ({ role: 'system' as const, content: mode!.systemPrompt! })); // Create system messages

    // Prepare the final messages array
    const messagesToSend: CoreMessage[] = [
      ...systemPrompts, // Prepend all active system prompts
      ...messages,     // Include the original messages (will be potentially modified below)
    ];

    // --- Process received files and add them to the last user message ---
    if (receivedFiles.length > 0) {
      const lastUserMessageIndex = messagesToSend.findLastIndex(m => m.role === 'user');

      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messagesToSend[lastUserMessageIndex];

        // Ensure content is an array of parts. Start with existing text content.
        let contentArray: Array<TextPart | FilePart> = [];
        if (typeof lastUserMessage.content === 'string') {
          contentArray.push({ type: 'text', text: lastUserMessage.content });
        } else {
           // If content is not a string, it's unexpected based on CoreMessage type.
           // Log a warning and default to an empty text part or handle appropriately.
           console.warn(`User message content at index ${lastUserMessageIndex} was not a string. Initializing with empty text.`);
           // contentArray.push({ type: 'text', text: '' }); // Or handle based on actual expected structure if CoreMessage changes
           // For now, let's assume if it's not a string, we might be dealing with an unexpected state or prior modification.
           // Let's try to proceed assuming it might be an array already, though CoreMessage type says no.
           // This part might need refinement based on how CoreMessage is truly defined/used upstream.
           // Safest approach: treat non-string as needing initialization.
           if (Array.isArray(lastUserMessage.content)) {
             // If it IS an array despite CoreMessage type, try to use it but filter for TextPart/FilePart?
             // This indicates a potential type mismatch upstream or downstream.
             console.warn(`User message content at index ${lastUserMessageIndex} was an array, which contradicts CoreMessage type. Attempting to use.`);
             contentArray = lastUserMessage.content.filter(part => part.type === 'text' || part.type === 'file') as Array<TextPart | FilePart>;
           } else {
             contentArray.push({ type: 'text', text: '' }); // Default if not string or array
           }
        }

        // Process and add files
        for (const file of receivedFiles) {
          try {
            // Extract base64 data (remove potential data URL prefix like 'data:image/png;base64,')
            const base64Data = file.data.split(',')[1] ?? file.data; // Fallback if no prefix
            const buffer = Buffer.from(base64Data, 'base64');
            contentArray.push({
              type: 'file',
              mimeType: file.mimeType,
              data: buffer,
              filename: file.name, // Include filename if available
            });
            console.log(`Processed and added file: ${file.name} (${file.mimeType})`);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            // Optionally, inform the user about the specific file error?
            // For now, just log and skip the file.
          }
        }

        // Update the message in the array. We cast here because we know we're changing the structure
        // potentially away from the strict CoreMessage type for this specific message.
        messagesToSend[lastUserMessageIndex] = {
          ...lastUserMessage,
          content: contentArray,
        } as CoreMessage; // Cast back to CoreMessage, acknowledging the potential structural difference for this element
        console.log(`Added ${receivedFiles.length} files to the last user message.`);

      } else {
        console.warn("Received files but couldn't find a user message to attach them to.");
        // Handle this case? Maybe send a separate message or ignore?
      }
    }
    // --- End file processing ---


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
