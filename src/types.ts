export enum ValoresSistema {
  FILAS = 20,
  COLUMNAS = 30,
  PROBABILIDAD_VIDA_INICIAL = 0.7,
  LIMITE_EDAD = 50,
  LIMITE_TIEMPO_RELACION = 10,
  DISTANCIA_RELACION = 3,
}

export interface NodoInterface {
  id: string;
  memoria: Memoria;
}

export interface Memoria {
  cargas: number;
  vivo: boolean;
  propiedades: number[];
  edad: number;
  procesos: Procesos;
  relaciones: NodoInterface[];
}

export interface Procesos {
  materiaEntrante: (nodo: NodoInterface, propiedad: number) => number;
  cambioDeEstado: (nodo: NodoInterface, propiedad: number) => number;
  materiaSaliente: (nodos: NodoInterface[], index: number) => number;
  relacionar: (nodo: NodoInterface) => NodoInterface;
  intercambiarCargas: (nodoA: NodoInterface, nodoB: NodoInterface) => void; // Reemplazado "comer" por "intercambiarCargas"
}
