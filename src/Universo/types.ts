export interface IValoresSistema {
  FILAS: number;
  COLUMNAS: number;
  PROBABILIDAD_VIDA_INICIAL: number;
  LIMITE_EDAD: number;
  REDUCCION_CARGA: number;
  CRECIMIENTO_X: number; // Número de filas a añadir en cada generación
  CRECIMIENTO_Y: number; // Número de columnas a añadir en cada generación
  UMBRAL_CARGA: number;
  FACTOR_ESTABILIDAD: number;
  LIMITE_RELACIONAL: number;
  DISTANCIA_MAXIMA_RELACION: number;
  ESPERADO_EMERGENTE: number;
  FACTOR_RELACION: number;
  ENERGIA: number;
  PROBABILIDAD_TRANSICION: number;
  FLUCTUACION_MAXIMA: number;
  PROBABILIDAD_TUNEL: number;
}

export enum ValoresSistema {
  FILAS = 100,
  COLUMNAS = 100,
  PROBABILIDAD_VIDA_INICIAL = 0.99999,
  LIMITE_EDAD = 5,
  REDUCCION_CARGA = 0.01,
  CRECIMIENTO_X = 2,
  CRECIMIENTO_Y = 2,
  UMBRAL_CARGA = 0.0001,
  FACTOR_ESTABILIDAD = 0.2,
  LIMITE_RELACIONAL = 3,
  DISTANCIA_MAXIMA_RELACION = 6,
  ESPERADO_EMERGENTE = 7,
  FACTOR_RELACION = 10,
  ENERGIA = 0.01,
  PROBABILIDAD_TRANSICION = 0.01,
  FLUCTUACION_MAXIMA = 0.01,
  PROBABILIDAD_TUNEL = 0.01,
}

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
  relacionarNodos: (
    valoresSistema: IValoresSistema,
    nodo: NodoInterface,
    vecinos: NodoInterface[],
  ) => void;
  intercambiarCargas: (
    valoresSistema: IValoresSistema,
    nodoA: NodoInterface,
    nodoB: NodoInterface,
    esGrupoCircular: boolean,
  ) => void;
}
