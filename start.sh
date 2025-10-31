#!/bin/bash

# 🚀 MAIZE Collective Intelligence - Quick Start
# Avvia backend e frontend (richiede Ollama già attivo)

echo "============================================================"
echo "🚀 MAIZE Collective Intelligence - Quick Start"
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
echo "Avvio backend e frontend..."
echo ""

# Start backend and frontend
npx concurrently -n "BACKEND,FRONTEND" -c "blue,magenta" \
    "node server/index.js" \
    "cd frontend && npm run dev"
