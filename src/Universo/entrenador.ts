import { Universo } from './ruluat';
import { NodoInterface, ValoresSistema, IValoresSistema } from './types';

export class Entrenador {
  public universo: Universo;
  public tiempoSinEstructuras = 0;
  public tiempoLimiteSinEstructuras = 10;
  private pesos: IValoresSistema;
  private tasaDeAprendizaje = 0.05;

  constructor() {
    this.universo = new Universo();
    this.pesos = Object.keys(ValoresSistema)
      .filter((key) => isNaN(Number(key)))
      .reduce((obj: any, key: any) => {
        obj[key] = ValoresSistema[key];
        return obj;
      }, {} as IValoresSistema);
    this.siguienteGeneracionRecursivo();
    this.entrenarPerpetuoRecursivo();
  }

  private siguienteGeneracionRecursivo() {
    this.universo.siguienteGeneracion();
    this.universo.tiempo++;
    console.log(this.universo.tiempo);
    setTimeout(() => this.siguienteGeneracionRecursivo(), 0);
  }

  private entrenarPerpetuoRecursivo() {
    setTimeout(() => this.entrenarPerpetuo(), 1000);
  }

  private calcularRecompensa(nodos: NodoInterface[]): number {
    return this.detectarEstructuras(nodos);
  }

  private actualizarPesos(recompensa: number) {
    const claves = Object.keys(this.pesos) as (keyof IValoresSistema)[];
    claves.forEach((clave) => {
      const ajuste = Math.random() * 0.1 - 0.05;
      const cambio = this.tasaDeAprendizaje * recompensa * ajuste;
      if (clave !== 'COLUMNAS' && clave !== 'FILAS') {
        this.pesos[clave]! += cambio; 
      }
    });
  }

  private detectarEstructuras(nodos: NodoInterface[]): number {
    let numeroDeEstructuras = 0;
    const nodosVisitados = new Set<string>();

    nodos.forEach((nodo) => {
      if (nodosVisitados.has(nodo.id)) return;
      const nodosRelacionados = nodo.memoria.relaciones.map(
        (rel) => rel.nodoId,
      );
      if (
        nodosRelacionados.length >=
        this.universo.valoresSistema.ESPERADO_EMERGENTE
      ) {
        const esEstructuraValida = nodosRelacionados.every((idRelacionado) => {
          const nodoRelacionado = nodos.find((n) => n.id === idRelacionado);
          return (
            nodoRelacionado &&
            nodoRelacionado.memoria.energia >
            this.universo.valoresSistema.ENERGIA
          );
        });

        if (esEstructuraValida) {
          nodosRelacionados.forEach((idRelacionado) =>
            nodosVisitados.add(idRelacionado),
          );
          numeroDeEstructuras++;
        }
      }
    });

    return numeroDeEstructuras;
  }

  private reiniciarUniverso(): void {
    this.universo = new Universo(this.pesos);
  }

  private entrenarPerpetuo() {
    const estadoActual = this.universo.obtenerEstadoActualizado();
    if (this.universo.tiempo >= 100) {
      this.entrenarPerpetuo();
    }
    if (this.hayEstructuras(estadoActual.nodos)) {
      this.tiempoSinEstructuras = 0;
    } else {
      console.log(this.tiempoSinEstructuras);
      this.tiempoSinEstructuras++;
      if (this.tiempoSinEstructuras >= this.tiempoLimiteSinEstructuras) {
        this.reiniciarUniverso();
        this.tiempoSinEstructuras = 0;
      }
    }
    const recompensa = this.calcularRecompensa(estadoActual.nodos);
    this.actualizarPesos(recompensa);
  }

  private hayEstructuras(nodos: NodoInterface[]): boolean {
    return this.detectarEstructuras(nodos) > 0;
  }
}
