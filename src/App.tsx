import React, { useEffect, useState } from 'react';
import Graph from './Graph';
import Grid from './Grid';
import { NodoInterface, ValoresSistema } from './types';
// Importar los componentes y hooks de react-router-dom
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [nodos, setNodos] = useState<NodoInterface[]>([]);
  const [configuracion, setConfiguracion] = useState<typeof ValoresSistema>(ValoresSistema);
  const [pausado, setPausado] = useState(false);

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

  const togglePausa = () => setPausado(!pausado);

  useEffect(() => {
    if (!pausado) {
      fetchNodos();
      const interval = setInterval(fetchNodos, 1000);
      return () => clearInterval(interval);
    }
  }, [pausado]);

  return (
    <div className="App">
      <button onClick={togglePausa}>{pausado ? 'Despausar' : 'Pausar'}</button>
      <Router>
        <Routes>
          <Route path="/" element={<Graph configuracion={configuracion} nodos={nodos} />} />
          <Route path="/grid" element={<Grid configuracion={configuracion} nodos={nodos} />} />
        </Routes>
      </Router>
    </div>
  );
}


export default App;
