# TrustDocs Frontend

A modern, accessible user interface for the TrustDocs platform, built with React and Vite.

## ✨ Features

- **Drag-and-Drop/File Upload**: Easy PDF selection.
- **Real-time Status**: Separate indicators for uploading and processing.
- **Dynamic Summary**: Immediate display of key takeaways after upload.
- **Explainable Answers**: Clear formatting for AI responses with confidence scores.
- **Evidence Panel**: Shows the specific document sections used to generate answers.
- **Accessibility Layers**: ARIA labels, semantic HTML, and simple readability.

## 🎨 Tech Stack

- **React 18**: Component-based UI.
- **Vite**: Ultra-fast build tool.
- **Tailwind CSS**: Utility-first styling with gradients and glassmorphism.
- **Lucide React**: Clean, modern icons.

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## 🌐 API Interaction

The frontend expects the backend to be running on `http://localhost:3001`. You can modify the `API_URL` variable in `src/App.jsx` if your backend is hosted elsewhere.
