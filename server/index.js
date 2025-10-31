import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { getTopKDocs } from "../scripts/utils.js";

// ============================================================================
// SETUP & CONFIGURATION
// ============================================================================

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const GPT_MODEL = process.env.GPT_MODEL || "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// LOAD STATIC CONTENT (for caching)
// ============================================================================

const COMPANY_PROFILE = await fs.readFile(
  path.join(__dirname, "../src/company_profile.txt"),
  "utf8"
);

const SYSTEM_PROMPT_BASE = await fs.readFile(
  path.join(__dirname, "../src/system_prompt.txt"),
  "utf8"
);

// ============================================================================
// SYSTEM PROMPT (cached)
// ============================================================================

const SYSTEM_PROMPT = `${SYSTEM_PROMPT_BASE}

Provide responses that are natural, conversational, and strictly rooted in relevant documentation, maintaining a professional yet friendly tone as specified in the company profile:
${COMPANY_PROFILE}`; 

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// In-memory storage for conversation sessions
const conversationSessions = new Map();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build messages for OpenAI API with prompt caching
 * System prompt and retrieved documents are cached for efficiency
 */
function buildMessages(retrievedDocs, conversationHistory, currentQuery) {
  const messages = [];

  // 1. System prompt (cached)
  messages.push({
    role: "system",
    content: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }
      }
    ]
  });

  // 2. Retrieved context from RAG (cached if same docs)
  const contextText = retrievedDocs
    .map(d => `Source: ${d.metadata.source}\n${d.content}`)
    .join("\n\n---\n\n");

  messages.push({
    role: "user",
    content: [
      {
        type: "text",
        text: `DOCUMENTI RILEVANTI:\n${contextText}`,
        cache_control: { type: "ephemeral" }
      }
    ]
  });

  // 3. Conversation history (last 6 messages)
  const recentHistory = conversationHistory.slice(-6);
  
  for (const msg of recentHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }

  // 4. Current query
  messages.push({
    role: "user",
    content: currentQuery
  });

  return messages;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Chat endpoint - RAG with Ollama + Response with GPT-4
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { query, sessionId, conversationHistory } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    console.log(`\n📩 Query: "${query.substring(0, 80)}..."`);

    // Generate or use existing session ID
    const currentSessionId = sessionId || Date.now().toString();
    
    // Get or create conversation history
    let history = conversationHistory || [];
    if (sessionId && conversationSessions.has(sessionId)) {
      history = conversationSessions.get(sessionId);
    }

    // === STEP 1: RAG - Retrieve relevant documents using Ollama embeddings ===
    console.log("🔍 Retrieving relevant documents with Ollama...");
    const retrievedDocs = await getTopKDocs(query, 3);
    const sources = retrievedDocs.map(d => d.metadata.source);
    console.log(`📚 Found ${retrievedDocs.length} documents: ${sources.join(", ")}`);

    // === STEP 2: Build messages with caching ===
    const messages = buildMessages(retrievedDocs, history, query);

    // === STEP 3: Generate response using GPT-4 ===
    console.log(`🤖 Generating response with ${GPT_MODEL}...`);
    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: messages,
      temperature: 0.7,
      max_completion_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    // Log token usage and caching info
    if (completion.usage) {
      const { prompt_tokens, completion_tokens, total_tokens } = completion.usage;
      console.log(`💾 Token usage - Prompt: ${prompt_tokens}, Completion: ${completion_tokens}, Total: ${total_tokens}`);
      
      if (completion.usage.prompt_tokens_details?.cached_tokens) {
        console.log(`⚡ Cached tokens: ${completion.usage.prompt_tokens_details.cached_tokens} (${Math.round(completion.usage.prompt_tokens_details.cached_tokens / prompt_tokens * 100)}% cache hit)`);
      }
    }

    // Add current exchange to history
    history.push({ role: "user", content: query });
    history.push({ role: "assistant", content: response });
    
    // Store updated history in session
    conversationSessions.set(currentSessionId, history);

    console.log("✅ Response sent\n");

    return res.json({ 
      ok: true, 
      response, 
      sources,
      sessionId: currentSessionId,
      usage: completion.usage
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err);
    res.status(500).json({ 
      error: err.message || String(err),
      details: err.response?.data || null
    });
  }
});

/**
 * Reset conversation endpoint
 */
app.post("/api/reset-conversation", async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId && conversationSessions.has(sessionId)) {
      conversationSessions.delete(sessionId);
      console.log(`🔄 Conversation reset for session: ${sessionId}`);
    }
    
    res.json({ ok: true, message: "Conversation reset successfully" });
  } catch (err) {
    console.error("❌ Error resetting conversation:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 MAIZE Collective Intelligence API`);
  console.log(`${"=".repeat(60)}`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🤖 Model: ${GPT_MODEL}`);
  console.log(`🔍 RAG: Ollama (${process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text"})`);
  console.log(`${"=".repeat(60)}\n`);
});
