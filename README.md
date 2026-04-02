# 🎭 Emotion-Aware Conversational Chatbot

An intelligent chatbot that detects user emotions using BERT and generates empathetic, context-aware responses via Groq LLM.

![Demo](https://img.shields.io/badge/Status-Demo%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![React](https://img.shields.io/badge/React-18-61dafb)

## ✨ Features

- **🧠 Emotion Detection** - BERT-based real-time emotion classification (joy, sadness, anger, fear, surprise, neutral, disgust)
- **💬 Empathetic Responses** - AI responses adapt tone based on detected emotions
- **📝 Multi-turn Memory** - Full conversation context preservation across turns
- **🎨 Modern UI** - OpenCode-inspired dark/light theme with smooth animations
- **📚 Chat Management** - Create, switch, and delete conversations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌─────────┐  ┌─────────────┐  ┌────────────┐  ┌─────────────┐ │
│  │ Sidebar │  │ ChatContainer│  │ ChatInput  │  │EmotionBadge │ │
│  └─────────┘  └─────────────┘  └────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (FastAPI)                          │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │ Emotion Service │  │  Chat Service  │  │  Memory Service  │ │
│  │   (DistilRoBERTa)│  │   (Groq API)   │  │  (In-Memory)     │ │
│  └─────────────────┘  └────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API Key ([Get one here](https://console.groq.com))

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set Groq API key
set GROQ_API_KEY=your_api_key_here  # Windows
# export GROQ_API_KEY=your_api_key_here  # Linux/Mac

# Start server
python main.py
```

Backend runs at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/detect-emotion` | POST | Analyze text emotion |
| `/chat` | POST | Send message & get response |
| `/chats` | GET | List all chat sessions |
| `/chat/{id}` | GET | Get specific chat |
| `/chat/{id}` | DELETE | Delete a chat |
| `/new-chat` | POST | Create new session |

## 🎭 Emotion-Response Mapping

| Emotion | Response Style |
|---------|----------------|
| 😊 Joy | Enthusiastic, celebratory |
| 😢 Sadness | Supportive, empathetic |
| 😠 Anger | De-escalating, calm |
| 😨 Fear | Reassuring, protective |
| 😲 Surprise | Curious, explanatory |
| 😐 Neutral | Informative, clear |
| 🤢 Disgust | Understanding, non-judgmental |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLM | Yes |

### Adjustable Parameters

In `backend/services/chat_service.py`:
- `model`: LLM model (default: `llama3-70b-8192`)
- `temperature`: Response creativity (default: `0.7`)
- `max_tokens`: Max response length (default: `1024`)

In `backend/services/memory_service.py`:
- `max_turns`: Context window size (default: `10`)

## 📁 Project Structure

```
sentiment/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── requirements.txt
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   └── services/
│       ├── emotion_service.py  # BERT emotion detection
│       ├── chat_service.py     # Groq LLM integration
│       └── memory_service.py   # Conversation storage
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main component
│   │   ├── index.css           # Global styles
│   │   ├── api/
│   │   │   └── chatApi.js      # API client
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── ChatContainer.jsx
│   │       ├── ChatBubble.jsx
│   │       ├── ChatInput.jsx
│   │       └── EmotionBadge.jsx
│   └── package.json
└── README.md
```

## 🧪 Testing

### Test Emotion Detection

```bash
curl -X POST http://localhost:8000/detect-emotion \
  -H "Content-Type: application/json" \
  -d '{"text": "I am so happy today!"}'
```

Expected response:
```json
{
  "emotion_label": "joy",
  "confidence_score": 0.9876
}
```

### Test Chat

```bash
# Create a new chat
curl -X POST http://localhost:8000/new-chat

# Send a message (use the chat_id from above)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "YOUR_CHAT_ID", "message": "I feel really sad today"}'
```

## 🎨 Theme Customization

Edit CSS variables in `frontend/src/index.css`:

```css
:root {
  --accent-primary: #228be6;  /* Change primary color */
  --radius-md: 12px;          /* Adjust border radius */
}
```

## 📝 License

MIT License - feel free to use for academic or personal projects.

---

Built with ❤️ using FastAPI, React, HuggingFace Transformers, and Groq
