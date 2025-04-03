import { CoreMessage, smoothStream, streamText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import server-side Supabase client
import { gemini25ProModel } from '@/lib/vertex'; // Non-grounded model for chat

// Import helpers and tools
import {
  processAndAttachFiles,
  type ReceivedFileData,
} from '@/lib/api/fileProcessor';
import { buildSystemPrompt } from '@/lib/api/promptHelper';
import { webSearchTool } from '@/lib/tools/webSearchTool';
import { displayCodeTool } from '@/lib/tools/displayCodeTool';
import { displayMoleculeTool } from '@/lib/tools/displayMoleculeTool';
import { displayPlotTool } from '@/lib/tools/displayPlotTool'; // Import the new plot tool

// Assemble the tools available to the AI
const tools = {
  webSearch: webSearchTool,
  displayCode: displayCodeTool,
  displayMolecule: displayMoleculeTool,
  displayPlot: displayPlotTool, // Add the new plot tool
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
  const supabase = await createClient(); // Create Supabase client instance

  try {
    // --- Authentication and Usage Check ---
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[API Auth Error]', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's plan ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      console.error('[API Profile Error]', profileError);
      return NextResponse.json(
        { error: 'Could not retrieve user profile.' },
        { status: 500 }
      );
    }

    const planId = profileData.plan_id;

    // Check usage limit AND increment atomically for free plan users via DB function
    if (planId === 'free') {
      // Call the NEW combined function
      const { data: usageStatus, error: rpcError } = await supabase.rpc(
        'atomic_check_and_increment_usage', // <--- Use the new function name
        { p_user_id: user.id }
      );

      if (rpcError) {
        console.error('[API Usage Check/Increment RPC Error]', rpcError);
        return NextResponse.json(
          { error: 'Error checking usage limit.' },
          { status: 500 }
        );
      }

      console.log(`[API Usage Check/Increment] Status for user ${user.id}: ${usageStatus}`);

      // Handle the possible return statuses
      if (usageStatus === 'limit_reached') {
        return new Response(
          'Daily limit reached. Please upgrade your plan.', {status: 429}
        )
      }
      // If status is 'profile_not_found', it should have been caught by the profile fetch earlier,
      // but handling it defensively here might be wise depending on your exact needs.
      // if (usageStatus === 'profile_not_found') {
      //   return NextResponse.json({ error: 'User profile not found during usage check.' }, { status: 500 });
      // }

      // 'ok' means the user is under the limit and the count was incremented.
      // 'not_free_plan' means no check/increment was needed.
      // In both 'ok' and 'not_free_plan' cases, we proceed.
      if (usageStatus !== 'ok' && usageStatus !== 'not_free_plan') {
         // Handle unexpected status if necessary
         console.error(`[API Usage Check/Increment] Unexpected status: ${usageStatus}`);
         return NextResponse.json({ error: 'Unexpected error during usage check.' }, { status: 500 });
      }
    }
    // --- End Authentication and Usage Check/Increment ---


    // 1. Parse Request Body (moved after auth/usage check)
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

    // --- REMOVED: Separate Increment Usage Count Block ---
    // The increment now happens atomically within the check above for free users.
    // --- End REMOVED ---


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
