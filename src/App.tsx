import React, { useEffect, useState } from 'react';
import Graph from './Graph';
import Grid from './Grid';
import { NodoInterface, PhysicsRules } from './Universo/types';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useUniversoAprendizaje } from './index';
import { Row, Col, Form, Button, ButtonGroup, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';


function App() {
  const [nodos, setNodos] = useState<NodoInterface[]>([]);
  const [configuracion, setConfiguracion] = useState<typeof PhysicsRules>(PhysicsRules);
  const [pausado, setPausado] = useState(false);
  const [lastUniverse, setLastUniverse] = useState<string>('');
  const universoAprendizaje = useUniversoAprendizaje();

  const togglePausa = () => setPausado(!pausado);

  useEffect(() => {
    if (!pausado) {
      const fetchNodos = () => {
        if (lastUniverse !== universoAprendizaje.universo.id) {
          setLastUniverse(universoAprendizaje.universo.id);
        }
        setNodos([...universoAprendizaje.universo.nodos]);
        setConfiguracion({ ...universoAprendizaje.universo.valoresSistema });
      };
      fetchNodos();
      const interval = setInterval(fetchNodos, 500);

      return () => clearInterval(interval);
    }
  }, [pausado, universoAprendizaje.universo, lastUniverse]);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'tiempoLimiteSinEstructuras') {
      universoAprendizaje.actualizarConfiguracion(Number(value), universoAprendizaje.tasaDeAprendizaje);
    } else if (name === 'tasaDeAprendizaje') {
      universoAprendizaje.actualizarConfiguracion(universoAprendizaje.tiempoLimiteSinEstructuras, Number(value));
    }
  };

  return (
    <Router>
      <div className="App">
        <Container fluid >
          <Row>
            <Col sm="4">
              <Button style={{ margin: 10 }} onClick={togglePausa}>{pausado ? 'Despausar' : 'Pausar'}</Button>
              <ButtonGroup aria-label="Botones de navegación">
                <NavLink to="/">
                  <Button style={{ margin: 10 }} variant="primary">Ver Gráfico</Button>
                </NavLink>
                <NavLink to="/grid">
                  <Button style={{ margin: 10 }} variant="secondary">Ver Grid</Button>
                </NavLink>
              </ButtonGroup>
            </Col>
            <Col sm="8">
              <Form>
                <Row>
                  <Col sm="4">
                    <Form.Group>
                      <Form.Label>Tiempo Límite Sin Estructuras:</Form.Label>
                      <Form.Control
                        type="number"
                        name="tiempoLimiteSinEstructuras"
                        value={universoAprendizaje.tiempoLimiteSinEstructuras}
                        onChange={handleConfigChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm="4">
                    <Form.Group>
                      <Form.Label>Tasa de Aprendizaje:</Form.Label>
                      <Form.Control
                        type="number"
                        name="tasaDeAprendizaje"
                        value={universoAprendizaje.tasaDeAprendizaje}
                        onChange={handleConfigChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <strong>Tiempo:</strong> {universoAprendizaje.universo.tiempo}
            </Col>
            <Col sm={3}>
              <strong>Id:</strong> {universoAprendizaje.universo.id}
            </Col>
            {Object.entries(configuracion).map(([key, value], index) => (
              <Col sm={2} key={index}>
                <strong>{key}:</strong> {value}
              </Col>
            ))}
          </Row>
        </Container>
        <Routes>
          <Route path="/" element={<Graph configuracion={configuracion} nodos={nodos} />} />
          <Route path="/grid" element={<Grid configuracion={configuracion} nodos={nodos} />} />
        </Routes>
      </div >
    </Router>
  );
}

export default App;
