# TrustDocs: Explainable Document Understanding Assistant

TrustDocs is an AI-powered platform designed to help people understand complex legal, financial, and medical documents. By using RAG (Retrieval-Augmented Generation), it translates dense jargon into simple, actionable information (targeting a 5th-8th grade reading level).

## 🚀 Key Features

- **PDF Analysis**: Upload any PDF document for instant processing.
- **Explainable AI**: Translates complex terms into simple language.
- **RAG-Powered Chat**: Ask specific questions and get answers cited directly from the document.
- **Risk Flagging**: Automatically identifies potential risks like high fees, auto-renewal clauses, or hidden penalties.
- **Accessibility Centric**: Built for users with cognitive disabilities, low literacy, or limited English proficiency.

## 🛠️ Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js + Express.
- **AI Engine**: LlamaIndex (RAG Framework).
- **LLM/Embeddings**: Local Ollama (Gemma 3:1b, Nomic-Embed-Text) or Google Gemini.

## 📁 Project Structure

```text
trust docs/
├── frontend/    # React application
└── backend/     # Express server + LlamaIndex logic
```

## 🚥 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Ollama](https://ollama.com/) (if running locally) or Google API Key

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your configuration in `.env`:
   ```env
   GOOGLE_API_KEY=your_key_here
   PORT=3001
   ```
4. Start the server:
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
