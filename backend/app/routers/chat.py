from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import httpx
import re

from app.database import get_db
from app import models, schemas
from app.config import get_settings
from app.agents.rag import retrieve

router = APIRouter(prefix="/chat", tags=["Chat"])
settings = get_settings()

async def call_ollama(prompt: str, max_tokens: int = 1200) -> str:
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
    "temperature": 0.5,
    "num_predict": 700   # reduced from 1200-1800
}
    }
    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        return response.json().get("response", "No response")

@router.post("/", response_model=schemas.ChatResponse)
async def chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    
    # 1. Handle session
    if not request.session_id:
        session = models.Session(
            id=str(uuid.uuid4()),
            title=request.message[:60] if request.message else "New Chat"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session = db.query(models.Session).filter(models.Session.id == request.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        session_id = session.id

    # 2. Save user message
    db.add(models.Message(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=request.message
    ))
    db.commit()

    message_lower = request.message.lower()
    artifact = None
    ai_reply = ""

    # 3. Detect which skill to use
    if any(word in message_lower for word in ["ship30", "ship 30", "essay", "atomic essay"]):
        # === SHIP 30 FOR 30 SKILL ===
        context = retrieve(request.message)
        prompt = f"""You are an expert at writing in the Ship 30 for 30 style.

Write a complete Atomic Essay (around 1100-1300 words) based ONLY on the context below from Lenny's Podcast.

Strict style rules:
- Start with a strong single-sentence hook
- Short paragraphs (1-3 sentences)
- Heavy use of **bold text** and bullet points
- Highly skimmable
- End with a clear, memorable takeaway

Context from Lenny's transcripts:
{context}

Topic / Request: {request.message}

Now write the full essay:"""
        ai_reply = await call_ollama(prompt, max_tokens=1800)

    elif any(word in message_lower for word in ["artifact", "html", "component", "generate ui", "markdown document"]):
        # === ARTIFACT SKILL ===
        context = retrieve(request.message)
        prompt = f"""Generate a clean, complete, ready-to-use HTML + CSS component or Markdown document based on the user request and the context.

Rules:
- Return ONLY the code
- Wrap the final code in triple backticks with the language (html or markdown)
- Make it look modern and clean

Context:
{context}

User request: {request.message}"""
        ai_reply = await call_ollama(prompt, max_tokens=1500)

        # Try to extract the artifact
        match = re.search(r"```(?:html|markdown|md)?\s*(.*?)```", ai_reply, re.DOTALL)
        if match:
            artifact = match.group(1).strip()

    else:
        # === NORMAL RAG Q&A ===
        context = retrieve(request.message)
        prompt = f"""You are the Lenny Growth Assistant.
Answer the question STRICTLY and ONLY using the context provided from Lenny's Podcast transcripts.
If the answer is not in the context, clearly say: "I don't have that specific information in the loaded Lenny transcripts."

Context from Lenny:
{context}

Question: {request.message}

Answer:"""
        ai_reply = await call_ollama(prompt)

    # 4. Save AI reply
    db.add(models.Message(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="assistant",
        content=ai_reply
    ))
    db.commit()

    return {
        "session_id": session_id,
        "reply": ai_reply,
        "artifact": artifact
    }