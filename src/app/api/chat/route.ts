import { CoreMessage, smoothStream, streamText } from 'ai';
import { gemini25ProModel } from '@/lib/vertex'; // Non-grounded model for chat

// Import helpers and tools
import {
  processAndAttachFiles,
  type ReceivedFileData,
} from '@/lib/api/fileProcessor';
import { buildSystemPrompt } from '@/lib/api/promptHelper';
import { webSearchTool } from '@/lib/tools/webSearchTool';
import { displayCodeTool } from '@/lib/tools/displayCodeTool';

// Assemble the tools available to the AI
const tools = {
  webSearch: webSearchTool,
  displayCode: displayCodeTool,
  // Add other imported tools here as needed
};

/**
 * Handles POST requests to the chat API endpoint.
 * - Parses incoming messages and data (active modes, files, local attachment metadata).
 * - Processes file content and attaches metadata to the user message.
 * - Builds the appropriate system prompt.
 * - Calls the AI model via streamText with messages, system prompt, and tools.
 * - Returns a streaming response.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} A promise that resolves to the streaming response or an error response.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    // 1. Parse Request Body
    // Ensure messages is initialized even if not present in the request
    const { messages = [], data }: { messages?: CoreMessage[]; data?: { activeModes?: string[]; files?: ReceivedFileData[]; localAttachments?: Array<{ name: string; mimeType: string }> } } = await req.json();

    const receivedActiveModeIds = data?.activeModes ?? [];
    const receivedFiles = data?.files ?? [];
    const localAttachments = data?.localAttachments ?? []; // Extract localAttachments
    console.log('[API] Received active modes:', receivedActiveModeIds);
    console.log(`[API] Received ${receivedFiles.length} files.`);
    console.log(`[API] Received ${localAttachments.length} local attachment metadata entries.`); // Log extracted metadata

    // Make a mutable copy of messages to allow modification by file processor
    const messagesToSend: CoreMessage[] = [...messages];

    // 2. Process Files and Attach Metadata (modifies messagesToSend in place)
    processAndAttachFiles(messagesToSend, receivedFiles); // Removed localAttachments argument

    // 3. Build System Prompt
    const finalSystemPrompt = buildSystemPrompt(receivedActiveModeIds);

    // 4. Call AI Model
    const result = await streamText({
      model: gemini25ProModel, // Use the non-grounded Pro model for generation
      messages: messagesToSend, // Use the potentially modified messages array
      system: finalSystemPrompt, // Use combined system prompt from helper
      temperature: 0.7,
      tools: tools, // Provide defined tools from imported modules
      maxSteps: 2, // Allow multiple steps for tool execution + final response
      experimental_transform: smoothStream({
        delayInMs: 30,
        chunking: 'word',
      }),
    });

    // 5. Return Streaming Response
    // The AI SDK automatically handles streaming text, tool calls, and tool results.
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[API Error] Error in chat API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    // Return a structured JSON error response
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
