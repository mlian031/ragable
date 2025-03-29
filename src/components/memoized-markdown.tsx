'use client'; // Required for hooks like useMemo and memo

import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// Helper function to parse markdown into blocks using marked
function parseMarkdownIntoBlocks(markdown: string): string[] {
  // Ensure markdown is treated as a string
  const mdString = String(markdown || '');
  const tokens = marked.lexer(mdString);
  return tokens.map(token => token.raw);
}

// Memoized component for rendering a single markdown block
const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    // Render the block using ReactMarkdown
    return <ReactMarkdown>{content}</ReactMarkdown>;
  },
  // Custom comparison function: only re-render if content changes
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  }
);

// Set display name for easier debugging
MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

// Main memoized component that splits content into blocks and renders them
export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    // Use useMemo to parse blocks only when content changes
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    // Render each block using the memoized block component
    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  }
);

// Set display name for easier debugging
MemoizedMarkdown.displayName = 'MemoizedMarkdown';