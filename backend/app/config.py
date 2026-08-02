from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Local dev: sqlite:///./lenny.db  |  Supabase: postgresql://user:pass@host:5432/db
    DATABASE_URL: str = "sqlite:///./lenny.db"
    LLM_PROVIDER: str = "ollama"  # ollama | anthropic | openai
    OLLAMA_MODEL: str = "qwen2.5:3b"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-haiku-latest"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()