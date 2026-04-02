/**
 * Chat API Client
 * Handles all communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Detect emotion from text
 */
export async function detectEmotion(text) {
  const response = await fetch(`${API_BASE_URL}/detect-emotion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to detect emotion');
  }

  return response.json();
}

/**
 * Send a chat message and get a response
 */
export async function sendMessage(chatId, message, settings = {}) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message: message,
      user_name: settings.name || null,
      support_style: settings.supportStyle || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to send message');
  }

  return response.json();
}

/**
 * Get all chat sessions
 */
export async function getChats() {
  const response = await fetch(`${API_BASE_URL}/chats`);

  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }

  return response.json();
}

/**
 * Get a specific chat with messages
 */
export async function getChat(chatId) {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch chat');
  }

  return response.json();
}

/**
 * Create a new chat session
 */
export async function createNewChat() {
  const response = await fetch(`${API_BASE_URL}/new-chat`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to create new chat');
  }

  return response.json();
}

/**
 * Delete a chat session
 */
export async function deleteChat(chatId) {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete chat');
  }

  return response.json();
}
