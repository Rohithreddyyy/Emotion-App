import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';
import EvaluationDashboard from './components/EvaluationDashboard';
import SettingsModal from './components/SettingsModal';
import ChatAnalyticsModal from './components/ChatAnalyticsModal';
import { getChats, getChat, createNewChat, deleteChat, sendMessage } from './api/chatApi';

/**
 * Main Application Component
 * Emotion-Aware Conversational Chatbot
 */

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : { name: '', supportStyle: 'Default' };
  });

  // Apply settings to document
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      loadChat(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const loadChats = async () => {
    try {
      const response = await getChats();
      setChats(response.chats || []);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Failed to load chats. Is the backend running?');
    }
  };

  const loadChat = async (chatId) => {
    try {
      const chat = await getChat(chatId);
      setMessages(chat.messages || []);
    } catch (err) {
      console.error('Failed to load chat:', err);
      setMessages([]);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createNewChat();
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat.chat_id);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError('Failed to create new chat. Is the backend running?');
    }
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setError(null);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat(chatId);
      const updatedChats = chats.filter(c => c.chat_id !== chatId);
      setChats(updatedChats);

      if (currentChatId === chatId) {
        setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].chat_id : null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError('Failed to delete chat');
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Create new chat if none selected
    let chatId = currentChatId;
    if (!chatId) {
      try {
        const newChat = await createNewChat();
        chatId = newChat.chat_id;
        setChats([newChat, ...chats]);
        setCurrentChatId(chatId);
      } catch (err) {
        console.error('Failed to create chat:', err);
        setError('Failed to create chat. Is the backend running?');
        return;
      }
    }

    // Add optimistic user message
    const optimisticUserMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage(chatId, messageText, settings);

      // Replace optimistic message with real messages
      setMessages(prev => {
        const withoutOptimistic = prev.slice(0, -1);
        return [...withoutOptimistic, response.user_message, response.assistant_message];
      });

      // Update chat title in sidebar
      await loadChats();

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const exportTranscript = () => {
    if (!messages.length) return;
    const transcript = messages.map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? (settings.name || 'You') : 'Chatbot'}: ${m.content}${m.emotion ? ` (Detected Emotion: ${m.emotion})` : ''}`).join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        theme={theme}
        onToggleTheme={toggleTheme}
        onShowEvaluation={() => setShowEvaluation(true)}
        onShowSettings={() => setShowSettings(true)}
      />

      <div className="chat-container">
        <div className="chat-header">
          <h2 className="chat-header-title">
            {currentChatId
              ? chats.find(c => c.chat_id === currentChatId)?.title || 'Chat'
              : 'Emotion-Aware Chat'
            }
          </h2>
          {messages.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowAnalytics(true)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  Analytics
                </button>
                <button onClick={exportTranscript} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export Info
                </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: '12px 24px',
            background: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b',
            borderBottom: '1px solid rgba(255, 107, 107, 0.2)',
            fontSize: '13px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <ChatContainer messages={messages} loading={loading} />

        <ChatInput
          onSend={handleSendMessage}
          disabled={false}
          loading={loading}
        />
      </div>

      {showEvaluation && <EvaluationDashboard onClose={() => setShowEvaluation(false)} />}
      {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />}
      {showAnalytics && <ChatAnalyticsModal messages={messages} onClose={() => setShowAnalytics(false)} />}
    </div>
  );
}

export default App;
