#!/data/data/com.termux/files/usr/bin/bash

# Avvia backend in background
echo "Avvio del backend..."
cd backend
nohup node server.js > backend.log 2>&1 &

# Salva il PID del backend per poterlo fermare se serve
echo $! > ../backend.pid
cd ..

# Avvia frontend in foreground
echo "Avvio del frontend React..."
cd frontend
npm start
