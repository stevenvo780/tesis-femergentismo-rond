import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { NodoInterface, ValoresSistema } from './types';
import cytoscape from 'cytoscape'; // Importa cytoscape.js primero
import cytoscapePopper from 'cytoscape-popper'; // Importa el módulo cytoscape-popper después
import { Modal, Row, Col } from 'react-bootstrap'; // Registra el módulo cytoscape-popper como una extensión
import { JSONTree } from 'react-json-tree';
cytoscape.use(cytoscapePopper);

interface GraphProps {
  nodos: NodoInterface[];
  configuracion: typeof ValoresSistema;
}

const Graph: React.FC<GraphProps> = ({ nodos, configuracion }) => {
  const startX = 0;
  const startY = 0;
  const endX = 100;
  const endY = 100;
  const matrisRef = useRef<cytoscape.Core | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>({});

  const elements = nodos.flatMap((nodo, index) => {
    const i = Math.floor(index / configuracion.COLUMNAS);
    const j = index % configuracion.COLUMNAS;
    // Si el nodo está fuera de la subsección, omitirlo
    if (i < startY || i >= endY || j < startX || j >= endX) return [];

    // Ajustar las posiciones para la nueva vista
    const x = (j - startX) * 80;
    const y = (i - startY) * 80;
    const color = nodo.memoria.vivo === true ? `rgba(0, 255, 0, ${nodo.memoria.edad / configuracion.LIMITE_EDAD})` : 'rgba(200, 200, 200, 1)';
    const label = `${nodo.id} - ${nodo.memoria.edad}`;
    const propiedades = JSON.stringify(nodo);
    const filter = nodo.memoria.relaciones.filter((rel) => {
      const targetIndex = nodos.find((nodo) => nodo.id === rel.nodoId);
      if (!targetIndex) {
        console.log(targetIndex);
      }
      return targetIndex ? true : false; // Asegúrate de que el nodo de destino exista
    }).map((rel, relIndex) => {
      return {
        data: { id: `${nodo.id}-${rel.nodoId}-${relIndex}`, source: nodo.id, target: rel.nodoId },
      }
    })
    return [
      { data: { id: nodo.id, label, propiedades }, position: { x, y }, style: { 'background-color': color, 'width': 70, 'height': 70 } },
      ...filter,
    ];
  });

  const style: any[] = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'font-size': '8px',
        'text-valign': 'center',
        'text-halign': 'center',
        color: '#000',
      },
    },
    {
      selector: 'edge',
      style: {
        'line-color': '#aaa',
      },
    },
  ];

  const layout2 = {
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  };

  const layout = {
    name: 'preset',
  };


  const handleMatris = (cy: cytoscape.Core) => {
    matrisRef.current = cy;
  };

  const handleElementClick = (element: cytoscape.SingularElementArgument) => {
    console.log(element.data('propiedades'));
    setModalContent(JSON.parse(element.data('propiedades')));
    setShowModal(true);
  };


  useEffect(() => {
    const updateGraph = (cy: cytoscape.Core) => {
      // Eliminar todos los elementos existentes
      cy.elements().remove();

      // Agregar nodos y aristas
      cy.add(elements);

      // Actualizar el estilo de los nodos
      cy.nodes().forEach((node) => {
        const nodoId = node.data('id');
        const nodo = nodos.find((n) => n.id === nodoId);
        if (nodo) {
          const color = nodo.memoria.vivo === true ? `rgba(0, 255, 0, ${nodo.memoria.edad / ValoresSistema.LIMITE_EDAD})` : 'rgba(200, 200, 200, 1)';
          node.style({ 'background-color': color });
        }
      });

      // Agregar manejadores de clic
      cy.elements().off('click').on('click', (event) => handleElementClick(event.target));

      // Aplicar el nuevo diseño
      cy.layout(layout).run();
    };

    // Actualizar ambos gráficos
    if (matrisRef.current) updateGraph(matrisRef.current);
  }, [nodos]);


  return (
    <div>
      <Row>
        <Col sm="12">
          <CytoscapeComponent
            cy={handleMatris}
            elements={elements}
            style={{ width: '100%', height: '100vh' }}
            layout={layout}
            stylesheet={style}
          />
        </Col>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Información</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JSONTree data={modalContent} invertTheme={false} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Graph;
