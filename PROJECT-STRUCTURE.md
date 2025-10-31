# 📁 Struttura Progetto

Organizzazione file e cartelle del progetto MAIZE Collective Intelligence.

```
knowledge-poc/
│
├── 📖 docs-internal/              # Documentazione interna
│   ├── README.md                 # Indice documentazione
│   ├── QUICK-START.md            # Guida rapida completa
│   ├── README-API.md             # Documentazione API tecnica
│   └── SECURITY.md               # Linee guida sicurezza
│
├── 📝 src/                        # File configurazione AI
│   ├── system_prompt.txt         # System prompt (modificabile!)
│   ├── company_profile.txt       # Profilo aziendale
│   └── tone.json                 # Tone of voice
│
├── 🚀 server/                     # Backend API
│   └── index.js                  # Server Express con RAG
│
├── ⚛️  frontend/                  # React frontend
│   ├── src/
│   │   ├── components/           # Componenti React
│   │   ├── hooks/                # Custom hooks
│   │   ├── App.jsx               # App principale
│   │   └── main.jsx              # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── 🛠️  scripts/                   # Script utilità
│   ├── shell/                    # Script bash
│   │   ├── start.sh             # 🚀 Avvio veloce
│   │   ├── full-start.sh        # 🔄 Setup completo
│   │   └── security-check.sh    # 🔒 Check sicurezza
│   │
│   ├── convert_to_txt_all.py    # 🔄 Conversione documenti
│   ├── load_docs.mjs            # 📚 Generazione vectorstore
│   └── utils.js                 # 🔍 Utility RAG (embeddings)
│
├── 📁 docs/                       # Documenti sorgente (gitignored)
│   └── *.txt, *.pdf, *.pptx     # File aziendali riservati
│
├── ⚙️  Configurazione
│   ├── .env                      # Variables d'ambiente (gitignored)
│   ├── .env.example             # Template configurazione
│   ├── .gitignore               # File esclusi da Git
│   ├── .gitattributes           # Git attributes
│   ├── package.json             # Dependencies e scripts npm
│   └── package-lock.json        # Lock file npm
│
├── 📊 Dati Generati (gitignored)
│   ├── vectorstore.json         # Embeddings documenti
│   ├── docs_not_txt/            # Documenti originali
│   └── txt_output/              # Output conversione
│
└── 📖 Documentazione Root
    └── README.md                # README principale (overview)
```

---

## 🎯 File Principali

### 📝 Modificabili Facilmente

| File | Descrizione | Come Modificare |
|------|-------------|-----------------|
| `src/system_prompt.txt` | System prompt AI | Apri e modifica |
| `src/company_profile.txt` | Profilo aziendale | Apri e modifica |
| `.env` | Configurazione (API keys) | Modifica variabili |

### 🚀 Script di Avvio

| Script | Comando | Descrizione |
|--------|---------|-------------|
| `scripts/shell/start.sh` | `./scripts/shell/start.sh` | Avvio veloce |
| `scripts/shell/full-start.sh` | `./scripts/shell/full-start.sh` | Setup completo |
| Via npm | `npm run quick-start` | Cross-platform |

### 📖 Documentazione

| File | Contenuto |
|------|-----------|
| `README.md` | Overview e quick start |
| `docs-internal/README.md` | Indice documentazione |
| `docs-internal/QUICK-START.md` | Guida completa |
| `docs-internal/README-API.md` | Documentazione API |
| `docs-internal/SECURITY.md` | Sicurezza |

---

## 🔒 File Sensibili (Non su GitHub)

Questi file **NON** vengono committati su GitHub (`.gitignore`):

```
❌ .env                    # API keys e secrets
❌ docs/                   # Documenti riservati
❌ vectorstore.json        # Embeddings documenti
❌ docs_not_txt/           # File originali
❌ txt_output/             # Output conversione
❌ node_modules/           # Dependencies
❌ *.log                   # File di log
```

---

## ✅ File Sicuri per GitHub

Questi file **possono** essere committati:

```
✅ src/system_prompt.txt       # System prompt template
✅ src/company_profile.txt     # Profilo pubblico
✅ server/index.js             # Codice backend
✅ frontend/src/               # Codice frontend
✅ scripts/                    # Script utilità
✅ docs-internal/              # Documentazione
✅ README.md                   # Documentazione
✅ .env.example                # Template senza secrets
✅ package.json                # Config npm
✅ .gitignore                  # Configurazione Git
```

---

## 🗂️ Convenzioni Naming

### Cartelle
- `kebab-case` per nomi cartelle: `docs-internal`, `txt-output`
- Suffisso `-internal` per file/cartelle non pubblici

### File
- `kebab-case` per markdown: `QUICK-START.md`, `README-API.md`
- `snake_case` per Python: `convert_to_txt_all.py`
- `camelCase` per JavaScript: `loadDocs.mjs` (ma uso `.mjs` per moduli)
- `.sh` per script bash

### Script
- Prefisso chiaro: `start.sh`, `full-start.sh`, `security-check.sh`
- Sempre eseguibili: `chmod +x scripts/shell/*.sh`

---

## 📊 Dimensioni Tipiche

| Tipo File/Cartella | Dimensione Tipica |
|---------------------|-------------------|
| `vectorstore.json` | 50-500 MB (dipende da docs) |
| `docs/` | Variabile (gitignored) |
| `node_modules/` | ~200-300 MB |
| `frontend/dist/` | ~1-5 MB (build) |

---

## 🔄 Workflow File

### Aggiungere Nuovi Documenti
```
1. Aggiungi file in docs/
2. npm run convert  → txt_output/
3. npm run load     → vectorstore.json
4. Riavvia server
```

### Modificare System Prompt
```
1. Modifica src/system_prompt.txt
2. Riavvia server
3. ✅ Cambio immediato
```

### Aggiornare Documentazione
```
1. Modifica files in docs-internal/
2. Verifica sicurezza: npm run security-check
3. Commit e push
```

---

## 🎯 Best Practices

✅ **Mantieni separati**:
- Codice sorgente (`src/`, `server/`, `frontend/`)
- Dati (`docs/`, `vectorstore.json`)
- Documentazione (`docs-internal/`)
- Script (`scripts/shell/`)

✅ **Mai committare**:
- File `.env` con API keys
- Cartella `docs/` con dati riservati
- File `vectorstore.json` con embeddings

✅ **Sempre verificare** prima di commit:
```bash
npm run security-check
```

---

Per maggiori dettagli, consulta:
- [`docs-internal/README.md`](docs-internal/README.md) - Indice completo
- [`README.md`](README.md) - Overview progetto
