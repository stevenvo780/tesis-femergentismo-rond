import { NodoInterface, IValoresSistema } from './types';

export const crearNodo = (
  i: number,
  j: number,
  cargas: number,
  energia: number,
): NodoInterface => {
  return {
    id: `nodo-${i}-${j}`,
    memoria: {
      cargas: cargas,
      energia: energia,
      edad: 0,
      procesos: {
        relacionarNodos,
        intercambiarCargas,
      },
      relaciones: [],
    },
  };
};

export const ruliat = (
  nodo: NodoInterface,
  valoresSistema: IValoresSistema,
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

const calcularEnergia = (nodo: NodoInterface) => {
  let energia = 1 - Math.abs(nodo.memoria.cargas);
  nodo.memoria.relaciones.forEach((rel) => {
    energia += Math.abs(rel.cargaCompartida);
  });
  return Math.min(energia, 1); // Asegurar que la energía esté en el rango [0, 1]
};

const esParteDeGrupoCircular = (
  valoresSistema: IValoresSistema,
  nodo: NodoInterface,
  vecinos: NodoInterface[],
): boolean => {
  // Puedes ajustar esta lógica según tus necesidades
  return (
    vecinos.length >= valoresSistema.LIMITE_RELACIONAL &&
    nodo.memoria.relaciones.length >= valoresSistema.LIMITE_RELACIONAL
  );
};

export const intercambiarCargas = (
  valoresSistema: IValoresSistema,
  nodoA: NodoInterface,
  nodoB: NodoInterface,
  esGrupoCircular: boolean,
): void => {
  let cargaCompartida = (nodoA.memoria.cargas + nodoB.memoria.cargas) / 2;

  if (esGrupoCircular) {
    cargaCompartida = cargaCompartida * (1 - valoresSistema.FACTOR_ESTABILIDAD);
  }
  nodoA.memoria.cargas = cargaCompartida;
  nodoB.memoria.cargas = cargaCompartida;

  // Actualizar la carga compartida en la relación
  nodoA.memoria.relaciones.forEach((rel) => {
    if (rel.nodoId === nodoB.id) rel.cargaCompartida = cargaCompartida;
  });
  nodoB.memoria.relaciones.forEach((rel) => {
    if (rel.nodoId === nodoA.id) rel.cargaCompartida = cargaCompartida;
  });

  nodoA.memoria.energia = calcularEnergia(nodoA);
  nodoB.memoria.energia = calcularEnergia(nodoB);
};

const obtenerVecinos = (
  nodos: NodoInterface[],
  valoresSistema: IValoresSistema,
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

const calcularDistancia = (nodoA: NodoInterface, nodoB: NodoInterface) => {
  const [iA, jA] = nodoA.id.split('-').slice(1).map(Number);
  const [iB, jB] = nodoB.id.split('-').slice(1).map(Number);
  return Math.sqrt((iA - iB) ** 2 + (jA - jB) ** 2);
};

export const relacionarNodos = (
  valoresSistema: IValoresSistema,
  nodo: NodoInterface,
  vecinos: NodoInterface[],
) => {
  if (nodo.memoria.energia > valoresSistema.ENERGIA) {
    vecinos.forEach((vecino) => {
      if (
        vecino &&
        vecino.memoria.energia > valoresSistema.ENERGIA &&
        vecino.id !== nodo.id &&
        vecino.id > nodo.id
      ) {
        const diferenciaCargas = Math.abs(
          nodo.memoria.cargas - vecino.memoria.cargas,
        );
        const distancia = calcularDistancia(nodo, vecino);
        const distanciaMaximaPermitida =
          valoresSistema.DISTANCIA_MAXIMA_RELACION; // Añadir este valor en ValoresSistema
        if (distancia > distanciaMaximaPermitida) return; // No relacionar nodos lejanos

        const probabilidadRelacion =
          (diferenciaCargas / 2) *
          (1 / distancia) *
          valoresSistema.FACTOR_RELACION; // Añadir FACTOR_RELACION en ValoresSistema

        if (
          Math.random() < probabilidadRelacion &&
          ((nodo.memoria.cargas < 0 && vecino.memoria.cargas > 0) ||
            (nodo.memoria.cargas > 0 && vecino.memoria.cargas < 0))
        ) {
          const relacionExistente = nodo.memoria.relaciones.find(
            (rel) => rel.nodoId === vecino.id,
          );
          if (!relacionExistente) {
            const cargaCompartida =
              (nodo.memoria.cargas + vecino.memoria.cargas) / 2;
            nodo.memoria.relaciones.push({
              nodoId: vecino.id,
              cargaCompartida: cargaCompartida,
            });
          }
        }
      }
    });
  }

  // Reducir gradualmente la carga compartida y eliminar relaciones con carga cero
  nodo.memoria.relaciones = nodo.memoria.relaciones.filter((rel) => {
    // Condición para romper la relación si la energía de la carga compartida se acerca a 0
    if (Math.abs(rel.cargaCompartida) < valoresSistema.ENERGIA) {
      return false; // Romper la relación
    }

    if (nodo.memoria.energia <= valoresSistema.ENERGIA) {
      return false; // Eliminar la relación si la carga es cero o negativa
    }
    return true;
  });
};

export const expandirEspacio = (
  nodos: NodoInterface[],
  valoresSistema: IValoresSistema,
) => {
  // Añadir filas en la parte inferior
  for (let i = 0; i < valoresSistema.CRECIMIENTO_X; i++) {
    for (let j = 0; j < valoresSistema.COLUMNAS; j++) {
      const cargas = Math.random() * 2 - 1;
      const energia = 1 - Math.abs(cargas);
      const nodo: NodoInterface = crearNodo(
        valoresSistema.FILAS + i,
        j,
        cargas,
        energia,
      );
      nodos.push(nodo);
    }
  }

  // Añadir columnas a la derecha
  for (
    let i = 0;
    i < valoresSistema.FILAS + valoresSistema.CRECIMIENTO_X;
    i++
  ) {
    for (let j = 0; j < valoresSistema.CRECIMIENTO_Y; j++) {
      const cargas = Math.random() * 2 - 1;
      const energia = 1 - Math.abs(cargas);
      const nodo: NodoInterface = crearNodo(
        i,
        valoresSistema.COLUMNAS + j,
        cargas,
        energia,
      );
      nodos.push(nodo);
    }
  }

  // Actualizar los valores del sistema
  valoresSistema.FILAS += valoresSistema.CRECIMIENTO_X;
  valoresSistema.COLUMNAS += valoresSistema.CRECIMIENTO_Y;

  return nodos;
};

export const siguienteGeneracion = (
  nodos: NodoInterface[],
  valoresSistema: IValoresSistema,
) => {
  const nuevaGeneracion: NodoInterface[] = nodos;
  for (let i = 0; i < valoresSistema.FILAS; i++) {
    for (let j = 0; j < valoresSistema.COLUMNAS; j++) {
      const nodo = nuevaGeneracion[i * valoresSistema.COLUMNAS + j];
      const vecinos = obtenerVecinos(nodos, valoresSistema, i, j);
      if (!vecinos || !nodo) {
        console.error('nodos:', valoresSistema);
        console.log(JSON.stringify(nodos[nodos.length - 1], null, 4));
        //console.error('nodos:', nodos.length);
        //console.error('Vecinos no definidos para nodo:', i, j);
        continue; // Saltar a la siguiente iteración si los vecinos no están definidos
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
