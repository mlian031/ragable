import { createVertex } from '@ai-sdk/google-vertex';
// Removed unused: import { createVertexAnthropic } from '@ai-sdk/google-vertex/anthropic';

// Get project ID and location from environment variables
// These MUST be set in your Cloud Run service configuration or local environment
const projectId = process.env.GOOGLE_VERTEX_PROJECT;
const location = process.env.GOOGLE_VERTEX_LOCATION;

// Validate that environment variables are set
if (!projectId) {
  throw new Error('Missing required environment variable: GOOGLE_VERTEX_PROJECT');
}
if (!location) {
  // You might default this, but it's better to require it for clarity
  // location = 'us-central1';
  throw new Error('Missing required environment variable: GOOGLE_VERTEX_LOCATION');
}

console.log(`Configuring Vertex AI for project: ${projectId}, location: ${location}`);

// Create Vertex provider
// Authentication is handled automatically via Application Default Credentials (ADC)
// when running on Google Cloud (like Cloud Run with a service account)
// or via GOOGLE_APPLICATION_CREDENTIALS locally if set.
const vertexProvider = createVertex({
  project: projectId,
  location: location,
});

// Export specific models for convenience
// Note: Availability of experimental models might change.
const geminiThinkingModel = vertexProvider("gemini-2.0-flash-thinking-exp-01-21");
// Enable search grounding for the flash model
const geminiFlashModel = vertexProvider("gemini-2.0-flash-001", {
  useSearchGrounding: true,
});
const geminiProModel = vertexProvider("gemini-2.0-pro-exp-02-05", {
  useSearchGrounding: true,
});
const geminiFlashLiteModel = vertexProvider("gemini-2.0-flash-lite-001");
// Grounded version of 2.5 Pro
const gemini25ProModelGrounded = vertexProvider("gemini-2.5-pro-exp-03-25", {
  useSearchGrounding: true,
});
// Non-grounded version of 2.5 Pro (for main chat generation)
const gemini25ProModel = vertexProvider("gemini-2.5-pro-exp-03-25"); // Ensure no grounding option here
const embeddingModel = vertexProvider.textEmbeddingModel('text-embedding-004');

export {
  geminiThinkingModel,
  geminiFlashModel, // Grounding enabled
  geminiProModel, // Grounding enabled
  geminiFlashLiteModel,
  gemini25ProModelGrounded, // Keep grounded version if needed elsewhere, but we won't use it directly in chat route
  gemini25ProModel, // Default Pro model (No grounding)
  embeddingModel,
  vertexProvider,
};
