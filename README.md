# 🧠 MAIZE Collective Intelligence# 🧠 MAIZE Collective Intelligence



Sistema RAG (Retrieval-Augmented Generation) che combina embeddings Ollama con GPT-4 per rispondere a domande sulla knowledge base di MAIZE.```bash



## 🚀 Quick StartSistema RAG (Retrieval-Augmented Generation) che combina embeddings Ollama con GPT-4 per rispondere a domande sulla knowledge base di MAIZE.git clone https://github.com/gatteoelmo/knowledge-poc.git



### Metodo 1: Script Shell (Consigliato)```



```bash## 🚀 Quick Start```bash

# Start veloce (se tutto è già configurato)

./scripts/shell/start.shcd knowledge-poc



# Oppure start completo da zero### Metodo 1: Script Shell (Consigliato)```

./scripts/shell/full-start.sh

```if u have some pptx/key/pdf file convert with



### Metodo 2: Comandi npm```bash```bash



```bash# Start veloce (se tutto è già configurato)python3 scripts/convert_to_txt_all.py

# Start veloce

npm run quick-start./start.sh```



# Start completo da zero```bash

npm run full-start

```# Oppure start completo da zeroollama pull mistral



**📖 Documentazione Completa**: Vedi [`docs-internal/QUICK-START.md`](docs-internal/QUICK-START.md)./full-start.sh```



---``````bash



## 📋 Prerequisitiollama pull mxbai-embed-large



1. **Node.js** - [Download](https://nodejs.org/)### Metodo 2: Comandi npm```

2. **Python 3** - [Download](https://www.python.org/)

3. **Ollama** - [Download](https://ollama.ai/)```bash

4. **OpenAI API Key** - [Get key](https://platform.openai.com/api-keys)

```bashollama run

---

# Start veloce```

## ⚙️ Setup Iniziale

npm run quick-start```bash

### 1. Installa dipendenze

```bashnpm install

npm install

```# Start completo da zero```



### 2. Configura variabili d'ambientenpm run full-start```bash

```bash

# Copia il template```node scripts/load_docs.mjs

cp .env.example .env

```

# Modifica .env e inserisci la tua OpenAI API key

nano .env**📖 Per la guida completa**: Vedi [QUICK-START.md](QUICK-START.md)```bash

```

node server/index.js

### 3. Avvia Ollama (terminale separato)

```bash---```

ollama serve

``````bash



### 4. Scarica il modello di embedding## 📋 Prerequisiticd frontend

```bash

ollama pull nomic-embed-text```

```

1. **Node.js** - [Download](https://nodejs.org/)```bash

### 5. Avvia l'applicazione

```bash2. **Python 3** - [Download](https://www.python.org/)npm install

./scripts/shell/start.sh

# oppure3. **Ollama** - [Download](https://ollama.ai/)```

npm run quick-start

```4. **OpenAI API Key** - [Get key](https://platform.openai.com/api-keys)```bash



---npm run dev



## 📁 Struttura Progetto---```



```## ⚙️ Setup Iniziale

knowledge-poc/

├── 📖 docs-internal/            # Documentazione interna### 1. Installa dipendenze

│   ├── QUICK-START.md          # Guida completa comandi```bash

│   ├── README-API.md           # Documentazione APInpm install

│   └── SECURITY.md             # Linee guida sicurezza```

├── 📝 src/

│   ├── system_prompt.txt       # System prompt (modificabile!)### 2. Configura variabili d'ambiente

│   ├── company_profile.txt     # Company profile```bash

│   └── tone.json               # Tone of voice# Copia il template

├── 🚀 server/cp .env.example .env

│   └── index.js                # Backend API

├── ⚛️  frontend/                # React frontend# Modifica .env e inserisci la tua OpenAI API key

│   ├── src/nano .env

│   └── package.json```

├── 🛠️  scripts/

│   ├── shell/                  # Script bash### 3. Avvia Ollama (terminale separato)

│   │   ├── start.sh           # Avvio veloce```bash

│   │   ├── full-start.sh      # Setup completoollama serve

│   │   └── security-check.sh  # Check sicurezza```

│   ├── convert_to_txt_all.py  # Conversione documenti

│   ├── load_docs.mjs          # Generazione vectorstore### 4. Scarica il modello di embedding

│   └── utils.js               # Utility RAG```bash

├── 📁 docs/                    # Documenti sorgente (gitignored)ollama pull nomic-embed-text

├── ⚙️  .env                     # Configurazione (gitignored)```

├── 📦 package.json             # Script npm

└── 📖 README.md                # Questo file### 5. Avvia l'applicazione

``````bash

./start.sh

---# oppure

npm run quick-start

## 🎯 Comandi Principali```



| Comando | Descrizione |---

|---------|-------------|

| `./scripts/shell/start.sh` | 🚀 Avvio veloce (backend + frontend) |## 📁 Struttura Progetto

| `./scripts/shell/full-start.sh` | 🔄 Setup completo da zero |

| `npm run quick-start` | Come `start.sh` (cross-platform) |```

| `npm run full-start` | Come `full-start.sh` (cross-platform) |knowledge-poc/

| `npm run setup` | 🛠️ Solo conversione + vectorstore |├── 📝 src/

| `npm start` | 🖥️ Solo backend |│   ├── system_prompt.txt       # System prompt (modificabile!)

| `npm run frontend` | ⚛️ Solo frontend |│   └── company_profile.txt     # Company profile

| `npm run security-check` | 🔒 Verifica sicurezza |├── 🚀 server/

│   └── index.js                # Backend API

---├── ⚛️  frontend/                # React frontend

├── 🛠️  scripts/

## ✏️ Personalizzazione│   ├── convert_to_txt_all.py   # Conversione documenti

│   ├── load_docs.mjs           # Generazione vectorstore

### Modificare il System Prompt│   └── utils.js                # Utility RAG

Il system prompt ora è in un **file separato** facile da modificare:├── 📁 docs/                    # Documenti sorgente

├── ⚙️  .env                     # Configurazione

1. Apri `src/system_prompt.txt`├── 📖 QUICK-START.md           # Guida dettagliata

2. Modifica il testo└── 🚀 start.sh                 # Script avvio veloce

3. Riavvia il server```

4. ✅ Le modifiche vengono caricate automaticamente!

---

### Cambiare Modello GPT

Nel file `.env`:## 🎯 Comandi Principali

```env

GPT_MODEL=gpt-4o          # Raccomandato| Comando | Descrizione |

# GPT_MODEL=gpt-4o-mini   # Più economico|---------|-------------|

# GPT_MODEL=gpt-4-turbo   # Alternative| `./start.sh` | 🚀 Avvio veloce (backend + frontend) |

```| `./full-start.sh` | 🔄 Setup completo da zero |

| `npm run quick-start` | Come `./start.sh` |

### Aggiungere Nuovi Documenti| `npm run full-start` | Come `./full-start.sh` |

1. Aggiungi file nella cartella `docs/`| `npm run setup` | 🛠️ Solo conversione + vectorstore |

2. Rigenera vectorstore: `npm run setup`| `npm start` | 🖥️ Solo backend |

3. Riavvia: `./scripts/shell/start.sh`| `npm run frontend` | ⚛️ Solo frontend |



------



## 🏗️ Architettura## ✏️ Personalizzazione



```### Modificare il System Prompt

User QueryIl system prompt ora è in un **file separato** facile da modificare:

    ↓

[RAG con Ollama]1. Apri `src/system_prompt.txt`

    ↓ (Top 3 documenti rilevanti)2. Modifica il testo

[Build Messages con Caching]3. Riavvia il server

    ↓4. ✅ Le modifiche vengono caricate automaticamente!

[GPT-4 Generation]

    ↓### Cambiare Modello GPT

ResponseNel file `.env`:

``````env

GPT_MODEL=gpt-4o          # Raccomandato

### 💾 Prompt Caching# GPT_MODEL=gpt-4o-mini   # Più economico

- ⚡ System prompt → Cachato# GPT_MODEL=gpt-4-turbo   # Alternative

- ⚡ Documenti RAG → Cachati se identici```

- 💰 Risparmio: ~70-80% token

### Aggiungere Nuovi Documenti

---1. Aggiungi file nella cartella `docs/`

2. Rigenera vectorstore: `npm run setup`

## 🔗 Porte3. Riavvia: `./start.sh`



- **Backend API**: http://localhost:3001---

- **Frontend**: http://localhost:5173

- **Ollama**: http://localhost:11434## 🏗️ Architettura



---```

User Query

## 🐛 Troubleshooting    ↓

[RAG con Ollama]

### "fetch failed" / "ECONNREFUSED"    ↓ (Top 3 documenti rilevanti)

```bash[Build Messages con Caching]

# Soluzione: Avvia Ollama    ↓

ollama serve[GPT-4 Generation]

```    ↓

Response

### "Missing API key"```

```bash

# Soluzione: Configura .env### 💾 Prompt Caching

nano .env- ⚡ System prompt → Cachato

# Aggiungi: OPENAI_API_KEY=sk-...- ⚡ Documenti RAG → Cachati se identici

```- 💰 Risparmio: ~70-80% token



### "Model not found"---

```bash

# Soluzione: Scarica il modello## 🔗 Porte

ollama pull nomic-embed-text

```- **Backend API**: http://localhost:3001

- **Frontend**: http://localhost:5173

### "Unsupported parameter: max_tokens"- **Ollama**: http://localhost:11434

```bash

# Soluzione: Usa un modello supportato nel .env---

GPT_MODEL=gpt-4o  # o gpt-4o-mini, gpt-4-turbo

```## 🐛 Troubleshooting



---### "fetch failed" / "ECONNREFUSED"

```bash

## 📊 Monitoring# Soluzione: Avvia Ollama

ollama serve

Il server logga automaticamente:```

- 📩 Query ricevute

- 🔍 Documenti recuperati (RAG)### "Missing API key"

- 💾 Token usage```bash

- ⚡ Cache hit rate# Soluzione: Configura .env

nano .env

Esempio:# Aggiungi: OPENAI_API_KEY=sk-...

``````

📩 Query: "Come lavora MAIZE..."

🔍 Retrieving relevant documents with Ollama...### "Model not found"

📚 Found 3 documents: doc1.txt, doc2.txt, doc3.txt```bash

🤖 Generating response with gpt-4o...# Soluzione: Scarica il modello

💾 Token usage - Prompt: 1234, Completion: 567, Total: 1801ollama pull nomic-embed-text

⚡ Cached tokens: 890 (72% cache hit)```

✅ Response sent

```---



---## 📊 Monitoring



## 📚 DocumentazioneIl server logga automaticamente:

- 📩 Query ricevute

- **[`docs-internal/QUICK-START.md`](docs-internal/QUICK-START.md)** - Guida completa con tutti i comandi- 🔍 Documenti recuperati (RAG)

- **[`docs-internal/README-API.md`](docs-internal/README-API.md)** - Documentazione API tecnica- 💾 Token usage

- **[`docs-internal/SECURITY.md`](docs-internal/SECURITY.md)** - Linee guida sicurezza- ⚡ Cache hit rate

- **[`src/system_prompt.txt`](src/system_prompt.txt)** - System prompt modificabile

Esempio:

---```

📩 Query: "Come lavora MAIZE..."

## 🤝 Workflow Consigliato🔍 Retrieving relevant documents with Ollama...

📚 Found 3 documents: doc1.txt, doc2.txt, doc3.txt

### Sviluppo Quotidiano🤖 Generating response with gpt-4o...

```bash💾 Token usage - Prompt: 1234, Completion: 567, Total: 1801

# Terminal 1⚡ Cached tokens: 890 (72% cache hit)

ollama serve✅ Response sent

```

# Terminal 2

./scripts/shell/start.sh---

```

## 📚 Documentazione

### Prima Installazione

```bash- **[QUICK-START.md](QUICK-START.md)** - Guida completa con tutti i comandi

npm install- **[README-API.md](README-API.md)** - Documentazione API tecnica

cp .env.example .env- **[src/system_prompt.txt](src/system_prompt.txt)** - System prompt modificabile

# Configura .env con la tua API key

ollama serve  # In un altro terminal---

./scripts/shell/full-start.sh

```## 🤝 Workflow Consigliato



### Dopo Modifica Documenti### Sviluppo Quotidiano

```bash```bash

npm run setup# Terminal 1

./scripts/shell/start.shollama serve

```

# Terminal 2

### Prima di Committare./start.sh

```bash```

# Verifica sicurezza

npm run security-check### Prima Installazione

```bash

# Se tutto ok, committanpm install

git add .cp .env.example .env

git commit -m "Your message"# Configura .env con la tua API key

git pushollama serve  # In un altro terminal

```./full-start.sh

```

---

### Dopo Modifica Documenti

## 🔒 Sicurezza```bash

npm run setup

Prima di ogni commit, esegui:./start.sh

```bash```

npm run security-check

```---



Questo verifica che **non ci siano file sensibili** da committare:## 💡 Tips

- ❌ `.env` con API keys

- ❌ `docs/` con documenti riservati✅ **System prompt in file separato** - Modifica `src/system_prompt.txt` senza toccare il codice  

- ❌ `vectorstore.json` con embeddings✅ **Script shell semplici** - Usa `./start.sh` per avviare tutto  

- ❌ API keys nel codice✅ **Comandi npm** - Alternative cross-platform ai script shell  

✅ **Prompt caching** - Risparmia ~70-80% sui costi OpenAI  

Per dettagli completi: [`docs-internal/SECURITY.md`](docs-internal/SECURITY.md)✅ **Ollama locale** - RAG gratuito con embeddings locali  



------



## 💡 Tips## 🎨 Tecnologie



✅ **System prompt in file separato** - Modifica `src/system_prompt.txt` senza toccare il codice  - **Backend**: Node.js + Express

✅ **Script shell organizzati** - Tutti in `scripts/shell/`  - **Frontend**: React + Vite

✅ **Documentazione separata** - Tutto in `docs-internal/`  - **Embeddings**: Ollama (nomic-embed-text)

✅ **Comandi npm** - Alternative cross-platform ai script shell  - **LLM**: OpenAI GPT-4

✅ **Prompt caching** - Risparmia ~70-80% sui costi OpenAI  - **Caching**: OpenAI Prompt Caching

✅ **Security check automatico** - Verifica prima di ogni commit  

---

---

**Buon lavoro! 🚀**

## 🎨 Tecnologie

Per domande o problemi, consulta [QUICK-START.md](QUICK-START.md)

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Embeddings**: Ollama (nomic-embed-text)
- **LLM**: OpenAI GPT-4
- **Caching**: OpenAI Prompt Caching

---

**Buon lavoro! 🚀**

Per domande o problemi, consulta la documentazione in [`docs-internal/`](docs-internal/)
