# Plan: Agentic Chat App with Search Grounding & Citations

This plan outlines the steps to build a chat application using Vercel's AI SDK, Google Vertex AI (Gemini), and Next.js, featuring search grounding and citation formatting with Shadcn UI components.

**Assumptions:**

1.  **Project Integration:** Build within the existing Next.js project at `/Users/mikeliang/Documents/ragable-v2`.
2.  **Initial Model:** Start with `gemini-2.0-flash-001`.
3.  **Authentication:** Use `google-credentials.json` via the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
4.  **Runtime:** Standard Node.js backend environment.
5.  **Dependencies:** Shadcn UI components are already set up or can be added using the Shadcn CLI.

**Detailed Plan:**

1.  **Environment Setup & Dependencies:**
    *   Create or update a `.env.local` file in the project root (`/Users/mikeliang/Documents/ragable-v2`) with Google Cloud credentials:
        ```.env.local
        GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json # Adjust path if needed
        GOOGLE_VERTEX_PROJECT=your-gcp-project-id
        GOOGLE_VERTEX_LOCATION=your-vertex-region # e.g., us-central1
        ```
    *   Install required packages using pnpm:
        ```bash
        pnpm add @ai-sdk/google-vertex @ai-sdk/react ai react-markdown marked
        # Consider adding later for robust citation formatting:
        # pnpm add citation-js
        ```

2.  **Backend API Route (`src/app/api/chat/route.ts`):**
    *   Create the file `src/app/api/chat/route.ts`.
    *   Implement the API route handler:
        *   Import `streamText`, `CoreMessage`, `GoogleGenerativeAIProviderMetadata`.
        *   Import `vertex` from `@ai-sdk/google-vertex`.
        *   Initialize the Vertex model with search grounding enabled: `vertex('gemini-2.0-flash-001', { useSearchGrounding: true })`.
        *   Enable data streaming: `experimental_streamData: true`.
        *   Use `result.toDataStream({ onFinal(...) })` to pipe grounding metadata (`result.providerMetadata?.google?.groundingMetadata`) into the data stream.

3.  **Memoized Markdown Component (`src/components/memoized-markdown.tsx`):**
    *   Create the file `src/components/memoized-markdown.tsx`.
    *   Implement the memoized Markdown component using `react-markdown` and `marked` based on the Vercel AI SDK cookbook recipe ([Markdown Chatbot with Memoization](https://sdk.vercel.ai/cookbook/next/markdown-chatbot-with-memoization)).

4.  **Source Display & Citation Component (`src/components/SourceDisplay.tsx`):**
    *   Create the file `src/components/SourceDisplay.tsx`.
    *   Define the component structure:
        *   Accept `groundingMetadata` as a prop.
        *   Use `useState` to manage the selected citation style (`'mla'`, `'apa'`, `'chicago'`).
        *   Use Shadcn UI components: `Card`, `Select` (with `SelectTrigger`, `SelectContent`, `SelectItem`).
        *   Render relevant data from `groundingMetadata`.
        *   Implement basic citation formatting logic (can be enhanced later).

5.  **Frontend Chat Interface (`src/app/page.tsx`):**
    *   Update `src/app/page.tsx`.
    *   Import and use the `useChat` hook from `@ai-sdk/react`, pointing to `/api/chat`.
    *   Import `MemoizedMarkdown` and `SourceDisplay`.
    *   Modify the message rendering loop:
        *   Use `MemoizedMarkdown` for `message.content`.
        *   Check if `message.role === 'assistant'` and `message.data?.groundingMetadata` exists.
        *   If metadata is present, render `<SourceDisplay groundingMetadata={message.data.groundingMetadata} />`.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Browser
        A[User Input] --> B(page.tsx);
        B -- useChat Hook --> C[POST /api/chat];
        B -- Renders Chat --> D[Messages List];
        D -- Renders Content --> E(memoized-markdown.tsx);
        D -- Renders Sources --> F(SourceDisplay.tsx);
        F -- Uses --> G[Shadcn Card, Select, etc.];
        F -- Contains --> H{Citation Formatting Logic};
        G -- User Selects Style --> F;
    end

    subgraph Server
        C --> I(route.ts);
        I -- streamText --> J[Vertex Model (useSearchGrounding: true)];
        J -- Text Stream --> I;
        J -- Grounding Metadata --> I;
        I -- experimental_streamData --> C;
    end

    style J fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#ccf,stroke:#333,stroke-width:2px