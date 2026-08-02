# Product Requirements Document — Lenny Growth Assistant

## Overview

Lenny Growth Assistant is a take-home style AI product that helps founders and product leaders learn from **Lenny's Podcast** transcript corpus. Users chat in a familiar interface, get **grounded answers** (RAG), and can invoke **skills** for structured outputs (essays and artifacts).

## Goals

1. Demonstrate end-to-end product engineering: FastAPI backend, React frontend, persistence, RAG, and multi-skill routing.
2. Keep local development simple (SQLite + Ollama) while supporting production-style options (Postgres/Supabase, cloud LLMs).
3. Deliver a polished chat UX comparable to consumer AI products (session history, artifact viewer).

## Non-goals (for this scope)

- Multi-user auth / billing
- Real-time streaming tokens (nice-to-have later)
- Automated transcript ingestion pipeline in production

## Users

- **Primary:** Reviewers and evaluators running the project locally or on a demo deploy.
- **Secondary:** PMs exploring Lenny's content through Q&A and generated artifacts.

## Core user stories

| ID | Story | Acceptance |
|----|--------|------------|
| U1 | As a user, I ask growth/product questions and get answers grounded in transcripts | Answers cite context; out-of-corpus questions get a clear fallback message |
| U2 | As a user, I request a Ship30-style atomic essay | Essay follows hook / short paragraphs / bold / bullets / takeaway |
| U3 | As a user, I request an HTML or Markdown artifact | Code extracted and shown in a dedicated viewer; preview works in Chrome |
| U4 | As a user, I see past chats and reopen them | Sidebar lists sessions; selecting loads message history |
| U5 | As a user, I delete a chat I no longer need | DELETE removes session and messages; UI updates |
| U6 | As an operator, I switch LLM provider via env | `LLM_PROVIDER=ollama|openai|anthropic` without code changes |
| U7 | As an operator, I switch database via env | SQLite for local; Postgres URL for Supabase |

## Skills (intent routing)

Routing is keyword-based in `POST /chat/` (simple and transparent for a take-home):

1. **Normal Q&A** — default; RAG retrieval + strict context-only answer prompt.
2. **Ship30 for 30** — triggers on "ship30", "essay", "atomic essay", etc.
3. **Artifact** — triggers on "artifact", "html", "component", etc.; extracts fenced code block.

## Success metrics (demo / evaluation)

- Session CRUD works reliably across refresh.
- RAG returns relevant chunks for known topics in the bundled transcripts.
- Artifact viewer renders HTML in an sandboxed iframe with stable layout in Chrome.
- README allows a new developer to run the stack in under 15 minutes.

## Future enhancements

- Streaming responses (SSE/WebSocket)
- Semantic skill router instead of keywords
- Persist artifact type (html vs markdown) explicitly
- User accounts and shared sessions
