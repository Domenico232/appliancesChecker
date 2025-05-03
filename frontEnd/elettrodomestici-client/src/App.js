import React, { useEffect, useState } from 'react';

function App() {
  const [appliances, setAppliances] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('Connesso al WebSocket');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'state') {
        setAppliances(message.data);  // Aggiorna lo stato con i dati ricevuti
      }
      if (message.type === 'state') {
        alert(message.message);  // Aggiorna lo stato con i dati ricevuti
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  // Funzione per cambiare lo stato di un elettrodomestico
  const toggleAppliance = (nome) => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'toggle',
        nome
      }));
    }
  };

  return (
    <div>
      <h1>Stato Elettrodomestici</h1>
      <ul>
        {appliances.map((appliance) => (
          <li key={appliance.nome}>
            <span>{appliance.nome}</span> - 
            <span>{appliance.acceso ? 'Acceso' : 'Spento'}</span>
            <button onClick={() => toggleAppliance(appliance.nome)}>
              {appliance.acceso ? 'Acceso' : 'Spento'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

