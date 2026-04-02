"""
Emotion Detection Service using DistilRoBERTa
"""
from transformers import pipeline
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

# Emotion classifier singleton
_emotion_classifier = None


def get_emotion_classifier():
    """Get or create the emotion classifier pipeline"""
    global _emotion_classifier
    if _emotion_classifier is None:
        logger.info("Loading emotion classification model...")
        _emotion_classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
            device=-1  # CPU, use 0 for GPU
        )
        logger.info("Emotion model loaded successfully")
    return _emotion_classifier


def detect_emotion(text: str) -> dict:
    """
    Detect emotion from text using BERT-based classifier
    
    Args:
        text: Input text to analyze
        
    Returns:
        dict with emotion_label and confidence_score
    """
    if not text or not text.strip():
        return {
            "emotion_label": "neutral",
            "confidence_score": 1.0
        }
    
    try:
        classifier = get_emotion_classifier()
        results = classifier(text[:512])  # Limit input length
        
        # Get top emotion
        if results and len(results) > 0:
            top_emotion = max(results[0], key=lambda x: x['score'])
            return {
                "emotion_label": top_emotion['label'],
                "confidence_score": round(top_emotion['score'], 4)
            }
    except Exception as e:
        logger.error(f"Error detecting emotion: {e}")
    
    return {
        "emotion_label": "neutral",
        "confidence_score": 0.5
    }


def get_emotion_emoji(emotion: str) -> str:
    """Get emoji for emotion label"""
    emoji_map = {
        "joy": "😊",
        "sadness": "😢",
        "anger": "😠",
        "fear": "😨",
        "surprise": "😲",
        "neutral": "😐",
        "disgust": "🤢"
    }
    return emoji_map.get(emotion.lower(), "😐")


# Pre-load model on import (optional, can be lazy loaded)
def preload_model():
    """Pre-load the model at startup"""
    get_emotion_classifier()
