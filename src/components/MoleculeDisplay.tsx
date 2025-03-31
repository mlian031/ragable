'use client'; // Required for client-side hooks like useState, useEffect

import React, { useState, useEffect } from 'react'; // Removed useRef
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
// Removed unused lodash import
// import _ from 'lodash';

// Define the props based on the tool's arguments
interface MoleculeDisplayProps {
  smiles: string;
  substructure?: string;
  width?: number;
  height?: number;
  legend?: string;
  options?: Record<string, unknown>; // Use unknown instead of any
  className?: string; // Allow passing additional classes
}

// Define placeholder type for RDKit Mol object
interface RDKitMol {
  is_valid(): boolean;
  get_svg_with_highlights(details: string): string;
  get_substruct_matches(queryMol: RDKitMol): string; // Returns JSON string
  delete(): void;
  // Add other Mol methods if needed
}


// Define the expected type of the RDKit instance based on usage
// This structure might need adjustment based on the actual RDKit API
interface RDKitInstance {
  get_mol(smilesOrMolfile: string, options?: string): RDKitMol | null; // Use RDKitMol type
  get_qmol(smarts: string): RDKitMol | null; // Use RDKitMol type
  // Add other RDKit functions if needed later
}

// Define the type for the init function expected on the window object
declare global {
  interface Window {
    initRDKitModule: (options?: { locateFile: (file: string) => string }) => Promise<RDKitInstance>;
  }
}

// Flag to track if the script is loading or has loaded/failed globally
let rdkitScriptLoadStatus: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
let rdkitInstancePromise: Promise<RDKitInstance> | null = null;

const MoleculeDisplay: React.FC<MoleculeDisplayProps> = ({
  smiles,
  substructure = '', // Default to empty string
  width = 300,
  height = 250,
  legend,
  options = {},
  className = '',
}) => {
  const [rdkit, setRdkit] = useState<RDKitInstance | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until script/instance ready
  const [error, setError] = useState<string | null>(null);
  // Removed unused uniqueId ref
  // const uniqueId = useRef(`molecule-${Math.random().toString(36).substring(2, 15)}`);

  // Effect for loading the RDKit script and initializing the module
  useEffect(() => {
    // Only attempt to load script if it hasn't started or failed
    if (rdkitScriptLoadStatus === 'idle') {
      rdkitScriptLoadStatus = 'loading';
      console.log('[MoleculeDisplay] Loading RDKit script...');

      const script = document.createElement('script');
      script.src = '/chunks/RDKit_minimal.js'; // Path based on next.config.ts copy
      script.async = true;

      script.onload = () => {
        console.log('[MoleculeDisplay] RDKit script loaded.');
        if (typeof window.initRDKitModule === 'function') {
          // Initialize the module and store the promise
          rdkitInstancePromise = window.initRDKitModule({
            locateFile: (file: string) => `/chunks/${file}`, // Path to WASM
          });

          rdkitInstancePromise
            .then((loadedRdkit) => {
              console.log('[MoleculeDisplay] RDKit module initialized successfully.');
              rdkitScriptLoadStatus = 'loaded';
              setRdkit(loadedRdkit); // Set instance for this component
              // Don't set isLoading false here, drawing effect will handle it
            })
            .catch((err) => {
              console.error('[MoleculeDisplay] Error initializing RDKit module:', err);
              setError('Failed to initialize RDKit module.');
              rdkitScriptLoadStatus = 'error';
              setIsLoading(false); // Stop loading on init error
            });
        } else {
          console.error('[MoleculeDisplay] initRDKitModule not found on window object after script load.');
          setError('RDKit initialization function not found.');
          rdkitScriptLoadStatus = 'error';
          setIsLoading(false);
        }
      };

      script.onerror = (err) => {
        console.error('[MoleculeDisplay] Failed to load RDKit script:', err);
        setError('Failed to load RDKit script.');
        rdkitScriptLoadStatus = 'error';
        rdkitInstancePromise = null; // Clear promise on script load error
        setIsLoading(false);
      };

      document.body.appendChild(script);

    } else if (rdkitScriptLoadStatus === 'loaded' && rdkitInstancePromise) {
      // If script already loaded successfully, just get the instance
      console.log('[MoleculeDisplay] RDKit already loaded, getting instance...');
      rdkitInstancePromise
        .then(setRdkit)
        .catch((err) => {
          // Should ideally not happen if status is 'loaded', but handle defensively
          console.error('[MoleculeDisplay] Error retrieving pre-initialized RDKit module:', err);
          setError('Failed to retrieve initialized RDKit module.');
          setIsLoading(false);
        });
    } else if (rdkitScriptLoadStatus === 'error') {
      // If script failed to load previously
      setError('RDKit script failed to load previously.');
      setIsLoading(false);
    } else if (rdkitScriptLoadStatus === 'loading') {
      // If script is still loading (another instance might have initiated)
      // Wait for the global promise to resolve or reject
      console.log('[MoleculeDisplay] RDKit script is loading, waiting...');
      if (rdkitInstancePromise) {
         rdkitInstancePromise
           .then(setRdkit)
           .catch(() => { /* Error handled by the loading instance */ });
      }
    }

    // Cleanup function (optional, might remove script if needed)
    // return () => {
    //   const scriptTag = document.querySelector('script[src="/chunks/RDKit_minimal.js"]');
    //   if (scriptTag) {
    //     // document.body.removeChild(scriptTag); // Be careful with global state if removing
    //   }
    // };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect for drawing the molecule when RDKit instance is ready and props change
  useEffect(() => {
    // Only set loading false *after* RDKit instance is available
    if (rdkit) {
       setIsLoading(false); // RDKit is ready, drawing can proceed (or fail)
    } else if (rdkitScriptLoadStatus === 'loaded' && !rdkit) {
       // This case might happen briefly between promise resolution and state update
       setIsLoading(true);
    } else if (rdkitScriptLoadStatus === 'error') {
       setIsLoading(false); // Ensure loading stops if script failed
       return; // Don't proceed if RDKit failed to load/init
    } else {
       setIsLoading(true); // Still loading RDKit
       return;
    }


    if (!smiles) {
      setError('No SMILES string provided.');
      setSvg(null);
      return; // Don't proceed without SMILES
    }

    // If RDKit is ready and we have SMILES, attempt to draw
    setError(null); // Clear previous drawing errors
    setSvg(null); // Clear previous SVG

    // Add explicit check here to satisfy TypeScript before entering the try block
    if (!rdkit) {
      console.error("[MoleculeDisplay] Drawing attempted before RDKit instance was ready.");
      setError("RDKit instance not available for drawing.");
      return; // Return added for safety, though prior checks should prevent this
     }

     let mol: RDKitMol | null = null; // Add type
     let qmol: RDKitMol | null = null; // Add type

     try {
      console.log(`[MoleculeDisplay] Generating SVG for SMILES: ${smiles}`);
      // Use non-null assertion (!) since we checked rdkit above
      mol = rdkit!.get_mol(smiles);

      if (!mol || !mol.is_valid()) {
         throw new Error(`Invalid SMILES string: ${smiles}`);
       }

       // Use unknown instead of any for the details object
       let details: Record<string, unknown> = {
         width,
         height,
        bondLineWidth: 1,
        addStereoAnnotation: true, // Default RDKit option
        ...(options || {}), // Merge custom options
        ...(legend && { legend: legend }), // Add legend if provided
      };

      // Handle substructure highlighting
      if (substructure) {
         // Use non-null assertion (!) since we checked rdkit above
         qmol = rdkit!.get_qmol(substructure);
         if (qmol && qmol.is_valid()) {
           if (!mol) throw new Error("Molecule object (mol) is unexpectedly null."); // Should be caught by earlier check, but good practice
           const substructMatchJson = mol.get_substruct_matches(qmol);
           if (substructMatchJson) {
             const substructMatches = JSON.parse(substructMatchJson);
             // Define accumulator type explicitly
             type HighlightAccumulator = { atoms: number[]; bonds: number[] };
             if (substructMatches.length > 0) {
               const mergedHighlights = substructMatches.reduce(
                 (acc: HighlightAccumulator, match: HighlightAccumulator) => ({ // Use defined type
                   atoms: [...acc.atoms, ...match.atoms],
                   bonds: [...acc.bonds, ...match.bonds],
                 }),
                { atoms: [], bonds: [] }
              );
              details = { ...details, ...mergedHighlights };
            }
          } else {
             console.warn(`[MoleculeDisplay] Substructure "${substructure}" not found in "${smiles}".`);
          }
        } else {
          console.warn(`[MoleculeDisplay] Invalid substructure SMARTS: ${substructure}`);
        }
      }

      const generatedSvg = mol.get_svg_with_highlights(JSON.stringify(details));
       setSvg(generatedSvg);
       console.log('[MoleculeDisplay] SVG generated successfully.');

     } catch (err: unknown) { // Use unknown for catch variable
       console.error('[MoleculeDisplay] Error generating molecule SVG:', err);
       // Type check the error before accessing properties
       const errorMessage = err instanceof Error ? err.message : 'Failed to generate molecule visualization.';
       setError(errorMessage);
       setSvg(null);
     } finally {
      // IMPORTANT: Always delete C++ objects when done to free memory
      mol?.delete();
      qmol?.delete();
      // Note: isLoading is now primarily controlled by RDKit readiness
     }

   // Dependency array: React to changes in RDKit instance or drawing parameters
   // Added options, removed JSON.stringify
   }, [rdkit, smiles, substructure, width, height, legend, options]);


   // Render loading state while RDKit script/module is loading/initializing
  if (isLoading && rdkitScriptLoadStatus !== 'error') {
    return <Skeleton className={`w-[${width}px] h-[${height}px] ${className}`} />;
  }

  // Render error state if script loading/init failed or drawing failed
  if (error) {
    return (
      <div className={`text-red-500 border border-red-500 p-2 rounded text-xs ${className}`} style={{ width: `${width}px` }}>
        <p><strong>Molecule Render Error:</strong></p>
        <p>{error}</p>
        {smiles && !error.includes(smiles) && <p className="mt-1">Input SMILES: <code className="text-xs bg-red-100 p-0.5 rounded">{smiles}</code></p>}
      </div>
    );
  }

  // Render the SVG if available
  if (svg) {
    return (
      <div
        title={smiles} // Tooltip with SMILES string
        className={`molecule-svg-container ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  // Fallback if no SVG, no error, and not loading (e.g., RDKit loaded but no SMILES yet)
  return <div className={className} style={{ width: `${width}px`, height: `${height}px` }}>Waiting for molecule data...</div>;
};

export default MoleculeDisplay;
