import React, { useState } from 'react';
import { Upload, Send, FileText, CheckCircle, AlertCircle } from 'lucide-react';

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

  // Backend API URL
  const API_URL = 'http://localhost:3001/api';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setIsUploaded(false); // New file selected, reset upload status
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
      setError(''); // Clear old errors
      console.log('Upload success:', data);
    } catch (err) {
      setError(err.message || 'Failed to upload PDF. Please try again.');
      setIsUploaded(false);
      console.error(err);
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

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Question failed');
      }

      setResponse(data);
      setError(''); // Clear old errors
    } catch (err) {
      setError(err.message || 'Failed to get answer. Please try again.');
      console.error(err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">TrustDocs</h1>
          <p className="text-gray-600">Understand complex documents with simple AI explanations</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Upload className="mr-2" size={24} />
            Upload PDF
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Select PDF file"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                <div className="flex items-center justify-center">
                  <FileText className="mr-2 text-gray-400" size={20} />
                  <span className="text-gray-600 break-all">
                    {file ? file.name : 'Click to select PDF file'}
                  </span>
                </div>
              </div>
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploading || isUploaded}
              className="bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Processing...' : isUploaded ? 'Uploaded ✓' : 'Upload PDF'}
            </button>
          </div>

          {uploadStatus && (
            <div className="mt-4 flex items-center text-green-600 font-medium">
              <CheckCircle size={20} className="mr-2" />
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Document Summary (Immediate Display) */}
        {documentSummary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-indigo-500 animate-in fade-in duration-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="mr-2 text-indigo-500" size={20} />
              Key Document Takeaways
            </h3>
            <ul className="space-y-2">
              {documentSummary.slice(0, 5).map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-center font-semibold text-sm mr-3 flex-shrink-0 leading-6">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Send className="mr-2" size={24} />
            Ask a Question
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!isUploaded}
              placeholder={isUploaded ? "What would you like to know about this document?" : "Upload a PDF first to ask questions"}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              aria-label="Ask a question about the document"
            />

            <button
              onClick={handleAskQuestion}
              disabled={!isUploaded || !question.trim() || asking}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
            >
              {asking ? 'Searching...' : 'Ask Question'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start text-red-700 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* Answer */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Assistant Response</h3>
              <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
                {response.answer || 'No answer provided'}
              </div>
            </div>

            {/* Evidence (Fixed Rendering) */}
            {response.evidence && response.evidence.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Supporting Evidence</h3>
                <div className="space-y-4">
                  {response.evidence.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-indigo-200 pl-4 py-3 bg-indigo-50/30 rounded-r-lg">
                      <p className="text-gray-700 text-sm italic">"{item.text || item}"</p>
                      <div className="flex gap-4 mt-2">
                        {item.rank && (
                          <span className="text-[10px] uppercase font-bold text-indigo-500 bg-white px-2 py-0.5 rounded shadow-sm">
                            Evidence #{item.rank}
                          </span>
                        )}
                        {item.score && (
                          <span className="text-[10px] uppercase font-bold text-green-600 bg-white px-2 py-0.5 rounded shadow-sm">
                            Confidence: {Math.round(parseFloat(item.score) * 100)}%
                          </span>
                        )}
                      </div>
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