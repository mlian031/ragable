import { CoreMessage, FilePart, TextPart } from 'ai';
import { Buffer } from 'buffer'; // Ensure Buffer is explicitly imported

/**
 * Represents the expected structure of file data received from the frontend.
 */
export type ReceivedFileData = {
  name: string;
  mimeType: string;
  data: string; // Base64 data URL string (e.g., "data:image/png;base64,...")
};

/**
 * Processes received files and adds them as FileParts to the last user message in a message array.
 * Modifies the input messages array directly.
 *
 * @param {CoreMessage[]} messages - The array of messages to modify.
 * @param {ReceivedFileData[]} receivedFiles - The array of files received from the frontend.
 * @returns {void} - Modifies the messages array in place.
 */
export function processAndAttachFiles(
  messages: CoreMessage[],
  receivedFiles: ReceivedFileData[],
): void {
  if (!receivedFiles || receivedFiles.length === 0) {
    return; // No files to process
  }

  const lastUserMessageIndex = messages.findLastIndex((m) => m.role === 'user');

  if (lastUserMessageIndex === -1) {
    console.warn(
      "Received files but couldn't find a user message to attach them to.",
    );
    return; // No user message found
  }

  const lastUserMessage = messages[lastUserMessageIndex];

  // Ensure content is an array of parts. Start with existing text content if it's a string.
  let contentArray: Array<TextPart | FilePart> = [];
  if (typeof lastUserMessage.content === 'string') {
    contentArray.push({ type: 'text', text: lastUserMessage.content });
  } else if (Array.isArray(lastUserMessage.content)) {
    // If it's already an array (might happen with previous modifications or different CoreMessage usage), use it.
    // Filter to ensure only valid parts are kept, though CoreMessage type suggests this shouldn't happen initially.
    contentArray = lastUserMessage.content.filter(
      (part): part is TextPart | FilePart =>
        part.type === 'text' || part.type === 'file',
    );
    console.warn(
      `User message content at index ${lastUserMessageIndex} was already an array. Using existing parts.`,
    );
  } else {
    // Handle unexpected content types (null, undefined, object etc.) by starting fresh.
    console.warn(
      `User message content at index ${lastUserMessageIndex} was not a string or array. Initializing with empty text. Content was:`,
      lastUserMessage.content,
    );
    contentArray.push({ type: 'text', text: '' });
  }

  // Process and add new files
  let filesAddedCount = 0;
  for (const file of receivedFiles) {
    try {
      // Extract base64 data (remove data URL prefix like 'data:image/png;base64,')
      const base64Data = file.data.split(',')[1] ?? file.data; // Fallback if no prefix
      if (!base64Data) {
        throw new Error('Base64 data is empty or missing.');
      }
      const buffer = Buffer.from(base64Data, 'base64');

      contentArray.push({
        type: 'file',
        mimeType: file.mimeType,
        data: buffer,
        filename: file.name, // Include filename
      });
      filesAddedCount++;
      console.log(`Processed and added file: ${file.name} (${file.mimeType})`);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Optionally, add a text part indicating the error?
      // contentArray.push({ type: 'text', text: `[Error processing file: ${file.name}]` });
    }
  }

  // Update the message in the original array with the new content array.
  // We cast here because the content structure might now differ from the base CoreMessage string content.
  messages[lastUserMessageIndex] = {
    ...lastUserMessage,
    content: contentArray,
  } as CoreMessage; // Cast back, acknowledging the potential structural difference

  if (filesAddedCount > 0) {
    console.log(
      `Successfully added ${filesAddedCount} files to the last user message.`,
    );
  }
}
