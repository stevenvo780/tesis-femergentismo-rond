import { NodoInterface, IPhysicsRules } from './types';
import { calcularEnergia, intercambiarCargas, relacionarNodos } from './time';

export const ruliat = (
  nodo: NodoInterface,
  valoresSistema: IPhysicsRules,
) => {
  // Transición espontánea
  if (Math.random() < valoresSistema.PROBABILIDAD_TRANSICION) {
    nodo.memoria.cargas = -nodo.memoria.cargas; // Cambio de estado
  }

  // Fluctuaciones del vacío cuántico
  const fluctuacion =
    (Math.random() * 2 - 1) * valoresSistema.FLUCTUACION_MAXIMA;
  nodo.memoria.cargas += fluctuacion;

  // Ajuste adicional para fluctuaciones variables
  if (Math.random() < 0.5) {
    nodo.memoria.cargas -= fluctuacion; // A veces quita carga
  } else {
    nodo.memoria.cargas += fluctuacion; // A veces añade carga
  }

  // Túnel cuántico (ejemplo simplificado)
  if (
    nodo.memoria.cargas > 0.5 &&
    Math.random() < valoresSistema.PROBABILIDAD_TUNEL
  ) {
    nodo.memoria.cargas = 0; // Atraviesa una barrera
  }

  // Aquí puedes agregar más efectos, como interacciones de partículas virtuales, etc.

  // Asegúrate de mantener las propiedades dentro de los límites válidos
  nodo.memoria.cargas = Math.min(Math.max(nodo.memoria.cargas, -1), 1);
  nodo.memoria.energia = 1 - Math.abs(nodo.memoria.cargas);
};

const esParteDeGrupoCircular = (
  valoresSistema: IPhysicsRules,
  nodo: NodoInterface,
  vecinos: NodoInterface[],
): boolean => {
  // Puedes ajustar esta lógica según tus necesidades
  return (
    vecinos.length >= valoresSistema.LIMITE_RELACIONAL &&
    nodo.memoria.relaciones.length >= valoresSistema.LIMITE_RELACIONAL
  );
};


const obtenerVecinos = (
  nodos: NodoInterface[],
  valoresSistema: IPhysicsRules,
  i: number,
  j: number,
): NodoInterface[] => {
  const FILAS = valoresSistema.FILAS;
  const COLUMNAS = valoresSistema.COLUMNAS;

  const indicesVecinos = [
    i > 0 && j > 0 ? (i - 1) * COLUMNAS + (j - 1) : -1,
    i > 0 ? (i - 1) * COLUMNAS + j : -1,
    i > 0 && j < COLUMNAS - 1 ? (i - 1) * COLUMNAS + (j + 1) : -1,
    j > 0 ? i * COLUMNAS + (j - 1) : -1,
    j < COLUMNAS - 1 ? i * COLUMNAS + (j + 1) : -1,
    i < FILAS - 1 && j > 0 ? (i + 1) * COLUMNAS + (j - 1) : -1,
    i < FILAS - 1 ? (i + 1) * COLUMNAS + j : -1,
    i < FILAS - 1 && j < COLUMNAS - 1 ? (i + 1) * COLUMNAS + (j + 1) : -1,
  ];

  return indicesVecinos
    .filter((indice) => indice >= 0 && indice < nodos.length)
    .map((indice) => nodos[indice]);
};

const procesoDeVidaOMuerte = (nodo: NodoInterface) => {
  nodo.memoria.energia = calcularEnergia(nodo);
};


export const siguienteGeneracion = (
  nodos: NodoInterface[],
  valoresSistema: IPhysicsRules,
) => {
  const nuevaGeneracion: NodoInterface[] = nodos;
  for (let i = 0; i < valoresSistema.FILAS; i++) {
    for (let j = 0; j < valoresSistema.COLUMNAS; j++) {
      const nodo = nuevaGeneracion[i * valoresSistema.COLUMNAS + j];
      const vecinos = obtenerVecinos(nuevaGeneracion, valoresSistema, i, j);
      if (!vecinos || !nodo) {
        console.error('Error al relacionar los nodos:', nodos.length);
        continue;
      }
      const esGrupoCircular = esParteDeGrupoCircular(
        valoresSistema,
        nodo,
        vecinos,
      );
      ruliat(nodo, valoresSistema);
      procesoDeVidaOMuerte(nodo); // Proceso de vida o muerte
      relacionarNodos(valoresSistema, nodo, vecinos); // Relacionar nodo
      vecinos.forEach((vecino) => {
        if (
          (nodo?.memoria.cargas < 0 && vecino?.memoria.cargas > 0) ||
          (nodo?.memoria.cargas > 0 && vecino?.memoria.cargas < 0)
        ) {
          intercambiarCargas(valoresSistema, nodo, vecino, esGrupoCircular);
        }
      });
    }
  }

  return nuevaGeneracion;
};
