// scripts/load_docs.mjs
import fs from "fs/promises";
import path from "path";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const docsDir = path.resolve("./docs");
const outFile = path.resolve("./vectorstore.json");

const emb = new OllamaEmbeddings({ model: "mxbai-embed-large" }); // modello locale Ollama

async function main(){
  const files = await fs.readdir(docsDir);
  const items = [];

  for (const f of files){
    if (!f.endsWith(".txt")) continue;
    const content = await fs.readFile(path.join(docsDir, f), "utf8");
    // per sicurezza tronca in chunk se file troppo lungo (meglio avere chunk + metadata)
    const embedding = await emb.embedDocuments([content]); // ritorna array
    items.push({
      id: f,
      content,
      metadata: { source: f },
      embedding: embedding[0]
    });
    console.log("Indexed:", f);
  }

  await fs.writeFile(outFile, JSON.stringify(items, null, 2), "utf8");
  console.log("✅ Vectorstore saved to", outFile);
}

main().catch(err => { console.error(err); process.exit(1); });
