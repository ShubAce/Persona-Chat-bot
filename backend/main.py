from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uvicorn

from database import engine, get_db, Base
from models import Persona, ChatSession, ChatMessage
from ai_service import PersonaChatService

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Persona Chat API - College Project", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = PersonaChatService()

@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Persona Chat API is running! - College Project Version"}

@app.get("/personas")
def get_personas(db: Session = Depends(get_db)):
    """Get all available personas."""
    personas = db.query(Persona).all()
    return personas

@app.get("/personas/{persona_id}")
def get_persona(persona_id: int, db: Session = Depends(get_db)):
    """Get a specific persona by ID."""
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona

@app.get("/chat/sessions")
def get_chat_sessions(db: Session = Depends(get_db)):
    """Get all chat sessions (simplified for college project)."""
    from sqlalchemy.orm import joinedload
    sessions = db.query(ChatSession).options(joinedload(ChatSession.persona)).order_by(ChatSession.created_at.desc()).limit(20).all()
    
    # Convert to proper dict format with timestamp serialization
    sessions_list = []
    for session in sessions:
        session_dict = {
            "id": session.id,
            "persona_id": session.persona_id,
            "title": session.title,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            "persona": {
                "id": session.persona.id,
                "name": session.persona.name,
                "description": session.persona.description,
                "profession": session.persona.profession,
                "nationality": session.persona.nationality,
                "birth_year": session.persona.birth_year,
                "death_year": session.persona.death_year,
                "image_url": session.persona.image_url,
            } if session.persona else None
        }
        sessions_list.append(session_dict)
    
    return sessions_list

@app.get("/chat/sessions/{session_id}")
def get_chat_session(session_id: int, db: Session = Depends(get_db)):
    """Get a specific chat session with messages."""
    from sqlalchemy.orm import joinedload
    session = db.query(ChatSession).options(joinedload(ChatSession.persona), joinedload(ChatSession.messages)).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Convert to dict to ensure proper timestamp serialization
    session_dict = {
        "id": session.id,
        "persona_id": session.persona_id,
        "title": session.title,
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "updated_at": session.updated_at.isoformat() if session.updated_at else None,
        "persona": {
            "id": session.persona.id,
            "name": session.persona.name,
            "description": session.persona.description,
            "profession": session.persona.profession,
            "nationality": session.persona.nationality,
            "birth_year": session.persona.birth_year,
            "death_year": session.persona.death_year,
            "image_url": session.persona.image_url,
        },
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            }
            for msg in session.messages
        ]
    }
    
    return session_dict

@app.post("/chat")
async def chat(persona_id: int = Form(...), 
               message: str = Form(...), 
               session_id: Optional[int] = Form(None),
               db: Session = Depends(get_db)):
    """Send a message and get a response from the persona."""
    # Get persona
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    
    # Get or create chat session
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        # Create new session
        session_title = message[:50] + "..." if len(message) > 50 else message
        session = ChatSession(
            persona_id=persona_id,
            title=session_title
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    
    # Create a common timestamp for both messages to keep them synchronized
    # Use local time instead of UTC to match frontend display
    message_timestamp = datetime.now()
    
    # Save user message with specific timestamp
    user_message = ChatMessage(
        chat_session_id=session.id,
        role="user",
        content=message,
        created_at=message_timestamp
    )
    db.add(user_message)
    db.commit()
    
    # Get chat history
    messages = db.query(ChatMessage).filter(ChatMessage.chat_session_id == session.id).all()
    message_history = [{"role": msg.role, "content": msg.content} for msg in messages[:-1]]
    
    # Generate AI response
    ai_response = await ai_service.generate_response(
        persona.prompt_template,
        message,
        message_history
    )
    
    # Save AI response with the same timestamp as user message
    assistant_message = ChatMessage(
        chat_session_id=session.id,
        role="assistant",
        content=ai_response,
        created_at=message_timestamp
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    
    # Get the user message with its timestamp
    db.refresh(user_message)
    
    return {
        "session_id": session.id,
        "user_message": {
            "id": user_message.id,
            "role": user_message.role,
            "content": user_message.content,
            "created_at": user_message.created_at.isoformat()
        },
        "ai_message": {
            "id": assistant_message.id,
            "role": assistant_message.role,
            "content": assistant_message.content,
            "created_at": assistant_message.created_at.isoformat()
        },
        "persona_name": persona.name
    }

@app.delete("/chat/sessions/{session_id}")
def delete_chat_session(session_id: int, db: Session = Depends(get_db)):
    """Delete a chat session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Delete messages first
    db.query(ChatMessage).filter(ChatMessage.chat_session_id == session_id).delete()
    # Delete session
    db.delete(session)
    db.commit()
    
    return {"message": "Chat session deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
