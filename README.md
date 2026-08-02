# Lenny Growth Assistant

AI chat assistant grounded in **Lenny's Podcast** transcripts. Ask product and growth questions, generate **Ship30 for 30** atomic essays, and build **HTML/Markdown artifacts** — with session history and a dedicated artifact viewer.

## Features

- **RAG Q&A** — ChromaDB + Ollama embeddings over bundled transcripts
- **Skills** — Normal chat, Ship30 essay mode, artifact generation (keyword-routed)
- **Sessions** — SQLite (default) or Postgres/Supabase via `DATABASE_URL`
- **LLM providers** — Ollama (local), OpenAI, or Anthropic via `LLM_PROVIDER`
- **UI** — React chat with sidebar history, delete session, wide artifact panel

## Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **Ollama** running locally with:
  - `qwen2.5:3b` (or your chosen chat model)
  - `nomic-embed-text` (embeddings for RAG)

## Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env if needed (defaults: sqlite + ollama)

uvicorn app.main:app --reload --port 8000
```

Verify: [http://127.0.0.1:8000/](http://127.0.0.1:8000/) should return JSON with `llm_provider` and `database`.

### 2. Vector index (first time)

If `chroma_db` is missing, run your indexing script or `test_rag.py` as documented in your setup to embed `data/` transcripts into Chroma.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Optional: point at a remote API:

```bash
# frontend/.env.local
VITE_API_URL=http://127.0.0.1:8000
```

## Configuration

See `backend/.env.example`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `sqlite:///./lenny.db` or Postgres/Supabase URL |
| `LLM_PROVIDER` | `ollama` \| `openai` \| `anthropic` |
| `OLLAMA_MODEL` | Chat model name |
| `OLLAMA_BASE_URL` | Ollama API base |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | When using OpenAI |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | When using Anthropic |

**Note:** RAG embeddings still use Ollama (`nomic-embed-text`) in the current implementation.

### Switching to Supabase (Postgres)

1. Create a project in Supabase and copy the **connection pooler** URI.
2. Set `DATABASE_URL=postgresql://...` in `backend/.env`.
3. Restart the API — tables are created on startup via SQLAlchemy `create_all`.

### Switching LLM provider

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Restart the backend. The frontend footer shows the active provider from `GET /`.

## Try it

| Intent | Example prompt |
|--------|----------------|
| RAG Q&A | "What do Lenny's guests say about product-market fit?" |
| Ship30 essay | "Write a Ship30 atomic essay on retention loops" |
| Artifact | "Generate an HTML artifact: simple growth metrics dashboard" |

Use the sidebar to reopen chats or delete them. Click **View artifact** on messages that produced code.

## API overview

- `GET /sessions/` — list chats
- `GET /sessions/{id}` — messages + artifacts
- `DELETE /sessions/{id}` — delete chat
- `POST /chat/` — `{ "session_id": null | "uuid", "message": "..." }`

Interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Documentation

- [docs/PRD.md](docs/PRD.md) — product requirements
- [docs/architecture.md](docs/architecture.md) — system design
- [docs/design.md](docs/design.md) — UX and UI decisions

## Project structure

```
backend/app/     FastAPI, RAG, LLM service, routers
frontend/src/    React UI (Vite + Tailwind)
data/            Podcast transcript markdown
docs/            PRD, architecture, design
```

## License

MIT (or your preferred license — update as needed).
