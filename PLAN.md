# Plan: Agentic Chat App with Tools, File Handling, and Refactored UI

This document describes the current architecture and features of the chat application built using Vercel's AI SDK, Google Vertex AI (Gemini), and Next.js with Shadcn UI components. The application has been refactored for modularity, maintainability, and adherence to SOLID principles.

**Core Features:**

1.  **AI Chat:** Leverages Gemini Pro via `@ai-sdk/google-vertex` for conversational AI.
2.  **Tool Usage:** Supports AI-driven tools:
    *   `webSearch`: Uses a grounded Gemini Flash model to search the web, resolve source URLs, and return structured results (context, sources).
    *   `displayCode`: Allows the AI to request formatted code block rendering in the UI.
    *   (Placeholders for potential future tools like chemistry visualization, plotting, double-checking).
3.  **File Handling:** Users can attach files (images, text) via the chat input, which are processed by the backend and sent to the model. Attachments are visually indicated by badges on user messages.
4.  **Chat Modes:** Supports different chat modes (defined in `src/config/chat-modes.ts`) that modify the system prompt sent to the AI.
5.  **Message Lifecycle:**
    *   **Display:** Renders messages with dedicated components for text, tool invocations (including loading/error states), and attachments.
    *   **Actions:** Provides actions on messages (hover): Edit (user), Copy (user/assistant), Regenerate (assistant).
    *   **Token Usage:** Displays token count for completed assistant messages.
6.  **Refactored UI:** The frontend (`src/app/chat/page.tsx`) is structured with distinct components for better separation of concerns:
    *   `ChatInput`: Handles user text input and file attachments.
    *   `ChatMessageActions`: Renders action buttons (Edit, Copy, Regenerate).
    *   `MessagePartRenderer`: Handles rendering of different message content types (text, tool invocations).
    *   `AttachmentBadges`: Displays badges for file attachments on user messages.
7.  **Refactored Backend:** The API route (`src/app/api/chat/route.ts`) acts as an orchestrator:
    *   Uses `fileProcessor.ts` to handle incoming files.
    *   Uses `promptHelper.ts` to build the system prompt based on active modes.
    *   Imports and provides tool definitions (`webSearchTool.ts`, `displayCodeTool.ts`) to the AI SDK.
8.  **Utilities:** Includes helper functions for class name merging (`cn`), filename truncation, citation formatting (basic), and URL resolution.

**Mermaid Diagram (Updated):**

```mermaid
graph TD
    subgraph "Browser (Client: Next.js/React)"
        UserInput[User Input Text/Files] --> CI(ChatInput.tsx);
        CI -- onSubmit --> CP(ChatPage: page.tsx);
        CP -- useChat Hook --> API[POST /api/chat];

        subgraph ChatDisplay
            CP -- Renders --> MsgWrapper[Message Wrapper];
            MsgWrapper -- Contains --> Role[Role Indicator];
            MsgWrapper -- Contains --> CMA(ChatMessageActions.tsx);
            MsgWrapper -- Contains --> MPR(MessagePartRenderer.tsx);
            MsgWrapper -- Contains --> AB(AttachmentBadges.tsx);
            MsgWrapper -- Contains --> TU[Token Usage Badge];

            MPR -- Renders --> MD(MemoizedMarkdown.tsx);
            MPR -- Renders --> SR(SearchResult.tsx);
            MPR -- Renders --> CB(CodeBlock.tsx);
            MPR -- Renders --> ToolLoad[Tool Loading/Error States];

            CMA -- User Actions --> CP;
        end

        API -- Stream Response --> CP;
        CP -- Updates State --> ChatDisplay;
    end

    subgraph "Server (Next.js API Route)"
        API --> Route(route.ts);
        Route -- Uses --> FP(fileProcessor.ts);
        Route -- Uses --> PH(promptHelper.ts);
        Route -- Uses --> Tools[Assembled Tools];
        Tools -- Includes --> WST(webSearchTool.ts);
        Tools -- Includes --> DCT(displayCodeTool.ts);

        Route -- streamText --> Vertex[Vertex AI SDK Gemini Pro];
        Vertex -- Tool Calls --> Route;
        Route -- Executes Tool --> WST/DCT;
        WST -- generateText --> VertexFlash[Vertex AI SDK Gemini Flash Grounded];
        WST -- Uses --> Utils(utils.ts - resolveSourceUrls);
        WST/DCT -- Tool Results --> Route;
        Route -- Sends Results --> Vertex;

        Vertex -- Text/Tool Stream --> Route;
        Route -- Streams Data --> API;
    end

    style Vertex fill:#f9f,stroke:#333,stroke-width:2px
    style VertexFlash fill:#fdf,stroke:#333,stroke-width:1px
    style MPR fill:#ccf,stroke:#333,stroke-width:2px
    style Route fill:#cfc,stroke:#333,stroke-width:2px
