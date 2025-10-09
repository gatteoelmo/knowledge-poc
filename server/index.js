import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getTopKDocs } from "../scripts/utils.js";
import { Ollama } from "@langchain/community/llms/ollama"; 
import tone from "../src/tone.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STYLE_GUIDE = await fs.readFile(path.join(__dirname, "../src/style_guidelines.txt"), "utf8");

const llm = new Ollama({ model: "mistral" }); 

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// Endpoint for natural response
app.post("/api/chat", async (req, res) => {
  try{
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // retrieval
    const top = await getTopKDocs(query, 3);
    const context = top.map(d => `Source: ${d.metadata.source}\n${d.content}`).join("\n\n---\n\n");

    // prompt for natural response
    const prompt = `
You are a MAIZE expert assistant who responds in a natural and conversational way.

RELEVANT DOCUMENTS:
${context}

QUESTION:
${query}

INSTRUCTIONS:
- Respond naturally and conversationally based EXCLUSIVELY on the relevant documents
- Use a professional but friendly tone
- Provide concrete and specific information from the projects
- Keep the response concise but complete (100-150 words)
- Respond in the same language as the question
`;

    const out = await llm.invoke(prompt);
    const response = typeof out === "string" ? out : out[0]?.text ?? String(out);

    return res.json({ 
      ok: true, 
      response, 
      sources: top.map(t => t.metadata.source),
      hasDigestOption: true 
    });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post("/api/digest", async (req, res) => {
  try{
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // retrieval
    const top = await getTopKDocs(query, 5);
    const context = top.map(d => `Source: ${d.metadata.source}\n${d.content}`).join("\n\n---\n\n");

    // prompt: request JSON output for easy parsing
    const prompt = `
You are a corporate writer who creates project cases following the MAIZE style.

STYLE GUIDELINES:
${STYLE_GUIDE}

TONE PROFILE:
${JSON.stringify(tone, null, 2)}

RELEVANT DOCUMENTS:
${context}

QUERY:
${query}

INSTRUCTIONS: 
- Respond EXCLUSIVELY based on information in the Relevant Documents.
- Produce ONLY valid JSON with three keys: "executive", "opening", "main".
  * executive: three brief sentences (Challenge / Solution / Impact), each ~20 words.
  * opening: narrative paragraph of 60-80 words, 4-6 sentences max.
  * main: text of 180-200 words organized as: Initial Conditions, Process, Collaboration, Outcomes.
- Do not add any text outside the JSON.
- Ensure all three sections are fully populated with meaningful content.
- Make sure to include concrete details from the relevant documents.
- Respond in the same language as the question

Example format:
{
  "executive": "Challenge sentence about the problem. Solution sentence about our approach. Impact sentence about the results achieved.",
  "opening": "Detailed opening paragraph that sets the context and introduces the project narrative...",
  "main": "Initial Conditions: Description of starting situation. Process: How we approached the work. Collaboration: How teams worked together. Outcomes: What was achieved and delivered."
}
`;

    // chiamata LLM
    const out = await llm.invoke(prompt);
    // llm.invoke può ritornare un object o stringa; ottieni la stringa:
    const raw = typeof out === "string" ? out : out[0]?.text ?? JSON.stringify(out);

    // proviamo a parsare JSON (il modello è istruito a restituire JSON)
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch(e){
      // fallback: invia la raw stringa per debug
      return res.json({ error: "Invalid JSON from model", raw });
    }

    return res.json({ ok: true, result: parsed, sources: top.map(t => t.metadata.source) });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// /api/export -> receives JSON (executive, opening, main) and returns docx
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
app.post("/api/export", async (req, res) => {
  try{
    const { executive, opening, main } = req.body;
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "Executive Summary", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(executive || ""),
          new Paragraph({ text: "Opening", heading: HeadingLevel.HEADING_2 }),
          new Paragraph(opening || ""),
          new Paragraph({ text: "Main Content", heading: HeadingLevel.HEADING_2 }),
          new Paragraph(main || "")
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", "attachment; filename=digest.docx");
    res.send(buffer);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));