from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base, run_sqlite_migrations
from app.routers import sessions, chat

settings = get_settings()

# Create tables in database
Base.metadata.create_all(bind=engine)
run_sqlite_migrations()

app = FastAPI(
    title="Lenny Growth Assistant",
    description="AI-powered assistant based on Lenny's Podcast transcripts",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router)
app.include_router(chat.router)

@app.get("/")
def root():
    settings = get_settings()
    return {
        "message": "Lenny Growth Assistant API is running",
        "llm_provider": settings.LLM_PROVIDER,
        "model": (
            settings.OLLAMA_MODEL
            if settings.LLM_PROVIDER == "ollama"
            else settings.OPENAI_MODEL
            if settings.LLM_PROVIDER == "openai"
            else settings.ANTHROPIC_MODEL
        ),
        "database": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
    }

@app.get("/health")
def health():
    return {"status": "ok"}