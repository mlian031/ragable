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

// Assemble the tools available to the AI
const tools = {
  webSearch: webSearchTool,
  displayCode: displayCodeTool,
  displayMolecule: displayMoleculeTool,
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

const FREE_PLAN_LIMIT = 10; // Define the message limit for the free plan

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

    // Fetch user profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan_id, daily_message_count, last_message_reset_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[API Profile Error]', profileError);
      // Handle case where profile might not exist yet (though trigger should handle it)
      return NextResponse.json(
        { error: 'Could not retrieve user profile.' },
        { status: 500 }
      );
    }

    let shouldUpdateProfile = false; // Flag to track if profile needs DB update

    // Check usage for free plan users
    if (profile.plan_id === 'free') {
      const now = new Date();
      const lastReset = new Date(profile.last_message_reset_at);
      const timeDiffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      // Reset daily count if 24 hours have passed
      if (timeDiffHours >= 24) {
        console.log(`[API Usage] Resetting daily count for user ${user.id}`);
        profile.daily_message_count = 0;
        profile.last_message_reset_at = now.toISOString();
        shouldUpdateProfile = true; // Mark profile for update
      }

      // Check if limit is reached *after* potential reset
      if (profile.daily_message_count >= FREE_PLAN_LIMIT) {
        console.log(`[API Usage] Daily limit reached for user ${user.id}`);
        // Update profile if reset happened before hitting limit check
        if (shouldUpdateProfile) {
           supabase
            .from('profiles')
            .update({
              daily_message_count: profile.daily_message_count,
              last_message_reset_at: profile.last_message_reset_at,
            })
            .eq('id', user.id)
            .then(({ error: updateError }) => {
              if (updateError) console.error('[API Usage] Error updating profile on limit reached:', updateError);
            });
        }
        return NextResponse.json(
          { error: 'Daily limit reached. Please upgrade your plan.' },
          { status: 429 }
        );
      }
    }
    // --- End Authentication and Usage Check ---


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

    // --- Increment Usage Count (After successful AI call initiation) ---
    if (profile && profile.plan_id === 'free') {
      // Increment count locally first for immediate reflection if needed elsewhere
      profile.daily_message_count += 1;
      shouldUpdateProfile = true; // Mark for update

      // Asynchronously update the database - don't block the response
      supabase
        .from('profiles')
        .update({
          daily_message_count: profile.daily_message_count,
          // Only update last_message_reset_at if it was changed during reset check
          ...(profile.last_message_reset_at !== (await supabase.from('profiles').select('last_message_reset_at').eq('id', user.id).single()).data?.last_message_reset_at ? { last_message_reset_at: profile.last_message_reset_at } : {})
        })
        .eq('id', user.id)
        .then(({ error: incrementError }) => {
          if (incrementError) {
            console.error('[API Usage] Error incrementing message count:', incrementError);
            // Consider logging this failure more robustly
          } else {
            console.log(`[API Usage] Incremented message count for user ${user.id} to ${profile.daily_message_count}`);
          }
        });
    }
    // --- End Increment Usage Count ---


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
