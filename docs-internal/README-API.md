# MAIZE Collective Intelligence API

Sistema RAG (Retrieval-Augmented Generation) che combina:
- **OpenAI text-embedding-3-small** per embeddings e ricerca vettoriale
- **GPT-4o** per generazione di risposte

## Setup

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=3001

# Model Configuration
GPT_MODEL=gpt-4o
```

### 3. Avvia il server

```bash
node server/index.js
```

## Architettura

### RAG Pipeline

1. **Query Processing**: L'utente invia una domanda
2. **Vector Search (OpenAI)**: Ricerca i 3 documenti più rilevanti usando embeddings OpenAI text-embedding-3-small
3. **Context Building**: Costruisce il contesto con system prompt, documenti e storia conversazione
4. **Response Generation (GPT-4o)**: Genera la risposta usando GPT-4o
5. **Caching**: System prompt e documenti vengono cachati per efficienza

### Prompt Caching

Il sistema usa **prompt caching** di OpenAI per ridurre costi e latenza:
- ✅ System prompt (cachato)
- ✅ Documenti recuperati (cachati se identici)
- ❌ Storia conversazione (non cachata, cambia spesso)
- ❌ Query corrente (non cachata)

### Endpoints

#### `POST /api/chat`

Gestisce le query degli utenti.

**Request:**
```json
{
  "query": "Come lavora MAIZE con i clienti?",
  "sessionId": "optional-session-id",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "ok": true,
  "response": "...",
  "sources": ["doc1.txt", "doc2.txt"],
  "sessionId": "...",
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  }
}
```

#### `POST /api/reset-conversation`

Resetta la conversazione per una sessione.

**Request:**
```json
{
  "sessionId": "session-id-to-reset"
}
```

## Monitoring

Il server logga informazioni utili:

```
📩 Query: "Come lavora MAIZE..."
🔍 Retrieving relevant documents with OpenAI...
📚 Found 3 documents: doc1.txt, doc2.txt, doc3.txt
🤖 Generating response with gpt-4o...
💾 Token usage - Prompt: 1234, Completion: 567, Total: 1801
⚡ Cached tokens: 890 (72% cache hit)
✅ Response sent
```

## Ottimizzazione Costi

Con il prompt caching:
- **Prima richiesta**: Tutti i token vengono processati
- **Richieste successive**: System prompt e documenti cachati (risparmio ~70-80%)

## Troubleshooting

### Errore: "Missing API key"
Assicurati di aver configurato `OPENAI_API_KEY` nel file `.env`

### Errore: "Model not found"
Verifica che il modello GPT sia corretto nel `.env` (es: `gpt-4o`, `gpt-4o-mini`)
