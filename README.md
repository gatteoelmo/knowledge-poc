# 🧠 MAIZE Collective Intelligence

```bash

Sistema RAG (Retrieval-Augmented Generation) che combina embeddings Ollama con GPT-4 per rispondere a domande sulla knowledge base di MAIZE.git clone https://github.com/gatteoelmo/knowledge-poc.git

```

## 🚀 Quick Start```bash

cd knowledge-poc

### Metodo 1: Script Shell (Consigliato)```

if u have some pptx/key/pdf file convert with

```bash```bash

# Start veloce (se tutto è già configurato)python3 scripts/convert_to_txt_all.py

./start.sh```

```bash

# Oppure start completo da zeroollama pull mistral

./full-start.sh```

``````bash

ollama pull mxbai-embed-large

### Metodo 2: Comandi npm```

```bash

```bashollama run

# Start veloce```

npm run quick-start```bash

npm install

# Start completo da zero```

npm run full-start```bash

```node scripts/load_docs.mjs

```

**📖 Per la guida completa**: Vedi [QUICK-START.md](QUICK-START.md)```bash

node server/index.js

---```

```bash

## 📋 Prerequisiticd frontend

```

1. **Node.js** - [Download](https://nodejs.org/)```bash

2. **Python 3** - [Download](https://www.python.org/)npm install

3. **Ollama** - [Download](https://ollama.ai/)```

4. **OpenAI API Key** - [Get key](https://platform.openai.com/api-keys)```bash

npm run dev

---```

## ⚙️ Setup Iniziale

### 1. Installa dipendenze
```bash
npm install
```

### 2. Configura variabili d'ambiente
```bash
# Copia il template
cp .env.example .env

# Modifica .env e inserisci la tua OpenAI API key
nano .env
```

### 3. Avvia Ollama (terminale separato)
```bash
ollama serve
```

### 4. Scarica il modello di embedding
```bash
ollama pull nomic-embed-text
```

### 5. Avvia l'applicazione
```bash
./start.sh
# oppure
npm run quick-start
```

---

## 📁 Struttura Progetto

```
knowledge-poc/
├── 📝 src/
│   ├── system_prompt.txt       # System prompt (modificabile!)
│   └── company_profile.txt     # Company profile
├── 🚀 server/
│   └── index.js                # Backend API
├── ⚛️  frontend/                # React frontend
├── 🛠️  scripts/
│   ├── convert_to_txt_all.py   # Conversione documenti
│   ├── load_docs.mjs           # Generazione vectorstore
│   └── utils.js                # Utility RAG
├── 📁 docs/                    # Documenti sorgente
├── ⚙️  .env                     # Configurazione
├── 📖 QUICK-START.md           # Guida dettagliata
└── 🚀 start.sh                 # Script avvio veloce
```

---

## 🎯 Comandi Principali

| Comando | Descrizione |
|---------|-------------|
| `./start.sh` | 🚀 Avvio veloce (backend + frontend) |
| `./full-start.sh` | 🔄 Setup completo da zero |
| `npm run quick-start` | Come `./start.sh` |
| `npm run full-start` | Come `./full-start.sh` |
| `npm run setup` | 🛠️ Solo conversione + vectorstore |
| `npm start` | 🖥️ Solo backend |
| `npm run frontend` | ⚛️ Solo frontend |

---

## ✏️ Personalizzazione

### Modificare il System Prompt
Il system prompt ora è in un **file separato** facile da modificare:

1. Apri `src/system_prompt.txt`
2. Modifica il testo
3. Riavvia il server
4. ✅ Le modifiche vengono caricate automaticamente!

### Cambiare Modello GPT
Nel file `.env`:
```env
GPT_MODEL=gpt-4o          # Raccomandato
# GPT_MODEL=gpt-4o-mini   # Più economico
# GPT_MODEL=gpt-4-turbo   # Alternative
```

### Aggiungere Nuovi Documenti
1. Aggiungi file nella cartella `docs/`
2. Rigenera vectorstore: `npm run setup`
3. Riavvia: `./start.sh`

---

## 🏗️ Architettura

```
User Query
    ↓
[RAG con Ollama]
    ↓ (Top 3 documenti rilevanti)
[Build Messages con Caching]
    ↓
[GPT-4 Generation]
    ↓
Response
```

### 💾 Prompt Caching
- ⚡ System prompt → Cachato
- ⚡ Documenti RAG → Cachati se identici
- 💰 Risparmio: ~70-80% token

---

## 🔗 Porte

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173
- **Ollama**: http://localhost:11434

---

## 🐛 Troubleshooting

### "fetch failed" / "ECONNREFUSED"
```bash
# Soluzione: Avvia Ollama
ollama serve
```

### "Missing API key"
```bash
# Soluzione: Configura .env
nano .env
# Aggiungi: OPENAI_API_KEY=sk-...
```

### "Model not found"
```bash
# Soluzione: Scarica il modello
ollama pull nomic-embed-text
```

---

## 📊 Monitoring

Il server logga automaticamente:
- 📩 Query ricevute
- 🔍 Documenti recuperati (RAG)
- 💾 Token usage
- ⚡ Cache hit rate

Esempio:
```
📩 Query: "Come lavora MAIZE..."
🔍 Retrieving relevant documents with Ollama...
📚 Found 3 documents: doc1.txt, doc2.txt, doc3.txt
🤖 Generating response with gpt-4o...
💾 Token usage - Prompt: 1234, Completion: 567, Total: 1801
⚡ Cached tokens: 890 (72% cache hit)
✅ Response sent
```

---

## 📚 Documentazione

- **[QUICK-START.md](QUICK-START.md)** - Guida completa con tutti i comandi
- **[README-API.md](README-API.md)** - Documentazione API tecnica
- **[src/system_prompt.txt](src/system_prompt.txt)** - System prompt modificabile

---

## 🤝 Workflow Consigliato

### Sviluppo Quotidiano
```bash
# Terminal 1
ollama serve

# Terminal 2
./start.sh
```

### Prima Installazione
```bash
npm install
cp .env.example .env
# Configura .env con la tua API key
ollama serve  # In un altro terminal
./full-start.sh
```

### Dopo Modifica Documenti
```bash
npm run setup
./start.sh
```

---

## 💡 Tips

✅ **System prompt in file separato** - Modifica `src/system_prompt.txt` senza toccare il codice  
✅ **Script shell semplici** - Usa `./start.sh` per avviare tutto  
✅ **Comandi npm** - Alternative cross-platform ai script shell  
✅ **Prompt caching** - Risparmia ~70-80% sui costi OpenAI  
✅ **Ollama locale** - RAG gratuito con embeddings locali  

---

## 🎨 Tecnologie

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Embeddings**: Ollama (nomic-embed-text)
- **LLM**: OpenAI GPT-4
- **Caching**: OpenAI Prompt Caching

---

**Buon lavoro! 🚀**

Per domande o problemi, consulta [QUICK-START.md](QUICK-START.md)
