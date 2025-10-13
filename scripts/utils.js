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

// k: number of top documents to retrieve
export async function getTopKDocs(query, k=5){
  const qEmbArr = await emb.embedQuery(query);
  const qEmb = Array.isArray(qEmbArr) ? qEmbArr : qEmbArr[0];
  const raw = JSON.parse(await fs.readFile(VECTOR_FILE, "utf8"));
  const scored = raw.map(item => ({ ...item, score: cosine(qEmb, item.embedding) }));
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0, k);
}