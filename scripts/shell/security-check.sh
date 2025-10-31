#!/bin/bash

# 🔒 Security Check Script
# Verifica che non ci siano file sensibili da committare

echo "============================================================"
echo "🔒 Security Check - Verifica File Sensibili"
echo "============================================================"
echo ""

ISSUES_FOUND=0

# Check 1: Verifica .env
echo "📋 Check 1/5: Verifica file .env..."
if git ls-files | grep -q "^\\.env$"; then
    echo "❌ ERRORE: Il file .env è tracciato da Git!"
    echo "   Rimuovilo con: git rm --cached .env"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ OK: .env non è tracciato"
fi
echo ""

# Check 2: Verifica data/
echo "📋 Check 2/5: Verifica cartella data/..."
if git ls-files | grep -q "^data/"; then
    echo "❌ ERRORE: File nella cartella data/ sono tracciati!"
    echo "   Rimuovili con: git rm --cached -r data/"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ OK: data/ non è tracciata"
fi
echo ""

# Check 3: Verifica vectorstore.json
echo "📋 Check 3/5: Verifica vectorstore.json..."
if git ls-files | grep -q "vectorstore\\.json"; then
    echo "❌ ERRORE: vectorstore.json è tracciato!"
    echo "   Rimuovilo con: git rm --cached vectorstore.json"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ OK: vectorstore.json non è tracciato"
fi
echo ""

# Check 4: Cerca API keys nel codice
echo "📋 Check 4/5: Cerca API keys nel codice..."
if git grep -i "sk-proj-" -- "*.js" "*.mjs" "*.ts" "*.py" > /dev/null 2>&1; then
    echo "⚠️  WARNING: Possibili API keys trovate nel codice!"
    echo "   File trovati:"
    git grep -i "sk-proj-" -- "*.js" "*.mjs" "*.ts" "*.py" | head -5
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ OK: Nessuna API key trovata nel codice"
fi
echo ""

# Check 5: Verifica file staged
echo "📋 Check 5/5: Verifica file staged..."
STAGED_SENSITIVE=$(git diff --cached --name-only | grep -E "\\.env$|^data/|^docs/|vectorstore\\.json")
if [ -n "$STAGED_SENSITIVE" ]; then
    echo "❌ ERRORE: File sensibili in staging!"
    echo "$STAGED_SENSITIVE"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ OK: Nessun file sensibile in staging"
fi
echo ""

# Risultato finale
echo "============================================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ Tutti i controlli superati!"
    echo "   È sicuro committare."
    echo "============================================================"
    exit 0
else
    echo "❌ Trovati $ISSUES_FOUND problemi di sicurezza!"
    echo "   Risolvi i problemi prima di committare."
    echo "============================================================"
    exit 1
fi
