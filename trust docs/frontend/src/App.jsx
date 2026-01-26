import React, { useState } from 'react';
import { Upload, Send, FileText, CheckCircle, AlertCircle, Globe, Volume2 } from 'lucide-react';

export default function TrustDocs() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [response, setResponse] = useState(null);
  const [documentSummary, setDocumentSummary] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const API_URL = 'http://localhost:3001/api';

  const languages = [
    { code: 'en', name: 'English', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو (Urdu)', flag: '🇮🇳' },
    { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  ];

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setIsUploaded(false);
      setUploadStatus('');
      setError('');
      setResponse(null);
      setDocumentSummary(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
      setIsUploaded(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setUploading(true);
    setError('');
    setUploadStatus('');

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('language', language);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setIsUploaded(true);
      setUploadStatus('PDF uploaded successfully!');
      setDocumentSummary(data.summary);
      setError('');
      
      if (data.summary?.introduction) {
        speakText(data.summary.introduction);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload PDF. Please try again.');
      setIsUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!isUploaded) {
      setError('Please upload the PDF first');
      return;
    }
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setAsking(true);
    setError('');
    stopSpeaking();

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question.trim(),
          language: language 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Question failed');
      }

      setResponse(data);
      setQuestion('');
      setError('');
      
      if (data.answer?.simpleAnswer) {
        speakText(data.answer.simpleAnswer);
      }
    } catch (err) {
      setError(err.message || 'Failed to get answer. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-900 mb-2">TrustDocs</h1>
          <p className="text-gray-600 text-sm sm:text-base">Understand documents in your language | अपनी भाषा में समझें</p>
          
          {/* Language Selector */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <Globe size={20} className="text-indigo-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm sm:text-base"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 You can type in Hinglish, Tanglish or mix languages!</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Upload className="mr-2" size={20} />
            Upload PDF
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                <div className="flex items-center justify-center">
                  <FileText className="mr-2 text-gray-400" size={20} />
                  <span className="text-gray-600 text-sm break-all">
                    {file ? file.name : 'Click to select PDF'}
                  </span>
                </div>
              </div>
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploading || isUploaded}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
            >
              {uploading ? 'Processing...' : isUploaded ? 'Uploaded ✓' : 'Upload'}
            </button>
          </div>

          {uploadStatus && (
            <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
              <CheckCircle size={18} className="mr-2" />
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Document Summary */}
        {documentSummary && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 border-l-4 border-indigo-500">
            {/* Introduction */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                  <FileText className="mr-2 text-indigo-500" size={22} />
                  Document Summary
                </h3>
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(documentSummary.introduction)}
                  className="p-2 rounded-full hover:bg-indigo-50 transition-colors"
                  title={isSpeaking ? "Stop" : "Read aloud"}
                >
                  <Volume2 size={20} className={isSpeaking ? "text-red-500" : "text-indigo-600"} />
                </button>
              </div>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg">
                {documentSummary.introduction}
              </p>
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">📋 Key Points:</h4>
              <div className="space-y-3">
                {documentSummary.keyPoints?.map((point, idx) => (
                  <div key={idx} className="flex items-start bg-gray-50 p-3 rounded-lg">
                    <span className="inline-block w-7 h-7 bg-indigo-600 text-white rounded-full text-center font-bold text-sm mr-3 flex-shrink-0 leading-7">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 text-sm sm:text-base">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Warnings */}
            {documentSummary.warnings && documentSummary.warnings.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-red-700 mb-3">⚠️ Important Warnings:</h4>
                <div className="space-y-2">
                  {documentSummary.warnings.map((warning, idx) => (
                    <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                      <p className="text-red-800 font-medium text-sm sm:text-base">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {documentSummary.nextSteps && documentSummary.nextSteps.length > 0 && (
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">✅ What to do next:</h4>
                <ul className="space-y-2">
                  {documentSummary.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2 text-lg">→</span>
                      <span className="text-gray-700 text-sm sm:text-base">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Send className="mr-2" size={20} />
            Ask a Question
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!isUploaded}
              placeholder={isUploaded ? "Ask anything about this document..." : "Upload a PDF first"}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base"
            />

            <button
              onClick={handleAskQuestion}
              disabled={!isUploaded || !question.trim() || asking}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
            >
              {asking ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start text-red-700">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && response.answer && (
          <div className="space-y-4 sm:space-y-6">
            {/* Simple Answer */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">💡 Simple Answer</h3>
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(response.answer.simpleAnswer)}
                  className="p-2 rounded-full hover:bg-green-100 transition-colors"
                >
                  <Volume2 size={20} className={isSpeaking ? "text-red-500" : "text-green-600"} />
                </button>
              </div>
              <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium">
                {response.answer.simpleAnswer}
              </p>
            </div>

            {/* Detailed Breakdown */}
            {response.answer.breakdown && response.answer.breakdown.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">📚 Detailed Explanation</h3>
                <div className="space-y-3">
                  {response.answer.breakdown.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Facts */}
            {response.answer.keyFacts && response.answer.keyFacts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">🔑 Key Facts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {response.answer.keyFacts.map((fact, idx) => (
                    <div key={idx} className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                      <p className="text-gray-800 font-medium text-sm">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Sources */}
            {response.evidence && response.evidence.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">📄 From the Document:</h3>
                <div className="space-y-3">
                  {response.evidence.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-indigo-200 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
                      <p className="text-gray-700 text-sm italic">"{item.text}"</p>
                      {item.score && (
                        <span className="inline-block mt-2 text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded">
                          Relevance: {Math.round(parseFloat(item.score) * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}