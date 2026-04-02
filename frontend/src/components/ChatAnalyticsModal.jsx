import React, { useState, useEffect } from 'react';
import './EvaluationDashboard.css';

const EMOTION_COLORS = {
    joy: '#10b981',
    sadness: '#6366f1',
    anger: '#ef4444',
    fear: '#f59e0b',
    surprise: '#8b5cf6',
    neutral: '#9ca3af',
    disgust: '#14b8a6'
};

function ChatAnalyticsModal({ messages, onClose }) {
    const [evalData, setEvalData] = useState(null);

    useEffect(() => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        fetch(`${API_BASE_URL}/evaluation`)
            .then(res => res.json())
            .then(data => setEvalData(data))
            .catch(err => console.error("Could not load evaluation metrics:", err));
    }, []);

    // Calculate emotion counts
    const emotionCounts = {};
    let totalEmotions = 0;
    
    messages.forEach(msg => {
        if (msg.role === 'user' && msg.emotion) {
            emotionCounts[msg.emotion] = (emotionCounts[msg.emotion] || 0) + 1;
            totalEmotions++;
        }
    });

    const entries = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);

    return (
        <div className="evaluation-dashboard" style={{ zIndex: 200, justifyContent: 'center', alignItems: 'center' }}>
            <div className="eval-metric-card" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
                <button className="eval-close-btn" onClick={onClose} style={{ top: '15px', right: '15px' }}>&times;</button>
                <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px', color: 'var(--text-primary)' }}>
                    Chat Emotion Analytics
                </h2>
                {totalEmotions === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Not enough data to analyze yet. Send some messages first!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Evaluation of explicit emotions detected during this specific chat session, paired with benchmark performance data.
                        </p>
                        
                        {entries.map(([emotion, count]) => {
                            const percent = Math.round((count / totalEmotions) * 100);
                            const color = EMOTION_COLORS[emotion.toLowerCase()] || '#3b82f6';
                            
                            // Calculate benchmark logic
                            let bestModelName = "Loading...";
                            let bestF1 = 0;
                            let mlClass = null;
                            let dlClass = null;
                            let bertClass = null;
                            
                            if (evalData && evalData.metrics) {
                                const emotionKey = emotion.toLowerCase();
                                mlClass = evalData.metrics.ML.per_class[emotionKey];
                                dlClass = evalData.metrics.DL.per_class[emotionKey];
                                bertClass = evalData.metrics.BERT.per_class[emotionKey];
                                
                                if (bertClass && dlClass && mlClass) {
                                    
                                    // Find reigning champion model for this specific emotion
                                    const maxF1 = Math.max(mlClass.f1, dlClass.f1, bertClass.f1);
                                    if (maxF1 === bertClass.f1) {
                                        bestModelName = "BERT (DistilRoBERTa)";
                                        bestF1 = bertClass.f1;
                                    } else if (maxF1 === dlClass.f1) {
                                        bestModelName = "DL (MLP)";
                                        bestF1 = dlClass.f1;
                                    } else {
                                        bestModelName = "ML (Logistic Regression)";
                                        bestF1 = mlClass.f1;
                                    }
                                }
                            }

                            return (
                                <div key={emotion} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    
                                    {/* Primary Progress Bar */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        <span>{emotion}</span>
                                        <span>{percent}% ({count} msgs)</span>
                                    </div>
                                    <div style={{ height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px' }}>
                                        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: '5px', transition: 'width 1s ease-out' }}></div>
                                    </div>
                                    
                                    {/* Benchmark Stats Grid */}
                                    {mlClass && dlClass && bertClass && (
                                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                                                Algorithm Benchmarks for '{emotion}'
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                                {[
                                                    { name: 'BERT (DistilRoBERTa)', classStats: bertClass, color: 'var(--emotion-sadness)' },
                                                    { name: 'DL (MLP)', classStats: dlClass, color: 'var(--emotion-joy)' },
                                                    { name: 'ML (Logistic Regression)', classStats: mlClass, color: 'var(--emotion-fear)' }
                                                ].map(model => (
                                                    <div key={model.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', flex: '1' }}>
                                                            {model.name}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                                                            <span style={{ color: 'var(--text-secondary)' }}>F1: <strong style={{ color: 'var(--text-primary)' }}>{(model.classStats.f1 * 100).toFixed(1)}%</strong></span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>Rec: <strong style={{ color: 'var(--text-primary)' }}>{(model.classStats.recall * 100).toFixed(1)}%</strong></span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>Pre: <strong style={{ color: 'var(--text-primary)' }}>{(model.classStats.precision * 100).toFixed(1)}%</strong></span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 12px', borderRadius: '6px' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                                <span>Best performing model for {emotion}: <strong>{bestModelName}</strong> (F1: {(bestF1 * 100).toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatAnalyticsModal;
