import { NodoInterface, IPhysicsRules } from './types';

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

export const calcularEnergia = (nodo: NodoInterface) => {
  let energia = 1 - Math.abs(nodo.memoria.cargas);
  nodo.memoria.relaciones.forEach((rel) => {
    energia += Math.abs(rel.cargaCompartida);
  });
  return Math.min(energia, 1); // Asegurar que la energía esté en el rango [0, 1]
};

export const intercambiarCargas = (
  valoresSistema: IPhysicsRules,
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

export const calcularDistancia = (nodoA: NodoInterface, nodoB: NodoInterface) => {
  const [iA, jA] = nodoA.id.split('-').slice(1).map(Number);
  const [iB, jB] = nodoB.id.split('-').slice(1).map(Number);
  return Math.sqrt((iA - iB) ** 2 + (jA - jB) ** 2);
};

export const relacionarNodos = (
  valoresSistema: IPhysicsRules,
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
          valoresSistema.DISTANCIA_MAXIMA_RELACION; // Añadir este valor en PhysicsRules
        if (distancia > distanciaMaximaPermitida) return; // No relacionar nodos lejanos

        const probabilidadRelacion =
          (diferenciaCargas / 2) *
          (1 / distancia) *
          valoresSistema.FACTOR_RELACION; // Añadir FACTOR_RELACION en PhysicsRules

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
  valoresSistema: IPhysicsRules,
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
    //console.log(nodos.length);
  }

  // Actualizar los valores del sistema
  valoresSistema.FILAS += valoresSistema.CRECIMIENTO_X;
  valoresSistema.COLUMNAS += valoresSistema.CRECIMIENTO_Y;

  return nodos;
};


