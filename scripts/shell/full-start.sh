#!/bin/bash

# 🔄 MAIZE Collective Intelligence - Full Setup & Start
# Esegue tutto da zero: conversione documenti, vectorstore, avvio server

echo "============================================================"
echo "🔄 MAIZE Collective Intelligence - Full Setup"
echo "============================================================"
echo ""

echo "✅ Embedding con OpenAI text-embedding-3-small"
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
echo "📚 Step 2/3: Generazione vectorstore (OpenAI)..."
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
