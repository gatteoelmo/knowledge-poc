// scripts/load_docs.mjs
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import pLimit from "p-limit"; // npm install p-limit

dotenv.config();
const docsDir = path.resolve("./data/converted");
const outFile = path.resolve("./vectorstore.json");

const turboMode = process.argv.includes("--turbo");
if (turboMode) {
  console.log("🚀 TURBO MODE ACTIVATED - Maximum speed!");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===================== Embedding helpers =====================

// Batch embedding (più veloce ed economico)
async function getEmbeddingsBatch(chunks) {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks,
  });
  return resp.data.map((d) => d.embedding);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry con backoff
async function embedWithRetry(texts, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const embeddings = await getEmbeddingsBatch(texts);
      return embeddings;
    } catch (error) {
      console.log(`   ⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt === maxRetries) throw error;
      await delay(attempt * 1000); // backoff 1s, 2s
    }
  }
}

// ===================== Chunking =====================

function createChunks(text, maxChunkSize = 1500, overlap = 200) {
  if (text.length <= maxChunkSize) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length);
    if (end < text.length) {
      const naturalBreaks = ["\n\n", ". ", "\n", " "];
      let bestEnd = end;
      for (const breakPoint of naturalBreaks) {
        const lastBreak = text.lastIndexOf(breakPoint, end);
        if (lastBreak > start + maxChunkSize * 0.5) {
          bestEnd = lastBreak + breakPoint.length;
          break;
        }
      }
      end = bestEnd;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk);
    start = Math.max(end - overlap, start + Math.floor(maxChunkSize * 0.5));
    if (start >= end && end < text.length) start = end;
  }
  return chunks;
}

function createSmallChunks(text, maxChunkSize = 800, overlap = 100) {
  if (text.length <= maxChunkSize) return [text];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length);
    if (end < text.length) {
      const naturalBreaks = [". ", "\n\n", "\n"];
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
    if (chunk.length > 30) chunks.push(chunk);
    start = Math.max(end - overlap, start + Math.floor(maxChunkSize * 0.3));
    if (start >= end && end < text.length) start = end;
  }
  return chunks;
}

// ===================== File processing =====================

function isFileProblematic(filename, content) {
  const problematicIndicators = [
    content.length > 50000,
    content.split("\n").length > 1000,
    /[^\x00-\x7F]/.test(content) && content.length > 10000,
    filename.includes("(") || filename.includes("["),
    content.includes("●") || content.includes("•"),
    createChunks(content).length > 20,
  ];
  return problematicIndicators.filter(Boolean).length >= 2;
}

async function processFileWithFallback(filename, items, totalChunks) {
  const content = await fs.readFile(path.join(docsDir, filename), "utf8");
  const isProblematic = isFileProblematic(filename, content);

  console.log(
    `📖 Processing: ${filename} (${content.length} chars) ${
      isProblematic ? "🚨 [Problematic]" : "✅ [Normal]"
    }`
  );

  const chunks = isProblematic ? createSmallChunks(content) : createChunks(content);
  console.log(`   📦 Split into ${chunks.length} chunks`);

  try {
    const embeddings = await embedWithRetry(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = chunks.length === 1 ? filename : `${filename}#chunk${i + 1}`;
      items.push({
        id: chunkId,
        content: chunk,
        metadata: {
          source: filename,
          chunkIndex: i,
          totalChunks: chunks.length,
          chunkSize: chunk.length,
          processingMode: isProblematic ? "conservative" : "normal",
        },
        embedding: embeddings[i],
      });
      totalChunks++;
      console.log(`   ✅ Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    }

    console.log(`✅ Completed: ${filename}\n`);
    return totalChunks;
  } catch (error) {
    console.error(`❌ Failed ${filename}: ${error.message}`);
    throw error;
  }
}

// ===================== Main =====================

async function main() {
  const files = (await fs.readdir(docsDir)).filter((f) => f.endsWith(".txt"));
  const items = [];
  let totalChunks = 0;
  let skippedFiles = [];
  let processedFiles = 0;

  console.log("🤖 Auto-detecting and processing all files...\n");

  const limit = turboMode ? 5 : 1;
  const limiter = pLimit(limit);

  const tasks = files.map((f) =>
    limiter(async () => {
      try {
        totalChunks = await processFileWithFallback(f, items, totalChunks);
        processedFiles++;
        if (processedFiles % 10 === 0) {
          await fs.writeFile(outFile, JSON.stringify(items, null, 2));
          console.log(`💾 Autosaved after ${processedFiles} files.`);
        }
      } catch (error) {
        skippedFiles.push(f);
        console.log(`⏭️  Skipping ${f} due to error.\n`);
      }
    })
  );

  await Promise.all(tasks);

  console.log(`\n📊 Summary: ${totalChunks} total chunks from ${processedFiles} files`);
  if (skippedFiles.length > 0) {
    console.log(`⚠️  Skipped files: ${skippedFiles.join(", ")}`);
  }

  const avgChunks = processedFiles ? totalChunks / processedFiles : 0;
  const totalTokens = totalChunks * 1500; // stima media
  const estimatedCost = (totalTokens / 1000) * 0.00002; // costo text-embedding-3-small

  console.log(`📦 Avg chunks per file: ${avgChunks.toFixed(1)}`);
  console.log(`💰 Estimated embedding cost ≈ $${estimatedCost.toFixed(2)}\n`);

  await fs.writeFile(outFile, JSON.stringify(items, null, 2), "utf8");
  console.log("✅ Complete vectorstore saved to", outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
