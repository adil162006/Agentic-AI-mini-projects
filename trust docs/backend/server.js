// TrustDocs Backend - Explainable Document Understanding Assistant
// Purpose: Help users with cognitive disabilities, low literacy, or limited English 
// proficiency understand complex legal, financial, and medical documents
// Dependencies: express, multer, pdf-parse, llamaindex, cors

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const parsePdf = require("pdf-parse");


const cors = require('cors');
const {
  Document,
  VectorStoreIndex,
  Settings,
} = require('llamaindex');
const { Ollama, OllamaEmbedding } = require("@llamaindex/ollama");


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json());

// Configure multer for file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });




// In-memory storage for the current document
let currentDocumentText = '';
let vectorIndex = null;
let documentSummary = null;
let documentMetadata = {};

// Configure LlamaIndex to use Gemini
// Make sure to set your GOOGLE_API_KEY environment variable
Settings.llm = new Ollama({
  model: "gemma3:1b",
  temperature: 0.3,
});


Settings.embedModel = new OllamaEmbedding({
  model: "nomic-embed-text",
});


// Enhanced system instructions for accessibility and explainability
const SYSTEM_INSTRUCTIONS = {
  answerStyle: `You are TrustDocs, an AI assistant designed to help people understand complex legal, financial, and medical documents. Your users may have cognitive disabilities, low literacy, or limited English proficiency.

CRITICAL GUIDELINES:
1. Use simple, clear language (5th-8th grade reading level)
2. Avoid jargon - if technical terms are needed, explain them immediately
3. Break complex ideas into short, simple sentences
4. Be direct and specific - avoid vague or ambiguous language
5. Focus on what matters to the user: obligations, rights, risks, deadlines
6. Always cite exactly where information comes from in the document
7. If something is unclear or missing from the document, say so clearly
8. Use "you" language to make it personal and relatable
9. Highlight warnings or important items users should know about

Your goal is to build TRUST by being transparent, accurate, and helpful.`,

  summaryStyle: `Analyze this document and identify the 5 MOST IMPORTANT things a person needs to know before signing or agreeing to it.

Focus on:
- Key obligations (what you must do)
- Important deadlines or dates
- Costs, fees, or financial commitments
- Rights you're giving up or gaining
- Penalties, cancellation terms, or auto-renewal clauses
- Hidden risks or unfavorable terms

Use clear, simple language. Each point should be actionable and specific.
Format as a JSON array of exactly 5 strings.`
};

// Helper function to split text into chunks with overlap
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start += chunkSize - overlap; // Move forward with overlap
  }

  return chunks;
}

// Enhanced summary generation with accessibility focus
async function generateSummary(text) {
  try {
    const prompt = `${SYSTEM_INSTRUCTIONS.summaryStyle}

Document:
${text.slice(0, 12000)} 

Return ONLY a valid JSON array of exactly 5 strings, like:
["First key point", "Second key point", "Third key point", "Fourth key point", "Fifth key point"]`;

    const llm = Settings.llm;
    const response = await llm.complete({ prompt });

    // Parse the JSON response
    const summaryText = response.text.trim();
    // Remove markdown code blocks if present
    const cleanText = summaryText.replace(/```json\n?|\n?```/g, '').trim();
    const summary = JSON.parse(cleanText);

    return Array.isArray(summary) ? summary.slice(0, 5) : summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    // Fallback summary that still provides value
    return [
      'Document has been uploaded and is ready for questions',
      'Ask about specific terms, obligations, or deadlines',
      'All answers will include exact quotes from the document',
      'You can ask questions like "What are the penalties?" or "Can I cancel?"',
      'Use simple language - the assistant is here to help you understand'
    ];
  }
}

// Extract key metadata from document for better context
function extractMetadata(text) {
  const metadata = {
    hasDateMentions: /\b(deadline|due date|expires|expiration|effective date)\b/i.test(text),
    hasPenalties: /\b(penalty|penalties|fine|fines|fee|fees|charge)\b/i.test(text),
    hasCancellation: /\b(cancel|cancellation|terminate|termination|refund)\b/i.test(text),
    hasAutoRenewal: /\b(auto.?renew|automatic.?renewal|automatically.?renew)\b/i.test(text),
    hasLegalTerms: /\b(agree|consent|waive|liability|indemnify|arbitration)\b/i.test(text),
  };

  return metadata;
}

/**
 * POST /api/upload
 * Upload a PDF file, extract text, create vector index, and generate summary
 */
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('📄 Processing PDF:', req.file.originalname);

    // Extract text from PDF using pdf-parse
    const pdfData = await parsePdf(req.file.buffer);

    currentDocumentText = pdfData.text;

    console.log('📝 Extracted text length:', currentDocumentText.length, 'characters');

    // Extract metadata for risk flagging
    documentMetadata = extractMetadata(currentDocumentText);
    console.log('🏷️  Document metadata:', documentMetadata);

    // Split text into chunks for better retrieval
    const chunks = chunkText(currentDocumentText, 1000, 200);
    console.log('✂️  Created', chunks.length, 'text chunks');

    // Create LlamaIndex documents from chunks
    const documents = chunks.map((chunk, index) =>
      new Document({ text: chunk, id_: `chunk_${index}` })
    );

    // Build vector index for RAG
    console.log('🔍 Building vector index...');
    vectorIndex = await VectorStoreIndex.fromDocuments(documents);
    console.log('✅ Vector index created successfully');

    // Generate accessibility-focused document summary
    console.log('📋 Generating user-friendly summary...');
    documentSummary = await generateSummary(currentDocumentText);
    console.log('✅ Summary generated');

    // Return success response with summary and metadata
    res.json({
      success: true,
      message: 'PDF uploaded and indexed successfully',
      filename: req.file.originalname,
      textLength: currentDocumentText.length,
      chunks: chunks.length,
      summary: documentSummary,
      metadata: documentMetadata, // Include risk flags
    });

  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    res.status(500).json({
      error: 'Failed to process PDF',
      details: error.message
    });
  }
});

/**
 * POST /api/ask
 * Answer a question about the uploaded PDF using RAG
 * Returns answer with supporting evidence from the document
 * Optimized for accessibility and explainability
 */
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Validate inputs
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!vectorIndex) {
      return res.status(400).json({
        error: 'No document uploaded. Please upload a PDF first.'
      });
    }

    console.log('❓ Question:', question);

    // Create enhanced prompt with accessibility guidelines
    const enhancedQuery = `${SYSTEM_INSTRUCTIONS.answerStyle}

USER QUESTION: ${question}

Instructions:
1. Answer in simple, clear language (avoid legal jargon)
2. Break down complex concepts into easy-to-understand parts
3. Be specific about what the user needs to know or do
4. If there are warnings or important details, state them clearly
5. Base your answer ONLY on the document provided
6. If the answer isn't in the document, say "This information is not mentioned in the document"

Provide a helpful, trustworthy answer:`;

    // Create a query engine from the vector index
    // This will retrieve relevant chunks and generate an answer
    const queryEngine = vectorIndex.asQueryEngine({
      similarityTopK: 3, // Retrieve top 3 most relevant chunks for evidence
      responseMode: 'compact', // Balanced mode for quality + speed
    });

    // Query the index with the enhanced prompt
    console.log('🔎 Searching for relevant context...');
    const response = await queryEngine.query({
      query: enhancedQuery,
    });

    console.log('💡 Answer generated');

    // Extract the answer text
    const answer = response.response;

    // Extract source nodes (evidence chunks) with enhanced formatting
    const evidence = response.sourceNodes?.map((node, index) => {
      // Clean up the text for better readability
      const cleanText = node.node.text.trim().replace(/\s+/g, ' ');

      return {
        text: cleanText,
        score: node.score?.toFixed(3), // Similarity score (confidence indicator)
        chunkId: node.node.id_,
        rank: index + 1, // Evidence ranking
      };
    }) || [];

    console.log('📚 Found', evidence.length, 'evidence chunks');

    // Calculate average confidence score
    const avgConfidence = evidence.length > 0
      ? (evidence.reduce((sum, e) => sum + parseFloat(e.score), 0) / evidence.length).toFixed(3)
      : '0.000';

    // Return the answer with evidence and metadata
    res.json({
      answer: answer,
      evidence: evidence,
      summary: documentSummary, // Include summary for context
      question: question,
      confidence: avgConfidence, // Overall confidence score
      metadata: documentMetadata, // Document risk flags
    });

  } catch (error) {
    console.error('❌ Error answering question:', error);
    res.status(500).json({
      error: 'Failed to answer question',
      details: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    documentLoaded: !!vectorIndex,
    geminiConfigured: !!process.env.GOOGLE_API_KEY,
    metadata: documentMetadata,
  });
});

/**
 * GET /api/summary
 * Get the current document summary
 */
app.get('/api/summary', (req, res) => {
  if (!documentSummary) {
    return res.status(400).json({
      error: 'No document uploaded yet'
    });
  }
  res.json({
    summary: documentSummary,
    metadata: documentMetadata
  });
});

/**
 * GET /api/metadata
 * Get document risk flags and metadata
 */
app.get('/api/metadata', (req, res) => {
  if (!vectorIndex) {
    return res.status(400).json({
      error: 'No document uploaded yet'
    });
  }

  res.json({
    metadata: documentMetadata,
    flags: {
      hasDateMentions: documentMetadata.hasDateMentions ? '⚠️ Contains important dates or deadlines' : null,
      hasPenalties: documentMetadata.hasPenalties ? '⚠️ Contains fees or penalties' : null,
      hasCancellation: documentMetadata.hasCancellation ? 'ℹ️ Contains cancellation terms' : null,
      hasAutoRenewal: documentMetadata.hasAutoRenewal ? '⚠️ Contains auto-renewal clause' : null,
      hasLegalTerms: documentMetadata.hasLegalTerms ? 'ℹ️ Contains legal terms' : null,
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 TrustDocs backend running on port', PORT);
  console.log('📡 API endpoints:');
  console.log('   POST /api/upload - Upload PDF');
  console.log('   POST /api/ask - Ask question');
  console.log('   GET  /api/health - Health check');
  console.log('   GET  /api/summary - Get document summary');
  console.log('   GET  /api/metadata - Get risk flags');
  console.log('');
  console.log('⚙️  Gemini API Key configured:', !!process.env.GOOGLE_API_KEY);
  console.log('♿ Accessibility mode: ENABLED');
  console.log('🛡️  Explainability mode: ENABLED');
});

module.exports = app;