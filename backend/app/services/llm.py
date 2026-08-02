"""Unified text generation across Ollama, OpenAI, and Anthropic."""

import httpx
from app.config import get_settings

settings = get_settings()


async def generate_completion(prompt: str, max_tokens: int = 700) -> str:
    provider = (settings.LLM_PROVIDER or "ollama").lower().strip()

    if provider == "ollama":
        return await _ollama(prompt, max_tokens)
    if provider == "openai":
        return await _openai(prompt, max_tokens)
    if provider == "anthropic":
        return await _anthropic(prompt, max_tokens)

    raise ValueError(
        f"Unknown LLM_PROVIDER '{settings.LLM_PROVIDER}'. Use ollama, openai, or anthropic."
    )


async def _ollama(prompt: str, max_tokens: int) -> str:
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.5,
            "num_predict": max_tokens,
        },
    }
    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        return response.json().get("response", "No response")


async def _openai(prompt: str, max_tokens: int) -> str:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    model = settings.OPENAI_MODEL
    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.5,
    )
    return response.choices[0].message.content or ""


async def _anthropic(prompt: str, max_tokens: int) -> str:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic")

    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    model = settings.ANTHROPIC_MODEL
    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    parts = [block.text for block in response.content if block.type == "text"]
    return "\n".join(parts)
