import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define a type for the source objects AFTER URL resolution
// URL should be required here. URI is only relevant as input.
export interface Source {
  url: string; // Changed back to required
  title?: string;
  // Add other known properties if needed, avoid index signature if possible
  snippet?: string; // Example: adding snippet if it's expected
  // Add other potential fields from the original source if needed
  [key: string]: any; // Keep index signature for now for flexibility
}

// --- Citation Formatting ---

// Define a type for the expected input structure for citation formatting
type CitationSourceInput = {
  url?: string;
  uri?: string;
  title?: string;
  segment?: { text?: string };
  searchEntryPoint?: { uri?: string };
  // Allow other properties that might exist on the source object
  [key: string]: any;
};

// Basic citation formatting - enhance with citation-js for accuracy
export function formatCitation(source: CitationSourceInput, style: string): string {
  // Placeholder logic - extract relevant info and format
  const title = source?.title || source?.segment?.text || 'Untitled Source';
  // Prioritize url, then uri, then searchEntryPoint uri
  const url = source?.url || source?.uri || source?.searchEntryPoint?.uri || '#';
  const accessDate = new Date().toLocaleDateString(); // Simple access date

  // Very basic formatting examples
  switch (style) {
    case 'apa':
      return `(${accessDate}). ${title}. Retrieved from ${url}`;
    case 'chicago':
      return `"${title}." Accessed ${accessDate}. ${url}.`;
    case 'mla':
    default:
      return `"${title}." Web. Accessed ${accessDate}. <${url}>.`;
  }
};


// --- URL Resolution ---

// Define a type for the flexible input to URL resolution
type InputSource = {
  url?: string;
  uri?: string;
  title?: string;
  [key: string]: any; // Allow other properties
};

// Function to resolve redirect URLs for an array of sources
// Input can be more flexible, output should conform to Source interface
export async function resolveSourceUrls(sources: any[]): Promise<Source[]> {
  // Cast to InputSource[] internally after validation
  const validSources = (Array.isArray(sources) ? sources : []) as InputSource[];

  if (!validSources.length) {
    return [];
  }

  // Input type is InputSource, output type is Source
  const resolveUrl = async (source: InputSource): Promise<Source> => {
    // Prioritize url, then uri
    const sourceUrl = source?.url || source?.uri;

    if (!source || typeof sourceUrl !== 'string' || !sourceUrl.startsWith('http')) {
      console.warn(`Skipping invalid source URL: ${sourceUrl}`);
      // Return a Source-like object even on failure, marking URL as invalid
      // Keep other properties from the original source object
      return { ...source, url: sourceUrl || 'invalid_or_missing_url' };
    }

    try {
      // Use HEAD request as we only need the final URL, not the content
      const response = await fetch(sourceUrl, { method: 'HEAD', redirect: 'follow' });
      // response.url contains the final URL after redirects
      const finalUrl = response.url || sourceUrl; // Use original if response.url is missing

      if (finalUrl !== sourceUrl) {
        console.log(`Resolved ${sourceUrl} to ${finalUrl}`);
      }
      // Update url property, ensure required fields exist
      const { uri, ...rest } = source; // Remove uri if present
      return { ...rest, url: finalUrl }; // Ensure url is set

    } catch (fetchError) {
      console.error(`Error resolving URL ${sourceUrl}:`, fetchError);
      // Return a Source-like object even on fetch error, keeping original URL
      const { uri, ...rest } = source;
      return { ...rest, url: sourceUrl }; // Keep original URL on error
    }
  };

  // Use Promise.allSettled to handle potential errors for individual URLs
  const settledResults = await Promise.allSettled(validSources.map(resolveUrl));

  const finalSources: Source[] = settledResults
    .map((result, index) => {
      if (result.status === 'fulfilled') {
        // Ensure the fulfilled value conforms to Source (has a url string)
        // If resolveUrl failed validation/fetch, it might return an object
        // where url is not a valid URL string - filter these out or handle them?
        // For now, assume resolveUrl returns a valid Source structure on success.
        return result.value;
      } else {
        // Log error and return the original source data, trying to conform to Source
        console.error(`Failed to process source at index ${index}:`, result.reason);
        const originalSource = validSources[index] || {};
        const { uri, ...rest } = originalSource;
        // Provide a fallback URL if none exists
        const fallbackUrl = originalSource.url || originalSource.uri || `error_processing_source_${index}`;
        return { ...rest, url: fallbackUrl } as Source; // Cast as Source, knowing url might be an error string
      }
    })
    // Optional: Filter out sources where URL resolution truly failed and resulted in a non-URL string
    // .filter(source => source.url.startsWith('http'));

  return finalSources;
}
