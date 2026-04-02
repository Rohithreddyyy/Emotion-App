"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EmotionLabel(str, Enum):
    JOY = "joy"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    SURPRISE = "surprise"
    NEUTRAL = "neutral"
    DISGUST = "disgust"


class EmotionDetectionRequest(BaseModel):
    text: str


class EmotionDetectionResponse(BaseModel):
    emotion_label: str
    confidence_score: float


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    emotion: Optional[str] = None
    confidence: Optional[float] = None
    timestamp: datetime


class ChatRequest(BaseModel):
    chat_id: str
    message: str
    user_name: Optional[str] = None
    support_style: Optional[str] = None


class ChatResponse(BaseModel):
    chat_id: str
    user_message: Message
    assistant_message: Message
    detected_emotion: EmotionDetectionResponse


class ChatSession(BaseModel):
    chat_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[Message] = []


class ChatListResponse(BaseModel):
    chats: List[ChatSession]


class NewChatResponse(BaseModel):
    chat_id: str
    title: str
    created_at: datetime
