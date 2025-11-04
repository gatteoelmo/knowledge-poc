#!/bin/bash

# 🚀 MAIZE Collective Intelligence - Quick Start
# Avvia backend e frontend (embedding con OpenAI)

echo "============================================================"
echo "🚀 MAIZE Collective Intelligence - Quick Start"
echo "============================================================"
echo ""

echo "✅ Embedding con OpenAI text-embedding-3-small"
echo ""
echo "Avvio backend e frontend..."
echo ""

# Start backend and frontend
npx concurrently -n "BACKEND,FRONTEND" -c "blue,magenta" \
    "node server/index.js" \
    "cd frontend && npm run dev"
