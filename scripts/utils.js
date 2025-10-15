import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emb = new OllamaEmbeddings({ 
  model: "mxbai-embed-large",
  baseUrl: "http://localhost:11434"
});
const VECTOR_FILE = path.join(__dirname, "../vectorstore.json");

function dot(a,b){ return a.reduce((s,x,i)=> s + x*b[i], 0); }
function norm(a){ return Math.sqrt(a.reduce((s,x)=> s + x*x, 0)); }
function cosine(a,b){ return dot(a,b) / (norm(a)*norm(b) + 1e-10); }


function extractYearFromContent(content) {
  // dal 2020 a 2030 e 200 caratteri
  const contentStart = content.substring(0, 200);
  const yearMatches = contentStart.match(/\b(202[0-9]|203[0])\b/g);
  
  if (yearMatches && yearMatches.length > 0) {
    // anno più recente
    return Math.max(...yearMatches.map(y => parseInt(y)));
  }
  
  return 2023; // default
}

// bonus recency (0.1 a 1.0)
function getRecencyBonus(year) {
  const currentYear = new Date().getFullYear(); 
  const maxAge = 3; // documenti fino a 3 anni fa
  
  if (year >= currentYear) return 1.0;
  
  const age = currentYear - year;
  if (age >= maxAge) return 0.1;
  
  return 1.0 - (age / maxAge) * 0.9;
}

// k: number of top documents to retrieve
export async function getTopKDocs(query, k=5){
  const qEmbArr = await emb.embedQuery(query);
  const qEmb = Array.isArray(qEmbArr) ? qEmbArr : qEmbArr[0];
  const raw = JSON.parse(await fs.readFile(VECTOR_FILE, "utf8"));
  
  const scored = raw.map(item => {
    const semanticScore = cosine(qEmb, item.embedding);
    const year = extractYearFromContent(item.content);
    const recencyBonus = getRecencyBonus(year);

    // Scoring: 90% semantic + 10% recency
    const finalScore = (semanticScore * 0.9) + (recencyBonus * 0.1);
    
    return { 
      ...item, 
      score: finalScore,
      year: year
    };
  });
  
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0, k);
}