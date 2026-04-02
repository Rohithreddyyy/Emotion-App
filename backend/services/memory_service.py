"""
Conversation Memory Service
In-memory storage for chat sessions and messages
"""
from datetime import datetime
from typing import Dict, List, Optional
from models.schemas import ChatSession, Message
import uuid

# In-memory storage
_chat_sessions: Dict[str, ChatSession] = {}


def create_chat() -> ChatSession:
    """Create a new chat session"""
    chat_id = str(uuid.uuid4())
    now = datetime.now()
    
    chat = ChatSession(
        chat_id=chat_id,
        title="New Chat",
        created_at=now,
        updated_at=now,
        messages=[]
    )
    
    _chat_sessions[chat_id] = chat
    return chat


def get_chat(chat_id: str) -> Optional[ChatSession]:
    """Get a chat session by ID"""
    return _chat_sessions.get(chat_id)


def get_all_chats() -> List[ChatSession]:
    """Get all chat sessions, sorted by updated_at descending"""
    chats = list(_chat_sessions.values())
    return sorted(chats, key=lambda x: x.updated_at, reverse=True)


def delete_chat(chat_id: str) -> bool:
    """Delete a chat session"""
    if chat_id in _chat_sessions:
        del _chat_sessions[chat_id]
        return True
    return False


def add_message(chat_id: str, message: Message) -> bool:
    """Add a message to a chat session"""
    chat = _chat_sessions.get(chat_id)
    if chat:
        chat.messages.append(message)
        chat.updated_at = datetime.now()
        
        # Update title based on first user message
        if len(chat.messages) == 1 and message.role == "user":
            # Truncate to first 30 chars for title
            title = message.content[:30]
            if len(message.content) > 30:
                title += "..."
            chat.title = title
        
        return True
    return False


def get_conversation_history(chat_id: str, max_turns: int = 10) -> List[Dict]:
    """
    Get conversation history for Groq API
    Returns last N turns in the format expected by LLM
    """
    chat = _chat_sessions.get(chat_id)
    if not chat:
        return []
    
    # Get last N*2 messages (each turn = user + assistant)
    messages = chat.messages[-(max_turns * 2):]
    
    history = []
    for msg in messages:
        history.append({
            "role": msg.role,
            "content": msg.content
        })
    
    return history


def get_emotion_summary(chat_id: str) -> str:
    """Get a summary of emotions detected in the conversation"""
    chat = _chat_sessions.get(chat_id)
    if not chat:
        return ""
    
    emotions = []
    for msg in chat.messages:
        if msg.emotion:
            emotions.append(msg.emotion)
    
    if not emotions:
        return ""
    
    # Count emotions
    emotion_counts = {}
    for e in emotions:
        emotion_counts[e] = emotion_counts.get(e, 0) + 1
    
    # Format summary
    summary_parts = [f"{e}: {c}" for e, c in emotion_counts.items()]
    return f"Emotion history: {', '.join(summary_parts)}"
