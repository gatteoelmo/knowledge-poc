# 🚀 MAIZE Collective Intelligence - Quick Start Guide

## 📋 Prerequisiti

1. **Node.js** installato
2. **Python 3** installato
3. **OpenAI API Key** configurata nel file `.env`

## ⚡ Comandi Rapidi

### 🎯 Start Veloce (progetti già configurato)
```bash
npm run quick-start
```
Avvia contemporaneamente:
- ✅ Backend API (porta 3001)
- ✅ Frontend (porta 5173)

---

### 🔄 Full Start (da zero)
```bash
npm run full-start
```
Esegue l'intero setup e avvia tutto:
1. ✅ Converte documenti in TXT
2. ✅ Genera vectorstore
3. ✅ Avvia backend
4. ✅ Avvia frontend

**⚠️ Attenzione**: Questo comando può richiedere diversi minuti per la prima volta

---

### 🛠️ Comandi Individuali

#### Setup Iniziale
```bash
npm run setup
```
Converte i documenti e genera il vectorstore (senza avviare i server)

#### Solo Backend
```bash
npm start
# oppure
npm run dev
```

#### Solo Frontend
```bash
npm run frontend
```

#### Conversione Documenti
```bash
npm run convert
```
Converte tutti i documenti dalla cartella `docs/` in formato TXT

#### Generazione Vectorstore
```bash
npm run load
```
Genera il vectorstore con gli embeddings OpenAI

---

## 🔧 Setup Manuale (massimo controllo)

### Terminal 1 - Backend
```bash
node server/index.js
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## 📁 File di Configurazione

### `.env` - Variabili d'ambiente
```env
OPENAI_API_KEY=your-key-here
PORT=3001
GPT_MODEL=gpt-4o
```

### `src/system_prompt.txt` - System Prompt
Modifica questo file per cambiare il comportamento dell'AI.
Il file viene caricato automaticamente all'avvio del server.

### `src/company_profile.txt` - Company Profile
Contiene la descrizione dell'azienda che viene inclusa nel system prompt.

---

## 🐛 Troubleshooting

### "Missing API key"
**Problema**: OpenAI API key non configurata
**Soluzione**: Aggiungi la tua key nel file `.env`

### "Model not found"
**Problema**: Modello GPT non supportato
**Soluzione**: Usa `gpt-4o`, `gpt-4o-mini` o `gpt-4-turbo` nel file `.env`

### "Retrieval returns no documents"
**Problema**: Vectorstore non generato o incompatibile
**Soluzione**: Rigenera il vectorstore con `npm run load`

---

## 📊 Workflow Completo

### Prima Installazione
```bash
# 1. Installa dipendenze
npm install

# 2. Configura .env
cp .env.example .env
# Modifica .env con la tua API key

# 3. Setup completo e avvio
npm run full-start
```

### Sviluppo Quotidiano
```bash
# Terminal 1 - Ollama (se non già avviato)
ollama serve

# Terminal 2 - Tutto il resto
npm run quick-start
```

### Aggiornamento Documenti
```bash
# 1. Aggiungi nuovi file in docs/
# 2. Rigenera vectorstore
npm run setup
# 3. Riavvia il server
npm run quick-start
```

---

## 🎨 Personalizzazione

### Modificare il System Prompt
1. Apri `src/system_prompt.txt`
2. Modifica il contenuto
3. Riavvia il server
4. Il nuovo prompt viene caricato automaticamente

### Cambiare Modello GPT
1. Apri `.env`
2. Cambia `GPT_MODEL=gpt-4o` con altro modello
3. Riavvia il server

### Modificare il Numero di Documenti RAG
1. Apri `server/index.js`
2. Cerca `getTopKDocs(query, 3)` 
3. Cambia `3` con il numero desiderato

---

## 📈 Performance

### Prompt Caching
Il sistema usa **prompt caching** di OpenAI per:
- ⚡ Ridurre latenza (~50-70%)
- 💰 Ridurre costi (~70-80%)
- 🔄 Riutilizzare system prompt e documenti

**Cache hit rate** viene mostrato nei log del server.

### Token Usage
Ogni richiesta logga:
- 📊 Prompt tokens
- 📝 Completion tokens
- 💾 Cached tokens
- ⚡ Cache hit rate

---

## 🔗 Porte

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

---

## 📚 Struttura Progetto

```
knowledge-poc/
├── src/
│   ├── system_prompt.txt       # 📝 System prompt (modificabile)
│   └── company_profile.txt     # 🏢 Company profile
├── server/
│   └── index.js                # 🚀 Backend API
├── frontend/                   # ⚛️ React frontend
├── scripts/
│   ├── convert_to_txt_all.py   # 🔄 Conversione documenti
│   ├── load_docs.mjs           # 📚 Generazione vectorstore
│   └── utils.js                # 🛠️ Utility RAG
├── docs/                       # 📁 Documenti sorgente
├── .env                        # ⚙️ Configurazione
└── package.json                # 📦 Script npm
```

---

## 💡 Tips

- **Modifica solo il system prompt**: Usa `src/system_prompt.txt` invece di modificare il codice
- **Usa quick-start**: Più veloce per lo sviluppo quotidiano
- **Monitora i log**: Il server mostra dettagli su retrieval, token usage e cache
- **Embeddings OpenAI**: Gli embedding sono generati con OpenAI text-embedding-3-small

---

Buon lavoro! 🚀
