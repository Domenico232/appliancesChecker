import React, { useEffect, useState } from 'react';
import './App.css'; // Assicurati di avere il CSS caricato

function App() {
  const [appliances, setAppliances] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://25.45.24.31:3001');
    ws.onopen = () => console.log('Connesso al WebSocket');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'state') {
        setAppliances(message.data);
      }
      if (message.type === 'alert') {
        alert(message.message);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const toggleAppliance = (nome) => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'toggle', nome }));
    }
  };

  return (
    <div className="container">
      <h1>🌺 Ohana Elettrodomestici 🌺</h1>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Stato</th>
            <th>Consumo</th>
            <th>Controllo</th>
          </tr>
        </thead>
        <tbody>
          {appliances.map((appl) => (
            <tr key={appl.nome}>
              <td>{appl.nome}</td>
              <td>{appl.acceso ? '🔆 Acceso' : '🌙 Spento'}</td>
              <td>{appl.consumo} kWh</td>
              <td>
                <button onClick={() => toggleAppliance(appl.nome)}>
                  {appl.acceso ? 'Spegni' : 'Accendi'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
