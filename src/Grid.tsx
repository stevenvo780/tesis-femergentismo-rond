import React, { useRef, useEffect } from 'react';
import { NodoInterface, PhysicsRules } from './Universo/types';

interface GridProps {
  nodos: NodoInterface[];
  configuracion: typeof PhysicsRules;
}

const Grid: React.FC<GridProps> = ({ nodos, configuracion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas

        const gridSize = Math.sqrt(nodos.length); // Asume una cuadrícula cuadrada
        const cellSize = 5; // Tamaño de cada celda en píxeles

        nodos.forEach((nodo, index) => {
          const x = (index % gridSize) * cellSize;
          const y = Math.floor(index / gridSize) * cellSize;
          let color;

          if (nodo.memoria.energia > 0.9  && nodo.memoria.relaciones.length > PhysicsRules.DISTANCIA_MAXIMA_RELACION) {
            color = `rgba(255, 255, 0, ${nodo.memoria.cargas + nodo.memoria.energia})`; // Amarillo
          } else {
            if (nodo.memoria.cargas > 0) {
              const blueComponent = 255 * nodo.memoria.cargas;
              color = `rgba(0, 200, ${blueComponent}, ${Math.abs(nodo.memoria.cargas) + nodo.memoria.energia})`; // Azul
            } else {
              const greyComponent = 200 - 255 * Math.abs(nodo.memoria.cargas);
              color = `rgba(${greyComponent}, ${greyComponent}, ${greyComponent}, ${Math.abs(nodo.memoria.cargas) + nodo.memoria.energia})`; // Gris
            }
          }

          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellSize, cellSize);
        });
      }
    }
  }, [nodos]);

  return (
    <div>
      <canvas ref={canvasRef} width={Math.sqrt(nodos.length) * 5} height={Math.sqrt(nodos.length) * 5} />
    </div>
  );
};

export default Grid;


