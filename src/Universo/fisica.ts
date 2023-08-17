import { NodoInterface, IValoresSistema } from './types';
import { GPU } from 'gpu.js';
const gpu = new GPU();

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

export const cargasProcess = (valoresSistema: IValoresSistema, nodos: NodoInterface[]) => {
  const N = nodos.length;
  const nodosArray = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    nodosArray[i * 2] = nodos[i].memoria.cargas;
    nodosArray[i * 2 + 1] = nodos[i].memoria.energia;
  }

  const kernelProcess = gpu.createKernel(function (nodos: Float32Array, PROBABILIDAD_TRANSICION: number, FLUCTUACION_MAXIMA: number, PROBABILIDAD_TUNEL: number) {
    const idx = this.thread.x * 2;
    let cargas = nodos[idx];
    let energia = nodos[idx + 1];

    // Transición espontánea
    if (Math.random() < PROBABILIDAD_TRANSICION) {
      cargas = -cargas; // Cambio de estado
    }

    // Fluctuaciones del vacío cuántico
    const fluctuacion = (Math.random() * 2 - 1) * FLUCTUACION_MAXIMA;
    cargas += fluctuacion;

    // Ajuste adicional para fluctuaciones variables
    if (Math.random() < 0.5) {
      cargas -= fluctuacion; // A veces quita carga
    } else {
      cargas += fluctuacion; // A veces añade carga
    }

    // Túnel cuántico (ejemplo simplificado)
    if (cargas > 0.5 && Math.random() < PROBABILIDAD_TUNEL) {
      cargas = 0; // Atraviesa una barrera
    }

    // Asegúrate de mantener las propiedades dentro de los límites válidos
    cargas = Math.min(Math.max(cargas, -1), 1);
    energia = 1 - Math.abs(cargas);

    const resultado = new Float32Array(2);
    resultado[0] = cargas;
    resultado[1] = energia;
  }).setOutput([N]);

  const resultado: any = kernelProcess(
    nodosArray,
    valoresSistema.PROBABILIDAD_TRANSICION,
    valoresSistema.FLUCTUACION_MAXIMA,
    valoresSistema.PROBABILIDAD_TUNEL
  );

  // Actualizar los nodos con los resultados
  for (let i = 0; i < N; i++) {
    nodos[i].memoria.cargas = resultado[i][0];
    nodos[i].memoria.energia = resultado[i][1];
  }
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

const calcularDistanciasGPUFunc = (valoresSistema: IValoresSistema, a: any, b: any) => {
  const N = valoresSistema.FILAS * valoresSistema.COLUMNAS;

  const kernelProcess = gpu.createKernel(function (a: any[], b: any[]) {
    const iA = a[this.thread.x][0];
    const jA = a[this.thread.x][1];
    const iB = b[this.thread.x][0];
    const jB = b[this.thread.x][1];
    return Math.sqrt((iA - iB) ** 2 + (jA - jB) ** 2);
  }).setOutput([N]);
  const data: any = kernelProcess(a, b);
  return data[0];
};


const calcularDistancia = (valoresSistema: IValoresSistema, nodosA: NodoInterface[], nodosB: NodoInterface[]) => {
  const a = nodosA.map(nodo => nodo.id.split('-').slice(1).map(Number));
  const b = nodosB.map(nodo => nodo.id.split('-').slice(1).map(Number));
  return calcularDistanciasGPUFunc(valoresSistema, a, b);
};

const relacionarNodosGPUFunc = (valoresSistema: IValoresSistema, nodos: NodoInterface[]) => {
  // Convertir los nodos a una matriz numérica
  const nodosArray = nodos.map(nodo => [
    nodo.memoria.cargas,
    nodo.memoria.energia,
    nodo.memoria.edad,
    nodo.memoria.relaciones.length,
  ]);

  // Convertir las relaciones a una matriz numérica
  const relacionesArray = nodos.flatMap(nodo =>
    nodo.memoria.relaciones.map(rel => [
      parseFloat(nodo.id.split('-')[2]), // Asume que el ID tiene la forma "nodo-i-j"
      parseFloat(rel.nodoId.split('-')[2]),
      rel.cargaCompartida,
    ])
  );

  // Crear una función de kernel que trabaje con estas matrices
  const kernelProcess = gpu.createKernel(function (nodos: any[], vecinosIndices: number[][]) {
    const idx = this.thread.x;
    const nodo = nodos[idx];
    const resultado = new Array(4);
    for (let i = 0; i < 4; i++) {
      resultado[i] = nodo[i];
    }
    if (nodo.memoria.energia <= valoresSistema.ENERGIA) return;

    const vecinosIdx = vecinosIndices[idx];
    for (let i = 0; i < vecinosIdx.length; i++) {
      const vecinoIdx = vecinosIdx[i];
      const vecino = nodos[vecinoIdx];
      if (!vecino || vecino.memoria.energia <= valoresSistema.ENERGIA || vecino.id === nodo.id || vecino.id < nodo.id) continue;

      const diferenciaCargas = Math.abs(nodo.memoria.cargas - vecino.memoria.cargas);
      const distancia = calcularDistancia(valoresSistema, nodo, vecino); // Aquí puedes usar la función de cálculo de distancia
      const distanciaMaximaPermitida = valoresSistema.DISTANCIA_MAXIMA_RELACION;
      if (distancia > distanciaMaximaPermitida) continue;

      const probabilidadRelacion = (diferenciaCargas / 2) * (1 / distancia) * valoresSistema.FACTOR_RELACION;

      if (Math.random() < probabilidadRelacion && ((nodo.memoria.cargas < 0 && vecino.memoria.cargas > 0) || (nodo.memoria.cargas > 0 && vecino.memoria.cargas < 0))) {
        const cargaCompartida = (nodo.memoria.cargas + vecino.memoria.cargas) / 2;
        nodo.memoria.relaciones.push({ nodoId: vecino.id, cargaCompartida: cargaCompartida });
        resultado[2] = cargaCompartida;
      }
    }
    return resultado;
  }).setOutput([nodos.length]);

  // Llamar a la función de kernel con las matrices
  kernelProcess(nodosArray, relacionesArray);
};

export const relacionarNodos = (valoresSistema: IValoresSistema, nodos: NodoInterface[]) => {
  relacionarNodosGPUFunc(valoresSistema, nodos);
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
  const nuevaGeneracion: NodoInterface[] = [...nodos]; // Crear una copia de los nodos
  cargasProcess(valoresSistema, nodos); // Aplicar transiciones y fluctuaciones
  relacionarNodos(valoresSistema, nodos); // Relacionar todos los nodos

  for (let i = 0; i < valoresSistema.FILAS; i++) {
    for (let j = 0; j < valoresSistema.COLUMNAS; j++) {
      const idx = i * valoresSistema.COLUMNAS + j;
      const nodo = nuevaGeneracion[idx];
      const vecinos = obtenerVecinos(nodos, valoresSistema, i, j);
      if (!vecinos || !nodo) continue;

      const esGrupoCircular = esParteDeGrupoCircular(
        valoresSistema,
        nodo,
        vecinos,
      );

      procesoDeVidaOMuerte(nodo); // Proceso de vida o muerte

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

