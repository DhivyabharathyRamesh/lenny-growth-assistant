from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --------- Message ---------
class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageOut(MessageBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --------- Session ---------
class SessionBase(BaseModel):
    title: str = "New Chat"

class SessionCreate(SessionBase):
    pass

class SessionOut(SessionBase):
    id: str
    created_at: datetime
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True

# --------- Chat ---------
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    artifact: Optional[str] = None