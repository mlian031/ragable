import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes with clsx for conditional class names.
 *
 * @param {...ClassValue} inputs - Class names or conditional class objects.
 * @returns {string} The merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Truncates a file name to a maximum length, preserving the file extension.
 *
 * @param {string} name - The original file name.
 * @param {number} [maxLength=10] - The maximum desired length of the truncated name (including ellipsis and extension).
 * @returns {string} The truncated file name, or the original name if it's within the length limit.
 */
export const truncateFileName = (
  name: string,
  maxLength: number = 10,
): string => {
  if (name.length <= maxLength) {
    return name;
  }
  const ellipsis = '...';
  const ellipsisLength = ellipsis.length;

  // Find the last dot for the extension
  const lastDotIndex = name.lastIndexOf('.');
  let extension = '';
  let nameWithoutExtension = name;

  // Check if there's an extension and it's reasonably short (e.g., <= 5 chars)
  if (lastDotIndex > 0 && name.length - lastDotIndex <= 5) {
    extension = name.substring(lastDotIndex);
    nameWithoutExtension = name.substring(0, lastDotIndex);
  }

  // Calculate how many characters of the name (without extension) can be shown
  const availableLength = maxLength - extension.length - ellipsisLength;

  // If not enough space even for ellipsis + extension, truncate the whole name
  if (availableLength <= 0) {
    // Ensure we don't cut off mid-ellipsis if maxLength is very small
    const cutLength = Math.max(0, maxLength - ellipsisLength);
    return name.substring(0, cutLength) + ellipsis;
  }

  // Construct the truncated name
  return nameWithoutExtension.substring(0, availableLength) + ellipsis + extension;
};

/**
 * Represents a resolved source, typically after URL redirection checks.
 * The `url` property is expected to be the final, accessible URL.
 */
export interface Source {
  /** The final, resolved URL of the source. */
  url: string;
  /** The title of the source, if available. */
  title?: string;
  /** A relevant snippet from the source, if available. */
  snippet?: string;
  /** Allows for other properties that might exist on the original source object. */
  [key: string]: any;
}

// --- Citation Formatting ---

/**
 * Represents the input data for formatting a citation.
 * Allows for flexibility in how source information is provided (URL, URI, etc.).
 */
type CitationSourceInput = {
  /** The direct URL of the source. */
  url?: string;
  /** An alternative URI for the source. */
  uri?: string;
  /** The title of the source. */
  title?: string;
  /** Nested segment information, potentially containing text. */
  segment?: { text?: string };
  /** Nested search entry point information, potentially containing a URI. */
  searchEntryPoint?: { uri?: string };
  /** Allows for other properties that might exist on the source object. */
  [key: string]: any;
};

/**
 * Defines the structure for a citation formatting function.
 * @param {CitationSourceInput} source - The source data.
 * @returns {string} The formatted citation string.
 */
type CitationFormatter = (source: CitationSourceInput) => string;

/**
 * A map of citation style names to their corresponding formatting functions.
 */
const citationFormatters: Record<string, CitationFormatter> = {
  apa: (source) => {
    const title = source?.title || source?.segment?.text || 'Untitled Source';
    const url = source?.url || source?.uri || source?.searchEntryPoint?.uri || '#';
    const accessDate = new Date().toLocaleDateString();
    return `(${accessDate}). ${title}. Retrieved from ${url}`;
  },
  chicago: (source) => {
    const title = source?.title || source?.segment?.text || 'Untitled Source';
    const url = source?.url || source?.uri || source?.searchEntryPoint?.uri || '#';
    const accessDate = new Date().toLocaleDateString();
    return `"${title}." Accessed ${accessDate}. ${url}.`;
  },
  mla: (source) => {
    const title = source?.title || source?.segment?.text || 'Untitled Source';
    const url = source?.url || source?.uri || source?.searchEntryPoint?.uri || '#';
    const accessDate = new Date().toLocaleDateString();
    return `"${title}." Web. Accessed ${accessDate}. <${url}>.`;
  },
};

/**
 * Formats a citation for a given source based on the specified style.
 * Defaults to MLA style if the provided style is not recognized.
 * Consider integrating a more robust library like 'citation-js' for production use.
 *
 * @param {CitationSourceInput} source - The source data object.
 * @param {string} style - The desired citation style (e.g., 'apa', 'chicago', 'mla').
 * @returns {string} The formatted citation string.
 */
export function formatCitation(
  source: CitationSourceInput,
  style: string,
): string {
  const formatter = citationFormatters[style.toLowerCase()] || citationFormatters.mla;
  return formatter(source);
}

// --- URL Resolution ---

/**
 * Represents a source input which might have a 'url' or 'uri' property,
 * among others, before URL resolution.
 */
type InputSource = {
  url?: string;
  uri?: string;
  title?: string;
  [key: string]: any; // Allow other properties
};

/**
 * Attempts to resolve the final URL for a single source, handling redirects.
 * Uses a HEAD request for efficiency.
 *
 * @param {InputSource} source - The source object containing a potential URL or URI.
 * @param {number} index - The index of the source in the original array (for logging).
 * @returns {Promise<Source>} A promise that resolves to a Source object with the final URL.
 *                            If resolution fails or the URL is invalid, the original URL/URI
 *                            (or a placeholder) is retained in the `url` field.
 */
const resolveSingleUrl = async (
  source: InputSource,
  index: number,
): Promise<Source> => {
  // Prioritize url, then uri
  const sourceUrl = source?.url || source?.uri;
  const { uri, ...restOfSource } = source; // Prepare base object, removing uri

  if (
    !sourceUrl ||
    typeof sourceUrl !== 'string' ||
    !sourceUrl.startsWith('http')
  ) {
    console.warn(
      `[Source ${index}] Skipping invalid or non-HTTP source URL: ${sourceUrl}`,
    );
    // Return a Source-like object, marking URL as invalid/missing
    return { ...restOfSource, url: sourceUrl || `invalid_or_missing_url_${index}` };
  }

  try {
    // Use HEAD request as we only need the final URL, not the content
    const response = await fetch(sourceUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });
    // response.url contains the final URL after redirects
    const finalUrl = response.url || sourceUrl; // Use original if response.url is missing

    if (finalUrl !== sourceUrl) {
      console.log(`[Source ${index}] Resolved ${sourceUrl} to ${finalUrl}`);
    }
    // Return the source object with the updated final URL
    return { ...restOfSource, url: finalUrl };
  } catch (fetchError) {
    console.error(
      `[Source ${index}] Error resolving URL ${sourceUrl}:`,
      fetchError,
    );
    // Return the source object with the original URL on fetch error
    return { ...restOfSource, url: sourceUrl };
  }
};

/**
 * Resolves redirect URLs for an array of source objects.
 * Takes an array of potential sources (flexible structure) and returns
 * an array of Source objects with resolved URLs.
 * Handles errors gracefully for individual URL resolutions.
 *
 * @param {any[]} sourcesInput - An array of source objects, potentially with 'url' or 'uri'.
 * @returns {Promise<Source[]>} A promise that resolves to an array of Source objects.
 */
export async function resolveSourceUrls(sourcesInput: any[]): Promise<Source[]> {
  // Validate input is an array and cast to InputSource[]
  const validSources: InputSource[] = Array.isArray(sourcesInput)
    ? (sourcesInput as InputSource[])
    : [];

  if (!validSources.length) {
    console.log('No valid sources provided for URL resolution.');
    return [];
  }

  console.log(`Attempting to resolve URLs for ${validSources.length} sources...`);

  // Use Promise.allSettled to handle potential errors for individual URLs
  const settledResults = await Promise.allSettled(
    validSources.map((source, index) => resolveSingleUrl(source, index)),
  );

  const finalSources: Source[] = settledResults.map((result, index) => {
    if (result.status === 'fulfilled') {
      // The resolveSingleUrl function ensures a Source-like object is returned
      return result.value;
    } else {
      // Log the unexpected error from resolveSingleUrl (though it has internal catch)
      console.error(
        `[Source ${index}] Unexpected error during URL resolution task:`,
        result.reason,
      );
      // Fallback: return the original source data, trying to conform to Source
      const originalSource = validSources[index] || {};
      const { uri, ...rest } = originalSource;
      const fallbackUrl =
        originalSource.url ||
        originalSource.uri ||
        `error_processing_source_${index}`;
      // Cast as Source, knowing url might be an error string
      return { ...rest, url: fallbackUrl } as Source;
    }
  });

  console.log(`Finished URL resolution for ${validSources.length} sources.`);
  return finalSources;
}
