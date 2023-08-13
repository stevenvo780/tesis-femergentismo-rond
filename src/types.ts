export const ValoresSistema = {
  FILAS: 20,
  COLUMNAS: 20,
  PROBABILIDAD_VIDA_INICIAL: 0.5,
  LIMITE_EDAD: 10,
  DISTANCIA_RELACION: 3,
  REDUCCION_CARGA: 0.1,
  CRECIMIENTO_X: 1, // Número de filas a añadir en cada generación
  CRECIMIENTO_Y: 1, // Número de columnas a añadir en cada generación
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
  vivo: boolean;
  propiedades: number[];
  edad: number;
  procesos: Procesos;
  relaciones: Relacion[];
}

export interface Procesos {
  materiaEntrante: (nodo: NodoInterface, propiedad: number) => number;
  cambioDeEstado: (nodo: NodoInterface, propiedad: number) => number;
  materiaSaliente: (nodos: NodoInterface[], index: number) => number;
  relacionarNodos: (nodo: NodoInterface, vecinos: NodoInterface[]) => void;
  intercambiarCargas: (nodoA: NodoInterface, nodoB: NodoInterface) => void;
}
