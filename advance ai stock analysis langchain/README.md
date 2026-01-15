# 📈 Stock Analysis AI Agent

A powerful AI-powered stock analysis assistant built with **FastAPI**, **LangChain**, **LangGraph**, and **yfinance**. This application leverages the **TheSys GPT-5 API** to provide intelligent, conversational insights about stocks, including real-time prices, historical data, balance sheets, and the latest news.

![Python](https://img.shields.io/badge/Python-3.13+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128+-009688?logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1.2.3+-orange?logo=chainlink&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔴 **Real-Time Stock Prices** | Get the latest closing price for any stock ticker |
| 📊 **Historical Stock Data** | Retrieve historical price data within a specified date range |
| 📋 **Balance Sheets** | Access comprehensive balance sheet information for any company |
| 📰 **Stock News** | Stay updated with the latest news related to a specific stock |
| 💬 **Conversational AI** | Natural language interface powered by GPT-5 |
| ⚡ **Streaming Responses** | Real-time response streaming for a smooth user experience |

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[LangChain](https://www.langchain.com/)** - Framework for developing LLM-powered applications
- **[LangGraph](https://www.langchain.com/langgraph)** - Library for building stateful, multi-actor applications
- **[yfinance](https://pypi.org/project/yfinance/)** - Yahoo Finance market data downloader
- **[TheSys GPT-5 API](https://thesys.dev/)** - Advanced LLM API for intelligent responses
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server for running FastAPI

### Frontend
- **React** with **TypeScript**
- **Vite** - Next-generation frontend tooling

---

## 📦 Installation

### Prerequisites
- Python 3.13 or higher
- Node.js (for frontend)
- TheSys API Key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-analysis-ai-agent.git
   cd stock-analysis-ai-agent/backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment**
   
   - **Windows:**
     ```bash
     .venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   Or using `uv` (recommended):
   ```bash
   uv sync
   ```

5. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   THESYS_API_KEY=your_thesys_api_key_here
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

---

## 🚀 How to Run

### Start the Backend Server

```bash
cd backend

# Activate virtual environment (if not already active)
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # macOS/Linux

# Run the server
python main.py
```

The backend server will start on `http://localhost:8888`

### Start the Frontend (Optional)

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 📡 API Endpoints

### POST `/api/chat`

Send a message to the AI agent and receive a streaming response with stock analysis.

#### Request Body

```json
{
  "prompt": {
    "content": "What is the current price of AAPL?",
    "id": "msg-001",
    "role": "user"
  },
  "threadId": "thread-12345",
  "responseId": "resp-001"
}
```

#### Request Parameters

| Field | Type | Description |
|-------|------|-------------|
| `prompt.content` | `string` | The user's question or request |
| `prompt.id` | `string` | Unique identifier for the message |
| `prompt.role` | `string` | Role of the sender (typically `"user"`) |
| `threadId` | `string` | Unique identifier for the conversation thread |
| `responseId` | `string` | Unique identifier for the expected response |

#### Response

The API returns a **streaming response** (`text/event-stream`) with the AI's analysis.

#### Example using cURL

```bash
curl -X POST http://localhost:8888/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": {
      "content": "What is Apple stock price today?",
      "id": "1",
      "role": "user"
    },
    "threadId": "test-thread",
    "responseId": "resp-1"
  }'
```

#### Example using Python

```python
import requests

response = requests.post(
    "http://localhost:8888/api/chat",
    json={
        "prompt": {
            "content": "Show me the historical prices for MSFT from 2024-01-01 to 2024-06-30",
            "id": "msg-1",
            "role": "user"
        },
        "threadId": "my-thread-123",
        "responseId": "resp-1"
    },
    stream=True
)

for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
    print(chunk, end="", flush=True)
```

---

## 💡 Example Usage

Here are some example prompts you can try:

| Prompt | Tool Used |
|--------|-----------|
| "What is the current stock price of Tesla (TSLA)?" | `get_stock_price` |
| "Show me historical data for GOOGL from 2024-01-01 to 2024-12-31" | `get_historical_stock_price` |
| "Get me the balance sheet for Amazon (AMZN)" | `get_balance_sheet` |
| "What's the latest news about Microsoft (MSFT)?" | `get_stock_news` |
| "Compare AAPL and NVDA stock prices" | Multiple tools |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 style guidelines for Python code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Notes & Troubleshooting

### Common Issues

#### 1. API Key Not Working
- Ensure your `THESYS_API_KEY` is correctly set in the `.env` file
- Make sure there are no extra spaces or quotes around the key
- Verify your API key is valid and has sufficient credits

#### 2. Connection Errors
- Check that the `base_url` is correct: `https://api.thesys.dev/v1/embed/`
- Ensure you have a stable internet connection
- Verify the TheSys API service is operational

#### 3. yfinance Data Issues
- Some tickers may not be available or may have limited data
- Use standard ticker symbols (e.g., `AAPL`, `MSFT`, `GOOGL`)
- Historical data availability depends on the stock

#### 4. CORS Errors (Frontend)
- The backend includes CORS middleware, but ensure the frontend origin is allowed
- If running on different ports, check CORS configuration in `main.py`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `THESYS_API_KEY` | Your TheSys API key for GPT-5 access | ✅ Yes |

### Useful Commands

```bash
# Check Python version
python --version

# Verify dependencies are installed
pip list

# Test the API is running
curl http://localhost:8888/docs
```

### Performance Tips

- Use conversation threads (`threadId`) to maintain context across messages
- The agent uses in-memory checkpointing, so conversations reset on server restart
- For production, consider implementing persistent storage for checkpoints

---

## 📬 Contact

If you have any questions or suggestions, feel free to open an issue or reach out!

---

<p align="center">
  Made with ❤️ using FastAPI, LangChain, and AI
</p>
