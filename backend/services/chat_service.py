"""
Chat Service with Groq API Integration
Generates emotion-aware responses using LLM
"""
import os
from groq import Groq
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# Initialize Groq client
_groq_client = None


def get_groq_client():
    """Get or create Groq client"""
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def get_emotion_system_prompt(emotion: str, confidence: float, user_name: str = None, support_style: str = None) -> str:
    """
    Generate emotion-aware system prompt
    Adjusts response style based on detected emotion
    """
    style_instruction = ""
    if support_style == "Extra Empathetic":
        style_instruction = "Be exceptionally deeply empathetic and gentle. "
    elif support_style == "Direct":
        style_instruction = "Be direct, concise, and straight to the point. "
    elif support_style == "Professional":
        style_instruction = "Maintain a formal, professional, and courteous tone at all times. "
        
    name_instruction = f" The user's name is {user_name}. Use their name occasionally to be personal." if user_name else ""

    base_prompt = f"""You are an empathetic and emotionally intelligent AI assistant.{name_instruction}
You understand and respond to users' emotional states with appropriate tone and support. {style_instruction}
Keep responses concise, warm, and helpful. Never mention that you detected their emotion explicitly."""

    emotion_prompts = {
        "joy": """The user seems happy and positive. Match their energy with enthusiasm. 
Celebrate their good mood, be upbeat, and use positive reinforcement. 
Feel free to be playful and encouraging.""",

        "sadness": """The user seems to be feeling down or sad. 
Respond with warmth, empathy, and gentle support. 
Acknowledge their feelings, offer comfort, and be patient. 
Use a soft, caring tone without being patronizing.""",

        "anger": """The user seems frustrated or upset. 
Stay calm and don't escalate. Be respectful and solution-focused.
Validate their frustration while gently guiding toward resolution.
Avoid dismissive language. Show you're listening.""",

        "fear": """The user seems anxious or worried. 
Provide reassurance and calm energy. Be supportive and grounding.
Offer practical help if possible. Use steady, confident language 
that builds trust without minimizing their concerns.""",

        "surprise": """The user seems surprised or caught off guard. 
Be curious and engaged. Help them process the unexpected.
Provide clear information and context if needed.
Match their energy while staying helpful.""",

        "neutral": """The user seems in a neutral emotional state. 
Be informative, clear, and helpful. Focus on being useful
and providing value. Maintain a friendly, professional tone.""",

        "disgust": """The user seems put off or uncomfortable about something.
Be understanding and non-judgmental. Acknowledge their reaction
without amplifying negativity. Offer perspective or solutions calmly."""
    }

    emotion_specific = emotion_prompts.get(emotion.lower(), emotion_prompts["neutral"])
    
    confidence_note = ""
    if confidence < 0.5:
        confidence_note = "\nNote: Emotional signals are subtle, so remain adaptable to the conversation flow."
    
    return f"{base_prompt}\n\nCurrent emotional context:\n{emotion_specific}{confidence_note}"


def generate_response(
    user_message: str,
    emotion: str,
    confidence: float,
    conversation_history: List[Dict],
    emotion_summary: str = "",
    user_name: str = None,
    support_style: str = None
) -> str:
    """
    Generate an emotion-aware response using Groq API
    
    Args:
        user_message: The user's current message
        emotion: Detected emotion label
        confidence: Emotion detection confidence
        conversation_history: Previous messages in the conversation
        emotion_summary: Summary of emotions in the conversation
        user_name: Optional user name
        support_style: Optional user support style preference
        
    Returns:
        Generated response string
    """
    try:
        client = get_groq_client()
        
        # Build system prompt
        system_prompt = get_emotion_system_prompt(emotion, confidence, user_name, support_style)
        if emotion_summary:
            system_prompt += f"\n\n{emotion_summary}"
        
        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_message})
        
        # Call Groq API
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise Exception(f"Failed to generate response: {str(e)}")
