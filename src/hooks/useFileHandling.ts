import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast'; // Import useToast

// Constants for validation
export const MAX_FILES = 10;
export const MAX_TOTAL_SIZE_MB = 20;
export const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Helper to read file as Data URL
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface UseFileHandlingProps {
  maxFiles?: number;
  maxTotalSizeMB?: number;
  allowedMimeTypes?: string[];
}

export function useFileHandling({
  maxFiles = MAX_FILES,
  maxTotalSizeMB = MAX_TOTAL_SIZE_MB,
  allowedMimeTypes = ALLOWED_MIME_TYPES,
}: UseFileHandlingProps = {}) {
  const { toast } = useToast(); // Use the toast hook internally
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const maxTotalSizeBytes = maxTotalSizeMB * 1024 * 1024;

  const totalSelectedSize = useMemo(() => {
    return selectedFiles.reduce((sum, file) => sum + file.size, 0);
  }, [selectedFiles]);

  const totalSelectedSizeMB = useMemo(() => {
    return (totalSelectedSize / (1024 * 1024)).toFixed(2);
  }, [totalSelectedSize]);

  const handleFileSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (!newFiles.length) return;

    let currentTotalSize = totalSelectedSize; // Use memoized value
    const filesToAdd: File[] = [];
    let validationError = false;

    if (selectedFiles.length + newFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can attach a maximum of ${maxFiles} files.`,
        variant: "destructive",
      });
      validationError = true;
    } else {
      for (const file of newFiles) {
        if (!allowedMimeTypes.includes(file.type)) {
          toast({
            title: "Unsupported file type",
            description: `File "${file.name}" (${file.type}) is not supported. Please upload PDFs or images.`,
            variant: "destructive",
          });
          validationError = true;
          continue; // Skip this file
        }

        if (currentTotalSize + file.size > maxTotalSizeBytes) {
          toast({
            title: "Size limit exceeded",
            description: `Adding "${file.name}" would exceed the ${maxTotalSizeMB}MB total size limit.`,
            variant: "destructive",
          });
          validationError = true;
          // Don't break, allow checking other files, but mark error
        } else if (selectedFiles.length + filesToAdd.length < maxFiles) {
          // Only add if within count limit and size limit *so far*
          filesToAdd.push(file);
          currentTotalSize += file.size;
        } else {
           // This case should technically be caught by the initial count check, but good failsafe
           console.warn("File count limit reached during iteration, skipping:", file.name);
           validationError = true;
        }
      }
    }

    if (filesToAdd.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...filesToAdd]);
    }

    // Clear the input value to allow selecting the same file again if removed
    if (event.target) {
      event.target.value = '';
    }
  }, [selectedFiles, maxFiles, maxTotalSizeMB, maxTotalSizeBytes, allowedMimeTypes, toast, totalSelectedSize]); // Added totalSelectedSize dependency

  const handleRemoveFile = useCallback((indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []);

  return {
    selectedFiles,
    setSelectedFiles, // Expose setter for clearing files on submit
    handleFileSelection,
    handleRemoveFile,
    totalSelectedSize,
    totalSelectedSizeMB,
    maxFiles, // Return constants used
    maxTotalSizeMB,
    allowedMimeTypes,
    readFileAsDataURL, // Expose helper if needed externally
  };
}
