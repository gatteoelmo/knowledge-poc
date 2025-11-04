// scripts/retrieval.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VECTOR_FILE = path.join(__dirname, "../vectorstore.json");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===================== Utility matematiche =====================
function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
function norm(a) { return Math.sqrt(a.reduce((s, x) => s + x * x, 0)); }
function cosine(a, b) { return dot(a, b) / (norm(a) * norm(b) + 1e-10); }
function normalize(v) {
  const n = norm(v);
  return v.map(x => x / (n + 1e-10));
}

// ===================== Cache & caricamento store =====================
const queryCache = new Map();
let cachedStore = null;

async function loadVectorStore() {
  if (!cachedStore) {
    const raw = await fs.readFile(VECTOR_FILE, "utf8");
    cachedStore = JSON.parse(raw);
  }
  return cachedStore;
}

// ===================== OpenAI Embeddings con retry =====================
async function getOpenAIEmbedding(text, retries = 2) {
  if (queryCache.has(text)) return queryCache.get(text);

  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      const emb = resp.data[0].embedding;
      queryCache.set(text, emb);
      return emb;
    } catch (e) {
      if (i === retries) throw e;
      console.warn(`⚠️ Retrying embedding (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// ===================== Recency bonus =====================
function extractYearFromContent(content) {
  // Cerca anni dal 2020 al 2030 nei primi 200 caratteri
  const contentStart = content.substring(0, 200);
  const yearMatches = contentStart.match(/\b(202[0-9]|2030)\b/g);
  if (yearMatches && yearMatches.length > 0) {
    return Math.max(...yearMatches.map(y => parseInt(y)));
  }
  return 2023; // default
}

function getRecencyBonus(year) {
  const currentYear = new Date().getFullYear();
  const maxAge = 3;
  if (year >= currentYear) return 1.0;
  const age = currentYear - year;
  if (age >= maxAge) return 0.1;
  return 1.0 - (age / maxAge) * 0.9;
}

// ===================== Retrieval =====================
export async function getTopKDocs(query, k = 5) {
  const DEBUG = process.env.DEBUG_RETRIEVAL === "true";
  const raw = await loadVectorStore();
  const qEmb = normalize(await getOpenAIEmbedding(query));

  const scored = raw.map(item => {
    const semanticScore = cosine(qEmb, item.embedding);
    const year = extractYearFromContent(item.content);
    const recencyBonus = getRecencyBonus(year);

    // Scoring: 90% semantico + 10% bonus temporale, con leggero sharpening
    const finalScore = (semanticScore ** 1.2) * 0.9 + recencyBonus * 0.1;

    return {
      ...item,
      score: finalScore,
      year
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Filtro minimo per evitare risultati irrilevanti (abbassato per query generiche)
  const MIN_SCORE = 0.3;
  const filtered = scored.filter(s => s.score > MIN_SCORE);
  const results = filtered.slice(0, k);

  if (DEBUG) {
    console.log(`🧠 Query: "${query}"`);
    console.log("📊 Top results:");
    results.forEach((r, i) =>
      console.log(` ${i + 1}. ${r.id} | score=${r.score.toFixed(3)} | year=${r.year}`)
    );
  }

  return results;
}

// ===================== CLI (opzionale) =====================
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error("❌ Usage: node retrieval.mjs <your query>");
    process.exit(1);
  }
  const topDocs = await getTopKDocs(query, 5);
  console.log("\n🧾 Top matching documents:\n");
  for (const doc of topDocs) {
    console.log(`📄 ${doc.id} (${doc.year}) | Score: ${doc.score.toFixed(3)}`);
    console.log(`   ${doc.content.substring(0, 160).replace(/\s+/g, " ")}...\n`);
  }
}
