# 🔒 Security Guidelines

## ⚠️ File Sensibili

### ❌ MAI committare su GitHub:

1. **`.env`** - Contiene API keys e segreti
2. **`docs/`** - Documenti riservati dell'azienda
3. **`vectorstore.json`** - Contiene embeddings dei documenti riservati
4. **Chiavi API** - Nessuna chiave in plain text nel codice

### ✅ Cosa è sicuro committare:

1. **`.env.example`** - Template senza valori reali
2. **Codice sorgente** - `server/`, `frontend/`, `scripts/`
3. **Documentazione** - README, QUICK-START, ecc.
4. **Configurazioni** - `package.json`, `.gitignore`, ecc.

---

## 🔐 Best Practices

### 1. Protezione API Keys

**❌ MAI fare questo:**
```javascript
const apiKey = "sk-proj-abc123..."; // NO!
```

**✅ Sempre usare variabili d'ambiente:**
```javascript
const apiKey = process.env.OPENAI_API_KEY; // OK!
```

### 2. Verifica prima di committare

```bash
# Controlla cosa stai per committare
git status
git diff

# Verifica che .env non sia incluso
git ls-files | grep .env
# Dovrebbe restituire solo .env.example
```

### 3. Se hai committato accidentalmente dati sensibili

```bash
# Rimuovi il file dalla history (ATTENZIONE: cambia la history!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Forzare il push (ATTENZIONE!)
git push origin --force --all
```

**⚠️ IMPORTANTE**: Se hai esposto una API key, **revocala immediatamente** su:
- OpenAI: https://platform.openai.com/api-keys

---

## 📋 Checklist Pre-Commit

Prima di ogni commit, verifica:

- [ ] Il file `.env` NON è incluso
- [ ] Nessuna API key nel codice
- [ ] La cartella `docs/` NON è inclusa
- [ ] Il file `vectorstore.json` NON è incluso
- [ ] Nessun file di log o temporaneo
- [ ] Nessun backup con dati sensibili

---

## 🛡️ Protezione Repository

### GitHub Settings Consigliati

1. **Repository privato** (se contiene logica business critica)
2. **Branch protection** per `main`:
   - Richiedi review prima del merge
   - Richiedi status checks
3. **Secret scanning** abilitato
4. **Dependabot** abilitato per security updates

### GitHub Secrets

Per CI/CD, usa GitHub Secrets invece di committare credenziali:

1. Vai su Settings → Secrets and variables → Actions
2. Aggiungi i secrets necessari:
   - `OPENAI_API_KEY`
   - Altre credenziali

Usali nei workflow:
```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## 🔍 Audit Periodici

### Comandi Utili

```bash
# Cerca potenziali secrets nel codice
git grep -i "api.key"
git grep -i "password"
git grep -i "secret"

# Controlla cosa è tracciato
git ls-files

# Verifica dimensione repository
git count-objects -vH
```

### Tools Consigliati

- **git-secrets** - Previene commit di secrets
- **truffleHog** - Scansiona history per secrets
- **gitleaks** - Detector di secrets per Git

---

## 📞 In Caso di Incidente

Se hai accidentalmente esposto dati sensibili:

1. **Revoca immediatamente** tutte le credenziali esposte
2. **Notifica** il team di sicurezza
3. **Pulisci la history** (vedi sopra)
4. **Documenta** l'incidente
5. **Implementa** misure preventive

---

## ✅ .gitignore Configurato

Il file `.gitignore` è configurato per proteggere:

- ✅ File `.env` e varianti
- ✅ Cartelle `docs/`, `docs_not_txt/`, `txt_output/`
- ✅ File `vectorstore.json` e backup
- ✅ `node_modules/`
- ✅ File di log
- ✅ File temporanei e backup
- ✅ Configurazioni IDE
- ✅ File di sistema (`.DS_Store`, ecc.)

---

## 🎓 Risorse Utili

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Git Secret Management](https://git-secret.io/)

---

**Ricorda**: Una volta che qualcosa è su GitHub (anche se cancellato), può essere stato clonato o visto. La prevenzione è la migliore protezione! 🛡️
