const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const os = require('os');

// Funzione per ottenere l'indirizzo IP locale
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}


// Carica gli elettrodomestici dal file JSON all'avvio
let totalConsumption = 0;
let appliances = [];
const appliancesFilePath = path.join(__dirname, 'appliances.json');

// Funzione per caricare gli elettrodomestici dal file JSON
function loadAppliances() {
  try {
    const data = fs.readFileSync(appliancesFilePath, 'utf8');
    appliances = JSON.parse(data);
  } catch (err) {
    console.error('Errore nel caricare il file degli elettrodomestici:', err);
    // Se non esiste il file, usa un set di dati di default
    appliances = [
      { nome: "Forno", consumo: 2.0, acceso: false },
      { nome: "Lavatrice", consumo: 1.2, acceso: false },
      { nome: "Asciugatrice", consumo: 1.5, acceso: false },
      { nome: "Climatizzatore", consumo: 0.9, acceso: false },
      { nome: "Lavastoviglie", consumo: 1.3, acceso: false }
    ];
  }
}

// Funzione per salvare gli elettrodomestici nel file JSON
function saveAppliances() {
  try {
    fs.writeFileSync(appliancesFilePath, JSON.stringify(appliances, null, 2));
  } catch (err) {
    console.error('Errore nel salvare il file degli elettrodomestici:', err);
  }
}

// Funzione per inviare un avviso se il consumo supera i 3 kW
function checkForAlert() {
  let totalConsumption = 0;
    appliances.forEach(appliance => {
    if (appliance.acceso) {
      totalConsumption += appliance.consumo;
    }
    });

  if (totalConsumption > 3) {
    broadcast({ type: 'alert', message: 'Attenzione: consumo totale superiore a 3 kW!' });
  }
}

// Carica gli elettrodomestici all'avvio
loadAppliances();

// Serve React static build (se copi dentro il build della React app)
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Invia a tutti i client connessi
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connesso');
  // Invia stato iniziale
  ws.send(JSON.stringify({ type: 'state', data: appliances }));

  ws.on('message', (message) => {
    const parsed = JSON.parse(message);
    if (parsed.type === 'toggle') {
      appliances = appliances.map(appl =>
        appl.nome === parsed.nome ? { ...appl, acceso: !appl.acceso } : appl
      );

      // Salva lo stato nel file JSON ogni volta che un elettrodomestico viene cambiato
      saveAppliances();
      
      // Verifica e invia un avviso se necessario
      checkForAlert();
      
      broadcast({ type: 'state', data: appliances });
      broadcast({ type: 'consumes', message: `${parsed.nome}` });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnesso');
  });
});
const localIp = getLocalIp();
const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend in ascolto su http://${localIp}:${PORT}`);
  });
