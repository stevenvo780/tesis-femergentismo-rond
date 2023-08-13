import React, { useEffect, useState } from 'react';
import Graph from './Graph';
import { NodoInterface } from './types';

function App() {
  const [nodos, setNodos] = useState<NodoInterface[]>([]);

  const fetchNodos = () => {
    fetch('http://localhost:3006/')
      .then(response => response.json())
      .then(data => setNodos(data));
  };

  useEffect(() => {
    fetchNodos();
    const interval = setInterval(fetchNodos, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Graph nodos={nodos} />
    </div>
  );
}

export default App;
