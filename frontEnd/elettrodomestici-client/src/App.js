import React, { useEffect, useState } from 'react';

const socket = new WebSocket('ws://localhost:3001');

export default function App() {
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'state') {
        setAppliances(msg.data);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const toggleAppliance = (nome) => {
    socket.send(JSON.stringify({ type: 'toggle', nome }));
  };

  const totalPower = appliances
    .filter(a => a.acceso)
    .reduce((sum, a) => sum + a.consumo, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Monitor Elettrodomestici</h1>
      <p className="text-lg mb-2">Consumo totale: <strong>{totalPower.toFixed(2)} kW</strong></p>
      {totalPower > 3 && (
        <div className="bg-red-200 text-red-800 font-semibold p-2 rounded">
          ⚠️ Superato il limite di 3 kW!
        </div>
      )}
      <ul className="mt-4 w-full max-w-md space-y-2">
        {appliances.map(appl => (
          <li
            key={appl.nome}
            className="flex justify-between items-center bg-white p-3 rounded shadow"
          >
            <span>{appl.nome} ({appl.consumo} kW)</span>
            <button
              onClick={() => toggleAppliance(appl.nome)}
              className={`px-4 py-1 rounded text-white ${appl.acceso ? 'bg-green-600' : 'bg-gray-400'}`}
            >
              {appl.acceso ? 'Acceso' : 'Spento'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

