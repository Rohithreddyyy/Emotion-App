import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EmotionBadge from './EmotionBadge';

/**
 * Chat Bubble Component
 * Displays a single message with emotion badge for assistant messages
 */

function ChatBubble({ message }) {
    const isUser = message.role === 'user';
    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`message ${isUser ? 'user' : 'assistant'}`}>
            <div className="message-avatar">
                {isUser ? '👤' : '🤖'}
            </div>
            <div className="message-content">
                <div className="message-bubble markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
                {!isUser && message.emotion && (
                    <EmotionBadge
                        emotion={message.emotion}
                        confidence={message.confidence}
                    />
                )}
                <span className="message-time">{time}</span>
            </div>
        </div>
    );
}

export default ChatBubble;
