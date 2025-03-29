import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Basic citation formatting - enhance with citation-js for accuracy
// TODO: Define a more specific type for the source object if possible
export function formatCitation(source: any, style: string): string {
  // Placeholder logic - extract relevant info and format
  const title = source?.title || source?.segment?.text || 'Untitled Source';
  // Ensure uri is handled correctly, checking both potential locations
  const uri = source?.uri || source?.url || source?.searchEntryPoint?.uri || '#';
  const accessDate = new Date().toLocaleDateString(); // Simple access date

  // Very basic formatting examples
  switch (style) {
    case 'apa':
      return `(${accessDate}). ${title}. Retrieved from ${uri}`;
    case 'chicago':
      return `"${title}." Accessed ${accessDate}. ${uri}.`;
    case 'mla':
    default:
      return `"${title}." Web. Accessed ${accessDate}. <${uri}>.`;
  }
};

// Define a type for the source objects, matching expected structure from AI SDK
// Re-defining here for use in resolveSourceUrls, consider moving to a shared types file later
interface Source {
  url: string;
  title?: string;
  [key: string]: any; // Allow other properties
}

// Function to resolve redirect URLs for an array of sources
export async function resolveSourceUrls(sources: Source[]): Promise<Source[]> {
  if (!Array.isArray(sources)) {
    return [];
  }

  const resolveUrl = async (source: Source): Promise<Source> => {
    // Use source.url now
    if (!source || typeof source.url !== 'string' || !source.url.startsWith('http')) {
      console.warn(`Skipping invalid source URL: ${source?.url}`); // Use source.url
      return source; // Return original if invalid
    }
    try {
      // Use HEAD request as we only need the final URL, not the content
      const response = await fetch(source.url, { method: 'HEAD', redirect: 'follow' }); // Use source.url
      // response.url contains the final URL after redirects
      if (response.url && response.url !== source.url) { // Use source.url
        console.log(`Resolved ${source.url} to ${response.url}`); // Use source.url
        return { ...source, url: response.url }; // Update url property
      }
      return source; // Return original if no redirect or same URL
    } catch (fetchError) {
      console.error(`Error resolving URL ${source.url}:`, fetchError); // Use source.url
      return source; // Return original source on fetch error
    }
  };

  // Use Promise.allSettled to handle potential errors for individual URLs
  const settledResults = await Promise.allSettled(sources.map(resolveUrl));

  const finalSources: Source[] = settledResults.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // Log error and return original source if promise rejected
      console.error(`Failed to process source at index ${index}:`, result.reason);
      // Ensure we return a valid Source object even on failure
      return sources[index] || { url: 'invalid_source_data', title: 'Error Processing Source' };
    }
  });

  return finalSources;
}
