#!/bin/sh

# stampo versione Xsite Boot
echo "Xsite Boot v 0.2.1"

# elimino dati in cache che a volte creano problemi
echo "[1 / 7] rm -rf node_modules"
rm -rf node_modules
echo "[2 / 7] rm package-lock.json"
rm package-lock.json

# Verifica le versioni installate di Node.js e npm
echo "[3 / 7] node -v"
node -v
echo "[4 / 7] npm -v"
npm -v

# Installazione di react-scripts e altre dipendenze del progetto
# echo "[5 / 7] npm install react-scripts --save-dev"
# npm install react-scripts --save-dev 
echo "[5 / 7] npm config set fetch-retry-maxtimeout 120000"
npm config set fetch-retry-maxtimeout 120000
echo "[6 / 7] npm install"
npm install

# Avvia l'applicazione React
echo "[7 / 7] npm run start"
npm run start
