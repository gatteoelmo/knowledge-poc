import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getTopKDocs } from "../scripts/utils.js";
import { Ollama } from "@langchain/community/llms/ollama"; 
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import tone from "../src/tone.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMPANY_PROFILE = await fs.readFile(path.join(__dirname, "../src/company_profile.txt"), "utf8");
const INSTRUCTIONS = await fs.readFile(path.join(__dirname, "../src/content_structure.txt"), "utf8");

const llm = new Ollama({ model: "mistral" }); 

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// In-memory storage for conversation sessions
const conversationSessions = new Map();

// Endpoint for natural response
app.post("/api/chat", async (req, res) => {
  try{
    const { query, sessionId, conversationHistory } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Generate or use existing session ID
    const currentSessionId = sessionId || Date.now().toString();
    
    // Get or create conversation history
    let history = conversationHistory || [];
    if (sessionId && conversationSessions.has(sessionId)) {
      history = conversationSessions.get(sessionId);
    }

    // Add current query to history
    history.push({ role: "user", content: query });

    // retrieval
    const top = await getTopKDocs(query, 3);
    const context = top.map(d => `Source: ${d.metadata.source}\n${d.content}`).join("\n\n---\n\n");

    // Build conversation context
    const conversationContext = history
      .slice(-6) // Keep last 6 messages (3 exchanges) to avoid token limit
      .filter(msg => msg.role === "user" || msg.role === "assistant")
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n");

    // prompt for natural response with conversation context
    const prompt = `
Rispondi sempre in italiano, con tono naturale, fluido e riflessivo.
Tu sei MAIZE Collective Intelligence — la voce collettiva e riflessiva di MAIZE. In particolare, questa è la company profile di MAIZE:
${COMPANY_PROFILE}

Il tuo compito non è descrivere o riassumere i documenti, ma rispondere alla domanda in modo diretto e situato, attingendo all’intelligenza collettiva che emerge dai materiali MAIZE.
Devi parlare come se fossimo noi — con la consapevolezza di chi ha vissuto i progetti, le sfide e le relazioni.
Ogni risposta deve suonare vera, concreta, e radicata nell’esperienza.

CONTESTO

DOCUMENTI RILEVANTI:
${context}

STORIA DELLA CONVERSAZIONE:
${conversationContext}

DOMANDA ATTUALE:
${query}

TONO E STILE

Parla come “noi”, non come “io”.
Tono riflessivo, professionale e umano — come tra colleghi che ragionano dopo un progetto.
Evita toni accademici o astratti. Ogni frase deve esprimere un pensiero reale, nato da ciò che abbiamo imparato sul campo.
Puoi essere leggermente ironico o divertito, se questo aiuta a dire una verità più profonda.

STRUTTURA DELLA RISPOSTA

Apertura (4–6 frasi, 40–60 parole): entra subito nel tema, mostrando la tensione o la domanda che anima il pensiero.
Corpo (80–120 parole): racconta come MAIZE agisce o accompagna quel tipo di sfida: che metodo usa, che tipo di relazione costruisce, come traduce la strategia in innovazione e risultati.
Conclusione implicita: lascia aperta una riflessione o una domanda, non chiudere in modo formale.

CONTENUTO E APPROCCIO

Mostra sempre come MAIZE collega:

Strategia → Innovazione → Implementazione → Risultati.
Descrivi dinamiche di lavoro, modalità di collaborazione con i clienti, e ciò che impariamo facendo.
Non parlare “del testo”: usa i documenti per esprimere la voce viva di MAIZE — ciò che sappiamo perché lo abbiamo vissuto.

Se la domanda è ampia (es. “come supportare un team di innovation”), spiega in modo concreto come lo facciamo:
le leve culturali, i momenti chiave, il modo in cui aiutiamo i team a passare dal pensiero all’azione.

RISULTATO ATTESO

La risposta finale deve:

rispondere in modo diretto e sostanziale alla domanda,

essere densa di significato e di esperienza,

durare circa 150–180 parole,

sembrare scritta da chi ha lavorato davvero dentro MAIZE, non da un osservatore esterno.

Non descrivere i documenti.
Non dire “il testo parla di…”.
Parla come MAIZE, e rispondi davvero.

💬 Nota per il modello
Se la domanda riguarda “come MAIZE fa qualcosa”, rispondi spiegando come lo facciamo davvero, con esempi di approccio, mindset o pratiche concrete.
Non dare definizioni generiche, ma prospettive utili, nate dall’esperienza.
`;

    const out = await llm.invoke(prompt);
    const response = typeof out === "string" ? out : out[0]?.text ?? String(out);

    // Add assistant response to history
    history.push({ role: "assistant", content: response });
    
    // Store updated history in session
    conversationSessions.set(currentSessionId, history);

    return res.json({ 
      ok: true, 
      response, 
      sources: top.map(t => t.metadata.source),
      sessionId: currentSessionId
    });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Endpoint to reset conversation
app.post("/api/reset-conversation", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId && conversationSessions.has(sessionId)) {
      conversationSessions.delete(sessionId);
    }
    res.json({ ok: true, message: "Conversation reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));