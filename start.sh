#!/data/data/com.termux/files/usr/bin/bash

# Avvia backend in background
echo "Avvio del backend..."
cd backend
nohup node server.js > backend.log 2>&1 &
echo $! > ../backend.pid
cd ..

# Avvia frontend React
echo "Avvio del frontend React..."
cd frontend

# Imposta l'host per accettare connessioni dalla rete locale
export HOST=0.0.0.0
npm start
