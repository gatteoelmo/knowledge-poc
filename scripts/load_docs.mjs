// scripts/load_docs.mjs
import fs from "fs/promises";
import path from "path";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const docsDir = path.resolve("./data/converted");
const outFile = path.resolve("./vectorstore.json");

// Modalità turbo: usa --turbo come argomento per andare al massimo della velocità
const turboMode = process.argv.includes('--turbo');
if (turboMode) {
  console.log("🚀 TURBO MODE ACTIVATED - Maximum speed!");
}

const emb = new OllamaEmbeddings({ model: "nomic-embed-text", baseUrl: "http://localhost:11434" }); // modello più veloce

// Funzione per delay tra richieste (usato solo in casi eccezionali)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funzione per retry veloce
async function embedWithRetry(text, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const embedding = await emb.embedDocuments([text]);
      return embedding[0];
    } catch (error) {
      console.log(`   ⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Backoff veloce: 1s, 2s
      const delayTime = attempt * 1000;
      await delay(delayTime);
    }
  }
}

// Funzione per dividere il testo in chunks intelligenti
function createChunks(text, maxChunkSize = 1500, overlap = 200) {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length);
    
    // Se non siamo alla fine del testo, trova un punto di interruzione naturale
    if (end < text.length) {
      // Cerca nell'ordine: paragrafo, frase, riga, parola
      const naturalBreaks = ['\n\n', '. ', '\n', ' '];
      let bestEnd = end;
      
      for (const breakPoint of naturalBreaks) {
        const lastBreak = text.lastIndexOf(breakPoint, end);
        if (lastBreak > start + maxChunkSize * 0.5) { // Almeno 50% della dimensione chunk
          bestEnd = lastBreak + breakPoint.length;
          break;
        }
      }
      
      end = bestEnd;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) { // Solo chunks significativi
      chunks.push(chunk);
    }
    
    // Avanza di almeno overlap, ma assicurati di fare progresso
    const nextStart = Math.max(end - overlap, start + Math.floor(maxChunkSize * 0.5));
    start = nextStart;
    
    // Evita loop infiniti
    if (start >= end && end < text.length) {
      start = end;
    }
  }

  return chunks;
}

// Funzione per chunks più piccoli per file problematici
function createSmallChunks(text, maxChunkSize = 800, overlap = 100) {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length);
    
    if (end < text.length) {
      const naturalBreaks = ['. ', '\n\n', '\n'];
      let bestEnd = end;
      
      for (const breakPoint of naturalBreaks) {
        const lastBreak = text.lastIndexOf(breakPoint, end);
        if (lastBreak > start + maxChunkSize * 0.6) {
          bestEnd = lastBreak + breakPoint.length;
          break;
        }
      }
      
      end = bestEnd;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 30) {
      chunks.push(chunk);
    }
    
    start = Math.max(end - overlap, start + Math.floor(maxChunkSize * 0.3));
    
    if (start >= end && end < text.length) {
      start = end;
    }
  }

  return chunks;
}

// Retry moderato per file problematici
async function embedWithConservativeRetry(text, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const embedding = await emb.embedDocuments([text]);
      return embedding[0];
    } catch (error) {
      console.log(`   ⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Delay moderato: 2s, 4s
      const delayTime = attempt * 2000;
      await delay(delayTime);
    }
  }
}

async function processProblematicFile(filename, items, totalChunks) {
  console.log(`🚨 Processing problematic file with conservative settings: ${filename}`);
  
  try {
    const content = await fs.readFile(path.join(docsDir, filename), "utf8");
    console.log(`   📖 File size: ${content.length} chars`);
    
    // Usa chunks più piccoli per file problematici
    const chunks = createSmallChunks(content);
    console.log(`   📦 Split into ${chunks.length} small chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      console.log(`   🔄 Processing chunk ${i + 1}/${chunks.length}...`);
      const embedding = await embedWithConservativeRetry(chunk);
      
      const chunkId = chunks.length === 1 ? filename : `${filename}#chunk${i + 1}`;
      
      items.push({
        id: chunkId,
        content: chunk,
        metadata: { 
          source: filename,
          chunkIndex: i,
          totalChunks: chunks.length,
          chunkSize: chunk.length,
          processingMode: "conservative"
        },
        embedding: embedding
      });
      
      totalChunks++;
      console.log(`   ✅ Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    }
    
    console.log(`✅ Completed problematic file: ${filename}\n`);
    return totalChunks;
    
  } catch (error) {
    console.error(`❌ Failed to process problematic file ${filename}: ${error.message}`);
    console.log(`   This file needs manual attention.\n`);
    throw error;
  }
}

// Funzione per rilevare se un file è problematico
function isFileProblematic(filename, content) {
  // Euristiche per rilevare file problematici
  const problematicIndicators = [
    content.length > 50000, // File molto grandi
    content.split('\n').length > 1000, // Molte righe
    /[^\x00-\x7F]/.test(content) && content.length > 10000, // Caratteri non-ASCII + grandi
    filename.includes('(') || filename.includes('['), // Nomi file con caratteri speciali
    content.includes('●') || content.includes('•'), // Bullet points Unicode
    createChunks(content).length > 20, // Molti chunks
  ];
  
  const score = problematicIndicators.filter(Boolean).length;
  return score >= 2; // Se almeno 2 indicatori sono veri
}

// Funzione per processare un file con fallback automatico
async function processFileWithFallback(filename, items, totalChunks) {
  const content = await fs.readFile(path.join(docsDir, filename), "utf8");
  const isProblematic = isFileProblematic(filename, content);
  
  console.log(`📖 Processing: ${filename} (${content.length} chars) ${isProblematic ? '🚨 [Auto-detected as problematic]' : '✅ [Normal]'}`);
  
  if (isProblematic) {
    console.log(`   🔄 Using conservative settings for ${filename}...`);
    return await processProblematicFile(filename, items, totalChunks);
  }
  
  // Prova prima con settings normali
  try {
    const chunks = createChunks(content);
    console.log(`   Split into ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      const embedding = await embedWithRetry(chunk);
      const chunkId = chunks.length === 1 ? filename : `${filename}#chunk${i + 1}`;
      
      items.push({
        id: chunkId,
        content: chunk,
        metadata: { 
          source: filename,
          chunkIndex: i,
          totalChunks: chunks.length,
          chunkSize: chunk.length,
          processingMode: "normal"
        },
        embedding: embedding
      });
      
      totalChunks++;
      console.log(`   ✅ Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    }
    
    return totalChunks;
    
  } catch (error) {
    console.log(`   ⚠️  Normal processing failed for ${filename}: ${error.message}`);
    console.log(`   🔄 Switching to conservative mode automatically...`);
    
    // Fallback automatico a modalità conservativa
    return await processProblematicFile(filename, items, totalChunks);
  }
}

async function main(){
  const files = await fs.readdir(docsDir);
  const items = [];
  let totalChunks = 0;
  let skippedFiles = [];
  let processedFiles = 0;

  console.log("🤖 Auto-detecting and processing all files...\n");
  
  for (const f of files){
    if (!f.endsWith(".txt")) continue;
    
    try {
      totalChunks = await processFileWithFallback(f, items, totalChunks);
      processedFiles++;
      console.log(`✅ Completed: ${f}\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${f}: ${error.message}`);
      console.log(`⏭️  Skipping file and continuing...\n`);
      skippedFiles.push(f);
      continue;
    }
  }

  console.log(`\n📊 Summary: ${totalChunks} total chunks from ${processedFiles} files`);
  
  if (skippedFiles.length > 0) {
    console.log(`⚠️  Skipped files: ${skippedFiles.join(', ')}`);
  }
  
  await fs.writeFile(outFile, JSON.stringify(items, null, 2), "utf8");
  console.log("✅ Complete vectorstore saved to", outFile);
}

main().catch(err => { console.error(err); process.exit(1); });
