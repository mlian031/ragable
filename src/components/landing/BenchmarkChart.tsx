"use client"; // Add this directive

import * as React from "react"
// Add Cell to the import
import { Bar, BarChart, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Define the structure for processed data points
// 'best' should be number here, as nulls are filtered out by processBenchmarkData
// Define the structure for processed data points for stacked bar
interface BenchmarkDataPoint {
  model: string;       // Model name
  score: number;       // The total score (item.best)
  base: number;        // The portion to be dotted (maxOtherScore for Gemini, score for others)
  diff: number;        // The solid yellow portion (score - base for Gemini, 0 for others)
  labelValue: string;  // Formatted total score
  isGemini: boolean;   // Flag for easier styling
}

// Helper function to process raw data for stacked bar
function processBenchmarkData(rawData: Array<{ model: string; best: number | null }>): BenchmarkDataPoint[] {
  // Filter out nulls first to simplify max calculation
  const validData = rawData.filter(item => item.best !== null) as Array<{ model: string; best: number }>;

  // Find the highest score among non-Gemini models in this specific dataset
  const maxOtherScore = Math.max(0, ...validData
    .filter(item => item.model !== 'Gemini 2.5 Pro (03-25)')
    .map(item => item.best)
  );

  const processed = validData.map(item => {
    const score = item.best;
    const isGemini = item.model === 'Gemini 2.5 Pro (03-25)';
    let base = 0;
    let diff = 0;

    if (isGemini && score > maxOtherScore) {
      // If Gemini is better than the best 'other', split the bar
      base = maxOtherScore;
      diff = score - maxOtherScore;
    } else {
      // Otherwise, the whole bar is the 'base' (dotted)
      base = score;
      diff = 0;
    }

    return {
      model: item.model,
      score: score, // Keep total score
      base: base,   // Dotted part
      diff: diff,   // Solid part (only for Gemini if it's higher)
      labelValue: score.toFixed(1), // Label shows total score
      isGemini: isGemini,
    };
  });

  // Sort data so Gemini appears first if needed, or maintain original order
  // (Current implementation maintains original order relative to filtered list)
  return processed;
}

// --- Raw Data Extraction from CSV ---
// Model Abbreviations based on CSV Header:
// Gemini 2.5 Pro (03-25): Gemini 2.5 Pro (03-25)
// O3mini: OpenAI o3-mini
// GPT4.5: OpenAI GPT-4.5
// C3.7S: Claude 3.7 Sonnet
// Grok3B: Grok 3 Beta
// DSR1: DeepSeek R1

// Data for the 3 requested charts, parsed from public/Benchmark_Comparison_Table.csv
const gpqaDataRaw = [
  { model: 'Gemini 2.5 Pro (03-25)', best: 84.0 },
  { model: 'o3-mini', best: 79.7 },
  { model: 'gpt 4.5', best: 71.4 },
  { model: 'Claude 3.7 Sonnet', best: 78.2 }, // Note: CSV has single value here
  { model: 'Grok 3 Beta', best: 80.2 }, // Note: CSV has single value here
  { model: 'Deepseek R1', best: 71.5 },
];

const aime2024DataRaw = [
  { model: 'Gemini 2.5 Pro (03-25)', best: 92.0 },
  { model: 'o3-mini', best: 87.3 },
  { model: 'gpt 4.5', best: 36.7 }, // Empty cell in CSV
  { model: 'Claude 3.7 Sonnet', best: 61.3 },
  { model: 'Grok 3 Beta', best: 83.9 },
  { model: 'Deepseek R1', best: 79.8 }, // Corrected value from CSV
];

const mrcr128kDataRaw = [
  { model: 'Gemini 2.5 Pro (03-25)', best: 94.5 },
  { model: 'o3-mini', best: 61.4 },
  { model: 'gpt 4.5', best: 64.0 },
  { model: 'Claude 3.7 Sonnet', best: null }, // Empty cell
  { model: 'Grok 3 Beta', best: null }, // Empty cell
  { model: 'Deepseek R1', best: null }, // Empty cell
];


// --- Processed Data ---
const gpqaData = processBenchmarkData(gpqaDataRaw);
const aime2024Data = processBenchmarkData(aime2024DataRaw);
const mrcr128kData = processBenchmarkData(mrcr128kDataRaw);


// --- Chart Configuration ---
const chartConfig = {
  score: { label: "Score" },
  base: { label: "Base Score" }, // Dotted part
  diff: { label: "Difference", color: "#FFD700" }, // Solid yellow part for Gemini lead
  // Model-specific colors (used for dot pattern)
  "Gemini 2.5 Pro (03-25)": { color: "#FFD700" },
  "o3-mini": { color: "hsl(var(--muted-foreground))" }, // Use muted color variable
  "gpt 4.5": { color: "hsl(var(--muted-foreground))" },
  "Claude 3.7 Sonnet": { color: "hsl(var(--muted-foreground))" },
  "Grok 3 Beta": { color: "hsl(var(--muted-foreground))" },
  "Deepseek R1": { color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig

// --- Reusable Chart Component ---
interface BenchmarkCategoryChartProps {
  title: string;
  subtitle?: string; // Add subtitle prop
  description?: string; // Keep description if needed elsewhere, though not used currently
  data: BenchmarkDataPoint[];
  className?: string;
}

function BenchmarkCategoryChart({ title, subtitle, description, data, className }: BenchmarkCategoryChartProps) {
  // No need for separate color/class functions anymore

  return (
    // Wrap SVG and Card in a React Fragment
    <>
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}>
        <defs>
          <pattern id="pattern-dots" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="1.5" height="1.5" x="1.75" y="1.75" fill="currentColor"></rect>
          </pattern>
        </defs>
      </svg>
      <Card className={cn("flex flex-col", className)}>
        <CardHeader className="items-center pb-0 text-center"> {/* Center align header content */}
          <CardTitle>{title}</CardTitle>
          {/* Render subtitle if provided */}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {/* Remove description rendering for now, can be added back if needed */}
        {/* {description && <CardDescription>{description}</CardDescription>} */}
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-2"> {/* Add slight top padding to content */}
        <ChartContainer
          config={chartConfig}
           className="mx-auto aspect-square max-h-[300px]" // Adjust aspect ratio and height
         >
           {/* SVG definitions moved outside ChartContainer */}
           <ResponsiveContainer width="100%" height="100%">
             <BarChart
               data={data}
              layout="vertical" // Changed to vertical to better match example image style
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }} // Increased right margin for labels
              barCategoryGap="20%" // Add gap between bars
            >
              <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" />
              {/* Update XAxis dataKey to use the total score */}
              <XAxis type="number" dataKey="score" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="model"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={60} // Adjust width for model names if needed
                interval={0} // Ensure all labels are shown
                // tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" labelFormatter={(value, payload) => {
                  // Tooltip shows the total score
                  const point = payload?.[0]?.payload as BenchmarkDataPoint | undefined;
                  return point ? `${point.model}: ${point.score.toFixed(1)}` : value; // Use point.score
                }} />}
              />
              {/* Stacked Bars: Base (dotted) + Diff (solid yellow for Gemini) */}
              {/* Base Score Part (Dotted) */}
              <Bar dataKey="base" stackId="a" radius={4} stroke="#666" strokeWidth={1}>
                 {data.map((entry, index) => {
                   // Determine dot color based on model
                   const dotColor = entry.isGemini
                     ? chartConfig['Gemini 2.5 Pro (03-25)'].color // Yellow dots for Gemini base
                     : chartConfig['o3-mini'].color; // Muted grey dots for others (using o3-mini as representative)
                   return (
                     <Cell
                       key={`cell-base-${index}`}
                       fill="url(#pattern-dots)"
                       style={{ color: dotColor }} // Apply dot color via style
                       // Radius and stroke are on the Bar element
                     />
                   );
                 })}
              </Bar>
              {/* Difference Part (Solid Yellow for Gemini Lead) */}
              <Bar dataKey="diff" stackId="a" fill={chartConfig.diff.color} radius={4} stroke="#666" strokeWidth={1}>
                 {/* No individual cells needed here, the bar color is uniform */}
                 {/* LabelList attached to the top segment (diff) or base if diff is 0 */}
                 <LabelList
                   dataKey="labelValue" // Display the total score (already calculated)
                   position="right"
                   offset={8}
                    className="fill-foreground"
                  fontSize={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
       </ChartContainer>
     </CardContent>
   </Card>
   </> // Close React Fragment
  )
}


// --- Main Benchmark Chart Component ---
export function BenchmarkChart() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="">
        <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl text-left mb-8 md:mb-12 lg:mb-16">
          Base Model Benchmarks
        </h2>
        <p className="text-left text-muted-foreground max-w-3xl mb-8">
          Benchmark performance across key reasoning tasks. Ragable further augments Google Deepmind's <span className="font-medium text-primary">Gemini 2.5 Pro</span> with specialized tools and a <span className="font-medium text-primary">vast resource base</span>, enhancing its capabilities <span className="font-medium text-primary">beyond these benchmarks</span>.
        </p>
      </div>
       {/* Updated grid to show only 3 charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
         {/* Render the 3 specified benchmark charts with subtitles */}
         <BenchmarkCategoryChart title="GPQA diamond" subtitle="Graduate-level Q&A" data={gpqaData} />
         <BenchmarkCategoryChart title="AIME 2024" subtitle="Math competition problems" data={aime2024Data} />
         <BenchmarkCategoryChart title="MRCR (128k avg)" subtitle="Long context comprehension" data={mrcr128kData} />
      </div>
    </section>
  );
}

export default BenchmarkChart;
