import React, { useEffect, useState } from 'react';
import Graph from './Graph';
import { NodoInterface, ValoresSistema } from './types';

function App() {
  const [nodos, setNodos] = useState<NodoInterface[]>([]);
  const [configuracion, setConfiguracion] = useState<typeof ValoresSistema>(ValoresSistema);
  const fetchNodos = () => {
    fetch('http://localhost:3006/')
      .then(response => response.json())
      .then(data => {
        setNodos(data.nodos)
        console.log(data.valoresSistema);
        setConfiguracion(data.valoresSistema);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNodos();
    const interval = setInterval(fetchNodos, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Graph configuracion={configuracion} nodos={nodos} />
    </div>
  );
}

export default App;
