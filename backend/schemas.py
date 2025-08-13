from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Persona schemas
class PersonaBase(BaseModel):
    name: str
    description: str
    profession: Optional[str] = None
    nationality: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None

class PersonaResponse(PersonaBase):
    id: int
    slug: str
    image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Chat message schemas
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Chat session schemas
class ChatSessionBase(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSessionResponse(ChatSessionBase):
    id: int
    persona: PersonaResponse
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionWithMessages(ChatSessionResponse):
    messages: List[ChatMessageResponse]

# Simple chat response for college project
class SimpleChatResponse(BaseModel):
    session_id: int
    user_message: str
    ai_response: str
    persona_name: str
