// TrustDocs Backend - Multilingual Explainable Document Assistant
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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// In-memory storage
let currentDocumentText = '';
let vectorIndex = null;
let documentSummary = null;
let documentMetadata = {};

// Configure LlamaIndex
Settings.llm = new Ollama({
  model: "qwen2.5:7b-instruct",
  temperature: 0.3,
});

Settings.embedModel = new OllamaEmbedding({
  model: "mxbai-embed-large",
});

// Language-specific prompts for Indian languages and Hinglish support
const LANGUAGE_NAMES = {
  'en': 'English',
  'hi': 'Hindi (हिंदी)',
  'mr': 'Marathi (मराठी)',
  'ta': 'Tamil (தமிழ்)',
  'ml': 'Malayalam (മലയാളം)',
  'bn': 'Bengali (বাংলা)',
  'ur': 'Urdu (اردو)',
  'as': 'Assamese (অসমীয়া)',
  'pa': 'Punjabi (ਪੰਜਾਬੀ)'
};

const LANGUAGE_INSTRUCTIONS = {
  'en': 'English only',
  'hi': 'Hindi (हिंदी) - you can also mix with English (Hinglish is fine)',
  'mr': 'Marathi (मराठी) - you can also mix with English',
  'ta': 'Tamil (தமிழ்) - you can also mix with English (Tanglish is fine)',
  'ml': 'Malayalam (മലയാളം) - you can also mix with English (Manglish is fine)',
  'bn': 'Bengali (বাংলা) - you can also mix with English (Benglish is fine)',
  'ur': 'Urdu (اردو) - you can also mix with English',
  'as': 'Assamese (অসমীয়া) - you can also mix with English',
  'pa': 'Punjabi (ਪੰਜਾਬੀ) - you can also mix with English (Punglish is fine)'
};

function getSystemPrompt(language = 'en') {
  const langName = LANGUAGE_NAMES[language] || 'English';
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || 'English only';

  return `You are TrustDocs, an AI assistant helping Indian users understand complex documents. 
Your users may have limited literacy, cognitive disabilities, or prefer their regional language.

CRITICAL RULES:
1. Respond in ${langInstruction}
2. The user may type in Romanized script (Hinglish/Tanglish etc.) - understand and respond naturally
3. If user asks in mixed language (English + regional), respond in the same mixed style
4. Use very simple words (5th grade level)
5. Short sentences (max 15 words per sentence)
6. No complex English/legal jargon - explain technical terms immediately in simple ${langName}
7. Be direct and specific
8. Focus on what matters: obligations (zimmedari), rights (adhikar), risks (khatre), deadlines (ant-tithi)
9. Always cite where info comes from in the document
10. If something is unclear, say so clearly in ${langName}

Your goal: Build TRUST (vishwas/நம்பிக்கை) through clarity and honesty.`;
}

function getSummaryPrompt(language = 'en') {
  const langName = LANGUAGE_NAMES[language] || 'English';
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || 'English only';

  return `Analyze this document and create a structured summary in ${langInstruction}.

The user understands ${langName}. They may speak Hinglish, Tanglish, or other mixed languages. 
Respond naturally in the way they would speak.

You MUST return a valid JSON object with this EXACT structure:
{
  "introduction": "Brief overview here",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "warnings": ["warning 1", "warning 2"],
  "nextSteps": ["action 1", "action 2", "action 3"]
}

INSTRUCTIONS:
- introduction: Describe what the document is.
- keyPoints: Extract 5 vital obligations or terms.
- warnings: Note any risks or penalties.
- nextSteps: What should the person do next?

DO NOT COPY the words "Brief overview here", "point 1", etc. Replace them with real information from the document.
BASE EVERYTHING ON THE PROVIDED TEXT.

Use VERY simple ${langName}. Mix English where natural.
Return ONLY valid JSON, no extra text.`;
}

function getAnswerPrompt(question, context, language = 'en') {
  const langName = LANGUAGE_NAMES[language] || 'English';
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || 'English only';

  return `${getSystemPrompt(language)}

DOCUMENT CONTEXT (use ONLY this information to answer):
---
${context}
---

USER QUESTION: ${question}

IMPORTANT: The user asked in their natural style. If they used Hinglish (Hindi+English), Tanglish (Tamil+English), 
or any mixed language, respond in the SAME mixed style. Match their comfort level.

You MUST return a valid JSON object with this EXACT structure:
{
  "simpleAnswer": "Your direct answer based on the document context above",
  "breakdown": ["Explanation point 1 from document", "Explanation point 2 from document"],
  "keyFacts": ["Specific fact from document", "Another specific fact"]
}

CRITICAL INSTRUCTIONS:
- simpleAnswer: Provide a SPECIFIC answer using EXACT information from the DOCUMENT CONTEXT above.
- breakdown: Explain using SPECIFIC details from the document. Quote actual terms, dates, amounts.
- keyFacts: List ACTUAL dates, prices, names, terms from the document context.

DO NOT use generic phrases like "Submit by the 1st date" or "Form submission is required".
ONLY use SPECIFIC information from the DOCUMENT CONTEXT above.
If the information is NOT in the document context, say "This information is not in the document."

Rules:
1. Respond in ${langInstruction}
2. Match the user's language mixing style (Hinglish/Tanglish acceptable)
3. Very simple words
4. Short sentences
5. Be SPECIFIC - use actual amounts, dates, names from the document
6. Use ₹ for Indian Rupees
7. DO NOT Make up information. ONLY use the provided document context.

Return ONLY valid JSON, no extra text.`;
}

// Text chunking with overlap
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

// Generate structured summary
async function generateSummary(text, language = 'en') {
  try {
    const prompt = `${getSummaryPrompt(language)}

Document:
${text.slice(0, 12000)}

Return ONLY the JSON object:`;

    const llm = Settings.llm;
    const response = await llm.complete({ prompt });

    const summaryText = response.text.trim();
    const cleanText = summaryText.replace(/```json\n?|\n?```/g, '').trim();

    // Parse and validate JSON
    const summary = JSON.parse(cleanText);

    // Ensure structure
    return {
      introduction: summary.introduction || "Document uploaded successfully.",
      keyPoints: Array.isArray(summary.keyPoints) ? summary.keyPoints.slice(0, 5) : [],
      warnings: Array.isArray(summary.warnings) ? summary.warnings.slice(0, 3) : [],
      nextSteps: Array.isArray(summary.nextSteps) ? summary.nextSteps.slice(0, 3) : []
    };
  } catch (error) {
    console.error('Error generating summary:', error);

    // Fallback structured summary
    return {
      introduction: language === 'hi'
        ? "Aapka document upload ho gaya hai. Ab aap koi bhi sawal pooch sakte hain."
        : language === 'ta'
          ? "உங்கள் ஆவணம் பதிவேற்றப்பட்டது. இப்போது கேள்விகள் கேளுங்கள்."
          : "Your document has been uploaded and is ready for questions.",
      keyPoints: language === 'hi' ? [
        "Document ke baare mein kuch bhi pooch sakte hain",
        "Saare answers mein document se quotes milenge",
        "Aap simple language mein pooch sakte hain",
        "Assistant sab kuch clearly samjhayega",
        "Fees, dates, terms ke baare mein poochiye"
      ] : language === 'ta' ? [
        "ஆவணத்தைப் பற்றி எதுவும் கேளுங்கள்",
        "எல்லா பதில்களிலும் ஆவணத்திலிருந்து மேற்கோள்கள்",
        "எளிய மொழியில் கேளுங்கள்",
        "உதவியாளர் அனைத்தையும் தெளிவாக விளக்குவார்",
        "கட்டணங்கள், தேதிகள், விதிமுறைகளைப் பற்றி கேளுங்கள்"
      ] : [
        "Ask questions about any part of the document",
        "All answers will include quotes from the document",
        "You can ask in simple language or Hinglish",
        "The assistant will explain everything clearly",
        "Ask about terms, costs, dates, or anything unclear"
      ],
      warnings: language === 'hi' ? [
        "Sign karne se pehle pura document dhyan se padhiye"
      ] : language === 'ta' ? [
        "கையொப்பமிடுவதற்கு முன் முழு ஆவணத்தையும் படியுங்கள்"
      ] : [
        "Read the full document carefully before signing"
      ],
      nextSteps: language === 'hi' ? [
        "Jo samajh na aaye uske baare mein sawal poochiye",
        "Zimmedari, kharcha aur deadlines ke baare mein focus kariye",
        "Mushkil shabdon ki explanation maangiye"
      ] : language === 'ta' ? [
        "புரியாதவற்றைப் பற்றி கேள்விகள் கேளுங்கள்",
        "கடமைகள், செலவுகள், காலக்கெடுக்களில் கவனம் செலுத்துங்கள்",
        "கடினமான சொற்களின் விளக்கம் கேளுங்கள்"
      ] : [
        "Ask questions about anything you don't understand",
        "Focus on obligations, costs, and deadlines",
        "Request explanations of difficult terms"
      ]
    };
  }
}

// Extract metadata for risk flagging
function extractMetadata(text) {
  return {
    hasDateMentions: /\b(deadline|due date|expires|expiration|effective date)\b/i.test(text),
    hasPenalties: /\b(penalty|penalties|fine|fines|fee|fees|charge)\b/i.test(text),
    hasCancellation: /\b(cancel|cancellation|terminate|termination|refund)\b/i.test(text),
    hasAutoRenewal: /\b(auto.?renew|automatic.?renewal|automatically.?renew)\b/i.test(text),
    hasLegalTerms: /\b(agree|consent|waive|liability|indemnify|arbitration)\b/i.test(text),
  };
}

/**
 * POST /api/upload
 * Upload PDF, extract text, create index, generate structured summary
 */
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const language = req.body.language || 'en';
    console.log('📄 Processing PDF:', req.file.originalname, 'Language:', language);

    const pdfData = await parsePdf(req.file.buffer);
    currentDocumentText = pdfData.text;

    console.log('📝 Extracted text length:', currentDocumentText.length);

    documentMetadata = extractMetadata(currentDocumentText);
    console.log('🏷️  Metadata:', documentMetadata);

    const chunks = chunkText(currentDocumentText, 1000, 200);
    console.log('✂️  Created', chunks.length, 'chunks');

    const documents = chunks.map((chunk, index) =>
      new Document({ text: chunk, id_: `chunk_${index}` })
    );

    console.log('🔍 Building vector index...');
    vectorIndex = await VectorStoreIndex.fromDocuments(documents);
    console.log('✅ Vector index created');

    console.log('📋 Generating structured summary in', language);
    documentSummary = await generateSummary(currentDocumentText, language);
    console.log('✅ Summary generated');

    res.json({
      success: true,
      message: 'PDF uploaded and indexed successfully',
      filename: req.file.originalname,
      textLength: currentDocumentText.length,
      chunks: chunks.length,
      summary: documentSummary,
      metadata: documentMetadata,
      language: language
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
 * Answer questions with structured, accessible responses
 */
app.post('/api/ask', async (req, res) => {
  try {
    const { question, language = 'en' } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!vectorIndex) {
      return res.status(400).json({
        error: 'No document uploaded. Please upload a PDF first.'
      });
    }

    console.log('❓ Question:', question, 'Language:', language);

    // Step 1: Retrieve relevant document chunks using the retriever
    const retriever = vectorIndex.asRetriever({ similarityTopK: 5 });

    console.log('🔎 Retrieving relevant context...');
    const retrievedNodes = await retriever.retrieve(question);

    // Step 2: Combine retrieved chunks into context
    const contextChunks = retrievedNodes.map(node => node.node.text.trim());
    const combinedContext = contextChunks.join('\n\n---\n\n');

    console.log('📚 Retrieved', retrievedNodes.length, 'context chunks');
    console.log('� Context length:', combinedContext.length, 'characters');

    // Step 3: Create the prompt with actual document context
    const fullPrompt = getAnswerPrompt(question, combinedContext, language);

    // Step 4: Generate answer using LLM directly with the context
    console.log('🤖 Generating answer...');
    const llm = Settings.llm;
    const llmResponse = await llm.complete({ prompt: fullPrompt });

    console.log('💡 Raw response:', llmResponse.text);

    // Parse structured answer
    let structuredAnswer;
    try {
      const answerText = llmResponse.text.trim();
      const cleanAnswer = answerText.replace(/```json\n?|\n?```/g, '').trim();
      structuredAnswer = JSON.parse(cleanAnswer);
    } catch (parseError) {
      console.error('Failed to parse JSON, using fallback. Error:', parseError.message);
      // Fallback: use raw response
      structuredAnswer = {
        simpleAnswer: llmResponse.text.slice(0, 500),
        breakdown: [],
        keyFacts: []
      };
    }

    // Extract evidence from retrieved nodes
    const evidence = retrievedNodes.map((node, index) => {
      const cleanText = node.node.text.trim().replace(/\s+/g, ' ');
      return {
        text: cleanText.slice(0, 250),
        score: node.score?.toFixed(3),
        chunkId: node.node.id_,
        rank: index + 1,
      };
    });

    const avgConfidence = evidence.length > 0
      ? (evidence.reduce((sum, e) => sum + parseFloat(e.score || 0), 0) / evidence.length).toFixed(3)
      : '0.000';

    res.json({
      answer: structuredAnswer,
      evidence: evidence,
      question: question,
      confidence: avgConfidence,
      metadata: documentMetadata,
      language: language
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
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    documentLoaded: !!vectorIndex,
    metadata: documentMetadata,
  });
});

/**
 * GET /api/summary
 */
app.get('/api/summary', (req, res) => {
  if (!documentSummary) {
    return res.status(400).json({ error: 'No document uploaded yet' });
  }
  res.json({
    summary: documentSummary,
    metadata: documentMetadata
  });
});

app.listen(PORT, () => {
  console.log('🚀 TrustDocs backend running on port', PORT);
  console.log('📡 API endpoints:');
  console.log('   POST /api/upload - Upload PDF');
  console.log('   POST /api/ask - Ask question');
  console.log('   GET  /api/health - Health check');
  console.log('   GET  /api/summary - Get summary');
  console.log('');
  console.log('🇮🇳 Indian languages support: ENABLED');
  console.log('   - English, Hindi, Marathi, Tamil, Malayalam');
  console.log('   - Bengali, Urdu, Assamese, Punjabi');
  console.log('💬 Hinglish/Tanglish/Mixed: SUPPORTED');
  console.log('♿ Accessibility mode: ENABLED');
  console.log('🛡️  Structured outputs: ENABLED');
});

module.exports = app;