import React, { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';

/**
 * Chat Container Component
 * Displays messages with auto-scroll and loading indicator
 */

function ChatContainer({ messages, loading }) {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (!messages || messages.length === 0) {
        return (
            <div className="chat-messages">
                <div className="chat-empty">
                    <svg className="chat-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3 className="chat-empty-title">Start a Conversation</h3>
                    <p className="chat-empty-subtitle">
                        Send a message to begin. I'll detect your emotions and respond with empathy.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-messages">
            {messages.map((message, index) => (
                <ChatBubble key={index} message={message} />
            ))}

            {loading && (
                <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                        <div className="loading-indicator">
                            <div className="loading-dots">
                                <div className="loading-dot"></div>
                                <div className="loading-dot"></div>
                                <div className="loading-dot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}

export default ChatContainer;
