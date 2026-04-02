import React from 'react';

/**
 * Sidebar Component
 * Contains new chat button, chat list, and theme toggle
 */

function Sidebar({
    chats,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    theme,
    onToggleTheme,
    onShowEvaluation,
    onShowSettings
}) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // Less than a week
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-title">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                    Emotion Chat
                </h1>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button className="new-chat-btn" onClick={onNewChat} style={{ flex: 1 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New
                    </button>
                    <button className="new-chat-btn" onClick={onShowEvaluation} style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 20V10M12 20V4M6 20v-6"/>
                        </svg>
                        Eval
                    </button>
                </div>
            </div>

            <div className="chat-list">
                {chats.length === 0 ? (
                    <div className="chat-list-empty">
                        No conversations yet.<br />Start a new chat!
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.chat_id}
                            className={`chat-item ${currentChatId === chat.chat_id ? 'active' : ''}`}
                            onClick={() => onSelectChat(chat.chat_id)}
                        >
                            <div className="chat-item-content">
                                <div className="chat-item-title">{chat.title}</div>
                                <div className="chat-item-date">{formatDate(chat.updated_at)}</div>
                            </div>
                            <button
                                className="chat-item-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.chat_id);
                                }}
                                title="Delete chat"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="sidebar-footer" style={{ display: 'flex' }}>
                <button className="theme-toggle" onClick={onShowSettings} style={{ flex: '0 0 auto', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 18px', borderRight: '1px solid var(--border-color)', borderRadius: '0' }} title="Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
                <button className="theme-toggle" onClick={onToggleTheme} style={{ flex: 1, borderRadius: '0' }}>
                    {theme === 'dark' ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                            Light Mode
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                            Dark Mode
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
