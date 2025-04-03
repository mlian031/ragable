'use client'; // Required for useEffect, useRef

import React, { useEffect, useRef } from 'react';
import functionPlot, { type FunctionPlotOptions, type FunctionPlotDatum } from 'function-plot'; // Import FunctionPlotDatum
import type { DisplayPlotArgs } from '@/lib/tools/displayPlotTool'; // Import the args type

interface PlotDisplayProps {
  args: DisplayPlotArgs; // Expect the validated arguments from the tool
}

/**
 * Renders a function plot using the function-plot library based on
 * arguments provided by the displayPlotTool.
 */
export const PlotDisplay: React.FC<PlotDisplayProps> = React.memo(({ args }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if plotRef is available and args.data is a non-empty array
    if (plotRef.current && args.data && args.data.length > 0) {
      // Construct function-plot options from the multi-function args
      const options: FunctionPlotOptions = {
        target: plotRef.current, // Target the div element
        title: args.title, // Use the optional title
        // Let function-plot handle grid, axes, etc. by default for simplicity
        data: args.data.map(funcData => {
          // Explicitly create the datum object expected by function-plot
          const datum: FunctionPlotDatum = {
            fn: funcData.fn,
            // Only include range if it exists and is valid (Zod already validated length/order)
            range: funcData.range as [number, number] | undefined, // Cast to tuple type
            closed: funcData.closed,
            color: funcData.color,
            graphType: funcData.graphType,
          };
          // Remove undefined properties to avoid potential issues with function-plot
          Object.keys(datum).forEach(key => datum[key as keyof FunctionPlotDatum] === undefined && delete datum[key as keyof FunctionPlotDatum]);
          return datum;
        }),
      };

      try {
        console.log('[PlotDisplay] Rendering plot with options:', options);
        functionPlot(options);
      } catch (error) {
        console.error('[PlotDisplay] Error rendering function plot:', error);
        // Optionally display an error message in the plot div
        if (plotRef.current) {
          plotRef.current.innerHTML = `<p style="color: red; padding: 10px;">Error rendering plot. Check console.</p>`;
        }
      }
    }

    // Cleanup function (optional, function-plot might handle its own cleanup)
    // return () => {
    //   if (plotRef.current) {
    //     // functionPlot might offer a destroy method, or just clear the div
    //     plotRef.current.innerHTML = '';
    //   }
    // };
  }, [args]); // Re-render if the arguments change

  // Apply some basic styling to ensure the div has dimensions
  // You might want to adjust this or use Tailwind classes
  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '350px', // Default height used by function-plot if not specified
    marginBottom: '1rem', // Add some space below the plot
  };

  return <div ref={plotRef} style={containerStyle} />;
});

// Add display name for better debugging
PlotDisplay.displayName = 'PlotDisplay';
