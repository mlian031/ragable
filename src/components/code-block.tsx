"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy } from "@tabler/icons-react";

// Simplified Props: Removed union type and 'tabs' prop
type CodeBlockProps = {
  language: string;
  code: string; // Now always required
  filename?: string; // Optional filename
  highlightLines?: number[]; // Optional highlight lines
};

export const CodeBlock = ({
  language,
  code, // Use directly
  filename, // Use directly
  highlightLines = [], // Use directly, provide default
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  // Removed activeTab state

  // Removed tabsExist variable

  const copyToClipboard = async () => {
    // Always copy the 'code' prop
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Removed activeCode, activeLanguage, activeHighlightLines variables

  return (
    <div className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm">
      {/* Removed outer flex container and tab rendering logic */}
      {/* Always show filename/copy button if filename exists */}
      {filename && (
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-700"> {/* Added padding/border */}
          <div className="text-xs text-zinc-400">{filename}</div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />} Copy Code
          </button>
        </div>
      )}
      {/* Added copy button even if no filename */}
      {!filename && (
         <div className="flex justify-end items-center pb-2 mb-2 border-b border-slate-700">
           <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />} Copy Code
          </button>
         </div>
      )}
      <SyntaxHighlighter
        language={language} // Use prop directly
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem", // text-sm equivalent
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: highlightLines.includes(lineNumber) // Use prop directly
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            display: "block",
            width: "100%",
          },
        })}
        PreTag="div"
      >
        {String(code)} {/* Use prop directly */}
      </SyntaxHighlighter>
    </div>
  );
};
