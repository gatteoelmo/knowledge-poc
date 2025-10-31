#!/bin/bash

# 🔄 MAIZE Collective Intelligence - Full Setup & Start
# Esegue tutto da zero: conversione documenti, vectorstore, avvio server

echo "============================================================"
echo "🔄 MAIZE Collective Intelligence - Full Setup"
echo "============================================================"
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Error: Ollama non è in esecuzione!"
    echo ""
    echo "Per favore avvia Ollama in un terminale separato:"
    echo "  ollama serve"
    echo ""
    exit 1
fi

echo "✅ Ollama è attivo"
echo ""

# Step 1: Convert documents
echo "📄 Step 1/3: Conversione documenti in TXT..."
echo "------------------------------------------------------------"
python3 scripts/convert_to_txt_all.py
if [ $? -ne 0 ]; then
    echo "❌ Errore nella conversione documenti"
    exit 1
fi
echo "✅ Conversione completata"
echo ""

# Step 2: Generate vectorstore
echo "📚 Step 2/3: Generazione vectorstore..."
echo "------------------------------------------------------------"
node scripts/load_docs.mjs
if [ $? -ne 0 ]; then
    echo "❌ Errore nella generazione vectorstore"
    exit 1
fi
echo "✅ Vectorstore generato"
echo ""

# Step 3: Start servers
echo "🚀 Step 3/3: Avvio backend e frontend..."
echo "------------------------------------------------------------"
echo ""

npx concurrently -n "BACKEND,FRONTEND" -c "blue,magenta" \
    "node server/index.js" \
    "cd frontend && npm run dev"
