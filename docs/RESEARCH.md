# External research used for the rebuild

## React + Vite
Vite's current guide recommends a modern Vite-based frontend and lists React as a first-class template. The implementation therefore uses a dedicated React/Vite app rather than server-rendered pages.

## Express
Express 5 is used as the backend HTTP layer. Its middleware/routing model fits the separation used here: authentication, validation, routing, controllers, and error handling are distinct layers.

## Prisma + PostgreSQL
Prisma's current documentation describes the Prisma schema as the main database configuration/model file and Prisma Migrate as the mechanism for maintaining schema history. PostgreSQL is used for relational ownership and document history.

## Gemini
Google's current Gemini documentation recommends the `@google/genai` SDK for JavaScript/TypeScript. Structured output is used for job extraction, candidate extraction, suggestions, and document generation so downstream code receives predictable JSON rather than free-form model text.

The URL Context tool is used only for public HTTP(S) job URLs. The official docs note that URLs must be publicly accessible and that localhost/private-network/tunneling URLs are unsupported; this constraint is surfaced in the UI and validated on the server.

## PDF export
The architecture keeps PDF export behind an infrastructure boundary so the renderer can be swapped without touching document-generation logic. The current implementation uses Playwright as the browser renderer.

## Why the design differs from the supplied brief
The supplied brief originally suggested Python + Streamlit/Gradio and a small folder structure. The requested implementation explicitly asks for React + Node.js, separate frontend/server/API concerns, Prisma-backed schema, authentication, uploads, templates, analysis, suggestions, generation, responsive UX, and maintainable bug isolation. This repository therefore keeps the original product flow but expands the engineering structure to match the new scope.
