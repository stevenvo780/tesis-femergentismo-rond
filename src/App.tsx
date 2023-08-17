import React, { useEffect, useState } from 'react';
import Graph from './Graph';
import Grid from './Grid';
import { Entrenador } from './Universo/entrenador';
import { NodoInterface, ValoresSistema } from './types';
// Importar los componentes y hooks de react-router-dom
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [nodos, setNodos] = useState<NodoInterface[]>([]);
  const [configuracion, setConfiguracion] = useState<typeof ValoresSistema>(ValoresSistema);
  const [pausado, setPausado] = useState(false);
  const [universoAprendizaje] = useState<Entrenador>(new Entrenador());

  const obtenerEstadoActualizado = React.useCallback(() => {
    if (universoAprendizaje) {
      return universoAprendizaje.universo.obtenerEstadoActualizado();
    }
    return null;
  },[universoAprendizaje])

  const togglePausa = () => setPausado(!pausado);

  useEffect(() => {
    if (!pausado) {
      const fetchNodos = () => {
        const data: any = obtenerEstadoActualizado();
        console.log(data.nodos[0]);
        if (data) {
          // Crear nuevos objetos para nodos y configuración
          setNodos([...data.nodos]);
          setConfiguracion({ ...data.valoresSistema });
        }
      };

      fetchNodos(); // Llamar a fetchNodos inmediatamente
      const interval = setInterval(fetchNodos, 1000); // Luego cada segundo

      return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonte
    }
  }, [pausado, obtenerEstadoActualizado, nodos, configuracion]);

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
