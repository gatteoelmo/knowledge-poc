# Deploy su DigitalOcean (Backend + Frontend + Embeddings)

Questa guida ti porta da zero (droplet appena creato) a istanza funzionante accessibile via browser.

## 1. Prerequisiti
- Account DigitalOcean
- Chiave SSH caricata su DigitalOcean (consigliato)
- OpenAI API Key
- Repository GitHub accessibile (pubblica o con token)

## 2. Crea il Droplet
1. Accedi a DigitalOcean > Create > Droplets
2. Immagine: Ubuntu 22.04 LTS
3. Piano: minimo 2GB RAM se usi Ollama (Basic $12/mese)
4. Datacenter: vicino al tuo team (es. FRA / AMS)
5. SSH Key: seleziona la tua
6. Hostname: knowledge-poc
7. Crea e annota l'indirizzo IP pubblico

## 3. Accesso al Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

## 4. Inizializzazione automatica (consigliata)
Copia il file `scripts/shell/droplet-init.sh` localmente se non è ancora sul droplet. Se hai già clonato la repo manualmente puoi saltare al punto 5.

Oppure esegui direttamente (se hai messo lo script su un gist o lo copi a mano):
```bash
bash scripts/shell/droplet-init.sh https://github.com/gatteoelmo/knowledge-poc.git /var/www/knowledge-poc sk-OPENAI_KEY
```

Lo script fa:
- Update pacchetti
- Installa Node.js, Python, PM2, Ollama, Nginx
- Clona repo
- Crea `.env`
- Installa dipendenze backend + frontend
- Build frontend
- Genera vectorstore (se `data/source` presente)
- Configura firewall
- Avvia processi con PM2

## 5. Clone manuale (alternativa)
```bash
apt-get update -y && apt-get upgrade -y
apt-get install -y git curl python3 python3-pip
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs build-essential
npm install -g pm2

# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull nomic-embed-text

git clone https://github.com/gatteoelmo/knowledge-poc.git /var/www/knowledge-poc
cd /var/www/knowledge-poc
cp .env.production.example .env
nano .env   # Inserisci OPENAI_API_KEY
npm install --production
cd frontend && npm install --production && npm run build && cd ..
npm run setup  # converte e genera vectorstore
```

## 6. Avvio processi con PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # esegui il comando mostrato
pm2 status
```
Logs:
```bash
pm2 logs knowledge-backend
pm2 logs knowledge-frontend
pm2 logs ollama
```

## 7. Nginx (reverse proxy + static)
Config esempio: `deploy/nginx.conf.example`.
Copialo:
```bash
cp deploy/nginx.conf.example /etc/nginx/sites-available/knowledge-poc
ln -s /etc/nginx/sites-available/knowledge-poc /etc/nginx/sites-enabled/knowledge-poc
nginx -t && systemctl reload nginx
```
Accesso (senza porte):
```
http://YOUR_DROPLET_IP
```
Health check:
```
http://YOUR_DROPLET_IP/health
```

## 8. Aggiornare il deploy
Da locale:
```bash
git pull origin main
rsync -av --exclude node_modules --exclude .git ./ root@YOUR_DROPLET_IP:/var/www/knowledge-poc/
ssh root@YOUR_DROPLET_IP "cd /var/www/knowledge-poc && npm install --production && cd frontend && npm install --production && npm run build && pm2 restart all"
```

## 9. Sicurezza base
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
ufw allow 5173/tcp
ufw --force enable
```
Crea utente non-root:
```bash
adduser deploy
usermod -aG sudo deploy
```
Disabilita login root via password (solo SSH key):
```bash
nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PermitRootLogin prohibit-password
systemctl restart sshd
```

## 10. SSL (dominio opzionale)
Se hai un dominio puntato all'IP:
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d tuo-dominio.com -d www.tuo-dominio.com
```
Certificati auto-rinnovo:
```bash
certbot renew --dry-run
```

## 11. Variabili e ottimizzazioni
- Usa `gpt-4o-mini` per ridurre costi.
- Riduci `getTopKDocs` (in `server/index.js`) se vuoi meno token.
- Aggiungi monitoraggio: `pm2 monit`.

## 12. Troubleshooting rapido
| Problema | Soluzione |
|----------|-----------|
| 404 su frontend | Assicurati build e Nginx `try_files` corretti |
| API non risponde | Controlla `pm2 logs knowledge-backend` |
| Embeddings falliscono | Verifica `ollama serve` processo avviato |
| Porta bloccata | `ufw status` e regole corrette |
| OPENAI key assente | Modifica `.env` e `pm2 restart knowledge-backend` |

## 13. Rimozione / Restart completo
```bash
pm2 delete all
pm2 start ecosystem.config.cjs
```

## 14. Backup vectorstore
Copia `vectorstore.json` (non versionato) in un bucket o storage esterno se critico.

---
Fine guida. Ora condividi l'IP con il team: `http://YOUR_DROPLET_IP`.
