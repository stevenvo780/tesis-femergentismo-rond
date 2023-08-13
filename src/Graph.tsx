import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { NodoInterface, ValoresSistema } from './types';
import cytoscape from 'cytoscape'; // Importa cytoscape.js primero
import cytoscapePopper from 'cytoscape-popper'; // Importa el módulo cytoscape-popper después
import { Modal } from 'react-bootstrap'; // Registra el módulo cytoscape-popper como una extensión
import { JSONTree } from 'react-json-tree';
cytoscape.use(cytoscapePopper);

interface GraphProps {
  nodos: NodoInterface[];
}

const Graph: React.FC<GraphProps> = ({ nodos }) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>({});

  const elements = nodos.flatMap((nodo, index) => {
    const i = Math.floor(index / ValoresSistema.COLUMNAS);
    const j = index % ValoresSistema.COLUMNAS;
    const color = nodo.memoria.vivo === true ? `rgba(0, 255, 0, ${nodo.memoria.edad / ValoresSistema.LIMITE_EDAD})` : 'rgba(200, 200, 200, 1)';
    const label = `${nodo.id} - ${nodo.memoria.edad}`;
    const propiedades = JSON.stringify(nodo);

    return [
      { data: { id: nodo.id, label, propiedades }, position: { x: j * 80, y: i * 80 }, style: { 'background-color': color, 'width': 70, 'height': 70 } },
      ...nodo.memoria.relaciones.map((rel, relIndex) => ({
        data: { id: `${nodo.id}-${rel.id}-${relIndex}`, source: nodo.id, target: rel.id },
      })),
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

  const layout = {
    name: 'preset',
  };

  const handleCy = (cy: cytoscape.Core) => {
    cyRef.current = cy;
  };

  const handleElementClick = (element: cytoscape.SingularElementArgument) => {
    console.log(element.data('propiedades'));
    setModalContent(JSON.parse(element.data('propiedades')));
    setShowModal(true);
  };


  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.json({ elements });
      cy.nodes().forEach((node) => {
        const nodoId = node.data('id');
        const nodo = nodos.find((n) => n.id === nodoId);
        if (nodo) {
          const color = nodo.memoria.vivo === true ? `rgba(0, 255, 0, ${nodo.memoria.edad / ValoresSistema.LIMITE_EDAD})` : 'rgba(200, 200, 200, 1)';
          node.style({ 'background-color': color });
        }
      });
      cy.elements().forEach((element) => {
        element.on('click', () => handleElementClick(element));
      });
    }
  }, [nodos]);


  return (
    <div>
      <CytoscapeComponent
        cy={handleCy}
        elements={elements}
        style={{ width: '100%', height: '100vh' }}
        layout={layout}
        stylesheet={style}
      />
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
