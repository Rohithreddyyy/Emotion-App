import React from 'react';

/**
 * Emotion Badge Component
 * Displays the detected emotion with emoji and confidence
 */

const emotionConfig = {
    joy: { emoji: '😊', label: 'Joy' },
    sadness: { emoji: '😢', label: 'Sadness' },
    anger: { emoji: '😠', label: 'Anger' },
    fear: { emoji: '😨', label: 'Fear' },
    surprise: { emoji: '😲', label: 'Surprise' },
    neutral: { emoji: '😐', label: 'Neutral' },
    disgust: { emoji: '🤢', label: 'Disgust' },
};

function EmotionBadge({ emotion, confidence }) {
    const config = emotionConfig[emotion?.toLowerCase()] || emotionConfig.neutral;
    const confidencePercent = Math.round((confidence || 0) * 100);

    return (
        <div className={`emotion-badge ${emotion?.toLowerCase() || 'neutral'}`}>
            <span className="emotion-badge-emoji">{config.emoji}</span>
            <span className="emotion-badge-label">{config.label}</span>
            <span className="emotion-badge-confidence">({confidencePercent}%)</span>
        </div>
    );
}

export default EmotionBadge;
