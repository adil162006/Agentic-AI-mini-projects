# TrustDocs: Explainable Document Understanding Assistant

TrustDocs is an AI-powered platform designed to help people understand complex legal, financial, and medical documents. By using RAG (Retrieval-Augmented Generation), it translates dense jargon into simple, actionable information (targeting a 5th-8th grade reading level).

## 🚀 Key Features

- **PDF Analysis**: Upload any PDF document for instant processing.
- **Explainable AI**: Translates complex terms into simple language.
- **RAG-Powered Chat**: Ask specific questions and get answers cited directly from the document.
- **Multilingual & Mixed Script Support**: Supports 9 Indian languages (Hindi, Tamil, Marathi, Malayalam, Bengali, Urdu, Assamese, Punjabi, English) and understands Hinglish/Tanglish.
- **Text-to-Speech (TTS)**: Listen to summaries and answers in your preferred language.
- **Risk Flagging**: Automatically identifies potential risks like high fees, auto-renewal clauses, or hidden penalties.
- **Accessibility Centric**: Built for users with cognitive disabilities, low literacy, or limited English proficiency.

## 🛠️ Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js + Express.
- **AI Engine**: LlamaIndex (RAG Framework).
- **LLM**: Ollama (`qwen2.5:7b-instruct`).
- **Embeddings**: Ollama (`mxbai-embed-large`).

## 📁 Project Structure

```text
trust docs/
├── frontend/    # React application
└── backend/     # Express server + LlamaIndex logic
```

## 🚥 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Ollama](https://ollama.com/) (Required for local LLM)

### Backend Setup

1. **Install Ollama Models**:
   Open a terminal and run:
   ```bash
   ollama pull qwen2.5:7b-instruct
   ollama pull mxbai-embed-large
   ```

2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure your configuration in `.env`:
   ```env
   PORT=3001
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
