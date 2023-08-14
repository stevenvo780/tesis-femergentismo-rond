export const ValoresSistema = {
  FILAS: 100,
  COLUMNAS: 100,
  PROBABILIDAD_VIDA_INICIAL: 0.99999,
  LIMITE_EDAD: 5,
  REDUCCION_CARGA: 0.01,
  CRECIMIENTO_X: 2, // Número de filas a añadir en cada generación
  CRECIMIENTO_Y: 2, // Número de columnas a añadir en cada generación
  UMBRAL_CARGA: 0.0001,
  FACTOR_ESTABILIDAD: 0.2,
  LIMITE_RELACIONAL: 3,
  DISTANCIA_MAXIMA_RELACION: 1,
  ENERGIA: 0.1,
  PROBABILIDAD_TRANSICION: 0.01,
  FLUCTUACIÓN_MAXIMA: 0.01,
  PROBABILIDAD_TUNEL: 0.01,
};

export interface NodoInterface {
  id: string;
  memoria: Memoria;
}

export interface Relacion {
  nodoId: string;
  cargaCompartida: number;
}

export interface Memoria {
  cargas: number;
  energia: number;
  edad: number;
  procesos: Procesos;
  relaciones: Relacion[];
}

export interface Procesos {
  relacionarNodos: (nodo: NodoInterface, vecinos: NodoInterface[]) => void;
  intercambiarCargas: (
    nodoA: NodoInterface,
    nodoB: NodoInterface,
    esGrupoCircular: boolean,
  ) => void;
}
