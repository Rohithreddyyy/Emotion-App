"""
FastAPI Main Application
Emotion-Aware Conversational Chatbot Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging
import sys

# Add parent to path for imports
sys.path.insert(0, ".")

from dotenv import load_dotenv
load_dotenv()

from models.schemas import (
    EmotionDetectionRequest,
    EmotionDetectionResponse,
    ChatRequest,
    ChatResponse,
    ChatSession,
    ChatListResponse,
    NewChatResponse,
    Message
)
from services.emotion_service import detect_emotion, get_emotion_emoji, preload_model
from services.memory_service import (
    create_chat,
    get_chat,
    get_all_chats,
    delete_chat,
    add_message,
    get_conversation_history,
    get_emotion_summary
)
from services.chat_service import generate_response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Emotion-Aware Chatbot API",
    description="A chatbot that detects emotions and responds empathetically",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Pre-load the emotion model on startup"""
    logger.info("Starting up... Loading emotion model")
    try:
        preload_model()
        logger.info("Emotion model loaded successfully")
    except Exception as e:
        logger.warning(f"Could not preload model: {e}. Will load on first request.")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Emotion-Aware Chatbot API"}


@app.post("/detect-emotion", response_model=EmotionDetectionResponse)
async def detect_emotion_endpoint(request: EmotionDetectionRequest):
    """
    Detect emotion from text
    
    Returns emotion label and confidence score
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        result = detect_emotion(request.text)
        return EmotionDetectionResponse(**result)
    except Exception as e:
        logger.error(f"Error in emotion detection: {e}")
        raise HTTPException(status_code=500, detail="Emotion detection failed")


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Send a message and get an emotion-aware response
    
    - Detects emotion in user message
    - Generates context-aware response using Groq
    - Stores messages in conversation history
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Check if chat exists
    chat = get_chat(request.chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    try:
        # Step 1: Detect emotion
        emotion_result = detect_emotion(request.message)
        emotion_label = emotion_result["emotion_label"]
        confidence = emotion_result["confidence_score"]
        
        # Step 2: Get conversation history
        history = get_conversation_history(request.chat_id)
        emotion_summary = get_emotion_summary(request.chat_id)
        
        # Step 3: Generate response
        response_text = generate_response(
            user_message=request.message,
            emotion=emotion_label,
            confidence=confidence,
            conversation_history=history,
            emotion_summary=emotion_summary,
            user_name=request.user_name,
            support_style=request.support_style
        )
        
        # Step 4: Create message objects
        now = datetime.now()
        
        user_message = Message(
            role="user",
            content=request.message,
            emotion=emotion_label,
            confidence=confidence,
            timestamp=now
        )
        
        assistant_message = Message(
            role="assistant",
            content=response_text,
            emotion=emotion_label,  # Store detected emotion with assistant response
            confidence=confidence,
            timestamp=datetime.now()
        )
        
        # Step 5: Store messages
        add_message(request.chat_id, user_message)
        add_message(request.chat_id, assistant_message)
        
        # Return response
        return ChatResponse(
            chat_id=request.chat_id,
            user_message=user_message,
            assistant_message=assistant_message,
            detected_emotion=EmotionDetectionResponse(
                emotion_label=emotion_label,
                confidence_score=confidence
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/chats", response_model=ChatListResponse)
async def get_chats_endpoint():
    """Get all chat sessions"""
    chats = get_all_chats()
    return ChatListResponse(chats=chats)


@app.get("/chat/{chat_id}", response_model=ChatSession)
async def get_chat_endpoint(chat_id: str):
    """Get a specific chat with all messages"""
    chat = get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@app.delete("/chat/{chat_id}")
async def delete_chat_endpoint(chat_id: str):
    """Delete a chat session"""
    success = delete_chat(chat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat deleted successfully"}


@app.post("/new-chat", response_model=NewChatResponse)
async def new_chat_endpoint():
    """Create a new chat session"""
    chat = create_chat()
    return NewChatResponse(
        chat_id=chat.chat_id,
        title=chat.title,
        created_at=chat.created_at
    )

@app.get("/evaluation")
async def get_evaluation_metrics():
    """Get model evaluation metrics (ML vs DL vs BERT)"""
    import os
    import json
    
    file_path = os.path.join(os.path.dirname(__file__), "data", "evaluation_metrics.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Evaluation metrics not found. Run the evaluation script first.")
        
    with open(file_path, "r") as f:
        metrics = json.load(f)
        
    return metrics


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

